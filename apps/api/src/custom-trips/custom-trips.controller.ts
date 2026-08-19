import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomTripsService } from './custom-trips.service';
import { CreateCustomTripDto } from '../common/dto/shared.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('custom-trips')
@Controller('custom-trips')
export class CustomTripsController {
  constructor(private readonly customTripsService: CustomTripsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit custom trip itinerary request (public)' })
  create(@Body() dto: CreateCustomTripDto, @Request() req: any) {
    return this.customTripsService.create(dto, req.user?.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all custom trip requests (admin)' })
  findAll() {
    return this.customTripsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user custom trip requests' })
  findMine(@Request() req: any) {
    return this.customTripsService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customTripsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom trip status (admin)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'cancelled',
  ) {
    return this.customTripsService.updateStatus(id, status);
  }
}
