import React, { useState, useEffect, useId } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Stack,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Cloud as CloudIcon,
  Build as BuildIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
  School as SchoolIcon,
  LocalHospital as HealthcareIcon,
  ShoppingCart as RetailIcon,
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  ContentCut as SalonIcon,
  Lightbulb as LightbulbIcon,
  Lock as LockIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  Flag as FlagIcon,
  Handshake as HandshakeIcon,
  Public as PublicIcon,
  PhoneIphone as PhoneIcon,
  AlternateEmail as EmailIcon,
  BarChart as ChartIcon,
  SmartToy as AiIcon,
  Tune as TuneIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  Hub as HubIcon,
  Payment as PaymentIcon,
  FormatQuote as QuoteIcon,
  Schedule as ScheduleIcon,
  SupportAgent as SupportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { expertBookingUrl } from '../utils/expertBooking';
import CustomServiceFormDialog from '../components/landing/CustomServiceFormDialog';
import LandingCard from '../components/landing/LandingCard';
import { darkSurface, darkText } from '../theme/landingSurfaces';

const FadeInOnScroll = ({ children, delay = 0 }) => {
  const reactId = useId();
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setIsVisible(true), delay * 100);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(reactId);
    if (element) {
      observer.observe(element);
      return () => observer.unobserve(element);
    }
    return undefined;
  }, [delay, prefersReducedMotion, reactId]);

  return (
    <Box
      id={reactId}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible || prefersReducedMotion ? 'none' : 'translateY(20px)',
        transition: prefersReducedMotion ? 'none' : 'all 0.6s ease-out'
      }}
    >
      {children}
    </Box>
  );
};

const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }) => {
  const reactId = useId();
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(end);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime = null;
          const animate = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(reactId);
    if (element) {
      observer.observe(element);
      return () => observer.unobserve(element);
    }
    return undefined;
  }, [end, duration, hasAnimated, prefersReducedMotion, reactId]);

  return (
    <Box id={reactId}>
      <Typography variant="h3" component="span" fontWeight={700} sx={{ color: '#00f2fe' }}>
        {prefix}{count.toLocaleString()}{suffix}
      </Typography>
    </Box>
  );
};

