// src/types/medicine.types.ts
import { MedicineCategory } from "./enums";
import { BaseQueryParams } from "./common.types";

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
  sellingPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineQueryParams extends BaseQueryParams {
  search?: string;
  category?: MedicineCategory;
  lowStock?: boolean;
  genericName?: string;
  unit?: string;
  manufacturer?: string;
  registrationNumber?: string;
  isActive?: boolean;
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
  sellingPrice: number;
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
