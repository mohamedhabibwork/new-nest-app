import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CsrfService } from './csrf.service';

describe('CsrfService', () => {
  let service: CsrfService;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsrfService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CsrfService>(CsrfService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSecret', () => {
    it('should generate a secret', () => {
      const secret = service.generateSecret();

      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(0);
    });
  });

  describe('createToken', () => {
    it('should create a token from secret', () => {
      const secret = service.generateSecret();
      const token = service.createToken(secret);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const secret = service.generateSecret();
      const token = service.createToken(secret);

      const isValid = service.verifyToken(secret, token);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid token', () => {
      const secret = service.generateSecret();
      const invalidToken = 'invalid-token';

      const isValid = service.verifyToken(secret, invalidToken);

      expect(isValid).toBe(false);
    });
  });

  describe('getCookieOptions', () => {
    it('should return cookie options for development', () => {
      mockConfigService.get.mockReturnValue('development');

      const options = service.getCookieOptions();

      expect(options).toHaveProperty('httpOnly', true);
      expect(options).toHaveProperty('sameSite', 'strict');
      expect(options).toHaveProperty('secure', false);
      expect(options).toHaveProperty('maxAge');
    });

    it('should return cookie options for production', () => {
      mockConfigService.get.mockReturnValue('production');

      const options = service.getCookieOptions();

      expect(options).toHaveProperty('httpOnly', true);
      expect(options).toHaveProperty('sameSite', 'strict');
      expect(options).toHaveProperty('secure', true);
      expect(options).toHaveProperty('maxAge');
    });
  });
});
