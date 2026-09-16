import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, LinearProgress } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Maintenance = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 2;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <ConstructionIcon
          sx={{
            fontSize: 120,
            color: '#ff9800',
            mb: 2,
            animation: 'rotate 3s linear infinite',
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', md: '4rem' },
            fontWeight: 'bold',
            color: '#ff9800',
            mb: 2,
          }}
        >
          Under Maintenance
        </Typography>
        <Typography variant="h5" sx={{ mb: 2, color: '#666' }}>
          We'll be back soon!
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#888', maxWidth: '600px', mx: 'auto' }}>
          We're currently performing scheduled maintenance to improve your experience.
          We expect to be back online shortly.
        </Typography>

        <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ mr: 1, color: '#ff9800' }} />
            <Typography variant="body2" color="text.secondary">
              Estimated time remaining
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#ffe0b2',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#ff9800',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {progress}% complete
          </Typography>
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
            What we're doing:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, textAlign: 'left' }}>
            <li>Updating system infrastructure</li>
            <li>Improving performance and security</li>
            <li>Fixing bugs and optimizing features</li>
            <li>Ensuring a better user experience</li>
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            For urgent matters, please contact support at{' '}
            <a href="mailto:heritageclouds@gmail.com" style={{ color: '#ff9800' }}>
              heritageclouds@gmail.com
            </a>
          </Typography>
        </Box>
      </Box>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default Maintenance;

