import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Snackbar, Divider, Chip, FormControlLabel
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('. ');
};

// Menu items, categories and dining tables.
const RestaurantMenuTab = () => {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [tables, setTables] = useState([]);
  const [dlg, setDlg] = useState(null); // 'item' | 'cat' | 'table'
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [i, c, t] = await Promise.all([api.get('/restaurant/menu-items/'), api.get('/restaurant/menu-categories/'), api.get('/restaurant/tables/')]);
      setItems(asList(i.data)); setCats(asList(c.data)); setTables(asList(t.data));
    } catch (e) { setToast('Could not load the menu.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (kind, init = {}) => { setErr(''); setForm(init); setDlg(kind); };
  const urls = { item: '/restaurant/menu-items/', cat: '/restaurant/menu-categories/', table: '/restaurant/tables/' };
  const save = async () => {
    try {
      if (form.id) await api.patch(`${urls[dlg]}${form.id}/`, form); else await api.post(urls[dlg], form);
      setDlg(null); load();
    } catch (e) { setErr(errText(e, 'Could not save.')); }
  };
  const toggle = async (it) => {
    try { await api.patch(`/restaurant/menu-items/${it.id}/`, { is_available: !it.is_available }); load(); } catch (e) { setToast('Could not update.'); }
  };
  const remove = async (kind, row) => {
    if (!window.confirm('Delete this? It cannot be undone.')) return;
    try { await api.delete(`${urls[kind]}${row.id}/`); load(); } catch (e) { setToast('Cannot delete: it is used by existing orders or items.'); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Menu</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => open('cat')}>Add category</Button>
          <Button variant="contained" disabled={cats.length === 0} onClick={() => open('item', { category: cats[0]?.id, is_available: true })}>Add item</Button>
        </Box>
      </Box>
      {cats.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Add a category (Starters, Mains...) first, then add items to it.</Alert>}
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Item</TableCell><TableCell>Category</TableCell><TableCell align="right">Price</TableCell><TableCell>Available</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {items.length === 0 && <TableRow><TableCell colSpan={5} align="center">No menu items yet.</TableCell></TableRow>}
          {items.map(it => (
            <TableRow key={it.id} hover>
              <TableCell>{it.name}</TableCell>
              <TableCell>{cats.find(c => c.id === it.category)?.name || '-'}</TableCell>
              <TableCell align="right">₹{Number(it.price).toFixed(2)}</TableCell>
              <TableCell><Switch size="small" checked={it.is_available} onChange={() => toggle(it)} /></TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => open('item', it)}>Edit</Button>
                <Button size="small" color="error" onClick={() => remove('item', it)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>

      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Tables</Typography>
        <Button variant="outlined" onClick={() => open('table', { seats: 4 })}>Add table</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {tables.length === 0 && <Typography color="text.secondary">No tables yet. Takeaway and delivery orders do not need one.</Typography>}
        {tables.map(t => <Chip key={t.id} label={`Table ${t.number} · ${t.seats} seats`} onDelete={() => remove('table', t)} />)}
      </Box>
      {cats.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">Categories:</Typography>
          {cats.map(c => <Chip key={c.id} size="small" label={c.name} onClick={() => open('cat', c)} onDelete={() => remove('cat', c)} />)}
        </Box>
      )}

      <Dialog open={!!dlg} onClose={() => setDlg(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{form.id ? 'Edit' : 'Add'} {dlg === 'cat' ? 'category' : dlg}</DialogTitle>
        <DialogContent dividers>
          {dlg === 'item' && (<>
            <TextField required fullWidth margin="dense" label="Name" value={form.name || ''} onChange={set('name')} />
            <TextField select fullWidth margin="dense" label="Category" value={form.category || ''} onChange={set('category')}>
              {cats.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField required fullWidth margin="dense" type="number" label="Price (₹)" value={form.price ?? ''} onChange={set('price')} />
            <TextField fullWidth margin="dense" type="number" label="GST %" value={form.gst_rate ?? 0} onChange={set('gst_rate')} helperText="0 = no tax" />
            <FormControlLabel control={<Switch checked={form.price_includes_tax !== false} onChange={(e) => setForm({ ...form, price_includes_tax: e.target.checked })} />} label="Price includes GST" />
          </>)}
          {dlg === 'cat' && (<>
            <TextField required fullWidth margin="dense" label="Name" value={form.name || ''} onChange={set('name')} />
            <TextField fullWidth margin="dense" label="Description" value={form.description || ''} onChange={set('description')} />
          </>)}
          {dlg === 'table' && (<>
            <TextField required fullWidth margin="dense" label="Table number" value={form.number || ''} onChange={set('number')} />
            <TextField fullWidth margin="dense" type="number" label="Seats" value={form.seats ?? ''} onChange={set('seats')} />
          </>)}
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setDlg(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default RestaurantMenuTab;
