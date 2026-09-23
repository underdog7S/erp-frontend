import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent,
  Alert, CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../../services/api';

const DEFAULT_STAGES = ['lead', 'qualified', 'proposal', 'negotiation'];

const stageColor = (stage) => {
  const s = (stage || '').toLowerCase();
  if (s === 'lead') return 'info';
  if (s === 'qualified') return 'primary';
  if (s === 'proposal') return 'warning';
  if (s === 'negotiation') return 'secondary';
  return 'default';
};

const DealsPipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stageFilter, setStageFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', stage: 'lead' });
  const [saving, setSaving] = useState(false);

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (stageFilter) params.stage = stageFilter;
      const response = await api.get('/crm/deals/', { params });
      const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setDeals(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch deals');
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Stage options come from whatever stages already exist on real deals,
  // merged with a sane default set - tenants rarely configure DealStage
  // records up front, so we can't rely on those alone being complete.
  const stageOptions = Array.from(new Set([...DEFAULT_STAGES, ...deals.map((d) => d.stage)])).filter(Boolean);

  const openLeads = deals.filter((d) => !d.won && !d.lost);
  const wonDeals = deals.filter((d) => d.won);
  const pipelineValue = openLeads.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  const handleStageChange = async (deal, newStage) => {
    try {
      await api.patch(`/crm/deals/${deal.id}/`, { stage: newStage });
      fetchDeals();
    } catch (err) {
      setError('Failed to update stage');
      console.error('Error updating deal stage:', err);
    }
  };

  const handleMarkWon = async (deal) => {
    try {
      await api.patch(`/crm/deals/${deal.id}/`, { won: true, lost: false });
      fetchDeals();
    } catch (err) {
      setError('Failed to update deal');
      console.error('Error marking deal won:', err);
    }
  };

  const handleMarkLost = async (deal) => {
    try {
      await api.patch(`/crm/deals/${deal.id}/`, { lost: true, won: false });
      fetchDeals();
    } catch (err) {
      setError('Failed to update deal');
      console.error('Error marking deal lost:', err);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.amount) {
      setError('Name and amount are required');
      return;
    }
    try {
      setSaving(true);
      await api.post('/crm/deals/', {
        name: formData.name,
        amount: formData.amount,
        stage: formData.stage,
      });
      setOpenDialog(false);
      setFormData({ name: '', amount: '', stage: 'lead' });
      fetchDeals();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create deal');
      console.error('Error creating deal:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Deals & Leads</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Add Deal
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Open Leads</Typography>
              <Typography variant="h4">{openLeads.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Open Pipeline Value</Typography>
              <Typography variant="h4">₹{pipelineValue.toLocaleString('en-IN')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Won</Typography>
              <Typography variant="h4">{wonDeals.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <FormControl size="small" sx={{ minWidth: 180, mb: 2 }}>
        <InputLabel>Filter by stage</InputLabel>
        <Select
          value={stageFilter}
          label="Filter by stage"
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <MenuItem value="">All stages</MenuItem>
          {stageOptions.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No deals yet</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                deals.map((deal) => (
                  <TableRow key={deal.id} hover>
                    <TableCell>{deal.name}</TableCell>
                    <TableCell>{deal.contact_name || '-'}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={deal.stage}
                        onChange={(e) => handleStageChange(deal, e.target.value)}
                        disabled={deal.won || deal.lost}
                      >
                        {stageOptions.map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="right">{deal.currency} {parseFloat(deal.amount || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      {deal.won && <Chip label="Won" color="success" size="small" />}
                      {deal.lost && <Chip label="Lost" color="error" size="small" />}
                      {!deal.won && !deal.lost && <Chip label={deal.stage} color={stageColor(deal.stage)} size="small" />}
                    </TableCell>
                    <TableCell>{new Date(deal.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      {!deal.won && !deal.lost && (
                        <>
                          <Button size="small" color="success" onClick={() => handleMarkWon(deal)}>Won</Button>
                          <Button size="small" color="error" onClick={() => handleMarkLost(deal)}>Lost</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Deal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Deal Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Stage</InputLabel>
            <Select
              value={formData.stage}
              label="Stage"
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            >
              {stageOptions.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DealsPipeline;
