import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ServiceAccountService } from './service-account.service';
import { CreateServiceAccountDto, UpdateServiceAccountDto } from './dto/service-account.dto';
import { ServiceAccount } from './entities/service-account.entity';

@ApiTags('service-accounts')
@Controller('service-accounts')
export class ServiceAccountController {
  constructor(private readonly serviceAccountService: ServiceAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service account' })
  @ApiResponse({ status: 201, type: ServiceAccount })
  create(@Body() createServiceAccountDto: CreateServiceAccountDto) {
    return this.serviceAccountService.create(createServiceAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of service accounts with search and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'roleId', required: false, type: Number })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('roleId') roleId?: number,
  ) {
    return this.serviceAccountService.findAll({ page, limit, search, isActive, roleId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service account by ID' })
  @ApiResponse({ status: 200, type: ServiceAccount })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceAccountService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service account' })
  @ApiResponse({ status: 200, type: ServiceAccount })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateServiceAccountDto) {
    return this.serviceAccountService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service account' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceAccountService.remove(id);
  }
}
