import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Snackbar
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const NEXT = { received: ['preparing', 'Start'], preparing: ['delivered', 'Delivered'] };
const emptyLine = () => ({ name: '', qty: 1, price: '' });

// Food and amenities ordered to a room.
const HotelRoomServiceTab = () => {
  const [orders, setOrders] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState('');
  const [guest, setGuest] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [o, r] = await Promise.all([api.get('/hotel/room-service/'), api.get('/hotel/rooms/')]);
      setOrders(asList(o.data)); setRooms(asList(r.data));
    } catch (e) { setToast('Could not load orders.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const total = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
  const patchLine = (i, p) => setLines(ls => ls.map((l, idx) => (idx === i ? { ...l, ...p } : l)));
  const save = async () => {
    try {
      await api.post('/hotel/room-service/', {
        room, guest_name: guest, total_amount: total.toFixed(2), status: 'received',
        items: lines.filter(l => l.name).map(l => ({ name: l.name, quantity: Number(l.qty), price: Number(l.price) })),
      });
      setOpen(false); load();
    } catch (e) { setToast('Could not save the order.'); }
  };
  const move = async (o, status) => {
    try { await api.patch(`/hotel/room-service/${o.id}/`, { status }); load(); } catch (e) { setToast('Could not update.'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Room service</Typography>
        <Button variant="contained" disabled={rooms.length === 0} onClick={() => { setRoom(rooms[0]?.id || ''); setGuest(''); setLines([emptyLine()]); setOpen(true); }}>New order</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Room</TableCell><TableCell>Guest</TableCell><TableCell>Items</TableCell><TableCell align="right">Total</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {orders.length === 0 && <TableRow><TableCell colSpan={6} align="center">No room service orders.</TableCell></TableRow>}
          {orders.map(o => (
            <TableRow key={o.id} hover>
              <TableCell>{o.room_number}</TableCell><TableCell>{o.guest_name || '-'}</TableCell>
              <TableCell>{(o.items || []).map(i => `${i.quantity} × ${i.name}`).join(', ')}</TableCell>
              <TableCell align="right">₹{Number(o.total_amount).toFixed(2)}</TableCell>
              <TableCell><Chip size="small" label={o.status} color={o.status === 'delivered' || o.status === 'billed' ? 'success' : 'warning'} /></TableCell>
              <TableCell align="right">{NEXT[o.status] && <Button size="small" variant="outlined" onClick={() => move(o, NEXT[o.status][0])}>{NEXT[o.status][1]}</Button>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New room service order</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField select margin="dense" label="Room" value={room} onChange={(e) => setRoom(e.target.value)} sx={{ minWidth: 140 }}>
              {rooms.map(r => <MenuItem key={r.id} value={r.id}>{r.room_number}</MenuItem>)}
            </TextField>
            <TextField margin="dense" label="Guest name" value={guest} onChange={(e) => setGuest(e.target.value)} sx={{ flex: 1, minWidth: 160 }} />
          </Box>
          {lines.map((l, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
              <TextField size="small" label="Item" value={l.name} onChange={(e) => patchLine(i, { name: e.target.value })} sx={{ flex: 1 }} />
              <TextField size="small" type="number" label="Qty" value={l.qty} onChange={(e) => patchLine(i, { qty: e.target.value })} sx={{ width: 80 }} />
              <TextField size="small" type="number" label="Price ₹" value={l.price} onChange={(e) => patchLine(i, { price: e.target.value })} sx={{ width: 100 }} />
              <IconButton size="small" aria-label="Remove" disabled={lines.length === 1} onClick={() => setLines(ls => ls.filter((_, idx) => idx !== i))}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          ))}
          <Button size="small" sx={{ mt: 1 }} onClick={() => setLines(ls => [...ls, emptyLine()])}>Add item</Button>
          <Typography sx={{ mt: 1 }} fontWeight={600}>Total ₹{total.toFixed(2)}</Typography>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={!room || total <= 0} onClick={save}>Place order</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default HotelRoomServiceTab;
