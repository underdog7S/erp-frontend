import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Alert, CircularProgress,
  Snackbar, Autocomplete
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../../services/api';
import { openPdf } from '../../../utils/openPdf';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const STATUS_COLOR = { DRAFT: 'default', ORDERED: 'primary', RECEIVED: 'success', CANCELLED: 'error' };
const today = () => new Date().toISOString().slice(0, 10);
const errText = (e, fallback) => {
  const d = e.response?.data;
  if (!d) return fallback;
  if (typeof d === 'string') return fallback;
  return d.error || d.detail || Object.values(d).flat().join(' ') || fallback;
};

// Buy stock from a supplier and, on delivery, turn each line into a batch with expiry.
const PharmacyPurchaseTab = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ supplier: '', order_date: today(), expected_delivery: today(), notes: '' });
  const [lines, setLines] = useState([{ medicine: null, quantity: '', unit_cost: '' }]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [receiving, setReceiving] = useState(null); // the order being received
  const [batches, setBatches] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, s, m] = await Promise.all([
        api.get('/pharmacy/purchase-orders/'), api.get('/pharmacy/suppliers/'), api.get('/pharmacy/medicines/'),
      ]);
      setOrders(asList(o.data)); setSuppliers(asList(s.data)); setMedicines(asList(m.data));
    } catch (e) {
      setError('Could not load purchase orders.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const setLine = (i, patch) => setLines(ls => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_cost) || 0), 0);

  const createOrder = async () => {
    setFormError('');
    setSaving(true);
    try {
      await api.post('/pharmacy/purchase-orders/', {
        ...form,
        status: 'ORDERED',
        items_input: lines.map(l => ({ medicine: l.medicine?.id, quantity: l.quantity, unit_cost: l.unit_cost })),
      });
      setCreateOpen(false);
      setLines([{ medicine: null, quantity: '', unit_cost: '' }]);
      setToast('Order placed');
      load();
    } catch (e) {
      setFormError(errText(e, 'Could not save the order.'));
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (po, status) => {
    try {
      await api.patch(`/pharmacy/purchase-orders/${po.id}/`, { status });
      load();
    } catch (e) {
      setToast(errText(e, 'Could not update the order.'));
    }
  };

  const openReceive = (po) => {
    setReceiving(po);
    setFormError('');
    setBatches(po.items.map(it => ({
      item: it.id, name: it.medicine_name, quantity: it.quantity,
      batch_number: '', manufacturing_date: '', expiry_date: '', selling_price: '', mrp: '',
    })));
  };
  const setBatch = (i, patch) => setBatches(bs => bs.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  const receive = async () => {
    setFormError('');
    setSaving(true);
    try {
      await api.post(`/pharmacy/purchase-orders/${receiving.id}/receive/`, {
        items: batches.map(({ name, ...b }) => b),
      });
      setReceiving(null);
      setToast('Stock received into inventory');
      load();
    } catch (e) {
      setFormError(errText(e, 'Could not receive this order.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Purchase orders</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormError(''); setCreateOpen(true); }} disabled={suppliers.length === 0}>
          New order
        </Button>
      </Box>
      {suppliers.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Add a supplier on the Suppliers tab before placing an order.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead><TableRow>
            <TableCell>Order no.</TableCell><TableCell>Supplier</TableCell><TableCell>Ordered</TableCell>
            <TableCell>Expected</TableCell><TableCell align="right">Total</TableCell><TableCell>Status</TableCell><TableCell />
          </TableRow></TableHead>
          <TableBody>
            {orders.length === 0 && <TableRow><TableCell colSpan={7} align="center">No purchase orders yet.</TableCell></TableRow>}
            {orders.map(po => (
              <TableRow key={po.id}>
                <TableCell>{po.po_number}</TableCell>
                <TableCell>{po.supplier_name}</TableCell>
                <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(po.expected_delivery).toLocaleDateString()}</TableCell>
                <TableCell align="right">₹{Number(po.total_amount).toFixed(2)}</TableCell>
                <TableCell><Chip size="small" color={STATUS_COLOR[po.status] || 'default'} label={po.status} /></TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={async () => { if (!(await openPdf(`/pharmacy/purchase-orders/${po.id}/pdf/`))) setToast('Could not open the PDF.'); }}>PDF</Button>
                  {po.status === 'DRAFT' && <Button size="small" onClick={() => setStatus(po, 'ORDERED')}>Mark ordered</Button>}
                  {(po.status === 'DRAFT' || po.status === 'ORDERED') && po.items.length > 0 && (
                    <Button size="small" variant="outlined" sx={{ ml: 1 }} onClick={() => openReceive(po)}>Receive stock</Button>
                  )}
                  {(po.status === 'DRAFT' || po.status === 'ORDERED') && (
                    <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => setStatus(po, 'CANCELLED')}>Cancel</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New purchase order</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField select size="small" label="Supplier" sx={{ minWidth: 220 }} value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
              {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField size="small" type="date" label="Order date" InputLabelProps={{ shrink: true }} value={form.order_date}
              onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
            <TextField size="small" type="date" label="Expected delivery" InputLabelProps={{ shrink: true }} value={form.expected_delivery}
              onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })} />
          </Box>
          {lines.map((l, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Autocomplete size="small" sx={{ flex: 1, minWidth: 220 }} options={medicines} value={l.medicine}
                getOptionLabel={(m) => `${m.name}${m.strength ? ` ${m.strength}` : ''}`}
                onChange={(_, v) => setLine(i, { medicine: v })}
                renderInput={(params) => <TextField {...params} label="Medicine" />} />
              <TextField size="small" type="number" label="Qty" sx={{ width: 100 }} value={l.quantity}
                onChange={(e) => setLine(i, { quantity: e.target.value })} />
              <TextField size="small" type="number" label="Cost each (₹)" sx={{ width: 130 }} value={l.unit_cost}
                onChange={(e) => setLine(i, { unit_cost: e.target.value })} />
              <IconButton size="small" aria-label="Remove line" disabled={lines.length === 1}
                onClick={() => setLines(ls => ls.filter((_, idx) => idx !== i))}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          ))}
          <Button size="small" onClick={() => setLines(ls => [...ls, { medicine: null, quantity: '', unit_cost: '' }])}>Add another medicine</Button>
          <Typography sx={{ mt: 2 }} fontWeight={600}>Total: ₹{total.toFixed(2)}</Typography>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createOrder}
            disabled={saving || !form.supplier || lines.some(l => !l.medicine || !l.quantity || l.unit_cost === '')}>
            {saving ? 'Saving...' : 'Place order'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!receiving} onClose={() => setReceiving(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Receive stock: {receiving?.po_number}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter what is printed on each pack. Each line becomes a stock batch, and the order closes.
          </Typography>
          {batches.map((b, i) => (
            <Box key={b.item} sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ minWidth: 160, fontWeight: 600 }}>{b.name}</Typography>
              <TextField size="small" label="Batch no." sx={{ width: 120 }} value={b.batch_number} onChange={(e) => setBatch(i, { batch_number: e.target.value })} />
              <TextField size="small" type="date" label="Mfg date" InputLabelProps={{ shrink: true }} value={b.manufacturing_date} onChange={(e) => setBatch(i, { manufacturing_date: e.target.value })} />
              <TextField size="small" type="date" label="Expiry" InputLabelProps={{ shrink: true }} value={b.expiry_date} onChange={(e) => setBatch(i, { expiry_date: e.target.value })} />
              <TextField size="small" type="number" label="Qty" sx={{ width: 90 }} value={b.quantity} onChange={(e) => setBatch(i, { quantity: e.target.value })} />
              <TextField size="small" type="number" label="Sell price" sx={{ width: 110 }} value={b.selling_price} onChange={(e) => setBatch(i, { selling_price: e.target.value })} />
              <TextField size="small" type="number" label="MRP" sx={{ width: 100 }} value={b.mrp} onChange={(e) => setBatch(i, { mrp: e.target.value })} />
            </Box>
          ))}
          {formError && <Alert severity="error">{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiving(null)}>Cancel</Button>
          <Button variant="contained" onClick={receive}
            disabled={saving || batches.some(b => !b.batch_number || !b.manufacturing_date || !b.expiry_date || !b.selling_price || !b.mrp || !b.quantity)}>
            {saving ? 'Saving...' : 'Add to stock'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default PharmacyPurchaseTab;
