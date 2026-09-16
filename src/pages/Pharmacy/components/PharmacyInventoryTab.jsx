import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip } from '@mui/material';
import api from '../../../services/api';

const PharmacyInventoryTab = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [medicineForm, setMedicineForm] = useState({
    name: '', generic_name: '', batch_number: '', expiry_date: '', quantity: '', unit_price: ''
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pharmacy/medicines/");
      setMedicines(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, []);

  const handleOpenDialog = (medicine = null) => {
    setEditingMedicine(medicine);
    setMedicineForm(medicine ? { ...medicine } : { name: '', generic_name: '', batch_number: '', expiry_date: '', quantity: '', unit_price: '' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingMedicine) {
        await api.put(`/pharmacy/medicines/${editingMedicine.id}/`, medicineForm);
        setSnackbar({ open: true, message: 'Medicine updated!', severity: 'success' });
      } else {
        await api.post(`/pharmacy/medicines/`, medicineForm);
        setSnackbar({ open: true, message: 'Medicine added!', severity: 'success' });
      }
      fetchMedicines();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save medicine.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    try {
      await api.delete(`/pharmacy/medicines/${id}/`);
      setSnackbar({ open: true, message: 'Medicine deleted!', severity: 'success' });
      fetchMedicines();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete medicine.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Medicine Inventory</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>Add Medicine</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Batch #</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicines.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.batch_number}</TableCell>
                  <TableCell>{row.expiry_date}</TableCell>
                  <TableCell>${row.unit_price}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>
                    <Chip size="small" color={row.quantity > 20 ? 'success' : 'error'} label={row.quantity > 20 ? 'In Stock' : 'Low Stock'} />
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
        <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add Medicine'}</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Medicine Name" value={medicineForm.name} onChange={e => setMedicineForm({...medicineForm, name: e.target.value})} fullWidth margin="dense" />
          <TextField name="generic_name" label="Generic Name" value={medicineForm.generic_name} onChange={e => setMedicineForm({...medicineForm, generic_name: e.target.value})} fullWidth margin="dense" />
          <TextField name="batch_number" label="Batch Number" value={medicineForm.batch_number} onChange={e => setMedicineForm({...medicineForm, batch_number: e.target.value})} fullWidth margin="dense" />
          <TextField name="expiry_date" label="Expiry Date" type="date" InputLabelProps={{ shrink: true }} value={medicineForm.expiry_date} onChange={e => setMedicineForm({...medicineForm, expiry_date: e.target.value})} fullWidth margin="dense" />
          <TextField name="unit_price" label="Unit Price" type="number" value={medicineForm.unit_price} onChange={e => setMedicineForm({...medicineForm, unit_price: e.target.value})} fullWidth margin="dense" />
          <TextField name="quantity" label="Quantity" type="number" value={medicineForm.quantity} onChange={e => setMedicineForm({...medicineForm, quantity: e.target.value})} fullWidth margin="dense" />
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

export default PharmacyInventoryTab;
