import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Grid,
} from '@mui/material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const errText = (e, fallback) => {
  const d = e.response?.data;
  if (!d) return fallback;
  if (typeof d === 'string') return d;
  if (d.error) return d.error;
  const first = Object.values(d)[0];
  return Array.isArray(first) ? first[0] : (typeof first === 'string' ? first : fallback);
};
const rewardText = (r) => (r.discount_amount ? `₹${Number(r.discount_amount)} off` : r.discount_percentage ? `${Number(r.discount_percentage)}% off` : r.reward_type);

// Loyalty: customers earn 1 point per rupee on paid bills; staff redeem points for rewards here and can make a manual adjustment.
const PharmacyLoyaltyTab = () => {
  const [customers, setCustomers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState(null); // {type: 'redeem'|'adjust'|'reward', customer?}
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, r, h] = await Promise.all([
        api.get('/pharmacy/customers/'), api.get('/pharmacy/loyalty/rewards/'), api.get('/pharmacy/loyalty/transactions/'),
      ]);
      setCustomers(asList(c.data).filter(x => x.loyalty_enrolled).sort((a, b) => b.loyalty_points - a.loyalty_points));
      setRewards(asList(r.data));
      setHistory(asList(h.data).slice(0, 30));
      setError('');
    } catch (e) {
      setError('Failed to load the loyalty programme.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (type, customer, initial = {}) => { setDialog({ type, customer }); setForm(initial); setFormError(''); };

  const submit = async () => {
    setSaving(true); setFormError('');
    try {
      if (dialog.type === 'redeem') {
        await api.post('/pharmacy/loyalty/redeem/', { customer_id: dialog.customer.id, reward_id: form.reward });
        setToast('Points redeemed. Apply the reward on the customer\'s bill.');
      } else if (dialog.type === 'adjust') {
        await api.post('/pharmacy/loyalty/transactions/', { customer: dialog.customer.id, transaction_type: 'ADJUSTED', points: Number(form.points), description: form.description || 'Manual adjustment' });
        setToast('Points adjusted.');
      } else {
        await api.post('/pharmacy/loyalty/rewards/', {
          name: form.name, points_required: Number(form.points_required), reward_type: 'DISCOUNT',
          discount_amount: form.discount_amount || null, is_active: true,
        });
        setToast('Reward added.');
      }
      setDialog(null); load();
    } catch (e) {
      setFormError(errText(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleReward = async (r) => {
    try { await api.patch(`/pharmacy/loyalty/rewards/${r.id}/`, { is_active: !r.is_active }); load(); } catch (e) { setToast(errText(e, 'Could not update the reward.')); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  const ready = (c) => rewards.filter(r => r.is_active && r.points_required <= c.loyalty_points);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" sx={{ mb: 1 }}>Customers</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Customer</TableCell><TableCell align="right">Points</TableCell><TableCell /></TableRow></TableHead>
              <TableBody>
                {customers.length === 0 && <TableRow><TableCell colSpan={3} align="center">No customers yet. Points appear after a paid bill with a customer.</TableCell></TableRow>}
                {customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}<Typography variant="caption" display="block" color="text.secondary">{c.phone}</Typography></TableCell>
                    <TableCell align="right">{c.loyalty_points}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" disabled={ready(c).length === 0} onClick={() => open('redeem', c, { reward: ready(c)[0].id })}>Redeem</Button>
                      <Button size="small" sx={{ ml: 1 }} onClick={() => open('adjust', c, { points: '', description: '' })}>Adjust</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Rewards</Typography>
            <Button size="small" variant="contained" onClick={() => open('reward', null, { name: '', points_required: '', discount_amount: '' })}>Add reward</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {rewards.length === 0 && <TableRow><TableCell align="center">No rewards yet.</TableCell></TableRow>}
                {rewards.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}<Typography variant="caption" display="block" color="text.secondary">{r.points_required} points · {rewardText(r)}</Typography></TableCell>
                    <TableCell align="right"><Chip size="small" clickable color={r.is_active ? 'success' : 'default'} label={r.is_active ? 'Active' : 'Off'} onClick={() => toggleReward(r)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1 }}>Recent activity</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Customer</TableCell><TableCell>What</TableCell><TableCell align="right">Points</TableCell></TableRow></TableHead>
              <TableBody>
                {history.length === 0 && <TableRow><TableCell colSpan={4} align="center">Nothing yet.</TableCell></TableRow>}
                {history.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>{new Date(h.transaction_date).toLocaleDateString()}</TableCell>
                    <TableCell>{h.customer_name}</TableCell>
                    <TableCell>{h.description || h.transaction_type}</TableCell>
                    <TableCell align="right" sx={{ color: h.points < 0 ? 'error.main' : 'success.main' }}>{h.points > 0 ? `+${h.points}` : h.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialog?.type === 'redeem' ? `Redeem for ${dialog.customer.name}` : dialog?.type === 'adjust' ? `Adjust points: ${dialog.customer.name}` : 'New reward'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {dialog?.type === 'redeem' && (
            <TextField select fullWidth size="small" sx={{ mt: 1 }} label="Reward" value={form.reward || ''} onChange={(e) => setForm({ reward: e.target.value })}
              helperText={`Available points: ${dialog.customer.loyalty_points}`}>
              {ready(dialog.customer).map(r => <MenuItem key={r.id} value={r.id}>{r.name} ({r.points_required} points)</MenuItem>)}
            </TextField>
          )}
          {dialog?.type === 'adjust' && (
            <>
              <TextField fullWidth size="small" sx={{ mt: 1 }} type="number" label="Points (use minus to take away)" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
              <TextField fullWidth size="small" sx={{ mt: 2 }} label="Reason" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </>
          )}
          {dialog?.type === 'reward' && (
            <>
              <TextField fullWidth size="small" sx={{ mt: 1 }} label="Name (e.g. ₹50 off your next bill)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField fullWidth size="small" sx={{ mt: 2 }} type="number" label="Points needed" value={form.points_required} onChange={(e) => setForm({ ...form, points_required: e.target.value })} />
              <TextField fullWidth size="small" sx={{ mt: 2 }} type="number" label="Discount amount (₹)" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: e.target.value })} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={saving || (dialog?.type === 'reward' && (!form.name || !form.points_required)) || (dialog?.type === 'adjust' && !form.points) || (dialog?.type === 'redeem' && !form.reward)} onClick={submit}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={5000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default PharmacyLoyaltyTab;
