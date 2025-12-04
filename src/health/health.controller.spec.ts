import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let memoryHealthIndicator: jest.Mocked<MemoryHealthIndicator>;
  let diskHealthIndicator: jest.Mocked<DiskHealthIndicator>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  };

  const mockDiskHealthIndicator = {
    checkStorage: jest.fn(),
  };

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemoryHealthIndicator,
        },
        {
          provide: DiskHealthIndicator,
          useValue: mockDiskHealthIndicator,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    memoryHealthIndicator = module.get(MemoryHealthIndicator);
    diskHealthIndicator = module.get(DiskHealthIndicator);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return health status with all checks passing', async () => {
      const mockHealthResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          disk: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          disk: { status: 'up' },
        },
      };

      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockMemoryHealthIndicator.checkHeap.mockReturnValue({
        memory_heap: { status: 'up' },
      });
      mockMemoryHealthIndicator.checkRSS.mockReturnValue({
        memory_rss: { status: 'up' },
      });
      mockDiskHealthIndicator.checkStorage.mockReturnValue({
        disk: { status: 'up' },
      });
      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(mockHealthResult);
      expect(result.status).toBe('ok');
    });

    it('should handle database connection failure', async () => {
      const mockHealthResult = {
        status: 'error',
        info: {},
        error: {
          database: { status: 'down', message: 'Connection failed' },
        },
        details: {
          database: { status: 'down', message: 'Connection failed' },
        },
      };

      mockPrismaService.$queryRaw.mockRejectedValue(
        new Error('Connection failed'),
      );
      mockMemoryHealthIndicator.checkHeap.mockReturnValue({
        memory_heap: { status: 'up' },
      });
      mockMemoryHealthIndicator.checkRSS.mockReturnValue({
        memory_rss: { status: 'up' },
      });
      mockDiskHealthIndicator.checkStorage.mockReturnValue({
        disk: { status: 'up' },
      });
      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.error.database).toBeDefined();
    });
  });
});