const About = () => {
  const navigate = useNavigate();
  const [consultOpen, setConsultOpen] = useState(false);

  const handleBookConsultation = (event) => {
    if (expertBookingUrl) return;
    event.preventDefault();
    setConsultOpen(true);
  };

  const stats = [
    { value: 500, suffix: '+', label: 'Organizations', icon: <BusinessIcon />, color: '#1976d2' },
    { value: 99.9, suffix: '%', label: 'Uptime', icon: <TrendingUpIcon />, color: '#4caf50' },
    { value: 24, suffix: '/7', label: 'Support', icon: <PeopleIcon />, color: '#ff9800' },
    { value: 5, suffix: '.0', label: 'Rated', icon: <StarIcon />, color: '#9c27b0' }
  ];

  const industries = [
    { name: 'Education', icon: <SchoolIcon />, color: '#2196f3', count: '25+' },
    { name: 'Pharmacy', icon: <HealthcareIcon />, color: '#4caf50', count: '30+' },
    { name: 'Retail', icon: <RetailIcon />, color: '#ff9800', count: '50+' },
    { name: 'Hotel', icon: <HotelIcon />, color: '#9c27b0', count: '15+' },
    { name: 'Restaurant', icon: <RestaurantIcon />, color: '#f44336', count: '40+' },
    { name: 'Salon', icon: <SalonIcon />, color: '#e91e63', count: '35+' }
  ];

  const features = [
    { title: 'Multi-Tenant Architecture', description: 'Isolated workspace for each business', icon: <CloudIcon />, color: '#1976d2' },
    { title: 'Role-Based Access Control', description: 'Granular permissions management', icon: <SecurityIcon />, color: '#4caf50' },
    { title: 'Real-Time Analytics', description: 'Live dashboards with actionable insights', icon: <TrendingUpIcon />, color: '#ff9800' },
    { title: 'Enterprise Security', description: 'Bank-level encryption and protection', icon: <SecurityIcon />, color: '#9c27b0' },
    { title: 'Scalable Infrastructure', description: 'Grows with your business needs', icon: <SpeedIcon />, color: '#2196f3' },
    { title: 'Custom Development', description: 'Tailored solutions for your requirements', icon: <BuildIcon />, color: '#ff5722' }
  ];

  const values = [
    { title: 'Innovation', description: 'Constantly evolving with latest technology', icon: <LightbulbIcon />, color: '#ffc107' },
    { title: 'Reliability', description: '99.9% uptime guarantee with robust infrastructure', icon: <LockIcon />, color: '#4facfe' },
    { title: 'Customer First', description: 'Your success is our priority', icon: <FavoriteIcon />, color: '#ef5350' },
    { title: 'Transparency', description: 'Clear pricing and open communication', icon: <VisibilityIcon />, color: '#00e676' }
  ];

  const outcomes = [
    { icon: <ScheduleIcon />, title: '2-4 week go-live', detail: 'Typical implementation for a single location, including GST-ready invoicing.' },
    { icon: <SupportIcon />, title: 'Under 4-hour SLA', detail: 'Business-hours support with a named onboarding specialist for the first 30 days.' },
    { icon: <SecurityIcon />, title: 'Isolated tenant data', detail: 'Role-based access, encrypted transport, and no shared phone numbers or mailboxes.' }
  ];

  const stories = [
    { quote: 'Billing that used to take two days now closes the same afternoon.', name: 'Operations lead', org: 'Regional pharmacy group' },
    { quote: 'Three campuses went live in under a month, with GST invoices from day one.', name: 'Administrator', org: 'Private education trust' },
    { quote: 'Front desk stopped juggling five spreadsheets. Support actually picks up.', name: 'General manager', org: 'Boutique hotel' }
  ];

  const missionItems = [
    { icon: <FlagIcon />, color: '#4facfe', title: 'Our Mission', desc: 'To democratize enterprise-grade software for every Indian business, regardless of size or industry, through affordable SaaS pricing and local language support.' },
    { icon: <VisibilityIcon />, color: '#00e676', title: 'Our Vision', desc: "To become India's most trusted multi-industry ERP platform by 2027, powering 10,000+ businesses across retail, education, healthcare, hospitality, and beyond." },
    { icon: <HandshakeIcon />, color: '#ffa726', title: 'Our Promise', desc: 'Zero hidden fees. White-glove onboarding. Real human support. We stay with you from your first setup to your 10,000th customer.' },
    { icon: <PublicIcon />, color: '#00f2fe', title: 'Made for India', desc: 'Built with GST compliance, Razorpay integration, Indian bank formats, and multi-language support from day one.' }
  ];

  const tenantFeatures = [
    { icon: <PhoneIcon />, color: '#00f2fe', title: 'Dedicated Phone Number', desc: 'Each Starter/Pro subscriber receives their own Twilio virtual number for SMS and WhatsApp: no shared numbers, no confusion.' },
    { icon: <EmailIcon />, color: '#4facfe', title: 'Custom Email Identity', desc: 'Send invoices and alerts from your own business email (for example, billing@yourschool.com), not a generic Zenith address.' },
    { icon: <LockIcon />, color: '#b388ff', title: 'Isolated Data Store', desc: "Every tenant's records, files, and reports are completely isolated. No cross-tenant data leakage." },
    { icon: <ChartIcon />, color: '#00e676', title: 'Live Usage Dashboard', desc: 'Track your SMS, WhatsApp, AI tokens, and storage in real time from your admin dashboard.' },
    { icon: <AiIcon />, color: '#ffc107', title: 'AI-Powered Inbox', desc: 'The Omnichannel Inbox uses OpenAI to auto-suggest replies across WhatsApp, SMS, and email.' },
    { icon: <TuneIcon />, color: '#ff7043', title: 'BYOK for Enterprise', desc: 'Large enterprises can connect their own Twilio, Meta, and SMTP accounts for unlimited usage under their own billing.' }
  ];

  const techStack = [
    { name: 'Django REST Framework', role: 'Backend API', icon: <StorageIcon /> },
    { name: 'React.js', role: 'Frontend UI', icon: <CodeIcon /> },
    { name: 'PostgreSQL', role: 'Database', icon: <StorageIcon /> },
    { name: 'Render.com', role: 'Cloud Hosting', icon: <CloudIcon /> },
    { name: 'Vercel', role: 'Frontend CDN', icon: <HubIcon /> },
    { name: 'Twilio', role: 'SMS and WhatsApp', icon: <PhoneIcon /> },
    { name: 'OpenAI', role: 'AI Intelligence', icon: <AiIcon /> },
    { name: 'Razorpay', role: 'Payments', icon: <PaymentIcon /> }
  ];

  const consultButtonSx = {
    bgcolor: '#ffa726',
    color: 'white',
    fontWeight: 700,
    '&:focus-visible': { outline: '3px solid #00f2fe', outlineOffset: 3 },
    '&:hover': { bgcolor: '#ff9800', transform: 'scale(1.05)' }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: darkSurface.page }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
        color: 'white',
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <FadeInOnScroll delay={0}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight={700}
              gutterBottom
              sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, textAlign: 'center' }}
            >
              About Zenith ERP
            </Typography>
          </FadeInOnScroll>
          <FadeInOnScroll delay={1}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                maxWidth: 800,
                mx: 'auto',
                opacity: 0.95,
                lineHeight: 1.7,
                mt: 2
              }}
            >
              Empowering businesses across six industries with comprehensive, cloud-based ERP solutions designed to streamline operations and drive growth.
            </Typography>
          </FadeInOnScroll>
        </Container>
      </Box>

      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ py: 6 }}>
        <FadeInOnScroll delay={0}>
          <Grid container spacing={4}>
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <LandingCard
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,242,254,0.15)'
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: stat.color, width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  <Typography variant="h6" sx={{ mt: 1, color: darkText.muted }}>
                    {stat.label}
                  </Typography>
                </LandingCard>
              </Grid>
            ))}
          </Grid>
        </FadeInOnScroll>
      </Container>

      <Box sx={{ background: darkSurface.section, py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <FadeInOnScroll delay={0}>
            <Typography variant="h3" component="h2" fontWeight={700} textAlign="center" gutterBottom sx={{ color: darkText.primary }}>
              Results our customers measure
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ mb: 6, maxWidth: 720, mx: 'auto', color: darkText.muted }}>
              One mission, proven in production: faster close, a named onboarding path, and support that answers.
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={4} sx={{ mb: 2 }}>
            {outcomes.map((item, index) => (
              <Grid item xs={12} md={4} key={item.title}>
                <FadeInOnScroll delay={index + 1}>
                  <LandingCard sx={{ p: 4, height: '100%' }}>
                    <Avatar sx={{ bgcolor: 'rgba(0,242,254,0.15)', color: '#00f2fe', mb: 2 }}>{item.icon}</Avatar>
                    <Typography variant="h6" fontWeight={700} sx={{ color: darkText.primary, mb: 1 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: darkText.muted, lineHeight: 1.8 }}>{item.detail}</Typography>
                  </LandingCard>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {stories.map((item, index) => (
              <Grid item xs={12} md={4} key={item.org}>
                <FadeInOnScroll delay={index + 1}>
                  <LandingCard sx={{ p: 3, height: '100%' }}>
                    <QuoteIcon sx={{ color: '#4facfe', mb: 1 }} />
                    <Typography variant="body1" sx={{ color: darkText.secondary, mb: 2, lineHeight: 1.7 }}>
                      {item.quote}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: darkText.primary }}>{item.name}</Typography>
                    <Typography variant="caption" sx={{ color: darkText.muted }}>{item.org}</Typography>
                  </LandingCard>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ background: darkSurface.sectionAlt, py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <FadeInOnScroll delay={0}>
            <Typography variant="h3" component="h2" fontWeight={700} textAlign="center" gutterBottom sx={{ color: darkText.primary }}>
              Industries We Serve
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ mb: 6, maxWidth: 700, mx: 'auto', color: darkText.muted }}>
              Comprehensive ERP solutions tailored to the unique needs of six major industries
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={3}>
            {industries.map((industry, index) => (
              <Grid item xs={6} sm={4} md={2} key={industry.name}>
                <FadeInOnScroll delay={index * 0.1}>
                  <LandingCard
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.05)',
                        boxShadow: `0 8px 24px ${industry.color}40`,
                        borderColor: industry.color
                      }
                    }}
                  >
                    <Avatar sx={{ bgcolor: industry.color, width: 56, height: 56, mx: 'auto', mb: 2 }}>
                      {industry.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: darkText.primary }}>
                      {industry.name}
                    </Typography>
                    <Chip label={industry.count} size="small" sx={{ bgcolor: industry.color, color: 'white' }} />
                  </LandingCard>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ background: darkSurface.page, py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <FadeInOnScroll delay={0}>
            <Typography variant="h3" component="h2" fontWeight={700} textAlign="center" gutterBottom sx={{ color: darkText.primary }}>
              Why Choose Zenith ERP?
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ mb: 6, maxWidth: 700, mx: 'auto', color: darkText.muted }}>
              Enterprise-grade features designed to transform your business operations
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <FadeInOnScroll delay={index * 0.1}>
                  <LandingCard
                    sx={{
                      p: 3,
                      height: '100%',
                      borderLeft: `4px solid ${feature.color}`,
                      '&:hover': {
                        transform: 'translateX(8px)',
                        boxShadow: `0 4px 20px ${feature.color}30`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: `${feature.color}20`, color: feature.color, mr: 2 }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600} sx={{ color: darkText.primary }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: darkText.muted }}>
                      {feature.description}
                    </Typography>
                  </LandingCard>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ background: darkSurface.section, py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <FadeInOnScroll delay={0}>
            <Typography variant="h3" component="h2" fontWeight={700} textAlign="center" gutterBottom sx={{ color: darkText.primary }}>
              Our Core Values
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={value.title}>
                <FadeInOnScroll delay={index * 0.1}>
                  <LandingCard sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                    <Avatar sx={{ bgcolor: `${value.color}22`, color: value.color, width: 56, height: 56, mx: 'auto', mb: 2 }}>
                      {value.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: darkText.primary }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: darkText.muted }}>
                      {value.description}
                    </Typography>
                  </LandingCard>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ py: 8 }}>
        <FadeInOnScroll delay={0}>
          <LandingCard sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)', color: 'white', border: 'none' }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Ready to Transform Your Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join 500+ organizations already using Zenith ERP to streamline operations
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={handleBookConsultation}
                href={expertBookingUrl || undefined}
                target={expertBookingUrl ? '_blank' : undefined}
                rel={expertBookingUrl ? 'noreferrer' : undefined}
                sx={consultButtonSx}
              >
                Book a free consultation
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:focus-visible': { outline: '3px solid #00f2fe', outlineOffset: 3 },
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Get Started Free
              </Button>
            </Stack>
          </LandingCard>
        </FadeInOnScroll>
      </Container>

      <Box sx={{ background: darkSurface.sectionAlt, py: 10, px: 2 }}>
        <Container maxWidth="lg">
          <FadeInOnScroll delay={0}>
            <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ color: darkText.primary, mb: 2 }}>
              Our Mission and Vision
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ color: darkText.muted, mb: 8, maxWidth: 700, mx: 'auto' }}>
              We are building the most accessible, powerful, and intelligent ERP platform for Indian businesses: from a pharmacy in a small town to a hotel chain in a metro city.
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={4}>
            {missionItems.map((item, i) => (
              <Grid item xs={12} md={3} key={item.title}>
                <FadeInOnScroll delay={i + 1}>
                  <LandingCard sx={{ p: 4, height: '100%', borderRadius: 3, textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: `${item.color}22`, color: item.color, width: 56, height: 56, mx: 'auto', mb: 2 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} sx={{ color: darkText.primary, mb: 1.5 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: darkText.muted, lineHeight: 1.8 }}>{item.desc}</Typography>
                  </LandingCard>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ background: darkSurface.sectionDeep, py: 10, px: 2 }}>
        <Container maxWidth="lg">
          <FadeInOnScroll delay={0}>
            <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ color: darkText.primary, mb: 2 }}>
              The SaaS Architecture Behind Zenith
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ color: darkText.muted, mb: 8, maxWidth: 700, mx: 'auto' }}>
              Every business that subscribes to Zenith ERP gets a fully isolated, independently configurable environment. Here is what every tenant gets:
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={4}>
            {tenantFeatures.map((item, i) => (
              <Grid item xs={12} sm={6} md={4} key={item.title}>
                <FadeInOnScroll delay={i + 1}>
                  <LandingCard sx={{ p: 3, height: '100%', background: darkSurface.cardMuted, border: `1px solid ${item.color}33`, borderRadius: 3 }}>
                    <Avatar sx={{ bgcolor: `${item.color}22`, color: item.color, mb: 1.5 }}>{item.icon}</Avatar>
                    <Typography variant="h6" fontWeight={700} sx={{ color: item.color, mb: 1 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: darkText.muted, lineHeight: 1.8 }}>{item.desc}</Typography>
                  </LandingCard>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ background: darkSurface.sectionAlt, py: 10, px: 2 }}>
        <Container maxWidth="lg">
          <FadeInOnScroll delay={0}>
            <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ color: darkText.primary, mb: 2 }}>
              Enterprise-Grade Technology Stack
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ color: darkText.faint, mb: 8, maxWidth: 600, mx: 'auto' }}>
              Built on proven, battle-tested technologies trusted by the world's top companies.
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={3} justifyContent="center">
            {techStack.map((tech, i) => (
              <Grid item xs={6} sm={4} md={3} key={tech.name}>
                <FadeInOnScroll delay={i + 1}>
                  <LandingCard sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                    <Box sx={{ color: '#00f2fe', mb: 1, display: 'flex', justifyContent: 'center' }}>{tech.icon}</Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: darkText.primary }}>{tech.name}</Typography>
                    <Chip label={tech.role} size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.08)', color: darkText.muted }} />
                  </LandingCard>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)', py: 10, px: 2 }}>
        <Container maxWidth="md">
          <FadeInOnScroll delay={0}>
            <LandingCard sx={{ p: { xs: 4, md: 8 }, textAlign: 'center', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', borderRadius: 4, border: 'none' }}>
              <Typography variant="h3" fontWeight={800} gutterBottom>Need a Custom ERP or CRM?</Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                We build fully custom ERP and CRM platforms tailored to your exact workflow. Trusted by hospitals, retail chains, educational institutions, and more.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowIcon />}
                  onClick={() => setConsultOpen(true)}
                  sx={{ ...consultButtonSx, px: 4, py: 1.5 }}
                >
                  Book a free consultation
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/pricing')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    '&:focus-visible': { outline: '3px solid #00f2fe', outlineOffset: 3 },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  View Pricing
                </Button>
              </Stack>
            </LandingCard>
          </FadeInOnScroll>
        </Container>
      </Box>

      <CustomServiceFormDialog open={consultOpen} onClose={() => setConsultOpen(false)} />
    </Box>
  );
};

export default About;
