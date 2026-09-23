// src/types/specialty.types.ts
import { BaseQueryParams } from './common.types';

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpecialtyQueryParams extends BaseQueryParams {}

export interface CreateSpecialtyDto {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateSpecialtyDto {
  name?: string;
  description?: string;
  iconUrl?: string;
}
