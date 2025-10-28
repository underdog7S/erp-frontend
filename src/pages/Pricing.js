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
      description: 'Perfect for small organizations',
      price: 0,
      billing_cycle: 'month',
      color: '#4caf50',
      popular: false,
      icon: <FreeIcon />,
      features: [
        '5 Users',
        '500 MB Storage',
        '1 Industry Module',
        'Email Support',
        'Basic Reports',
        'Mobile Access'
      ]
    },
    {
      key: 'starter',
      name: 'Starter',
      description: 'Great for growing businesses',
      price: 999,
      billing_cycle: 'year',
      color: '#2196f3',
      popular: false,
      icon: <BusinessIcon />,
      features: [
        '20 Users',
        '2 GB Storage',
        '1 Industry Module',
        'Daily Backups',
        'Priority Support',
        'Advanced Reports',
        'API Access'
      ]
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'Perfect for established teams',
      price: 2499,
      billing_cycle: 'year',
      color: '#9c27b0',
      popular: true,
      icon: <PremiumIcon />,
      features: [
        '50 Users',
        '10 GB Storage',
        '1 Industry Module',
        'API Access',
        'Priority Support',
        'Advanced Analytics',
        'Custom Integrations',
        'White-label Options'
      ]
    },
    {
      key: 'business',
      name: 'Business',
      description: 'Best value with annual commitment',
      price: 4999,
      billing_cycle: 'year',
      color: '#ff9800',
      popular: false,
      icon: <StarIcon />,
      features: [
        '150 Users',
        '20 GB Storage',
        '1 Industry Module',
        'Priority Support',
        'Dedicated Account Manager',
        'Custom Development',
        'SLA Guarantee',
        'On-premise Option'
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

  const formatPrice = (price, billingCycle) => {
    if (price === 0) {
      return 'Free';
    }
    if (billingCycle === 'year') {
      const monthlyPrice = Math.round(price / 12);
      return `₹${price.toLocaleString()}/year (~₹${monthlyPrice}/month)`;
    }
    return `₹${price.toLocaleString()}/month`;
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
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
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? '2px solid' : '1px solid',
                  borderColor: plan.popular ? 'primary.main' : 'divider',
                  transform: plan.popular ? 'scale(1.05)' : 'none',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: plan.popular ? 'scale(1.07)' : 'scale(1.02)',
                    boxShadow: 4,
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

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Plan Header */}
                  <Box textAlign="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: plan.color,
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
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
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: plan.color }}>
                      {formatPrice(plan.price, plan.billing_cycle)}
                    </Typography>
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
                      '&:hover': {
                        bgcolor: plan.popular ? plan.color : plan.color,
                        color: 'white',
                      },
                    }}
                  >
                    {plan.key === 'free' ? 'Get Started Free' : 'Choose Plan'}
                    <ArrowIcon sx={{ ml: 1 }} />
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