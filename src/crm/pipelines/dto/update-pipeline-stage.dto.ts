import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePipelineStageDto } from './create-pipeline-stage.dto';

export class UpdatePipelineStageDto extends PartialType(
  OmitType(CreatePipelineStageDto, ['pipelineId'] as const)
) {}

