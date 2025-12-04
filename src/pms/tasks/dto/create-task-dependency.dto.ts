import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDependencyDto {
  @ApiProperty({
    description: 'Task ID that this task depends on',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  dependsOnTaskId: string;

  @ApiProperty({
    description: 'Type of dependency',
    enum: ['blocks', 'blocked_by', 'relates_to'],
    example: 'blocked_by',
  })
  @IsEnum(['blocks', 'blocked_by', 'relates_to'])
  @IsNotEmpty()
  dependencyType: 'blocks' | 'blocked_by' | 'relates_to';
}
