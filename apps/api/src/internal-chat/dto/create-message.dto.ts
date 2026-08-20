import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ example: 'Hello there!' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
