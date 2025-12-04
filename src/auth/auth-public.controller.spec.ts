import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPublicController } from './auth-public.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Verify2FALoginDto } from './dto/verify-2fa-login.dto';

describe('AuthPublicController', () => {
  let controller: AuthPublicController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    resendVerificationEmail: jest.fn(),
    verify2FAAndLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthPublicController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthPublicController>(AuthPublicController);
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

      const result = await controller.login(loginDto);

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

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result.requires2FA).toBe(true);
      expect(result.tempToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Please verify your email before logging in'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
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

  describe('resendVerification', () => {
    const resendVerificationDto: ResendVerificationDto = {
      email: 'test@example.com',
    };

    it('should resend verification email successfully', async () => {
      authService.resendVerificationEmail.mockResolvedValue({
        message:
          'If the email exists and is not verified, a verification email has been sent.',
      });

      const result = await controller.resendVerification(resendVerificationDto);

      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(
        resendVerificationDto.email,
      );
      expect(result).toEqual({
        message:
          'If the email exists and is not verified, a verification email has been sent.',
      });
    });

    it('should return same message for non-existent email', async () => {
      authService.resendVerificationEmail.mockResolvedValue({
        message:
          'If the email exists and is not verified, a verification email has been sent.',
      });

      const result = await controller.resendVerification(resendVerificationDto);

      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(
        resendVerificationDto.email,
      );
      expect(result.message).toBeDefined();
    });

    it('should return same message for already verified email', async () => {
      authService.resendVerificationEmail.mockResolvedValue({
        message:
          'If the email exists and is not verified, a verification email has been sent.',
      });

      const result = await controller.resendVerification(resendVerificationDto);

      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(
        resendVerificationDto.email,
      );
      expect(result.message).toBeDefined();
    });
  });

  describe('verify2FALogin', () => {
    const verify2FALoginDto = {
      email: 'test@example.com',
      tempToken: 'temp-token-here',
      twoFactorToken: '123456',
      useEmailCode: false,
    };

    it('should verify 2FA and complete login successfully', async () => {
      const mockUser = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      };

      authService.verify2FAAndLogin.mockResolvedValue({
        access_token: 'jwt-token-here',
        user: mockUser,
      });

      const result = await controller.verify2FALogin(verify2FALoginDto);

      expect(authService.verify2FAAndLogin).toHaveBeenCalledWith(
        verify2FALoginDto.email,
        verify2FALoginDto.tempToken,
        verify2FALoginDto.twoFactorToken,
        false,
      );
      expect(result.access_token).toBeDefined();
      expect(result.user).toEqual(mockUser);
    });

    it('should verify 2FA with email code', async () => {
      const dtoWithEmailCode = {
        ...verify2FALoginDto,
        useEmailCode: true,
      };

      const mockUser = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      };

      authService.verify2FAAndLogin.mockResolvedValue({
        access_token: 'jwt-token-here',
        user: mockUser,
      });

      const result = await controller.verify2FALogin(dtoWithEmailCode);

      expect(authService.verify2FAAndLogin).toHaveBeenCalledWith(
        dtoWithEmailCode.email,
        dtoWithEmailCode.tempToken,
        dtoWithEmailCode.twoFactorToken,
        true,
      );
      expect(result.access_token).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid 2FA token', async () => {
      authService.verify2FAAndLogin.mockRejectedValue(
        new UnauthorizedException('Invalid 2FA token'),
      );

      await expect(controller.verify2FALogin(verify2FALoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
