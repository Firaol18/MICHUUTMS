import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import {
  CreatePermissionResourceDto,
  UpdatePermissionResourceDto,
  CreatePermissionActionDto,
  UpdatePermissionActionDto,
} from './dto/permission.dto';
import { PermissionResource } from './entities/permission-resource.entity';
import { PermissionAction } from './entities/permission-action.entity';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // ---------- Resources ----------

  @Post('resources')
  @ApiOperation({ summary: 'Create a permission resource' })
  @ApiResponse({ status: 201, type: PermissionResource })
  createResource(@Body() dto: CreatePermissionResourceDto) {
    return this.permissionService.createResource(dto);
  }

  @Get('resources')
  @ApiOperation({ summary: 'Get all permission resources' })
  @ApiResponse({ status: 200, type: [PermissionResource] })
  findAllResources() {
    return this.permissionService.findAllResources();
  }

  @Put('resources/:id')
  @ApiOperation({ summary: 'Update a permission resource' })
  @ApiResponse({ status: 200, type: PermissionResource })
  updateResource(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionResourceDto,
  ) {
    return this.permissionService.updateResource(id, dto);
  }

  @Delete('resources/:id')
  @ApiOperation({ summary: 'Delete a permission resource' })
  @ApiResponse({ status: 200 })
  removeResource(@Param('id') id: string) {
    return this.permissionService.removeResource(id);
  }

  // ---------- Actions ----------

  @Post('actions')
  @ApiOperation({ summary: 'Create a permission action' })
  @ApiResponse({ status: 201, type: PermissionAction })
  createAction(@Body() dto: CreatePermissionActionDto) {
    return this.permissionService.createAction(dto);
  }

  @Get('actions')
  @ApiOperation({ summary: 'Get all permission actions' })
  @ApiResponse({ status: 200, type: [PermissionAction] })
  findAllActions() {
    return this.permissionService.findAllActions();
  }

  @Put('actions/:id')
  @ApiOperation({ summary: 'Update a permission action' })
  @ApiResponse({ status: 200, type: PermissionAction })
  updateAction(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionActionDto,
  ) {
    return this.permissionService.updateAction(id, dto);
  }

  @Delete('actions/:id')
  @ApiOperation({ summary: 'Delete a permission action' })
  @ApiResponse({ status: 200 })
  removeAction(@Param('id') id: string) {
    return this.permissionService.removeAction(id);
  }
}
