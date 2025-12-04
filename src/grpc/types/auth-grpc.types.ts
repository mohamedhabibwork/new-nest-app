import { GrpcBaseRequest } from './grpc-common.types';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  first_name?: string;
  last_name?: string;
  invitation_token?: string;
  workspace_id?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  user?: UserResponse;
  requires2FA?: boolean;
  tempToken?: string;
  message?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface GetProfileRequest extends GrpcBaseRequest {}

export interface GetProfileResponse {
  user: UserResponse;
}
