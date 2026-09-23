import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Checkbox, FormControlLabel,
  Alert, CircularProgress, Paper
} from '@mui/material';
import api from '../services/api';

// Public, no-login enquiry page: https://zenitherp.online/lead/<key>
// Also the link/QR target for clients who don't have their own website.
const PublicLeadForm = () => {
  const { key } = useParams();
  const [config, setConfig] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', pincode: '', message: '', website_url: '' });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [doneMessage, setDoneMessage] = useState('');

  useEffect(() => {
    api.get(`/public/lead-form/${key}/config/`)
      .then(res => setConfig(res.data))
      .catch(() => setNotFound(true));
  }, [key]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const params = new URLSearchParams(new URLSearchParams(window.location.search));
      const res = await api.post(`/public/lead-form/${key}/submit/`, {
        ...form, consent, source: params.get('utm_source') || params.get('source') || 'lead_page',
      });
      setDoneMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return <Container maxWidth="sm" sx={{ py: 10 }}><Alert severity="warning">This enquiry form isn't available.</Alert></Container>;
  }
  if (!config) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>{config.business_name}</Typography>
        {doneMessage ? (
          <Alert severity="success" sx={{ mt: 2 }}>{doneMessage}</Alert>
        ) : (
          <form onSubmit={submit}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{config.intro_message}</Typography>
            <TextField fullWidth required label="Your name" value={form.name} onChange={set('name')} margin="dense" />
            <TextField fullWidth label="Phone" type="tel" value={form.phone} onChange={set('phone')} margin="dense" />
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={set('email')} margin="dense" />
            <TextField fullWidth label="Pincode (helps us check distance)" value={form.pincode} onChange={set('pincode')} margin="dense" inputProps={{ maxLength: 6 }} />
            <TextField fullWidth label="How can we help?" value={form.message} onChange={set('message')} margin="dense" multiline rows={3} />
            {/* Honeypot: hidden from people, bots fill it */}
            <input tabIndex={-1} autoComplete="off" value={form.website_url} onChange={set('website_url')}
              style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
            <FormControlLabel
              sx={{ mt: 1, alignItems: 'flex-start' }}
              control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />}
              label={<Typography variant="body2">I agree that {config.business_name} may contact me about my enquiry using the details I gave.</Typography>}
            />
            {error && <Alert severity="error" sx={{ my: 1 }}>{error}</Alert>}
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 1 }}
              disabled={submitting || !consent || !form.name || (!form.phone && !form.email)}>
              {submitting ? 'Sending...' : 'Send enquiry'}
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default PublicLeadForm;
