import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar } from '@mui/material';
import api from '../../../services/api';

const PharmacySuppliersTab = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [supplierForm, setSupplierForm] = useState({
    name: '', contact_person: '', phone: '', email: '', address: ''
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pharmacy/suppliers/");
      setSuppliers(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleOpenDialog = (supplier = null) => {
    setEditingSupplier(supplier);
    setSupplierForm(supplier ? { ...supplier } : { name: '', contact_person: '', phone: '', email: '', address: '' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingSupplier) {
        await api.put(`/pharmacy/suppliers/${editingSupplier.id}/`, supplierForm);
        setSnackbar({ open: true, message: 'Supplier updated!', severity: 'success' });
      } else {
        await api.post(`/pharmacy/suppliers/`, supplierForm);
        setSnackbar({ open: true, message: 'Supplier added!', severity: 'success' });
      }
      fetchSuppliers();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save supplier.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await api.delete(`/pharmacy/suppliers/${id}/`);
      setSnackbar({ open: true, message: 'Supplier deleted!', severity: 'success' });
      fetchSuppliers();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete supplier.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Suppliers Directory</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>Add Supplier</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.contact_person}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
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
        <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Company Name" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} fullWidth margin="dense" />
          <TextField name="contact_person" label="Contact Person" value={supplierForm.contact_person} onChange={e => setSupplierForm({...supplierForm, contact_person: e.target.value})} fullWidth margin="dense" />
          <TextField name="phone" label="Phone" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} fullWidth margin="dense" />
          <TextField name="email" label="Email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} fullWidth margin="dense" />
          <TextField name="address" label="Address" value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} fullWidth margin="dense" multiline rows={2} />
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

export default PharmacySuppliersTab;
