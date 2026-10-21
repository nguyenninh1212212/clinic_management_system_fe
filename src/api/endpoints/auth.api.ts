// src/api/endpoints/auth.api.ts
import { api } from '@/api/axios';
import { useAuthStore } from '@/stores/auth.store';
import { canRegisterMedicalAccount, requireMedicalUser } from '@/features/auth/utils/medical-session';
import {
  CurrentUser,
  LoginDto,
  LoginResponse,
  MedicalRegisterResponse,
  RegisterDto,
} from '@/types';

export const authApi = {
  login: (dto: LoginDto): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/staff/login', { identifier: dto.identifier.trim(), password: dto.password }).then((r) => ({ ...r.data, user: requireMedicalUser(r.data.user) })),

  register: async (dto: RegisterDto): Promise<MedicalRegisterResponse> => {
    if (!canRegisterMedicalAccount(useAuthStore.getState().user)) {
      throw new Error('Chỉ quản trị viên được tạo tài khoản bác sĩ hoặc nhân viên y tế.');
    }
    return api.post<MedicalRegisterResponse>('/auth/staff/register', dto).then((r) => r.data);
  },

  logout: (): Promise<void> =>
    api.post('/auth/staff/logout').then((r) => r.data),

  refreshToken: (): Promise<{ accessToken: string }> =>
    api.post('/auth/staff/refresh').then((r) => r.data),

  getMe: (): Promise<CurrentUser> =>
    api.get<CurrentUser>('/auth/staff/me').then((r) => requireMedicalUser(r.data)),

};
