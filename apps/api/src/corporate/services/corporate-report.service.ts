import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelRequest } from '../entities/travel-request.entity';
import { CorporateBudget } from '../entities/corporate-budget.entity';
import { TravelApproval } from '../entities/travel-approval.entity';
import { RequestStatus, TravelClass } from '../enums/corporate.enums';

@Injectable()
export class CorporateReportService {
  constructor(
    @InjectRepository(TravelRequest)
    private readonly requestRepo: Repository<TravelRequest>,
    @InjectRepository(CorporateBudget)
    private readonly budgetRepo: Repository<CorporateBudget>,
    @InjectRepository(TravelApproval)
    private readonly approvalRepo: Repository<TravelApproval>,
  ) {}

  // ── Spend Summary ─────────────────────────────────────────────────────────

  async getSpendSummary(
    companyId: string,
    query: { fiscalYear?: number; departmentId?: string; fromDate?: string; toDate?: string },
  ) {
    const year = query.fiscalYear ?? new Date().getFullYear();

    const qb = this.requestRepo
      .createQueryBuilder('r')
      .where('r.companyId = :companyId', { companyId })
      .andWhere("r.status IN ('APPROVED', 'COMPLETED')");

    if (query.departmentId) {
      qb.andWhere('r.departmentId = :deptId', { deptId: query.departmentId });
    }
    if (query.fromDate) {
      qb.andWhere('r.departureDate >= :from', { from: query.fromDate });
    } else {
      qb.andWhere('EXTRACT(YEAR FROM r.departureDate) = :year', { year });
    }
    if (query.toDate) {
      qb.andWhere('r.departureDate <= :to', { to: query.toDate });
    }

    const [requests, totalCount] = await qb.getManyAndCount();

    const totalSpend = requests.reduce((s, r) => s + Number(r.estimatedCost), 0);
    const avgCost = totalCount > 0 ? totalSpend / totalCount : 0;

    // Spend by status
    const byStatus: Record<string, number> = {};
    for (const r of requests) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + Number(r.estimatedCost);
    }

    // Spend by travel class
    const byClass: Record<string, number> = {};
    for (const r of requests) {
      byClass[r.travelClass] = (byClass[r.travelClass] ?? 0) + Number(r.estimatedCost);
    }

    // Top destinations
    const destinationMap: Record<string, { count: number; spend: number }> = {};
    for (const r of requests) {
      if (!destinationMap[r.destination]) destinationMap[r.destination] = { count: 0, spend: 0 };
      destinationMap[r.destination].count++;
      destinationMap[r.destination].spend += Number(r.estimatedCost);
    }
    const topDestinations = Object.entries(destinationMap)
      .sort((a, b) => b[1].spend - a[1].spend)
      .slice(0, 10)
      .map(([destination, stats]) => ({ destination, ...stats }));

