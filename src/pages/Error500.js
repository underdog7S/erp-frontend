import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import BuildIcon from '@mui/icons-material/Build';

const Error500 = () => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Create animated particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.speedX + 100) % 100,
        y: (p.y + p.speedY + 100) % 100,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: 'center', position: 'relative', minHeight: '400px' }}>
        {/* Animated Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 0,
            opacity: 0.1,
          }}
        >
          {particles.map(p => (
            <Box
              key={p.id}
              sx={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                bgcolor: '#f44336',
              }}
            />
          ))}
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <BuildIcon sx={{ fontSize: 120, color: '#f44336', mb: 2, animation: 'spin 2s linear infinite' }} />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem' },
              fontWeight: 'bold',
              color: '#f44336',
              mb: 2,
              animation: 'shake 0.5s infinite',
            }}
          >
            500
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, color: '#666' }}>
            Internal Server Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#888', maxWidth: '600px', mx: 'auto' }}>
            Something went wrong on our end. Our team has been notified and is working to fix the issue.
            Please try again in a few moments.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => window.location.reload()}
              startIcon={<RefreshIcon />}
              sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              sx={{ borderColor: '#f44336', color: '#f44336' }}
            >
              Go Home
            </Button>
          </Box>

          {/* Debug Info */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              bgcolor: '#fff3e0',
              borderRadius: 2,
              textAlign: 'left',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              What you can do:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Refresh the page and try again</li>
              <li>Clear your browser cache</li>
              <li>Check your internet connection</li>
              <li>Contact support if the problem persists</li>
            </Typography>
          </Box>
        </Box>
      </Box>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </Container>
  );
};

export default Error500;

