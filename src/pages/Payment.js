import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { fetchUserMe } from '../services/api';

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';
const isRazorpayConfigured = RAZORPAY_KEY_ID !== 'YOUR_RAZORPAY_KEY_ID' && RAZORPAY_KEY_ID !== '';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(searchParams.get('plan') || '');
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  
  const displayAmount = Number(amount) > 0 ? Number(amount) : 0;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchUserMe();
        setUserInfo(user);
      } catch (e) {
        console.error("Failed to load user info");
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    // If Razorpay script isn't loaded, load it
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!isRazorpayConfigured) {
      setError('SaaS Payment Gateway is not configured. Please add REACT_APP_RAZORPAY_KEY_ID in Vercel.');
      return;
    }

    if (!displayAmount || displayAmount <= 0) {
      setError('Enter a valid payable amount.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. Create order on backend using Platform Keys
      const orderResponse = await api.post('/payments/create-order/', {
        amount: displayAmount,
        currency: 'INR',
        receipt: `saas_upgrade_${plan}`
      });

      const { order_id, amount: orderAmount, currency } = orderResponse.data;

      // 2. Open Razorpay Widget
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: currency,
        name: 'ZenVerse SaaS',
        description: `Upgrade to ${plan} Plan`,
        order_id: order_id,
        prefill: {
          name: userInfo?.first_name || userInfo?.username || '',
          email: userInfo?.email || ''
        },
        theme: {
          color: '#1976d2'
        },
        handler: async function (response) {
          try {
            await api.post('/payments/verify-payment/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            // Apply SaaS Upgrade via Plan API
            await api.post('/plan/change/', { plan: plan.toLowerCase() });
            
            setSuccess('Payment successful! Your tenant has been upgraded.');
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } catch (err) {
            setError('Payment verification failed.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment failed');
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', my: 6, px: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
        Upgrade Your SaaS Plan
      </Typography>
      
      <Card sx={{ mt: 4, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Checkout Center
          </Typography>
          
          {!isRazorpayConfigured && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              SaaS Checkout is locked. <strong>REACT_APP_RAZORPAY_KEY_ID</strong> is missing from your Vercel Environment Variables.
            </Alert>
          )}

          <Box component="form" onSubmit={handlePayment}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Target Plan"
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Amount (INR)"
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || !isRazorpayConfigured}
                  startIcon={loading && <CircularProgress size={18} color="inherit" />}
                  fullWidth
                >
                  {loading ? 'Initializing Gateway...' : `Pay ₹${displayAmount.toLocaleString('en-IN')} via Razorpay`}
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payment;