// src/types/medicine.types.ts
import { MedicineCategory } from './enums';
import { BaseQueryParams } from './common.types';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  unit: string;
  category: MedicineCategory;
  description?: string;
  minStockLevel?: number;
  manufacturer?: string;
  registrationNumber?: string;
  totalStock?: number;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineQueryParams extends BaseQueryParams {
  category?: MedicineCategory;
}

export interface CreateMedicineDto {
  name: string;
  genericName?: string;
  unit: string;
  category: MedicineCategory;
  description?: string;
  minStockLevel?: number;
  manufacturer?: string;
  registrationNumber?: string;
}

export interface UpdateMedicineDto {
  name?: string;
  genericName?: string;
  unit?: string;
  category?: MedicineCategory;
  description?: string;
  minStockLevel?: number;
  manufacturer?: string;
  registrationNumber?: string;
}
