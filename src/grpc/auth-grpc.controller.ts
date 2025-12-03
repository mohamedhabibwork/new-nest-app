import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../auth/auth.service';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  GetProfileRequest,
  GetProfileResponse,
} from './types';
import { mapUserToGrpc } from './utils';
import type { UserWithoutPassword } from '../auth/types/user-without-password.type';

@Controller()
export class AuthGrpcController {
  constructor(private authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Parse name into firstName and lastName if name is provided
    const nameParts = data.name?.split(' ') || [];
    const firstName = data.first_name || nameParts[0] || '';
    const lastName = data.last_name || nameParts.slice(1).join(' ') || '';

    const result = await this.authService.register({
      email: data.email,
      password: data.password,
      name: data.name || `${firstName} ${lastName}`.trim(),
      invitationToken: data.invitation_token,
    });
    // result.user is already without password (Omit<User, 'password'>)
    return {
      message: result.message || 'User registered successfully',
      user: mapUserToGrpc(result.user),
    };
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: LoginRequest): Promise<LoginResponse> {
    const result = await this.authService.login(data);
    // Handle 2FA requirement
    if ('requires2FA' in result && result.requires2FA) {
      return {
        requires2FA: true,
        tempToken: result.tempToken,
        message: result.message,
      };
    }
    // result.user is already without password (Omit<User, 'password'>)
    // When 2FA is not required, user is always present
    if (!result.user) {
      throw new Error('User not found after login');
    }
    return {
      access_token: result.access_token,
      user: mapUserToGrpc(result.user),
    };
  }

  @GrpcMethod('AuthService', 'VerifyEmail')
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return this.authService.verifyEmail(data.token);
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(data.email);
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    return this.authService.resetPassword(data.token, data.password);
  }

  @GrpcMethod('AuthService', 'GetProfile')
  async getProfile(data: GetProfileRequest): Promise<GetProfileResponse> {
    const user = await this.authService.getProfile(data.user_id);
    // user is already without password from getProfile (Omit<User, 'password'>)
    return { user: mapUserToGrpc(user) };
  }
}
