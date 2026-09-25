import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const money = (n) => `₹${(Number(n) || 0).toFixed(2)}`;
const errText = (e, fallback) => {
  const d = e.response?.data;
  if (!d) return fallback;
  if (typeof d === 'string') return d;
  if (d.error) return d.error;
  const first = Object.values(d)[0];
  return Array.isArray(first) ? first[0] : (typeof first === 'string' ? first : fallback);
};

const REASONS = [
  ['CUSTOMER_REQUEST', 'Customer request', true], ['WRONG_ITEM', 'Wrong item given', true], ['OTHER', 'Other', true],
  ['DAMAGED', 'Damaged', false], ['DEFECTIVE', 'Defective', false], ['EXPIRED', 'Expired', false],
];
const METHODS = [['CASH', 'Cash'], ['UPI', 'UPI'], ['CARD', 'Card'], ['CREDIT_NOTE', 'Credit note']];
const STATUS_COLOR = { PENDING: 'warning', PROCESSED: 'success', CANCELLED: 'default', APPROVED: 'info' };

// Returns: pick the original bill, say how many of each medicine came back. The refund is worked out from the bill, not typed in.
const PharmacyReturnsTab = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [sale, setSale] = useState(null);
  const [qty, setQty] = useState({});
  const [reason, setReason] = useState('CUSTOMER_REQUEST');
  const [method, setMethod] = useState('CASH');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/returns/');
      setReturns(asList(res.data));
      setError('');
    } catch (e) {
      setError('Failed to load returns.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openDialog = () => { setInvoice(''); setSale(null); setQty({}); setReason('CUSTOMER_REQUEST'); setMethod('CASH'); setFormError(''); setOpen(true); };

  const findSale = async () => {
    setFormError('');
    try {
      const res = await api.get('/pharmacy/sales/', { params: { search: invoice.trim() } });
      const found = asList(res.data).find(s => s.invoice_number.toLowerCase() === invoice.trim().toLowerCase()) || asList(res.data)[0];
      if (!found) { setSale(null); setFormError('No bill found with that invoice number.'); return; }
      if (!found.customer) { setSale(null); setFormError('That bill has no customer, so it cannot be returned here.'); return; }
      setSale(found); setQty({});
    } catch (e) {
      setFormError(errText(e, 'Could not search bills.'));
    }
  };

  const chosen = sale ? sale.items.filter(i => Number(qty[i.id]) > 0) : [];

  const submit = async () => {
    setSaving(true); setFormError('');
    try {
      await api.post('/pharmacy/returns/', {
        sale: sale.id, return_reason: reason, refund_method: method,
        items: chosen.map(i => ({ sale_item: i.id, quantity: Number(qty[i.id]) })),
      });
      setOpen(false); setToast('Return recorded. Process it to give the refund and update stock.'); load();
    } catch (e) {
      setFormError(errText(e, 'Could not record the return.'));
    } finally {
      setSaving(false);
    }
  };

  const act = async (r, body, done) => {
    try {
      const res = await api.post(`/pharmacy/returns/${r.id}/process/`, body || {});
      const extra = res.data.restocked_units !== undefined
        ? ` ${res.data.restocked_units} unit(s) back in stock${res.data.points_taken_back ? `, ${res.data.points_taken_back} loyalty points taken back` : ''}.` : '';
      setToast(done + extra); load();
    } catch (e) {
      setToast(errText(e, 'Could not update the return.'));
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Returns &amp; refunds</Typography>
        <Button variant="contained" onClick={openDialog}>New return</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Alert severity="info" sx={{ mb: 2 }}>
        Damaged, defective and expired medicines are not put back on the shelf. Processing a return also takes back the loyalty points earned on the returned amount.
      </Alert>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead><TableRow>
            <TableCell>Return</TableCell><TableCell>Bill</TableCell><TableCell>Customer</TableCell><TableCell>Reason</TableCell>
            <TableCell align="right">Refund</TableCell><TableCell>Status</TableCell><TableCell />
          </TableRow></TableHead>
          <TableBody>
            {returns.length === 0 && <TableRow><TableCell colSpan={7} align="center">No returns yet.</TableCell></TableRow>}
            {returns.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.return_number}<Typography variant="caption" display="block" color="text.secondary">{new Date(r.return_date).toLocaleDateString()}</Typography></TableCell>
                <TableCell>{r.sale_invoice_number}</TableCell>
                <TableCell>{r.customer_name}</TableCell>
                <TableCell>{(REASONS.find(x => x[0] === r.return_reason) || [])[1] || r.return_reason}
                  <Typography variant="caption" display="block" color="text.secondary">{(r.items || []).map(i => `${i.medicine_name} x${i.quantity}`).join(', ')}</Typography>
                </TableCell>
                <TableCell align="right">{money(r.refund_amount)}</TableCell>
                <TableCell><Chip size="small" color={STATUS_COLOR[r.status] || 'default'} label={r.status} /></TableCell>
                <TableCell align="right">
                  {r.status === 'PENDING' && <Button size="small" variant="contained" onClick={() => act(r, {}, 'Return processed.')}>Process</Button>}
                  {r.status === 'PENDING' && <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => act(r, { action: 'cancel' }, 'Return cancelled.')}>Cancel</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New return</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField size="small" fullWidth label="Invoice number" value={invoice} onChange={(e) => setInvoice(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') findSale(); }} />
            <Button variant="outlined" onClick={findSale} disabled={!invoice.trim()}>Find bill</Button>
          </Box>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
          {sale && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>{sale.invoice_number} · {sale.customer_name} · {money(sale.total_amount)}</Typography>
              {sale.items.map(i => (
                <Box key={i.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography sx={{ flex: 1 }} variant="body2">{i.medicine_name} <Typography component="span" variant="caption" color="text.secondary">(sold {i.quantity} at {money(i.unit_price)})</Typography></Typography>
                  <TextField size="small" type="number" label="Returned" sx={{ width: 100 }} inputProps={{ min: 0, max: i.quantity }}
                    value={qty[i.id] || ''} onChange={(e) => setQty(q => ({ ...q, [i.id]: e.target.value }))} />
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField select size="small" fullWidth label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REASONS.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                </TextField>
                <TextField select size="small" fullWidth label="Refund by" value={method} onChange={(e) => setMethod(e.target.value)}>
                  {METHODS.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                </TextField>
              </Box>
              {chosen.length > 0 && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>The exact refund (with GST) is worked out from the bill when you save.</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving || !sale || chosen.length === 0} onClick={submit}>Record return</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={5000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default PharmacyReturnsTab;
