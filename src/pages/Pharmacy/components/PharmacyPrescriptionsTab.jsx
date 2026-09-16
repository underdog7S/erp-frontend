import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip } from '@mui/material';
import api from '../../../services/api';

const PharmacyPrescriptionsTab = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [prescriptionForm, setPrescriptionForm] = useState({
    patient_name: '', doctor_name: '', date_issued: '', notes: ''
  });

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pharmacy/prescriptions/");
      setPrescriptions(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const handleOpenDialog = () => {
    setPrescriptionForm({ patient_name: '', doctor_name: '', date_issued: new Date().toISOString().split('T')[0], notes: '' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      await api.post(`/pharmacy/prescriptions/`, prescriptionForm);
      setSnackbar({ open: true, message: 'Prescription recorded!', severity: 'success' });
      fetchPrescriptions();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to record prescription.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Prescription Management</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>Log Prescription</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Date Issued</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.patient_name}</TableCell>
                  <TableCell>{row.doctor_name}</TableCell>
                  <TableCell>{row.date_issued}</TableCell>
                  <TableCell>{row.notes}</TableCell>
                  <TableCell>
                    <Chip size="small" color="primary" label="Verified" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Log Prescription</DialogTitle>
        <DialogContent>
          <TextField name="patient_name" label="Patient Name" value={prescriptionForm.patient_name} onChange={e => setPrescriptionForm({...prescriptionForm, patient_name: e.target.value})} fullWidth margin="dense" />
          <TextField name="doctor_name" label="Doctor Name" value={prescriptionForm.doctor_name} onChange={e => setPrescriptionForm({...prescriptionForm, doctor_name: e.target.value})} fullWidth margin="dense" />
          <TextField name="date_issued" label="Date Issued" type="date" InputLabelProps={{ shrink: true }} value={prescriptionForm.date_issued} onChange={e => setPrescriptionForm({...prescriptionForm, date_issued: e.target.value})} fullWidth margin="dense" />
          <TextField name="notes" label="Notes / Dosages" value={prescriptionForm.notes} onChange={e => setPrescriptionForm({...prescriptionForm, notes: e.target.value})} fullWidth margin="dense" multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PharmacyPrescriptionsTab;
