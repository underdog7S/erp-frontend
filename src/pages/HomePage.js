import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar
} from '@mui/material';
import {
  Check as CheckIcon,
  ArrowForward as ArrowIcon,
  Factory as FactoryIcon,
  School as SchoolIcon,
  LocalHospital as HealthcareIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  FactCheck as FactCheckIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  EventAvailable as EventAvailableIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  MonetizationOn as MonetizationOnIcon,
  Description as DescriptionIcon,
  Restaurant as RestaurantIcon,
  Hotel as HotelIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

// Animated Counter Component
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
      { threshold: 0.5 }
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
      
      // Easing function for smooth animation
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {prefix}{count}{suffix}
      </Typography>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

// Floating Stars/Particles Component
const FloatingParticles = ({ count = 30 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 10 + Math.random() * 20,
    size: 2 + Math.random() * 4
  }));

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            animation: `float ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            '@keyframes float': {
              '0%': {
                transform: 'translateY(0) rotate(0deg)',
                opacity: 0
              },
              '10%': {
                opacity: 1
              },
              '90%': {
                opacity: 1
              },
              '100%': {
                transform: 'translateY(100vh) rotate(360deg)',
                opacity: 0
              }
            }
          }}
        />
      ))}
    </Box>
  );
};

// Animated Line Connector
const AnimatedLine = ({ from, to, color = '#667eea', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
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

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        left: `${from.x}%`,
        top: `${from.y}%`,
        width: `${length}%`,
        height: '2px',
        background: `linear-gradient(90deg, ${color}, transparent)`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'left center',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        transitionDelay: `${delay}s`,
        '&::after': {
          content: '""',
          position: 'absolute',
          right: 0,
          top: '-4px',
          width: '10px',
          height: '10px',
          background: color,
          borderRadius: '50%',
          boxShadow: `0 0 10px ${color}`,
          animation: isVisible ? 'pulse 2s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 1 },
            '50%': { transform: 'scale(1.5)', opacity: 0.7 }
          }
        }
      }}
    />
  );
};

// Rotating Icon Component
const RotatingIcon = ({ children, speed = 20, hoverSpeed = 5 }) => {
  return (
    <Box
      sx={{
        display: 'inline-block',
        animation: `rotate ${speed}s linear infinite`,
        '&:hover': {
          animation: `rotate ${hoverSpeed}s linear infinite`,
          transform: 'scale(1.2)'
        },
        transition: 'transform 0.3s ease',
        '@keyframes rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }}
    >
      {children}
    </Box>
  );
};

// Scroll-triggered Fade In Component
const FadeInOnScroll = ({ children, delay = 0 }) => {
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

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.8s ease-out, transform 0.8s ease-out`,
        transitionDelay: `${delay}s`
      }}
    >
      {children}
    </Box>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  const industryModules = [
    {
      title: "Education Management",
      subtitle: "Complete Academic Solution",
      icon: <SchoolIcon sx={{ fontSize: 60 }} />,
      color: "#388e3c",
      bgColor: "#e8f5e8",
      features: [
        "Student Admission & Management",
        "Class & Department Management",
        "Fee Structure & Payment Tracking",
        "Attendance System (Student & Staff)",
        "Report Cards & Grading",
        "Staff & Teacher Management",
        "Academic Reports & Analytics",
        "Parent Portal & Communication"
      ],
      stats: { students: "10K+", classes: "500+", schools: "25+" },
      useCases: ["Schools", "Colleges", "Universities", "Training Centers"]
    },
    {
      title: "Pharmacy Management",
      subtitle: "Complete Pharmacy Solution",
      icon: <HealthcareIcon sx={{ fontSize: 60 }} />,
      color: "#7b1fa2",
      bgColor: "#f3e5f5",
      features: [
        "Medicine & Category Management",
        "Batch Tracking & Expiry Alerts",
        "Prescription Processing",
        "Patient Records & History",
        "Sales & Billing System",
        "Inventory Control & Low Stock Alerts",
        "Supplier & Purchase Order Management",
        "Sales Analytics & Reports"
      ],
      stats: { medicines: "2K+", patients: "3K+", suppliers: "30+" },
      useCases: ["Retail Pharmacies", "Hospital Pharmacies", "Chain Pharmacies"]
    },
    {
      title: "Retail & Wholesale",
      subtitle: "Complete Multi-Warehouse Solution",
      icon: <ShoppingCartIcon sx={{ fontSize: 60 }} />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
      features: [
        "Multi-Warehouse Management",
        "Product Catalog & SKU Management",
        "Real-time Inventory Tracking",
        "Customer Segmentation (Retail/Wholesale)",
        "Inter-Warehouse Stock Transfers",
        "Goods Receipt & Purchase Orders",
        "Sales Management & POS",
        "Advanced Inventory Analytics"
      ],
      stats: { products: "5K+", warehouses: "10+", customers: "2K+" },
      useCases: ["Retail Stores", "Wholesale Businesses", "Distribution Centers"]
    },
    {
      title: "Hotel Management",
      subtitle: "Complete Hospitality Solution",
      icon: <HotelIcon sx={{ fontSize: 60 }} />,
      color: "#f57c00",
      bgColor: "#fff3e0",
      features: [
        "Room Type & Rate Management",
        "Room Status & Availability",
        "Guest Registration & Records",
        "Booking & Reservation System",
        "Check-in & Check-out Management",
        "Booking Status Tracking",
        "Revenue Management",
        "Occupancy Reports"
      ],
      stats: { rooms: "200+", bookings: "1K+", guests: "5K+" },
      useCases: ["Hotels", "Resorts", "Guest Houses", "Hostels"]
    },
    {
      title: "Restaurant Management",
      subtitle: "Complete Dining Solution",
      icon: <RestaurantIcon sx={{ fontSize: 60 }} />,
      color: "#d32f2f",
      bgColor: "#ffebee",
      features: [
        "Menu Category & Item Management",
        "Table Management & Seating",
        "Order Taking & Processing",
        "Kitchen Display System",
        "Order Status Tracking",
        "Billing & Payment Processing",
        "Customer Order History",
        "Sales & Revenue Reports"
      ],
      stats: { items: "500+", tables: "50+", orders: "5K+" },
      useCases: ["Restaurants", "Cafes", "Food Courts", "Catering Services"]
    },
    {
      title: "Salon Management",
      subtitle: "Complete Beauty & Spa Solution",
      icon: <PersonIcon sx={{ fontSize: 60 }} />,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
      features: [
        "Service Category Management",
        "Service & Pricing Management",
        "Stylist & Staff Management",
        "Appointment Booking System",
        "Appointment Check-in & Completion",
        "Customer Management",
        "Service History Tracking",
        "Revenue & Performance Analytics"
      ],
      stats: { services: "100+", stylists: "20+", appointments: "2K+" },
      useCases: ["Salons", "Spa Centers", "Beauty Parlors", "Barber Shops"]
    }
  ];

  const coreFeatures = [
    {
      title: "Multi-Tenant Architecture",
      description: "Each business gets its own isolated workspace with dedicated data and users",
      icon: <BusinessIcon />,
      benefits: [
        "Isolated data per tenant",
        "Custom branding",
        "Independent user management",
        "Secure data separation",
        "Multi-organization support"
      ]
    },
    {
      title: "Role-Based Access Control",
      description: "Granular permissions based on user roles and responsibilities",
      icon: <SecurityIcon />,
      benefits: [
        "Admin, Manager, Staff, Student roles",
        "Feature-based permissions",
        "Industry-specific access",
        "Audit trail & activity logs",
        "Custom role creation"
      ]
    },
    {
      title: "Plan-Based Features",
      description: "Scalable plans with feature limits and storage controls",
      icon: <StorageIcon />,
      benefits: [
        "Free, Starter, Pro, Business plans",
        "User limit controls",
        "Storage monitoring",
        "Feature toggles",
        "Upgrade/downgrade anytime"
      ]
    },
    {
      title: "Real-Time Dashboard",
      description: "Live analytics and insights for informed decision making",
      icon: <DashboardIcon />,
      benefits: [
        "Live statistics & KPIs",
        "Usage monitoring",
        "Performance metrics",
        "Alert system",
        "Exportable reports"
      ]
    },
    {
      title: "Mobile Access",
      description: "Access your ERP from anywhere, anytime on any device",
      icon: <SpeedIcon />,
      benefits: [
        "Responsive design",
        "Mobile-optimized interface",
        "Offline capabilities",
        "Push notifications",
        "Cross-platform support"
      ]
    },
    {
      title: "API & Integrations",
      description: "Connect with your existing tools and automate workflows",
      icon: <BuildIcon />,
      benefits: [
        "RESTful API access",
        "Third-party integrations",
        "Webhook support",
        "Data import/export",
        "Custom integrations"
      ]
    }
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentPlan = (user && user.plan) ? String(user.plan).toLowerCase() : null;
  const hideFreePlan = !!user && !!currentPlan && currentPlan === 'free';
  const hidePricing = hideFreePlan; // Hide entire pricing section for logged-in free users

const allPlans = [
  {
      name: "Free",
      description: "Perfect for small teams to get started",
      price: 0,
      color: "#4caf50",
    features: [
        "2 Users",
        "500 MB Storage",
        "1 Industry Module",
        "Email Support",
        "Core ERP Features",
        "Mobile Access",
        "Basic Reports"
      ]
    },
    {
      name: "Starter",
      description: "Ideal for growing businesses",
      price: 4500,
      color: "#2196f3",
    features: [
        "25 Users",
        "5 GB Storage",
        "1 Industry Module",
        "Daily Backups",
        "Priority Support",
        "Advanced Reports",
        "API Access"
      ]
    },
    {
      name: "Pro",
      description: "Perfect for established organizations",
      price: 8999,
      color: "#9c27b0",
      popular: true,
    features: [
        "100 Users",
        "20 GB Storage",
        "1 Industry Module",
        "API Access",
        "Priority Support",
        "Advanced Analytics",
        "Custom Integrations",
        "White-label Options"
      ]
    },
    {
      name: "Business",
      description: "Enterprise-grade solution with dedicated support",
      price: 19999,
      color: "#ff9800",
    features: [
        "Unlimited Users",
        "50 GB Storage",
        "All Industry Modules",
        "24/7 Priority Support",
        "Dedicated Account Manager",
        "Custom Development",
        "SLA Guarantee",
        "On-premise Option"
      ]
    }
  ];

  const plans = hideFreePlan ? allPlans.filter(p => p.name !== 'Free') : allPlans;

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 8,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'backgroundMove 20s ease-in-out infinite',
          '@keyframes backgroundMove': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(-20px, -20px) scale(1.1)' }
          }
        }
      }}>
        <FloatingParticles count={40} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={12}>
              <FadeInOnScroll delay={0}>
                <Chip 
                  label="Multi-Tenant ERP Solution" 
                  color="secondary" 
                  sx={{ 
                    mb: 2,
                    animation: 'glow 2s ease-in-out infinite',
                    '@keyframes glow': {
                      '0%, 100%': { boxShadow: '0 0 5px rgba(255,255,255,0.5)' },
                      '50%': { boxShadow: '0 0 20px rgba(255,255,255,0.8)' }
                    }
                  }}
                />
              </FadeInOnScroll>
              <FadeInOnScroll delay={0.2}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  fontWeight={700} 
                  gutterBottom
                  sx={{
                    animation: 'titleGlow 3s ease-in-out infinite',
                    '@keyframes titleGlow': {
                      '0%, 100%': { textShadow: '0 0 10px rgba(255,255,255,0.3)' },
                      '50%': { textShadow: '0 0 20px rgba(255,255,255,0.6)' }
                    }
                  }}
                >
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <RotatingIcon speed={30}>
                      <StarIcon sx={{ color: '#ffd700', fontSize: 40 }} />
                    </RotatingIcon>
                    Zenith ERP
                  </Box>
                  <Box component="span" sx={{ color: '#ffd700', display: 'block', mt: 1 }}>
                    Universal Business Management
                  </Box>
                </Typography>
              </FadeInOnScroll>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
                          Transform your business with our comprehensive multi-industry ERP solution. Supporting Education, Pharmacy, Retail, Hotel, Restaurant, and Salon industries. 
                          Built on cloud-native architecture with enterprise-grade security, multi-tenant isolation, and intelligent role-based access control.
                          Automate workflows, streamline operations, and scale effortlessly with flexible plans designed to grow with your business.
          </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {(!user || !user.username) && (
                  <>
                    <Button 
                      variant="contained" 
                      size="large" 
                      sx={{ 
                        bgcolor: '#ffd700', 
                        color: '#333',
                        '&:hover': { bgcolor: '#ffed4e' }
                      }}
                      onClick={() => navigate('/register')}
                    >
                      Start Free Trial
                      <ArrowIcon sx={{ ml: 1 }} />
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      sx={{ color: 'white', borderColor: 'white' }}
                      onClick={() => navigate('/pricing')}
                    >
                      View Plans
                    </Button>
                  </>
                )}
                {user && user.username && currentPlan === 'free' && (
                  <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ 
                      bgcolor: '#ffd700', 
                      color: '#333',
                      '&:hover': { bgcolor: '#ffed4e' }
                    }}
                    onClick={() => navigate('/pricing')}
                  >
                    Upgrade Plan
                    <ArrowIcon sx={{ ml: 1 }} />
                  </Button>
                )}
                {user && user.username && currentPlan && currentPlan !== 'free' && (
                  <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ 
                      bgcolor: '#ffd700', 
                      color: '#333',
                      '&:hover': { bgcolor: '#ffed4e' }
                    }}
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                    <ArrowIcon sx={{ ml: 1 }} />
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Stats Section - Animated */}
      <Box sx={{ 
        bgcolor: 'white', 
        py: 6,
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <FadeInOnScroll delay={0}>
                <AnimatedCounter end={500} suffix="+" label="Organizations" />
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeInOnScroll delay={0.2}>
                <AnimatedCounter end={99.9} suffix="%" label="Uptime Guarantee" />
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeInOnScroll delay={0.4}>
                <AnimatedCounter end={24} suffix="/7" label="Support Available" />
              </FadeInOnScroll>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeInOnScroll delay={0.6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <RotatingIcon key={i} speed={15 + i * 2}>
                        <StarIcon sx={{ color: '#ffd700', fontSize: 30, ml: 0.5 }} />
                      </RotatingIcon>
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Enterprise Rated
                  </Typography>
                </Box>
              </FadeInOnScroll>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Core Features Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative' }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <FadeInOnScroll delay={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <RotatingIcon speed={20}>
                <VerifiedIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              </RotatingIcon>
              <Typography variant="h3" component="h2" fontWeight={700}>
                Universal Core Features
              </Typography>
            </Box>
          </FadeInOnScroll>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6, mb: 2 }}>
            Built on modern cloud-native architecture with enterprise-grade security, automatic backups, 
            and infinite scalability. Deploy in minutes, scale effortlessly, and focus on what matters—your business.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Every plan includes these powerful core features that work across all industry modules:
          </Typography>
      </Box>

        <Grid container spacing={4}>
          {coreFeatures.map((feature, index) => (
            <Grid gridColumn="span 4" key={index}>
              <FadeInOnScroll delay={index * 0.1}>
                <Card
                  sx={{
                    height: '100%', 
                    p: 3, 
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(102,126,234,0.1), transparent)',
                      transition: 'left 0.5s ease-in-out'
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: 8,
                      '&::before': {
                        left: '100%'
                      },
                      '& .icon-wrapper': {
                        transform: 'scale(1.2) rotate(5deg)',
                        animation: 'iconPulse 1s ease-in-out infinite'
                      },
                      '@keyframes iconPulse': {
                        '0%, 100%': { transform: 'scale(1.2) rotate(5deg)' },
                        '50%': { transform: 'scale(1.3) rotate(-5deg)' }
                      }
                    }
                  }}
                >
                  <Box 
                    className="icon-wrapper"
                    sx={{ 
                      color: 'primary.main', 
                      mb: 2,
                      display: 'inline-block',
                      transition: 'transform 0.3s ease-in-out'
                    }}
                  >
                    {feature.icon}
                  </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                  <List dense>
                  {feature.benefits.map((benefit, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={benefit} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                      </ListItem>
                    ))}
                  </List>
              </Card>
              </FadeInOnScroll>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Industry Modules Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative' }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <FadeInOnScroll delay={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h3" component="h2" fontWeight={700}>
                Industry-Specific Modules
              </Typography>
              <RotatingIcon speed={25}>
                <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              </RotatingIcon>
            </Box>
          </FadeInOnScroll>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
            Six comprehensive industry modules—each purpose-built by experts with pre-configured workflows, 
            industry best practices, and specialized features. From managing students to tracking inventory, 
            booking appointments to processing orders—we've got your industry covered.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {industryModules.map((module, index) => (
            <Grid gridColumn="span 4" key={index}>
              <FadeInOnScroll delay={index * 0.15}>
                <Card sx={{ 
                  height: '100%', 
                  p: 4, 
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${module.bgColor} 0%, ${module.bgColor}dd 100%)`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `radial-gradient(circle, ${module.color}20 0%, transparent 70%)`,
                    animation: 'rotateBg 15s linear infinite',
                    '@keyframes rotateBg': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  },
                  '&:hover': {
                    transform: 'translateY(-15px) scale(1.03)',
                    boxShadow: 12,
                    '& .module-icon': {
                      animation: 'iconFloat 2s ease-in-out infinite',
                      transform: 'scale(1.15)'
                    },
                    '& .module-stats': {
                      animation: 'statsPulse 1.5s ease-in-out infinite'
                    },
                    '@keyframes iconFloat': {
                      '0%, 100%': { transform: 'translateY(0) scale(1.15)' },
                      '50%': { transform: 'translateY(-10px) scale(1.2)' }
                    },
                    '@keyframes statsPulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' }
                    }
                  }
                }}>
                  <Box 
                    className="module-icon"
                    sx={{ 
                      color: module.color, 
                      mb: 3,
                      position: 'relative',
                      zIndex: 1,
                      display: 'inline-block',
                      transition: 'transform 0.3s ease-in-out'
                    }}
                  >
                    {module.icon}
                  </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: module.color }}>
                  {module.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {module.subtitle}
                </Typography>
                
                <Box sx={{ my: 3 }}>
                  {module.features.map((feature, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                      • {feature}
                    </Typography>
                  ))}
                </Box>

                <Box className="module-stats" sx={{ display: 'flex', justifyContent: 'space-around', mt: 3, mb: 2, position: 'relative', zIndex: 1 }}>
                  {Object.entries(module.stats).map(([key, value], idx) => (
                    <FadeInOnScroll key={key} delay={idx * 0.1}>
                      <Box sx={{ 
                        textAlign: 'center',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          '& .stat-value': {
                            animation: 'statGlow 1s ease-in-out infinite',
                            '@keyframes statGlow': {
                              '0%, 100%': { textShadow: `0 0 5px ${module.color}40` },
                              '50%': { textShadow: `0 0 15px ${module.color}80` }
                            }
                          }
                        }
                      }}>
                        <Typography 
                          className="stat-value"
                          variant="h6" 
                          fontWeight={700} 
                          sx={{ 
                            color: module.color,
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: -4,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '60%',
                              height: '2px',
                              background: `linear-gradient(90deg, transparent, ${module.color}, transparent)`,
                              animation: 'lineGrow 1.5s ease-in-out infinite',
                              '@keyframes lineGrow': {
                                '0%, 100%': { width: '0%', opacity: 0 },
                                '50%': { width: '60%', opacity: 1 }
                              }
                            }
                          }}
                        >
                          {value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {key}
                        </Typography>
                      </Box>
                    </FadeInOnScroll>
                  ))}
                </Box>
                
                {/* Use Cases */}
                {module.useCases && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      Perfect for:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {module.useCases.map((useCase, idx) => (
                        <Chip 
                          key={idx}
                          label={useCase} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
                            height: '20px',
                            bgcolor: module.bgColor,
                            color: module.color,
                            border: `1px solid ${module.color}20`
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Card>
              </FadeInOnScroll>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section - hidden for logged-in Free plan users */}
      {!hidePricing && (
        <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Choose Your Plan
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}>
                Start with our free plan and upgrade anytime. All plans include full access to core ERP features, 
                industry-specific modules, mobile apps, and comprehensive support. No hidden fees, cancel anytime.
              </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
              {plans.map((plan, index) => (
                <Grid gridColumn="span 3" key={index}>
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    transform: plan.popular ? 'scale(1.05)' : 'none',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: plan.popular ? 'scale(1.07)' : 'scale(1.02)',
                      boxShadow: 4,
                    },
                  }}>
                    {plan.popular && (
                      <Chip 
                        label="Most Popular" 
                        color="primary" 
                        size="small" 
                        sx={{ mb: 2 }}
                      />
                    )}
                    
                    <Typography variant="h4" sx={{ color: plan.color }} fontWeight={700} gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {plan.description}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}/year`}
                    </Typography>
                    
                    <Box sx={{ my: 2 }}>
                      {plan.features.map((feature, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          • {feature}
                        </Typography>
                      ))}
                    </Box>
                    
                    <Button 
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth 
                      onClick={() => navigate('/register')}
                      sx={{ 
                        mt: 2,
                        bgcolor: plan.popular ? plan.color : 'transparent',
                        color: plan.popular ? 'white' : plan.color,
                        borderColor: plan.color,
                        '&:hover': {
                          bgcolor: plan.popular ? plan.color : plan.color,
                          color: 'white',
                        },
                      }}
                    >
                      {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                      <ArrowIcon sx={{ ml: 1 }} />
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* CTA Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              Ready to Transform Your Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
              Trusted by 500+ organizations across Education, Pharmacy, Retail, Hotel, Restaurant, and Salon industries. 
              Experience the power of streamlined operations with real-time analytics, automated workflows, 
              and seamless integrations—all in one unified platform.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: '#ffd700', 
                  color: '#333',
                  px: 4,
                  py: 1.5,
                  '&:hover': { bgcolor: '#ffed4e' }
                }}
                onClick={() => navigate('/register')}
              >
                Start Free Trial
                <ArrowIcon sx={{ ml: 1 }} />
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  px: 4,
                  py: 1.5,
                  '&:hover': { borderColor: '#ffd700', color: '#ffd700' }
                }}
                onClick={() => navigate('/contact')}
              >
                Contact Sales
              </Button>
            </Box>
            <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
              Free plan includes 2 users & 500 MB storage • Annual billing for paid plans • No credit card required • Upgrade anytime
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 