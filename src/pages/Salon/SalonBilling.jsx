import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, TextField,
  InputAdornment, CircularProgress, Alert, Chip, Stack, MenuItem
} from '@mui/material';
import api, { fetchSalonAppointments } from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  scheduled: 'warning',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error',
};

const SalonBilling = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSalonAppointments();
      setAppointments(data);
    } catch (err) {
      setError('Unable to retrieve billing data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) => statusFilter === 'all' || appt.status === statusFilter)
      .filter((appt) => {
        if (!searchTerm.trim()) return true;
        const needle = searchTerm.toLowerCase();
        return (
          (appt.customer_name || '').toLowerCase().includes(needle) ||
          (appt.service_name || '').toLowerCase().includes(needle) ||
          (appt.stylist_name || '').toLowerCase().includes(needle)
        );
      });
  }, [appointments, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalRevenue = appointments.reduce((sum, appt) => sum + Number(appt.price || 0), 0);
    const completed = appointments.filter((appt) => appt.status === 'completed').length;
    const scheduled = appointments.filter((appt) => appt.status === 'scheduled').length;
    const cancelled = appointments.filter((appt) => appt.status === 'cancelled').length;
    return { totalRevenue, completed, scheduled, cancelled };
  }, [appointments]);

  const handleGenerateInvoice = async (appt) => {
    setInvoiceLoadingId(appt.id);
    try {
      const response = await api.get(`/salon/appointments/${appt.id}/invoice/`, { responseType: 'blob' });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salon_invoice_${appt.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      setSnackbar({
        open: true,
        message: 'Invoice downloaded successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Unable to download invoice',
        severity: 'error',
      });
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Salon Billing & Revenue
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="h5">₹{stats.totalRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Completed Appointments
              </Typography>
              <Typography variant="h5">{stats.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Scheduled
              </Typography>
              <Typography variant="h5">{stats.scheduled}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Cancelled
              </Typography>
              <Typography variant="h5">{stats.cancelled}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          placeholder="Search customer, service or stylist"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Stylist</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.start_time ? new Date(appt.start_time).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>{appt.customer_name || '-'}</TableCell>
                    <TableCell>{appt.service_name || '-'}</TableCell>
                    <TableCell>{appt.stylist_name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={appt.status || 'Unknown'}
                        color={STATUS_COLORS[appt.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">₹{Number(appt.price || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => handleGenerateInvoice(appt)}
                        disabled={invoiceLoadingId === appt.id}
                      >
                        {invoiceLoadingId === appt.id ? 'Downloading...' : 'Invoice'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredAppointments.length && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No billing records match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default SalonBilling;

