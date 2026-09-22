import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button,
  LinearProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  AutoAwesome as AiIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddonStore = () => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState(null);
  const [plans, setPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAddon, setProcessingAddon] = useState(null);
  const [successDialog, setSuccessDialog] = useState({ open: false, addon: '' });

  const fetchUsage = async () => {
    try {
      const response = await api.get('/plans/saas-usage/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setUsage(response.data);
    } catch (error) {
      console.error("Failed to fetch SaaS usage:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans/');
      setPlans(response.data);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    }
  };

  const handleUpgradePlan = (plan) => {
    navigate(`/payment?plan=${plan.key}&amount=${plan.price}`);
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/paymenttransactions/');
      const billingOnly = (response.data || []).filter(t => t.sector === 'general' || t.sector === 'plan');
      setTransactions(billingOnly);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }
  };

  const handleDownloadReceipt = async (transactionId) => {
    setDownloadingId(transactionId);
    try {
      const response = await api.get(`/payments/receipt/${transactionId}/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download receipt:", error);
      alert("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    fetchUsage();
    fetchPlans();
    fetchTransactions();
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleBuyAddon = async (addonName, priceINR) => {
    const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!window.Razorpay || !razorpayKeyId) {
      alert('Payments are not configured yet. Please contact the administrator.');
      return;
    }

    setProcessingAddon(addonName);
    try {
      const orderRes = await api.post('/payments/razorpay/order/', {
        amount: priceINR,
        currency: 'INR',
        receipt: `addon_${addonName}_${Date.now()}`
      });
      const order = orderRes.data.order;

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'ZenERP',
        description: `${addonName.toUpperCase()} Add-on`,
        theme: { color: '#00f2fe' },
        handler: async (response) => {
          try {
            await api.post('/payments/razorpay/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              addon: addonName
            });
            setSuccessDialog({ open: true, addon: addonName });
            fetchUsage(); // Refresh usage limits
            fetchTransactions(); // Show the new payment in history
          } catch (error) {
            console.error("Payment verification failed", error);
            alert(error.response?.data?.error || "Payment verification failed. Please contact support.");
          } finally {
            setProcessingAddon(null);
          }
        },
        modal: {
          ondismiss: () => setProcessingAddon(null)
        }
      });
      rzp.on('payment.failed', (response) => {
        console.error("Payment failed", response.error);
        alert(response.error?.description || 'Payment failed.');
        setProcessingAddon(null);
      });
      rzp.open();
    } catch (error) {
      console.error("Failed to create payment order", error);
      alert(error.response?.data?.error || "Failed to start payment. Please try again.");
      setProcessingAddon(null);
    }
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (!usage) return <Box p={4}><Typography color="error">Failed to load limits.</Typography></Box>;

  const addons = [
    { 
      id: 'whatsapp', name: 'WhatsApp Cloud API', icon: <WhatsAppIcon />, 
      desc: 'Send utility and marketing messages directly to customers via WhatsApp.', 
      price: '₹1,499 / mo', priceVal: 1499,
      enabled: usage.is_whatsapp_enabled, 
      used: usage.whatsapp_used, limit: usage.whatsapp_limit 
    },
    { 
      id: 'ai', name: 'AI Auto-Responder', icon: <AiIcon />, 
      desc: 'Give your inbox an AI brain to answer customer queries 24/7.', 
      price: '₹2,499 / mo', priceVal: 2499,
      enabled: usage.is_ai_enabled, 
      used: usage.ai_tokens_used, limit: usage.ai_tokens_limit 
    },
    { 
      id: 'email', name: 'Custom Domain Email', icon: <EmailIcon />, 
      desc: 'Send invoices and marketing campaigns from your own domain (e.g., info@yourbiz.com).', 
      price: '₹999 / mo', priceVal: 999,
      enabled: usage.is_custom_email_enabled, 
      used: 0, limit: 'Unlimited' 
    },
    { 
      id: 'sms', name: 'SMS Credit Pack', icon: <SmsIcon />, 
      desc: '1,000 SMS credits for OTPs, Reminders, and Billing.', 
      price: '₹499', priceVal: 499,
      enabled: usage.is_sms_enabled, 
      used: usage.sms_used, limit: usage.sms_limit 
    }
  ];

  return (
    <Box p={4} sx={{ bgcolor: '#0a0a0f', minHeight: '100vh', color: 'white' }}>
      <Typography variant="h4" fontWeight="bold" mb={1} sx={{ color: '#00f2fe' }}>
        Billing & Plans
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage your subscription plan and API add-ons in one place.
      </Typography>

      <Typography variant="h5" fontWeight="bold" mb={1} sx={{ color: 'white' }}>
        Your Plan
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Current plan: <strong>{usage.plan || 'Free'}</strong>. Upgrade anytime — takes effect immediately after payment.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {plans.map(plan => {
          const isCurrent = (usage.plan || 'free').toLowerCase() === plan.key;
          return (
            <Grid item xs={12} md={6} lg={2.4} key={plan.key}>
              <Card sx={{
                height: '100%', display: 'flex', flexDirection: 'column',
                bgcolor: '#1a1a24', border: '1px solid',
                borderColor: isCurrent ? '#00e676' : (plan.popular ? '#00f2fe' : 'rgba(255,255,255,0.1)')
              }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight="bold">{plan.name}</Typography>
                    {isCurrent && <Chip size="small" label="Current" sx={{ bgcolor: 'rgba(0,230,118,0.2)', color: '#00e676' }} />}
                    {!isCurrent && plan.popular && <Chip size="small" label="Popular" sx={{ bgcolor: 'rgba(0,242,254,0.2)', color: '#00f2fe' }} />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2} sx={{ flex: 1 }}>
                    {plan.description}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" mb={2}>
                    {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                    {plan.price > 0 && <Typography component="span" variant="body2" color="text.secondary"> /{plan.billing_cycle === 'annual' ? 'yr' : 'mo'}</Typography>}
                  </Typography>
                  <Button
                    variant={isCurrent ? 'outlined' : 'contained'}
                    fullWidth
                    disabled={isCurrent}
                    onClick={() => handleUpgradePlan(plan)}
                    sx={{
                      bgcolor: isCurrent ? 'transparent' : '#00f2fe',
                      color: isCurrent ? '#00e676' : 'black',
                      borderColor: '#00e676',
                      fontWeight: 'bold'
                    }}
                  >
                    {isCurrent ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="h5" fontWeight="bold" mb={1} sx={{ color: 'white' }}>
        Add-ons
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Top up individual features without changing your whole plan.
      </Typography>

      <Grid container spacing={3}>
        {addons.map(addon => {
          const progress = addon.limit !== 'Unlimited' && addon.limit > 0 
            ? Math.min(100, (addon.used / addon.limit) * 100) 
            : 0;
            
          return (
            <Grid item xs={12} md={6} lg={3} key={addon.id}>
              <Card sx={{ 
                height: '100%', display: 'flex', flexDirection: 'column', 
                bgcolor: '#1a1a24', border: '1px solid',
                borderColor: addon.enabled ? '#00f2fe' : 'rgba(255,255,255,0.1)'
              }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(0,242,254,0.1)', color: '#00f2fe', borderRadius: 2 }}>
                      {addon.icon}
                    </Box>
                    {addon.enabled ? (
                      <Chip size="small" icon={<CheckCircleIcon />} label="Active" color="success" sx={{ bgcolor: 'rgba(46, 125, 50, 0.2)' }} />
                    ) : (
                      <Chip size="small" label="Inactive" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    )}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" mb={1}>{addon.name}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={3} sx={{ flex: 1 }}>
                    {addon.desc}
                  </Typography>

                  {/* Usage Bar */}
                  {addon.enabled && addon.limit !== 'Unlimited' && (
                    <Box mb={3} p={1.5} sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption">Usage</Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {addon.used.toLocaleString()} / {addon.limit.toLocaleString()}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': { bgcolor: progress > 90 ? '#f44336' : '#00f2fe' }
                        }} 
                      />
                    </Box>
                  )}

                  {/* Buy Button */}
                  <Button 
                    variant={addon.enabled ? "outlined" : "contained"}
                    fullWidth
                    disabled={processingAddon === addon.id}
                    onClick={() => handleBuyAddon(addon.id, addon.priceVal)}
                    sx={{ 
                      mt: 'auto',
                      bgcolor: addon.enabled ? 'transparent' : '#00f2fe',
                      color: addon.enabled ? '#00f2fe' : 'black',
                      borderColor: '#00f2fe',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: addon.enabled ? 'rgba(0,242,254,0.1)' : '#4facfe' }
                    }}
                  >
                    {processingAddon === addon.id ? <CircularProgress size={24} color="inherit" /> : 
                     addon.enabled ? `Top Up (${addon.price})` : `Buy Now (${addon.price})`}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {transactions.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" mb={1} mt={6} sx={{ color: 'white' }}>
            Payment History
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Download a receipt for any past plan or add-on payment.
          </Typography>
          <TableContainer component={Paper} sx={{ bgcolor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Date</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Description</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Amount</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }} align="right">Receipt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(t => (
                  <TableRow key={t.id}>
                    <TableCell sx={{ color: 'white' }}>{new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{t.description || (t.plan ? `${t.plan} Plan` : 'Payment')}</TableCell>
                    <TableCell sx={{ color: 'white' }}>₹{Number(t.amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={t.status}
                        sx={{
                          textTransform: 'capitalize',
                          bgcolor: t.status === 'verified' || t.status === 'success' ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.1)',
                          color: t.status === 'verified' || t.status === 'success' ? '#00e676' : 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={downloadingId === t.id}
                        startIcon={downloadingId === t.id ? <CircularProgress size={14} /> : <DownloadIcon />}
                        onClick={() => handleDownloadReceipt(t.id)}
                        sx={{ color: '#00f2fe', borderColor: '#00f2fe' }}
                      >
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog
        open={successDialog.open} 
        onClose={() => setSuccessDialog({ open: false, addon: '' })}
        PaperProps={{ sx: { bgcolor: '#1a1a24', color: 'white', border: '1px solid #00f2fe' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon sx={{ color: '#00f2fe' }} /> Payment Successful!
        </DialogTitle>
        <DialogContent>
          <Typography>
            Your {successDialog.addon.toUpperCase()} add-on limits have been instantly updated.
          </Typography>
          {successDialog.addon === 'email' && (
            <Typography variant="body2" color="warning.main" mt={2} sx={{ p: 1, bgcolor: 'rgba(237, 108, 2, 0.1)', borderRadius: 1 }}>
              Note: Because you purchased the Custom Domain Email add-on, an Admin will email you DNS Records shortly to verify your domain with AWS SES.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialog({ open: false, addon: '' })} sx={{ color: '#00f2fe' }}>
            Awesome
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddonStore;
