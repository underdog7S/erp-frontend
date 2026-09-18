import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from '../../../services/api';

const RetailTransitTab = () => {
  const [transits, setTransits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll hypothetical endpoint
    api.get('/retail/transit/').then(res => {
      setTransits(res.data.results || res.data || []);
    }).catch(err => {
      console.error(err);
      setTransits([]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" color="secondary.main" gutterBottom>Multi-Branch Stock Transit</Typography>
      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#00f2fe' }}>Transfer ID</TableCell>
              <TableCell sx={{ color: '#00f2fe' }}>Dispatched</TableCell>
              <TableCell sx={{ color: '#00f2fe' }}>Received</TableCell>
              <TableCell sx={{ color: '#00f2fe' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transits.length > 0 ? transits.map(t => (
              <TableRow key={t.id}>
                <TableCell sx={{ color: 'white' }}>#{t.transfer_id}</TableCell>
                <TableCell sx={{ color: 'white' }}>{new Date(t.dispatched_at).toLocaleString()}</TableCell>
                <TableCell sx={{ color: 'white' }}>{t.received_at ? new Date(t.received_at).toLocaleString() : '---'}</TableCell>
                <TableCell>
                  <Chip 
                    label={t.status.toUpperCase()} 
                    color={t.status === 'received' ? 'success' : t.status === 'in_transit' ? 'warning' : 'error'} 
                    size="small"
                  />
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={4} align="center" sx={{ color: 'rgba(255,255,255,0.5)' }}>No stock currently in transit.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RetailTransitTab;
