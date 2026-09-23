// src/api/endpoints/positions.api.ts
import { api } from '@/api/axios';
import {
  Position,
  CreatePositionDto,
  UpdatePositionDto,
  PositionQueryParams,
  PaginatedResponse,
} from '@/types';

export const positionsApi = {
  findAll: (params?: PositionQueryParams): Promise<PaginatedResponse<Position>> =>
    api.get('/positions', { params }).then((r) => r.data),

  getActive: (): Promise<Position[]> =>
    api.get('/positions/active').then((r) => {
      const res = r.data;
      return Array.isArray(res) ? res : res?.data || [];
    }),

  findById: (id: number): Promise<Position> =>
    api.get(`/positions/${id}`).then((r) => r.data),

  create: (dto: CreatePositionDto): Promise<Position> =>
    api.post('/positions', dto).then((r) => r.data),

  update: (id: number, dto: UpdatePositionDto): Promise<Position> =>
    api.put(`/positions/${id}`, dto).then((r) => r.data),

  toggleActive: (id: number): Promise<Position> =>
    api.patch(`/positions/${id}/toggle`).then((r) => r.data),

  softDelete: (id: number): Promise<void> =>
    api.delete(`/positions/${id}`).then((r) => r.data),

  hardDelete: (id: number): Promise<void> =>
    api.delete(`/positions/${id}/hard`).then((r) => r.data),
};
