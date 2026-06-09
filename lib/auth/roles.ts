export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  TENANT: "tenant",
  VENDOR: "vendor",
  ACCOUNTANT: "accountant",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 5,
  manager: 4,
  accountant: 3,
  vendor: 2,
  tenant: 1,
};

export function hasMinimumRole(
  userRole: string | null | undefined,
  requiredRole: RoleName
): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

export const PROTECTED_ROUTE_ROLES: Record<string, RoleName> = {
  "/dashboard/settings": ROLES.OWNER,
  "/dashboard/settings/billing": ROLES.OWNER,
  "/dashboard/team": ROLES.MANAGER,
};
