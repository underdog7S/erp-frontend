import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Alert,
  CircularProgress, Snackbar, Autocomplete
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const today = () => new Date().toISOString().slice(0, 10);
const errText = (e, fallback) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return fallback;
  return d.error || d.detail || Object.values(d).flat().join(' ') || fallback;
};
const PO_COLOR = { DRAFT: 'default', ORDERED: 'primary', PARTIAL_RECEIVED: 'warning', RECEIVED: 'success', CANCELLED: 'error' };
const TR_COLOR = { DRAFT: 'default', IN_TRANSIT: 'warning', COMPLETED: 'success', CANCELLED: 'error' };
const emptyLine = () => ({ product: null, quantity: '', unit_cost: '' });

// Product + quantity (+ cost) rows shared by the three dialogs.
const LineEditor = ({ lines, setLines, products, withCost }) => (
  <>
    {lines.map((l, i) => (
      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Autocomplete size="small" sx={{ flex: 1, minWidth: 220 }} options={products} value={l.product}
          getOptionLabel={(p) => `${p.name} (${p.sku})`}
          onChange={(_, v) => setLines(ls => ls.map((x, idx) => (idx === i ? { ...x, product: v } : x)))}
          renderInput={(params) => <TextField {...params} label="Product" />} />
        <TextField size="small" type="number" label="Qty" sx={{ width: 100 }} value={l.quantity}
          onChange={(e) => setLines(ls => ls.map((x, idx) => (idx === i ? { ...x, quantity: e.target.value } : x)))} />
        {withCost && (
          <TextField size="small" type="number" label="Cost each (₹)" sx={{ width: 130 }} value={l.unit_cost}
            onChange={(e) => setLines(ls => ls.map((x, idx) => (idx === i ? { ...x, unit_cost: e.target.value } : x)))} />
        )}
        <IconButton size="small" aria-label="Remove line" disabled={lines.length === 1}
          onClick={() => setLines(ls => ls.filter((_, idx) => idx !== i))}><DeleteIcon fontSize="small" /></IconButton>
      </Box>
    ))}
    <Button size="small" onClick={() => setLines(ls => [...ls, emptyLine()])}>Add another product</Button>
  </>
);

const linesReady = (lines, withCost) => lines.every(l => l.product && l.quantity > 0 && (!withCost || l.unit_cost !== ''));
const toPayload = (lines) => lines.map(l => ({ product: l.product.id, quantity: l.quantity, unit_cost: l.unit_cost || 0 }));

