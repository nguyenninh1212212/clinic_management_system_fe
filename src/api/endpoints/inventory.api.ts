// src/api/endpoints/inventory.api.ts
import { api } from '@/api/axios';
import {
  Inventory,
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const inventoryApi = {
  findAll: (params?: InventoryQueryParams): Promise<PaginatedResponse<Inventory>> =>
    api.get('/inventory', { params }).then((r) => r.data),

  findById: (id: string): Promise<ApiResponse<Inventory>> =>
    api.get(`/inventory/${id}`).then((r) => r.data),

  create: (dto: CreateInventoryDto): Promise<ApiResponse<Inventory>> =>
    api.post('/inventory', dto).then((r) => r.data),

  update: (id: string, dto: UpdateInventoryDto): Promise<ApiResponse<Inventory>> =>
    api.patch(`/inventory/${id}`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/inventory/${id}`).then((r) => r.data),
};
