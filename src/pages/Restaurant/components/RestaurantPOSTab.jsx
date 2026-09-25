import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Paper, Chip, Alert, Snackbar, IconButton, Divider,
  Table, TableHead, TableRow, TableCell, TableBody, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.values(d).flat().map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
};

// Take an order: pick items, choose table or takeaway, send it to the kitchen. Open orders are settled below.
const RestaurantPOSTab = () => {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cat, setCat] = useState('all');
  const [cart, setCart] = useState({});
  const [type, setType] = useState('dine_in');
  const [table, setTable] = useState('');
  const [cust, setCust] = useState({ name: '', phone: '', address: '' });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [i, c, t, o] = await Promise.all([
        api.get('/restaurant/menu-items/', { params: { available: 'true' } }), api.get('/restaurant/menu-categories/'),
        api.get('/restaurant/tables/'), api.get('/restaurant/orders/'),
      ]);
      setItems(asList(i.data)); setCats(asList(c.data)); setTables(asList(t.data));
      setOrders(asList(o.data).filter(x => x.status === 'open' || x.status === 'served'));
    } catch (e) { setToast('Could not load the counter.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const change = (id, d) => setCart(c => {
    const q = (c[id] || 0) + d;
    const next = { ...c };
    if (q <= 0) delete next[id]; else next[id] = q;
    return next;
  });
  const lines = Object.entries(cart).map(([id, q]) => ({ item: items.find(i => i.id === Number(id)), q })).filter(l => l.item);
  const total = lines.reduce((s, l) => s + Number(l.item.price) * l.q, 0);
  const needsCustomer = type !== 'dine_in';
  const ready = lines.length > 0 && (type !== 'dine_in' || table) && (!needsCustomer || (cust.name && cust.phone && (type === 'takeaway' || cust.address)));

  const place = async () => {
    setError(''); setBusy(true);
    try {
      await api.post('/restaurant/orders/', {
        order_type: type, table_id: type === 'dine_in' ? table : null, notes,
        customer_name: cust.name, customer_phone: cust.phone, delivery_address: cust.address,
        items: lines.map(l => ({ menu_item_id: l.item.id, quantity: l.q })),
      });
      setCart({}); setNotes(''); setCust({ name: '', phone: '', address: '' }); setToast('Order sent to the kitchen'); load();
    } catch (e) { setError(errText(e, 'Could not place the order.')); } finally { setBusy(false); }
  };

  const act = async (o, what) => {
    try { await api.post(`/restaurant/orders/${o.id}/${what}/`); load(); } catch (e) { setToast('Update failed.'); }
  };
  const invoice = async (o) => {
    try {
      const res = await api.get(`/restaurant/orders/${o.id}/invoice/`, { responseType: 'blob' });
      window.open(URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' })), '_blank', 'noopener');
    } catch (e) { setToast('Could not open the bill.'); }
  };
  const shown = cat === 'all' ? items : items.filter(i => i.category === cat);

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
            <Chip label="All" color={cat === 'all' ? 'primary' : 'default'} onClick={() => setCat('all')} />
            {cats.map(c => <Chip key={c.id} label={c.name} color={cat === c.id ? 'primary' : 'default'} onClick={() => setCat(c.id)} />)}
          </Box>
          {items.length === 0 && <Alert severity="info">No menu items yet. Add them on the Menu Management tab.</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1 }}>
            {shown.map(i => (
              <Paper key={i.id} variant="outlined" sx={{ p: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => change(i.id, 1)}>
                <Typography fontWeight={600}>{i.name}</Typography>
                <Typography variant="body2" color="text.secondary">₹{Number(i.price).toFixed(2)}</Typography>
                {cart[i.id] > 0 && <Chip size="small" color="primary" label={`× ${cart[i.id]}`} sx={{ mt: 0.5 }} />}
              </Paper>
            ))}
          </Box>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <ToggleButtonGroup exclusive size="small" value={type} onChange={(_, v) => v && setType(v)} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
            <ToggleButton value="dine_in">Dine in</ToggleButton><ToggleButton value="takeaway">Takeaway</ToggleButton><ToggleButton value="delivery">Delivery</ToggleButton>
          </ToggleButtonGroup>
          {type === 'dine_in' && (
            <TextField select fullWidth size="small" label="Table" value={table} onChange={(e) => setTable(e.target.value)} sx={{ mb: 1 }}
              helperText={tables.length === 0 ? 'Add tables on the Menu Management tab' : ' '}>
              {tables.map(t => <MenuItem key={t.id} value={t.id}>Table {t.number} ({t.seats} seats)</MenuItem>)}
            </TextField>
          )}
          {needsCustomer && (<>
            <TextField fullWidth size="small" label="Customer name" value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} sx={{ mb: 1 }} />
            <TextField fullWidth size="small" label="Phone" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} sx={{ mb: 1 }} />
            {type === 'delivery' && <TextField fullWidth size="small" label="Delivery address" value={cust.address} onChange={(e) => setCust({ ...cust, address: e.target.value })} sx={{ mb: 1 }} />}
          </>)}
          {lines.length === 0 ? <Typography color="text.secondary" sx={{ my: 2 }}>Tap items to add them.</Typography> : lines.map(l => (
            <Box key={l.item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
              <Typography sx={{ flex: 1 }}>{l.item.name}</Typography>
              <IconButton size="small" aria-label="Less" onClick={() => change(l.item.id, -1)}><RemoveIcon fontSize="small" /></IconButton>
              <Typography sx={{ width: 24, textAlign: 'center' }}>{l.q}</Typography>
              <IconButton size="small" aria-label="More" onClick={() => change(l.item.id, 1)}><AddIcon fontSize="small" /></IconButton>
              <Typography sx={{ width: 70, textAlign: 'right' }}>₹{(Number(l.item.price) * l.q).toFixed(2)}</Typography>
            </Box>
          ))}
          <TextField fullWidth size="small" label="Kitchen note" value={notes} onChange={(e) => setNotes(e.target.value)} sx={{ my: 1 }} />
          <Divider sx={{ mb: 1 }} />
          <Typography variant="h6">Total ₹{total.toFixed(2)}</Typography>
          {error && <Alert severity="error" sx={{ my: 1 }}>{error}</Alert>}
          <Button fullWidth variant="contained" sx={{ mt: 1 }} disabled={!ready || busy} onClick={place}>{busy ? 'Sending...' : 'Send to kitchen'}</Button>
        </Paper>
      </Box>

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Open orders</Typography>
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}><Table size="small">
        <TableHead><TableRow><TableCell>Order</TableCell><TableCell>Where</TableCell><TableCell>Items</TableCell><TableCell align="right">Total</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {orders.length === 0 && <TableRow><TableCell colSpan={6} align="center">No open orders.</TableCell></TableRow>}
          {orders.map(o => (
            <TableRow key={o.id}>
              <TableCell>#{o.id}</TableCell>
              <TableCell>{o.table_number ? `Table ${o.table_number}` : o.order_type.replace('_', ' ')}{o.customer_name ? ` · ${o.customer_name}` : ''}</TableCell>
              <TableCell>{(o.items || []).map(i => `${i.quantity} × ${i.menu_item_name || i.menu_item?.name || ''}`).join(', ')}</TableCell>
              <TableCell align="right">₹{Number(o.total_amount).toFixed(2)}</TableCell>
              <TableCell><Chip size="small" label={o.status} color={o.status === 'served' ? 'success' : 'warning'} /></TableCell>
              <TableCell align="right">
                {o.status === 'open' && <Button size="small" onClick={() => act(o, 'serve')}>Served</Button>}
                <Button size="small" onClick={() => invoice(o)}>Bill</Button>
                <Button size="small" variant="contained" onClick={() => act(o, 'mark-paid')}>Paid</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></Paper>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default RestaurantPOSTab;
