import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitCustomServiceRequest } from '../services/api';
import SEO from '../components/SEO';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Check as CheckIcon,
  ArrowForward as ArrowIcon,
  School as SchoolIcon,
  LocalHospital as HealthcareIcon,
  ShoppingCart as ShoppingCartIcon,
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  Computer as ComputerIcon,
  CloudSync as CloudSyncIcon,
  Memory as MemoryIcon,
  Shield as ShieldIcon,
  Cloud as CloudIcon,
  Analytics as AnalyticsIcon,
  Support as SupportIcon,
  Lock as LockIcon,
  PlayArrow as PlayIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  Code as CodeIcon,
  PhoneAndroid as AppIcon,
  Web as WebIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

// Fade In Animation Component
const FadeInOnScroll = ({ children, delay = 0, direction = 'up' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const transforms = {
    up: isVisible ? 'translateY(0)' : 'translateY(30px)',
    down: isVisible ? 'translateY(0)' : 'translateY(-30px)',
    left: isVisible ? 'translateX(0)' : 'translateX(-30px)',
    right: isVisible ? 'translateX(0)' : 'translateX(30px)',
  };

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: transforms[direction],
        transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
      }}
    >
      {children}
    </Box>
  );
};

// Animated Counter
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '', label }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <Box ref={ref} sx={{ textAlign: 'center' }}>
      <Typography variant="h3" component="div" fontWeight={700} sx={{ 
        color: 'primary.main',
        mb: 1
      }}>
        {prefix}{count}{suffix}
      </Typography>
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
};

