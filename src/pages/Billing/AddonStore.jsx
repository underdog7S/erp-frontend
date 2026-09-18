import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, 
  LinearProgress, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, CircularProgress 
} from '@mui/material';
import { 
  WhatsApp as WhatsAppIcon, 
  Email as EmailIcon, 
  Sms as SmsIcon, 
  AutoAwesome as AiIcon,
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';
import axios from 'axios';

const AddonStore = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAddon, setProcessingAddon] = useState(null);
  const [successDialog, setSuccessDialog] = useState({ open: false, addon: '' });

  const fetchUsage = async () => {
    try {
      const response = await axios.get('/api/plans/saas-usage/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setUsage(response.data);
    } catch (error) {
      console.error("Failed to fetch SaaS usage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleBuyAddon = async (addonName, priceINR) => {
    setProcessingAddon(addonName);
    
    // Simulate Razorpay popup
    setTimeout(async () => {
      try {
        // Mocking the backend Razorpay verify endpoint
        await axios.post('/api/payments/razorpay/verify/', {
          razorpay_payment_id: 'pay_mock_' + Date.now(),
          razorpay_order_id: 'order_mock_' + Date.now(),
          razorpay_signature: 'mock_sig',
          addon: addonName
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        
        setSuccessDialog({ open: true, addon: addonName });
        fetchUsage(); // Refresh usage limits
      } catch (error) {
        console.error("Payment failed", error);
        alert("Payment failed or backend returned error. See console.");
      } finally {
        setProcessingAddon(null);
      }
    }, 1500); // Mock 1.5s Razorpay flow
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
        SaaS Add-on Store
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Supercharge your ERP by purchasing API Add-ons. Limits are instantly updated upon purchase.
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
