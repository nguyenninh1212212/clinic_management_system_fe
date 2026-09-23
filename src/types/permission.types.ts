// src/types/permission.types.ts
import { PermissionAction } from './enums';

export interface Permission {
  id: number;
  permissionCode: string;
  permissionName: string;
  description?: string;
  action: PermissionAction;
  resource: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  permissionCode: string;
  permissionName: string;
  description?: string;
  action: PermissionAction;
  resource: string;
}