// Interactive Feature Dialog Component
const FeatureDialog = ({ open, onClose, feature }) => {
  if (!feature) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {feature.icon}
          <Typography variant="h5" fontWeight={700}>
            {feature.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {feature.description}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Key Benefits:
        </Typography>
        <List>
          {feature.benefits?.map((benefit, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText primary={benefit} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button 
          onClick={() => {
            onClose();
            window.location.href = '/register';
          }} 
          variant="contained"
          endIcon={<ArrowIcon />}
        >
          Get Started
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Upcoming Innovations
const FUTURE_FEATURES = [
  {
    title: 'Live Multi-Industry KPIs',
    description: 'Real-time widgets that highlight your schools, pharmacies, hotels, salons, and retail KPIs in one glance.',
    benefits: [
      'Auto-refreshing dashboards every 10 seconds',
      'Contextual drill-down by industry or tenant',
      'Alert badges for KPI thresholds'
    ],
    icon: <AnalyticsIcon fontSize="medium" />,
    color: '#1976d2',
    stats: 'Prototype phase'
  },
  {
    title: 'AI Operations Assistant',
    description: 'Conversational assistant that suggests next steps, highlights anomalies, and drafts contextual responses.',
    benefits: [
      'Natural language prompts for reports',
      'Smart follow-up recommendations',
      'Summaries exported to PDF or email'
    ],
    icon: <SupportIcon fontSize="medium" />,
    color: '#388e3c',
    stats: 'Building AI models'
  },
  {
    title: 'Immersive Onboarding Suite',
    description: 'Guided onboarding for new tenants with interactive tours, checklists, and quick setup actions.',
    benefits: [
      'Animated walkthroughs per industry',
      'Checklist automation & reminders',
      'Inline help videos and tooltips'
    ],
    icon: <PlayIcon fontSize="medium" />,
    color: '#f57c00',
    stats: 'UX research'
  }
];

// Interactive Module Card with Click
const InteractiveModuleCard = ({ module, index, onLearnMore }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { ref, tilt, onMouseMove, onMouseLeave } = useTilt();
  
  return (
    <Card 
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={(e) => {
        onMouseLeave();
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onClick={() => onLearnMore(module)}
      sx={{
        height: '100%',
        p: 0,
        position: 'relative',
        overflow: 'hidden',
        background: module.bgGradient,
        border: `2px solid ${module.primaryColor}20`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        transform: `perspective(1000px) rotateX(${tilt.x * 0.5}deg) rotateY(${tilt.y * 0.5}deg)`,
        '&:hover': {
          transform: `perspective(1000px) rotateX(${tilt.x * 0.5}deg) rotateY(${tilt.y * 0.5}deg) translateY(-8px) scale(1.02)`,
          boxShadow: `0 20px 60px ${module.primaryColor}40`,
          borderColor: module.primaryColor,
          '& .module-icon': {
            transform: 'scale(1.2) rotate(5deg)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          },
          '& .learn-more-btn': {
            opacity: 1,
            transform: 'translateY(0)'
          },
          '&::before': {
            opacity: 1
          }
        },
        '&::before': {
          content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${module.primaryColor}15 0%, ${module.accentColor}15 100%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        zIndex: 0
        }
      }}
    >
      {/* Industry Module Image */}
      <Box
        sx={{
          width: '100%',
          height: 200,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: `${module.primaryColor}10`
        }}
      >
        {/* Use default placeholder for industry modules since only 2 images provided */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${module.primaryColor}15`,
            flexDirection: 'column',
            display: 'flex',
            transition: 'background 0.3s ease',
            '&:hover': {
              bgcolor: `${module.primaryColor}25`
            }
          }}
        >
          <Box 
            className="module-icon"
            sx={{ 
              color: module.primaryColor, 
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}
          >
            {module.icon}
            <Typography variant="body2" sx={{ mt: 1, color: module.primaryColor, fontWeight: 500 }}>
              {module.title}
            </Typography>
          </Box>
        </Box>
        
        {/* Learn More Overlay */}
        <Box
          className="learn-more-btn"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: `${module.primaryColor}dd`,
            color: 'white',
            p: 1.5,
            textAlign: 'center',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Learn More <LaunchIcon sx={{ fontSize: 16, verticalAlign: 'middle', ml: 0.5 }} />
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ 
            bgcolor: `${module.primaryColor}15`,
            borderRadius: 2,
            p: 2,
            mr: 3,
            color: module.primaryColor
          }}>
            {module.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: module.primaryColor, mb: 0.5 }}>
              {module.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {module.subtitle}
            </Typography>
          </Box>
        </Box>

        <List dense sx={{ mb: 2 }}>
          {module.features.map((feature, idx) => (
            <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon sx={{ color: module.primaryColor, fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary={feature} 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: module.primaryColor }}>
            {module.stats}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {module.useCases.map((useCase, idx) => (
              <Chip 
                key={idx}
                label={useCase} 
                size="small" 
                sx={{ 
                  fontSize: '0.7rem',
                  bgcolor: `${module.primaryColor}15`,
                  color: module.primaryColor,
                  border: `1px solid ${module.primaryColor}30`,
                  '&:hover': {
                    bgcolor: `${module.primaryColor}25`,
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
          }}
        />
      ))}
    </Box>
        </Box>
      </Box>
    </Card>
  );
};

// Parallax Effect Component
const ParallaxBox = ({ children, speed = 0.5 }) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const parallax = scrolled * speed;
        setOffset(parallax);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <Box
      ref={ref}
      sx={{
        transform: `translateY(${offset}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </Box>
  );
};

// Tilt Effect Hook
const useTilt = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return {
    ref,
    tilt,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave
  };
};

// Interactive Core Feature Card
const InteractiveFeatureCard = ({ feature, index, onLearnMore }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { ref, tilt, onMouseMove, onMouseLeave } = useTilt();
  
  return (
    <Card 
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={(e) => {
        onMouseLeave();
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onClick={() => onLearnMore(feature)}
      sx={{
        height: '100%',
        p: 3,
        textAlign: 'center',
        border: '1px solid #e0e0e0',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        '&:hover': {
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px) scale(1.02)`,
          boxShadow: `0 20px 40px ${feature.color}40`,
          borderColor: feature.color,
          '& .feature-icon': {
            transform: 'scale(1.2) rotate(10deg)',
            color: feature.color,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
          },
          '& .feature-overlay': {
            opacity: 1
          },
          '& .feature-glow': {
            opacity: 0.3
          }
        }
      }}
    >
      {/* Glow Effect */}
      <Box
        className="feature-glow"
        sx={{
          position: 'absolute',
          top: -50,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${feature.color}40 0%, transparent 70%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}
      />
      <Box 
        className="feature-icon"
        sx={{ 
          color: feature.color, 
          mb: 2,
          transition: 'all 0.3s ease',
          display: 'inline-block',
          position: 'relative',
          zIndex: 1
        }}
      >
        {feature.icon}
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {feature.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {feature.description}
      </Typography>
      
      {/* Hover Overlay */}
      <Box
        className="feature-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: `${feature.color}08`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Button
          variant="contained"
          sx={{
            bgcolor: feature.color,
            '&:hover': {
              bgcolor: feature.color,
              transform: 'scale(1.05)'
            }
          }}
          endIcon={<InfoIcon />}
        >
          Learn More
        </Button>
      </Box>
    </Card>
  );
};

// Custom Service Request Dialog Component - Classic & Interactive
const CustomServiceFormDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    service_type: '',
    name: '',
    email: '',
    phone: '',
    company_name: '',
    description: '',
    budget_range: '',
    timeline: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hoveredField, setHoveredField] = useState(null);
  
  const totalSteps = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.service_type) newErrors.service_type = 'Please select a service type';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your requirements';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await submitCustomServiceRequest(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          service_type: '',
          name: '',
          email: '',
          phone: '',
          company_name: '',
          description: '',
          budget_range: '',
          timeline: ''
        });
        onClose();
      }, 2000);
    } catch (error) {
      // Error submitting request - snackbar will show message
      setErrors({ submit: error.response?.data?.errors || 'Failed to submit request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.service_type) {
        setErrors({ service_type: 'Please select a service type' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.name || !formData.email) {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email address';
        }
        setErrors(newErrors);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepColor = (step) => {
    if (step < currentStep) return 'success.main';
    if (step === currentStep) return 'primary.main';
    return 'grey.300';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
        position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <SettingsIcon sx={{ 
            fontSize: 32,
            animation: 'rotateIcon 3s ease-in-out infinite',
            '@keyframes rotateIcon': {
              '0%, 100%': { transform: 'rotate(0deg)' },
              '50%': { transform: 'rotate(10deg)' }
            }
          }} />
          <Typography variant="h5" fontWeight={700}>
            Request Custom Services
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'white',
            position: 'relative',
            zIndex: 1,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'rotate(90deg) scale(1.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Step Indicator */}
      {!success && (
        <Box sx={{ 
          bgcolor: '#f5f5f5', 
          px: 4, 
          py: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: getStepColor(step),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      transition: 'all 0.3s ease',
                      boxShadow: step === currentStep ? '0 4px 12px rgba(25,118,210,0.4)' : 'none',
                      transform: step === currentStep ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {step < currentStep ? <CheckIcon /> : step}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      display: { xs: 'none', sm: 'block' },
                      fontWeight: step === currentStep ? 600 : 400,
                      color: step <= currentStep ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    {step === 1 ? 'Service' : step === 2 ? 'Contact' : 'Details'}
                  </Typography>
                </Box>
                {step < totalSteps && (
                  <Box
                    sx={{
                      flex: 1,
                      height: 2,
                      mx: 1,
                      bgcolor: step < currentStep ? 'success.main' : 'grey.300',
                      transition: 'background 0.3s ease'
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}

      <DialogContent sx={{ p: 4, position: 'relative' }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
    <Box
      sx={{
                animation: 'successPulse 0.6s ease-out',
                '@keyframes successPulse': {
                  '0%': { transform: 'scale(0)' },
                  '50%': { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            </Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Request Submitted Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We'll contact you soon to discuss your requirements.
            </Typography>
            <Button 
              variant="contained" 
              onClick={onClose}
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Step 1: Service Type */}
            {currentStep === 1 && (
              <Box sx={{ 
                animation: 'slideInRight 0.4s ease-out'
              }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                  What service do you need?
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { value: 'customization', label: 'Customization', icon: <SettingsIcon />, color: '#4caf50', desc: 'Tailor ERP to your workflow' },
                    { value: 'web_development', label: 'Web Development', icon: <WebIcon />, color: '#2196f3', desc: 'Professional web applications' },
                    { value: 'app_development', label: 'App Development', icon: <AppIcon />, color: '#ff9800', desc: 'Mobile apps for iOS & Android' },
                    { value: 'both', label: 'Web + App', icon: <CodeIcon />, color: '#9c27b0', desc: 'Complete digital solution' },
                    { value: 'pc_applications', label: 'PC Applications', icon: <ComputerIcon />, color: '#1976d2', desc: 'Custom desktop applications for Windows, Linux, and macOS' },
                    { value: 'plc_programming', label: 'PLC Programming', icon: <SettingsIcon />, color: '#ff9800', desc: 'Industrial automation programming and control system development' },
                    { value: 'control_operation', label: 'Control & Operation', icon: <MemoryIcon />, color: '#1976d2', desc: 'Industrial control systems and operational automation solutions' }
                  ].map((service) => (
                    <Grid item xs={12} sm={6} key={service.value}>
                      <Card
                        onClick={() => {
                          setFormData(prev => ({ ...prev, service_type: service.value }));
                          setErrors(prev => ({ ...prev, service_type: '' }));
                          setTimeout(() => handleNext(), 300);
                        }}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          border: formData.service_type === service.value ? `3px solid ${service.color}` : '2px solid #e0e0e0',
                          bgcolor: formData.service_type === service.value ? `${service.color}10` : 'white',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
        '&:hover': {
                            transform: 'translateY(-4px) scale(1.02)',
                            boxShadow: `0 8px 24px ${service.color}40`,
                            borderColor: service.color,
                            '& .service-icon': {
                              transform: 'scale(1.2) rotate(5deg)',
                              color: service.color
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 4,
                            height: '100%',
                            bgcolor: service.color,
                            transform: 'scaleY(0)',
                            transition: 'transform 0.3s ease'
                          },
                          '&:hover::before': {
                            transform: 'scaleY(1)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box 
                            className="service-icon"
                            sx={{ 
                              color: service.color, 
                              transition: 'all 0.3s ease',
                              fontSize: '2.5rem'
                            }}
                          >
                            {service.icon}
    </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {service.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {service.desc}
                            </Typography>
                          </Box>
                        </Box>
                        {formData.service_type === service.value && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            color: service.color,
                            mt: 1,
                            opacity: 0,
                            animation: 'fadeInSelected 0.3s ease forwards'
                          }}>
                            <CheckIcon fontSize="small" />
                            <Typography variant="body2" fontWeight={600}>Selected</Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {errors.service_type && (
                  <Alert severity="error" sx={{ mt: 2 }}>{errors.service_type}</Alert>
                )}
              </Box>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <Box sx={{ 
                animation: 'slideInRight 0.4s ease-out'
              }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                  Tell us about yourself
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('name')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'name' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address *"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('email')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'email' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('phone')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'phone' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('company_name')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.company_name}
                      helperText={errors.company_name}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'company_name' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 3: Project Details */}
            {currentStep === 3 && (
              <Box sx={{ 
                animation: 'slideInRight 0.4s ease-out'
              }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                  Project Requirements
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Project Requirements *"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('description')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.description}
                      helperText={errors.description || `${formData.description.length}/20 characters minimum`}
                      required
                      placeholder="Describe your project requirements, features needed, target audience, etc..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: hoveredField === 'description' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.01)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Budget Range (Optional)"
                      name="budget_range"
                      value={formData.budget_range}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('budget')}
                      onBlur={() => setHoveredField(null)}
                      placeholder="e.g., ₹50k-1L, ₹1L-5L, ₹5L+"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'budget' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Expected Timeline (Optional)"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('timeline')}
                      onBlur={() => setHoveredField(null)}
                      placeholder="e.g., 1 month, 3 months, 6 months"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'timeline' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  {errors.submit && (
                    <Grid item xs={12}>
                      <Alert severity="error">{errors.submit}</Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button 
                onClick={currentStep === 1 ? onClose : handleBack}
                variant="outlined"
      sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(-4px)'
                  }
                }}
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<ArrowIcon />}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  Next Step
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6
                    },
                    '&:disabled': {
                      opacity: 0.6
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}
    </Box>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customServiceDialogOpen, setCustomServiceDialogOpen] = useState(false);
  const [futureFeatureDialog, setFutureFeatureDialog] = useState(null);

  // Professional color scheme based on color theory
  // Blue = Trust, Stability, Professionalism
  // Orange = Energy, Action, CTAs
  // Green = Growth, Success
  // Gray = Balance, Neutrality

  const industryModules = [
    {
      title: "Education Management",
      subtitle: "Complete Academic Solution",
      icon: <SchoolIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#1976d2", // Professional blue
      accentColor: "#42a5f5", // Light blue
      bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      features: [
        "Student Admission & Management",
        "Fee Structure & Payment Tracking",
        "Online Fee Payment via Razorpay",
        "Attendance System (Student & Staff)",
        "Report Cards & Grading",
        "Academic Reports & Analytics"
      ],
      stats: "25+ Schools",
      useCases: ["Schools", "Colleges", "Universities"]
    },
    {
      title: "Pharmacy Management",
      subtitle: "Complete Pharmacy Solution",
      icon: <HealthcareIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#7b1fa2", // Purple
      accentColor: "#ba68c8",
      bgGradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
      features: [
        "Medicine & Category Management",
        "Batch Tracking & Expiry Alerts",
        "Prescription Processing",
        "Sales & Billing System",
        "Online Payment via Razorpay",
        "Inventory Control & Analytics"
      ],
      stats: "30+ Pharmacies",
      useCases: ["Retail Pharmacies", "Hospital Pharmacies", "Chain Pharmacies"]
    },
    {
      title: "Retail & Wholesale",
      subtitle: "Multi-Warehouse Solution",
      icon: <ShoppingCartIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#1976d2", // Professional blue
      accentColor: "#42a5f5",
      bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      features: [
        "Multi-Warehouse Management",
        "Product Catalog & SKU Management",
        "Real-time Inventory Tracking",
        "Sales Management & POS",
        "Online Payment via Razorpay",
        "Advanced Inventory Analytics"
      ],
      stats: "50+ Stores",
      useCases: ["Retail Stores", "Wholesale Businesses", "Distribution"]
    },
    {
      title: "Hotel Management",
      subtitle: "Complete Hospitality Solution",
      icon: <HotelIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#f57c00", // Warm orange
      accentColor: "#ff9800",
      bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
      features: [
        "Room Type & Rate Management",
        "Booking & Reservation System",
        "Check-in & Check-out Management",
        "Online Payment via Razorpay",
        "Guest Registration & Records",
        "Occupancy Reports & Analytics"
      ],
      stats: "15+ Hotels",
      useCases: ["Hotels", "Resorts", "Guest Houses"]
    },
    {
      title: "Restaurant Management",
      subtitle: "Complete Dining Solution",
      icon: <RestaurantIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#d32f2f", // Red
      accentColor: "#ef5350",
      bgGradient: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
      features: [
        "Menu Category & Item Management",
        "Table Management & Seating",
        "Order Taking & Processing",
        "Online Payment via Razorpay",
        "Cloud Kitchen & External API Integration",
        "Kitchen Display System",
        "Sales & Revenue Reports"
      ],
      stats: "40+ Restaurants",
      useCases: ["Restaurants", "Cafes", "Food Courts"]
    },
    {
      title: "Salon Management",
      subtitle: "Beauty & Spa Solution",
      icon: <PersonIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#9c27b0", // Purple
      accentColor: "#ba68c8",
      bgGradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
      features: [
        "Service & Pricing Management",
        "Appointment Booking System",
        "Online Payment via Razorpay",
        "Stylist & Staff Management",
        "Customer Management",
        "Revenue & Performance Analytics"
      ],
      stats: "35+ Salons",
      useCases: ["Salons", "Spa Centers", "Beauty Parlors"]
    }
  ];

  const coreFeatures = [
    {
      title: "Multi-Tenant Architecture",
      description: "Isolated workspace for each business with dedicated data and users",
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2",
      benefits: [
        "Complete data isolation per tenant",
        "Custom branding for each organization",
        "Independent user management",
        "Secure data separation",
        "Multi-organization support"
      ]
    },
    {
      title: "Role-Based Access Control",
      description: "Granular permissions based on user roles and responsibilities",
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: "#388e3c",
      benefits: [
        "Admin, Manager, Staff, Student roles",
        "Feature-based permissions",
        "Industry-specific access control",
        "Audit trail & activity logs",
        "Custom role creation"
      ]
    },
    {
      title: "Real-Time Analytics",
      description: "Live dashboards with actionable insights and KPIs",
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: "#f57c00",
      benefits: [
        "Live statistics & KPIs",
        "Real-time data updates",
        "Performance metrics",
        "Alert system",
        "Exportable reports"
      ]
    },
    {
      title: "Cloud Infrastructure",
      description: "Secure, scalable cloud infrastructure with automatic backups",
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      color: "#7b1fa2",
      benefits: [
        "Automatic daily backups",
        "Infinite scalability",
        "99.9% uptime guarantee",
        "Global CDN support",
        "Disaster recovery"
      ]
    },
    {
      title: "Enterprise Security",
      description: "Bank-level encryption, SSL, and comprehensive security measures",
      icon: <LockIcon sx={{ fontSize: 40 }} />,
      color: "#283593", // Deep Indigo - Security, trust, protection (better than red)
      benefits: [
        "SSL/TLS encryption",
        "Secure data transmission",
        "Regular security audits",
        "GDPR compliance",
        "Data privacy protection"
      ]
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock support with priority assistance for all plans",
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      color: "#0097a7", // Teal/Cyan - Availability, service, support
      benefits: [
        "24/7 email support",
        "Priority support for paid plans",
        "Comprehensive documentation",
        "Video tutorials",
        "Dedicated account manager (Business plan)"
      ]
    },
    {
      title: "Razorpay Payment Integration",
      description: "Accept online payments seamlessly across all sectors with secure Razorpay integration",
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: "#e91e63", // Pink/Magenta - Payment, transactions, modern
      benefits: [
        "Secure online payment processing",
        "Tenant-specific payment gateway setup",
        "Multi-sector payment support (Education, Restaurant, Salon, Pharmacy, Retail, Hotel)",
        "Real-time payment verification",
        "Automatic payment status updates",
        "Webhook support for instant notifications"
      ]
    }
  ];

  const handleLearnMore = (feature) => {
    setSelectedFeature(feature);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFeature(null);
  };

  const benefits = [
    { 
      icon: <TrendingUpIcon />, 
      text: "Increase Efficiency by 40%",
      color: "#4caf50", // Green - Growth, success, productivity
      bgGradient: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
    },
    { 
      icon: <SpeedIcon />, 
      text: "Reduce Operational Costs",
      color: "#ff9800", // Orange - Energy, savings, value
      bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)"
    },
    { 
      icon: <VerifiedIcon />, 
      text: "Industry-Best Practices",
      color: "#2196f3", // Blue - Trust, professionalism, standards
      bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
    },
    { 
      icon: <ShieldIcon />, 
      text: "Bank-Level Security",
      color: "#3f51b5", // Indigo - Security, trust, protection
      bgGradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)"
    }
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('user');
  const currentPlan = (user && user.plan) ? String(user.plan).toLowerCase() : null;
  const hideFreePlan = !!user && !!currentPlan && currentPlan === 'free';
  // Hide pricing on home page unless user is logged in
  const hidePricing = !isAuthenticated;

const allPlans = [
  {
      name: "Free",
      description: "Perfect for getting started",
      price: 0,
      original_price: null,
    features: [
        "2 Users",
        "500 MB Storage",
        "1 Industry Module",
        "Email Support",
        "Core ERP Features",
        "Mobile Access"
      ]
    },
    {
      name: "Starter",
      description: "Ideal for growing businesses",
      price: 4500,
      original_price: 8000, // Marketing strategy: show original price
      popular: false,
    features: [
        "25 Users",
        "5 GB Storage",
        "1 Industry Module",
        "Priority Support",
        "Advanced Reports",
        "API Access"
      ]
    },
    {
      name: "Pro",
      description: "Perfect for established organizations",
      price: 8999,
      original_price: 15000, // Marketing strategy: show original price
      popular: true,
    features: [
        "100 Users",
        "20 GB Storage",
        "1 Industry Module",
        "API Access",
        "Advanced Analytics",
        "Custom Integrations"
      ]
    },
    {
      name: "Business",
      description: "Enterprise-grade solution",
      price: 19999,
      original_price: 30000, // Marketing strategy: show original price
    features: [
        "Unlimited Users",
        "50 GB Storage",
        "All Industry Modules",
        "24/7 Priority Support",
        "Dedicated Account Manager",
        "SLA Guarantee"
      ]
    }
  ];

  const plans = hideFreePlan ? allPlans.filter(p => p.name !== 'Free') : allPlans;

  // Add global animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'homepage-animations';
    if (document.getElementById('homepage-animations')) return;
    style.textContent = `
      @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
      }
      @keyframes buttonBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes slideInRight {
        0% { opacity: 0; transform: translateX(-20px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes fadeInSelected {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes successPulse {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes rotateIcon {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(10deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existing = document.getElementById('homepage-animations');
      if (existing) existing.remove();
    };
  }, []);

  return (
    <>
      <SEO
        title="Zenith ERP - Universal Cloud ERP Solution for Education, Pharmacy, Retail, Hotel & More"
        description="Empower your business with Zenith ERP - the universal cloud-based Enterprise Resource Planning solution. Streamline operations, automate workflows, and boost productivity across Education, Pharmacy, Retail, Hotel, Restaurant, and Salon industries. Free plan available. Start your digital transformation today!"
        keywords="ERP Software, Enterprise Resource Planning, Cloud ERP, Education ERP, School Management System, Pharmacy Management Software, Retail ERP, POS System, Hotel Management System, Restaurant Management Software, Salon Management, Multi-tenant SaaS, Business Management Software, Inventory Management, Accounting Software, HR Management, Free ERP, Affordable ERP India, Cloud-based ERP Solution, Digital Transformation, Business Automation"
        url="https://zenitherp.online"
        type="website"
      />
      <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
        {/* Hero Section - Professional Blue Gradient */}
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
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <FadeInOnScroll delay={0.2}>
                <Chip 
                  label="Trusted Multi-Tenant ERP Solution" 
                  sx={{ 
                    mb: 2,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </FadeInOnScroll>
              <FadeInOnScroll delay={0.3}>
                <Typography 
                  variant="h1" 
                  component="h1" 
                  fontWeight={700} 
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem', xl: '4.5rem' },
                    lineHeight: 1.2,
                    mb: 3
                  }}
                >
                  Empower Your Business with
                  <Box component="span" sx={{ display: 'block', color: '#ffa726', mt: 1 }}>
                    Universal ERP Solution
                  </Box>
                </Typography>
              </FadeInOnScroll>
              <FadeInOnScroll delay={0.4}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4, 
                    opacity: 0.95, 
                    lineHeight: 1.7,
                    fontWeight: 400,
                    maxWidth: '90%'
                  }}
                >
                  Streamline operations across Education, Pharmacy, Retail, Hotel, Restaurant, and Salon industries. 
                  Built on enterprise-grade security with multi-tenant isolation, role-based access control, 
                  Razorpay payment integration, and real-time analytics. Scale effortlessly with flexible plans designed to grow with your business.
          </Typography>
              </FadeInOnScroll>
              <FadeInOnScroll delay={0.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {(!user || !user.username) && (
                  <>
                    <Tooltip title="Get started with free plan - No credit card required" arrow>
                    <Button 
                      variant="contained" 
                      size="large" 
                      sx={{ 
                          bgcolor: '#ffa726', 
                          color: 'white',
                          px: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': { 
                            bgcolor: '#ff9800',
                            transform: 'translateY(-2px)',
                            boxShadow: 6,
                            '&::before': {
                              left: '100%'
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            transition: 'left 0.5s ease'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={(e) => {
                          // Create ripple effect
                          const button = e.currentTarget;
                          const ripple = document.createElement('span');
                          const rect = button.getBoundingClientRect();
                          const size = Math.max(rect.width, rect.height);
                          const x = e.clientX - rect.left - size / 2;
                          const y = e.clientY - rect.top - size / 2;
                          
                          ripple.style.cssText = `
                            position: absolute;
                            border-radius: 50%;
                            background: rgba(255,255,255,0.6);
                            width: ${size}px;
                            height: ${size}px;
                            left: ${x}px;
                            top: ${y}px;
                            transform: scale(0);
                            animation: ripple 0.6s ease-out;
                            pointer-events: none;
                          `;
                          
                          button.appendChild(ripple);
                          setTimeout(() => ripple.remove(), 600);
                          
                          // Add bounce animation
                          button.style.animation = 'buttonBounce 0.5s ease';
                          setTimeout(() => {
                            button.style.animation = '';
                            navigate('/register');
                          }, 200);
                        }}
                        endIcon={<ArrowIcon sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'translateX(4px)' } }} />}
                    >
                      Start Free Trial
                    </Button>
                    </Tooltip>
                    <Tooltip title="See all pricing plans and features" arrow>
                    <Button 
                      variant="outlined" 
                      size="large"
                        sx={{ 
                          color: 'white', 
                          borderColor: 'white',
                          px: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          position: 'relative',
                          '&:hover': { 
                            borderColor: '#ffa726',
                            bgcolor: 'rgba(255,167,38,0.1)',
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          },
                          transition: 'all 0.3s ease'
                        }}
                      onClick={() => navigate('/pricing')}
                    >
                        View Pricing
                    </Button>
                    </Tooltip>
                  </>
                )}
                {user && user.username && currentPlan === 'free' && (
                  <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ 
                        bgcolor: '#ffa726', 
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        '&:hover': { bgcolor: '#ff9800' }
                    }}
                    onClick={() => navigate('/pricing')}
                      endIcon={<ArrowIcon />}
                  >
                    Upgrade Plan
                  </Button>
                )}
                {user && user.username && currentPlan && currentPlan !== 'free' && (
                  <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ 
                        bgcolor: '#ffa726', 
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        '&:hover': { bgcolor: '#ff9800' }
                    }}
                    onClick={() => navigate('/dashboard')}
                      endIcon={<ArrowIcon />}
                  >
                    Go to Dashboard
                  </Button>
                )}
                </Stack>
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} md={5}>
              <FadeInOnScroll delay={0.6} direction="left">
                <Box sx={{ 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'center', md: 'flex-start' },
                  gap: { xs: 3, md: 4 },
                  width: '100%'
                }}>
                  {/* Hero Image - UI Mockup */}
                  <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 auto' }, width: { xs: '100%', md: 'auto' } }}>
                    <Box
                      component="img"
                      src={`${process.env.PUBLIC_URL}/images/zenith-erp-mockup.png`}
                      alt="Premium UI mockup of Zenith ERP Control Center"
                      onError={(e) => {
                        // Fallback to placeholder if image doesn't exist
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', md: 400 },
                        height: 'auto',
                        borderRadius: 4,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        border: '3px solid rgba(255,255,255,0.2)',
                      }}
                    />
                    {/* Placeholder if image doesn't exist */}
                    <Box
                      className="hero-placeholder"
                      sx={{
                        display: 'none',
                        width: '100%',
                        maxWidth: { xs: '100%', md: 400 },
                        height: 300,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        border: '3px solid rgba(255,255,255,0.2)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Box sx={{ textAlign: 'center', color: 'white', opacity: 0.8 }}>
                        <PeopleIcon sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h6" fontWeight={600}>
                          Professional Team
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Add office/team working photo here
                        </Typography>
                      </Box>
                    </Box>
      </Box>

                  {/* Trust Stats - Right of Image */}
      <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2.5, md: 3 },
                    alignItems: { xs: 'center', md: 'flex-start' },
                    justifyContent: 'center',
                    flex: { xs: '0 0 auto', md: '1 1 auto' },
                    width: { xs: '100%', md: 'auto' },
                    minWidth: { xs: 'auto', md: '200px' }
                  }}>
                    <FadeInOnScroll delay={0.7}>
                      <Tooltip title="500+ organizations trust Zenith ERP" arrow>
                        <Box sx={{
                          width: '100%',
                          textAlign: { xs: 'center', md: 'left' },
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <AnimatedCounter end={500} suffix="+" />
                          </Box>
                          <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, color: 'white', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            Organizations
                          </Typography>
                        </Box>
                      </Tooltip>
              </FadeInOnScroll>

                    <FadeInOnScroll delay={0.75}>
                      <Tooltip title="99.9% uptime SLA guarantee" arrow>
                        <Box sx={{
                          width: '100%',
                          textAlign: { xs: 'center', md: 'left' },
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <AnimatedCounter end={99} suffix=".9%" />
                          </Box>
                          <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, color: 'white', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            Uptime
                          </Typography>
                        </Box>
                      </Tooltip>
              </FadeInOnScroll>

                    <FadeInOnScroll delay={0.8}>
                      <Tooltip title="24/7 customer support available" arrow>
                        <Box sx={{
                          width: '100%',
                          textAlign: { xs: 'center', md: 'left' },
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <AnimatedCounter end={24} suffix="/7" />
                          </Box>
                          <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, color: 'white', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            Support
                          </Typography>
                        </Box>
                      </Tooltip>
              </FadeInOnScroll>

                    <FadeInOnScroll delay={0.85}>
                      <Tooltip title="Rated 5.0 by our customers" arrow>
                        <Box sx={{
                          width: '100%',
                          textAlign: { xs: 'center', md: 'left' },
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 0.5 }}>
                            <Stack direction="row" spacing={0.5}>
                    {[1, 2, 3, 4, 5].map((i) => (
                                <StarIcon 
                                  key={i} 
                                  sx={{ 
                                    color: '#ffa726', 
                                    fontSize: { xs: 20, md: 24 },
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'scale(1.2) rotate(15deg)'
                                    }
                                  }} 
                                />
                              ))}
                            </Stack>
                  </Box>
                          <Typography variant="body1" fontWeight={600} sx={{ color: 'white', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            5.0 Rated
                  </Typography>
                        </Box>
                      </Tooltip>
                    </FadeInOnScroll>
                  </Box>
                </Box>
              </FadeInOnScroll>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section - Interactive */}
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ py: 8 }}>
        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid item xs={6} md={3} key={index}>
              <FadeInOnScroll delay={index * 0.1}>
                <Tooltip title="Click to learn more" arrow>
                <Card
                  sx={{
                    p: 3, 
                    textAlign: 'center',
                      height: '100%',
                      border: `2px solid ${benefit.color}30`,
                      cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                      background: benefit.bgGradient,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: benefit.color,
                        boxShadow: `0 8px 24px ${benefit.color}40`,
                        transform: 'translateY(-6px) scale(1.02)',
                        '& .benefit-icon': {
                          transform: 'scale(1.3) rotate(10deg)',
                          color: benefit.color,
                          filter: `drop-shadow(0 4px 8px ${benefit.color}60)`
                        },
                        '&::before': {
                          opacity: 1,
                          background: `linear-gradient(135deg, ${benefit.color}15 0%, ${benefit.color}25 100%)`
                        },
                        '&::after': {
                          opacity: 0.1
                        }
                      },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                        zIndex: 0
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        left: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${benefit.color}30 0%, transparent 70%)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none'
                      }
                    }}
                    onClick={() => navigate('/about')}
                >
                  <Box 
                      className="benefit-icon"
                    sx={{ 
                        color: benefit.color, 
                      mb: 2,
                        position: 'relative',
                        zIndex: 1,
                        transition: 'all 0.3s ease',
                      display: 'inline-block',
                        fontSize: '3rem'
                    }}
                  >
                      {benefit.icon}
                  </Box>
                    <Typography 
                      variant="body1" 
                      fontWeight={600}
                      sx={{ 
                        position: 'relative', 
                        zIndex: 1,
                        color: benefit.color,
                        fontSize: '1.1rem'
                      }}
                    >
                      {benefit.text}
                </Typography>
              </Card>
                </Tooltip>
              </FadeInOnScroll>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Core Features Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <FadeInOnScroll delay={0}>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Universal Core Features
              </Typography>
          </FadeInOnScroll>
            <FadeInOnScroll delay={0.2}>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6, mt: 2 }}>
                Enterprise-grade features included in every plan. Built on modern cloud architecture 
                with automatic backups, infinite scalability, and bank-level security.
          </Typography>
            </FadeInOnScroll>
        </Box>

        <Grid container spacing={4}>
            {coreFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FadeInOnScroll delay={index * 0.1}>
                  <InteractiveFeatureCard 
                    feature={feature} 
                    index={index}
                    onLearnMore={handleLearnMore}
                  />
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
          
          {/* Feature Dialog */}
          <FeatureDialog 
            open={dialogOpen}
            onClose={handleCloseDialog}
            feature={selectedFeature}
          />
        </Container>
      </Box>

      {/* Visual Showcase Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'center' },
            gap: { xs: 4, md: 6 }
          }}>
            {/* Image on the left */}
            <Box sx={{ 
              flex: { xs: '0 0 100%', md: '0 0 48%' },
              maxWidth: { xs: '100%', md: '48%' },
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              <FadeInOnScroll delay={0.2} direction="right">
                <Box>
                  <Box
                    component="img"
                    src={`${process.env.PUBLIC_URL}/images/features-office-laptop.jpg`}
                    alt="Professional working with laptop and technology"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    sx={{
                      width: '100%',
                      maxWidth: { xs: '100%', md: 450 },
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease, boxShadow 0.3s ease',
                      cursor: 'pointer',
                  '&:hover': {
                        transform: 'scale(1.05) rotateY(2deg)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                      }
                    }}
                    onClick={() => navigate('/register')}
                  />
                  <Box
                    sx={{ 
                      display: 'none',
                      width: '100%',
                      maxWidth: { xs: '100%', md: 450 },
                      height: 250,
                      borderRadius: 4,
                      bgcolor: 'background.paper',
                      border: '2px dashed #e0e0e0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}
                  >
                    <SpeedIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Office Working Scene
                </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Add professional office/working photo here
                </Typography>
                </Box>
                </Box>
              </FadeInOnScroll>
            </Box>
            {/* Content on the right */}
                      <Box sx={{ 
              flex: { xs: '0 0 100%', md: '0 0 48%' },
              maxWidth: { xs: '100%', md: '48%' },
              display: 'flex'
            }}>
              <FadeInOnScroll delay={0.4}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: { xs: 'flex-start', md: 'center' },
                  alignItems: { xs: 'center', md: 'flex-start' },
                  height: '100%',
                  width: '100%',
                  pl: { xs: 0, md: 4 },
                  pt: { xs: 4, md: 0 }
                      }}>
                        <Typography 
                    variant="h3" 
                    component="h2" 
                          fontWeight={700} 
                    gutterBottom
                          sx={{ 
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.75rem' },
                      mb: 2.5,
                      textAlign: { xs: 'center', md: 'left' },
                      color: 'text.primary',
                      lineHeight: 1.2
                    }}
                  >
                    Built for Modern Businesses
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3.5, 
                      lineHeight: 1.8,
                      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                      textAlign: { xs: 'center', md: 'left' },
                      maxWidth: { xs: '100%', md: '95%' }
                    }}
                  >
                    Experience enterprise-grade ERP solutions designed for today's dynamic workplaces. 
                    Streamline operations, boost productivity, and scale your business with confidence.
                  </Typography>
                  <Stack spacing={2.5} sx={{ width: '100%', maxWidth: { xs: '100%', md: '95%' } }}>
                    {[
                      { icon: <SpeedIcon />, title: "Lightning Fast", desc: "Optimized performance for instant data access" },
                      { icon: <SecurityIcon />, title: "Enterprise Security", desc: "Bank-level encryption and data protection" },
                      { icon: <AnalyticsIcon />, title: "Real-Time Analytics", desc: "Live dashboards with actionable insights" }
                    ].map((item, idx) => (
                      <FadeInOnScroll key={idx} delay={0.1 * (idx + 1)}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '&:hover': {
                              bgcolor: 'rgba(25,118,210,0.05)',
                              transform: 'translateX(8px)',
                              borderColor: 'primary.main',
                              boxShadow: '0 4px 16px rgba(25,118,210,0.15)',
                              '& .feature-item-icon': {
                                transform: 'scale(1.2) rotate(5deg)',
                                color: 'primary.dark'
                              }
                            }
                          }}
                          onClick={() => navigate('/register')}
                        >
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main',
                              width: 48,
                              height: 48,
                              transition: 'all 0.3s ease',
                              '& .feature-item-icon': { color: 'white' }
                            }}
                          >
                            {React.cloneElement(item.icon, { className: 'feature-item-icon', sx: { fontSize: 24 } })}
                          </Avatar>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 0.5, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                              {item.title}
                        </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: { xs: '0.875rem', md: '0.9375rem' } }}>
                              {item.desc}
                        </Typography>
                          </Box>
                      </Box>
                    </FadeInOnScroll>
                  ))}
                  </Stack>
                </Box>
              </FadeInOnScroll>
            </Box>
          </Box>
        </Container>
                </Box>
                
      {/* Industry Modules Section */}
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }} sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <FadeInOnScroll delay={0}>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              Industry-Specific Solutions
                    </Typography>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6, mt: 2 }}>
              Six comprehensive industry modules—each purpose-built with pre-configured workflows, 
              industry best practices, and specialized features tailored to your business needs.
            </Typography>
          </FadeInOnScroll>
                    </Box>

        <Grid container spacing={4}>
          {industryModules.map((module, index) => (
            <Grid item xs={12} md={6} key={index}>
              <FadeInOnScroll delay={index * 0.15}>
                <InteractiveModuleCard 
                  module={module}
                  index={index}
                  onLearnMore={handleLearnMore}
                />
              </FadeInOnScroll>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      {!hidePricing && (
        <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
          <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Choose Your Plan
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6, mt: 2 }}>
                Start with our free plan and upgrade anytime. All plans include core ERP features, 
                industry-specific modules, mobile access, and comprehensive support.
              </Typography>
            </Box>

            <Grid container spacing={3} justifyContent="center">
              {plans.map((plan, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FadeInOnScroll delay={index * 0.1}>
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                      border: plan.popular ? '3px solid' : '2px solid',
                      borderColor: plan.popular ? 'primary.main' : '#e0e0e0',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                        borderColor: plan.popular ? 'primary.dark' : 'primary.main',
                        '& .plan-shine': {
                          left: '100%'
                        },
                        '& .plan-button': {
                          bgcolor: plan.popular ? 'primary.dark' : 'primary.main',
                          color: 'white',
                          transform: 'scale(1.05)'
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        bgcolor: plan.popular ? 'primary.main' : 'transparent',
                        transition: 'height 0.3s ease'
                      },
                      '&:hover::before': {
                        height: '100%',
                        opacity: 0.05
                      }
                    }}
                    onClick={() => navigate('/register')}
                    >
                    {plan.popular && (
                      <Chip 
                        label="Most Popular" 
                        color="primary" 
                        size="small" 
                          sx={{ 
                            position: 'absolute',
                            top: -12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { transform: 'translateX(-50%) scale(1)' },
                              '50%': { transform: 'translateX(-50%) scale(1.05)' }
                            }
                          }}
                        />
                      )}
                      
                      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: plan.popular ? 2 : 0 }}>
                      {plan.name}
                    </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        {plan.original_price && (
                          <Box sx={{ mb: 1 }}>
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{
                                textDecoration: 'line-through',
                                color: 'text.secondary',
                                fontSize: '1rem',
                                mr: 1
                              }}
                            >
                              ₹{plan.original_price.toLocaleString()}/year
                            </Typography>
                            <Chip
                              label={`${Math.round(((plan.original_price - plan.price) / plan.original_price) * 100)}% OFF`}
                              size="small"
                              sx={{
                                bgcolor: '#f44336',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 22
                              }}
                            />
                          </Box>
                        )}
                        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}/year`}
                    </Typography>
                        {plan.price > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
                            ~₹{Math.round(plan.price / 12).toLocaleString()}/month
                          </Typography>
                        )}
                      </Box>
                      
                      <List dense sx={{ mb: 3, textAlign: 'left' }}>
                      {plan.features.map((feature, idx) => (
                          <ListItem 
                            key={idx} 
                            sx={{ 
                              py: 0.5, 
                              px: 0,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'rgba(25,118,210,0.05)',
                                borderRadius: 1,
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature} 
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    
                    <Button 
                        className="plan-button"
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add bounce animation
                          const button = e.currentTarget;
                          button.style.animation = 'buttonBounce 0.5s ease';
                          setTimeout(() => {
                            button.style.animation = '';
                            navigate('/register');
                          }, 300);
                        }}
                      sx={{ 
                          mt: 'auto',
                          fontWeight: 600,
                          py: 1.5,
                          transition: 'all 0.3s ease'
                        }}
                        endIcon={plan.popular && <ArrowIcon />}
                    >
                      {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                    </Button>
                  </Card>
                  </FadeInOnScroll>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Future Innovations */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="xl">
          <FadeInOnScroll delay={0}>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              What’s Coming Next
            </Typography>
          </FadeInOnScroll>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, lineHeight: 1.6, mb: 4 }}>
            We continuously invest in smarter workflows, AI assistance, and immersive dashboards. Here are a few ideas we are actively validating with customers.
          </Typography>
          <Grid container spacing={3}>
            {FUTURE_FEATURES.map((feature, index) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <FadeInOnScroll delay={index * 0.1}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      borderRadius: 3, 
                      p: 3, 
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                    onClick={() => setFutureFeatureDialog(feature)}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${feature.color}15`,
                        color: feature.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                    <Stack spacing={1}>
                      {feature.benefits.map((benefit, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon fontSize="small" sx={{ color: feature.color }} />
                          <Typography variant="body2" color="text.secondary">
                            {benefit}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Chip 
                      label={feature.stats} 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 16, 
                        right: 16, 
                        bgcolor: `${feature.color}22`, 
                        color: feature.color 
                      }} 
                    />
                  </Card>
                </FadeInOnScroll>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Custom Services Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <FadeInOnScroll delay={0}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Need Custom Solutions?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6, mt: 2 }}>
                We offer complete customization services, web development, mobile app creation, and industrial automation solutions tailored to your specific requirements.
              </Typography>
            </Box>
          </FadeInOnScroll>

          {/* Original Custom Services */}
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3, mt: 2, color: 'text.primary', textAlign: 'center' }}>
            Software Development Services
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FadeInOnScroll delay={0.1}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '2px solid rgba(76,175,80,0.3)',
                    background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(129,199,132,0.1) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(76,175,80,0.4)',
                      borderColor: '#4caf50',
                      background: 'linear-gradient(135deg, rgba(76,175,80,0.2) 0%, rgba(129,199,132,0.2) 100%)'
                    }
                  }}
                  onClick={() => setCustomServiceDialogOpen(true)}
                >
                  <SettingsIcon sx={{ fontSize: 50, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#4caf50' }}>
                    Customization
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Tailor ERP to your workflow
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: '#4caf50',
                      color: '#4caf50',
                      '&:hover': { 
                        bgcolor: '#4caf50',
                        color: 'white',
                        borderColor: '#4caf50'
                      }
                    }}
                    endIcon={<ArrowIcon />}
                  >
                    Request Quote
                  </Button>
                </Card>
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FadeInOnScroll delay={0.2}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '2px solid rgba(33,150,243,0.3)',
                    background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(100,181,246,0.1) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(33,150,243,0.4)',
                      borderColor: '#2196f3',
                      background: 'linear-gradient(135deg, rgba(33,150,243,0.2) 0%, rgba(100,181,246,0.2) 100%)'
                    }
                  }}
                  onClick={() => setCustomServiceDialogOpen(true)}
                >
                  <WebIcon sx={{ fontSize: 50, color: '#2196f3', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2196f3' }}>
                    Web Development
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Professional web applications
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: '#2196f3',
                      color: '#2196f3',
                      '&:hover': { 
                        bgcolor: '#2196f3',
                        color: 'white',
                        borderColor: '#2196f3'
                      }
                    }}
                    endIcon={<ArrowIcon />}
                  >
                    Request Quote
                  </Button>
                </Card>
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FadeInOnScroll delay={0.3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '2px solid rgba(255,152,0,0.3)',
                    background: 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,183,77,0.1) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(255,152,0,0.4)',
                      borderColor: '#ff9800',
                      background: 'linear-gradient(135deg, rgba(255,152,0,0.2) 0%, rgba(255,183,77,0.2) 100%)'
                    }
                  }}
                  onClick={() => setCustomServiceDialogOpen(true)}
                >
                  <AppIcon sx={{ fontSize: 50, color: '#ff9800', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#ff9800' }}>
                    App Development
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Mobile apps for iOS & Android
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '&:hover': { 
                        bgcolor: '#ff9800',
                        color: 'white',
                        borderColor: '#ff9800'
                      }
                    }}
                    endIcon={<ArrowIcon />}
                  >
                    Request Quote
                  </Button>
                </Card>
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FadeInOnScroll delay={0.4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '2px solid rgba(156,39,176,0.3)',
                    background: 'linear-gradient(135deg, rgba(156,39,176,0.1) 0%, rgba(186,104,200,0.1) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(156,39,176,0.4)',
                      borderColor: '#9c27b0',
                      background: 'linear-gradient(135deg, rgba(156,39,176,0.2) 0%, rgba(186,104,200,0.2) 100%)'
                    }
                  }}
                  onClick={() => setCustomServiceDialogOpen(true)}
                >
                  <CodeIcon sx={{ fontSize: 50, color: '#9c27b0', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#9c27b0' }}>
                    Web + App
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Complete digital solution
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: '#9c27b0',
                      color: '#9c27b0',
                      '&:hover': { 
                        bgcolor: '#9c27b0',
                        color: 'white',
                        borderColor: '#9c27b0'
                      }
                    }}
                    endIcon={<ArrowIcon />}
                  >
                    Request Quote
                  </Button>
                </Card>
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FadeInOnScroll delay={0.5}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '2px solid rgba(25,118,210,0.3)',
                    background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.1) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(25,118,210,0.4)',
                      borderColor: '#42a5f5',
                      background: 'linear-gradient(135deg, rgba(25,118,210,0.2) 0%, rgba(66,165,245,0.2) 100%)'
                    }
                  }}
                  onClick={() => setCustomServiceDialogOpen(true)}
                >
                  <ComputerIcon sx={{ fontSize: 50, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1976d2' }}>
                    PC Applications
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Custom desktop applications for Windows, Linux, and macOS
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': { 
                        bgcolor: '#1976d2',
                        color: 'white',
                        borderColor: '#1976d2'
                      }
                    }}
                    endIcon={<ArrowIcon />}
                  >
                    Request Quote
                  </Button>
                </Card>
              </FadeInOnScroll>
            </Grid>
          </Grid>

          {/* Industrial Automation Services */}
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3, mt: 4, color: 'text.primary', textAlign: 'center' }}>
            Industrial Automation Services
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FadeInOnScroll delay={0.5}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '2px solid rgba(255,152,0,0.3)',
                    background: 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,183,77,0.1) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(255,152,0,0.4)',
                      borderColor: '#ff9800',
                      background: 'linear-gradient(135deg, rgba(255,152,0,0.2) 0%, rgba(255,183,77,0.2) 100%)'
                    }
                  }}
                  onClick={() => setCustomServiceDialogOpen(true)}
                >
                  <SettingsIcon sx={{ fontSize: 50, color: '#ff9800', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#ff9800' }}>
                    PLC Programming
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Industrial automation programming and control system development
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '&:hover': { 
                        bgcolor: '#ff9800',
                        color: 'white',
                        borderColor: '#ff9800'
                      }
                    }}
                    endIcon={<ArrowIcon />}
                  >
                    Request Quote
                  </Button>
                </Card>
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FadeInOnScroll delay={0.6}>
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '2px solid rgba(25,118,210,0.3)',
                    background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.1) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(25,118,210,0.4)',
                      borderColor: '#42a5f5',
                      background: 'linear-gradient(135deg, rgba(25,118,210,0.2) 0%, rgba(66,165,245,0.2) 100%)'
                    }
                  }}
                  onClick={() => setCustomServiceDialogOpen(true)}
                >
                  <MemoryIcon sx={{ fontSize: 50, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1976d2' }}>
                    Control & Operation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Industrial control systems and operational automation solutions
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': { 
                        bgcolor: '#1976d2',
                        color: 'white',
                        borderColor: '#1976d2'
                      }
                    }}
                    endIcon={<ArrowIcon />}
                  >
                    Request Quote
                  </Button>
                </Card>
              </FadeInOnScroll>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              All custom services include consultation, development, testing, deployment, and ongoing support
            </Typography>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => setCustomServiceDialogOpen(true)}
              sx={{ 
                borderColor: 'primary.main',
                color: 'primary.main',
                px: 4,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Get Started with Custom Services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Custom Service Request Dialog */}
      <CustomServiceFormDialog 
        open={customServiceDialogOpen}
        onClose={() => setCustomServiceDialogOpen(false)}
      />

      {/* CTA Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white',
        py: 8
      }}>
        <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              Ready to Transform Your Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, maxWidth: 800, mx: 'auto', lineHeight: 1.7 }}>
              Trusted by 500+ organizations across six industries. Experience streamlined operations with 
              real-time analytics, automated workflows, and seamless integrations—all in one unified platform.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Tooltip title="Start with 2 free users - No credit card required" arrow>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                    bgcolor: '#ffa726', 
                    color: 'white',
                    px: 5,
                  py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': { 
                      bgcolor: '#ff9800',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: 6,
                      '&::before': {
                        left: '100%'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.5s ease'
                    },
                    transition: 'all 0.3s ease'
                }}
                onClick={() => navigate('/register')}
                  endIcon={<ArrowIcon />}
              >
                Start Free Trial
              </Button>
              </Tooltip>
              <Tooltip title="Talk to our sales team" arrow>
              <Button 
                variant="outlined" 
                size="large"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                    px: 5,
                  py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    position: 'relative',
                    '&:hover': { 
                      borderColor: '#ffa726',
                      bgcolor: 'rgba(255,167,38,0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    },
                    transition: 'all 0.3s ease'
                }}
                onClick={() => navigate('/contact')}
              >
                Contact Sales
              </Button>
              </Tooltip>
            </Stack>
            <Typography variant="body2" sx={{ mt: 4, opacity: 0.8 }}>
              Free plan includes 2 users & 500 MB storage • Annual billing for paid plans • No credit card required • Upgrade anytime
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
    <FeatureDialog 
      open={!!futureFeatureDialog}
      feature={futureFeatureDialog}
      onClose={() => setFutureFeatureDialog(null)}
    />
    </>
  );
};

export default HomePage; 
