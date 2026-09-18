import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../../../services/api';

const SalonCommissionTab = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll hypothetical endpoint
    api.get('/salon/commissions/').then(res => {
      setCommissions(res.data.results || res.data || []);
    }).catch(err => {
      console.error(err);
      setCommissions([]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" color="primary.main" gutterBottom>Stylist Commissions</Typography>
      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#00f2fe' }}>Stylist</TableCell>
              <TableCell sx={{ color: '#00f2fe' }}>Appointment ID</TableCell>
              <TableCell sx={{ color: '#00f2fe' }}>Amount (₹)</TableCell>
              <TableCell sx={{ color: '#00f2fe' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissions.length > 0 ? commissions.map(c => (
              <TableRow key={c.id}>
                <TableCell sx={{ color: 'white' }}>{c.stylist_name || 'N/A'}</TableCell>
                <TableCell sx={{ color: 'white' }}>#{c.appointment_id}</TableCell>
                <TableCell sx={{ color: 'white' }}>{c.commission_amount}</TableCell>
                <TableCell sx={{ color: c.is_paid ? 'success.main' : 'warning.main' }}>{c.is_paid ? 'Paid' : 'Pending'}</TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={4} align="center" sx={{ color: 'rgba(255,255,255,0.5)' }}>No commissions calculated yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SalonCommissionTab;
