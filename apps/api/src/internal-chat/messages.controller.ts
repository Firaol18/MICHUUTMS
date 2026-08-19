import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiBody({ type: CreateMessageDto })
  async create(@Body() dto: CreateMessageDto): Promise<Message> {
    return this.messagesService.createMessage(dto);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get messages for a user' })
  async getUserMessages(@Param('id', ParseIntPipe) userId: number): Promise<Message[]> {
    return this.messagesService.getMessagesForUser(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiBody({ type: UpdateMessageDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMessageDto): Promise<Message> {
    return this.messagesService.updateMessage(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.messagesService.deleteMessage(id);
  }
}
