import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';

const Careers = () => {
  return (
    <Box sx={{ bgcolor: '#050505', minHeight: '100vh', color: 'white' }}>
      <Container sx={{ pt: 15, pb: 10, textAlign: 'center' }}>
        <Typography variant="h2" fontWeight={800} gutterBottom sx={{ color: '#00f2fe' }}>
          Join ZenVerse
        </Typography>
        <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 600, mx: 'auto' }}>
          We are always looking for talented engineers, designers, and innovators to build the future of autonomous ERP and CRM.
        </Typography>
        <Button variant="contained" size="large" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'black', fontWeight: 800 }}>
          View Open Positions
        </Button>
      </Container>
    </Box>
  );
};

export default Careers;
