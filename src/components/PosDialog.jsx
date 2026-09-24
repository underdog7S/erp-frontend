import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, TextField, Typography, List, ListItemButton,
  ListItemText, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert, MenuItem, Chip, Divider
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

const money = (n) => `₹${(Number(n) || 0).toFixed(2)}`;
const errText = (e, fallback) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return fallback;
  return d.error || d.detail || Object.values(d).flat().map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ') || fallback;
};

/**
 * Shared checkout for the pharmacy and retail counters.
 *
 * `config` describes the module:
 *   searchUrl      list endpoint that accepts ?search=
 *   toItem(row)    -> { id, name, sub, price, mrp, stock, gstRate, inclusive, blockedReason? }
 *   lineKey        'medicine' | 'product' (name field the sale API reads); the id goes in `${lineKey}_id`
 *   submitUrl      where the sale is posted
 *   extra          optional extra body fields (e.g. the warehouse)
 *   requirePhone   ask for a phone number with the customer name
 */
const PosDialog = ({ open, onClose, title, config, onDone, extraControls }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [lines, setLines] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [payment, setPayment] = useState({ payment_method: 'CASH', payment_status: 'PAID' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (open) { setQuery(''); setResults([]); setLines([]); setCustomer({ name: '', phone: '' }); setError(''); setDone(null); }
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) { setResults([]); return undefined; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(config.searchUrl, { params: { search: query.trim() } });
        setResults((Array.isArray(res.data) ? res.data : (res.data.results || [])).slice(0, 8).map(config.toItem));
      } catch (e) { setResults([]); }
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  const add = (item) => {
    setLines(ls => {
      const found = ls.find(l => l.id === item.id);
      if (found) return ls.map(l => (l.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...ls, { ...item, quantity: 1, priceInput: String(item.price ?? '') }];
    });
    setQuery(''); setResults([]);
  };
  const patch = (id, p) => setLines(ls => ls.map(l => (l.id === id ? { ...l, ...p } : l)));

  const totals = useMemo(() => {
    let gross = 0; let tax = 0; let added = 0;
    lines.forEach(l => {
      const amount = (Number(l.priceInput) || 0) * l.quantity;
      const rate = Number(l.gstRate) || 0;
      const lineTax = l.inclusive ? amount * rate / (100 + rate) : amount * rate / 100;
      gross += amount; tax += lineTax;
      if (!l.inclusive) added += lineTax;
    });
    return { gross, tax, total: gross + added };
  }, [lines]);

  const overMrp = lines.find(l => l.mrp != null && Number(l.priceInput) > Number(l.mrp));
  const overStock = lines.find(l => l.stock != null && l.quantity > l.stock);

  const submit = async () => {
    setError('');
    setSaving(true);
    try {
      const body = {
        ...(config.extra || {}), ...payment,
        items: lines.map(l => ({ [config.lineKey]: l.name, [`${config.lineKey}_id`]: l.id, quantity: l.quantity, price: l.priceInput })),
      };
      if (customer.name && customer.phone) { body.customer_name_input = customer.name; body.phone = customer.phone; }
      const res = await api.post(config.submitUrl, body);
      setDone(res.data);
      if (onDone) onDone(res.data);
    } catch (e) {
      setError(errText(e, 'Could not complete the sale.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {done ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" gutterBottom>Sale complete</Typography>
            <Typography>Invoice {done.invoice_number}</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>{money(done.total_amount)}</Typography>
            {Number(done.tax_amount) > 0 && (
              <Typography color="text.secondary">
                Includes GST {money(done.tax_amount)} (CGST {money(done.cgst_amount)} + SGST {money(done.sgst_amount)})
              </Typography>
            )}
          </Box>
        ) : (
          <>
            {extraControls}
            <TextField fullWidth autoFocus label={config.searchLabel || 'Search item by name'} value={query} onChange={(e) => setQuery(e.target.value)} margin="dense" />
            {results.length > 0 && (
              <List dense sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                {results.map(r => (
                  <ListItemButton key={r.id} onClick={() => add(r)} disabled={!!r.blockedReason}>
                    <ListItemText primary={r.name} secondary={r.blockedReason || `${r.sub || ''} ${r.price != null ? `· ${money(r.price)}` : ''} · ${r.stock ?? 0} in stock`} />
                  </ListItemButton>
                ))}
              </List>
            )}
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead><TableRow>
                <TableCell>Item</TableCell><TableCell width={90}>Qty</TableCell><TableCell width={110}>Price</TableCell>
                <TableCell align="right">Amount</TableCell><TableCell width={40} />
              </TableRow></TableHead>
              <TableBody>
                {lines.length === 0 && <TableRow><TableCell colSpan={5} align="center">Search above and pick an item to start the bill.</TableCell></TableRow>}
                {lines.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{l.name}{Number(l.gstRate) ? <Chip size="small" label={`GST ${Number(l.gstRate)}%`} sx={{ ml: 1 }} /> : null}</TableCell>
                    <TableCell><TextField size="small" type="number" value={l.quantity} inputProps={{ min: 1 }}
                      onChange={(e) => patch(l.id, { quantity: Math.max(1, parseInt(e.target.value || '1', 10)) })} /></TableCell>
                    <TableCell><TextField size="small" type="number" value={l.priceInput}
                      error={l.mrp != null && Number(l.priceInput) > Number(l.mrp)} onChange={(e) => patch(l.id, { priceInput: e.target.value })} /></TableCell>
                    <TableCell align="right">{money((Number(l.priceInput) || 0) * l.quantity)}</TableCell>
                    <TableCell><IconButton size="small" aria-label="Remove item" onClick={() => setLines(ls => ls.filter(x => x.id !== l.id))}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {overMrp && <Alert severity="warning" sx={{ mt: 1 }}>{overMrp.name}: the price is above the MRP of {money(overMrp.mrp)}. It cannot be billed.</Alert>}
            {overStock && <Alert severity="warning" sx={{ mt: 1 }}>{overStock.name}: only {overStock.stock} in stock.</Alert>}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField size="small" label="Customer name (optional)" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} sx={{ flex: 1, minWidth: 170 }} />
              <TextField size="small" label="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} sx={{ width: 160 }}
                helperText={customer.name && !customer.phone ? 'Needed to save the customer' : ' '} />
              <TextField select size="small" label="Payment" value={payment.payment_method} onChange={(e) => setPayment({ ...payment, payment_method: e.target.value })} sx={{ width: 130 }}>
                {['CASH', 'UPI', 'CARD', 'CHEQUE'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Status" value={payment.payment_status} onChange={(e) => setPayment({ ...payment, payment_status: e.target.value })} sx={{ width: 120 }}>
                <MenuItem value="PAID">Paid</MenuItem><MenuItem value="PENDING">Pending</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ mt: 1, textAlign: 'right' }}>
              {totals.tax > 0 && <Typography variant="body2" color="text.secondary">GST {money(totals.tax)} {lines.every(l => l.inclusive) ? '(included in prices)' : ''}</Typography>}
              <Typography variant="h5">Total {money(totals.total)}</Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{done ? 'Close' : 'Cancel'}</Button>
        {!done && <Button variant="contained" onClick={submit} disabled={saving || lines.length === 0 || !!overMrp || !!overStock}>{saving ? 'Saving...' : 'Complete sale'}</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default PosDialog;
