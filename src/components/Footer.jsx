import React, { useState } from 'react';
import {
  Box, 
  Link, 
  Typography, 
  Stack, 
  Grid,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email as EmailIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const footerLinks = {
    product: [
      { label: 'About', path: '/about' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Contact', path: '/contact' }
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms & Conditions', path: '/terms' },
      { label: 'Refund Policy', path: '/refund' },
      { label: 'Service Delivery', path: '/delivery' }
    ]
  };


  const contactInfo = [
    { icon: <EmailIcon />, label: 'Email', value: 'support@zenitherp.online', link: 'mailto:support@zenitherp.online' },
    { icon: <WebsiteIcon />, label: 'Website', value: 'zenitherp.online', link: 'https://zenitherp.online' },
    { icon: <LocationIcon />, label: 'Location', value: 'Pune, India', link: null }
  ];

  return (
    <Box 
      component="footer"
      sx={{ 
        mt: 4, 
        bgcolor: '#0d1421', // Darker blue-gray matching homepage theme
        background: 'linear-gradient(180deg, #0d1421 0%, #1a1a2e 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2, #42a5f5, #ff9800, #1976d2)',
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 3s ease infinite'
        },
        '@keyframes gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      <Container maxWidth="xl" sx={{ maxWidth: { xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' } }}>
        {/* Main Footer Content */}
        <Grid container spacing={3} sx={{ py: 3 }}>
          {/* Company Info & Map */}
          <Grid item xs={12} md={6} lg={4}>
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                gutterBottom
                sx={{ 
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Zenith ERP
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                Empowering businesses across industries with comprehensive ERP solutions. 
                Trusted by 500+ organizations worldwide.
              </Typography>
              
              {/* Location Info */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <LocationIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Our Location
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ fontWeight: 500 }}>
                    Pune, India
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: 'primary.light' }}>
              Product
            </Typography>
            <Stack spacing={1}>
              {footerLinks.product.map((link) => (
                <Link
                  key={link.path}
                  component="button"
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: 'primary.light' }}>
              Legal
            </Typography>
            <Stack spacing={1}>
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.path}
                  component="button"
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={6} lg={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: 'primary.light' }}>
              Contact
            </Typography>
            <Stack spacing={1.5}>
              {contactInfo.map((info, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'rgba(25,118,210,0.2)',
                      color: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {info.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {info.label}
                    </Typography>
                    {info.link ? (
                      <Link
                        href={info.link}
                        target={info.link.startsWith('http') ? '_blank' : undefined}
                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        sx={{
                          color: 'white',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          '&:hover': {
                            color: 'primary.light',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {info.value}
                      </Link>
                    ) : (
                      <Typography variant="body2" color="white">
                        {info.value}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>

          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            py: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Zenith ERP. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Made with ❤️ for businesses worldwide
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
