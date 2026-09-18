import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import EnterpriseModules from '../components/landing/EnterpriseModules';

const PlaceholderPage = ({ title, description }) => (
  <Box sx={{ pt: 15, pb: 10, minHeight: '100vh', bgcolor: '#0a0a0f', color: 'white' }}>
    <Container maxWidth="lg">
      <Typography variant="h2" fontWeight="bold" sx={{ color: '#00f2fe', mb: 3 }}>
        {title}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {description}
      </Typography>
      <Typography variant="body1" sx={{ mt: 5 }}>
        This page is currently under construction. Please check back soon for full details!
      </Typography>
    </Container>
  </Box>
);

export const PublicERP = () => (
  <Box sx={{ pt: 12, minHeight: '100vh', bgcolor: '#0a0a0f' }}>
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h1" fontWeight="900" sx={{ color: 'white', textShadow: '0 0 20px rgba(0,242,254,0.3)', mb: 2 }}>
        Zen ERP <span style={{ color: '#00f2fe' }}>Modules</span>
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
        Purpose-built operating systems for your specific industry. Manage inventory, staff, and sales in one unified platform.
      </Typography>
    </Box>
    <EnterpriseModules />
  </Box>
);

export const PublicCRM = () => <PlaceholderPage title="Zen CRM" description="Powerful Lead management, Deals tracking, and Omnichannel Email & WhatsApp Marketing Pipelines." />;
export const PublicApp = () => <PlaceholderPage title="Zen App Development" description="We build custom, high-performance Mobile Applications for iOS and Android tailored to your business needs." />;
export const PublicWeb = () => <PlaceholderPage title="Zen Web Portals" description="Lightning-fast, highly scalable Web Portals and Administrative Dashboards." />;
export const PublicWhiteLabel = () => <PlaceholderPage title="White Labeling Solutions" description="Host ZenVerse on your own custom domain, with your own branding, logos, and color schemes." />;
