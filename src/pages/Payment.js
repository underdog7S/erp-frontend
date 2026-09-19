import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import api, { getPaymentOptions } from '../services/api';

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';
const isRazorpayConfigured = RAZORPAY_KEY_ID !== 'YOUR_RAZORPAY_KEY_ID';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const planFromQuery = queryParams.get('plan') || 'Free';
  const amountFromQuery = queryParams.get('amount') || '';

  const [plan, setPlan] = useState(planFromQuery);
  const [amount, setAmount] = useState(amountFromQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState(null);
  const [paymentOptionsLoading, setPaymentOptionsLoading] = useState(true);
  const [paymentOptionsError, setPaymentOptionsError] = useState('');
  const [razorpayReady, setRazorpayReady] = useState(typeof window !== 'undefined' && !!window.Razorpay);
  const displayAmount = Number(amount) > 0 ? Number(amount) : 0;
  const backendRazorpayEnabled = paymentOptions?.razorpay?.enabled ?? true;
  const effectiveRazorpayEnabled = isRazorpayConfigured && backendRazorpayEnabled;
  const upiSettings = paymentOptions?.upi || {};
  const showUpiOption = Boolean(upiSettings.upi_payments_enabled && upiSettings.upi_id);

  useEffect(() => {
    if (success) {
      // Optionally, you can add a short delay before redirecting
      const timer = setTimeout(() => {
        // Optionally, trigger a dashboard refresh by updating localStorage or dispatching an event
        window.dispatchEvent(new Event('planChanged'));
        navigate('/dashboard');
      }, 2000); // 2 seconds
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserInfo(parsed);
      }
    } catch {
      setUserInfo(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadPaymentOptions = async () => {
      try {
        setPaymentOptionsLoading(true);
        const data = await getPaymentOptions();
        if (isMounted) {
          setPaymentOptions(data);
          setPaymentOptionsError('');
        }
      } catch (err) {
        if (isMounted) {
          setPaymentOptionsError(err.response?.data?.error || 'Unable to load payment options right now.');
        }
      } finally {
        if (isMounted) {
          setPaymentOptionsLoading(false);
        }
      }
    };
    loadPaymentOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter a payable amount greater than zero before continuing.');
      return;
    }

    if (!effectiveRazorpayEnabled) {
      setError('Razorpay payments are currently disabled. Please reach out to your administrator.');
      return;
    }

    if (!razorpayReady || typeof window === 'undefined' || !window.Razorpay) {
      setError('Payment widget is still loading. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Create order from backend
      const res = await api.post('/payments/razorpay/order/', { amount: numericAmount });
      const data = res.data;
      if (!data.order) throw new Error(data.error || 'Failed to create order');
      const { order } = data;

      // 2. Open Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ERP Payment',
        description: `Upgrade to ${plan} plan`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Handle payment success (send to backend for verification)
          try {
            const verifyRes = await api.post('/payments/razorpay/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              amount: numericAmount,
            });
            setSuccess('Payment verified and plan upgraded! Redirecting to dashboard...');
          } catch (err) {
            setError('Payment succeeded but verification failed: ' + (err.response?.data?.error || err.message));
          }
        },
        prefill: {
          email: '',
        },
        theme: {
          color: '#3399cc',
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => setError('Unable to load Razorpay checkout script. Please refresh and try again.');
    document.body.appendChild(script);
    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  const upiPaymentUri = useMemo(() => {
    if (!showUpiOption || displayAmount <= 0) return '';
    const params = new URLSearchParams({
      pa: upiSettings.upi_id,
      pn: upiSettings.upi_display_name || userInfo?.tenant?.name || 'Account Owner',
      am: displayAmount.toFixed(2),
      cu: 'INR',
    });
    const note = (upiSettings.upi_notes || `Plan upgrade (${plan})`).slice(0, 60);
    params.set('tn', note);
    return `upi://pay?${params.toString()}`;
  }, [showUpiOption, upiSettings, displayAmount, userInfo, plan]);

  const handleCopy = (value, message = 'Copied to clipboard') => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setSuccess(message);
    setTimeout(() => setSuccess(''), 2500);
  };

  const razorpayStatusText = !isRazorpayConfigured
    ? 'Not configured'
    : backendRazorpayEnabled
      ? 'Configured'
      : 'Disabled';
  const razorpayStatusDetail = !isRazorpayConfigured
    ? 'Contact admin'
    : backendRazorpayEnabled
      ? 'Ready to accept payments'
      : 'Disabled by admin';
  const razorpayStatusColor = !isRazorpayConfigured
    ? 'warning'
    : backendRazorpayEnabled
      ? 'success'
      : 'default';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', my: 4, px: { xs: 2, md: 0 } }}>
      <Typography variant="h4" gutterBottom>
        Upgrade Plan
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: 'Current Plan',
            value: plan || 'Free',
            detail: 'Subscription tier',
            color: 'primary'
          },
          {
            label: 'Tenant',
            value: userInfo?.tenant?.name || userInfo?.company || 'Unknown',
            detail: 'Tenant/account',
            color: 'secondary'
          },
          {
            label: 'Razorpay status',
            value: paymentOptionsLoading ? 'Checking...' : razorpayStatusText,
            detail: paymentOptionsLoading ? 'Fetching tenant payment status' : razorpayStatusDetail,
            color: razorpayStatusColor
          },
          {
            label: 'UPI Payments',
            value: paymentOptionsLoading ? 'Checking...' : (showUpiOption ? 'Enabled' : 'Unavailable'),
            detail: showUpiOption ? upiSettings.upi_id : 'Configure under Razorpay Settings',
            color: showUpiOption ? 'success' : 'default'
          },
          {
            label: 'Amount (INR)',
            value: amount ? `₹${Number(amount).toLocaleString('en-IN')}` : 'Enter amount',
            detail: 'Payable amount',
            color: 'info'
          }
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  {card.label}
                </Typography>
                <Typography variant="h6" color={`${card.color}.main`} sx={{ mt: 1 }}>
                  {card.value || '-'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {card.detail}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Center
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Use Razorpay to upgrade your plan. Your tenant and billing details are prefilled where available.
          </Typography>
          {(!isRazorpayConfigured || !backendRazorpayEnabled) && (
            <Alert severity={isRazorpayConfigured ? 'info' : 'warning'} sx={{ mb: 2 }}>
              {isRazorpayConfigured
                ? 'Razorpay is disabled for your tenant. Please contact the administrator if you need to re-enable online payments.'
                : 'Razorpay keys are not configured yet. Please reach out to your administrator before attempting to pay.'}
            </Alert>
          )}
          {paymentOptionsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {paymentOptionsError}
            </Alert>
          )}
          <Box component="form" onSubmit={handlePayment} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Plan"
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  fullWidth
                  required
                  helperText="Describe the plan you want to upgrade to (e.g., Growth, Pro, Enterprise)."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Amount (INR)"
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  fullWidth
                  required
                  helperText="Enter the amount you want to pay; it must be greater than zero."
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !effectiveRazorpayEnabled || !razorpayReady}
                  startIcon={loading && <CircularProgress size={18} color="inherit" />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {loading
                    ? 'Processing...'
                    : !effectiveRazorpayEnabled
                      ? 'Payment Not Available'
                      : !razorpayReady
                        ? 'Loading Gateway...'
                        : `Pay ₹${displayAmount.toLocaleString('en-IN')} & Upgrade`}
                </Button>
              </Grid>
            </Grid>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </CardContent>
      </Card>

      {showUpiOption && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pay via UPI
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Enter an amount above to generate a QR code tied to your tenant&apos;s UPI ID. After paying, share the confirmation with support to activate your plan.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                  {displayAmount > 0 ? (
                    <>
                      <QRCodeSVG value={upiPaymentUri} size={180} />
                      <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                        Scan & pay ₹{displayAmount.toLocaleString('en-IN')}
                      </Typography>
                    </>
                  ) : (
                    <Alert severity="info" sx={{ width: '100%' }}>
                      Enter an amount to generate a QR code.
                    </Alert>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2">
                    <strong>UPI ID:</strong> {upiSettings.upi_id}{' '}
                    <Button size="small" onClick={() => handleCopy(upiSettings.upi_id, 'UPI ID copied to clipboard.')}>
                      Copy
                    </Button>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Receiver:</strong> {upiSettings.upi_display_name || userInfo?.tenant?.name || 'Account Owner'}
                  </Typography>
                  {upiSettings.upi_notes && (
                    <Typography variant="body2" color="textSecondary">
                      <strong>Instructions:</strong> {upiSettings.upi_notes}
                    </Typography>
                  )}
                  {upiPaymentUri && (
                    <Button variant="outlined" onClick={() => handleCopy(upiPaymentUri, 'UPI payment link copied.')}>
                      Copy payment link
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Payment; 