import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const PROVIDE_LINKS = {
  'Custom Apps': '/zen-app',
  'Web Apps': '/zen-web',
  'Custom ERP': '/erp?focus=custom-erp',
  'API Integrations': '/contact'
};

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
            <Box sx={{ mb: 2 }}>
              <Logo height={28} textVariant="h5" />
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 280, mb: 3 }}>
              We provide custom apps, web applications, and tailored ERP and CRM systems to transform your business operations into an autonomous powerhouse.
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2 }}>What We Provide</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(PROVIDE_LINKS).map(([item, path]) => (
                <Typography key={item} variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }} onClick={() => navigate(path)}>{item}</Typography>
              ))}
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2 }}>Zen Suite</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { name: 'Zen ERP', icon: 'erp.png', path: '/erp' },
                { name: 'Zen CRM', icon: 'crm.png', path: '/crm' },
                { name: 'Zen App', icon: 'app.png', path: '/zen-app' },
                { name: 'Zen Web', icon: 'web.png', path: '/zen-web' },
                { name: 'Custom ERP', icon: 'erp.png', path: '/contact' }
              ].map(item => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover p': { color: '#00f2fe' } }} onClick={() => navigate(item.path)}>
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
                <Typography
                  component="a"
                  href="https://www.linkedin.com/company/zenversesols/"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', cursor: 'pointer', '&:hover': { color: '#00f2fe' } }}
                >
                  LinkedIn
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} ZenVerse Tech Solutions. Architected with precision.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: '#00f2fe' } }} onClick={() => navigate('/privacy')}>Privacy Policy</Box>
            {' • '}
            <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: '#00f2fe' } }} onClick={() => navigate('/terms')}>Terms of Service</Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
