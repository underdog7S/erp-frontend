import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import api from '../../services/api';

const Integrations = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [keys, setKeys] = useState({
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_region: 'ap-south-1',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    whatsapp_phone_number_id: '',
    whatsapp_access_token: '',
    telegram_bot_token: '',
    telegram_chat_id: ''
  });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await api.get('/settings/integrations/');
      setKeys({
        aws_access_key_id: response.data.aws_access_key_id || '',
        aws_secret_access_key: response.data.aws_secret_access_key || '',
        aws_region: response.data.aws_region || 'ap-south-1',
        twilio_account_sid: response.data.twilio_account_sid || '',
        twilio_auth_token: response.data.twilio_auth_token || '',
        twilio_phone_number: response.data.twilio_phone_number || '',
        whatsapp_phone_number_id: response.data.whatsapp_phone_number_id || '',
        whatsapp_access_token: response.data.whatsapp_access_token || '',
        telegram_bot_token: response.data.telegram_bot_token || '',
        telegram_chat_id: response.data.telegram_chat_id || '',
      });
    } catch (err) {
      setError('Failed to load integration settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setKeys({ ...keys, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/settings/integrations/', keys);
      setSuccess('Integration settings saved successfully! Your ERP will now use these keys.');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, bgcolor: '#0a0a0f', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0f', minHeight: '100vh', pt: 4, pb: 10 }}>
      <Container maxWidth="md">
        <Typography variant="h4" color="white" fontWeight="bold" gutterBottom>
          Third-Party Integrations (BYOK)
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Bring your own API keys. If provided, the ERP will use these dedicated credentials instead of the shared platform APIs for a true postpaid experience.
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          
          {/* AWS SNS */}
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FF9900' }} gutterBottom>
                Amazon Web Services (AWS SNS for SMS)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Connect your AWS account for true postpaid SMS delivery.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="AWS Access Key ID"
                    name="aws_access_key_id"
                    value={keys.aws_access_key_id}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="AWS Secret Access Key"
                    name="aws_secret_access_key"
                    type="password"
                    value={keys.aws_secret_access_key}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="AWS Region"
                    name="aws_region"
                    value={keys.aws_region}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="e.g. ap-south-1"
                    sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Meta WhatsApp */}
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#25D366' }} gutterBottom>
                Meta WhatsApp Cloud API
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Connect your dedicated WhatsApp Business number (Postpaid).
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="WhatsApp Phone Number ID"
                    name="whatsapp_phone_number_id"
                    value={keys.whatsapp_phone_number_id}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="WhatsApp Permanent Access Token"
                    name="whatsapp_access_token"
                    type="password"
                    value={keys.whatsapp_access_token}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Twilio Fallback */}
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', mb: 4 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Twilio (Alternative SMS Configuration)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Only fill this out if you are using Twilio instead of AWS SNS.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Twilio Account SID"
                    name="twilio_account_sid"
                    value={keys.twilio_account_sid}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Twilio Auth Token"
                    name="twilio_auth_token"
                    type="password"
                    value={keys.twilio_auth_token}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Twilio Sender Phone Number"
                    name="twilio_phone_number"
                    value={keys.twilio_phone_number}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="+1234567890"
                    sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Integrations'}
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default Integrations;
