import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, Stack } from '@mui/material';
import EnterpriseModules from '../components/landing/EnterpriseModules';
import CustomServiceFormDialog from '../components/landing/CustomServiceFormDialog';
import ContactsIcon from '@mui/icons-material/Contacts';
import EmailIcon from '@mui/icons-material/Email';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import WebIcon from '@mui/icons-material/Web';
import DomainIcon from '@mui/icons-material/Domain';
import PaletteIcon from '@mui/icons-material/Palette';
import PublicIcon from '@mui/icons-material/Public';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SchoolIcon from '@mui/icons-material/School';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import { MEGA_NAV } from '../data/megaNavData';

// One icon per item key, shared across every product page's card grid.
const ICONS = {
  'business-website': <WebIcon sx={{ fontSize: 50 }} />,
  'ecommerce': <StorefrontIcon sx={{ fontSize: 50 }} />,
  'web-portal': <DomainIcon sx={{ fontSize: 50 }} />,
  'client-portal': <PublicIcon sx={{ fontSize: 50 }} />,
  'ios-android': <PhoneIphoneIcon sx={{ fontSize: 50 }} />,
  'booking-apps': <StorefrontIcon sx={{ fontSize: 50 }} />,
  'erp-sync': <ContactsIcon sx={{ fontSize: 50 }} />,
  'push-notifications': <PhoneIphoneIcon sx={{ fontSize: 50 }} />,
  'business-gtm': <RocketLaunchIcon sx={{ fontSize: 50 }} />,
  'sales-plan': <TrendingUpIcon sx={{ fontSize: 50 }} />,
  'free-consultation': <EventAvailableIcon sx={{ fontSize: 50 }} />,
  'pipelines': <ContactsIcon sx={{ fontSize: 50 }} />,
  'inbox': <EmailIcon sx={{ fontSize: 50 }} />,
  'ai-scoring': <SmartToyIcon sx={{ fontSize: 50 }} />,
  'analytics': <SmartToyIcon sx={{ fontSize: 50 }} />,
  'white-label': <PaletteIcon sx={{ fontSize: 50 }} />,
  'custom-erp': <DomainIcon sx={{ fontSize: 50 }} />,
  'education': <SchoolIcon sx={{ fontSize: 50 }} />,
  'pharmacy': <LocalPharmacyIcon sx={{ fontSize: 50 }} />,
  'retail': <ShoppingCartIcon sx={{ fontSize: 50 }} />,
  'hotel': <HotelIcon sx={{ fontSize: 50 }} />,
  'restaurant': <RestaurantIcon sx={{ fontSize: 50 }} />,
  'salon': <ContentCutIcon sx={{ fontSize: 50 }} />,
};

