import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
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

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authService.register.mockResolvedValue({
        message:
          'Registration successful. Please check your email to verify your account.',
        user: mockUser,
      });

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        message:
          'Registration successful. Please check your email to verify your account.',
        user: mockUser,
      });
    });

    it('should register with invitation token', async () => {
      const registerDtoWithInvitation: RegisterDto = {
        ...registerDto,
        invitationToken: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      };

      const mockUser = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authService.register.mockResolvedValue({
        message:
          'Registration successful. Please check your email to verify your account.',
        user: mockUser,
        workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        role: 'team_member',
        invitationAccepted: true,
      });

      const result = await controller.register(registerDtoWithInvitation);

      expect(authService.register).toHaveBeenCalledWith(
        registerDtoWithInvitation,
      );
      expect(result.invitationAccepted).toBe(true);
    });

    it('should throw ConflictException when user already exists', async () => {
      authService.register.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should login successfully', async () => {
      const mockUser = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      };

      authService.login.mockResolvedValue({
        access_token: 'jwt-token-here',
        user: mockUser,
      });

      const result = await controller.login(mockRequest, loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        access_token: 'jwt-token-here',
        user: mockUser,
      });
    });

    it('should return 2FA requirement when 2FA is enabled', async () => {
      authService.login.mockResolvedValue({
        requires2FA: true,
        tempToken: 'temp-token-here',
        message: '2FA verification required',
      });

      const result = await controller.login(mockRequest, loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result.requires2FA).toBe(true);
      expect(result.tempToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(mockRequest, loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Please verify your email before logging in'),
      );

      await expect(controller.login(mockRequest, loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'verification-token-here';

      authService.verifyEmail.mockResolvedValue({
        message: 'Email verified successfully',
      });

      const result = await controller.verifyEmail(token);

      expect(authService.verifyEmail).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        message: 'Email verified successfully',
      });
    });

    it('should throw BadRequestException when token is missing', async () => {
      await expect(controller.verifyEmail('')).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.verifyEmail).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      const token = 'invalid-token';

      authService.verifyEmail.mockRejectedValue(
        new BadRequestException('Invalid or expired token'),
      );

      await expect(controller.verifyEmail(token)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.verifyEmail).toHaveBeenCalledWith(token);
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should send password reset email', async () => {
      authService.forgotPassword.mockResolvedValue({
        message: 'If the email exists, a password reset link has been sent.',
      });

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
      expect(result).toEqual({
        message: 'If the email exists, a password reset link has been sent.',
      });
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'reset-token-here',
      password: 'newpassword123',
    };

    it('should reset password successfully', async () => {
      authService.resetPassword.mockResolvedValue({
        message: 'Password reset successfully',
      });

      const result = await controller.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.password,
      );
      expect(result).toEqual({
        message: 'Password reset successfully',
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      authService.resetPassword.mockRejectedValue(
        new BadRequestException('Invalid or expired token'),
      );

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
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

      authService.getProfile.mockResolvedValue(mockUser);

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
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        },
      };

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
          jti: 'session-jti-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
          expiresAt: new Date(),
          createdAt: new Date(),
          lastUsedAt: new Date(),
        },
      ];

      authService.getUserSessions.mockResolvedValue(mockSessions);

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

      authService.revokeSession.mockResolvedValue({
        message: 'Session revoked successfully',
      });

      const result = await controller.revokeSession(jti, mockRequest);

      expect(authService.revokeSession).toHaveBeenCalledWith(
        jti,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'Session revoked successfully' });
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

      authService.revokeAllSessions.mockResolvedValue({
        message: 'All other sessions revoked successfully',
      });

      const result = await controller.revokeAllSessions(mockRequest);

      expect(authService.revokeAllSessions).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockRequest.user.jti,
      );
      expect(result).toEqual({
        message: 'All other sessions revoked successfully',
      });
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
        backupCodes: ['code1', 'code2'],
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
        message: '2FA code sent to your email',
      });

      const result = await controller.sendEmailCode(mockRequest);

      expect(authService.sendEmailCode).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(result.message).toBe('2FA code sent to your email');
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
        message: 'Backup codes regenerated successfully',
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
        backupCodes: ['code1', 'code2'],
      });

      const result = await controller.getBackupCodes(mockRequest, dto);

      expect(authService.getBackupCodes).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto.password,
      );
      expect(result.backupCodes).toBeDefined();
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
});
