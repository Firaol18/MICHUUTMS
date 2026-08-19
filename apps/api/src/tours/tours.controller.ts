import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CreateTourDto, QueryToursDto } from './dto/tour.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tours (public, filterable)' })
  findAll(@Query() query: QueryToursDto) {
    return this.toursService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tour by ID or slug (public)' })
  findOne(@Param('id') id: string) {
    const numId = Number(id);
    return isNaN(numId) ? this.toursService.findBySlug(id) : this.toursService.findOne(numId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create tour (admin)' })
  create(@Body() dto: CreateTourDto) {
    return this.toursService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tour (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateTourDto>) {
    return this.toursService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tour (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.remove(id);
  }
}
