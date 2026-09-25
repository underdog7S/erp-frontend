import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert, Snackbar, Autocomplete
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const emptyLine = () => ({ medicine: null, dosage: '', frequency: '', duration: '', quantity: '' });
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.values(d).flat().map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
};

// Prescriptions on file: patient, doctor, and the medicines prescribed.
const PharmacyPrescriptionsTab = () => {
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [lines, setLines] = useState([emptyLine()]);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [r, p, m] = await Promise.all([api.get('/pharmacy/prescriptions/'), api.get('/pharmacy/customers/'), api.get('/pharmacy/medicines/')]);
      setList(asList(r.data)); setPatients(asList(p.data)); setMedicines(asList(m.data));
    } catch (e) { setToast('Could not load prescriptions.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setErr('');
    const body = {
      doctor_name: form.doctor_name, prescription_date: form.prescription_date, diagnosis: form.diagnosis || '', notes: form.notes || '',
      items_input: lines.filter(l => l.medicine).map(l => ({ medicine: l.medicine.id, dosage: l.dosage, frequency: l.frequency, duration: l.duration, quantity: l.quantity || 1 })),
    };
    if (form.patient) body.customer = form.patient.id; else { body.patient_name = form.patient_name; body.patient_phone = form.patient_phone || ''; }
    try { await api.post('/pharmacy/prescriptions/', body); setOpen(false); load(); } catch (e) { setErr(errText(e, 'Could not save.')); }
  };
  const pdf = async (rx) => {
    try {
      const res = await api.get(`/pharmacy/prescriptions/${rx.id}/pdf/`, { responseType: 'blob' });
      window.open(URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' })), '_blank', 'noopener');
    } catch (e) { setToast('Could not open the PDF.'); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const patch = (i, p) => setLines(ls => ls.map((l, idx) => (idx === i ? { ...l, ...p } : l)));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Prescriptions</Typography>
        <Button variant="contained" onClick={() => { setErr(''); setForm({ prescription_date: new Date().toISOString().slice(0, 10) }); setLines([emptyLine()]); setOpen(true); }}>Add prescription</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined"><Table size="small">
        <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Patient</TableCell><TableCell>Doctor</TableCell><TableCell>Medicines</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {list.length === 0 && <TableRow><TableCell colSpan={5} align="center">No prescriptions yet.</TableCell></TableRow>}
          {list.map(rx => (
            <TableRow key={rx.id} hover>
              <TableCell>{new Date(rx.prescription_date).toLocaleDateString()}</TableCell><TableCell>{rx.customer_name}</TableCell><TableCell>{rx.doctor_name}</TableCell>
              <TableCell>{(rx.items || []).map(i => `${i.medicine_name} (${[i.dosage, i.frequency].filter(Boolean).join(', ')})`).join('; ') || '-'}</TableCell>
              <TableCell align="right"><Button size="small" onClick={() => pdf(rx)}>PDF</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add prescription</DialogTitle>
        <DialogContent dividers>
          <Autocomplete size="small" options={patients} value={form.patient || null} getOptionLabel={(p) => `${p.name} (${p.phone})`}
            onChange={(_, v) => setForm({ ...form, patient: v })} renderInput={(p) => <TextField {...p} label="Existing patient" />} sx={{ mb: 1 }} />
          {!form.patient && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField required size="small" label="New patient name" value={form.patient_name || ''} onChange={set('patient_name')} sx={{ flex: 1, minWidth: 180 }} />
              <TextField size="small" label="Phone" value={form.patient_phone || ''} onChange={set('patient_phone')} sx={{ width: 160 }} />
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
            <TextField required size="small" label="Doctor" value={form.doctor_name || ''} onChange={set('doctor_name')} sx={{ flex: 1, minWidth: 180 }} />
            <TextField required size="small" type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.prescription_date || ''} onChange={set('prescription_date')} />
          </Box>
          <TextField fullWidth size="small" label="Diagnosis" value={form.diagnosis || ''} onChange={set('diagnosis')} sx={{ mt: 1.5 }} />
          <Typography variant="subtitle2" sx={{ mt: 2 }}>Medicines</Typography>
          {lines.map((l, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Autocomplete size="small" sx={{ flex: 2, minWidth: 200 }} options={medicines} value={l.medicine} getOptionLabel={(m) => `${m.name}${m.strength ? ` ${m.strength}` : ''}`}
                onChange={(_, v) => patch(i, { medicine: v })} renderInput={(p) => <TextField {...p} label="Medicine" />} />
              <TextField size="small" label="Dosage" value={l.dosage} onChange={(e) => patch(i, { dosage: e.target.value })} sx={{ width: 110 }} />
              <TextField size="small" label="Frequency" value={l.frequency} onChange={(e) => patch(i, { frequency: e.target.value })} sx={{ width: 130 }} />
              <TextField size="small" label="Duration" value={l.duration} onChange={(e) => patch(i, { duration: e.target.value })} sx={{ width: 110 }} />
              <TextField size="small" type="number" label="Qty" value={l.quantity} onChange={(e) => patch(i, { quantity: e.target.value })} sx={{ width: 80 }} />
              <IconButton size="small" aria-label="Remove" disabled={lines.length === 1} onClick={() => setLines(ls => ls.filter((_, idx) => idx !== i))}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          ))}
          <Button size="small" sx={{ mt: 1 }} onClick={() => setLines(ls => [...ls, emptyLine()])}>Add medicine</Button>
          {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={!form.doctor_name || !form.prescription_date || (!form.patient && !form.patient_name)}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default PharmacyPrescriptionsTab;
