import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from '../../../services/api';

const AdminBillingTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/billing/invoices/");
      setInvoices(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load billing history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>Platform Billing</Typography>
        <Button variant="outlined" sx={{ color: '#00f2fe', borderColor: '#00f2fe' }}>Download Reports</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} sx={{ bgcolor: '#1a1a24', color: 'white', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Invoice ID</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Tenant</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Date</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Amount</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow><TableCell colSpan={5} sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>No billing records found.</TableCell></TableRow>
              )}
              {invoices.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: 'white' }}>{row.id}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.tenant_name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.date}</TableCell>
                  <TableCell sx={{ color: 'white' }}>${row.amount}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" color={row.status === 'PAID' ? 'success' : 'warning'} label={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminBillingTab;
