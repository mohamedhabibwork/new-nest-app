import { Test, TestingModule } from '@nestjs/testing';
import { GrpcDocumentationController } from './grpc-documentation.controller';

describe('GrpcDocumentationController', () => {
  let controller: GrpcDocumentationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrpcDocumentationController],
    }).compile();

    controller = module.get<GrpcDocumentationController>(
      GrpcDocumentationController,
    );
  });

  describe('getGrpcEndpoints', () => {
    it('should return list of gRPC endpoints', () => {
      const result = controller.getGrpcEndpoints();

      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('note');
      expect(result).toHaveProperty('grpcPort');
      expect(result).toHaveProperty('enabled');
      expect(Array.isArray(result.services)).toBe(true);
      expect(result.services.length).toBeGreaterThan(0);
    });

    it('should include all expected services', () => {
      const result = controller.getGrpcEndpoints();

      const serviceNames = result.services.map((s) => s.service);
      expect(serviceNames).toContain('AuthService');
      expect(serviceNames).toContain('WorkspaceService');
      expect(serviceNames).toContain('ProjectService');
      expect(serviceNames).toContain('TaskService');
      expect(serviceNames).toContain('CollaborationService');
      expect(serviceNames).toContain('NotificationService');
      expect(serviceNames).toContain('FileService');
    });

    it('should include methods for each service', () => {
      const result = controller.getGrpcEndpoints();

      result.services.forEach((service) => {
        expect(service).toHaveProperty('methods');
        expect(Array.isArray(service.methods)).toBe(true);
        expect(service.methods.length).toBeGreaterThan(0);

        service.methods.forEach((method) => {
          expect(method).toHaveProperty('name');
          expect(method).toHaveProperty('description');
          expect(method).toHaveProperty('requestType');
          expect(method).toHaveProperty('responseType');
        });
      });
    });

    it('should include gRPC port information', () => {
      const result = controller.getGrpcEndpoints();

      expect(result.grpcPort).toBeDefined();
      expect(typeof result.grpcPort).toBe('string');
    });

    it('should include enabled status', () => {
      const result = controller.getGrpcEndpoints();

      expect(result.enabled).toBeDefined();
      expect(typeof result.enabled).toBe('boolean');
    });

    it('should include note about authentication', () => {
      const result = controller.getGrpcEndpoints();

      expect(result.note).toBeDefined();
      expect(typeof result.note).toBe('string');
      expect(result.note).toContain('authentication');
    });
  });
});
