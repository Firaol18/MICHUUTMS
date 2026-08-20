import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards,
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
  @ApiOperation({ summary: 'Get tour by ID (UUID) or slug (public)' })
  findOne(@Param('id') id: string) {
    // UUID pattern check — if it looks like a UUID, do direct lookup; otherwise treat as slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) ? this.toursService.findOne(id) : this.toursService.findBySlug(id);
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
  update(@Param('id') id: string, @Body() dto: Partial<CreateTourDto>) {
    return this.toursService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tour (admin)' })
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}
