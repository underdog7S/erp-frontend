import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Chip, MenuItem
} from '@mui/material';
import api from '../../../services/api';

const STATUS_COLORS = {
  PLANNED: 'default',
  IN_PROGRESS: 'info',
  QC_PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const ProductionOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [boms, setBoms] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ bom: '', quantity_to_produce: '', raw_material_warehouse: '', output_warehouse: '', planned_start_date: '', planned_end_date: '', notes: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [oRes, bRes, wRes] = await Promise.all([
        api.get('/manufacturing/production-orders/'),
        api.get('/manufacturing/boms/?'),
        api.get('/manufacturing/warehouses/'),
      ]);
      setOrders(oRes.data.results || oRes.data);
      setBoms((bRes.data.results || bRes.data).filter(b => b.is_active));
      setWarehouses(wRes.data.results || wRes.data);
    } catch {
      setError('Failed to load production orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    const bom = boms.find(b => b.id === form.bom);
    if (!bom) return;
    try {
      await api.post('/manufacturing/production-orders/', {
        ...form,
        finished_good: bom.finished_good,
      });
      setSnackbar({ open: true, message: 'Production order created!', severity: 'success' });
      setOpenDialog(false);
      setForm({ bom: '', quantity_to_produce: '', raw_material_warehouse: '', output_warehouse: '', planned_start_date: '', planned_end_date: '', notes: '' });
      fetchAll();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to create production order.', severity: 'error' });
    }
  };

  const handleStart = async (id) => {
    try {
      await api.post(`/manufacturing/production-orders/${id}/start/`);
      setSnackbar({ open: true, message: 'Production started - raw materials consumed.', severity: 'success' });
      fetchAll();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to start production.', severity: 'error' });
    }
  };

  const handleComplete = async (order) => {
    const qty = window.prompt(`How many ${order.finished_good_name} were actually produced?`, order.quantity_to_produce);
    if (qty === null) return;
    try {
      await api.post(`/manufacturing/production-orders/${order.id}/complete/`, { quantity_produced: qty });
      setSnackbar({ open: true, message: 'Production completed - finished goods credited.', severity: 'success' });
      fetchAll();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to complete production.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Production Orders</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)} disabled={boms.length === 0}>New Production Order</Button>
      </Box>
      {boms.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Create a Bill of Material with at least one raw material line before starting a production order.</Alert>}

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Finished Good</TableCell>
                <TableCell>Qty (Planned)</TableCell>
                <TableCell>Qty (Produced)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.order_number}</TableCell>
                  <TableCell>{row.finished_good_name}</TableCell>
                  <TableCell>{row.quantity_to_produce}</TableCell>
                  <TableCell>{row.quantity_produced}</TableCell>
                  <TableCell><Chip size="small" color={STATUS_COLORS[row.status]} label={row.status.replace('_', ' ')} /></TableCell>
                  <TableCell>
                    {row.status === 'PLANNED' && <Button size="small" onClick={() => handleStart(row.id)}>Start</Button>}
                    {row.status === 'IN_PROGRESS' && <Button size="small" color="success" onClick={() => handleComplete(row)}>Complete</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={6}><Typography variant="body2" color="text.secondary">No production orders yet.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>New Production Order</DialogTitle>
        <DialogContent>
          <TextField select label="Bill of Material" value={form.bom} onChange={e => setForm({ ...form, bom: e.target.value })} fullWidth margin="dense">
            {boms.map(b => <MenuItem key={b.id} value={b.id}>{b.finished_good_name} (v{b.version})</MenuItem>)}
          </TextField>
          <TextField label="Quantity to Produce" type="number" value={form.quantity_to_produce} onChange={e => setForm({ ...form, quantity_to_produce: e.target.value })} fullWidth margin="dense" />
          <TextField select label="Consume Raw Materials From" value={form.raw_material_warehouse} onChange={e => setForm({ ...form, raw_material_warehouse: e.target.value })} fullWidth margin="dense">
            {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </TextField>
          <TextField select label="Store Finished Goods At" value={form.output_warehouse} onChange={e => setForm({ ...form, output_warehouse: e.target.value })} fullWidth margin="dense">
            {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </TextField>
          <TextField label="Planned Start" type="date" InputLabelProps={{ shrink: true }} value={form.planned_start_date} onChange={e => setForm({ ...form, planned_start_date: e.target.value })} fullWidth margin="dense" />
          <TextField label="Planned End" type="date" InputLabelProps={{ shrink: true }} value={form.planned_end_date} onChange={e => setForm({ ...form, planned_end_date: e.target.value })} fullWidth margin="dense" />
          <TextField label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} fullWidth margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.bom || !form.quantity_to_produce || !form.raw_material_warehouse || !form.output_warehouse}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductionOrdersTab;
