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
import { CorporateMemberService } from '../services/corporate-member.service';
import {
  CreateCorporateMemberDto,
  UpdateCorporateMemberDto,
  InviteCorporateMemberDto,
} from '../dto/corporate-member.dto';

@ApiTags('Corporate — Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CorporateRoleGuard)
@Controller('corporate/companies/:companyId/members')
export class CorporateMemberController {
  constructor(private readonly memberService: CorporateMemberService) {}

  @Post('invite')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({
    summary: 'Register and invite a corporate user into the company account',
    description:
      'Creates or updates the User record with corporate company linkage and creates a CorporateMember entry.',
  })
  @ApiParam({ name: 'companyId', type: String })
  inviteMember(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: InviteCorporateMemberDto,
  ) {
    return this.memberService.inviteMember(companyId, dto);
  }

  @Post()
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Add an existing user ID as a member of a company' })
  @ApiParam({ name: 'companyId', type: String })
  addMember(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateCorporateMemberDto,
  ) {
    return this.memberService.addMember(companyId, dto);
  }

  @Get()
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'List all members of a company' })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'corporateRole', required: false, enum: CorporateRole })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('corporateRole') corporateRole?: CorporateRole,
    @Query('departmentId') departmentId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.memberService.findAllByCompany(companyId, {
      page,
      limit,
      search,
      corporateRole,
      departmentId,
      isActive,
    });
  }

  @Get('role-summary')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Get count of members per corporate role' })
  getRoleSummary(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.memberService.getCompanyRoleSummary(companyId);
  }

  @Get(':id')
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
  )
  @ApiOperation({ summary: 'Get a single member record' })
  findOne(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.memberService.findOne(id, companyId);
  }

  @Patch(':id')
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Update member details (role, department, job title)' })
  update(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCorporateMemberDto,
  ) {
    return this.memberService.update(id, companyId, dto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Deactivate a member (retains history)' })
  deactivate(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.memberService.deactivate(id, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Remove a member from the company' })
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.memberService.remove(id, companyId);
  }
}
