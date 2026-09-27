import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, FormControlLabel, Checkbox,
} from '@mui/material';
import api from '../../../services/api';
import { openPdf } from '../../../utils/openPdf';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const errText = (e, fallback) => {
  const d = e.response?.data;
  if (!d) return fallback;
  if (typeof d === 'string') return d;
  if (d.error) return d.error;
  const first = Object.values(d)[0];
  return Array.isArray(first) ? first[0] : (typeof first === 'string' ? first : fallback);
};
const STATUS_COLOR = { pending: 'warning', approved: 'success', rejected: 'default', enrolled: 'success' };

const AdministrationTab = ({ canAccessSettings }) => {
  const [subTab, setSubTab] = useState(0);

  const [transferCerts, setTransferCerts] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const [tcDialog, setTcDialog] = useState(false);
  const [tcForm, setTcForm] = useState({ student: '', reason_for_leaving: '', issue_date: new Date().toISOString().split('T')[0], remarks: '' });
  const [tcError, setTcError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deptDialog, setDeptDialog] = useState(null); // {} for new, {id,...} for edit
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [deptError, setDeptError] = useState('');

  const [decideApp, setDecideApp] = useState(null); // {app, action: 'approve'|'reject'}
  const [createStudentToo, setCreateStudentToo] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchTransferCerts = useCallback(async () => {
    setLoading(true);
    try {
      const [tcRes, stuRes] = await Promise.all([api.get('/education/tc/'), api.get('/education/students/')]);
      setTransferCerts(asList(tcRes.data));
      setStudents(asList(stuRes.data));
    } catch {
      setToast('Failed to load transfer certificates.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/education/admission-applications/');
      setAdmissions(asList(res.data));
    } catch {
      setToast('Failed to load admission applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/education/departments/');
      setDepartments(asList(res.data));
    } catch {
      setToast('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subTab === 0) fetchTransferCerts();
    if (subTab === 1) fetchAdmissions();
    if (subTab === 2) fetchDepartments();
  }, [subTab, fetchTransferCerts, fetchAdmissions, fetchDepartments]);

  const openTcDialog = () => { setTcForm({ student: '', reason_for_leaving: '', issue_date: new Date().toISOString().split('T')[0], remarks: '' }); setTcError(''); setTcDialog(true); };

  const submitTc = async () => {
    if (!tcForm.student) { setTcError('Choose the student.'); return; }
    setSaving(true); setTcError('');
    try {
      await api.post('/education/tc/', tcForm);
      setTcDialog(false); setToast('Transfer certificate issued.'); fetchTransferCerts();
    } catch (e) {
      setTcError(errText(e, 'Could not issue the transfer certificate.'));
    } finally {
      setSaving(false);
    }
  };

  const downloadTc = async (tc) => {
    if (!(await openPdf(`/education/tc/${tc.id}/pdf/`))) setToast('Could not open the certificate PDF.');
  };

  const openDeptDialog = (dept) => { setDeptForm(dept ? { name: dept.name, description: dept.description || '' } : { name: '', description: '' }); setDeptError(''); setDeptDialog(dept || {}); };

  const submitDept = async () => {
    if (!deptForm.name.trim()) { setDeptError('Give the department a name.'); return; }
    setSaving(true); setDeptError('');
    try {
      if (deptDialog.id) await api.patch(`/education/departments/${deptDialog.id}/`, deptForm);
      else await api.post('/education/departments/', deptForm);
      setDeptDialog(null); setToast('Department saved.'); fetchDepartments();
    } catch (e) {
      setDeptError(errText(e, 'Could not save the department.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleDept = async (dept) => {
    try {
      await api.patch(`/education/departments/${dept.id}/`, { is_active: !dept.is_active });
      fetchDepartments();
    } catch (e) {
      setToast(errText(e, 'Could not update the department.'));
    }
  };

  const decide = async () => {
    const { app, action } = decideApp;
    setSaving(true);
    try {
      if (action === 'approve') await api.post(`/education/admission-applications/${app.id}/approve/`, { create_student: createStudentToo });
      else await api.post(`/education/admission-applications/${app.id}/reject/`, { rejection_reason: rejectionReason });
      setDecideApp(null); setToast(action === 'approve' ? 'Application approved.' : 'Application rejected.'); fetchAdmissions();
    } catch (e) {
      setToast(errText(e, 'Could not update the application.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Administration</Typography>
      <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{ mb: 3 }}>
        <Tab label="Transfer Certificates" />
        <Tab label="Admission Applications" />
        <Tab label="Departments" />
        {canAccessSettings && <Tab label="Settings" />}
      </Tabs>

      {loading && <CircularProgress sx={{ display: 'block', mb: 2 }} />}

      {subTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" onClick={openTcDialog}>New transfer certificate</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>TC number</TableCell><TableCell>Student</TableCell><TableCell>Class</TableCell>
                  <TableCell>Issue date</TableCell><TableCell>Reason</TableCell><TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {transferCerts.length === 0 && <TableRow><TableCell colSpan={6} align="center">No certificates issued yet.</TableCell></TableRow>}
                {transferCerts.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{row.tc_number}</TableCell>
                    <TableCell>{row.student_name}{row.student_roll_number ? ` (${row.student_roll_number})` : ''}</TableCell>
                    <TableCell>{row.class_name || '-'}</TableCell>
                    <TableCell>{row.issue_date}</TableCell>
                    <TableCell>{row.reason_for_leaving || '-'}</TableCell>
                    <TableCell align="right"><Button size="small" onClick={() => downloadTc(row)}>PDF</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {subTab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Applicant Name</TableCell><TableCell>Class</TableCell><TableCell>Date</TableCell>
                <TableCell>Status</TableCell><TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {admissions.length === 0 && <TableRow><TableCell colSpan={5} align="center">No applications found.</TableCell></TableRow>}
              {admissions.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.student_name}</TableCell>
                  <TableCell>{row.class_name || 'N/A'}</TableCell>
                  <TableCell>{row.application_date}</TableCell>
                  <TableCell><Chip size="small" color={STATUS_COLOR[row.status] || 'default'} label={row.status_display || row.status} /></TableCell>
                  <TableCell align="right">
                    {row.status === 'pending' && (
                      <>
                        <Button size="small" color="success" onClick={() => { setDecideApp({ app: row, action: 'approve' }); setCreateStudentToo(true); }}>Approve</Button>
                        <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => { setDecideApp({ app: row, action: 'reject' }); setRejectionReason(''); }}>Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {subTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" onClick={() => openDeptDialog(null)}>New department</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell /><TableCell /></TableRow></TableHead>
              <TableBody>
                {departments.length === 0 && <TableRow><TableCell colSpan={4} align="center">No departments yet.</TableCell></TableRow>}
                {departments.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.description || '-'}</TableCell>
                    <TableCell><Chip size="small" clickable color={d.is_active ? 'success' : 'default'} label={d.is_active ? 'Active' : 'Inactive'} onClick={() => toggleDept(d)} /></TableCell>
                    <TableCell align="right"><Button size="small" onClick={() => openDeptDialog(d)}>Edit</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {subTab === 3 && canAccessSettings && (
        <Alert severity="info">
          Education Module settings and tenant configurations are handled here.
          Currently under maintenance for the modular upgrade.
        </Alert>
      )}

      <Dialog open={tcDialog} onClose={() => setTcDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New transfer certificate</DialogTitle>
        <DialogContent>
          {tcError && <Alert severity="error" sx={{ mb: 2 }}>{tcError}</Alert>}
          <TextField select fullWidth size="small" sx={{ mt: 1 }} label="Student" value={tcForm.student} onChange={(e) => setTcForm({ ...tcForm, student: e.target.value })}>
            {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}{s.upper_id ? ` (${s.upper_id})` : ''}</MenuItem>)}
          </TextField>
          <TextField fullWidth size="small" sx={{ mt: 2 }} type="date" label="Issue date" InputLabelProps={{ shrink: true }} value={tcForm.issue_date} onChange={(e) => setTcForm({ ...tcForm, issue_date: e.target.value })} />
          <TextField fullWidth size="small" sx={{ mt: 2 }} label="Reason for leaving" value={tcForm.reason_for_leaving} onChange={(e) => setTcForm({ ...tcForm, reason_for_leaving: e.target.value })} />
          <TextField fullWidth size="small" sx={{ mt: 2 }} label="Remarks" multiline minRows={2} value={tcForm.remarks} onChange={(e) => setTcForm({ ...tcForm, remarks: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTcDialog(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={submitTc}>Issue certificate</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deptDialog} onClose={() => setDeptDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{deptDialog?.id ? 'Edit department' : 'New department'}</DialogTitle>
        <DialogContent>
          {deptError && <Alert severity="error" sx={{ mb: 2 }}>{deptError}</Alert>}
          <TextField fullWidth size="small" sx={{ mt: 1 }} label="Name" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
          <TextField fullWidth size="small" sx={{ mt: 2 }} label="Description" multiline minRows={2} value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeptDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={submitDept}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!decideApp} onClose={() => setDecideApp(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{decideApp?.action === 'approve' ? 'Approve application' : 'Reject application'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>{decideApp?.app.student_name}</Typography>
          {decideApp?.action === 'approve' ? (
            <FormControlLabel control={<Checkbox checked={createStudentToo} onChange={(e) => setCreateStudentToo(e.target.checked)} />} label="Also create the student record" />
          ) : (
            <TextField fullWidth size="small" label="Reason (optional)" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecideApp(null)}>Cancel</Button>
          <Button variant="contained" color={decideApp?.action === 'approve' ? 'success' : 'error'} disabled={saving} onClick={decide}>
            {decideApp?.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={5000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default AdministrationTab;