    // Monthly spend breakdown
    const monthlyMap: Record<string, number> = {};
    for (const r of requests) {
      const month = new Date(r.departureDate).toISOString().slice(0, 7); // YYYY-MM
      monthlyMap[month] = (monthlyMap[month] ?? 0) + Number(r.estimatedCost);
    }
    const monthlyBreakdown = Object.entries(monthlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));

    // Budget utilization
    const budgetSummary = await this.budgetRepo
      .createQueryBuilder('b')
      .where('b.companyId = :companyId AND b.fiscalYear = :year', { companyId, year })
      .select([
        'SUM(b.totalBudget) AS totalBudget',
        'SUM(b.spentAmount) AS spentAmount',
        'SUM(b.reservedAmount) AS reservedAmount',
      ])
      .getRawOne();

    return {
      period: query.fromDate
        ? `${query.fromDate} – ${query.toDate ?? 'now'}`
        : `FY${year}`,
      totalRequests: totalCount,
      totalSpend,
      averageCostPerTrip: Math.round(avgCost * 100) / 100,
      byStatus,
      byTravelClass: byClass,
      topDestinations,
      monthlyBreakdown,
      budget: {
        total: Number(budgetSummary?.totalBudget ?? 0),
        spent: Number(budgetSummary?.spentAmount ?? 0),
        reserved: Number(budgetSummary?.reservedAmount ?? 0),
        available: Math.max(
          0,
          Number(budgetSummary?.totalBudget ?? 0) -
            Number(budgetSummary?.spentAmount ?? 0) -
            Number(budgetSummary?.reservedAmount ?? 0),
        ),
        utilizationPercent:
          Number(budgetSummary?.totalBudget ?? 0) > 0
            ? Math.round(
                (Number(budgetSummary?.spentAmount ?? 0) / Number(budgetSummary?.totalBudget)) * 100,
              )
            : 0,
      },
    };
  }

  // ── Request Stats ─────────────────────────────────────────────────────────

  async getRequestStats(
    companyId: string,
    query: { fiscalYear?: number; departmentId?: string },
  ) {
    const year = query.fiscalYear ?? new Date().getFullYear();

    const qb = this.requestRepo
      .createQueryBuilder('r')
      .where('r.companyId = :companyId', { companyId })
      .andWhere('EXTRACT(YEAR FROM r.createdAt) = :year', { year });

    if (query.departmentId) {
      qb.andWhere('r.departmentId = :deptId', { deptId: query.departmentId });
    }

    const requests = await qb.getMany();
    const total = requests.length;

    const countByStatus: Record<string, number> = {};
    for (const r of requests) {
      countByStatus[r.status] = (countByStatus[r.status] ?? 0) + 1;
    }

    // Average approval time (submitted → approved)
    const approvedRequests = requests.filter(
      (r) => r.status === RequestStatus.APPROVED || r.status === RequestStatus.COMPLETED,
    );
    const avgApprovalHours =
      approvedRequests.length > 0
        ? approvedRequests.reduce((sum, r) => {
            if (r.approvedAt) {
              const hours = (r.approvedAt.getTime() - r.createdAt.getTime()) / 3600000;
              return sum + hours;
            }
            return sum;
          }, 0) / approvedRequests.length
        : 0;

    // Requests with budget override
    const overrideCount = requests.filter((r) => r.budgetOverride).length;

    // Approval rate
    const approvalRate =
      total > 0
        ? Math.round(
            ((countByStatus[RequestStatus.APPROVED] ?? 0) +
              (countByStatus[RequestStatus.COMPLETED] ?? 0)) /
              total *
              100,
          )
        : 0;

    // Department breakdown
    const deptMap: Record<string, { count: number; spend: number; deptName?: string }> = {};
    for (const r of requests) {
      const key = r.departmentId ?? 'unknown';
      if (!deptMap[key]) deptMap[key] = { count: 0, spend: 0 };
      deptMap[key].count++;
      deptMap[key].spend += Number(r.estimatedCost);
    }

    return {
      year,
      total,
      byStatus: countByStatus,
      approvalRate,
      averageApprovalHours: Math.round(avgApprovalHours * 10) / 10,
      budgetOverrideCount: overrideCount,
      byDepartment: Object.entries(deptMap).map(([deptId, stats]) => ({
        departmentId: deptId,
        ...stats,
      })),
    };
  }

  // ── Policy Compliance ─────────────────────────────────────────────────────

  async getPolicyCompliance(companyId: string, query: { fiscalYear?: number }) {
    const year = query.fiscalYear ?? new Date().getFullYear();

    const requests = await this.requestRepo
      .createQueryBuilder('r')
      .where('r.companyId = :companyId', { companyId })
      .andWhere('EXTRACT(YEAR FROM r.createdAt) = :year', { year })
      .getMany();

    const total = requests.length;
    const withPolicy = requests.filter((r) => !!r.policyId).length;
    const withOverride = requests.filter((r) => r.budgetOverride).length;

    // Class compliance (count ECONOMY vs other)
    const classMap: Record<string, number> = {};
    for (const r of requests) {
      classMap[r.travelClass] = (classMap[r.travelClass] ?? 0) + 1;
    }

    return {
      year,
      totalRequests: total,
      policyAppliedCount: withPolicy,
      policyAppliedRate: total > 0 ? Math.round((withPolicy / total) * 100) : 0,
      budgetOverrideCount: withOverride,
      budgetOverrideRate: total > 0 ? Math.round((withOverride / total) * 100) : 0,
      classCounts: classMap,
      economyRate:
        total > 0
          ? Math.round(((classMap[TravelClass.ECONOMY] ?? 0) / total) * 100)
          : 0,
    };
  }

  // ── Approver Performance ──────────────────────────────────────────────────

  async getApproverPerformance(companyId: string, query: { fiscalYear?: number }) {
    const year = query.fiscalYear ?? new Date().getFullYear();

    const approvals = await this.approvalRepo
      .createQueryBuilder('a')
      .leftJoin('a.request', 'r')
      .where('r.companyId = :companyId', { companyId })
      .andWhere('EXTRACT(YEAR FROM a.createdAt) = :year', { year })
      .andWhere("a.decision != 'PENDING'")
      .select([
        'a.approverId AS "approverId"',
        'a.approverName AS "approverName"',
        'a.decision AS decision',
        'COUNT(a.id) AS count',
        'AVG(EXTRACT(EPOCH FROM (a.decidedAt - a.createdAt)) / 3600) AS "avgHours"',
      ])
      .groupBy('a.approverId, a.approverName, a.decision')
      .getRawMany();

    // Aggregate by approver
    const approverMap: Record<
      string,
      { name: string; approved: number; rejected: number; avgHours: number }
    > = {};
    for (const row of approvals) {
      const key = row.approverId;
      if (!approverMap[key]) {
        approverMap[key] = { name: row.approverName ?? key, approved: 0, rejected: 0, avgHours: 0 };
      }
      if (row.decision === 'APPROVED') approverMap[key].approved = Number(row.count);
      if (row.decision === 'REJECTED') approverMap[key].rejected = Number(row.count);
      approverMap[key].avgHours = Math.max(approverMap[key].avgHours, Math.round(Number(row.avgHours) * 10) / 10);
    }

    return {
      year,
      approvers: Object.entries(approverMap).map(([id, stats]) => ({ approverId: id, ...stats })),
    };
  }
}
