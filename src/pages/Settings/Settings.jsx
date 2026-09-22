import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';

const settingsSections = [
  {
    title: 'BYOK Integrations',
    description: 'Connect your own SMS, WhatsApp, Email SMTP, and OpenAI API keys.',
    icon: <IntegrationInstructionsIcon sx={{ fontSize: 40 }} />,
    color: '#4facfe',
    path: '/settings/integrations',
  },
  {
    title: 'Billing & Plans',
    description: 'View your current plan, add-ons, and upgrade options.',
    icon: <PaymentIcon sx={{ fontSize: 40 }} />,
    color: '#00e676',
    path: '/settings/billing',
  },
  {
    title: 'Public Branding',
    description: 'Customize your tenant logo, company name, and public-facing settings.',
    icon: <TuneIcon sx={{ fontSize: 40 }} />,
    color: '#ff9800',
    path: '/admin/public-settings',
  },
  {
    title: 'Security',
    description: 'Role-based access control, user management, and permission settings.',
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    color: '#f44336',
    path: '/admin',
  },
];

const Settings = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#080810', pt: 6, pb: 10 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            mb: 1,
            background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 6 }}>
          Configure your ZenERP workspace, integrations, and security.
        </Typography>

        <Grid container spacing={4}>
          {settingsSections.map((section) => (
            <Grid item xs={12} sm={6} key={section.title}>
              <Card
                onClick={() => navigate(section.path)}
                sx={{
                  p: 2,
                  height: '100%',
                  cursor: 'pointer',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderLeft: `4px solid ${section.color}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${section.color}30`,
                    borderColor: section.color,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ color: section.color, mb: 2 }}>{section.icon}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {section.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(section.path)}
                    sx={{ color: section.color, borderColor: section.color }}
                  >
                    Open →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Settings;
