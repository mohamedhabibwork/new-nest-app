import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    getProfile: jest.fn(),
    logout: jest.fn(),
    getUserSessions: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllSessions: jest.fn(),
    enable2FA: jest.fn(),
    verify2FASetup: jest.fn(),
    disable2FA: jest.fn(),
    sendEmailCode: jest.fn(),
    regenerateBackupCodes: jest.fn(),
    getBackupCodes: jest.fn(),
    resendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should get user profile successfully', async () => {
      const mockUser = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authService.getProfile.mockResolvedValue(mockUser as any);

      const result = await controller.getProfile(mockRequest);

      expect(authService.getProfile).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should logout successfully with jti', async () => {
      const mockRequest = {
        user: {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          jti: 'session-jti-here',
        },
      };

      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockRequest);

      expect(authService.logout).toHaveBeenCalledWith(mockRequest.user.jti);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should logout successfully without jti', async () => {
      const mockRequest = {
        user: {
          jti: undefined,
        },
      } as any;

      const result = await controller.logout(mockRequest);

      expect(authService.logout).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getSessions', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should get user sessions successfully', async () => {
      const mockSessions = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          jti: 'session-jti-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
          expiresAt: new Date(),
          createdAt: new Date(),
          lastUsedAt: new Date(),
          revokedAt: null,
        },
      ];

      authService.getUserSessions.mockResolvedValue(mockSessions as any);

      const result = await controller.getSessions(mockRequest);

      expect(authService.getUserSessions).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(result).toEqual(mockSessions);
    });
  });

  describe('revokeSession', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should revoke session successfully', async () => {
      const jti = 'session-jti-here';
      const mockSession = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        jti: 'session-jti-here',
        revokedAt: new Date(),
        createdAt: new Date(),
        expiresAt: new Date(),
        lastUsedAt: new Date(),
        ipAddress: null,
        userAgent: null,
      };

      authService.revokeSession.mockResolvedValue(mockSession as any);

      const result = await controller.revokeSession(jti, mockRequest);

      expect(authService.revokeSession).toHaveBeenCalledWith(
        jti,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockSession);
    });
  });

  describe('revokeAllSessions', () => {
    it('should revoke all sessions successfully', async () => {
      const mockRequest = {
        user: {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          jti: 'current-session-jti',
        },
      };

      const mockBatchPayload = {
        count: 3,
      };

      authService.revokeAllSessions.mockResolvedValue(mockBatchPayload as any);

      const result = await controller.revokeAllSessions(mockRequest);

      expect(authService.revokeAllSessions).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockRequest.user.jti,
      );
      expect(result).toEqual(mockBatchPayload);
    });
  });

  describe('enable2FA', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should enable 2FA and return QR code', async () => {
      authService.enable2FA.mockResolvedValue({
        qrCode: 'data:image/png;base64,...',
        secret: '2FA-secret-here',
        backupCodes: ['code1', 'code2'],
      });

      const result = await controller.enable2FA(mockRequest);

      expect(authService.enable2FA).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result.qrCode).toBeDefined();
      expect(result.secret).toBeDefined();
      expect(result.backupCodes).toBeDefined();
    });
  });

  describe('verify2FASetup', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should verify 2FA setup successfully', async () => {
      const dto = { token: '123456' };

      authService.verify2FASetup.mockResolvedValue({
        message: '2FA enabled successfully',
      });

      const result = await controller.verify2FASetup(mockRequest, dto);

      expect(authService.verify2FASetup).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto.token,
      );
      expect(result.message).toBe('2FA enabled successfully');
    });

    it('should throw BadRequestException for invalid token', async () => {
      const dto = { token: 'invalid' };

      authService.verify2FASetup.mockRejectedValue(
        new BadRequestException('Invalid token'),
      );

      await expect(controller.verify2FASetup(mockRequest, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('disable2FA', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should disable 2FA successfully', async () => {
      const dto = { password: 'password123' };

      authService.disable2FA.mockResolvedValue({
        message: '2FA disabled successfully',
      });

      const result = await controller.disable2FA(mockRequest, dto);

      expect(authService.disable2FA).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto.password,
      );
      expect(result.message).toBe('2FA disabled successfully');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const dto = { password: 'wrongpassword' };

      authService.disable2FA.mockRejectedValue(
        new UnauthorizedException('Invalid password'),
      );

      await expect(controller.disable2FA(mockRequest, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('sendEmailCode', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should send email code successfully', async () => {
      authService.sendEmailCode.mockResolvedValue({
        message: '2FA code sent to email',
      });

      const result = await controller.sendEmailCode(mockRequest);

      expect(authService.sendEmailCode).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(result.message).toBe('2FA code sent to email');
    });
  });

  describe('regenerateBackupCodes', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should regenerate backup codes successfully', async () => {
      authService.regenerateBackupCodes.mockResolvedValue({
        backupCodes: ['newcode1', 'newcode2'],
      });

      const result = await controller.regenerateBackupCodes(mockRequest);

      expect(authService.regenerateBackupCodes).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(result.backupCodes).toBeDefined();
    });
  });

  describe('getBackupCodes', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should get backup codes successfully', async () => {
      const dto = { password: 'password123' };

      authService.getBackupCodes.mockResolvedValue({
        hasBackupCodes: true,
        count: 8,
      });

      const result = await controller.getBackupCodes(mockRequest, dto);

      expect(authService.getBackupCodes).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto.password,
      );
      expect(result.hasBackupCodes).toBe(true);
      expect(result.count).toBe(8);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const dto = { password: 'wrongpassword' };

      authService.getBackupCodes.mockRejectedValue(
        new UnauthorizedException('Invalid password'),
      );

      await expect(controller.getBackupCodes(mockRequest, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('resendVerification', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should resend verification email successfully for authenticated user', async () => {
      const mockUser = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authService.getProfile.mockResolvedValue(mockUser as any);
      authService.resendVerificationEmail.mockResolvedValue({
        message:
          'If the email exists and is not verified, a verification email has been sent.',
      });

      const result = await controller.resendVerification(mockRequest);

      expect(authService.getProfile).toHaveBeenCalledWith(mockRequest.user.id);
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
      );
      expect(result.message).toBeDefined();
    });
  });
});
