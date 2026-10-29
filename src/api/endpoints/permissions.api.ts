// src/api/endpoints/permissions.api.ts
import { api } from '@/api/axios';
import { Permission, CreatePermissionDto, PermissionQueryParams } from '@/types';

type PermissionTreeItem = {
  key: string;
  title: string;
  description?: string;
  action: Permission['action'];
  resource: string;
  permissionCode: string;
};

type PermissionTreeGroup = { children?: PermissionTreeItem[] };

const normalizePermissions = (response: unknown): Permission[] => {
  const data = Array.isArray(response)
    ? response
    : (response as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];

  return data.flatMap((item) => {
    const children = (item as PermissionTreeGroup).children;
    if (!Array.isArray(children)) return item as Permission;
    return children.map((permission) => ({
      id: Number(permission.key),
      permissionCode: permission.permissionCode,
      permissionName: permission.title,
      description: permission.description,
      action: permission.action,
      resource: permission.resource,
      createdAt: '',
      updatedAt: '',
    }));
  });
};

export const permissionsApi = {
  findAll: (params?: PermissionQueryParams): Promise<Permission[]> =>
    api.get('/permissions', { params }).then((r) => normalizePermissions(r.data)),

  create: (dto: CreatePermissionDto): Promise<Permission> =>
    api.post('/permissions', dto).then((r) => r.data),

  update: (id: number, dto: CreatePermissionDto): Promise<Permission> =>
    api.put(`/permissions/${id}`, dto).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/permissions/${id}`).then((r) => r.data),
};
