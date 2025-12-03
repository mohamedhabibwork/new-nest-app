import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../auth/auth.service';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  message: string;
  user: any;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: any;
}

interface VerifyEmailRequest {
  token: string;
}

interface VerifyEmailResponse {
  message: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface GetProfileRequest {
  user_id: string;
}

interface GetProfileResponse {
  user: any;
}

@Controller()
export class AuthGrpcController {
  constructor(private authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.authService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(data);
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
    return { user };
  }
}
