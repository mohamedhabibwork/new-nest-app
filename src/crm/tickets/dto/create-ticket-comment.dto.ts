import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'I have checked the account and reset the password.',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiPropertyOptional({
    description: 'Is internal comment (not visible to contact)',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;
}

