// src/types/auth.types.ts
import { UserRole, AuthProvider } from './enums';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  avatar?: string;
  departmentId?: number;
  positionId?: number;
}

export interface LoginResponse {
  accessToken: string;
  user: CurrentUser;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SocialLoginDto {
  token?: string;
  accessToken?: string;
}

export interface LinkedProvider {
  id: number;
  provider: AuthProvider;
  providerId: string;
  createdAt: string;
}

export interface SetPasswordDto {
  password: string;
}
