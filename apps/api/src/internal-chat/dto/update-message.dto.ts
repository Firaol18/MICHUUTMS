import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @ApiPropertyOptional({ example: 'Updated message content' })
  content?: string;
}
