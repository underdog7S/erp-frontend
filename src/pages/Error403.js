import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';

const Error403 = () => {
  const navigate = useNavigate();
  const [clicks, setClicks] = useState(0);

  const handleUnlockClick = () => {
    setClicks(prev => prev + 1);
    if (clicks >= 9) {
      // Easter egg after 10 clicks
      alert('🎉 You unlocked the secret! But you still need proper permissions. 😊');
      setClicks(0);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <LockIcon
          sx={{
            fontSize: 120,
            color: '#ff9800',
            mb: 2,
            animation: clicks > 5 ? 'bounce 0.5s infinite' : 'none',
            cursor: 'pointer',
          }}
          onClick={handleUnlockClick}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '4rem', md: '6rem' },
            fontWeight: 'bold',
            color: '#ff9800',
            mb: 2,
          }}
        >
          403
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, color: '#666' }}>
          Access Forbidden
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#888', maxWidth: '600px', mx: 'auto' }}>
          You don't have permission to access this resource. This area is restricted.
          {clicks > 5 && (
            <span style={{ display: 'block', marginTop: '10px', fontSize: '0.9rem', color: '#ff9800' }}>
              💡 Try clicking the lock icon! (You've clicked {clicks} times)
            </span>
          )}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!localStorage.getItem('access_token') ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              startIcon={<LoginIcon />}
              sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
            >
              Login
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
            >
              Go to Dashboard
            </Button>
          )}
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
            sx={{ borderColor: '#ff9800', color: '#ff9800' }}
          >
            Go Home
          </Button>
        </Box>

        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: '#fff3e0',
            borderRadius: 2,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Why you might be seeing this:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, textAlign: 'left' }}>
            <li>You're not logged in (please login first)</li>
            <li>Your account doesn't have the required permissions</li>
            <li>You're trying to access an admin-only area</li>
            <li>The resource has been moved or deleted</li>
          </Typography>
        </Box>
      </Box>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Container>
  );
};

export default Error403;

