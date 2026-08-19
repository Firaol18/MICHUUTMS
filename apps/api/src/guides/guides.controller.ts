import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GuidesService } from './guides.service';
import { Guide } from './entities/guide.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('guides')
@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all guides' })
  findAll() {
    return this.guidesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guide by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.guidesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create guide (admin)' })
  create(@Body() dto: Partial<Guide>) {
    return this.guidesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update guide (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Guide>) {
    return this.guidesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete guide (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guidesService.remove(id);
  }
}
