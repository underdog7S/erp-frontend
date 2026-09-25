import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Chip, MenuItem, Grid, Divider
} from '@mui/material';
import api from '../../../services/api';
import { openPdf } from '../../../utils/openPdf';

const PO_STATUS_COLORS = { DRAFT: 'default', ORDERED: 'info', PARTIAL_RECEIVED: 'warning', RECEIVED: 'success', CANCELLED: 'error' };

const ProcurementTab = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', gst_number: '' });

  const [openPoDialog, setOpenPoDialog] = useState(false);
  const [poForm, setPoForm] = useState({ supplier: '', order_date: new Date().toISOString().slice(0, 10), expected_delivery: '' });

  const [managePo, setManagePo] = useState(null);
  const [itemForm, setItemForm] = useState({ raw_material: '', quantity: '', unit_cost: '' });

  const [receivePo, setReceivePo] = useState(null);
  const [receiveWarehouse, setReceiveWarehouse] = useState('');
  const [receiveQuantities, setReceiveQuantities] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, rRes, wRes] = await Promise.all([
        api.get('/manufacturing/suppliers/'),
        api.get('/manufacturing/purchase-orders/'),
        api.get('/manufacturing/raw-materials/'),
        api.get('/manufacturing/warehouses/'),
      ]);
      setSuppliers(sRes.data.results || sRes.data);
      setPurchaseOrders(pRes.data.results || pRes.data);
      setRawMaterials(rRes.data.results || rRes.data);
      setWarehouses(wRes.data.results || wRes.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load procurement data.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveSupplier = async () => {
    try {
      await api.post('/manufacturing/suppliers/', supplierForm);
      setSnackbar({ open: true, message: 'Supplier added!', severity: 'success' });
      setOpenSupplierDialog(false);
      setSupplierForm({ name: '', contact_person: '', phone: '', email: '', address: '', gst_number: '' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to add supplier.', severity: 'error' });
    }
  };

  const handleCreatePo = async () => {
    try {
      const res = await api.post('/manufacturing/purchase-orders/', poForm);
      setSnackbar({ open: true, message: 'Purchase order created! Now add line items.', severity: 'success' });
      setOpenPoDialog(false);
      setPoForm({ supplier: '', order_date: new Date().toISOString().slice(0, 10), expected_delivery: '' });
      await fetchAll();
      setManagePo(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to create purchase order.', severity: 'error' });
    }
  };

  const handleAddPoItem = async () => {
    if (!itemForm.raw_material || !itemForm.quantity || !itemForm.unit_cost) return;
    try {
      await api.post('/manufacturing/purchase-order-items/', { purchase_order: managePo.id, ...itemForm });
      setItemForm({ raw_material: '', quantity: '', unit_cost: '' });
      const res = await api.get(`/manufacturing/purchase-orders/${managePo.id}/`);
      setManagePo(res.data);
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to add line item.', severity: 'error' });
    }
  };

  const openReceiveDialog = (po) => {
    setReceivePo(po);
    setReceiveWarehouse(warehouses.find(w => w.warehouse_type === 'RAW_MATERIAL')?.id || '');
    const defaults = {};
    po.items.forEach(item => {
      const remaining = item.quantity - item.received_quantity;
      if (remaining > 0) defaults[item.id] = remaining;
    });
    setReceiveQuantities(defaults);
  };

  const handleReceive = async () => {
    if (!receiveWarehouse) return;
    try {
      const gr = await api.post('/manufacturing/goods-receipts/', {
        purchase_order: receivePo.id, receipt_date: new Date().toISOString().slice(0, 10), warehouse: receiveWarehouse,
      });
      for (const item of receivePo.items) {
        const qty = parseFloat(receiveQuantities[item.id] || 0);
        if (qty > 0) {
          await api.post('/manufacturing/goods-receipt-items/', {
            goods_receipt: gr.data.id, purchase_order_item: item.id, quantity_received: qty,
          });
        }
      }
      setSnackbar({ open: true, message: 'Goods received - raw material stock updated.', severity: 'success' });
      setReceivePo(null);
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to record goods receipt.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Suppliers</Typography>
        <Button variant="outlined" onClick={() => setOpenSupplierDialog(true)}>Add Supplier</Button>
      </Box>
      <Grid container spacing={1} sx={{ mb: 4 }}>
        {suppliers.map(s => <Grid item key={s.id}><Chip label={`${s.name}${s.phone ? ' · ' + s.phone : ''}`} /></Grid>)}
        {suppliers.length === 0 && <Grid item><Typography variant="body2" color="text.secondary">No suppliers yet.</Typography></Grid>}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Purchase Orders</Typography>
        <Button variant="contained" onClick={() => setOpenPoDialog(true)} disabled={suppliers.length === 0}>New Purchase Order</Button>
      </Box>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PO #</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseOrders.map(po => (
                <TableRow key={po.id}>
                  <TableCell>{po.po_number}</TableCell>
                  <TableCell>{po.supplier_name}</TableCell>
                  <TableCell>₹{po.total_amount}</TableCell>
                  <TableCell><Chip size="small" color={PO_STATUS_COLORS[po.status]} label={po.status.replace('_', ' ')} /></TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => setManagePo(po)}>Items</Button>
                    <Button size="small" onClick={async () => { if (!(await openPdf(`/manufacturing/purchase-orders/${po.id}/pdf/`))) setSnackbar({ open: true, message: 'Could not open the PDF.', severity: 'error' }); }}>PDF</Button>
                    {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && po.items?.length > 0 && (
                      <Button size="small" color="success" onClick={() => openReceiveDialog(po)}>Receive</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {purchaseOrders.length === 0 && (
                <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary">No purchase orders yet.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openSupplierDialog} onClose={() => setOpenSupplierDialog(false)}>
        <DialogTitle>Add Supplier</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} fullWidth margin="dense" />
          <TextField label="Contact Person" value={supplierForm.contact_person} onChange={e => setSupplierForm({ ...supplierForm, contact_person: e.target.value })} fullWidth margin="dense" />
          <TextField label="Phone" value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} fullWidth margin="dense" />
          <TextField label="Email" value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} fullWidth margin="dense" />
          <TextField label="GST Number" value={supplierForm.gst_number} onChange={e => setSupplierForm({ ...supplierForm, gst_number: e.target.value })} fullWidth margin="dense" />
          <TextField label="Address" value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} fullWidth margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSupplierDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSupplier} disabled={!supplierForm.name || !supplierForm.phone}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPoDialog} onClose={() => setOpenPoDialog(false)}>
        <DialogTitle>New Purchase Order</DialogTitle>
        <DialogContent>
          <TextField select label="Supplier" value={poForm.supplier} onChange={e => setPoForm({ ...poForm, supplier: e.target.value })} fullWidth margin="dense">
            {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField label="Order Date" type="date" InputLabelProps={{ shrink: true }} value={poForm.order_date} onChange={e => setPoForm({ ...poForm, order_date: e.target.value })} fullWidth margin="dense" />
          <TextField label="Expected Delivery" type="date" InputLabelProps={{ shrink: true }} value={poForm.expected_delivery} onChange={e => setPoForm({ ...poForm, expected_delivery: e.target.value })} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPoDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePo} disabled={!poForm.supplier}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!managePo} onClose={() => setManagePo(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{managePo?.po_number} - Line Items</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Raw Material</TableCell><TableCell>Qty</TableCell><TableCell>Unit Cost</TableCell><TableCell>Received</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {managePo?.items?.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.raw_material_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.unit_cost}</TableCell>
                  <TableCell>{item.received_quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-end' }}>
            <TextField select label="Raw Material" value={itemForm.raw_material} onChange={e => setItemForm({ ...itemForm, raw_material: e.target.value })} sx={{ flex: 1 }} size="small">
              {rawMaterials.map(rm => <MenuItem key={rm.id} value={rm.id}>{rm.name}</MenuItem>)}
            </TextField>
            <TextField label="Qty" type="number" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })} size="small" sx={{ width: 90 }} />
            <TextField label="Unit Cost" type="number" value={itemForm.unit_cost} onChange={e => setItemForm({ ...itemForm, unit_cost: e.target.value })} size="small" sx={{ width: 100 }} />
            <Button variant="contained" onClick={handleAddPoItem}>Add</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManagePo(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!receivePo} onClose={() => setReceivePo(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Receive Goods - {receivePo?.po_number}</DialogTitle>
        <DialogContent>
          <TextField select label="Receive Into Warehouse" value={receiveWarehouse} onChange={e => setReceiveWarehouse(e.target.value)} fullWidth margin="dense">
            {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </TextField>
          {receivePo?.items?.map(item => {
            const remaining = item.quantity - item.received_quantity;
            if (remaining <= 0) return null;
            return (
              <TextField
                key={item.id}
                label={`${item.raw_material_name} (max ${remaining})`}
                type="number"
                value={receiveQuantities[item.id] ?? ''}
                onChange={e => setReceiveQuantities({ ...receiveQuantities, [item.id]: e.target.value })}
                fullWidth margin="dense"
              />
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceivePo(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleReceive} disabled={!receiveWarehouse}>Confirm Receipt</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcurementTab;
