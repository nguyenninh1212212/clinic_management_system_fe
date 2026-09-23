// src/api/endpoints/permissions.api.ts
import { api } from '@/api/axios';
import { Permission, CreatePermissionDto } from '@/types';

export const permissionsApi = {
  findAll: (): Promise<Permission[]> =>
    api.get('/permissions').then((r) => {
      const res = r.data;
      return Array.isArray(res) ? res : res?.data || [];
    }),

  create: (dto: CreatePermissionDto): Promise<Permission> =>
    api.post('/permissions', dto).then((r) => r.data),

  update: (id: number, dto: CreatePermissionDto): Promise<Permission> =>
    api.put(`/permissions/${id}`, dto).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/permissions/${id}`).then((r) => r.data),
};
