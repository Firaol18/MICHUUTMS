import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications by userEmail or targetRole' })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'targetRole', required: false })
  findAll(
    @Query('userEmail') userEmail?: string,
    @Query('targetRole') targetRole?: 'customer' | 'admin' | 'all',
  ) {
    if (userEmail) return this.notificationsService.findByUser(userEmail);
    if (targetRole) return this.notificationsService.findByRole(targetRole);
    return this.notificationsService.findByRole('all');
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiQuery({ name: 'userEmail', required: true })
  markAllRead(@Query('userEmail') userEmail: string) {
    return this.notificationsService.markAllReadForUser(userEmail);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
