// src/types/inventory.types.ts
import { StockTransactionType } from './enums';
import { BaseQueryParams } from './common.types';
import { Medicine } from './medicine.types';

export interface StockTransaction {
  id: number;
  inventoryId: string;
  transactionType: StockTransactionType;
  quantity: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  note?: string;
  createdAt: string;
}

export interface Inventory {
  id: string;
  medicineId: string;
  medicine?: Medicine;
  warehouseLocation?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  unitCost: number;
  transactions?: StockTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryQueryParams extends BaseQueryParams {
  medicineId?: string;
  expiringSoon?: boolean;
  lowStock?: boolean;
}

export interface CreateInventoryDto {
  medicineId: string;
  warehouseLocation?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  unitCost: number;
}

export interface UpdateInventoryDto {
  warehouseLocation?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity?: number;
  unitCost?: number;
}

export interface StockTransactionQueryParams extends BaseQueryParams {
  inventoryId?: string;
  transactionType?: StockTransactionType;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateStockTransactionDto {
  inventoryId: string;
  transactionType: StockTransactionType;
  quantity: number;
  referenceId?: string;
  note?: string;
}
