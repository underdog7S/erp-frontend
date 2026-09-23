import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip } from '@mui/material';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import api from '../../../services/api';
import CsvImportDialog from '../../../components/CsvImportDialog';

const RetailInventoryTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [productForm, setProductForm] = useState({
    name: '', sku: '', description: '', selling_price: '', cost_price: '', quantity_available: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/retail/inventory/");
      setProducts(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleOpenDialog = (product = null) => {
    setEditingProduct(product);
    setProductForm(product ? { ...product } : { name: '', sku: '', description: '', selling_price: '', cost_price: '', quantity_available: '' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        await api.put(`/retail/inventory/${editingProduct.id}/`, productForm);
        setSnackbar({ open: true, message: 'Product updated!', severity: 'success' });
      } else {
        await api.post(`/retail/inventory/`, productForm);
        setSnackbar({ open: true, message: 'Product added!', severity: 'success' });
      }
      fetchProducts();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save product.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/retail/inventory/${id}/`);
      setSnackbar({ open: true, message: 'Product deleted!', severity: 'success' });
      fetchProducts();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete product.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Inventory Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setOpenImportDialog(true)}>
            Bulk Import
          </Button>
          <Button variant="contained" onClick={() => handleOpenDialog()}>Add Product</Button>
        </Box>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.sku}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>${row.selling_price}</TableCell>
                  <TableCell>{row.quantity_available}</TableCell>
                  <TableCell>
                    <Chip size="small" color={row.quantity_available > 10 ? 'success' : 'error'} label={row.quantity_available > 10 ? 'In Stock' : 'Low Stock'} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenDialog(row)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} fullWidth margin="dense" />
          <TextField name="sku" label="SKU" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} fullWidth margin="dense" />
          <TextField name="selling_price" label="Selling Price" type="number" value={productForm.selling_price} onChange={e => setProductForm({...productForm, selling_price: e.target.value})} fullWidth margin="dense" />
          <TextField name="cost_price" label="Cost Price" type="number" value={productForm.cost_price} onChange={e => setProductForm({...productForm, cost_price: e.target.value})} fullWidth margin="dense" />
          <TextField name="quantity_available" label="Quantity" type="number" value={productForm.quantity_available} onChange={e => setProductForm({...productForm, quantity_available: e.target.value})} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
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
        onImported={fetchProducts}
        note="Imported products are added to your catalog. You'll still need to add stock for them in Inventory separately, since stock is tracked per warehouse."
      />
    </Box>
  );
};

export default RetailInventoryTab;
