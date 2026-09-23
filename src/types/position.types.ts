// src/types/position.types.ts
import { PositionLevel } from './enums';
import { BaseQueryParams } from './common.types';

export interface Position {
  id: number;
  positionCode: string;
  positionTitle: string;
  description?: string;
  departmentId?: number;
  level: PositionLevel;
  isActive: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PositionQueryParams extends BaseQueryParams {
  level?: PositionLevel;
  departmentId?: number;
  isActive?: boolean;
}

export interface CreatePositionDto {
  positionCode: string;
  positionTitle: string;
  description?: string;
  departmentId?: number;
  level: PositionLevel;
  isActive?: boolean;
}

export interface UpdatePositionDto {
  positionCode?: string;
  positionTitle?: string;
  description?: string;
  departmentId?: number;
  level?: PositionLevel;
  isActive?: boolean;
}
