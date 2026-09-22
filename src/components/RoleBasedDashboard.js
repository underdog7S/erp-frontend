import React from 'react';
import AdminEnhanced from '../pages/AdminEnhanced';
import TeacherDashboard from '../pages/TeacherDashboard';
import AccountantDashboard from '../pages/AccountantDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import PrincipalDashboard from '../pages/PrincipalDashboard';
import LibrarianDashboard from '../pages/LibrarianDashboard';
import { Box, Typography, Alert } from '@mui/material';
import { hasPermission, PERMISSIONS } from '../permissions';
import Tooltip from '@mui/material/Tooltip';
import { getStoredUser } from '../services/api';

const RoleBasedDashboard = () => {
  const userProfile = getStoredUser();
  const userRole = userProfile.role || '';

  // Map numeric roles to string roles
  const getRoleString = (role) => {
    if (typeof role === 'number') {
      const roleMap = {
        1: 'admin',
        2: 'teacher',
        3: 'student',
        4: 'accountant',
        5: 'staff'
      };
      return roleMap[role] || 'staff';
    }
    return role;
  };

  const roleRaw = getRoleString(userRole);
  // getRoleString only maps *numeric* roles; a string role (e.g. "Principal")
  // passes through as-is, and hasPermission() lowercases before comparing -
  // do the same here, and guard against non-string values so this can't
  // throw "role.toLowerCase is not a function".
  const role = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : roleRaw;
  // Checking the *role name* first means 'principal'/'librarian' get their
  // own dashboard even though PERMISSIONS.principal also grants MANAGE_USERS
  // (which would otherwise match the generic admin check below first and
  // hide their real dashboard).
  if (role === 'principal') return <PrincipalDashboard />;
  if (role === 'librarian') return <LibrarianDashboard />;

  // Render appropriate dashboard based on permission
  if (hasPermission(userProfile, PERMISSIONS.MANAGE_USERS)) return <AdminEnhanced />;
  if (hasPermission(userProfile, PERMISSIONS.MANAGE_CLASSES)) return <TeacherDashboard />;
  if (hasPermission(userProfile, PERMISSIONS.MANAGE_FEES)) return <AccountantDashboard />;
  if (hasPermission(userProfile, PERMISSIONS.MANAGE_ATTENDANCE) && !hasPermission(userProfile, PERMISSIONS.MANAGE_CLASSES)) return <StaffDashboard />;
  if (hasPermission(userProfile, PERMISSIONS.VIEW_REPORTS) && !hasPermission(userProfile, PERMISSIONS.MANAGE_USERS)) return <StudentDashboard />;
  // Generic fallback
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="warning">
        <Typography variant="h6">Role Not Recognized</Typography>
        <Typography variant="body2">
          Your role "{userProfile.role || ''}" is not recognized. Please contact your administrator.
        </Typography>
      </Alert>
    </Box>
  );
};

export default RoleBasedDashboard; 