import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Divider,
  Avatar
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  WorkspacePremium as PremiumIcon,
  Business as BusinessIcon,
  FreeBreakfast as FreeIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      key: 'free',
      name: 'Free',
      description: 'Perfect for small teams to get started',
      price: 0,
      original_price: null,
      billing_cycle: 'month',
      color: '#4caf50',
      popular: false,
      icon: <FreeIcon />,
      features: [
        '2 Users',
        '500 MB Storage',
        '1 Industry Module',
        'Standard ERP Features',
        'Community Support'
      ]
    },
    {
      key: 'platform',
      name: 'Platform',
      description: 'Full ERP for businesses with their own comms setup',
      price: 999,
      original_price: 2000,
      billing_cycle: 'month',
      color: '#00e676',
      popular: false,
      icon: <BusinessIcon />,
      badge: 'BYOK',
      features: [
        '10 Users',
        '2 GB Storage',
        'All Industry Modules',
        'Plug In Your Own WhatsApp',
        'Plug In Your Own SMS (Twilio)',
        'Plug In Your Own Email (SMTP)',
        'API Access'
      ]
    },
    {
      key: 'starter',
      name: 'Starter',
      description: 'Ideal for growing businesses',
      price: 2499,
      original_price: 5000,
      billing_cycle: 'year',
      color: '#2196f3',
      popular: true,
      icon: <BusinessIcon />,
      features: [
        '15 Users',
        '5 GB Storage',
        '1 Industry Module',
        'AI Virtual Assistant (OpenAI)',
        'WhatsApp & SMS API Ready',
        'Bring-Your-Own Email Domain',
        'Priority Email Support'
      ]
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'Perfect for established organizations',
      price: 6999,
      original_price: 12000,
      billing_cycle: 'year',
      color: '#9c27b0',
      popular: false,
      icon: <PremiumIcon />,
      features: [
        '50 Users',
        '20 GB Storage',
        'All Industry Modules',
        'Advanced Analytics Dashboard',
        'White-Label Ready (No Watermarks)',
        'Dedicated Cloud Sandbox',
        '24/7 Priority Support'
      ]
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      description: 'For large scale deployments',
      price: 14999,
      original_price: 25000,
      billing_cycle: 'year',
      color: '#ff9800',
      popular: false,
      icon: <StarIcon />,
      features: [
        'Unlimited Users',
        '100 GB Storage',
        'Custom App Development',
        'Dedicated Account Manager',
        'Custom SLA Guarantees',
        'On-Premise Deployment Option'
      ]
    }
  ];

  const handleUpgrade = (plan) => {
    if (plan.key === 'free') {
      navigate('/register');
    } else {
      // Redirect to payment page with plan details
      navigate(`/payment?plan=${plan.key}&amount=${plan.price}`);
    }
  };

  const formatPrice = (price, originalPrice, billingCycle) => {
    if (price === 0) {
      return {
        main: 'Free',
        subtitle: null,
        original: null,
        discount: null
      };
    }
    if (billingCycle === 'year') {
      const monthlyPrice = Math.round(price / 12);
      return {
        main: `₹${price.toLocaleString()}/year`,
        subtitle: `~₹${monthlyPrice}/month`,
        original: originalPrice ? `₹${originalPrice.toLocaleString()}/year` : null,
        discount: originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null
      };
    }
    return {
      main: `₹${price.toLocaleString()}/month`,
      subtitle: null,
      original: originalPrice ? `₹${originalPrice.toLocaleString()}/month` : null,
      discount: originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null
    };
  };

  return (
    <Box sx={{ bgcolor: '#0a0a0f', minHeight: '100vh', py: 4 }}>
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Choose Your Perfect Plan
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Start free and scale as you grow. All plans include core ERP features with industry-specific modules.
          </Typography>
        </Box>

        {/* Plans Grid */}
        <Grid container columns={12} spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid gridColumn="span 3" key={plan.key}>
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.03)',
                  color: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? '2px solid' : '1px solid',
                  borderColor: plan.popular ? 'primary.main' : 'divider',
                  transform: plan.popular ? 'scale(1.05)' : 'none',
                  transition: 'all 0.3s ease-in-out',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${plan.color}00, ${plan.color}80, ${plan.color}00)`,
                    backgroundSize: '200% 100%',
                    animation: plan.popular ? 'shimmer 3s ease-in-out infinite' : 'none',
                    '@keyframes shimmer': {
                      '0%': { backgroundPosition: '200% 0' },
                      '100%': { backgroundPosition: '-200% 0' }
                    }
                  },
                  '&:hover': {
                    transform: plan.popular ? 'scale(1.08) translateY(-8px)' : 'scale(1.05) translateY(-8px)',
                    boxShadow: 8,
                    borderColor: plan.color,
                    '& .plan-icon': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  },
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}
                  />
                )}
                {/* BYOK Badge for Platform Plan */}
                {plan.badge && (
                  <Chip
                    label={plan.badge}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1,
                      bgcolor: '#00e676',
                      color: '#000',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      letterSpacing: 1,
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Plan Header */}
                  <Box textAlign="center" mb={3}>
                    <Avatar
                      className="plan-icon"
                      sx={{
                        bgcolor: plan.color,
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                        transition: 'all 0.3s ease',
                        boxShadow: `0 4px 12px ${plan.color}40`
                      }}
                    >
                      {plan.icon}
                    </Avatar>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {plan.description}
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      {(() => {
                        const priceInfo = formatPrice(plan.price, plan.original_price, plan.billing_cycle);
                        return (
                          <>
                            {priceInfo.original && (
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
                                  {priceInfo.original}
                                </Typography>
                                {priceInfo.discount && (
                                  <Chip
                                    label={`${priceInfo.discount}% OFF`}
                                    size="small"
                                    sx={{
                                      bgcolor: '#f44336',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      height: 22
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                            <Typography 
                              variant="h4" 
                              component="div" 
                              sx={{ 
                                fontWeight: 700, 
                                color: plan.color,
                                mb: priceInfo.subtitle ? 0.5 : 0
                              }}
                            >
                              {priceInfo.main}
                            </Typography>
                            {priceInfo.subtitle && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: '0.875rem' }}
                              >
                                {priceInfo.subtitle}
                              </Typography>
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Features */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Features
                    </Typography>
                    <List dense sx={{ p: 0 }}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={() => handleUpgrade(plan)}
                    sx={{
                      mt: 'auto',
                      bgcolor: plan.popular ? plan.color : 'transparent',
                      color: plan.popular ? 'white' : plan.color,
                      borderColor: plan.color,
                      borderWidth: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
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
                      '&:hover': {
                        bgcolor: plan.color,
                        color: 'white',
                        transform: 'scale(1.05)',
                        boxShadow: `0 8px 24px ${plan.color}60`,
                        '&::before': {
                          left: '100%'
                        }
                      },
                    }}
                  >
                    {plan.key === 'free' ? 'Get Started Free' : 'Choose Plan'}
                    <ArrowIcon sx={{ ml: 1, transition: 'transform 0.3s ease' }} />
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional Information */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Need a Custom Solution?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Contact our sales team for enterprise solutions with custom pricing and features.
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/contact')}
            sx={{ mr: 2 }}
          >
            Contact Sales
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: '#ffd700',
              color: '#333',
              '&:hover': { bgcolor: '#ffed4e' }
            }}
          >
            Start Free Trial
            <ArrowIcon sx={{ ml: 1 }} />
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing; 