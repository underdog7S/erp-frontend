import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, LinearProgress, Button, 
  CircularProgress, Chip, IconButton 
} from '@mui/material';
import { 
  Language as DomainIcon, 
  Chat as SmsIcon, 
  WhatsApp as WhatsAppIcon, 
  AutoAwesome as AiIcon,
  AddShoppingCart as AddCartIcon
} from '@mui/icons-material';
import api from '../services/api';

const SaaSUsageWidget = ({ onUpgradeClick }) => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await api.get('/plans/saas-usage/');
        setUsage(response.data);
      } catch (err) {
        setError("Could not load SaaS quota data.");
        console.error("SaaS usage error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <Card sx={{ bgcolor: '#1a1a24', color: 'white', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress color="primary" />
      </Card>
    );
  }

  if (error || !usage) {
    return null;
  }

  const renderUsageBar = (used, limit, label, IconComponent, color) => {
    const percent = limit > 0 ? (used / limit) * 100 : 0;
    const isNearingLimit = percent > 85;

    return (
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <IconComponent sx={{ color }} />
            <Typography variant="body1" fontWeight="600">{label}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: isNearingLimit ? '#f44336' : 'rgba(255,255,255,0.7)' }}>
            {used} / {limit} Used
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(percent, 100)} 
          sx={{ 
            height: 8, 
            borderRadius: 4, 
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              background: isNearingLimit ? '#f44336' : color
            }
          }} 
        />
      </Box>
    );
  };

  return (
    <Card sx={{ bgcolor: '#1a1a24', color: 'white', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">SaaS APIs & Quotas</Typography>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<AddCartIcon />}
            onClick={onUpgradeClick}
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { borderColor: '#00f2fe' } }}
          >
            Buy Add-ons
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box p={2} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={2}>COMMUNICATIONS</Typography>
              
              {usage.sms?.enabled ? (
                renderUsageBar(usage.sms.used, usage.sms.limit, "SMS Messages", SmsIcon, "#2196f3")
              ) : (
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <SmsIcon sx={{ color: 'rgba(255,255,255,0.2)' }} />
                    <Typography color="text.secondary">SMS Integration</Typography>
                  </Box>
                  <Chip label="Locked" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                </Box>
              )}

              {usage.whatsapp?.enabled ? (
                renderUsageBar(usage.whatsapp.used, usage.whatsapp.limit, "WhatsApp Cloud API", WhatsAppIcon, "#4caf50")
              ) : (
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <WhatsAppIcon sx={{ color: 'rgba(255,255,255,0.2)' }} />
                    <Typography color="text.secondary">WhatsApp API</Typography>
                  </Box>
                  <Chip label="Locked" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box p={2} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" mb={2}>ADVANCED SERVICES</Typography>
              
              {usage.ai?.enabled ? (
                renderUsageBar(usage.ai.used, usage.ai.limit, "OpenAI Tokens", AiIcon, "#b388ff")
              ) : (
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <AiIcon sx={{ color: 'rgba(255,255,255,0.2)' }} />
                    <Typography color="text.secondary">AI Agent (OpenAI)</Typography>
                  </Box>
                  <Chip label="Locked" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                </Box>
              )}

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <DomainIcon sx={{ color: usage.email?.enabled ? "#00f2fe" : 'rgba(255,255,255,0.2)' }} />
                  <Typography color={usage.email?.enabled ? "white" : "text.secondary"}>
                    Custom Domain
                  </Typography>
                </Box>
                {usage.email?.enabled ? (
                  <Typography variant="body2" color="#00f2fe">{usage.email.domain}</Typography>
                ) : (
                  <Chip label="Locked" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                )}
              </Box>

            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SaaSUsageWidget;
