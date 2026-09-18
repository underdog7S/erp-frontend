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
        <FeatureCard 
          icon={<ContactsIcon sx={{ fontSize: 50 }} />}
          title="Team Collaboration"
          desc="Leave internal notes on deals, tag team members, and set automated follow-up reminders directly inside the customer profile."
        />
        <FeatureCard 
          icon={<EmailIcon sx={{ fontSize: 50 }} />}
          title="Mass Broadcasting"
          desc="Send targeted WhatsApp and SMS marketing campaigns directly from your ERP to all your qualified leads."
        />
        <FeatureCard 
          icon={<SmartToyIcon sx={{ fontSize: 50 }} />}
          title="Advanced Analytics"
          desc="Generate complex revenue forecasting, team performance reports, and pipeline velocity charts."
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
        <FeatureCard 
          icon={<PhoneIphoneIcon sx={{ fontSize: 50 }} />}
          title="Push Notifications"
          desc="Re-engage your customers with automated push notifications for abandoned carts, upcoming appointments, and new offers."
        />
        <FeatureCard 
          icon={<StorefrontIcon sx={{ fontSize: 50 }} />}
          title="Offline Mode Support"
          desc="Crucial features remain accessible even when your staff or customers lose internet connection, syncing automatically when back online."
        />
        <FeatureCard 
          icon={<ContactsIcon sx={{ fontSize: 50 }} />}
          title="Biometric Security"
          desc="Secure your app with FaceID and TouchID integration, ensuring enterprise-grade protection for sensitive business data."
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
        <FeatureCard 
          icon={<WebIcon sx={{ fontSize: 50 }} />}
          title="Secure Role-Based Access"
          desc="Bank-grade security with granular permissions. Give exact levels of access to staff, managers, and external partners."
        />
        <FeatureCard 
          icon={<PublicIcon sx={{ fontSize: 50 }} />}
          title="Client Self-Service Portals"
          desc="Let your clients log in, view their invoices, track project progress, and upload documents securely 24/7."
        />
        <FeatureCard 
          icon={<DomainIcon sx={{ fontSize: 50 }} />}
          title="Third-Party Integrations"
          desc="We seamlessly connect your web portal to Zapier, Stripe, Twilio, QuickBooks, and any other API you rely on."
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
          title="Your Logo & Colors"
          desc="We replace all Zenith ERP branding with your logo, brand colors, and typography to ensure complete brand consistency."
        />
        <FeatureCard 
          icon={<DomainIcon sx={{ fontSize: 50 }} />}
          title="Custom Domains"
          desc="Host the ERP on your own domain (e.g., portal.yourcompany.com). Your clients will never know we exist."
        />
        <FeatureCard 
          icon={<StorefrontIcon sx={{ fontSize: 50 }} />}
          title="Reseller Opportunities"
          desc="Want to sell an ERP to your own clients? White-label our solution, set your own pricing, and keep 100% of the profits."
        />
        <FeatureCard 
          icon={<PaletteIcon sx={{ fontSize: 50 }} />}
          title="Custom App Store Listings"
          desc="We publish your mobile apps directly to the Apple App Store and Google Play under your own Apple/Google developer accounts."
        />
        <FeatureCard 
          icon={<DomainIcon sx={{ fontSize: 50 }} />}
          title="Dedicated Cloud Infrastructure"
          desc="Run your white-labeled instance on isolated, dedicated cloud instances for maximum data privacy and custom SLA guarantees."
        />
        <FeatureCard 
          icon={<StorefrontIcon sx={{ fontSize: 50 }} />}
          title="Tailored Onboarding"
          desc="Custom login screens, welcome emails, and automated onboarding sequences that match your specific business voice."
        />
      </Grid>
    </Container>
  </Box>
);
