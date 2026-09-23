import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Chip, MenuItem, Grid
} from '@mui/material';
import api from '../../../services/api';

const UOM_OPTIONS = ['PCS', 'KG', 'GM', 'LTR', 'MTR', 'BOX', 'ROLL', 'SHEET', 'OTHER'];

const RawMaterialsTab = () => {
  const [materials, setMaterials] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', unit_of_measure: 'PCS', cost_price: '', reorder_level: 10, max_stock_level: 1000 });

  const [openWarehouseDialog, setOpenWarehouseDialog] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({ name: '', warehouse_type: 'RAW_MATERIAL', address: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mRes, iRes, wRes] = await Promise.all([
        api.get('/manufacturing/raw-materials/'),
        api.get('/manufacturing/raw-material-inventory/'),
        api.get('/manufacturing/warehouses/'),
      ]);
      setMaterials(mRes.data.results || mRes.data);
      setInventory(iRes.data.results || iRes.data);
      setWarehouses(wRes.data.results || wRes.data);
    } catch (err) {
      setError('Failed to load raw materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const stockFor = (materialId) => {
    const rows = inventory.filter(i => i.raw_material === materialId);
    return rows.reduce((sum, r) => sum + parseFloat(r.quantity_available || 0), 0);
  };

  const handleOpenDialog = (material = null) => {
    setEditing(material);
    setForm(material ? { ...material } : { name: '', category: '', unit_of_measure: 'PCS', cost_price: '', reorder_level: 10, max_stock_level: 1000 });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/manufacturing/raw-materials/${editing.id}/`, form);
        setSnackbar({ open: true, message: 'Raw material updated!', severity: 'success' });
      } else {
        await api.post('/manufacturing/raw-materials/', form);
        setSnackbar({ open: true, message: 'Raw material added!', severity: 'success' });
      }
      fetchAll();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save raw material.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this raw material?')) return;
    try {
      await api.delete(`/manufacturing/raw-materials/${id}/`);
      setSnackbar({ open: true, message: 'Raw material deleted!', severity: 'success' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete raw material.', severity: 'error' });
    }
  };

  const handleSaveWarehouse = async () => {
    try {
      await api.post('/manufacturing/warehouses/', warehouseForm);
      setSnackbar({ open: true, message: 'Warehouse added!', severity: 'success' });
      setOpenWarehouseDialog(false);
      setWarehouseForm({ name: '', warehouse_type: 'RAW_MATERIAL', address: '' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to add warehouse.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Warehouses</Typography>
        <Button variant="outlined" onClick={() => setOpenWarehouseDialog(true)}>Add Warehouse</Button>
      </Box>
      <Grid container spacing={1} sx={{ mb: 4 }}>
        {warehouses.map(w => (
          <Grid item key={w.id}>
            <Chip label={`${w.name} (${w.warehouse_type.replace('_', ' ')})${w.is_primary ? ' - Primary' : ''}`} />
          </Grid>
        ))}
        {warehouses.length === 0 && <Grid item><Typography variant="body2" color="text.secondary">No warehouses yet - add one before recording stock.</Typography></Grid>}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Raw Materials</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>Add Raw Material</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>UoM</TableCell>
                <TableCell>Cost Price</TableCell>
                <TableCell>Stock on Hand</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map(row => {
                const stock = stockFor(row.id);
                const low = stock <= row.reorder_level;
                return (
                  <TableRow key={row.id}>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.unit_of_measure}</TableCell>
                    <TableCell>₹{row.cost_price}</TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>
                      <Chip size="small" color={low ? 'error' : 'success'} label={low ? 'Low Stock' : 'In Stock'} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDialog(row)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editing ? 'Edit Raw Material' : 'Add Raw Material'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth margin="dense" />
          <TextField label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} fullWidth margin="dense" />
          <TextField select label="Unit of Measure" value={form.unit_of_measure} onChange={e => setForm({ ...form, unit_of_measure: e.target.value })} fullWidth margin="dense">
            {UOM_OPTIONS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
          <TextField label="Cost Price (per unit)" type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} fullWidth margin="dense" />
          <TextField label="Reorder Level" type="number" value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: e.target.value })} fullWidth margin="dense" />
          <TextField label="Max Stock Level" type="number" value={form.max_stock_level} onChange={e => setForm({ ...form, max_stock_level: e.target.value })} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWarehouseDialog} onClose={() => setOpenWarehouseDialog(false)}>
        <DialogTitle>Add Warehouse</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={warehouseForm.name} onChange={e => setWarehouseForm({ ...warehouseForm, name: e.target.value })} fullWidth margin="dense" />
          <TextField select label="Type" value={warehouseForm.warehouse_type} onChange={e => setWarehouseForm({ ...warehouseForm, warehouse_type: e.target.value })} fullWidth margin="dense">
            <MenuItem value="RAW_MATERIAL">Raw Material Store</MenuItem>
            <MenuItem value="FINISHED_GOODS">Finished Goods Store</MenuItem>
            <MenuItem value="GENERAL">General</MenuItem>
          </TextField>
          <TextField label="Address" value={warehouseForm.address} onChange={e => setWarehouseForm({ ...warehouseForm, address: e.target.value })} fullWidth margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWarehouseDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveWarehouse}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RawMaterialsTab;
