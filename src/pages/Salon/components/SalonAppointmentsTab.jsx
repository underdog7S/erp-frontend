import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Snackbar
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const COLOR = { scheduled: 'primary', in_progress: 'warning', completed: 'success', cancelled: 'default' };
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.values(d).flat().map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
};
const localNow = () => { const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };

// Day book: book a service with a stylist, then check the customer in, complete, bill or cancel.
const SalonAppointmentsTab = () => {
  const [appts, setAppts] = useState([]);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [a, s, st] = await Promise.all([
        api.get('/salon/appointments/', { params: day ? { date: day } : {} }), api.get('/salon/services/'), api.get('/salon/stylists/'),
      ]);
      setAppts(asList(a.data)); setServices(asList(s.data).filter(x => x.is_active)); setStylists(asList(st.data).filter(x => x.is_active));
    } catch (e) { setToast('Could not load appointments.'); }
  }, [day]);
  useEffect(() => { load(); }, [load]);

  const book = async () => {
    setErr('');
    try {
      await api.post('/salon/appointments/', {
        service: form.service, stylist: form.stylist, customer_name: form.customer_name, customer_phone: form.customer_phone || '',
        start_time: new Date(form.start).toISOString(),
      });
      setOpen(false); load();
    } catch (e) { setErr(errText(e, 'Could not book.')); }
  };
  const act = async (a, what) => {
    try { await api.post(`/salon/appointments/${a.id}/${what}/`); load(); } catch (e) { setToast(errText(e, 'That did not work.')); }
  };
  const bill = async (a) => {
    try {
      const res = await api.get(`/salon/appointments/${a.id}/invoice/`, { responseType: 'blob' });
      window.open(URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' })), '_blank', 'noopener');
    } catch (e) { setToast('Could not open the bill.'); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Appointments</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" type="date" label="Day" InputLabelProps={{ shrink: true }} value={day} onChange={(e) => setDay(e.target.value)} />
          <Button variant="contained" disabled={!services.length || !stylists.length}
            onClick={() => { setErr(''); setForm({ service: services[0]?.id, stylist: stylists[0]?.id, start: localNow() }); setOpen(true); }}>Book appointment</Button>
        </Box>
      </Box>
      {(!services.length || !stylists.length) && <Alert severity="info" sx={{ mb: 2 }}>Add at least one service and one stylist first.</Alert>}
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Time</TableCell><TableCell>Customer</TableCell><TableCell>Service</TableCell><TableCell>Stylist</TableCell><TableCell align="right">Price</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {appts.length === 0 && <TableRow><TableCell colSpan={7} align="center">No appointments on this day.</TableCell></TableRow>}
          {appts.map(a => (
            <TableRow key={a.id} hover>
              <TableCell>{new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
              <TableCell>{a.customer_name}{a.customer_phone ? ` · ${a.customer_phone}` : ''}</TableCell>
              <TableCell>{a.service_name}</TableCell><TableCell>{a.stylist_name}</TableCell>
              <TableCell align="right">₹{Number(a.price).toFixed(2)}</TableCell>
              <TableCell><Chip size="small" color={COLOR[a.status]} label={a.status.replace('_', ' ')} /></TableCell>
              <TableCell align="right">
                {a.status === 'scheduled' && <Button size="small" onClick={() => act(a, 'check-in')}>Check in</Button>}
                {['scheduled', 'in_progress'].includes(a.status) && <Button size="small" variant="contained" onClick={() => act(a, 'complete')}>Complete</Button>}
                {['scheduled', 'in_progress'].includes(a.status) && <Button size="small" color="error" onClick={() => act(a, 'cancel')}>Cancel</Button>}
                {a.status === 'completed' && <Button size="small" onClick={() => bill(a)}>Bill</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Book appointment</DialogTitle>
        <DialogContent dividers>
          <TextField required fullWidth margin="dense" label="Customer name" value={form.customer_name || ''} onChange={set('customer_name')} />
          <TextField fullWidth margin="dense" label="Phone" value={form.customer_phone || ''} onChange={set('customer_phone')} />
          <TextField select fullWidth margin="dense" label="Service" value={form.service || ''} onChange={set('service')}>
            {services.map(s => <MenuItem key={s.id} value={s.id}>{s.name} · {s.duration_minutes} min · ₹{Number(s.price)}</MenuItem>)}
          </TextField>
          <TextField select fullWidth margin="dense" label="Stylist" value={form.stylist || ''} onChange={set('stylist')}>
            {stylists.map(s => <MenuItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</MenuItem>)}
          </TextField>
          <TextField fullWidth margin="dense" type="datetime-local" label="Start" InputLabelProps={{ shrink: true }} value={form.start || ''} onChange={set('start')} />
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={!form.customer_name || !form.start} onClick={book}>Book</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default SalonAppointmentsTab;
