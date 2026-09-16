import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const NetworkError = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionCheck, setConnectionCheck] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = async () => {
    setConnectionCheck(true);
    try {
      const response = await fetch('https://api.zenitherp.online/api/', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      setTimeout(() => {
        setConnectionCheck(false);
        if (isOnline) {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (error) {
      setConnectionCheck(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <WifiOffIcon
          sx={{
            fontSize: 120,
            color: '#9e9e9e',
            mb: 2,
            animation: 'pulse 2s infinite',
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', md: '4rem' },
            fontWeight: 'bold',
            color: '#9e9e9e',
            mb: 2,
          }}
        >
          Connection Lost
        </Typography>
        <Typography variant="h5" sx={{ mb: 2, color: '#666' }}>
          {isOnline ? 'API Connection Failed' : 'You are Offline'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#888', maxWidth: '600px', mx: 'auto' }}>
          {isOnline
            ? 'We couldn\'t reach our servers. Please check your connection and try again.'
            : 'It looks like you\'re not connected to the internet. Please check your network connection.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={checkConnection}
            disabled={connectionCheck}
            startIcon={connectionCheck ? <CheckCircleIcon /> : <RefreshIcon />}
            sx={{ bgcolor: '#9e9e9e', '&:hover': { bgcolor: '#757575' } }}
          >
            {connectionCheck ? 'Checking...' : 'Retry Connection'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
            sx={{ borderColor: '#9e9e9e', color: '#9e9e9e' }}
          >
            Go Home
          </Button>
        </Box>

        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Troubleshooting Tips:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, textAlign: 'left' }}>
            <li>Check your internet connection</li>
            <li>Disable VPN if enabled</li>
            <li>Try a different browser</li>
            <li>Clear browser cache and cookies</li>
            <li>Check if other websites are working</li>
          </Typography>
        </Box>
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Container>
  );
};

export default NetworkError;

