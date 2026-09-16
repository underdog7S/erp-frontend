import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip } from '@mui/material';
import api from '../../../services/api';

const RetailSalesTab = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [saleForm, setSaleForm] = useState({
    customer_id: '', payment_method: 'CASH', total_amount: ''
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get("/retail/sales/");
      setSales(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  const handleOpenDialog = () => {
    setSaleForm({ customer_id: '', payment_method: 'CASH', total_amount: '' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      await api.post(`/retail/sales/`, saleForm);
      setSnackbar({ open: true, message: 'Sale recorded!', severity: 'success' });
      fetchSales();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to record sale.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Point of Sale & History</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>New Sale</Button>
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
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{row.customer?.name || 'Walk-in'}</TableCell>
                  <TableCell>${row.total_amount}</TableCell>
                  <TableCell>{row.payment_method}</TableCell>
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
        <DialogTitle>New Sale</DialogTitle>
        <DialogContent>
          <TextField name="total_amount" label="Total Amount" type="number" value={saleForm.total_amount} onChange={e => setSaleForm({...saleForm, total_amount: e.target.value})} fullWidth margin="dense" />
          <TextField name="payment_method" label="Payment Method" value={saleForm.payment_method} onChange={e => setSaleForm({...saleForm, payment_method: e.target.value})} fullWidth margin="dense" />
          <Alert severity="info" sx={{ mt: 2 }}>In a real implementation, you would select products here to build the invoice.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Complete Sale</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RetailSalesTab;
