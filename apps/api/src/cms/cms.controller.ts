import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CreateCmsPageDto, UpdateCmsPageDto } from './dto/cms-page.dto';

@ApiTags('cms')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all CMS pages' })
  findAll() {
    return this.cmsService.findAll();
  }

  @Get('by-slug')
  @ApiOperation({ summary: 'Get CMS page by slug' })
  findBySlug(@Query('slug') slug: string) {
    return this.cmsService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new CMS page (admin)' })
  create(@Body() dto: CreateCmsPageDto) {
    return this.cmsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CMS page content (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCmsPageDto) {
    return this.cmsService.update(id, dto);
  }
}
