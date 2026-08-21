import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('monthly-revenue')
  @ApiOperation({ summary: 'Monthly revenue, bookings, expenses, profit (last N months)' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  getMonthlyRevenue(@Query('months') months?: string) {
    return this.analyticsService.getMonthlyRevenue(months ? parseInt(months, 10) : 8);
  }

  @Get('popular-destinations')
  @ApiOperation({ summary: 'Top destinations by booking count' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPopularDestinations(@Query('limit') limit?: string) {
    return this.analyticsService.getPopularDestinations(limit ? parseInt(limit, 10) : 5);
  }

  @Get('popular-packages')
  @ApiOperation({ summary: 'Top tour packages by revenue' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPopularPackages(@Query('limit') limit?: string) {
    return this.analyticsService.getPopularPackages(limit ? parseInt(limit, 10) : 5);
  }

  @Get('profitability')
  @ApiOperation({ summary: 'Profitability breakdown by tour category' })
  getProfitability() {
    return this.analyticsService.getProfitabilityByCategory();
  }
}
