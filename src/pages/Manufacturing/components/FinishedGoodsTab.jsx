import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Chip, MenuItem
} from '@mui/material';
import api from '../../../services/api';

const UOM_OPTIONS = ['PCS', 'KG', 'GM', 'LTR', 'MTR', 'BOX', 'ROLL', 'SHEET', 'OTHER'];

const FinishedGoodsTab = () => {
  const [goods, setGoods] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', unit_of_measure: 'PCS', selling_price: '', mrp: '', reorder_level: 10, max_stock_level: 1000 });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [gRes, iRes] = await Promise.all([
        api.get('/manufacturing/finished-goods/'),
        api.get('/manufacturing/finished-good-inventory/'),
      ]);
      setGoods(gRes.data.results || gRes.data);
      setInventory(iRes.data.results || iRes.data);
    } catch {
      setError('Failed to load finished goods.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const stockFor = (goodId) => {
    const rows = inventory.filter(i => i.finished_good === goodId);
    return rows.reduce((sum, r) => sum + parseFloat(r.quantity_available || 0), 0);
  };

  const handleOpenDialog = (good = null) => {
    setEditing(good);
    setForm(good ? { ...good } : { name: '', category: '', unit_of_measure: 'PCS', selling_price: '', mrp: '', reorder_level: 10, max_stock_level: 1000 });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/manufacturing/finished-goods/${editing.id}/`, form);
        setSnackbar({ open: true, message: 'Finished good updated!', severity: 'success' });
      } else {
        await api.post('/manufacturing/finished-goods/', form);
        setSnackbar({ open: true, message: 'Finished good added!', severity: 'success' });
      }
      fetchAll();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save finished good.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this finished good?')) return;
    try {
      await api.delete(`/manufacturing/finished-goods/${id}/`);
      setSnackbar({ open: true, message: 'Finished good deleted!', severity: 'success' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete finished good.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Finished Goods</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>Add Finished Good</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Selling Price</TableCell>
                <TableCell>Stock on Hand</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {goods.map(row => {
                const stock = stockFor(row.id);
                const low = stock <= row.reorder_level;
                return (
                  <TableRow key={row.id}>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>₹{row.selling_price}</TableCell>
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
        <DialogTitle>{editing ? 'Edit Finished Good' : 'Add Finished Good'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth margin="dense" />
          <TextField label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} fullWidth margin="dense" />
          <TextField select label="Unit of Measure" value={form.unit_of_measure} onChange={e => setForm({ ...form, unit_of_measure: e.target.value })} fullWidth margin="dense">
            {UOM_OPTIONS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
          <TextField label="Selling Price" type="number" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: e.target.value })} fullWidth margin="dense" />
          <TextField label="MRP" type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} fullWidth margin="dense" />
          <TextField label="Reorder Level" type="number" value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: e.target.value })} fullWidth margin="dense" />
          <TextField label="Max Stock Level" type="number" value={form.max_stock_level} onChange={e => setForm({ ...form, max_stock_level: e.target.value })} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FinishedGoodsTab;
