import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Snackbar, Switch, FormControlLabel
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const COLOR = { available: 'success', occupied: 'warning', maintenance: 'error' };
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('. ');
};

// Room types (with nightly rate) and the rooms themselves.
const HotelRoomsTab = () => {
  const [rooms, setRooms] = useState([]);
  const [types, setTypes] = useState([]);
  const [dlg, setDlg] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [r, t] = await Promise.all([api.get('/hotel/rooms/'), api.get('/hotel/room-types/')]);
      setRooms(asList(r.data)); setTypes(asList(t.data));
    } catch (e) { setToast('Could not load rooms.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (kind, init = {}) => { setErr(''); setForm(init); setDlg(kind); };
  const save = async () => {
    const url = dlg === 'type' ? '/hotel/room-types/' : '/hotel/rooms/';
    const body = dlg === 'room' ? { ...form, room_type: form.room_type?.id ?? form.room_type } : form;
    try {
      if (form.id) await api.patch(`${url}${form.id}/`, body); else await api.post(url, body);
      setDlg(null); load();
    } catch (e) { setErr(errText(e, 'Could not save.')); }
  };
  const setStatus = async (r, status) => {
    try { await api.patch(`/hotel/rooms/${r.id}/`, { status }); load(); } catch (e) { setToast('Could not update the room.'); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Rooms</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => open('type', { base_rate: 0 })}>Add room type</Button>
          <Button variant="contained" disabled={types.length === 0} onClick={() => open('room', { room_type: types[0]?.id })}>Add room</Button>
        </Box>
      </Box>
      {types.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Add a room type (Standard, Deluxe...) with its nightly rate first.</Alert>}
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Room</TableCell><TableCell>Type</TableCell><TableCell align="right">Rate / night</TableCell><TableCell>Floor</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {rooms.length === 0 && <TableRow><TableCell colSpan={6} align="center">No rooms yet.</TableCell></TableRow>}
          {rooms.map(r => {
            const t = types.find(x => x.id === (r.room_type?.id ?? r.room_type));
            return (
              <TableRow key={r.id} hover>
                <TableCell>{r.room_number}</TableCell><TableCell>{t?.name || r.room_type_name || '-'}</TableCell>
                <TableCell align="right">{t ? `₹${Number(t.base_rate).toFixed(2)}` : '-'}</TableCell><TableCell>{r.floor ?? '-'}</TableCell>
                <TableCell><Chip size="small" color={COLOR[r.status]} label={r.status} /></TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => open('room', { ...r, room_type: t?.id })}>Edit</Button>
                  {r.status === 'maintenance'
                    ? <Button size="small" onClick={() => setStatus(r, 'available')}>Back in service</Button>
                    : r.status === 'available' && <Button size="small" color="warning" onClick={() => setStatus(r, 'maintenance')}>Maintenance</Button>}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table></TableContainer>
      {types.length > 0 && <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">Room types:</Typography>
        {types.map(t => <Chip key={t.id} size="small" label={`${t.name} · ₹${Number(t.base_rate)}`} onClick={() => open('type', t)} />)}
      </Box>}
      <Dialog open={!!dlg} onClose={() => setDlg(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{form.id ? 'Edit' : 'Add'} {dlg === 'type' ? 'room type' : 'room'}</DialogTitle>
        <DialogContent dividers>
          {dlg === 'type' ? (<>
            <TextField required fullWidth margin="dense" label="Name" value={form.name || ''} onChange={set('name')} />
            <TextField required fullWidth margin="dense" type="number" label="Rate per night (₹)" value={form.base_rate ?? ''} onChange={set('base_rate')} />
            <TextField fullWidth margin="dense" type="number" label="GST %" value={form.gst_rate ?? 0} onChange={set('gst_rate')} helperText="Hotel rooms: 12% up to ₹7,500 a night, 18% above (check with your accountant)" />
            <FormControlLabel control={<Switch checked={!!form.price_includes_tax} onChange={(e) => setForm({ ...form, price_includes_tax: e.target.checked })} />} label="Rate already includes GST" />
          </>) : (<>
            <TextField required fullWidth margin="dense" label="Room number" value={form.room_number || ''} onChange={set('room_number')} />
            <TextField select fullWidth margin="dense" label="Room type" value={form.room_type || ''} onChange={set('room_type')}>
              {types.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </TextField>
            <TextField fullWidth margin="dense" type="number" label="Floor" value={form.floor ?? ''} onChange={set('floor')} />
          </>)}
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setDlg(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default HotelRoomsTab;
