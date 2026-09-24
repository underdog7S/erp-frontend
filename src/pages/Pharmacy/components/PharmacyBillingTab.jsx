import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, TextField, Snackbar
} from '@mui/material';
import api from '../../../services/api';
import PosDialog from '../../../components/PosDialog';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const money = (n) => `₹${(Number(n) || 0).toFixed(2)}`;

const POS_CONFIG = {
  searchUrl: '/pharmacy/medicines/',
  searchLabel: 'Search medicine by name',
  lineKey: 'medicine',
  submitUrl: '/pharmacy/sales/',
  toItem: (m) => ({
    id: m.id,
    name: `${m.name}${m.strength ? ` ${m.strength}` : ''}`,
    sub: m.dosage_form,
    price: m.sale_price != null ? Number(m.sale_price) : null,
    mrp: m.sale_mrp != null ? Number(m.sale_mrp) : null,
    stock: m.total_stock,
    gstRate: m.gst_rate,
    inclusive: m.price_includes_tax,
    blockedReason: m.sale_price == null ? 'No in-date stock' : '',
  }),
};

// Counter billing: a real bill with items taken from stock (earliest expiry first), GST worked out per line.
const PharmacyBillingTab = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posOpen, setPosOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/sales/', { params: search ? { search } : {} });
      setSales(asList(res.data));
      setError('');
    } catch (e) {
      setError('Failed to load billing history.');
    } finally {
      setLoading(false);
    }
  }, [search]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const openPdf = async (sale) => {
    try {
      const res = await api.get(`/pharmacy/sales/${sale.id}/pdf/`, { responseType: 'blob' });
      window.open(URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' })), '_blank', 'noopener');
    } catch (e) {
      setToast('Could not open the invoice PDF.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Billing &amp; invoices</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" label="Search invoice or customer" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="contained" onClick={() => setPosOpen(true)}>New Sale</Button>
        </Box>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Invoice</TableCell><TableCell>Date</TableCell><TableCell>Customer</TableCell>
              <TableCell align="right">GST</TableCell><TableCell align="right">Total</TableCell><TableCell>Payment</TableCell><TableCell />
            </TableRow></TableHead>
            <TableBody>
              {sales.length === 0 && <TableRow><TableCell colSpan={7} align="center">No sales yet.</TableCell></TableRow>}
              {sales.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.invoice_number}</TableCell>
                  <TableCell>{new Date(s.sale_date).toLocaleString()}</TableCell>
                  <TableCell>{s.customer_name || 'Walk-in'}</TableCell>
                  <TableCell align="right">{Number(s.tax_amount) ? money(s.tax_amount) : '-'}</TableCell>
                  <TableCell align="right">{money(s.total_amount)}</TableCell>
                  <TableCell><Chip size="small" color={s.payment_status === 'PAID' ? 'success' : 'warning'} label={`${s.payment_method} · ${s.payment_status}`} /></TableCell>
                  <TableCell align="right"><Button size="small" onClick={() => openPdf(s)}>Invoice PDF</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PosDialog open={posOpen} onClose={() => setPosOpen(false)} title="New sale" config={POS_CONFIG} onDone={load} />
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default PharmacyBillingTab;
