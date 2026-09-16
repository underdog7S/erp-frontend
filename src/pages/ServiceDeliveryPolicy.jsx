import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Grid
} from '@mui/material';
import {
  CloudDone as DeliveryIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  SupportAgent as SupportIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const ServiceDeliveryPolicy = () => {
  const deliveryFeatures = [
    {
      icon: <SpeedIcon />,
      title: 'Instant Access',
      description: 'Access your ERP system immediately after account activation. No waiting period or setup delays.'
    },
    {
      icon: <SecurityIcon />,
      title: 'Secure Deployment',
      description: 'Enterprise-grade cloud infrastructure ensures your data is secure and accessible 24/7.'
    },
    {
      icon: <ScheduleIcon />,
      title: '24/7 Availability',
      description: 'Our services are available round the clock with 99.9% uptime guarantee.'
    },
    {
      icon: <SupportIcon />,
      title: 'Quick Support',
      description: 'Receive support via email, chat, or phone based on your plan. Response times vary by plan level.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', py: 6 }}>
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Service Delivery Policy
          </Typography>
          <Chip 
            label={`Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} 
            color="primary" 
            sx={{ mt: 2 }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3, lineHeight: 1.8 }}>
            This policy outlines how Zenith ERP delivers its cloud-based services to customers, including service availability, 
            onboarding, support, and what you can expect from our service delivery.
          </Typography>
        </Box>

        {/* Service Activation */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <DeliveryIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Service Activation & Delivery
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Account Activation Timeline
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Typography variant="body1">
                  • <strong>Free Plan:</strong> Instant activation upon registration
                </Typography>
                <Typography variant="body1">
                  • <strong>Paid Plans:</strong> Immediate access after successful payment verification (typically within minutes)
                </Typography>
                <Typography variant="body1">
                  • <strong>Enterprise Plans:</strong> Account setup within 24-48 hours with dedicated onboarding support
                </Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Service Delivery Method
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Zenith ERP is delivered as a cloud-based Software-as-a-Service (SaaS) platform. You can access the service 
                immediately through any web browser or mobile device with an internet connection. No software installation, 
                downloads, or physical delivery is required.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Delivery Features */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom sx={{ mb: 4 }}>
            What You Get
          </Typography>
          <Grid container spacing={3}>
            {deliveryFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ p: 3, height: '100%', textAlign: 'center', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 } }}>
                  <Box sx={{ color: 'primary.main', mb: 2, fontSize: 48 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Service Availability */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <ScheduleIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Service Availability & Uptime
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Uptime Commitment
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                We maintain a 99.9% uptime guarantee for all paid plans. This means our service should be available 
                99.9% of the time, excluding scheduled maintenance windows.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Scheduled Maintenance
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                Maintenance windows are scheduled during low-usage hours and announced in advance:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1">• Regular maintenance: Typically Sundays 2 AM - 4 AM IST</Typography>
                <Typography variant="body1">• Advance notice: 48 hours via email and in-app notifications</Typography>
                <Typography variant="body1">• Duration: Usually 1-2 hours, rarely exceeding 4 hours</Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Service Interruptions
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                In the event of unexpected service interruptions, we will work to restore services as quickly as possible. 
                Enterprise plan customers receive priority notification and faster resolution times.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Support Delivery */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <SupportIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Support Delivery
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Free & Starter Plans
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <CheckIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Email Support
                  </Typography>
                  <Typography variant="body1">
                    <CheckIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Response Time: 24-48 hours
                  </Typography>
                  <Typography variant="body1">
                    <CheckIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Business Hours (Mon-Sat, 9 AM - 6 PM IST)
                  </Typography>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Pro & Business Plans
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <CheckIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Priority Email, Chat & Phone Support
                  </Typography>
                  <Typography variant="body1">
                    <CheckIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Response Time: 4-8 hours (Pro), 2-4 hours (Business)
                  </Typography>
                  <Typography variant="body1">
                    <CheckIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Extended Hours & 24/7 for Business Plan
                  </Typography>
                  <Typography variant="body1">
                    <CheckIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Dedicated Account Manager (Business Plan)
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Data Delivery */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Data Delivery & Export
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              • <strong>Real-Time Access:</strong> All your data is accessible in real-time through the web interface or API
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              • <strong>Export Options:</strong> Export your data in CSV, Excel, or PDF formats at any time from your account
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              • <strong>Backup Access:</strong> Daily automated backups ensure data availability even in case of accidental deletion
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              • <strong>Data Retention:</strong> After account cancellation, data remains accessible for export for 90 days
            </Typography>
          </Stack>
        </Card>

        {/* Contact */}
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <SupportIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Questions About Service Delivery?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Contact our support team for any questions about service delivery, activation, or availability:
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            Email: support@zenitherp.online
          </Typography>
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            Support Hours: Monday to Saturday, 9 AM - 6 PM IST
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default ServiceDeliveryPolicy;

