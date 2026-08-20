import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from '../common/dto/shared.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('enquiries')
@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new enquiry (public)' })
  create(@Body() dto: CreateEnquiryDto) {
    return this.enquiriesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all enquiries (admin)' })
  findAll() {
    return this.enquiriesService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update enquiry status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'unread' | 'read' | 'replied',
  ) {
    return this.enquiriesService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete enquiry (admin)' })
  remove(@Param('id') id: string) {
    return this.enquiriesService.remove(id);
  }
}

