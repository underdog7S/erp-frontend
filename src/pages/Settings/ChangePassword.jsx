import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import api from '../../services/api';

// Self-service password change for any logged-in user (not just admins).
const ChangePassword = () => {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [status, setStatus] = useState(null); // {type, text}
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const mismatch = form.confirm !== '' && form.confirm !== form.new_password;

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      const res = await api.post('/users/change-password/', {
        old_password: form.old_password, new_password: form.new_password,
      });
      setStatus({ type: 'success', text: res.data.message || 'Password changed.' });
      setForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      const d = err.response?.data;
      setStatus({ type: 'error', text: d?.error || d?.detail || 'Could not change password. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 480, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Change password</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Use at least 12 characters. Avoid passwords you use elsewhere.
        </Typography>
        <form onSubmit={submit}>
          <TextField fullWidth required type="password" margin="dense" label="Current password"
            autoComplete="current-password" value={form.old_password} onChange={set('old_password')} />
          <TextField fullWidth required type="password" margin="dense" label="New password"
            autoComplete="new-password" value={form.new_password} onChange={set('new_password')} />
          <TextField fullWidth required type="password" margin="dense" label="Confirm new password"
            autoComplete="new-password" value={form.confirm} onChange={set('confirm')}
            error={mismatch} helperText={mismatch ? 'Passwords do not match' : ' '} />
          {status && <Alert severity={status.type} sx={{ mb: 1 }}>{status.text}</Alert>}
          <Button type="submit" variant="contained" fullWidth disabled={saving || mismatch || !form.old_password || !form.new_password}>
            {saving ? 'Saving...' : 'Change password'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
