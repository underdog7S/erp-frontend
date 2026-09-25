import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import api from '../../services/api';

// Business details used on invoices. The GST number decides CGST/SGST versus IGST on B2B sales.
const BusinessDetails = () => {
  const [gstin, setGstin] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get('/tenant/business/').then(r => { setGstin(r.data.gstin || ''); setName(r.data.name); }).catch(() => setMsg({ type: 'error', text: 'Could not load your details.' }));
  }, []);

  const save = async () => {
    setMsg(null);
    try {
      const r = await api.put('/tenant/business/', { gstin });
      setGstin(r.data.gstin);
      setMsg({ type: 'success', text: 'Saved.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || e.response?.data?.detail || 'Could not save. Only an admin can change this.' });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 520, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Business details</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{name}</Typography>
        <TextField fullWidth label="GST number (GSTIN)" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} inputProps={{ maxLength: 15 }}
          helperText="15 characters, e.g. 27AAPFU0939F1ZV. Used to choose CGST + SGST (same state) or IGST (other state) on sales orders." />
        {msg && <Alert severity={msg.type} sx={{ mt: 2 }}>{msg.text}</Alert>}
        <Button variant="contained" sx={{ mt: 2 }} onClick={save}>Save</Button>
      </Paper>
    </Box>
  );
};

export default BusinessDetails;
