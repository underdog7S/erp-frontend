import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('. ');
};

// Stylists: who works here and what share of each completed service they earn.
const SalonStaffTab = () => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try { setStaff(asList((await api.get('/salon/stylists/')).data)); } catch (e) { setToast('Could not load stylists.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setErr('');
    try {
      const body = { first_name: form.first_name, last_name: form.last_name || '', phone: form.phone || '', email: form.email || '',
        commission_percent: form.commission_percent || 0, is_active: form.is_active !== false };
      if (form.id) await api.patch(`/salon/stylists/${form.id}/`, body); else await api.post('/salon/stylists/', body);
      setForm(null); load();
    } catch (e) { setErr(errText(e, 'Could not save.')); }
  };
  const toggle = async (s) => {
    try { await api.patch(`/salon/stylists/${s.id}/`, { is_active: !s.is_active }); load(); } catch (e) { setToast('Could not update.'); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Stylists</Typography>
        <Button variant="contained" onClick={() => { setErr(''); setForm({ commission_percent: 0 }); }}>Add stylist</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Phone</TableCell><TableCell align="right">Commission</TableCell><TableCell>Active</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {staff.length === 0 && <TableRow><TableCell colSpan={5} align="center">No stylists yet.</TableCell></TableRow>}
          {staff.map(s => (
            <TableRow key={s.id} hover>
              <TableCell>{s.first_name} {s.last_name}</TableCell><TableCell>{s.phone || '-'}</TableCell>
              <TableCell align="right">{Number(s.commission_percent)}%</TableCell>
              <TableCell><Switch size="small" checked={s.is_active} onChange={() => toggle(s)} /></TableCell>
              <TableCell align="right"><Button size="small" onClick={() => { setErr(''); setForm(s); }}>Edit</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>
      <Dialog open={!!form} onClose={() => setForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{form?.id ? 'Edit stylist' : 'Add stylist'}</DialogTitle>
        <DialogContent dividers>
          <TextField required fullWidth margin="dense" label="First name" value={form?.first_name || ''} onChange={set('first_name')} />
          <TextField fullWidth margin="dense" label="Last name" value={form?.last_name || ''} onChange={set('last_name')} />
          <TextField fullWidth margin="dense" label="Phone" value={form?.phone || ''} onChange={set('phone')} />
          <TextField fullWidth margin="dense" label="Email" value={form?.email || ''} onChange={set('email')} />
          <TextField fullWidth margin="dense" type="number" label="Commission %" value={form?.commission_percent ?? 0} onChange={set('commission_percent')} helperText="Share of each completed service" />
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setForm(null)}>Cancel</Button><Button variant="contained" disabled={!form?.first_name} onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default SalonStaffTab;
