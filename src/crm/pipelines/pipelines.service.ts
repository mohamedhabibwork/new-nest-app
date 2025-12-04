import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';

@Injectable()
export class PipelinesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePipelineDto) {
    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const pipeline = await this.prisma.pipeline.create({
      data: withUlid({
        name: data.name,
        description: data.description,
        isDefault: data.isDefault || false,
        displayOrder: data.displayOrder || 0,
      }),
      include: {
        stages: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return pipeline;
  }

  async findAll() {
    return this.prisma.pipeline.findMany({
      include: {
        stages: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: {
            deals: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { displayOrder: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: {
            deals: true,
          },
        },
      },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  async update(id: string, data: UpdatePipelineDto) {
    const pipeline = await this.findOne(id);

    // If setting as default, unset other defaults
    if (data.isDefault && !pipeline.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: {
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isDefault: data.isDefault,
        displayOrder: data.displayOrder,
      },
      include: {
        stages: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    const pipeline = await this.findOne(id);

    // Check if pipeline has deals
    const dealCount = await this.prisma.deal.count({
      where: { pipelineId: id },
    });

    if (dealCount > 0) {
      throw new BadRequestException('Cannot delete pipeline with associated deals');
    }

    await this.prisma.pipeline.delete({
      where: { id },
    });

    return { message: 'Pipeline deleted successfully' };
  }

  // Pipeline Stage Methods
  async createStage(data: CreatePipelineStageDto) {
    // Verify pipeline exists
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: data.pipelineId },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    // Ensure only one closed won and one closed lost stage per pipeline
    if (data.isClosedWon) {
      const existingClosedWon = await this.prisma.pipelineStage.findFirst({
        where: {
          pipelineId: data.pipelineId,
          isClosedWon: true,
        },
      });
      if (existingClosedWon) {
        throw new BadRequestException('Pipeline already has a closed won stage');
      }
    }

    if (data.isClosedLost) {
      const existingClosedLost = await this.prisma.pipelineStage.findFirst({
        where: {
          pipelineId: data.pipelineId,
          isClosedLost: true,
        },
      });
      if (existingClosedLost) {
        throw new BadRequestException('Pipeline already has a closed lost stage');
      }
    }

    const stage = await this.prisma.pipelineStage.create({
      data: withUlid({
        pipelineId: data.pipelineId,
        name: data.name,
        displayOrder: data.displayOrder,
        defaultProbability: data.defaultProbability || 0,
        isClosedWon: data.isClosedWon || false,
        isClosedLost: data.isClosedLost || false,
        automationTriggers: data.automationTriggers,
      }),
    });

    return stage;
  }

  async findAllStages(pipelineId: string) {
    // Verify pipeline exists
    await this.findOne(pipelineId);

    return this.prisma.pipelineStage.findMany({
      where: { pipelineId },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            deals: true,
          },
        },
      },
    });
  }

  async findOneStage(id: string) {
    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id },
      include: {
        pipeline: true,
        _count: {
          select: {
            deals: true,
          },
        },
      },
    });

    if (!stage) {
      throw new NotFoundException('Pipeline stage not found');
    }

    return stage;
  }

  async updateStage(id: string, data: UpdatePipelineStageDto) {
    const stage = await this.findOneStage(id);

    // Ensure only one closed won and one closed lost stage per pipeline
    if (data.isClosedWon !== undefined) {
      if (data.isClosedWon && !stage.isClosedWon) {
        const existingClosedWon = await this.prisma.pipelineStage.findFirst({
          where: {
            pipelineId: stage.pipelineId,
            isClosedWon: true,
            id: { not: id },
          },
        });
        if (existingClosedWon) {
          throw new BadRequestException('Pipeline already has a closed won stage');
        }
      }
    }

    if (data.isClosedLost !== undefined) {
      if (data.isClosedLost && !stage.isClosedLost) {
        const existingClosedLost = await this.prisma.pipelineStage.findFirst({
          where: {
            pipelineId: stage.pipelineId,
            isClosedLost: true,
            id: { not: id },
          },
        });
        if (existingClosedLost) {
          throw new BadRequestException('Pipeline already has a closed lost stage');
        }
      }
    }

    return this.prisma.pipelineStage.update({
      where: { id },
      data: {
        name: data.name,
        displayOrder: data.displayOrder,
        defaultProbability: data.defaultProbability,
        isClosedWon: data.isClosedWon,
        isClosedLost: data.isClosedLost,
        automationTriggers: data.automationTriggers,
      },
    });
  }

  async removeStage(id: string) {
    const stage = await this.findOneStage(id);

    // Check if stage has deals
    const dealCount = await this.prisma.deal.count({
      where: { stageId: id },
    });

    if (dealCount > 0) {
      throw new BadRequestException('Cannot delete stage with associated deals');
    }

    await this.prisma.pipelineStage.delete({
      where: { id },
    });

    return { message: 'Pipeline stage deleted successfully' };
  }
}

