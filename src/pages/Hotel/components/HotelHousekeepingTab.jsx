import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Snackbar
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));

// Cleaning and turnover tasks. Check-out adds a cleaning task automatically.
const HotelHousekeepingTab = () => {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [t, r] = await Promise.all([api.get('/hotel/housekeeping/'), api.get('/hotel/rooms/')]);
      setTasks(asList(t.data)); setRooms(asList(r.data));
    } catch (e) { setToast('Could not load tasks.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    try {
      await api.post('/hotel/housekeeping/', { room: form.room, task_type: form.task_type || 'Daily Cleaning', assigned_to: form.assigned_to || '', status: 'pending' });
      setOpen(false); load();
    } catch (e) { setToast('Could not add the task.'); }
  };
  const complete = async (t) => {
    try { await api.post(`/hotel/housekeeping/${t.id}/complete/`); load(); } catch (e) { setToast('Could not complete the task.'); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const roomNo = (t) => t.room_number || rooms.find(r => r.id === (t.room?.id ?? t.room))?.room_number || '-';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Housekeeping</Typography>
        <Button variant="contained" disabled={rooms.length === 0} onClick={() => { setForm({ room: rooms[0]?.id, task_type: 'Daily Cleaning' }); setOpen(true); }}>Add task</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Room</TableCell><TableCell>Task</TableCell><TableCell>Assigned to</TableCell><TableCell>Created</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {tasks.length === 0 && <TableRow><TableCell colSpan={6} align="center">No tasks.</TableCell></TableRow>}
          {tasks.map(t => (
            <TableRow key={t.id} hover>
              <TableCell>{roomNo(t)}</TableCell><TableCell>{t.task_type}</TableCell><TableCell>{t.assigned_to || '-'}</TableCell>
              <TableCell>{new Date(t.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
              <TableCell><Chip size="small" color={t.status === 'completed' ? 'success' : 'warning'} label={t.status.replace('_', ' ')} /></TableCell>
              <TableCell align="right">{t.status !== 'completed' && <Button size="small" variant="outlined" onClick={() => complete(t)}>Mark done</Button>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add housekeeping task</DialogTitle>
        <DialogContent dividers>
          <TextField select fullWidth margin="dense" label="Room" value={form.room || ''} onChange={set('room')}>
            {rooms.map(r => <MenuItem key={r.id} value={r.id}>{r.room_number}</MenuItem>)}
          </TextField>
          <TextField fullWidth margin="dense" label="Task" value={form.task_type || ''} onChange={set('task_type')} />
          <TextField fullWidth margin="dense" label="Assigned to" value={form.assigned_to || ''} onChange={set('assigned_to')} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={add}>Add</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default HotelHousekeepingTab;
