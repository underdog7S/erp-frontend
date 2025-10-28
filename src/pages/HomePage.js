import React from 'react';
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
  Description as DescriptionIcon
} from '@mui/icons-material';

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
        "Student Management",
        "Class Management",
        "Fee Management",
        "Attendance Tracking",
        "Report Cards",
        "Staff Management",
        "Academic Reports",
        "Parent Portal"
      ],
      stats: { students: "10K+", classes: "500+", schools: "25+" }
    },
    {
      title: "Pharmacy Management",
      subtitle: "Complete Pharmacy Solution",
      icon: <HealthcareIcon sx={{ fontSize: 60 }} />,
      color: "#7b1fa2",
      bgColor: "#f3e5f5",
      features: [
        "Medicine Management",
        "Batch Tracking",
        "Prescription Management",
        "Patient Records",
        "Sales & Billing",
        "Inventory Control",
        "Expiry Alerts",
        "Supplier Management"
      ],
      stats: { medicines: "2K+", patients: "3K+", suppliers: "30+" }
    },
    {
      title: "Retail & Wholesale",
      subtitle: "Complete Multi-Warehouse Solution",
      icon: <ShoppingCartIcon sx={{ fontSize: 60 }} />,
      color: "#388e3c",
      bgColor: "#e8f5e8",
      features: [
        "Multi-warehouse Support",
        "Product Management",
        "Inventory Tracking",
        "Customer Segmentation",
        "Stock Transfers",
        "Goods Receipt",
        "Sales Management",
        "Purchase Orders"
      ],
      stats: { products: "5K+", warehouses: "10+", customers: "2K+" }
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
        "Secure data separation"
      ]
    },
    {
      title: "Role-Based Access Control",
      description: "Granular permissions based on user roles and responsibilities",
      icon: <SecurityIcon />,
      benefits: [
        "Admin, Principal, Staff roles",
        "Feature-based permissions",
        "Industry-specific access",
        "Audit trail"
      ]
    },
    {
      title: "Plan-Based Features",
      description: "Scalable plans with feature limits and storage controls",
      icon: <StorageIcon />,
      benefits: [
        "Free, Starter, Pro plans",
        "User limit controls",
        "Storage monitoring",
        "Feature toggles"
      ]
    },
    {
      title: "Real-Time Dashboard",
      description: "Live analytics and insights for informed decision making",
      icon: <DashboardIcon />,
      benefits: [
        "Live statistics",
        "Usage monitoring",
        "Performance metrics",
        "Alert system"
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
      description: "Perfect for small organizations",
      price: 0,
      color: "#4caf50",
    features: [
        "5 Users",
        "500 MB Storage",
        "1 Industry Module",
        "Basic Support",
        "Core ERP Features",
        "Mobile Access"
      ]
    },
    {
      name: "Starter",
      description: "Great for growing businesses",
      price: 999,
      color: "#2196f3",
    features: [
        "20 Users",
        "2 GB Storage",
        "1 Industry Module",
        "Daily Backups",
        "Priority Support",
        "Advanced Reports"
      ]
    },
    {
      name: "Pro",
      description: "Perfect for established teams",
      price: 2499,
      color: "#9c27b0",
      popular: true,
    features: [
        "50 Users",
        "10 GB Storage",
        "1 Industry Module",
        "API Access",
        "Priority Support",
        "Custom Integrations"
      ]
    },
    {
      name: "Business",
      description: "Best value with annual commitment",
      price: 4999,
      color: "#ff9800",
    features: [
        "150 Users",
        "20 GB Storage",
        "1 Industry Module",
        "Priority Support",
        "Dedicated Manager",
        "Custom Development"
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
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid gridColumn="span 6">
              <Chip 
                label="Multi-Tenant ERP Solution" 
                color="secondary" 
                sx={{ mb: 2 }}
              />
              <Typography variant="h2" component="h1" fontWeight={700} gutterBottom>
                Zenith ERP
                <Box component="span" sx={{ color: '#ffd700', display: 'block' }}>
                  Universal Business Management
        </Box>
          </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                          Complete ERP solution for Education, Pharmacy, and Retail industries. 
          Multi-tenant architecture with role-based access control and plan-based features.
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
            <Grid gridColumn="span 6">
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={process.env.PUBLIC_URL + '/_2173c7d8-8cb1-4996-b9b2-b289c17397fa.jpeg'} 
                  alt="Zenith ERP Dashboard" 
                  style={{ 
                    width: '100%', 
                    maxWidth: 500, 
                    borderRadius: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }} 
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Core Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
            Core ERP Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Built on modern architecture with enterprise-grade security and scalability
          </Typography>
      </Box>

        <Grid container spacing={4}>
          {coreFeatures.map((feature, index) => (
            <Grid gridColumn="span 3" key={index}>
              <Card
                sx={{
                  height: '100%', 
                  p: 3, 
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
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
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Industry Modules Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
            Industry-Specific Modules
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Tailored solutions designed for your specific industry needs
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {industryModules.map((module, index) => (
            <Grid gridColumn="span 4" key={index}>
              <Card sx={{ 
                height: '100%', 
                p: 4, 
                textAlign: 'center',
                background: `linear-gradient(135deg, ${module.bgColor} 0%, ${module.bgColor}dd 100%)`,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 4
                }
              }}>
                <Box sx={{ color: module.color, mb: 3 }}>
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

                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
                  {Object.entries(module.stats).map(([key, value]) => (
                    <Box key={key} sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: module.color }}>
                        {value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {key}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
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
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Start free and scale as you grow. All plans include core ERP features with industry-specific modules.
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
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              Join thousands of organizations using Zenith ERP to streamline their operations
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
              Free plan includes 5 users & 500 MB storage • Annual billing for paid plans • No credit card required • Upgrade anytime
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 