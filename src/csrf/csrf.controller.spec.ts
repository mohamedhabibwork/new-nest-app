import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';

describe('CsrfController', () => {
  let controller: CsrfController;
  let csrfService: jest.Mocked<CsrfService>;

  const mockCsrfService = {
    generateSecret: jest.fn(),
    createToken: jest.fn(),
    verifyToken: jest.fn(),
    getCookieOptions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsrfController],
      providers: [
        {
          provide: CsrfService,
          useValue: mockCsrfService,
        },
      ],
    }).compile();

    controller = module.get<CsrfController>(CsrfController);
    csrfService = module.get(CsrfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCsrfToken', () => {
    it('should return CSRF token successfully with new secret', () => {
      const mockSecret = 'csrf-secret-here';
      const mockToken = 'csrf-token-here';

      const mockRequest = {
        cookies: {},
      } as Request;

      const mockResponse = {
        cookie: jest.fn(),
        json: jest.fn().mockReturnValue({
          csrfToken: mockToken,
          message: 'CSRF token generated and set in cookie',
        }),
      } as unknown as Response;

      mockCsrfService.generateSecret.mockReturnValue(mockSecret);
      mockCsrfService.createToken.mockReturnValue(mockToken);
      mockCsrfService.getCookieOptions.mockReturnValue({
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });

      controller.getCsrfToken(mockRequest, mockResponse);

      expect(csrfService.generateSecret).toHaveBeenCalled();
      expect(csrfService.createToken).toHaveBeenCalledWith(mockSecret);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'csrf-secret',
        mockSecret,
        expect.any(Object),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        csrfToken: mockToken,
        message: 'CSRF token generated and set in cookie',
      });
    });

    it('should return CSRF token using existing secret from cookie', () => {
      const mockSecret = 'existing-secret';
      const mockToken = 'csrf-token-here';

      const mockRequest = {
        cookies: {
          'csrf-secret': mockSecret,
        },
      } as Request;

      const mockResponse = {
        cookie: jest.fn(),
        json: jest.fn().mockReturnValue({
          csrfToken: mockToken,
          message: 'CSRF token generated and set in cookie',
        }),
      } as unknown as Response;

      mockCsrfService.createToken.mockReturnValue(mockToken);

      controller.getCsrfToken(mockRequest, mockResponse);

      expect(csrfService.generateSecret).not.toHaveBeenCalled();
      expect(csrfService.createToken).toHaveBeenCalledWith(mockSecret);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        csrfToken: mockToken,
        message: 'CSRF token generated and set in cookie',
      });
    });

    it('should return a valid token format', () => {
      const mockSecret = 'csrf-secret-here';
      const mockToken = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const mockRequest = {
        cookies: {},
      } as Request;

      const mockResponse = {
        cookie: jest.fn(),
        json: jest.fn().mockReturnValue({
          csrfToken: mockToken,
          message: 'CSRF token generated and set in cookie',
        }),
      } as unknown as Response;

      mockCsrfService.generateSecret.mockReturnValue(mockSecret);
      mockCsrfService.createToken.mockReturnValue(mockToken);
      mockCsrfService.getCookieOptions.mockReturnValue({});

      const result = controller.getCsrfToken(mockRequest, mockResponse);

      expect(result.csrfToken).toBeDefined();
      expect(typeof result.csrfToken).toBe('string');
      expect(result.csrfToken.length).toBeGreaterThan(0);
    });
  });
});
