import type { CurrentUser } from '@/types';

const medicalRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'];

export function isMedicalUser(user: { role?: string; accountType?: string } | null | undefined): boolean {
  return !!user && user.accountType === 'STAFF' && medicalRoles.includes(user.role ?? '');
}

export function requireMedicalUser(user: CurrentUser): CurrentUser {
  if (!isMedicalUser(user)) {
    throw new Error('Vui lòng dùng tài khoản bác sĩ hoặc nhân viên y tế để đăng nhập.');
  }
  return user;
}

export function canRegisterMedicalAccount(user: { role?: string; accountType?: string } | null | undefined): boolean {
  return user?.accountType === 'STAFF' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
}
