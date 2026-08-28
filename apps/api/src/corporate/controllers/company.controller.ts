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
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CorporateRoleGuard } from '../guards/corporate-role.guard';
import { CorporateRoles } from '../decorators/corporate-roles.decorator';
import { CorporateRole } from '../enums/corporate.enums';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';

@ApiTags('Corporate — Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('corporate/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new corporate company' })
  @ApiResponse({ status: 201, description: 'Company created' })
  @ApiResponse({ status: 409, description: 'Company name or code conflict' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all companies with pagination & filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'industry', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('industry') industry?: string,
  ) {
    return this.companyService.findAll({ page, limit, search, isActive, industry });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID with departments and policies' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get company overview statistics (members, requests, spend)' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.getStats(id);
  }

  @Patch(':id')
  @UseGuards(CorporateRoleGuard)
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Update company details (Corporate Admin only)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @UseGuards(CorporateRoleGuard)
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a company account' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a company (super-admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.remove(id);
  }
}
