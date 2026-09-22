import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, TextField, Button, Grid, Alert,
  CircularProgress, Divider, Chip, Switch, FormControlLabel, Tooltip, Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import api from '../../services/api';

/* Small green/grey status dot shown next to each card title */
const StatusDot = ({ active }) =>
  active
    ? <Tooltip title="Configured & Active"><CheckCircleIcon sx={{ color: '#00e676', fontSize: 20, ml: 1 }} /></Tooltip>
    : <Tooltip title="Not configured yet"><RadioButtonUncheckedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20, ml: 1 }} /></Tooltip>;

const Integrations = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planName, setPlanName] = useState('');

  const [keys, setKeys] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_use_tls: true,
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    whatsapp_phone_number_id: '',
    whatsapp_access_token: '',
    openai_api_key: '',
    // status flags returned by server
    has_smtp: false,
    has_twilio: false,
    has_whatsapp: false,
    has_openai: false,
  });

  useEffect(() => {
    fetchKeys();
    // Refresh plan banner if user upgrades from another tab/component
    const onPlanChange = () => fetchKeys();
    window.addEventListener('planChanged', onPlanChange);
    window.addEventListener('userChanged', onPlanChange);
    return () => {
      window.removeEventListener('planChanged', onPlanChange);
      window.removeEventListener('userChanged', onPlanChange);
    };
  }, []);

  const fetchKeys = async () => {
    try {
      const [intResp, planResp] = await Promise.all([
        api.get('/settings/integrations/'),
        api.get('/plans/saas-usage/')
      ]);
      setKeys(prev => ({ ...prev, ...intResp.data }));
      setPlanName(planResp.data?.plan?.toLowerCase() || '');
      setLoading(false);
    } catch (err) {
      setError('Failed to load integration settings');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setKeys({ ...keys, [e.target.name]: val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Strip the has_* read-only flags before posting
      const { has_smtp, has_twilio, has_whatsapp, has_openai, ...payload } = keys;
      await api.post('/settings/integrations/', payload);
      setSuccess('✅ Integration settings saved! Your custom endpoints are now live.');
      fetchKeys(); // Refresh to get updated has_* flags
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const planBanner = () => {
    if (planName === 'platform') return { sev: 'success', msg: <><strong>Platform Plan ✓</strong> — You manage your own telecom. Paste your API keys below to activate SMS, WhatsApp, and Email from your own accounts. We handle the platform, you handle the billing.</> };
    if (planName === 'starter') return { sev: 'info', msg: <><strong>Starter Plan:</strong> We have already provisioned a dedicated phone number and email address for you. These BYOK fields let you override with your own keys if you prefer.</> };
    if (planName === 'pro') return { sev: 'info', msg: <><strong>Pro Plan:</strong> Your managed numbers are active. You can override with your own Twilio / Meta credentials for full control.</> };
    if (planName === 'enterprise') return { sev: 'success', msg: <><strong>Enterprise Plan ✓</strong> — Full BYOK. Paste your Twilio, Meta, SMTP, and OpenAI credentials to route everything through your own accounts.</> };
    return { sev: 'warning', msg: <>BYOK integrations are available on Platform, Starter, Pro, and Enterprise plans. <strong>Upgrade to unlock.</strong></> };
  };

  const banner = planBanner();
  const isByok = ['platform', 'starter', 'pro', 'enterprise'].includes(planName);

  const cardSx = {
    mb: 4, borderRadius: 2,
    bgcolor: '#1a1a24',
    border: '1px solid rgba(255,255,255,0.07)',
  };
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: '#4facfe' },
      '&.Mui-focused fieldset': { borderColor: '#4facfe' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputBase-input': { color: 'white' },
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>

      {/* Page heading */}
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Bring Your Own Setup (BYOK)
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Connect your existing SMS provider, WhatsApp Business account, email server, or OpenAI key directly to ZenERP.
      </Typography>

      {/* Plan banner */}
      <Alert severity={banner.sev} sx={{ mb: 4, borderRadius: 2 }}>{banner.msg}</Alert>

      {error   && <Alert severity="error"   sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <form onSubmit={handleSave}>

        {/* ── SMTP Email ────────────────────────────────── */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ color: '#4facfe', mr: 1.5, fontSize: 30 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Custom Email (SMTP)</Typography>
              <StatusDot active={keys.has_smtp} />
              <Chip label="Platform & above" size="small" sx={{ ml: 'auto', bgcolor: 'rgba(79,172,254,0.12)', color: '#4facfe' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Send invoices, alerts and notifications from <strong>your own email</strong> (e.g. billing@yourcompany.com).<br />
              <strong>How to get App Password:</strong> Gmail → Google Account → Security → 2-Step Verification → App Passwords. Zoho → Security → App Passwords.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="SMTP Host" placeholder="smtp.gmail.com" name="smtp_host" value={keys.smtp_host} onChange={handleChange} variant="outlined" sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="SMTP Port" placeholder="587" type="number" name="smtp_port" value={keys.smtp_port} onChange={handleChange} variant="outlined" sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email Address (Username)" placeholder="billing@yourcompany.com" name="smtp_username" value={keys.smtp_username} onChange={handleChange} variant="outlined" sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="App Password" type="password" name="smtp_password" value={keys.smtp_password} onChange={handleChange} variant="outlined" sx={fieldSx}
                  helperText={keys.smtp_password === '••••••••' ? '🔒 Password saved — enter new value to update' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={keys.smtp_use_tls} onChange={handleChange} name="smtp_use_tls" color="primary" />}
                  label={<Typography variant="body2" color="text.secondary">Use TLS encryption (recommended — port 587)</Typography>}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── WhatsApp ─────────────────────────────────── */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WhatsAppIcon sx={{ color: '#25D366', mr: 1.5, fontSize: 30 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>WhatsApp Business API (Meta)</Typography>
              <StatusDot active={keys.has_whatsapp} />
              <Chip label="Platform & above" size="small" sx={{ ml: 'auto', bgcolor: 'rgba(37,211,102,0.1)', color: '#25D366' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect your <strong>existing WhatsApp Business number</strong> so customers can reach you on your own number.<br />
              <strong>Steps:</strong> <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" style={{ color: '#4facfe' }}>Meta Developer Portal</a> → Create App → WhatsApp product → Add/Verify Phone Number → Copy Phone Number ID → Generate Permanent System User Token from Business Manager.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Phone Number ID" placeholder="1234567890123456" name="whatsapp_phone_number_id" value={keys.whatsapp_phone_number_id} onChange={handleChange} variant="outlined" sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Permanent Access Token" type="password" name="whatsapp_access_token" value={keys.whatsapp_access_token} onChange={handleChange} variant="outlined" sx={fieldSx}
                  helperText={keys.whatsapp_access_token === '••••••••' ? '🔒 Token saved — enter new value to update' : ''}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Twilio SMS ───────────────────────────────── */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SmsIcon sx={{ color: '#F22F46', mr: 1.5, fontSize: 30 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>SMS Gateway (Twilio)</Typography>
              <StatusDot active={keys.has_twilio} />
              <Chip label="Platform & above" size="small" sx={{ ml: 'auto', bgcolor: 'rgba(242,47,70,0.1)', color: '#F22F46' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Send SMS from <strong>your own Twilio number</strong>. You can port your existing physical number OR buy a new virtual number at ~₹95/month.<br />
              <strong>Steps:</strong> <a href="https://console.twilio.com/" target="_blank" rel="noreferrer" style={{ color: '#4facfe' }}>Twilio Console</a> → Dashboard → Copy Account SID & Auth Token → Phone Numbers → Buy or Port a number.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Account SID" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" name="twilio_account_sid" value={keys.twilio_account_sid} onChange={handleChange} variant="outlined" sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Auth Token" type="password" name="twilio_auth_token" value={keys.twilio_auth_token} onChange={handleChange} variant="outlined" sx={fieldSx}
                  helperText={keys.twilio_auth_token === '••••••••' ? '🔒 Token saved — enter new value to update' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Twilio Phone Number" placeholder="+919876543210" name="twilio_phone_number" value={keys.twilio_phone_number} onChange={handleChange} variant="outlined" sx={fieldSx}
                  helperText="Enter in international format with + prefix, e.g. +919876543210"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── OpenAI ───────────────────────────────────── */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SmartToyIcon sx={{ color: '#a78bfa', mr: 1.5, fontSize: 30 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>OpenAI (AI Assistant)</Typography>
              <StatusDot active={keys.has_openai} />
              <Chip label="Pro & Enterprise" size="small" sx={{ ml: 'auto', bgcolor: 'rgba(167,139,250,0.12)', color: '#a78bfa' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Power the AI chat assistant, smart reply suggestions, and document generation with your own OpenAI account. You control usage and billing directly.<br />
              <strong>Steps:</strong> <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#4facfe' }}>platform.openai.com/api-keys</a> → Create new secret key → Paste below.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="OpenAI API Key" type="password" placeholder="sk-proj-..." name="openai_api_key" value={keys.openai_api_key || ''} onChange={handleChange} variant="outlined" sx={fieldSx}
                  helperText={keys.openai_api_key === '••••••••' ? '🔒 Key saved — enter new value to update' : 'Your API key stays on our servers and is never shared.'}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 2, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              🔒 All credentials are encrypted at rest. Sensitive values (tokens, passwords) are never returned to the browser — only a masked placeholder is shown after saving.
            </Typography>
          </Paper>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={saving || !isByok}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ px: 5, py: 1.5, borderRadius: 2, fontWeight: 'bold', background: isByok ? 'linear-gradient(45deg, #00f2fe, #4facfe)' : undefined, color: 'black' }}
          >
            {saving ? 'Saving...' : 'Save All Integrations'}
          </Button>
        </Box>

      </form>
    </Container>
  );
};

export default Integrations;
