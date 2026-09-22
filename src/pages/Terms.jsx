import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  Payment as PaymentIcon,
  Cloud as CloudIcon,
  Build as BuildIcon
} from '@mui/icons-material';

const Terms = () => {
  const sections = [
    {
      icon: <AccountIcon />,
      title: 'Account Registration & Usage',
      content: [
        'By registering for ZenERP, you agree to provide accurate, current, and complete information during registration.',
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
        'You must be at least 18 years old to use our services or have parental consent if under 18.',
        'You agree to notify us immediately of any unauthorized use of your account or any other breach of security.',
        'Each account is intended for a single organization. Sharing accounts across multiple unrelated businesses is prohibited.'
      ]
    },
    {
      icon: <PaymentIcon />,
      title: 'Payment Terms & Billing',
      content: [
        'All paid plans are billed in advance on an annual or monthly basis, as selected during subscription.',
        'Payment is processed securely through our payment gateway partner (Razorpay).',
        'Prices are subject to change with 30 days prior notice. Existing subscriptions will continue at the current rate until renewal.',
        'Auto-renewal is enabled by default. You can disable it from your account settings.',
        'If payment fails, we will attempt to charge again. After multiple failed attempts, your subscription may be suspended.',
        'Refunds are available within 30 days of initial subscription as per our Refund Policy.',
        'No refunds are provided for partial usage periods after the initial refund window.'
      ]
    },
    {
      icon: <CloudIcon />,
      title: 'Service Availability & Uptime',
      content: [
        'We strive to maintain 99.9% uptime but do not guarantee uninterrupted service.',
        'Scheduled maintenance will be announced in advance via email or in-app notifications.',
        'We reserve the right to suspend or terminate service for maintenance, security, or legal reasons.',
        'Your data is automatically backed up daily. We maintain backups for 30 days.',
        'ZenERP is provided "as-is" without warranties of any kind, express or implied.',
        'We are not liable for any loss of data, revenue, or business opportunities resulting from service interruptions.'
      ]
    },
    {
      icon: <SecurityIcon />,
      title: 'Data & Security',
      content: [
        'You retain full ownership of all data uploaded to ZenERP.',
        'We implement industry-standard security measures including encryption, firewalls, and access controls.',
        'You are responsible for ensuring your data complies with applicable laws and regulations.',
        'We will not access, use, or disclose your data except as necessary to provide services or as required by law.',
        'In case of account termination, you can export your data for up to 90 days after termination.',
        'We comply with data protection regulations applicable to our service.'
      ]
    },
    {
      icon: <GavelIcon />,
      title: 'Acceptable Use Policy',
      content: [
        'You may not use ZenERP for any illegal, harmful, or fraudulent activities.',
        'You may not attempt to breach, hack, or disrupt our systems or services.',
        'You may not reverse engineer, decompile, or attempt to extract source code.',
        'You may not use automated tools to access our services without authorization (except official APIs).',
        'You may not upload malicious code, viruses, or content that violates intellectual property rights.',
        'Violation of these terms may result in immediate account suspension or termination without refund.'
      ]
    },
    {
      icon: <BuildIcon />,
      title: 'Modifications & Termination',
      content: [
        'We reserve the right to modify, suspend, or discontinue any part of the service at any time.',
        'Significant changes to service or pricing will be communicated with at least 30 days notice.',
        'You may terminate your subscription at any time from your account settings.',
        'We may terminate accounts that violate these terms or engage in fraudulent activities.',
        'Upon termination, access to your account will be disabled, but data export will be available for 90 days.',
        'All provisions that by their nature should survive termination will survive.'
      ]
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', py: 6 }}>
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Terms and Conditions
          </Typography>
          <Chip 
            label={`Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} 
            color="primary" 
            sx={{ mt: 2 }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3, lineHeight: 1.8 }}>
            Please read these Terms and Conditions carefully before using ZenERP. By accessing or using our services,
            you agree to be bound by these terms. If you do not agree to these terms, please do not use our services.
          </Typography>
        </Box>

        {/* Introduction */}
        <Card sx={{ mb: 4, p: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            1. Agreement to Terms
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.8 }}>
            These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "Customer", or "You") 
            and ZenVerse Tech Solutions ("Company", "We", "Us", or "Our") governing your use of our cloud-based Enterprise Resource Planning (ERP)
            software service, ZenERP. By registering, accessing, or using ZenERP, you acknowledge that you have read, understood, and agree
            to be bound by these Terms.
          </Typography>
        </Card>

        {/* Main Sections */}
        <Stack spacing={4}>
          {sections.map((section, index) => (
            <Card key={index} sx={{ p: 4, transition: 'all 0.3s ease', '&:hover': { boxShadow: 6 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
                  {section.icon}
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {index + 2}. {section.title}
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2}>
                {section.content.map((point, pointIndex) => (
                  <Box key={pointIndex} sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="primary.main" sx={{ mt: 0.5, fontWeight: 600 }}>
                      {pointIndex + 1}.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, flex: 1 }}>
                      {point}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          ))}
        </Stack>

        {/* Limitation of Liability */}
        <Card sx={{ mt: 4, p: 4, bgcolor: '#fff3cd', border: '1px solid #ffc107' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Limitation of Liability
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
            To the maximum extent permitted by law, ZenVerse Tech Solutions shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
            or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            Our total liability for any claims arising from or related to the use of our services shall not exceed the amount 
            you paid us in the 12 months preceding the claim.
          </Typography>
        </Card>

        {/* Contact Information */}
        <Card sx={{ mt: 4, p: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Questions About These Terms?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            If you have any questions regarding these Terms and Conditions, please contact us:
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            Email: support@zenitherp.online
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            By using ZenERP, you acknowledge that you have read and understood these Terms and agree to be bound by them.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default Terms;
