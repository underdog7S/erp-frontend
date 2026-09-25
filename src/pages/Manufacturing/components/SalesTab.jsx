import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Chip, MenuItem, Grid, Divider
} from '@mui/material';
import api from '../../../services/api';
import { openPdf } from '../../../utils/openPdf';

const SO_STATUS_COLORS = { DRAFT: 'default', CONFIRMED: 'info', DISPATCHED: 'warning', DELIVERED: 'success', CANCELLED: 'error' };

const SalesTab = () => {
  const [customers, setCustomers] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', address: '', customer_type: 'WHOLESALE', gst_number: '' });

  const [openSoDialog, setOpenSoDialog] = useState(false);
  const [soForm, setSoForm] = useState({ customer: '', warehouse: '', order_date: new Date().toISOString().slice(0, 10) });

  const [manageSo, setManageSo] = useState(null);
  const [itemForm, setItemForm] = useState({ finished_good: '', quantity: '', unit_price: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, sRes, fRes, wRes] = await Promise.all([
        api.get('/manufacturing/customers/'),
        api.get('/manufacturing/sales-orders/'),
        api.get('/manufacturing/finished-goods/'),
        api.get('/manufacturing/warehouses/'),
      ]);
      setCustomers(cRes.data.results || cRes.data);
      setSalesOrders(sRes.data.results || sRes.data);
      setFinishedGoods(fRes.data.results || fRes.data);
      setWarehouses(wRes.data.results || wRes.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load sales data.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveCustomer = async () => {
    try {
      await api.post('/manufacturing/customers/', customerForm);
      setSnackbar({ open: true, message: 'Customer added!', severity: 'success' });
      setOpenCustomerDialog(false);
      setCustomerForm({ name: '', phone: '', email: '', address: '', customer_type: 'WHOLESALE', gst_number: '' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to add customer.', severity: 'error' });
    }
  };

  const handleCreateSo = async () => {
    try {
      const res = await api.post('/manufacturing/sales-orders/', soForm);
      setSnackbar({ open: true, message: 'Sales order created! Now add finished goods.', severity: 'success' });
      setOpenSoDialog(false);
      setSoForm({ customer: '', warehouse: '', order_date: new Date().toISOString().slice(0, 10) });
      await fetchAll();
      setManageSo(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to create sales order.', severity: 'error' });
    }
  };

  const handleAddSoItem = async () => {
    if (!itemForm.finished_good || !itemForm.quantity || !itemForm.unit_price) return;
    try {
      await api.post('/manufacturing/sales-order-items/', { sales_order: manageSo.id, ...itemForm });
      setItemForm({ finished_good: '', quantity: '', unit_price: '' });
      const res = await api.get(`/manufacturing/sales-orders/${manageSo.id}/`);
      setManageSo(res.data);
      fetchAll();
      setSnackbar({ open: true, message: 'Item added - finished goods stock updated.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || err.response?.data?.quantity?.[0] || 'Failed to add item.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Customers</Typography>
        <Button variant="outlined" onClick={() => setOpenCustomerDialog(true)}>Add Customer</Button>
      </Box>
      <Grid container spacing={1} sx={{ mb: 4 }}>
        {customers.map(c => <Grid item key={c.id}><Chip label={`${c.name} (${c.customer_type})`} /></Grid>)}
        {customers.length === 0 && <Grid item><Typography variant="body2" color="text.secondary">No customers yet.</Typography></Grid>}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Sales Orders</Typography>
        <Button variant="contained" onClick={() => setOpenSoDialog(true)} disabled={customers.length === 0}>New Sales Order</Button>
      </Box>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SO #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesOrders.map(so => (
                <TableRow key={so.id}>
                  <TableCell>{so.so_number}</TableCell>
                  <TableCell>{so.customer_name}</TableCell>
                  <TableCell>₹{so.total_amount}</TableCell>
                  <TableCell><Chip size="small" color={SO_STATUS_COLORS[so.status]} label={so.status} /></TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => setManageSo(so)}>Items</Button>
                    <Button size="small" onClick={async () => { if (!(await openPdf(`/manufacturing/sales-orders/${so.id}/pdf/`))) setSnackbar({ open: true, message: 'Could not open the PDF.', severity: 'error' }); }}>PDF</Button>
                  </TableCell>
                </TableRow>
              ))}
              {salesOrders.length === 0 && (
                <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary">No sales orders yet.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)}>
        <DialogTitle>Add Customer</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} fullWidth margin="dense" />
          <TextField label="Phone" value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} fullWidth margin="dense" />
          <TextField label="Email" value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} fullWidth margin="dense" />
          <TextField select label="Customer Type" value={customerForm.customer_type} onChange={e => setCustomerForm({ ...customerForm, customer_type: e.target.value })} fullWidth margin="dense">
            <MenuItem value="RETAIL">Retail</MenuItem>
            <MenuItem value="WHOLESALE">Wholesale</MenuItem>
            <MenuItem value="DISTRIBUTOR">Distributor</MenuItem>
          </TextField>
          <TextField label="GST Number" value={customerForm.gst_number} onChange={e => setCustomerForm({ ...customerForm, gst_number: e.target.value })} fullWidth margin="dense" />
          <TextField label="Address" value={customerForm.address} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} fullWidth margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomerDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCustomer} disabled={!customerForm.name || !customerForm.phone}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSoDialog} onClose={() => setOpenSoDialog(false)}>
        <DialogTitle>New Sales Order</DialogTitle>
        <DialogContent>
          <TextField select label="Customer" value={soForm.customer} onChange={e => setSoForm({ ...soForm, customer: e.target.value })} fullWidth margin="dense">
            {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select label="Dispatch From Warehouse" value={soForm.warehouse} onChange={e => setSoForm({ ...soForm, warehouse: e.target.value })} fullWidth margin="dense">
            {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </TextField>
          <TextField label="Order Date" type="date" InputLabelProps={{ shrink: true }} value={soForm.order_date} onChange={e => setSoForm({ ...soForm, order_date: e.target.value })} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSoDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSo} disabled={!soForm.customer || !soForm.warehouse}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!manageSo} onClose={() => setManageSo(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{manageSo?.so_number} - Line Items</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Finished Good</TableCell><TableCell>Qty</TableCell><TableCell>Unit Price</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {manageSo?.items?.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.finished_good_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.unit_price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-end' }}>
            <TextField select label="Finished Good" value={itemForm.finished_good} onChange={e => setItemForm({ ...itemForm, finished_good: e.target.value })} sx={{ flex: 1 }} size="small">
              {finishedGoods.map(fg => <MenuItem key={fg.id} value={fg.id}>{fg.name}</MenuItem>)}
            </TextField>
            <TextField label="Qty" type="number" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })} size="small" sx={{ width: 90 }} />
            <TextField label="Unit Price" type="number" value={itemForm.unit_price} onChange={e => setItemForm({ ...itemForm, unit_price: e.target.value })} size="small" sx={{ width: 100 }} />
            <Button variant="contained" onClick={handleAddSoItem}>Add</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageSo(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SalesTab;
