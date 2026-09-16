import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { hasPermission, PERMISSIONS } from '../permissions';

/**
 * Protected Admin Route Component
 * Checks authentication and admin permissions before allowing access
 */
const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication and permissions
    const checkAccess = () => {
      try {
        const userStr = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');

        if (!userStr || !accessToken) {
          // Not authenticated - redirect to login
          setHasAccess(false);
          setChecking(false);
          return;
        }

        const userObj = JSON.parse(userStr);
        setUser(userObj);

        // Check if user has admin permissions
        const canManageUsers = hasPermission(userObj, PERMISSIONS.MANAGE_USERS);
        const isAdminRole = userObj.role && (
          userObj.role.toLowerCase() === 'admin' || 
          userObj.role === '1' || 
          userObj.role === 1
        );

        if (canManageUsers || isAdminRole) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();

    // Listen for user changes (login/logout in other tabs)
    const handleStorageChange = () => checkAccess();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleStorageChange);
    };
  }, []);

  if (checking) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography>Checking access...</Typography>
      </Box>
    );
  }

  if (!hasAccess) {
    // Show access denied page
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          bgcolor: 'background.default',
          p: 4
        }}
      >
        <Box
          sx={{
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access the admin panel.
            Only users with admin privileges can access this area.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/login'}
            >
              Login as Admin
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // User has access - render the protected component
  return children;
};

export default ProtectedAdminRoute;

