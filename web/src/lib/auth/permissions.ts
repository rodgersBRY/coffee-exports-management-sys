import type { UserRole } from "@/lib/auth/types";

type ModulePermission = {
  prefix: string;
  roles: UserRole[];
};

const ALL_ROLES: UserRole[] = ["admin", "trader", "warehouse", "finance", "compliance"];

export const MODULE_PERMISSIONS: ModulePermission[] = [
  { prefix: "/", roles: ALL_ROLES },
  { prefix: "/master", roles: ["admin", "compliance"] },
  { prefix: "/procurement", roles: ["admin", "trader"] },
  { prefix: "/inventory", roles: ["admin", "trader", "warehouse"] },
  { prefix: "/contracts", roles: ["admin", "trader"] },
  { prefix: "/shipments", roles: ["admin", "trader", "warehouse", "compliance"] },
  { prefix: "/finance", roles: ["admin", "finance"] },
  { prefix: "/traceability", roles: ["admin", "compliance", "trader"] },
  { prefix: "/reports", roles: ["admin", "compliance", "finance", "trader"] },
  { prefix: "/security", roles: ["admin"] },
  { prefix: "/users", roles: ["admin"] },
  { prefix: "/settings", roles: ["admin"] },
];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function resolvePermissions(pathname: string): ModulePermission {
  const normalized = normalizePath(pathname);
  const exact = MODULE_PERMISSIONS.find((entry) => entry.prefix === normalized);
  if (exact) {
    return exact;
  }

  const prefixed = MODULE_PERMISSIONS
    .filter((entry) => entry.prefix !== "/" && normalized.startsWith(`${entry.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (prefixed) {
    return prefixed;
  }
  return { prefix: "/", roles: ALL_ROLES };
}

export function isPathAllowedForRole(pathname: string, role?: UserRole): boolean {
  if (!role) {
    return false;
  }
  const permissions = resolvePermissions(pathname);
  return permissions.roles.includes(role);
}

export function canRoleAccessPath(role: UserRole, path: string): boolean {
  return isPathAllowedForRole(path, role);
}

