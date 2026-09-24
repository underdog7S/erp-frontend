import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip, MenuItem,
  FormControlLabel, Switch, Divider, InputAdornment
} from '@mui/material';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import api from '../../../services/api';
import CsvImportDialog from '../../../components/CsvImportDialog';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const UNITS = [['PCS', 'Pieces'], ['KG', 'Kilograms'], ['LTR', 'Liters'], ['MTR', 'Meters'], ['BOX', 'Box'], ['PACK', 'Pack'], ['OTHER', 'Other']];
const EMPTY = {
  name: '', sku: '', category: '', brand: '', unit_of_measure: 'PCS', cost_price: '', selling_price: '', mrp: '',
  reorder_level: 10, hsn_code: '', gst_rate: 0, price_includes_tax: true, warehouse: '', opening_stock: '',
};
const errText = (e, fallback) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return fallback;
  return d.error || d.detail || Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('. ') || fallback;
};
const stockChip = (p) => {
  if (p.total_stock <= 0) return <Chip size="small" color="error" label="Out of stock" />;
  if (p.total_stock <= p.reorder_level) return <Chip size="small" color="warning" label="Low stock" />;
  return <Chip size="small" color="success" label="In stock" />;
};

// Product catalogue: what you sell, its price and GST, and how much is on the shelf.
const RetailInventoryTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openImportDialog, setOpenImportDialog] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, w] = await Promise.all([api.get('/retail/products/'), api.get('/retail/categories/'), api.get('/retail/warehouses/')]);
      setProducts(asList(p.data)); setCategories(asList(c.data)); setWarehouses(asList(w.data));
      setError('');
    } catch (e) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openDialog = (product = null) => {
    setEditing(product);
    setFormError('');
    setForm(product ? { ...EMPTY, ...product, category: product.category || '', warehouse: '', opening_stock: '' }
      : { ...EMPTY, warehouse: (warehouses.find(w => w.is_primary) || warehouses[0] || {}).id || '' });
    setOpen(true);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setFormError('');
    setSaving(true);
    try {
      // The product endpoint takes multipart form data, where an unsent checkbox counts as "off",
      // so the tax flag is always sent explicitly.
      const body = new FormData();
      ['name', 'sku', 'category', 'brand', 'unit_of_measure', 'cost_price', 'selling_price', 'mrp', 'reorder_level', 'hsn_code', 'gst_rate']
        .forEach(k => { if (form[k] !== '' && form[k] != null) body.append(k, form[k]); });
      body.append('price_includes_tax', form.price_includes_tax ? 'true' : 'false');
      body.append('is_active', 'true');
      let saved;
      if (editing) {
        saved = (await api.patch(`/retail/products/${editing.id}/`, body)).data;
      } else {
        saved = (await api.post('/retail/products/', body)).data;
        if (Number(form.opening_stock) > 0 && form.warehouse) {
          await api.post('/retail/stock-adjustments/', {
            warehouse: form.warehouse, adjustment_type: 'ADD', reason: 'Opening stock',
            items_input: [{ product: saved.id, quantity: form.opening_stock }],
          });
        }
      }
      setOpen(false);
      setSnackbar({ open: true, message: editing ? 'Product updated' : 'Product added', severity: 'success' });
      load();
    } catch (e) {
      setFormError(errText(e, 'Could not save the product.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/retail/products/${p.id}/`);
      setSnackbar({ open: true, message: 'Product deleted', severity: 'success' });
      load();
    } catch (e) {
      setSnackbar({ open: true, message: 'Could not delete: it has sales or stock history. Mark it inactive instead.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Products &amp; stock</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setOpenImportDialog(true)}>Bulk Import</Button>
          <Button variant="contained" onClick={() => openDialog()}>Add Product</Button>
        </Box>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>SKU</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell><TableCell align="right">GST</TableCell>
              <TableCell align="right">In stock</TableCell><TableCell>Status</TableCell><TableCell />
            </TableRow></TableHead>
            <TableBody>
              {products.length === 0 && <TableRow><TableCell colSpan={8} align="center">No products yet. Add one or use Bulk Import.</TableCell></TableRow>}
              {products.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.sku}</TableCell><TableCell>{p.name}</TableCell><TableCell>{p.category_name || '-'}</TableCell>
                  <TableCell align="right">₹{Number(p.selling_price).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(p.gst_rate) ? `${Number(p.gst_rate)}%` : '-'}</TableCell>
                  <TableCell align="right">{p.total_stock}</TableCell>
                  <TableCell>{stockChip(p)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openDialog(p)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => remove(p)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
        <DialogContent dividers>
          <TextField required label="Product name" value={form.name} onChange={set('name')} fullWidth margin="dense" />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField label="SKU" value={form.sku} onChange={set('sku')} margin="dense" sx={{ flex: 1, minWidth: 150 }} helperText="Leave blank to generate" />
            <TextField select label="Category" value={form.category} onChange={set('category')} margin="dense" sx={{ flex: 1, minWidth: 150 }}>
              <MenuItem value="">None</MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField label="Brand" value={form.brand} onChange={set('brand')} margin="dense" sx={{ flex: 1, minWidth: 150 }} />
            <TextField select label="Sold by" value={form.unit_of_measure} onChange={set('unit_of_measure')} margin="dense" sx={{ flex: 1, minWidth: 150 }}>
              {UNITS.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField required type="number" label="Cost price" value={form.cost_price} onChange={set('cost_price')} margin="dense" sx={{ flex: 1, minWidth: 110 }} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            <TextField required type="number" label="Selling price" value={form.selling_price} onChange={set('selling_price')} margin="dense" sx={{ flex: 1, minWidth: 110 }} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            <TextField required type="number" label="MRP" value={form.mrp} onChange={set('mrp')} margin="dense" sx={{ flex: 1, minWidth: 110 }} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="subtitle2">GST</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField label="HSN code" value={form.hsn_code} onChange={set('hsn_code')} margin="dense" sx={{ flex: 1, minWidth: 130 }} inputProps={{ maxLength: 8 }} />
            <TextField type="number" label="GST %" value={form.gst_rate} onChange={set('gst_rate')} margin="dense" sx={{ width: 110 }} helperText="0 = no tax" />
            <FormControlLabel control={<Switch checked={!!form.price_includes_tax} onChange={(e) => setForm({ ...form, price_includes_tax: e.target.checked })} />} label="Price includes GST" />
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <TextField type="number" label="Reorder level" value={form.reorder_level} onChange={set('reorder_level')} margin="dense" helperText="Shows Low stock at or below this" sx={{ mr: 1.5, width: 200 }} />
          {!editing && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
              <TextField select label="Opening stock in" value={form.warehouse} onChange={set('warehouse')} margin="dense" sx={{ flex: 1, minWidth: 170 }} disabled={warehouses.length === 0}
                helperText={warehouses.length === 0 ? 'Add a warehouse first to record stock' : ' '}>
                {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
              </TextField>
              <TextField type="number" label="Opening quantity" value={form.opening_stock} onChange={set('opening_stock')} margin="dense" sx={{ width: 170 }} disabled={warehouses.length === 0} />
            </Box>
          )}
          {formError && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving || !form.name || form.cost_price === '' || form.selling_price === '' || form.mrp === ''}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>

      <CsvImportDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        importUrl="/retail/products/import/"
        templateType="product"
        label="Products"
        onImported={load}
        note="Imported products are added to your catalog. Add stock for them on the Procurement tab (a stock adjustment or a purchase order), since stock is tracked per warehouse."
      />
    </Box>
  );
};

export default RetailInventoryTab;
