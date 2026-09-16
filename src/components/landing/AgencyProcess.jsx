import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';

const processes = [
  {
    step: '01',
    title: 'Discover',
    description: 'A 30-minute call to map where you\'re actually losing money — not to sell you tech you don\'t need.',
    color: '#00e5ff'
  },
  {
    step: '02',
    title: 'Prototype',
    description: 'Within a week, you see a working prototype and a fixed-scope proposal. No 40-page decks.',
    color: '#b388ff'
  },
  {
    step: '03',
    title: 'Ship',
    description: 'We build in short cycles with weekly demos. You always know what\'s live and what\'s next.',
    color: '#69f0ae'
  },
  {
    step: '04',
    title: 'Compound',
    description: 'Post-launch, we automate, optimise and add AI where it pays back. Growth is a partnership, not a handoff.',
    color: '#ff4081'
  }
];

const AgencyProcess = () => {
  return (
    <Box sx={{ py: 12, bgcolor: '#050505', color: 'white' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={10}>
          <Typography variant="overline" sx={{ color: '#69f0ae', letterSpacing: 2, fontWeight: 700 }}>
            How we work
          </Typography>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
            Four steps. No 40-page decks.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ position: 'relative' }}>
          {/* Connecting line for desktop */}
          <Box sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: '40px',
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(0,229,255,0.2) 0%, rgba(179,136,255,0.2) 33%, rgba(105,240,174,0.2) 66%, rgba(255,64,129,0.2) 100%)',
            zIndex: 0
          }} />

          {processes.map((process, idx) => (
            <Grid item xs={12} md={3} key={idx} sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ 
                textAlign: { xs: 'center', md: 'left' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' }
              }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#1a1a1a',
                  border: `2px solid ${process.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  boxShadow: `0 0 20px ${process.color}30`
                }}>
                  <Typography variant="h5" fontWeight={800} sx={{ color: process.color }}>
                    {process.step}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                  {process.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, px: { xs: 2, md: 0 }, maxWidth: 300 }}>
                  {process.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AgencyProcess;