// Buying stock, moving it between warehouses, and correcting it (damage, loss, opening stock).
const RetailProcurementTab = () => {
  const [sub, setSub] = useState(0);
  const [orders, setOrders] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState(null); // 'po' | 'transfer' | 'adjust' | {receive: po}
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [lines, setLines] = useState([emptyLine()]);
  const [receiveQty, setReceiveQty] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, t, a, s, w, p] = await Promise.all([
        api.get('/retail/purchase-orders/'), api.get('/retail/stock-transfers/'), api.get('/retail/stock-adjustments/'),
        api.get('/retail/suppliers/'), api.get('/retail/warehouses/'), api.get('/retail/products/'),
      ]);
      setOrders(asList(o.data)); setTransfers(asList(t.data)); setAdjustments(asList(a.data));
      setSuppliers(asList(s.data)); setWarehouses(asList(w.data)); setProducts(asList(p.data));
    } catch (e) {
      setToast('Could not load procurement data.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (kind) => {
    setFormError('');
    setLines([emptyLine()]);
    setForm(kind === 'po'
      ? { supplier: '', order_date: today(), expected_delivery: today() }
      : kind === 'transfer'
        ? { from_warehouse: '', to_warehouse: '', transfer_date: today() }
        : { warehouse: '', adjustment_type: 'ADD', reason: '' });
    setDialog(kind);
  };

  const submit = async (url, body, message) => {
    setFormError('');
    setSaving(true);
    try {
      await api.post(url, body);
      setDialog(null);
      setToast(message);
      load();
    } catch (e) {
      setFormError(errText(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const act = async (url, message) => {
    try {
      await api.post(url);
      setToast(message);
      load();
    } catch (e) {
      setToast(errText(e, 'That did not work.'));
    }
  };

  const openReceive = (po) => {
    setFormError('');
    setForm({ warehouse: (warehouses.find(w => w.is_primary) || warehouses[0] || {}).id || '' });
    setReceiveQty(Object.fromEntries(po.items.map(i => [i.id, i.quantity - i.received_quantity])));
    setDialog({ receive: po });
  };

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_cost) || 0), 0);
  const noWarehouses = warehouses.length === 0;

  if (loading) return <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 1 }}>
      {noWarehouses && <Alert severity="info" sx={{ mb: 2 }}>Add a warehouse (a shop or store room) before receiving or moving stock.</Alert>}
      <Tabs value={sub} onChange={(_, v) => setSub(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label="Purchase orders" /><Tab label="Stock transfers" /><Tab label="Stock adjustments" />
      </Tabs>

      {sub === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} disabled={suppliers.length === 0} onClick={() => open('po')}>New purchase order</Button>
          </Box>
          {suppliers.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Add a supplier before placing an order.</Alert>}
          <TableContainer component={Paper} variant="outlined"><Table size="small">
            <TableHead><TableRow><TableCell>Order no.</TableCell><TableCell>Supplier</TableCell><TableCell>Expected</TableCell>
              <TableCell align="right">Total</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
            <TableBody>
              {orders.length === 0 && <TableRow><TableCell colSpan={6} align="center">No purchase orders yet.</TableCell></TableRow>}
              {orders.map(po => (
                <TableRow key={po.id}>
                  <TableCell>{po.po_number}</TableCell><TableCell>{po.supplier_name}</TableCell>
                  <TableCell>{new Date(po.expected_delivery).toLocaleDateString()}</TableCell>
                  <TableCell align="right">₹{Number(po.total_amount).toFixed(2)}</TableCell>
                  <TableCell><Chip size="small" color={PO_COLOR[po.status]} label={po.status.replace('_', ' ')} /></TableCell>
                  <TableCell align="right">
                    {['DRAFT', 'ORDERED', 'PARTIAL_RECEIVED'].includes(po.status) && po.items.length > 0 && !noWarehouses && (
                      <Button size="small" variant="outlined" onClick={() => openReceive(po)}>Receive goods</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></TableContainer>
        </>
      )}

      {sub === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} disabled={warehouses.length < 2} onClick={() => open('transfer')}>New transfer</Button>
          </Box>
          {warehouses.length < 2 && <Alert severity="info" sx={{ mb: 2 }}>You need at least two warehouses to move stock between them.</Alert>}
          <TableContainer component={Paper} variant="outlined"><Table size="small">
            <TableHead><TableRow><TableCell>Transfer</TableCell><TableCell>From</TableCell><TableCell>To</TableCell>
              <TableCell>Items</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
            <TableBody>
              {transfers.length === 0 && <TableRow><TableCell colSpan={6} align="center">No transfers yet.</TableCell></TableRow>}
              {transfers.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.transfer_number}</TableCell><TableCell>{t.from_warehouse_name}</TableCell><TableCell>{t.to_warehouse_name}</TableCell>
                  <TableCell>{t.items.map(i => `${i.product_name} × ${i.quantity}`).join(', ')}</TableCell>
                  <TableCell><Chip size="small" color={TR_COLOR[t.status]} label={t.status.replace('_', ' ')} /></TableCell>
                  <TableCell align="right">
                    {t.status === 'DRAFT' && <>
                      <Button size="small" onClick={() => act(`/retail/stock-transfers/${t.id}/dispatch/`, 'Dispatched: stock is now in transit')}>Dispatch</Button>
                      <Button size="small" color="error" onClick={() => act(`/retail/stock-transfers/${t.id}/cancel/`, 'Transfer cancelled')}>Cancel</Button>
                    </>}
                    {t.status === 'IN_TRANSIT' && <Button size="small" variant="outlined" onClick={() => act(`/retail/stock-transfers/${t.id}/complete/`, 'Received into the destination warehouse')}>Mark received</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></TableContainer>
        </>
      )}

      {sub === 2 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} disabled={noWarehouses} onClick={() => open('adjust')}>New adjustment</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined"><Table size="small">
            <TableHead><TableRow><TableCell>Adjustment</TableCell><TableCell>Warehouse</TableCell><TableCell>Type</TableCell>
              <TableCell>Items</TableCell><TableCell>Reason</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
            <TableBody>
              {adjustments.length === 0 && <TableRow><TableCell colSpan={6} align="center">No adjustments yet.</TableCell></TableRow>}
              {adjustments.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.adjustment_number}</TableCell><TableCell>{a.warehouse_name}</TableCell><TableCell>{a.adjustment_type}</TableCell>
                  <TableCell>{a.items.map(i => `${i.product_name} × ${i.quantity}`).join(', ')}</TableCell>
                  <TableCell>{a.reason}</TableCell><TableCell>{new Date(a.adjustment_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></TableContainer>
        </>
      )}

      <Dialog open={dialog === 'po'} onClose={() => setDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>New purchase order</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField select size="small" label="Supplier" sx={{ minWidth: 220 }} value={form.supplier || ''} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
              {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField size="small" type="date" label="Order date" InputLabelProps={{ shrink: true }} value={form.order_date || ''} onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
            <TextField size="small" type="date" label="Expected delivery" InputLabelProps={{ shrink: true }} value={form.expected_delivery || ''} onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })} />
          </Box>
          <LineEditor lines={lines} setLines={setLines} products={products} withCost />
          <Typography sx={{ mt: 2 }} fontWeight={600}>Total: ₹{total.toFixed(2)}</Typography>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={saving || !form.supplier || !linesReady(lines, true)}
            onClick={() => submit('/retail/purchase-orders/', { ...form, status: 'ORDERED', items_input: toPayload(lines) }, 'Order placed')}>
            {saving ? 'Saving...' : 'Place order'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!dialog?.receive} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Receive goods: {dialog?.receive?.po_number}</DialogTitle>
        <DialogContent dividers>
          <TextField select size="small" fullWidth label="Received at" sx={{ mb: 2 }} value={form.warehouse || ''} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
            {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </TextField>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Enter what actually arrived. You can receive the rest later.</Typography>
          {dialog?.receive?.items.map(i => (
            <Box key={i.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
              <Typography sx={{ flex: 1 }}>{i.product_name} <Typography component="span" variant="caption" color="text.secondary">({i.quantity - i.received_quantity} to come)</Typography></Typography>
              <TextField size="small" type="number" label="Qty" sx={{ width: 100 }} value={receiveQty[i.id] ?? ''}
                onChange={(e) => setReceiveQty({ ...receiveQty, [i.id]: e.target.value })} />
            </Box>
          ))}
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={saving || !form.warehouse}
            onClick={() => submit(`/retail/purchase-orders/${dialog.receive.id}/receive/`,
              { warehouse: form.warehouse, items: Object.entries(receiveQty).map(([item, quantity]) => ({ item: Number(item), quantity })) }, 'Goods received into stock')}>
            {saving ? 'Saving...' : 'Add to stock'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'transfer'} onClose={() => setDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>New stock transfer</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField select size="small" label="From" sx={{ minWidth: 200 }} value={form.from_warehouse || ''} onChange={(e) => setForm({ ...form, from_warehouse: e.target.value })}>
              {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="To" sx={{ minWidth: 200 }} value={form.to_warehouse || ''} onChange={(e) => setForm({ ...form, to_warehouse: e.target.value })}>
              {warehouses.filter(w => w.id !== form.from_warehouse).map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </TextField>
            <TextField size="small" type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.transfer_date || ''} onChange={(e) => setForm({ ...form, transfer_date: e.target.value })} />
          </Box>
          <LineEditor lines={lines} setLines={setLines} products={products} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Stock leaves the sending warehouse when you press Dispatch.</Typography>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={saving || !form.from_warehouse || !form.to_warehouse || !linesReady(lines, false)}
            onClick={() => submit('/retail/stock-transfers/', { ...form, items_input: toPayload(lines) }, 'Transfer created')}>
            {saving ? 'Saving...' : 'Create transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'adjust'} onClose={() => setDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>New stock adjustment</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField select size="small" label="Warehouse" sx={{ minWidth: 200 }} value={form.warehouse || ''} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
              {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Type" sx={{ minWidth: 160 }} value={form.adjustment_type || 'ADD'} onChange={(e) => setForm({ ...form, adjustment_type: e.target.value })}>
              <MenuItem value="ADD">Add stock</MenuItem><MenuItem value="REMOVE">Remove stock</MenuItem>
              <MenuItem value="DAMAGED">Damaged</MenuItem><MenuItem value="THEFT">Theft</MenuItem><MenuItem value="LOSS">Loss</MenuItem>
            </TextField>
            <TextField size="small" label="Reason" sx={{ flex: 1, minWidth: 200 }} value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </Box>
          <LineEditor lines={lines} setLines={setLines} products={products} />
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={saving || !form.warehouse || !form.reason || !linesReady(lines, false)}
            onClick={() => submit('/retail/stock-adjustments/', { ...form, items_input: toPayload(lines) }, 'Stock adjusted')}>
            {saving ? 'Saving...' : 'Apply adjustment'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default RetailProcurementTab;
