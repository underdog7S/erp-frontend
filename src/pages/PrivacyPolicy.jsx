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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Lock as LockIcon,
  Security as SecurityIcon,
  Cookie as CookieIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  CloudUpload as CloudIcon
} from '@mui/icons-material';

const PrivacyPolicy = () => {
  const dataCollectionPoints = [
    'Account registration information (name, email, company name)',
    'Payment and billing information (processed securely through Razorpay)',
    'Usage data and analytics (features used, login times, etc.)',
    'Technical data (IP address, browser type, device information)',
    'Content you upload (data, files, documents stored in your account)',
    'Communication records (support tickets, emails, feedback)'
  ];

  const dataUsage = [
    {
      title: 'Service Delivery',
      description: 'To provide, maintain, and improve our ERP services and features.'
    },
    {
      title: 'Account Management',
      description: 'To manage your account, process payments, and send service-related communications.'
    },
    {
      title: 'Customer Support',
      description: 'To respond to your inquiries, provide technical support, and resolve issues.'
    },
    {
      title: 'Security & Fraud Prevention',
      description: 'To detect, prevent, and address security issues, fraud, and abuse.'
    },
    {
      title: 'Analytics & Improvement',
      description: 'To analyze usage patterns and improve our services, features, and user experience.'
    },
    {
      title: 'Legal Compliance',
      description: 'To comply with legal obligations and respond to lawful requests from authorities.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', py: 6 }}>
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Privacy Policy
          </Typography>
          <Chip 
            label={`Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} 
            color="primary" 
            sx={{ mt: 2 }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3, lineHeight: 1.8 }}>
            At ZenVerse Tech Solutions, we are committed to protecting your privacy and ensuring the security of your personal and business data.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
          </Typography>
        </Box>

        {/* Introduction */}
        <Card sx={{ mb: 4, p: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Our Commitment to Your Privacy
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.8 }}>
            ZenVerse Tech Solutions ("we", "us", "our") respects your privacy and is committed to protecting your personal information.
            This policy applies to all users of our cloud-based ERP software services and describes how we collect, use, 
            and protect your information in accordance with applicable data protection laws.
          </Typography>
        </Card>

        {/* Information We Collect */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <CloudIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Information We Collect
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Personal and Business Information
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {dataCollectionPoints.map((point, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="primary.main" sx={{ mt: 0.5, fontWeight: 600 }}>
                  •
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, flex: 1 }}>
                  {point}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>

        {/* How We Use Your Information */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <VisibilityIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              How We Use Your Information
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            {dataUsage.map((usage, index) => (
              <Box key={index}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {usage.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {usage.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>

        {/* Data Security */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <SecurityIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Data Security
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
            We implement industry-standard security measures to protect your data:
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Encryption
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                All data in transit is encrypted using TLS/SSL. Data at rest is encrypted using AES-256 encryption.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Access Controls
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                We use role-based access control (RBAC) and multi-factor authentication to limit access to authorized personnel only.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Secure Infrastructure
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Our services are hosted on enterprise-grade cloud infrastructure with regular security audits and monitoring.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Regular Backups
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Your data is automatically backed up daily and retained for 30 days for disaster recovery purposes.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Cookies Policy */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <CookieIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Cookies and Tracking Technologies
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
            We use cookies and similar tracking technologies to:
          </Typography>
          <Stack spacing={1.5}>
            <Typography variant="body1">
              • <strong>Essential Cookies:</strong> Required for the website to function properly (authentication, session management)
            </Typography>
            <Typography variant="body1">
              • <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website
            </Typography>
            <Typography variant="body1">
              • <strong>Preference Cookies:</strong> Remember your settings and preferences
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.8 }}>
            You can control cookies through your browser settings. However, disabling certain cookies may limit your ability 
            to use some features of our services.
          </Typography>
        </Card>

        {/* Data Sharing */}
        <Card sx={{ mb: 4, p: 4, bgcolor: '#e3f2fd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <LockIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              Data Sharing and Disclosure
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            We Do NOT Sell Your Data
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
            We never sell, rent, or trade your personal or business data to third parties for marketing purposes.
          </Typography>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Limited Sharing
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
            We may share your information only in the following circumstances:
          </Typography>
          <Stack spacing={1.5}>
            <Typography variant="body1">
              • <strong>Service Providers:</strong> Trusted third-party service providers who assist in operating our services (e.g., payment processors, cloud hosting)
            </Typography>
            <Typography variant="body1">
              • <strong>Legal Requirements:</strong> When required by law, court order, or governmental authority
            </Typography>
            <Typography variant="body1">
              • <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with prior notice)
            </Typography>
            <Typography variant="body1">
              • <strong>With Your Consent:</strong> When you explicitly authorize us to share your information
            </Typography>
          </Stack>
        </Card>

        {/* Your Rights */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Your Privacy Rights
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
            You have the following rights regarding your personal information:
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Access and Portability
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                You can access and download your data at any time from your account settings or by contacting support.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Correction and Update
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                You can update your account information and data directly from your account dashboard.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Deletion
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                You can request deletion of your account and data. We will process deletion requests within 30 days, 
                subject to legal retention requirements.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Opt-Out
    </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                You can opt-out of marketing communications by clicking unsubscribe links in emails or adjusting preferences in your account.
    </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Contact */}
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <EmailIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Questions About Privacy?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            If you have questions, concerns, or wish to exercise your privacy rights, please contact us:
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            Email: support@zenitherp.online
          </Typography>
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            We will respond to your privacy-related inquiries within 30 days.
          </Typography>
        </Card>
      </Container>
  </Box>
);
};

export default PrivacyPolicy; 
