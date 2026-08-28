import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ── Entities ──────────────────────────────────────────────────────────────────
import { Company } from './entities/company.entity';
import { Department } from './entities/department.entity';
import { CorporateMember } from './entities/corporate-member.entity';
import { TravelPolicy } from './entities/travel-policy.entity';
import { ApprovalStep } from './entities/approval-step.entity';
import { TravelRequest } from './entities/travel-request.entity';
import { TravelApproval } from './entities/travel-approval.entity';
import { CorporateBudget } from './entities/corporate-budget.entity';
import { User } from '../users/entities/user.entity';

// ── Services ──────────────────────────────────────────────────────────────────
import { CompanyService } from './services/company.service';
import { DepartmentService } from './services/department.service';
import { CorporateMemberService } from './services/corporate-member.service';
import { TravelPolicyService } from './services/travel-policy.service';
import { TravelRequestService } from './services/travel-request.service';
import { ApprovalWorkflowService } from './services/approval-workflow.service';
import { CorporateBudgetService } from './services/corporate-budget.service';
import { CorporateReportService } from './services/corporate-report.service';

// ── Controllers ───────────────────────────────────────────────────────────────
import { CompanyController } from './controllers/company.controller';
import { DepartmentController } from './controllers/department.controller';
import { CorporateMemberController } from './controllers/corporate-member.controller';
import { TravelPolicyController } from './controllers/travel-policy.controller';
import { TravelRequestController } from './controllers/travel-request.controller';
import { CorporateBudgetController } from './controllers/corporate-budget.controller';
import { CorporateReportController } from './controllers/corporate-report.controller';

// ── Guards ────────────────────────────────────────────────────────────────────
import { CorporateRoleGuard } from './guards/corporate-role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Department,
      CorporateMember,
      TravelPolicy,
      ApprovalStep,
      TravelRequest,
      TravelApproval,
      CorporateBudget,
      User,
    ]),
  ],
  providers: [
    // Services
    CompanyService,
    DepartmentService,
    CorporateMemberService,
    TravelPolicyService,
    TravelRequestService,
    ApprovalWorkflowService,
    CorporateBudgetService,
    CorporateReportService,
    // Guards
    CorporateRoleGuard,
  ],
  controllers: [
    CompanyController,
    DepartmentController,
    CorporateMemberController,
    TravelPolicyController,
    TravelRequestController,
    CorporateBudgetController,
    CorporateReportController,
  ],
  exports: [
    CompanyService,
    DepartmentService,
    CorporateMemberService,
    TravelPolicyService,
    TravelRequestService,
    ApprovalWorkflowService,
    CorporateBudgetService,
    CorporateReportService,
  ],
})
export class CorporateModule {}
