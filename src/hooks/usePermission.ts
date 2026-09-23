// src/hooks/usePermission.ts
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types';

export function usePermission() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const isSuperAdmin = role === UserRole.SUPER_ADMIN;
  const isAdmin = role === UserRole.ADMIN || isSuperAdmin;
  const isManager = role === UserRole.MANAGER || isAdmin;
  const isStaff = role === UserRole.STAFF || isManager;
  const isUser = role === UserRole.USER || isStaff;

  const canManageUsers = isSuperAdmin;
  const canManagePermissions = isSuperAdmin;

  const canViewPatients = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
  ].includes(role as UserRole);

  const canCreateOrEditPatient = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.STAFF,
  ].includes(role as UserRole);

  const canDeletePatient = isSuperAdmin;

  const canManageDoctors = isAdmin;
  const canDeleteDoctor = isSuperAdmin;

  const canManageSpecialties = isAdmin;
  const canDeleteSpecialty = isSuperAdmin;

  const canManagePositions = isAdmin;
  const canDeletePosition = isSuperAdmin;

  const canViewAuditLogs = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.USER,
  ].includes(role as UserRole);

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return {
    currentUser: user,
    role,
    isSuperAdmin,
    isAdmin,
    isManager,
    isStaff,
    isUser,
    canManageUsers,
    canManagePermissions,
    canViewPatients,
    canCreateOrEditPatient,
    canDeletePatient,
    canManageDoctors,
    canDeleteDoctor,
    canManageSpecialties,
    canDeleteSpecialty,
    canManagePositions,
    canDeletePosition,
    canViewAuditLogs,
    hasRole,
  };
}
