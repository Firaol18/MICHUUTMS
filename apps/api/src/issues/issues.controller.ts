import { Controller, Get, Post, Patch, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from '../common/dto/shared.dto';

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit support ticket (public/customer)' })
  create(@Body() dto: CreateIssueDto, @Request() req: any) {
    return this.issuesService.create(dto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all support tickets (admin)' })
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('issueType') issueType?: string,
    @Query('branch') branch?: string,
    @Query('search') search?: string,
  ) {
    return this.issuesService.findAll({ status, category, issueType, branch, search });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get tickets by email or user ID' })
  findMine(@Query('email') email?: string, @Query('userId') userId?: string) {
    return this.issuesService.findByEmailOrUser(email, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single ticket' })
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ticket status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'open' | 'in_progress' | 'resolved' | 'rejected',
    @Body('adminReason') adminReason?: string,
    @Body('resolvedBy') resolvedBy?: string,
  ) {
    return this.issuesService.updateStatus(id, status, adminReason, resolvedBy);
  }
}
