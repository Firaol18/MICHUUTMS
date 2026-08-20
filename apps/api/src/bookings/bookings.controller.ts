import { Controller, Get, Post, Patch, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from './dto/booking.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (public or authenticated)' })
  create(@Body() dto: CreateBookingDto, @Request() req: any) {
    return this.bookingsService.create(dto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings (admin)' })
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingsService.findAll({ status, search, page, limit });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user bookings' })
  findMine(@Request() req: any) {
    if (req.user?.id) {
      return this.bookingsService.findByUser(req.user.id);
    }
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single booking by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(@Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.bookingsService.cancel(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status (admin)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Update payment status (admin)' })
  updatePaymentStatus(@Param('id') id: string, @Body('paymentStatus') ps: string) {
    return this.bookingsService.updatePaymentStatus(id, ps);
  }

  @Patch(':id/assign-guide')
  @ApiOperation({ summary: 'Assign guide to booking' })
  assignGuide(
    @Param('id') id: string,
    @Body('assignedGuideName') guideName: string,
    @Body('assignedGuideId') guideId?: string,
  ) {
    return this.bookingsService.assignGuide(id, guideName, guideId);
  }
}
