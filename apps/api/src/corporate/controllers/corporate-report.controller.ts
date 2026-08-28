import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CorporateRoleGuard } from '../guards/corporate-role.guard';
import { CorporateRoles } from '../decorators/corporate-roles.decorator';
import { CorporateRole } from '../enums/corporate.enums';
import { CorporateReportService } from '../services/corporate-report.service';

@ApiTags('Corporate — Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CorporateRoleGuard)
@Controller('corporate/companies/:companyId/reports')
export class CorporateReportController {
  constructor(private readonly reportService: CorporateReportService) {}

  @Get('spend')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({
    summary: 'Spend summary: total spend, by class, top destinations, monthly breakdown, budget utilization',
  })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'fiscalYear', required: false, type: Number, description: 'Default: current year' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'ISO date override' })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  getSpendSummary(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('fiscalYear') fiscalYear?: number,
    @Query('departmentId') departmentId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportService.getSpendSummary(companyId, {
      fiscalYear: fiscalYear ? Number(fiscalYear) : undefined,
      departmentId,
      fromDate,
      toDate,
    });
  }

  @Get('requests')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER, CorporateRole.APPROVER)
  @ApiOperation({
    summary: 'Request KPIs: counts by status, approval rate, avg approval time, dept breakdown',
  })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'fiscalYear', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  getRequestStats(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('fiscalYear') fiscalYear?: number,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.reportService.getRequestStats(companyId, {
      fiscalYear: fiscalYear ? Number(fiscalYear) : undefined,
      departmentId,
    });
  }

  @Get('policy-compliance')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({
    summary: 'Policy compliance: policy adoption rate, class compliance, budget override frequency',
  })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'fiscalYear', required: false, type: Number })
  getPolicyCompliance(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('fiscalYear') fiscalYear?: number,
  ) {
    return this.reportService.getPolicyCompliance(companyId, {
      fiscalYear: fiscalYear ? Number(fiscalYear) : undefined,
    });
  }

  @Get('approver-performance')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({
    summary: 'Approver performance: decisions per approver, approval vs rejection counts, avg turnaround hours',
  })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'fiscalYear', required: false, type: Number })
  getApproverPerformance(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('fiscalYear') fiscalYear?: number,
  ) {
    return this.reportService.getApproverPerformance(companyId, {
      fiscalYear: fiscalYear ? Number(fiscalYear) : undefined,
    });
  }
}
