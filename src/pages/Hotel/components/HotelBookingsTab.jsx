import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Snackbar, Autocomplete
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const COLOR = { reserved: 'primary', checked_in: 'warning', checked_out: 'success', cancelled: 'default' };
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.values(d).flat().map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
};
const at = (offsetDays, hour) => { const d = new Date(); d.setDate(d.getDate() + offsetDays); d.setHours(hour, 0, 0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

// Reservations: book a room for a guest, then check in, check out or cancel.
const HotelBookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [b, r, g] = await Promise.all([
        api.get('/hotel/bookings/', { params: search ? { search } : {} }), api.get('/hotel/rooms/'), api.get('/hotel/guests/')]);
      setBookings(asList(b.data)); setRooms(asList(r.data)); setGuests(asList(g.data));
    } catch (e) { setToast('Could not load reservations.'); }
  }, [search]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const book = async () => {
    setErr('');
    const body = { room_id: form.room, check_in: new Date(form.check_in).toISOString(), check_out: new Date(form.check_out).toISOString() };
    if (form.guest) body.guest_id = form.guest.id;
    else { body.guest_first_name = form.first_name; body.guest_last_name = form.last_name || ''; body.guest_phone = form.phone || ''; }
    try { await api.post('/hotel/bookings/', body); setOpen(false); load(); } catch (e) { setErr(errText(e, 'Could not book.')); }
  };
  const act = async (b, what) => {
    try { await api.post(`/hotel/bookings/${b.id}/${what}/`); load(); } catch (e) { setToast(errText(e, 'That did not work.')); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Reservations</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" label="Search guest or room" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="contained" disabled={rooms.length === 0}
            onClick={() => { setErr(''); setForm({ room: rooms[0]?.id, check_in: at(0, 12), check_out: at(1, 11) }); setOpen(true); }}>New booking</Button>
        </Box>
      </Box>
      {rooms.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Add rooms on the Room Matrix tab before taking bookings.</Alert>}
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Guest</TableCell><TableCell>Room</TableCell><TableCell>Check in</TableCell><TableCell>Check out</TableCell><TableCell align="right">Amount</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {bookings.length === 0 && <TableRow><TableCell colSpan={7} align="center">No bookings yet.</TableCell></TableRow>}
          {bookings.map(b => (
            <TableRow key={b.id} hover>
              <TableCell>{b.guest_name}</TableCell><TableCell>{b.room_number}</TableCell>
              <TableCell>{new Date(b.check_in).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
              <TableCell>{new Date(b.check_out).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
              <TableCell align="right">₹{Number(b.total_amount).toFixed(2)}</TableCell>
              <TableCell><Chip size="small" color={COLOR[b.status]} label={b.status.replace('_', ' ')} /></TableCell>
              <TableCell align="right">
                {b.status === 'reserved' && <><Button size="small" variant="contained" onClick={() => act(b, 'check-in')}>Check in</Button><Button size="small" color="error" onClick={() => act(b, 'cancel')}>Cancel</Button></>}
                {b.status === 'checked_in' && <Button size="small" variant="contained" onClick={() => act(b, 'check-out')}>Check out</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New booking</DialogTitle>
        <DialogContent dividers>
          <TextField select fullWidth margin="dense" label="Room" value={form.room || ''} onChange={set('room')}>
            {rooms.map(r => <MenuItem key={r.id} value={r.id}>{r.room_number} · {r.status}</MenuItem>)}
          </TextField>
          <TextField fullWidth margin="dense" type="datetime-local" label="Check in" InputLabelProps={{ shrink: true }} value={form.check_in || ''} onChange={set('check_in')} />
          <TextField fullWidth margin="dense" type="datetime-local" label="Check out" InputLabelProps={{ shrink: true }} value={form.check_out || ''} onChange={set('check_out')} />
          <Autocomplete size="small" sx={{ mt: 1 }} options={guests} value={form.guest || null} getOptionLabel={(g) => `${g.first_name} ${g.last_name || ''} ${g.phone ? `(${g.phone})` : ''}`}
            onChange={(_, v) => setForm({ ...form, guest: v })} renderInput={(p) => <TextField {...p} label="Returning guest (optional)" />} />
          {!form.guest && (<>
            <TextField required fullWidth margin="dense" label="Guest first name" value={form.first_name || ''} onChange={set('first_name')} />
            <TextField fullWidth margin="dense" label="Last name" value={form.last_name || ''} onChange={set('last_name')} />
            <TextField fullWidth margin="dense" label="Phone" value={form.phone || ''} onChange={set('phone')} />
          </>)}
          <Typography variant="caption" color="text.secondary">The amount is the room rate times the nights.</Typography>
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={!form.room || (!form.guest && !form.first_name)} onClick={book}>Book</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default HotelBookingsTab;
