// src/api/endpoints/users.api.ts
import { api } from '@/api/axios';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
  PaginatedResponse,
  AssignUserPermissionsDto,
  ChangePasswordDto,
  Permission,
} from '@/types';

interface AvatarUploadResponse {
  url: string;
}

export const usersApi = {
  findAll: (params?: UserQueryParams): Promise<PaginatedResponse<User>> =>
    api.get('/users', { params }).then((r) => r.data),

  findMe: (): Promise<User> =>
    api.get('/users/me').then((r) => r.data),

  findById: (id: string): Promise<User> =>
    api.get(`/users/${id}`).then((r) => r.data),

  create: (dto: CreateUserDto): Promise<User> =>
    api.post('/users', dto).then((r) => r.data),

  update: (id: string, dto: UpdateUserDto): Promise<User> =>
    api.put(`/users/${id}`, dto).then((r) => r.data),

  uploadAvatar: (file: File,id?:string): Promise<AvatarUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<AvatarUploadResponse>(`/users/upload-avatar/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  getPermissions: (id: string): Promise<Permission[] | number[]> =>
    api.get(`/users/${id}/permission`).then((r) => r.data),

  assignPermissions: (id: string, dto: AssignUserPermissionsDto): Promise<void> =>
    api.put(`/users/${id}/permission`, dto).then((r) => r.data),

  resetPassword: (id: string, password: string): Promise<void> =>
    api.put(`/users/${id}/change-password`, { password }).then((r) => r.data),

  changeOwnPassword: (dto: ChangePasswordDto): Promise<void> =>
    api.post('/users/change-password', dto).then((r) => r.data),
};
