import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Stack,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
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
  ContentCut as SalonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Fade in on scroll component
const FadeInOnScroll = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 100);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`fade-${delay}`);
    if (element) {
      observer.observe(element);
      return () => observer.unobserve(element);
    }
  }, [delay]);

  return (
    <Box
      id={`fade-${delay}`}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease-out'
      }}
    >
      {children}
    </Box>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
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

    const element = document.getElementById(`counter-${end}`);
    if (element) {
      observer.observe(element);
      return () => observer.unobserve(element);
    }
  }, [end, duration, hasAnimated]);

  return (
    <Box id={`counter-${end}`}>
      <Typography variant="h3" component="span" fontWeight={700} color="primary">
        {prefix}{count.toLocaleString()}{suffix}
      </Typography>
    </Box>
  );
};

const About = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    { title: 'Innovation', description: 'Constantly evolving with latest technology', icon: '💡' },
    { title: 'Reliability', description: '99.9% uptime guarantee with robust infrastructure', icon: '🔒' },
    { title: 'Customer First', description: 'Your success is our priority', icon: '❤️' },
    { title: 'Transparency', description: 'Clear pricing and open communication', icon: '✨' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Hero Section */}
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

      {/* Stats Section */}
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ py: 6 }}>
        <FadeInOnScroll delay={0}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: stat.color, width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </FadeInOnScroll>
      </Container>

      {/* Mission & Vision */}
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FadeInOnScroll delay={0}>
              <Card sx={{ height: '100%', p: 4, bgcolor: 'rgba(255,255,255,0.03)', boxShadow: 3 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
                  To empower organizations of all sizes with intelligent, scalable ERP solutions that simplify complex operations, enhance productivity, and accelerate business growth.
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  We believe every business deserves enterprise-grade tools that are accessible, affordable, and easy to use.
                </Typography>
              </Card>
            </FadeInOnScroll>
          </Grid>
          <Grid item xs={12} md={6}>
            <FadeInOnScroll delay={1}>
              <Card sx={{ height: '100%', p: 4, bgcolor: 'rgba(255,255,255,0.03)', boxShadow: 3 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
                  To become the leading multi-industry ERP platform, trusted by thousands of businesses worldwide for innovation, reliability, and exceptional customer experience.
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  We envision a future where managing business operations is effortless, intuitive, and accessible to everyone.
                </Typography>
              </Card>
            </FadeInOnScroll>
          </Grid>
        </Grid>
      </Container>

      {/* Industries We Serve */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <FadeInOnScroll delay={0}>
            <Typography variant="h3" component="h2" fontWeight={700} textAlign="center" gutterBottom>
              Industries We Serve
            </Typography>
            <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
              Comprehensive ERP solutions tailored to the unique needs of six major industries
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={3}>
            {industries.map((industry, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <FadeInOnScroll delay={index * 0.1}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.05)',
                        boxShadow: 6,
                        bgcolor: `${industry.color}10`
                      }
                    }}
                  >
                    <Avatar sx={{ bgcolor: industry.color, width: 56, height: 56, mx: 'auto', mb: 2 }}>
                      {industry.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {industry.name}
                    </Typography>
                    <Chip label={industry.count} size="small" sx={{ bgcolor: industry.color, color: 'white' }} />
                  </Card>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Key Features */}
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ py: 8 }}>
        <FadeInOnScroll delay={0}>
          <Typography variant="h3" component="h2" fontWeight={700} textAlign="center" gutterBottom>
            Why Choose Zenith ERP?
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
            Enterprise-grade features designed to transform your business operations
          </Typography>
        </FadeInOnScroll>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FadeInOnScroll delay={index * 0.1}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    borderLeft: `4px solid ${feature.color}`,
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${feature.color}20`, color: feature.color, mr: 2 }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </FadeInOnScroll>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Core Values */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <FadeInOnScroll delay={0}>
            <Typography variant="h3" component="h2" fontWeight={700} textAlign="center" gutterBottom>
              Our Core Values
            </Typography>
          </FadeInOnScroll>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FadeInOnScroll delay={index * 0.1}>
                  <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h2" sx={{ mb: 2 }}>{value.icon}</Typography>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
    </Typography>
                  </Card>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ py: 8 }}>
        <FadeInOnScroll delay={0}>
          <Card sx={{ p: 6, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
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
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: '#ffa726',
                  color: 'white',
                  '&:hover': { bgcolor: '#ff9800', transform: 'scale(1.05)' }
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/contact')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Contact Sales
              </Button>
            </Stack>
          </Card>
        </FadeInOnScroll>
      </Container>
  </Box>
);
};

export default About; 
