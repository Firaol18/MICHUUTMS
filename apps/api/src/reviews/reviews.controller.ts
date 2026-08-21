import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews, optionally filtered by tourId' })
  @ApiQuery({ name: 'tourId', required: false })
  findAll(@Query('tourId') tourId?: string) {
    return this.reviewsService.findAll(tourId);
  }

  @Get(':tourId/ratings')
  @ApiOperation({ summary: 'Get average rating breakdown for a specific tour' })
  getAverageRatings(@Param('tourId') tourId: string) {
    return this.reviewsService.getAverageRatingsForTour(tourId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new tour review' })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review (admin)' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
