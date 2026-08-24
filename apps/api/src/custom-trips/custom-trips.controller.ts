import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
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
  findOne(@Param('id') id: string) {
    return this.customTripsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom trip status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'cancelled',
  ) {
    return this.customTripsService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete custom trip request (admin)' })
  remove(@Param('id') id: string) {
    return this.customTripsService.remove(id);
  }

  // ── Custom Destinations Endpoints ──

  @Get('destinations/all')
  @ApiOperation({ summary: 'Get all custom trip destinations (public & admin)' })
  getDestinations() {
    return this.customTripsService.getDestinations();
  }

  @Post('destinations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create custom destination option (admin)' })
  createDestination(@Body() body: any) {
    return this.customTripsService.createDestination(body);
  }

  @Patch('destinations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom destination option (admin)' })
  updateDestination(@Param('id') id: string, @Body() body: any) {
    return this.customTripsService.updateDestination(id, body);
  }

  @Delete('destinations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete custom destination option (admin)' })
  deleteDestination(@Param('id') id: string) {
    return this.customTripsService.deleteDestination(id);
  }

  // ── Pricing Config Endpoints ──

  @Get('pricing/config')
  @ApiOperation({ summary: 'Get custom trip pricing multiplier config' })
  getPricingConfig() {
    return this.customTripsService.getPricingConfig();
  }

  @Patch('pricing/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom trip pricing multiplier config (admin)' })
  updatePricingConfig(@Body() body: any) {
    return this.customTripsService.updatePricingConfig(body);
  }
}
