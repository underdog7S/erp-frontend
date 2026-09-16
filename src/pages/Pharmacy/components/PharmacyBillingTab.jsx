import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip } from '@mui/material';
import api from '../../../services/api';

const PharmacyBillingTab = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [saleForm, setSaleForm] = useState({
    customer_name: '', total_amount: '', payment_status: 'PAID'
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pharmacy/sales/");
      setSales(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load billing history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  const handleOpenDialog = () => {
    setSaleForm({ customer_name: '', total_amount: '', payment_status: 'PAID' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      await api.post(`/pharmacy/sales/`, saleForm);
      setSnackbar({ open: true, message: 'Invoice generated!', severity: 'success' });
      fetchSales();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to generate invoice.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Billing & Invoices</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>New Invoice</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{row.customer_name || 'Walk-in Patient'}</TableCell>
                  <TableCell>${row.total_amount}</TableCell>
                  <TableCell>
                    <Chip size="small" color={row.payment_status === 'PAID' ? 'success' : 'warning'} label={row.payment_status || 'PAID'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>New Invoice</DialogTitle>
        <DialogContent>
          <TextField name="customer_name" label="Customer / Patient Name" value={saleForm.customer_name} onChange={e => setSaleForm({...saleForm, customer_name: e.target.value})} fullWidth margin="dense" />
          <TextField name="total_amount" label="Total Amount" type="number" value={saleForm.total_amount} onChange={e => setSaleForm({...saleForm, total_amount: e.target.value})} fullWidth margin="dense" />
          <Alert severity="info" sx={{ mt: 2 }}>In a full deployment, this integrates directly with the prescription and inventory selection systems.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Generate Invoice</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PharmacyBillingTab;
