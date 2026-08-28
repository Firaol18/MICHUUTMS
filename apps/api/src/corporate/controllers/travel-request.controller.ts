import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CorporateRoleGuard } from '../guards/corporate-role.guard';
import { CorporateRoles } from '../decorators/corporate-roles.decorator';
import { CorporateRole } from '../enums/corporate.enums';
import { TravelRequestService } from '../services/travel-request.service';
import { ApprovalWorkflowService } from '../services/approval-workflow.service';
import {
  CreateTravelRequestDto,
  UpdateTravelRequestDto,
  CancelTravelRequestDto,
  TravelRequestFilterDto,
  CompleteRequestDto,
} from '../dto/travel-request.dto';
import { ApproveRequestDto, RejectRequestDto } from '../dto/approval-budget.dto';

@ApiTags('Corporate — Travel Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CorporateRoleGuard)
@Controller('corporate/companies/:companyId/travel-requests')
export class TravelRequestController {
  constructor(
    private readonly requestService: TravelRequestService,
    private readonly approvalService: ApprovalWorkflowService,
  ) {}

  // ── Create ────────────────────────────────────────────────────────────────

  @Post()
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Create a new travel request (DRAFT state)' })
  @ApiParam({ name: 'companyId', type: String })
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateTravelRequestDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.requestService.create(companyId, user.id, user.name, dto);
  }

  // ── List ──────────────────────────────────────────────────────────────────

  @Get()
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
  )
  @ApiOperation({ summary: 'List all travel requests for the company (managers/admins)' })
  @ApiParam({ name: 'companyId', type: String })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'requesterId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() filter: TravelRequestFilterDto,
  ) {
    return this.requestService.findAllByCompany(companyId, filter);
  }

  @Get('my')
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: "List the current user's own travel requests" })
  findMine(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() filter: TravelRequestFilterDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.requestService.findMyRequests(user.id, companyId, filter);
  }

  @Get('pending-approvals')
  @CorporateRoles(CorporateRole.APPROVER, CorporateRole.TRAVEL_MANAGER, CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'List requests pending approval by the current user' })
  pendingApprovals(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.requestService.findPendingForApprover(user.id, companyId);
  }

  @Get(':id')
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Get a single travel request with approval history' })
  findOne(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.requestService.findOne(id, companyId);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  @Patch(':id')
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Update a DRAFT travel request' })
  update(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTravelRequestDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.requestService.update(id, user.id, companyId, dto);
  }

  // ── Lifecycle Actions ─────────────────────────────────────────────────────

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Submit a DRAFT request for approval' })
  submit(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.requestService.submit(id, user.id, companyId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Cancel a travel request (DRAFT/SUBMITTED/UNDER_REVIEW)' })
  cancel(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelTravelRequestDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.requestService.cancel(id, user.id, companyId, dto);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
  @ApiOperation({ summary: 'Mark an APPROVED request as COMPLETED (post-trip)' })
  complete(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteRequestDto,
  ) {
    return this.requestService.complete(id, companyId, dto);
  }

  // ── Approval Actions ──────────────────────────────────────────────────────

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @CorporateRoles(CorporateRole.APPROVER, CorporateRole.TRAVEL_MANAGER, CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Approve a travel request at the current approval step' })
  @ApiBody({ type: ApproveRequestDto })
  approve(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveRequestDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.approvalService.approve(id, user.id, user.name, companyId, dto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @CorporateRoles(CorporateRole.APPROVER, CorporateRole.TRAVEL_MANAGER, CorporateRole.CORPORATE_ADMIN)
  @ApiOperation({ summary: 'Reject a travel request' })
  @ApiBody({ type: RejectRequestDto })
  reject(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectRequestDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.approvalService.reject(id, user.id, user.name, companyId, dto);
  }

  @Get(':id/approvals')
  @CorporateRoles(
    CorporateRole.CORPORATE_ADMIN,
    CorporateRole.TRAVEL_MANAGER,
    CorporateRole.APPROVER,
    CorporateRole.TRAVELER,
  )
  @ApiOperation({ summary: 'Get full approval history for a request' })
  getApprovalHistory(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.approvalService.getApprovalHistory(id, companyId);
  }
}
