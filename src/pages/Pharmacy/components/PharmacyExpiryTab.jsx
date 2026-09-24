import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, ToggleButtonGroup, ToggleButton, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Chip, Button, Alert, CircularProgress, Snackbar
} from '@mui/material';
import api from '../../../services/api';

const VIEWS = [
  { key: 'expired', label: 'Expired', color: 'error' },
  { key: 'soon', label: 'Expiring soon', color: 'warning' },
  { key: 'ok', label: 'In date', color: 'success' },
];

const daysLeft = (iso) => Math.ceil((new Date(iso) - new Date(new Date().toDateString())) / 86400000);

// Batches grouped by expiry status, with a one-click write-off for expired stock.
const PharmacyExpiryTab = () => {
  const [view, setView] = useState('soon');
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.all(VIEWS.map(v => api.get('/pharmacy/batches/', { params: { expiry: v.key } })));
      const lists = results.map(r => (Array.isArray(r.data) ? r.data : (r.data.results || [])));
      setCounts(Object.fromEntries(VIEWS.map((v, i) => [v.key, lists[i].length])));
      setRows(lists[VIEWS.findIndex(v => v.key === view)]);
    } catch (e) {
      setError('Could not load batches.');
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => { load(); }, [load]);

  const writeOff = async (b) => {
    try {
      await api.post('/pharmacy/stock-adjustments/', {
        medicine_batch: b.id, adjustment_type: 'EXPIRED', quantity: b.quantity_available,
        reason: `Expired on ${b.expiry_date}, written off`,
      });
      setToast(`${b.medicine_name} batch ${b.batch_number} written off`);
      load();
    } catch (e) {
      setToast(e.response?.data?.quantity?.[0] || e.response?.data?.detail || 'Could not write off this batch.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        <ToggleButtonGroup exclusive size="small" value={view} onChange={(_, v) => v && setView(v)}>
          {VIEWS.map(v => (
            <ToggleButton key={v.key} value={v.key}>{v.label}{counts[v.key] != null ? ` (${counts[v.key]})` : ''}</ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary">
          Only batches with stock left. "Expiring soon" uses each medicine's own alert window (default 30 days).
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress /></Box> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Medicine</TableCell><TableCell>Batch</TableCell><TableCell>Supplier</TableCell>
              <TableCell align="right">In stock</TableCell><TableCell>Expiry</TableCell><TableCell>Status</TableCell><TableCell />
            </TableRow></TableHead>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={7} align="center">Nothing here.</TableCell></TableRow>}
              {rows.map(b => {
                const d = daysLeft(b.expiry_date);
                const meta = VIEWS.find(v => v.key === view);
                return (
                  <TableRow key={b.id}>
                    <TableCell>{b.medicine_name}</TableCell>
                    <TableCell>{b.batch_number}</TableCell>
                    <TableCell>{b.supplier_name}</TableCell>
                    <TableCell align="right">{b.quantity_available}</TableCell>
                    <TableCell>{new Date(b.expiry_date).toLocaleDateString()}</TableCell>
                    <TableCell><Chip size="small" color={meta.color} label={d < 0 ? `${-d} days ago` : `${d} days left`} /></TableCell>
                    <TableCell align="right">
                      {view === 'expired' && <Button size="small" color="error" onClick={() => writeOff(b)}>Write off</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default PharmacyExpiryTab;
