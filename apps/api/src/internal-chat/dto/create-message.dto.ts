import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 1 })
  senderId: number;

  @ApiProperty({ example: 2 })
  receiverId: number;

  @ApiProperty({ example: 'Hello there!' })
  content: string;
}
