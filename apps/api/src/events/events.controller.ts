import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from '../common/dto/shared.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events (public)' })
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.eventsService.findAll({ category, search, status });
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get live ticket availability and capacity for an event' })
  getAvailability(@Param('id') id: string) {
    return this.eventsService.getAvailability(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single event (public)' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create event (admin)' })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event (admin)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateEventDto>) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event (admin)' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
