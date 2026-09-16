import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar } from '@mui/material';
import api from '../../../services/api';

const RetailCustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [customerForm, setCustomerForm] = useState({
    name: '', phone: '', email: '', address: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/retail/customers/");
      setCustomers(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleOpenDialog = (customer = null) => {
    setEditingCustomer(customer);
    setCustomerForm(customer ? { ...customer } : { name: '', phone: '', email: '', address: '' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingCustomer) {
        await api.put(`/retail/customers/${editingCustomer.id}/`, customerForm);
        setSnackbar({ open: true, message: 'Customer updated!', severity: 'success' });
      } else {
        await api.post(`/retail/customers/`, customerForm);
        setSnackbar({ open: true, message: 'Customer added!', severity: 'success' });
      }
      fetchCustomers();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save customer.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.delete(`/retail/customers/${id}/`);
      setSnackbar({ open: true, message: 'Customer deleted!', severity: 'success' });
      fetchCustomers();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete customer.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Customer Directory</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>Add Customer</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.address}</TableCell>
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
        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Name" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} fullWidth margin="dense" />
          <TextField name="phone" label="Phone" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} fullWidth margin="dense" />
          <TextField name="email" label="Email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} fullWidth margin="dense" />
          <TextField name="address" label="Address" value={customerForm.address} onChange={e => setCustomerForm({...customerForm, address: e.target.value})} fullWidth margin="dense" multiline rows={2} />
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

export default RetailCustomersTab;
