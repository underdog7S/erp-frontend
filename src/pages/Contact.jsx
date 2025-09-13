import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Contact = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
    <Typography variant="h3" color="primary" gutterBottom>Contact Us</Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      We're here to help. Reach out to us with any questions or issues.
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <EmailIcon color="secondary" sx={{ mr: 1 }} />
      <Typography variant="body1">support@zenitherp.com</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <LanguageIcon color="secondary" sx={{ mr: 1 }} />
      <Link href="https://zenitherp.com" target="_blank" rel="noopener" underline="hover">https://zenitherp.com</Link>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <AccessTimeIcon color="secondary" sx={{ mr: 1 }} />
      <Typography variant="body1">Support Hours: Monday to Saturday, 9 AM – 6 PM IST</Typography>
    </Box>
  </Box>
);

export default Contact; 