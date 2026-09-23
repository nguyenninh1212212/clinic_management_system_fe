// src/types/user.types.ts
import { UserRole } from './enums';
import { BaseQueryParams } from './common.types';
import { Position } from './position.types';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  departmentId?: number;
  positionId?: number;
  position?: Position;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserQueryParams extends BaseQueryParams {
  role?: UserRole;
  departmentId?: number;
  isActive?: boolean;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId?: number;
  positionId?: number;
  isActive: boolean;
  avatar?: string;
}

export interface UpdateUserDto {
  fullName: string;
  role: UserRole;
  departmentId?: number;
  positionId?: number;
  isActive: boolean;
  avatar?: string;
}

export interface AssignUserPermissionsDto {
  permissions: number[];
}

export interface ChangePasswordDto {
  oldPassword?: string;
  password: string;
}
