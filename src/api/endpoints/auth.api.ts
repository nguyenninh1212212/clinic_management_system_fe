// src/api/endpoints/auth.api.ts
import { api } from '@/api/axios';
import {
  CurrentUser,
  LoginDto,
  LoginResponse,
  RegisterDto,
  SocialLoginDto,
  LinkedProvider,
  SetPasswordDto,
} from '@/types';

export const authApi = {
  login: (dto: LoginDto): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', dto).then((r) => r.data),

  register: (dto: RegisterDto): Promise<{ message: string; user?: CurrentUser; accessToken?: string }> =>
    api.post('/auth/register', dto).then((r) => r.data),

  logout: (): Promise<void> =>
    api.post('/auth/logout').then((r) => r.data),

  refreshToken: (): Promise<{ accessToken: string }> =>
    api.post('/auth/refresh-token').then((r) => r.data),

  getMe: (): Promise<CurrentUser> =>
    api.get<CurrentUser>('/auth/me').then((r) => r.data),

  googleLogin: (dto: { token: string }): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/google', dto).then((r) => r.data),

  facebookLogin: (dto: { accessToken: string }): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/facebook', dto).then((r) => r.data),

  getProviders: (): Promise<LinkedProvider[]> =>
    api.get<LinkedProvider[]>('/auth/providers').then((r) => r.data),

  linkProvider: (dto: { provider: string; token: string }): Promise<void> =>
    api.post('/auth/link-provider', dto).then((r) => r.data),

  unlinkProvider: (dto: { provider: string }): Promise<void> =>
    api.post('/auth/unlink-provider', dto).then((r) => r.data),

  setPassword: (dto: SetPasswordDto): Promise<void> =>
    api.post('/auth/set-password', dto).then((r) => r.data),
};
