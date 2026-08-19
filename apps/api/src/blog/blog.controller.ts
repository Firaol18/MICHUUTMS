import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from '../common/dto/shared.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published blog posts (public)' })
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
  ) {
    return this.blogService.findAll({ category, search, tag });
  }

  @Get(':slugOrId')
  @ApiOperation({ summary: 'Get blog post by slug or ID (public)' })
  findOne(@Param('slugOrId') slugOrId: string) {
    const num = Number(slugOrId);
    return isNaN(num) ? this.blogService.findBySlug(slugOrId) : this.blogService.findOne(num);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog post (admin)' })
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog post (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateBlogPostDto>) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog post (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }
}
