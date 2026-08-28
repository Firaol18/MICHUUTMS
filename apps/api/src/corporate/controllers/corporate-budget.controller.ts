import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
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
import { CorporateBudgetService } from '../services/corporate-budget.service';
import { CreateCorporateBudgetDto, UpdateCorporateBudgetDto } from '../dto/approval-budget.dto';

@ApiTags('Corporate — Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CorporateRoleGuard)
@Controller('corporate/companies/:companyId/budgets')
export class CorporateBudgetController {
  constructor(private readonly budgetService: CorporateBudgetService) {}

  @Post()
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Create a budget allocation (annual or quarterly)' })
  @ApiParam({ name: 'companyId', type: String })
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateCorporateBudgetDto,
  ) {
    return this.budgetService.create(companyId, dto);
  }

  @Get()
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
  )
  @ApiOperation({ summary: 'List all budget records for a company' })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'fiscalYear', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('fiscalYear') fiscalYear?: number,
    @Query('departmentId') departmentId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.budgetService.findAllByCompany(companyId, { fiscalYear, departmentId, page, limit });
  }

  @Get('summary/:fiscalYear')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Get consolidated budget summary for a fiscal year' })
  getSummary(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('fiscalYear') fiscalYear: number,
  ) {
    return this.budgetService.getSummary(companyId, Number(fiscalYear));
  }

  @Get(':id')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Get a single budget record' })
  findOne(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.budgetService.findOne(id, companyId);
  }

  @Patch(':id')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Update a budget record (Corporate Admin only)' })
  update(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCorporateBudgetDto,
  ) {
    return this.budgetService.update(id, companyId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Delete a budget record' })
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.budgetService.remove(id, companyId);
  }
}
