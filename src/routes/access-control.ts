import {
  PermissionAction,
  ResourceType,
  UserRole,
  type CurrentUser,
} from "@/types";

export interface PermissionRule {
  resource: ResourceType;
  actions?: PermissionAction[];
}

export interface AccessRule {
  roles?: UserRole[];
  positionIds?: number[];
  /** The user needs at least one of these grants in addition to role/position. */
  permissions?: PermissionRule[];
}

export const hasAccess = (
  user: CurrentUser | null | undefined,
  rule?: AccessRule,
) => {
  if (!user) return false;
  if (!rule) return true;
  if (user.role === "SUPER_ADMIN") return true;

  const roleAllowed = !rule.roles?.length || rule.roles.includes(user.role);
  const positionAllowed =
    !rule.positionIds?.length ||
    (user.positionId !== undefined &&
      rule.positionIds.includes(user.positionId));
  const permissionAllowed =
    user.role === UserRole.ADMIN ||
    !rule.permissions?.length ||
    rule.permissions.some((required) =>
      user.permissions?.some(
        (permission) =>
          permission.resource === required.resource &&
          (!required.actions?.length ||
            required.actions.includes(permission.action as PermissionAction)),
      ),
    );

  return roleAllowed && positionAllowed && permissionAllowed;
};

const clinicalRoles = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.STAFF,
  UserRole.DOCTOR,
];

const managementRoles = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
];

export const pageAccess: Record<string, AccessRule> = {
  "/dashboard": { roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  "/patients": { roles: clinicalRoles },
  "/appointments": { roles: clinicalRoles },
  "/doctor-schedule": { roles: clinicalRoles },
  "/triage": { roles: clinicalRoles },
  "/triage-results": { roles: clinicalRoles },
  "/examinations": { roles: clinicalRoles },
  "/prescriptions": { roles: clinicalRoles },
  "/invoices": {
    roles: clinicalRoles,
    // This page hosts invoicing, payments, refunds and pharmacy dispensing.
    // Any related grant is sufficient to expose its entry point.
    permissions: [
      { resource: ResourceType.INVOICE },
      { resource: ResourceType.CASH_PAYMENT },
      { resource: ResourceType.REFUND },
      { resource: ResourceType.PHARMACY },
      { resource: ResourceType.MEDICINE_PRICE },
    ],
  },
  "/legacy/invoices": { roles: clinicalRoles },
  "/doctors": { roles: managementRoles },
  "/specialties": { roles: managementRoles },
  "/positions": { roles: managementRoles },
  "/doctor-shifts": { roles: managementRoles },
  "/medicines": { roles: managementRoles },
  "/inventory": { roles: managementRoles },
  "/stock-transactions": { roles: managementRoles },
  "/audit-logs": { roles: managementRoles },
  "/users": { roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  "/patient-accounts": { roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  "/permissions": { roles: [UserRole.SUPER_ADMIN] },
};

export const getPageAccess = (pathname: string) =>
  Object.entries(pageAccess)
    .sort(([a], [b]) => b.length - a.length)
    .find(
      ([path]) => pathname === path || pathname.startsWith(`${path}/`),
    )?.[1];
