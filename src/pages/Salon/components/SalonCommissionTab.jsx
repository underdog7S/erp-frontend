import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip,
  ToggleButtonGroup, ToggleButton, Snackbar
} from '@mui/material';
import api from '../../../services/api';

const money = (n) => `₹${(Number(n) || 0).toFixed(2)}`;

// What each stylist has earned on completed services, and what has been paid out.
const SalonCommissionTab = () => {
  const [data, setData] = useState({ totals: { unpaid: 0, paid: 0 }, results: [] });
  const [filter, setFilter] = useState('false');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/salon/commissions/', { params: filter ? { is_paid: filter } : {} });
      setData(res.data);
    } catch (e) { setToast('Could not load commissions.'); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const pay = async (c) => {
    try { await api.post(`/salon/commissions/${c.id}/pay/`); load(); } catch (e) { setToast('Could not mark as paid.'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box><Typography variant="caption" color="text.secondary">To pay out</Typography><Typography variant="h5">{money(data.totals.unpaid)}</Typography></Box>
        <Box><Typography variant="caption" color="text.secondary">Paid</Typography><Typography variant="h5">{money(data.totals.paid)}</Typography></Box>
        <ToggleButtonGroup exclusive size="small" value={filter} onChange={(_, v) => v !== null && setFilter(v)} sx={{ ml: 'auto' }}>
          <ToggleButton value="false">Unpaid</ToggleButton><ToggleButton value="true">Paid</ToggleButton><ToggleButton value="">All</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Stylist</TableCell><TableCell>Service</TableCell><TableCell>Customer</TableCell><TableCell align="right">Bill</TableCell><TableCell align="right">%</TableCell><TableCell align="right">Commission</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {data.results.length === 0 && <TableRow><TableCell colSpan={8} align="center">Nothing here. Commission is booked when an appointment is completed and the stylist has a commission % set.</TableCell></TableRow>}
          {data.results.map(c => (
            <TableRow key={c.id} hover>
              <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell><TableCell>{c.stylist_name}</TableCell><TableCell>{c.service_name}</TableCell><TableCell>{c.customer_name}</TableCell>
              <TableCell align="right">{money(c.service_price)}</TableCell><TableCell align="right">{Number(c.percentage)}</TableCell><TableCell align="right">{money(c.amount)}</TableCell>
              <TableCell align="right">{c.is_paid ? <Chip size="small" color="success" label="Paid" /> : <Button size="small" variant="outlined" onClick={() => pay(c)}>Mark paid</Button>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default SalonCommissionTab;
