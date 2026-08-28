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
import { DepartmentService } from '../services/department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';

@ApiTags('Corporate — Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CorporateRoleGuard)
@Controller('corporate/companies/:companyId/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Create a department within a company' })
  @ApiParam({ name: 'companyId', type: String })
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.departmentService.create(companyId, dto);
  }

  @Get()
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'List all departments in a company' })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.departmentService.findAllByCompany(companyId, { page, limit, search, isActive });
  }

  @Get(':id')
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Get a single department' })
  @ApiParam({ name: 'companyId', type: String })
  @ApiParam({ name: 'id', type: String })
  findOne(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.departmentService.findOne(id, companyId);
  }

  @Patch(':id')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Update a department' })
  update(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, companyId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Delete a department (Corporate Admin only)' })
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.departmentService.remove(id, companyId);
  }
}
