import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, TextField, Button, Grid, Alert,
  CircularProgress, Divider, Chip, Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import api from '../../services/api';

const Integrations = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [keys, setKeys] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    whatsapp_phone_number_id: '',
    whatsapp_access_token: '',
  });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await api.get('/settings/integrations/');
      setKeys(prev => ({ ...prev, ...response.data }));
      setLoading(false);
    } catch (err) {
      setError('Failed to load integration settings');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setKeys({
      ...keys,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/settings/integrations/', keys);
      setSuccess('Integration settings saved successfully! Your custom endpoints are now active.');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, mb: 1, background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Bring Your Own Setup (BYOK)
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Enterprise Integrations: Connect your existing emails and physical phone numbers directly to Zenith ERP.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <form onSubmit={handleSave}>
        
        {/* Email SMTP Integration */}
        <Card sx={{ mb: 4, borderRadius: 2, bgcolor: '#1a1a24', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ color: '#4facfe', mr: 2, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Custom Email Server (SMTP)</Typography>
              <Chip label="Enterprise Feature" size="small" sx={{ ml: 2, bgcolor: 'rgba(79, 172, 254, 0.1)', color: '#4facfe' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Send invoices and alerts using your existing company email (e.g., admin@yourdomain.com). <br/>
              <strong>Instructions:</strong> Generate an "App Password" from your Google Workspace or Zoho Mail security settings. Do NOT use your standard login password.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="SMTP Host (e.g., smtp.gmail.com)" name="smtp_host" value={keys.smtp_host} onChange={handleChange} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="SMTP Port (e.g., 587)" type="number" name="smtp_port" value={keys.smtp_port} onChange={handleChange} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email Address (Username)" name="smtp_username" value={keys.smtp_username} onChange={handleChange} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="App Password" type="password" name="smtp_password" value={keys.smtp_password} onChange={handleChange} variant="outlined" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* WhatsApp Cloud API Integration */}
        <Card sx={{ mb: 4, borderRadius: 2, bgcolor: '#1a1a24', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WhatsAppIcon sx={{ color: '#25D366', mr: 2, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>WhatsApp Business API</Typography>
              <Chip label="Enterprise Feature" size="small" sx={{ ml: 2, bgcolor: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Link your existing physical phone number to WhatsApp. <br/>
              <strong>Instructions:</strong> Go to the <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" style={{color: '#4facfe'}}>Meta Developer Portal</a>, create a WhatsApp Cloud app, verify your phone number, and generate your Permanent Access Token.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Phone Number ID" name="whatsapp_phone_number_id" value={keys.whatsapp_phone_number_id} onChange={handleChange} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Permanent Access Token" type="password" name="whatsapp_access_token" value={keys.whatsapp_access_token} onChange={handleChange} variant="outlined" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Twilio SMS Integration */}
        <Card sx={{ mb: 4, borderRadius: 2, bgcolor: '#1a1a24', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SmsIcon sx={{ color: '#F22F46', mr: 2, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>SMS Gateway (Twilio)</Typography>
              <Chip label="Enterprise Feature" size="small" sx={{ ml: 2, bgcolor: 'rgba(242, 47, 70, 0.1)', color: '#F22F46' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Port your existing phone number or buy a new virtual number from Twilio. <br/>
              <strong>Instructions:</strong> Log into the Twilio Console, copy your Account SID and Auth Token, and paste the specific Phone Number you wish to use for outbound SMS.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Twilio Account SID" name="twilio_account_sid" value={keys.twilio_account_sid} onChange={handleChange} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Twilio Auth Token" type="password" name="twilio_auth_token" value={keys.twilio_auth_token} onChange={handleChange} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={12}>
                <TextField fullWidth label="Twilio Phone Number (e.g., +1234567890)" name="twilio_phone_number" value={keys.twilio_phone_number} onChange={handleChange} variant="outlined" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
          >
            {saving ? 'Saving...' : 'Save All Integrations'}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default Integrations;
