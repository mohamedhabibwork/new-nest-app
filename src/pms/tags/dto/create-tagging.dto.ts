import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaggingDto {
  @ApiProperty({
    description: 'Tag ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  tagId: string;

  @ApiProperty({
    description: 'Type of taggable entity (task, project, ticket, etc.)',
    example: 'task',
    enum: ['task', 'project', 'ticket'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['task', 'project', 'ticket'])
  taggableType: string;

  @ApiProperty({
    description: 'ID of the taggable entity',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  taggableId: string;
}
