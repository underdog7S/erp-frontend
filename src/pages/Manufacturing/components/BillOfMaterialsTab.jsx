import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Chip, MenuItem, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../../services/api';

const BillOfMaterialsTab = () => {
  const [boms, setBoms] = useState([]);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ finished_good: '', name: '', notes: '' });

  const [manageBom, setManageBom] = useState(null);
  const [itemForm, setItemForm] = useState({ raw_material: '', quantity_required: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, fRes, rRes] = await Promise.all([
        api.get('/manufacturing/boms/'),
        api.get('/manufacturing/finished-goods/'),
        api.get('/manufacturing/raw-materials/'),
      ]);
      setBoms(bRes.data.results || bRes.data);
      setFinishedGoods(fRes.data.results || fRes.data);
      setRawMaterials(rRes.data.results || rRes.data);
    } catch {
      setError('Failed to load Bills of Material.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!createForm.finished_good) return;
    try {
      const res = await api.post('/manufacturing/boms/', createForm);
      setSnackbar({ open: true, message: 'BOM created! Now add raw material lines.', severity: 'success' });
      setOpenCreate(false);
      setCreateForm({ finished_good: '', name: '', notes: '' });
      await fetchAll();
      setManageBom(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to create BOM.', severity: 'error' });
    }
  };

  const handleAddItem = async () => {
    if (!itemForm.raw_material || !itemForm.quantity_required) return;
    try {
      await api.post('/manufacturing/bom-items/', { bom: manageBom.id, ...itemForm });
      setItemForm({ raw_material: '', quantity_required: '' });
      const res = await api.get(`/manufacturing/boms/${manageBom.id}/`);
      setManageBom(res.data);
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to add BOM item.', severity: 'error' });
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/manufacturing/bom-items/${itemId}/`);
      const res = await api.get(`/manufacturing/boms/${manageBom.id}/`);
      setManageBom(res.data);
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to remove BOM item.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Bills of Material</Typography>
        <Button variant="contained" onClick={() => setOpenCreate(true)}>Create BOM</Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Only one active BOM per finished good is used for new Production Orders. Creating a new BOM for the same finished good automatically deactivates the old version, without deleting it.
      </Typography>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Finished Good</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Raw Materials</TableCell>
                <TableCell>Est. Unit Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {boms.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.finished_good_name}</TableCell>
                  <TableCell>v{row.version}</TableCell>
                  <TableCell>{row.items?.length || 0} lines</TableCell>
                  <TableCell>₹{Number(row.estimated_unit_cost || 0).toFixed(2)}</TableCell>
                  <TableCell><Chip size="small" color={row.is_active ? 'success' : 'default'} label={row.is_active ? 'Active' : 'Superseded'} /></TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => setManageBom(row)}>Manage Items</Button>
                  </TableCell>
                </TableRow>
              ))}
              {boms.length === 0 && (
                <TableRow><TableCell colSpan={6}><Typography variant="body2" color="text.secondary">No BOMs yet.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create Bill of Material</DialogTitle>
        <DialogContent>
          <TextField select label="Finished Good" value={createForm.finished_good} onChange={e => setCreateForm({ ...createForm, finished_good: e.target.value })} fullWidth margin="dense">
            {finishedGoods.map(fg => <MenuItem key={fg.id} value={fg.id}>{fg.name} ({fg.sku})</MenuItem>)}
          </TextField>
          <TextField label="BOM Name" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} fullWidth margin="dense" placeholder="e.g. Standard recipe" />
          <TextField label="Notes" value={createForm.notes} onChange={e => setCreateForm({ ...createForm, notes: e.target.value })} fullWidth margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!createForm.finished_good}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!manageBom} onClose={() => setManageBom(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{manageBom?.finished_good_name} - BOM v{manageBom?.version}</DialogTitle>
        <DialogContent>
          <List dense>
            {manageBom?.items?.map(item => (
              <ListItem key={item.id} secondaryAction={
                <IconButton edge="end" size="small" onClick={() => handleDeleteItem(item.id)}><DeleteIcon fontSize="small" /></IconButton>
              }>
                <ListItemText primary={`${item.raw_material_name} - ${item.quantity_required} ${item.unit_of_measure}`} secondary="per 1 unit of finished good" />
              </ListItem>
            ))}
            {(!manageBom?.items || manageBom.items.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>No raw materials added yet.</Typography>
            )}
          </List>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-end' }}>
            <TextField select label="Raw Material" value={itemForm.raw_material} onChange={e => setItemForm({ ...itemForm, raw_material: e.target.value })} sx={{ flex: 1 }} size="small">
              {rawMaterials.map(rm => <MenuItem key={rm.id} value={rm.id}>{rm.name}</MenuItem>)}
            </TextField>
            <TextField label="Qty needed" type="number" value={itemForm.quantity_required} onChange={e => setItemForm({ ...itemForm, quantity_required: e.target.value })} size="small" sx={{ width: 120 }} />
            <Button variant="contained" onClick={handleAddItem} disabled={!itemForm.raw_material || !itemForm.quantity_required}>Add</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageBom(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BillOfMaterialsTab;
