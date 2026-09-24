import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip, MenuItem,
  FormControlLabel, Switch, Divider, InputAdornment
} from '@mui/material';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import api from '../../../services/api';
import CsvImportDialog from '../../../components/CsvImportDialog';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const FORMS = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT', 'DROPS', 'INHALER', 'OTHER'];
const EMPTY = {
  name: '', generic_name: '', manufacturer: '', strength: '', dosage_form: 'TABLET', category: '', barcode: '',
  prescription_required: false, expiry_alert_days: 30, hsn_code: '', gst_rate: 0, price_includes_tax: true,
  supplier: '', batch_number: '', manufacturing_date: '', expiry_date: '', quantity: '', cost_price: '', selling_price: '', mrp: '',
};
const errText = (e, fallback) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return fallback;
  return d.error || d.detail || Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('. ') || fallback;
};
const daysTo = (iso) => Math.ceil((new Date(iso) - new Date(new Date().toDateString())) / 86400000);

// Medicine catalogue: what you stock, its GST, how many are on the shelf and when the next batch expires.
const PharmacyInventoryTab = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openImportDialog, setOpenImportDialog] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, c, s] = await Promise.all([api.get('/pharmacy/medicines/'), api.get('/pharmacy/categories/'), api.get('/pharmacy/suppliers/')]);
      setMedicines(asList(m.data)); setCategories(asList(c.data)); setSuppliers(asList(s.data));
      setError('');
    } catch (e) {
      setError('Failed to load medicines.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openDialog = (medicine = null) => {
    setEditing(medicine);
    setFormError('');
    setForm(medicine ? { ...EMPTY, ...medicine, category: medicine.category || '', barcode: medicine.barcode || '' } : EMPTY);
    setOpen(true);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const hasStockInput = !editing && (form.batch_number || form.quantity);
  const stockReady = !hasStockInput || (form.supplier && form.batch_number && form.manufacturing_date && form.expiry_date
    && Number(form.quantity) > 0 && form.cost_price !== '' && form.selling_price !== '' && form.mrp !== '');

  const save = async () => {
    setFormError('');
    setSaving(true);
    try {
      const body = {
        name: form.name, generic_name: form.generic_name, manufacturer: form.manufacturer, strength: form.strength,
        dosage_form: form.dosage_form, category: form.category || null, barcode: form.barcode || null,
        prescription_required: !!form.prescription_required, expiry_alert_days: form.expiry_alert_days || 30,
        hsn_code: form.hsn_code, gst_rate: form.gst_rate || 0, price_includes_tax: !!form.price_includes_tax,
      };
      let saved;
      if (editing) {
        saved = (await api.patch(`/pharmacy/medicines/${editing.id}/`, body)).data;
      } else {
        saved = (await api.post('/pharmacy/medicines/', body)).data;
        if (hasStockInput) {
          await api.post('/pharmacy/batches/', {
            medicine: saved.id, supplier: form.supplier, batch_number: form.batch_number,
            manufacturing_date: form.manufacturing_date, expiry_date: form.expiry_date,
            cost_price: form.cost_price, selling_price: form.selling_price, mrp: form.mrp,
            quantity_received: form.quantity, quantity_available: form.quantity,
          });
        }
      }
      setOpen(false);
      setSnackbar({ open: true, message: editing ? 'Medicine updated' : 'Medicine added', severity: 'success' });
      load();
    } catch (e) {
      setFormError(errText(e, 'Could not save the medicine.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete ${m.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/pharmacy/medicines/${m.id}/`);
      setSnackbar({ open: true, message: 'Medicine deleted', severity: 'success' });
      load();
    } catch (e) {
      setSnackbar({ open: true, message: 'Could not delete: it has batches or sales history.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Medicines &amp; stock</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setOpenImportDialog(true)}>Bulk Import</Button>
          <Button variant="contained" onClick={() => openDialog()}>Add Medicine</Button>
        </Box>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Medicine</TableCell><TableCell>Form</TableCell><TableCell>Manufacturer</TableCell>
              <TableCell align="right">GST</TableCell><TableCell align="right">In stock</TableCell>
              <TableCell>Next expiry</TableCell><TableCell />
            </TableRow></TableHead>
            <TableBody>
              {medicines.length === 0 && <TableRow><TableCell colSpan={7} align="center">No medicines yet. Add one or use Bulk Import.</TableCell></TableRow>}
              {medicines.map(m => {
                const d = m.nearest_expiry ? daysTo(m.nearest_expiry) : null;
                return (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      {m.name}{m.strength ? ` ${m.strength}` : ''}
                      {m.prescription_required && <Chip size="small" label="Rx" sx={{ ml: 1 }} />}
                      {m.generic_name && <Typography variant="caption" display="block" color="text.secondary">{m.generic_name}</Typography>}
                    </TableCell>
                    <TableCell>{m.dosage_form}</TableCell>
                    <TableCell>{m.manufacturer}</TableCell>
                    <TableCell align="right">{Number(m.gst_rate) ? `${Number(m.gst_rate)}%` : '-'}</TableCell>
                    <TableCell align="right">
                      {m.total_stock} {m.total_stock <= 0 && <Chip size="small" color="error" label="Out" sx={{ ml: 0.5 }} />}
                    </TableCell>
                    <TableCell>
                      {d == null ? '-' : (
                        <Chip size="small" color={d < 0 ? 'error' : d <= m.expiry_alert_days ? 'warning' : 'default'}
                          label={`${new Date(m.nearest_expiry).toLocaleDateString()}${d < 0 ? ' (expired)' : ''}`} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openDialog(m)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => remove(m)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit medicine' : 'Add medicine'}</DialogTitle>
        <DialogContent dividers>
          <TextField required label="Medicine name" value={form.name} onChange={set('name')} fullWidth margin="dense" />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField label="Generic name" value={form.generic_name} onChange={set('generic_name')} margin="dense" sx={{ flex: 1, minWidth: 160 }} />
            <TextField required label="Manufacturer" value={form.manufacturer} onChange={set('manufacturer')} margin="dense" sx={{ flex: 1, minWidth: 160 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField label="Strength" value={form.strength} onChange={set('strength')} margin="dense" sx={{ flex: 1, minWidth: 110 }} placeholder="500mg" />
            <TextField select required label="Form" value={form.dosage_form} onChange={set('dosage_form')} margin="dense" sx={{ flex: 1, minWidth: 130 }}>
              {FORMS.map(f => <MenuItem key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</MenuItem>)}
            </TextField>
            <TextField select label="Category" value={form.category} onChange={set('category')} margin="dense" sx={{ flex: 1, minWidth: 130 }}>
              <MenuItem value="">None</MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField label="Barcode" value={form.barcode} onChange={set('barcode')} margin="dense" sx={{ flex: 1, minWidth: 150 }} />
            <TextField type="number" label="Expiry alert (days)" value={form.expiry_alert_days} onChange={set('expiry_alert_days')} margin="dense" sx={{ width: 160 }} />
            <FormControlLabel control={<Switch checked={!!form.prescription_required} onChange={(e) => setForm({ ...form, prescription_required: e.target.checked })} />} label="Needs prescription" />
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="subtitle2">GST</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField label="HSN code" value={form.hsn_code} onChange={set('hsn_code')} margin="dense" sx={{ flex: 1, minWidth: 130 }} inputProps={{ maxLength: 8 }} />
            <TextField type="number" label="GST %" value={form.gst_rate} onChange={set('gst_rate')} margin="dense" sx={{ width: 110 }} helperText="0 = no tax" />
            <FormControlLabel control={<Switch checked={!!form.price_includes_tax} onChange={(e) => setForm({ ...form, price_includes_tax: e.target.checked })} />} label="MRP includes GST" />
          </Box>
          {!editing && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2">Opening stock (optional)</Typography>
              <Typography variant="caption" color="text.secondary">For stock you already have. New purchases go through Purchase Orders.</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.5 }}>
                <TextField select label="Supplier" value={form.supplier} onChange={set('supplier')} margin="dense" sx={{ flex: 1, minWidth: 160 }} disabled={suppliers.length === 0}
                  helperText={suppliers.length === 0 ? 'Add a supplier first' : ' '}>
                  {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>
                <TextField label="Batch no." value={form.batch_number} onChange={set('batch_number')} margin="dense" sx={{ width: 130 }} />
                <TextField type="number" label="Quantity" value={form.quantity} onChange={set('quantity')} margin="dense" sx={{ width: 110 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField type="date" label="Mfg date" InputLabelProps={{ shrink: true }} value={form.manufacturing_date} onChange={set('manufacturing_date')} margin="dense" sx={{ flex: 1, minWidth: 140 }} />
                <TextField type="date" label="Expiry date" InputLabelProps={{ shrink: true }} value={form.expiry_date} onChange={set('expiry_date')} margin="dense" sx={{ flex: 1, minWidth: 140 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {[['cost_price', 'Cost price'], ['selling_price', 'Selling price'], ['mrp', 'MRP']].map(([k, label]) => (
                  <TextField key={k} type="number" label={label} value={form[k]} onChange={set(k)} margin="dense" sx={{ flex: 1, minWidth: 100 }}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                ))}
              </Box>
            </>
          )}
          {formError && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving || !form.name || !form.manufacturer || !stockReady}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>

      <CsvImportDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        importUrl="/pharmacy/medicines/import/"
        templateType="medicine"
        label="Medicines"
        onImported={load}
        note="Imported medicines are added to your catalog. Record stock for them through a Purchase Order (or as opening stock when adding one by hand), since stock is tracked per batch with an expiry date."
      />
    </Box>
  );
};

export default PharmacyInventoryTab;
