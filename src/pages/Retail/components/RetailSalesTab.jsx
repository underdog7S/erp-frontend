import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, TextField, MenuItem
} from '@mui/material';
import api from '../../../services/api';
import PosDialog from '../../../components/PosDialog';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const money = (n) => `₹${(Number(n) || 0).toFixed(2)}`;

// Counter sales: pick products, GST is worked out per line, stock leaves the chosen warehouse.
const RetailSalesTab = () => {
  const [sales, setSales] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouse, setWarehouse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posOpen, setPosOpen] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, w] = await Promise.all([
        api.get('/retail/sales/', { params: search ? { search } : {} }), api.get('/retail/warehouses/'),
      ]);
      setSales(asList(s.data));
      const list = asList(w.data);
      setWarehouses(list);
      setWarehouse(prev => prev || (list.find(x => x.is_primary) || list[0] || {}).id || '');
      setError('');
    } catch (e) {
      setError('Failed to load sales.');
    } finally {
      setLoading(false);
    }
  }, [search]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const config = {
    searchUrl: '/retail/products/',
    searchLabel: 'Search product by name',
    lineKey: 'product',
    submitUrl: '/retail/sales/',
    extra: { warehouse },
    toItem: (p) => ({
      id: p.id, name: p.name, sub: p.sku, price: Number(p.selling_price), mrp: Number(p.mrp),
      stock: p.total_stock, gstRate: p.gst_rate, inclusive: p.price_includes_tax,
    }),
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Point of sale &amp; history</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" label="Search invoice or customer" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="contained" onClick={() => setPosOpen(true)} disabled={warehouses.length === 0}>New Sale</Button>
        </Box>
      </Box>
      {warehouses.length === 0 && !loading && <Alert severity="info" sx={{ mb: 2 }}>Add a warehouse (your shop or store room) before making sales, so stock can be taken from it.</Alert>}

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Invoice</TableCell><TableCell>Date</TableCell><TableCell>Customer</TableCell>
              <TableCell align="right">GST</TableCell><TableCell align="right">Total</TableCell><TableCell>Payment</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {sales.length === 0 && <TableRow><TableCell colSpan={6} align="center">No sales yet.</TableCell></TableRow>}
              {sales.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.invoice_number}</TableCell>
                  <TableCell>{new Date(s.sale_date).toLocaleString()}</TableCell>
                  <TableCell>{s.customer_name || 'Walk-in'}</TableCell>
                  <TableCell align="right">{Number(s.tax_amount) ? money(s.tax_amount) : '-'}</TableCell>
                  <TableCell align="right">{money(s.total_amount)}</TableCell>
                  <TableCell><Chip size="small" color={s.payment_status === 'PAID' ? 'success' : 'warning'} label={`${s.payment_method} · ${s.payment_status}`} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PosDialog open={posOpen} onClose={() => setPosOpen(false)} title="New sale" config={config} onDone={load}
        extraControls={warehouses.length > 1 ? (
          <TextField select size="small" label="Sell from" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} sx={{ mb: 1, minWidth: 200 }}>
            {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </TextField>
        ) : null} />
    </Box>
  );
};

export default RetailSalesTab;
