import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Chip, MenuItem
} from '@mui/material';
import api from '../../../services/api';

const RESULT_COLORS = { PENDING: 'warning', PASSED: 'success', FAILED: 'error' };

const QualityControlTab = () => {
  const [checks, setChecks] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    check_type: 'FINAL', production_order: '', quantity_checked: '', quantity_passed: '',
    quantity_failed: '', parameters_checked: '', result: 'PENDING', notes: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [qRes, pRes] = await Promise.all([
        api.get('/manufacturing/quality-checks/'),
        api.get('/manufacturing/production-orders/'),
      ]);
      setChecks(qRes.data.results || qRes.data);
      setProductionOrders(pRes.data.results || pRes.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load quality checks.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    try {
      await api.post('/manufacturing/quality-checks/', form);
      setSnackbar({ open: true, message: 'Quality check recorded!', severity: 'success' });
      setOpenDialog(false);
      setForm({ check_type: 'FINAL', production_order: '', quantity_checked: '', quantity_passed: '', quantity_failed: '', parameters_checked: '', result: 'PENDING', notes: '' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to record quality check.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Quality Control</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>Record Quality Check</Button>
      </Box>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Production Order</TableCell>
                <TableCell>Checked</TableCell>
                <TableCell>Passed</TableCell>
                <TableCell>Failed</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Checked By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checks.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.check_type.replace('_', ' ')}</TableCell>
                  <TableCell>{row.production_order_number || '-'}</TableCell>
                  <TableCell>{row.quantity_checked}</TableCell>
                  <TableCell>{row.quantity_passed}</TableCell>
                  <TableCell>{row.quantity_failed}</TableCell>
                  <TableCell><Chip size="small" color={RESULT_COLORS[row.result]} label={row.result} /></TableCell>
                  <TableCell>{row.checked_by_name || '-'}</TableCell>
                </TableRow>
              ))}
              {checks.length === 0 && (
                <TableRow><TableCell colSpan={7}><Typography variant="body2" color="text.secondary">No quality checks recorded yet.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Quality Check</DialogTitle>
        <DialogContent>
          <TextField select label="Check Type" value={form.check_type} onChange={e => setForm({ ...form, check_type: e.target.value })} fullWidth margin="dense">
            <MenuItem value="INCOMING">Incoming Raw Material</MenuItem>
            <MenuItem value="IN_PROCESS">In-Process</MenuItem>
            <MenuItem value="FINAL">Final / Finished Good</MenuItem>
          </TextField>
          <TextField select label="Production Order (optional)" value={form.production_order} onChange={e => setForm({ ...form, production_order: e.target.value })} fullWidth margin="dense">
            <MenuItem value="">None</MenuItem>
            {productionOrders.map(po => <MenuItem key={po.id} value={po.id}>{po.order_number} - {po.finished_good_name}</MenuItem>)}
          </TextField>
          <TextField label="Quantity Checked" type="number" value={form.quantity_checked} onChange={e => setForm({ ...form, quantity_checked: e.target.value })} fullWidth margin="dense" />
          <TextField label="Quantity Passed" type="number" value={form.quantity_passed} onChange={e => setForm({ ...form, quantity_passed: e.target.value })} fullWidth margin="dense" />
          <TextField label="Quantity Failed" type="number" value={form.quantity_failed} onChange={e => setForm({ ...form, quantity_failed: e.target.value })} fullWidth margin="dense" />
          <TextField select label="Result" value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} fullWidth margin="dense">
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="PASSED">Passed</MenuItem>
            <MenuItem value="FAILED">Failed</MenuItem>
          </TextField>
          <TextField label="Parameters Checked" value={form.parameters_checked} onChange={e => setForm({ ...form, parameters_checked: e.target.value })} fullWidth margin="dense" placeholder="e.g. Weld strength, dimensions" multiline rows={2} />
          <TextField label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} fullWidth margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.quantity_checked}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default QualityControlTab;
