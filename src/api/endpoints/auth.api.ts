// src/api/endpoints/auth.api.ts
import { api } from '@/api/axios';
import { requireMedicalUser } from '@/features/auth/utils/medical-session';
import {
  CurrentUser,
  LoginDto,
  LoginResponse
} from '@/types';

export const authApi = {
  login: (dto: LoginDto): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/staff/login', { identifier: dto.identifier.trim(), password: dto.password }).then((r) => ({ ...r.data, user: requireMedicalUser(r.data.user) })),



  logout: (): Promise<void> =>
    api.post('/auth/staff/logout').then((r) => r.data),

  refreshToken: (): Promise<{ accessToken: string }> =>
    api.post('/auth/staff/refresh').then((r) => r.data),

  getMe: (): Promise<CurrentUser> =>
    api.get<CurrentUser>('/auth/staff/me').then((r) => requireMedicalUser(r.data)),

};
