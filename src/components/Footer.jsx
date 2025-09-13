import React from 'react';
import { Box, Link, Typography } from '@mui/material';

const Footer = () => (
  <Box sx={{ mt: 8, py: 3, bgcolor: '#f5f6fa', borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
    <Typography variant="body2" sx={{ mb: 1 }}>
      <Link href="/about" underline="hover" sx={{ mx: 1 }}>About</Link>
      <Link href="/faq" underline="hover" sx={{ mx: 1 }}>FAQ</Link>
      <Link href="/privacy" underline="hover" sx={{ mx: 1 }}>Privacy Policy</Link>
      <Link href="/terms" underline="hover" sx={{ mx: 1 }}>Terms & Conditions</Link>
      <Link href="/contact" underline="hover" sx={{ mx: 1 }}>Contact</Link>
    </Typography>
    <Typography variant="caption" color="text.secondary">
      © {new Date().getFullYear()} Zenith ERP. All rights reserved.
    </Typography>
  </Box>
);

export default Footer; 