const FeatureCard = ({ icon, item, expanded }) => (
  <Grid item xs={12} md={expanded ? 12 : 4}>
    <Card sx={{
      height: '100%',
      bgcolor: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)',
      border: expanded ? '1px solid rgba(0,242,254,0.4)' : '1px solid rgba(255,255,255,0.1)',
      transition: 'transform 0.3s, border-color 0.3s',
      '&:hover': { transform: 'translateY(-5px)', borderColor: '#00f2fe' }
    }}>
      <CardContent sx={{ p: expanded ? 6 : 4 }}>
        <Box sx={{ color: '#00f2fe', mb: 2 }}>{icon}</Box>
        <Typography variant={expanded ? 'h4' : 'h5'} fontWeight="bold" color="white" gutterBottom>
          {item.label}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: expanded ? 700 : 'none' }}>
          {item.description}
        </Typography>

        {expanded && (
          <Box sx={{ mt: 4, maxWidth: 700 }}>
            {item.deliverables?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#00f2fe', letterSpacing: 1 }}>What's included</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {item.deliverables.map((d) => (
                    <Box key={d} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ color: '#00e676', fontSize: 20, mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">{d}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {item.techStack?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#00f2fe', letterSpacing: 1 }}>Tech stack for this</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {item.techStack.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }} />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', mt: 3 }}>
              {item.timeline && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon sx={{ color: '#4facfe', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">{item.timeline}</Typography>
                </Box>
              )}
              {item.example && (
                <Button
                  component="a"
                  href={item.example.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  size="small"
                  sx={{ color: '#00f2fe', textTransform: 'none' }}
                >
                  See it live: {item.example.name}
                </Button>
              )}
            </Box>
          </Box>
        )}
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

// Shared card-grid body for the ZenWeb/ZenApp/ZenConsult/ZenCRM product
// pages: reads its content from megaNavData (the same data the nav dropdown
// uses, so the two never drift apart) and supports `?focus=<item-key>` -
// arriving via a dropdown sub-item click shows just that one card, expanded,
// with a link back to the full list.
const ProductGrid = ({ sectionKey, onBookConsultation, hideInGrid = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const focus = searchParams.get('focus');
  const section = MEGA_NAV.find((s) => s.key === sectionKey);
  if (!section) return null;

  // `hideInGrid` keeps items out of the default (unfocused) grid only - a
  // dropdown click with `?focus=<key>` still shows that item's full card.
  // Used on /erp so the 6 industry verticals aren't listed twice (they
  // already have their own richer grid via EnterpriseModules above).
  const items = focus
    ? section.items.filter((i) => i.key === focus)
    : section.items.filter((i) => !hideInGrid.includes(i.key));
  const showBackLink = Boolean(focus) && items.length > 0;

  return (
    <Container maxWidth="lg">
      {showBackLink && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setSearchParams({})}
          sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, textTransform: 'none' }}
        >
          See everything {section.label} does
        </Button>
      )}
      <Grid container spacing={4}>
        {items.map((item) => (
          <FeatureCard
            key={item.key}
            icon={ICONS[item.key] || <WebIcon sx={{ fontSize: 50 }} />}
            item={item}
            expanded={showBackLink}
          />
        ))}
      </Grid>
      {section.key === 'zenconsult' && !focus && onBookConsultation && (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onBookConsultation}
            sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'black', fontWeight: 800, px: 5, py: 1.5, borderRadius: 2 }}
          >
            Book your free consultation
          </Button>
        </Box>
      )}
    </Container>
  );
};

export const PublicERP = () => (
  <Box sx={{ pt: 4, minHeight: '100vh', bgcolor: '#0a0a0f' }}>
    <PageHero
      title="Zen ERP"
      highlight="Modules"
      subtitle="Purpose-built operating systems for your specific industry. Manage inventory, staff, and sales in one unified platform."
    />
    <EnterpriseModules />
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg" sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="overline" sx={{ color: '#b388ff', letterSpacing: 2, fontWeight: 700 }}>
          Beyond the standard verticals
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
          Custom ERP & White Label
        </Typography>
      </Container>
      <ProductGrid sectionKey="zenerp" hideInGrid={['education', 'pharmacy', 'retail', 'hotel', 'restaurant', 'salon']} />
    </Box>
  </Box>
);

export const PublicCRM = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 10 }}>
    <PageHero
      title="Zen"
      highlight="CRM"
      subtitle="The ultimate Omnichannel Customer Relationship Management tool. Close deals faster with AI-powered automations."
    />
    <ProductGrid sectionKey="zencrm" />
  </Box>
);

export const PublicApp = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 10 }}>
    <PageHero
      title="Zen App"
      highlight="Development"
      subtitle="Native, high-performance mobile applications built specifically for your business and deeply integrated with your ERP."
    />
    <ProductGrid sectionKey="zenapp" />
  </Box>
);

export const PublicWeb = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 10 }}>
    <PageHero
      title="Zen Web"
      highlight="Portals"
      subtitle="Lightning-fast, highly scalable Web Portals and Administrative Dashboards for your staff and clients."
    />
    <ProductGrid sectionKey="zenweb" />
  </Box>
);

export const PublicConsult = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', pb: 10 }}>
      <PageHero
        title="Zen"
        highlight="Consult"
        subtitle="Strategy and go-to-market help from people who also build the software — so the plan is one you can actually execute."
      />
      <ProductGrid sectionKey="zenconsult" onBookConsultation={() => setDialogOpen(true)} />
      <CustomServiceFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
};

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
          desc="We replace all ZenVerse branding with your logo, brand colors, and typography to ensure complete brand consistency."
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
