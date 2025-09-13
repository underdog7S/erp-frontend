// Centralized permission utility for Zenith ERP frontend
// Usage: import { hasPermission, PERMISSIONS } from './permissions';

// Define common actions and resources
export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_CLASSES: 'manage_classes',
  MANAGE_FEES: 'manage_fees',
  MANAGE_ATTENDANCE: 'manage_attendance',
  VIEW_REPORTS: 'view_reports',
  MANAGE_PLANS: 'manage_plans',
  // Add more as needed
};

// Map roles to allowed actions (can be extended for fine-grained control)
const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_FEES,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_PLANS,
  ],
  principal: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_REPORTS,
  ],
  teacher: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_REPORTS,
  ],
  staff: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_ATTENDANCE,
  ],
  accountant: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_FEES,
    PERMISSIONS.VIEW_REPORTS,
  ],
  librarian: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
  ],
  student: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
  ],
  // Add more roles as needed
};

// Main permission check function
export function hasPermission(user, action, resource = null) {
  if (!user || !user.role) return false;
  const role = typeof user.role === 'string' ? user.role.toLowerCase() : user.role;
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(action);
}

// Example usage:
// if (hasPermission(currentUser, PERMISSIONS.MANAGE_USERS)) { ... } 