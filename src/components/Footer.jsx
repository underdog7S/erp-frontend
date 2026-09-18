import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ pt: 10, pb: 4, bgcolor: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -1, color: '#00f2fe', mb: 2 }}>
              <span style={{ background: 'linear-gradient(90deg, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ZV | ZenVerse</span>
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 280, mb: 3 }}>
              We provide Custom Apps, Web Applications, tailored ERPs, CRMs, and full White Labeling services to transform your business operations into an autonomous powerhouse.
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2 }}>What We Provide</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Custom Apps', 'Web Apps', 'White Labeling', 'API Integrations'].map(item => (
                <Typography key={item} variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }} onClick={() => scrollToSection('solutions')}>{item}</Typography>
              ))}
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2 }}>Zen Suite</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { name: 'Zen ERP (Tenant Modules)', icon: 'erp.png' },
                { name: 'Zen CRM', icon: 'crm.png' },
                { name: 'Zen App', icon: 'app.png' },
                { name: 'Zen Web', icon: 'web.png' },
                { name: 'White Labeling', icon: 'whitelable.png' }
              ].map(item => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover p': { color: '#00f2fe' } }} onClick={() => scrollToSection('modules')}>
                  <img src={process.env.PUBLIC_URL + `/assets/${item.icon}`} alt={item.name} style={{ width: '16px', height: '16px', objectFit: 'contain', opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}>{item.name}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2 }}>Company</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }} onClick={() => navigate('/about')}>About Us</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }} onClick={() => navigate('/careers')}>Careers</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }} onClick={() => scrollToSection('process')}>Our Process</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2 }}>Contact Us</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }} onClick={() => window.location.href='mailto:heritageclouds@gmail.com'}>heritageclouds@gmail.com</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Pune, India</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }}>LinkedIn</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }}>Twitter</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} ZenVerse Tech Solutions. Architected with precision.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
            Privacy Policy • Terms of Service
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
