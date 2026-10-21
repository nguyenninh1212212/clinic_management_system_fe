// src/types/auth.types.ts
import { UserRole, AuthProvider } from './enums';
import type { CreateDoctorDto } from './doctor.types';

export interface CurrentUser {
  accountType?: 'STAFF';
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
  phone?: string;
  departmentId?: number;
  positionId?: number;
  doctor?: Omit<CreateDoctorDto, 'userId'>;
}

export interface MedicalRegisterResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface LoginDto {
  identifier: string;
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
