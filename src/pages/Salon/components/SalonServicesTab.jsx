import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Snackbar, Chip
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('. ');
};

// The service menu: categories, duration and price of each service.
const SalonServicesTab = () => {
  const [services, setServices] = useState([]);
  const [cats, setCats] = useState([]);
  const [dlg, setDlg] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([api.get('/salon/services/'), api.get('/salon/service-categories/')]);
      setServices(asList(s.data)); setCats(asList(c.data));
    } catch (e) { setToast('Could not load services.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (kind, init = {}) => { setErr(''); setForm(init); setDlg(kind); };
  const save = async () => {
    try {
      if (dlg === 'cat') {
        if (form.id) await api.patch(`/salon/service-categories/${form.id}/`, form); else await api.post('/salon/service-categories/', form);
      } else {
        const body = new FormData();  // the service endpoint accepts an image, so it takes multipart
        ['name', 'category', 'duration_minutes', 'price'].forEach(k => body.append(k, form[k] ?? ''));
        body.append('is_active', form.is_active === false ? 'false' : 'true');
        if (form.id) await api.patch(`/salon/services/${form.id}/`, body); else await api.post('/salon/services/', body);
      }
      setDlg(null); load();
    } catch (e) { setErr(errText(e, 'Could not save.')); }
  };
  const toggle = async (s) => {
    const body = new FormData(); body.append('is_active', s.is_active ? 'false' : 'true');
    try { await api.patch(`/salon/services/${s.id}/`, body); load(); } catch (e) { setToast('Could not update.'); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Services</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => open('cat')}>Add category</Button>
          <Button variant="contained" disabled={cats.length === 0} onClick={() => open('service', { category: cats[0]?.id, duration_minutes: 30, is_active: true })}>Add service</Button>
        </Box>
      </Box>
      {cats.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Add a category (Hair, Skin, Nails...) first.</Alert>}
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Service</TableCell><TableCell>Category</TableCell><TableCell align="right">Minutes</TableCell><TableCell align="right">Price</TableCell><TableCell>Active</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {services.length === 0 && <TableRow><TableCell colSpan={6} align="center">No services yet.</TableCell></TableRow>}
          {services.map(s => (
            <TableRow key={s.id} hover>
              <TableCell>{s.name}</TableCell><TableCell>{cats.find(c => c.id === s.category)?.name || '-'}</TableCell>
              <TableCell align="right">{s.duration_minutes}</TableCell><TableCell align="right">₹{Number(s.price).toFixed(2)}</TableCell>
              <TableCell><Switch size="small" checked={s.is_active} onChange={() => toggle(s)} /></TableCell>
              <TableCell align="right"><Button size="small" onClick={() => open('service', s)}>Edit</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>
      {cats.length > 0 && <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">Categories:</Typography>
        {cats.map(c => <Chip key={c.id} size="small" label={c.name} onClick={() => open('cat', c)} />)}
      </Box>}
      <Dialog open={!!dlg} onClose={() => setDlg(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{form.id ? 'Edit' : 'Add'} {dlg === 'cat' ? 'category' : 'service'}</DialogTitle>
        <DialogContent dividers>
          <TextField required fullWidth margin="dense" label="Name" value={form.name || ''} onChange={set('name')} />
          {dlg === 'service' && (<>
            <TextField select fullWidth margin="dense" label="Category" value={form.category || ''} onChange={set('category')}>
              {cats.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField fullWidth margin="dense" type="number" label="Duration (minutes)" value={form.duration_minutes ?? ''} onChange={set('duration_minutes')} />
            <TextField required fullWidth margin="dense" type="number" label="Price (₹)" value={form.price ?? ''} onChange={set('price')} />
          </>)}
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setDlg(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default SalonServicesTab;
