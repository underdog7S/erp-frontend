import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import api from '../services/api';

const AuthCheck = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        // Verify token by making a request to a protected endpoint
        const response = await api.get('/users/me/');
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setError('Invalid authentication token');
        }
      } catch (err) {
        setError('Authentication failed. Please log in again.');
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please log in to access this feature.
        </Typography>
        <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Go to Login
        </button>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Authentication required
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please log in to access this feature.
        </Typography>
        <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Go to Login
        </button>
      </Box>
    );
  }

  return children;
};

export default AuthCheck; 