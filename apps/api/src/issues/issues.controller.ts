import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from '../common/dto/shared.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all support tickets (admin)' })
  findAll() {
    return this.issuesService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get tickets by email or user ID' })
  findMine(@Query('email') email?: string, @Query('userId') userId?: number) {
    return this.issuesService.findByEmailOrUser(email, userId ? +userId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single ticket' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ticket status (admin)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'open' | 'in_progress' | 'resolved' | 'rejected',
    @Body('adminReason') adminReason?: string,
    @Body('resolvedBy') resolvedBy?: string,
  ) {
    return this.issuesService.updateStatus(id, status, adminReason, resolvedBy);
  }
}
