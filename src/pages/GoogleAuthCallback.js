import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import api from '../services/api';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Tokens arrive in the URL fragment (#access=...&refresh=...), not the
    // query string, so they never end up in server/proxy access logs.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hashParams.get('access');
    const refreshToken = hashParams.get('refresh');
    const email = hashParams.get('email');

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Fetch user profile
      api.get('/users/me/')
        .then(res => {
          if (res && res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            window.dispatchEvent(new Event('userChanged'));
            navigate('/dashboard');
          } else {
            setError('Failed to fetch user profile');
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Error fetching user profile:', err);
          setError('Failed to authenticate. Please try again.');
          setLoading(false);
          setTimeout(() => navigate('/login'), 3000);
        });
    } else {
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
      } else {
        setError('Authentication failed. Missing tokens.');
      }
      setLoading(false);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate]);
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#f5f6fa',
      gap: 2
    }}>
      {loading ? (
        <>
          <CircularProgress size={60} />
          <Typography variant="h6" color="textSecondary">
            Authenticating with Google...
          </Typography>
        </>
      ) : error ? (
        <>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="textSecondary">
            Redirecting to login page...
          </Typography>
        </>
      ) : null}
    </Box>
  );
};

export default GoogleAuthCallback;

