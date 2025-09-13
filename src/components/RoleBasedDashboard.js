import React from 'react';
import AdminEnhanced from '../pages/AdminEnhanced';
import TeacherDashboard from '../pages/TeacherDashboard';
import AccountantDashboard from '../pages/AccountantDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import PrincipalDashboard from '../pages/PrincipalDashboard'; // Placeholder, create if missing
import LibrarianDashboard from '../pages/LibrarianDashboard'; // Placeholder, create if missing
import { Box, Typography, Alert } from '@mui/material';
import { hasPermission, PERMISSIONS } from '../permissions';
import Tooltip from '@mui/material/Tooltip';

// Add placeholder components if missing
export const PrincipalDashboard = () => (
  <Box sx={{ p: 3 }}>
    <Alert severity="info">
      <Typography variant="h5">Principal Dashboard</Typography>
      <Typography variant="body2">This is a placeholder for the Principal dashboard. Implement as needed.</Typography>
      <Typography variant="caption" color="text.secondary">(Requires MANAGE_USERS, MANAGE_CLASSES, MANAGE_ATTENDANCE, VIEW_REPORTS permissions)</Typography>
    </Alert>
  </Box>
);

export const LibrarianDashboard = () => (
  <Box sx={{ p: 3 }}>
    <Alert severity="info">
      <Typography variant="h5">Librarian Dashboard</Typography>
      <Typography variant="body2">This is a placeholder for the Librarian dashboard. Implement as needed.</Typography>
      <Typography variant="caption" color="text.secondary">(Requires VIEW_DASHBOARD, VIEW_REPORTS permissions)</Typography>
    </Alert>
  </Box>
);

const RoleBasedDashboard = () => {
  const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
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

  const role = getRoleString(userRole);

  // Render appropriate dashboard based on permission
  if (hasPermission(userProfile, PERMISSIONS.MANAGE_USERS)) return <AdminEnhanced />;
  if (hasPermission(userProfile, PERMISSIONS.MANAGE_CLASSES)) return <TeacherDashboard />;
  if (hasPermission(userProfile, PERMISSIONS.MANAGE_FEES)) return <AccountantDashboard />;
  if (hasPermission(userProfile, PERMISSIONS.MANAGE_ATTENDANCE) && !hasPermission(userProfile, PERMISSIONS.MANAGE_CLASSES)) return <StaffDashboard />;
  if (hasPermission(userProfile, PERMISSIONS.VIEW_REPORTS) && !hasPermission(userProfile, PERMISSIONS.MANAGE_USERS)) return <StudentDashboard />;
  // Fallback for principal/librarian or unknown roles
  if (userProfile.role && userProfile.role.toLowerCase() === 'principal') return <PrincipalDashboard />;
  if (userProfile.role && userProfile.role.toLowerCase() === 'librarian') return <LibrarianDashboard />;
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