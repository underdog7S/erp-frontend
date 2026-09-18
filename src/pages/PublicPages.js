import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import EnterpriseModules from '../components/landing/EnterpriseModules';
import ContactsIcon from '@mui/icons-material/Contacts';
import EmailIcon from '@mui/icons-material/Email';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import WebIcon from '@mui/icons-material/Web';
import DomainIcon from '@mui/icons-material/Domain';
import PaletteIcon from '@mui/icons-material/Palette';
import PublicIcon from '@mui/icons-material/Public';
import StorefrontIcon from '@mui/icons-material/Storefront';

const FeatureCard = ({ icon, title, desc }) => (
  <Grid item xs={12} md={4}>
    <Card sx={{ 
      height: '100%', 
      bgcolor: 'rgba(255,255,255,0.03)', 
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'transform 0.3s, border-color 0.3s',
      '&:hover': { transform: 'translateY(-5px)', borderColor: '#00f2fe' }
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ color: '#00f2fe', mb: 2 }}>{icon}</Box>
        <Typography variant="h5" fontWeight="bold" color="white" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {desc}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

const PageHero = ({ title, highlight, subtitle }) => (
  <Box sx={{ textAlign: 'center', pt: 15, pb: 8 }}>
    <Typography variant="h1" fontWeight="900" sx={{ color: 'white', textShadow: '0 0 20px rgba(0,242,254,0.3)', mb: 2, fontSize: {xs: '3rem', md: '4.5rem'} }}>
      {title} <span style={{ color: '#00f2fe' }}>{highlight}</span>
    </Typography>
    <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', px: 2 }}>
      {subtitle}
    </Typography>
  </Box>
);

export const PublicERP = () => (
  <Box sx={{ pt: 4, minHeight: '100vh', bgcolor: '#0a0a0f' }}>
    <PageHero 
      title="Zen ERP" 
      highlight="Modules" 
      subtitle="Purpose-built operating systems for your specific industry. Manage inventory, staff, and sales in one unified platform."
    />
    <EnterpriseModules />
  </Box>
);

export const PublicCRM = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 10 }}>
    <PageHero 
      title="Zen" 
      highlight="CRM" 
      subtitle="The ultimate Omnichannel Customer Relationship Management tool. Close deals faster with AI-powered automations."
    />
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <FeatureCard 
          icon={<ContactsIcon sx={{ fontSize: 50 }} />}
          title="Smart Lead Pipelines"
          desc="Visualize your sales funnel with drag-and-drop Deal stages. Automatically track probabilities and expected close dates."
        />
        <FeatureCard 
          icon={<EmailIcon sx={{ fontSize: 50 }} />}
          title="Omnichannel Inbox"
          desc="Reply to WhatsApp, SMS, and Email from a single unified chat interface. No more jumping between different applications."
        />
        <FeatureCard 
          icon={<SmartToyIcon sx={{ fontSize: 50 }} />}
          title="AI Virtual SDR"
          desc="Our integrated AI reads customer sentiment and automatically creates Hot Leads in your pipeline when it detects buying intent."
        />
      </Grid>
    </Container>
  </Box>
);

export const PublicApp = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 10 }}>
    <PageHero 
      title="Zen App" 
      highlight="Development" 
      subtitle="Native, high-performance mobile applications built specifically for your business and deeply integrated with your ERP."
    />
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <FeatureCard 
          icon={<PhoneIphoneIcon sx={{ fontSize: 50 }} />}
          title="iOS & Android Native"
          desc="Cross-platform excellence. We build beautiful, responsive apps that feel right at home on both Apple and Android devices."
        />
        <FeatureCard 
          icon={<StorefrontIcon sx={{ fontSize: 50 }} />}
          title="Customer Booking Apps"
          desc="Give your customers the power to book appointments, buy products, and track orders directly from their phones."
        />
        <FeatureCard 
          icon={<ContactsIcon sx={{ fontSize: 50 }} />}
          title="Real-Time ERP Sync"
          desc="Everything your customers do on the mobile app instantly syncs with your ZenVerse ERP Dashboard and live inventory."
        />
      </Grid>
    </Container>
  </Box>
);

export const PublicWeb = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 10 }}>
    <PageHero 
      title="Zen Web" 
      highlight="Portals" 
      subtitle="Lightning-fast, highly scalable Web Portals and Administrative Dashboards for your staff and clients."
    />
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <FeatureCard 
          icon={<WebIcon sx={{ fontSize: 50 }} />}
          title="Modern Architecture"
          desc="Built on React and Django. Your web portal will be secure, lightning fast, and capable of handling millions of requests."
        />
        <FeatureCard 
          icon={<PublicIcon sx={{ fontSize: 50 }} />}
          title="SEO Optimized"
          desc="If you need a public-facing e-commerce or landing page, our architecture ensures maximum visibility on Google and Bing."
        />
        <FeatureCard 
          icon={<DomainIcon sx={{ fontSize: 50 }} />}
          title="Custom Admin Dashboards"
          desc="Need specialized analytics? We can build custom web dashboards tailored to exactly how your management team operates."
        />
      </Grid>
    </Container>
  </Box>
);

export const PublicWhiteLabel = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 10 }}>
    <PageHero 
      title="White Label" 
      highlight="Solutions" 
      subtitle="Make ZenVerse your own. Resell our powerful software under your own brand, domain, and company colors."
    />
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <FeatureCard 
          icon={<PaletteIcon sx={{ fontSize: 50 }} />}
          title="100% Your Branding"
          desc="We strip out every mention of 'ZenVerse'. Your clients will only see your logo, your business name, and your color scheme."
        />
        <FeatureCard 
          icon={<DomainIcon sx={{ fontSize: 50 }} />}
          title="Custom Domains"
          desc="Host the entire ERP on 'erp.yourcompany.com'. Your clients will log in through your own secure, custom URL."
        />
        <FeatureCard 
          icon={<EmailIcon sx={{ fontSize: 50 }} />}
          title="Branded Communications"
          desc="All system emails, invoices, and WhatsApp messages will be sent from your custom email domains and business numbers."
        />
      </Grid>
    </Container>
  </Box>
);
