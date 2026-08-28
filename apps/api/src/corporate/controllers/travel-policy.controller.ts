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
import { TravelPolicyService } from '../services/travel-policy.service';
import { CreateTravelPolicyDto, UpdateTravelPolicyDto } from '../dto/travel-policy.dto';

@ApiTags('Corporate — Travel Policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CorporateRoleGuard)
@Controller('corporate/companies/:companyId/policies')
export class TravelPolicyController {
  constructor(private readonly policyService: TravelPolicyService) {}

  @Post()
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Create a travel policy with optional multi-level approval steps' })
  @ApiParam({ name: 'companyId', type: String })
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateTravelPolicyDto,
  ) {
    return this.policyService.create(companyId, dto);
  }

  @Get()
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'List all travel policies for a company' })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.policyService.findAllByCompany(companyId, { isActive, page, limit });
  }

  @Get('default')
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Get the default travel policy for the company' })
  getDefault(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.policyService.getDefaultPolicy(companyId);
  }

  @Get(':id')
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Get a single travel policy with approval steps' })
  findOne(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policyService.findOne(id, companyId);
  }

  @Patch(':id')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Update a travel policy (replaces approval steps if provided)' })
  update(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTravelPolicyDto,
  ) {
    return this.policyService.update(id, companyId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Delete a travel policy (non-default only)' })
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policyService.remove(id, companyId);
  }
}
