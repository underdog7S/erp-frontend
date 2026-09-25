import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Snackbar, Chip
} from '@mui/material';
import api from '../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const money = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const thisMonth = () => new Date().toISOString().slice(0, 7);
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.values(d).flat().map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
};

// Staff records, leave approval and monthly payroll.
const HR = () => {
  const [tab, setTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [slips, setSlips] = useState([]);
  const [month, setMonth] = useState(thisMonth());
  const [dlg, setDlg] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [e, l, p] = await Promise.all([api.get('/hr/employees/'), api.get('/hr/leaves/'), api.get('/hr/payslips/', { params: { month } })]);
      setEmployees(asList(e.data)); setLeaves(asList(l.data)); setSlips(asList(p.data));
    } catch (e) { setToast(e.response?.status === 403 ? 'HR is for administrators only.' : 'Could not load HR data.'); }
  }, [month]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setErr('');
    try {
      if (dlg === 'employee') { if (form.id) await api.patch(`/hr/employees/${form.id}/`, form); else await api.post('/hr/employees/', form); }
      else if (dlg === 'leave') await api.post('/hr/leaves/', form);
      else if (dlg === 'adjust') await api.patch(`/hr/payslips/${form.id}/`, { bonus: form.bonus || 0, other_deductions: form.other_deductions || 0 });
      setDlg(null); load();
    } catch (e) { setErr(errText(e, 'Could not save.')); }
  };
  const call = async (fn, ok) => {
    try { await fn(); if (ok) setToast(ok); load(); } catch (e) { setToast(errText(e, 'That did not work.')); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Staff, leave &amp; payroll</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}><Tab label="Employees" /><Tab label="Leave" /><Tab label="Payroll" /></Tabs>

      {tab === 0 && (<>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}><Button variant="contained" onClick={() => { setErr(''); setForm({ paid_leave_per_year: 12, is_active: true }); setDlg('employee'); }}>Add employee</Button></Box>
        <TableContainer component={Paper} variant="outlined"><Table size="small">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Role</TableCell><TableCell>Phone</TableCell><TableCell align="right">Monthly salary</TableCell><TableCell align="right">Paid leave left</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {employees.length === 0 && <TableRow><TableCell colSpan={6} align="center">No employees yet.</TableCell></TableRow>}
            {employees.map(x => (
              <TableRow key={x.id} hover>
                <TableCell>{x.name}{!x.is_active && <Chip size="small" label="Inactive" sx={{ ml: 1 }} />}</TableCell><TableCell>{x.designation || '-'}</TableCell><TableCell>{x.phone || '-'}</TableCell>
                <TableCell align="right">{money(x.monthly_salary)}</TableCell><TableCell align="right">{x.leave_balance} of {x.paid_leave_per_year}</TableCell>
                <TableCell align="right"><Button size="small" onClick={() => { setErr(''); setForm(x); setDlg('employee'); }}>Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
      </>)}

      {tab === 1 && (<>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}><Button variant="contained" disabled={employees.length === 0} onClick={() => { setErr(''); setForm({ employee: employees[0]?.id, leave_type: 'PAID' }); setDlg('leave'); }}>Record leave</Button></Box>
        <TableContainer component={Paper} variant="outlined"><Table size="small">
          <TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Type</TableCell><TableCell>From</TableCell><TableCell>To</TableCell><TableCell align="right">Days</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {leaves.length === 0 && <TableRow><TableCell colSpan={7} align="center">No leave requests.</TableCell></TableRow>}
            {leaves.map(l => (
              <TableRow key={l.id} hover>
                <TableCell>{l.employee_name}</TableCell><TableCell>{l.leave_type === 'PAID' ? 'Paid' : 'Unpaid'}</TableCell><TableCell>{l.start_date}</TableCell><TableCell>{l.end_date}</TableCell><TableCell align="right">{l.days}</TableCell>
                <TableCell><Chip size="small" color={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'default' : 'warning'} label={l.status} /></TableCell>
                <TableCell align="right">{l.status === 'pending' && (<>
                  <Button size="small" variant="contained" onClick={() => call(() => api.post(`/hr/leaves/${l.id}/decide/`, { decision: 'approved' }))}>Approve</Button>
                  <Button size="small" color="error" onClick={() => call(() => api.post(`/hr/leaves/${l.id}/decide/`, { decision: 'rejected' }))}>Reject</Button></>)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
      </>)}

      {tab === 2 && (<>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField size="small" type="month" label="Month" InputLabelProps={{ shrink: true }} value={month} onChange={(e) => setMonth(e.target.value)} />
          <Button variant="contained" onClick={() => call(() => api.post('/hr/payroll/run/', { month }), 'Payroll calculated')}>Calculate payroll</Button>
        </Box>
        <TableContainer component={Paper} variant="outlined"><Table size="small">
          <TableHead><TableRow><TableCell>Employee</TableCell><TableCell align="right">Salary</TableCell><TableCell align="right">Unpaid days</TableCell><TableCell align="right">Leave deduction</TableCell><TableCell align="right">Other</TableCell><TableCell align="right">Bonus</TableCell><TableCell align="right">Net pay</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {slips.length === 0 && <TableRow><TableCell colSpan={8} align="center">Press Calculate payroll to prepare this month.</TableCell></TableRow>}
            {slips.map(s => (
              <TableRow key={s.id} hover>
                <TableCell>{s.employee_name}</TableCell><TableCell align="right">{money(s.gross)}</TableCell><TableCell align="right">{s.unpaid_days}</TableCell>
                <TableCell align="right">{money(s.leave_deduction)}</TableCell><TableCell align="right">{money(s.other_deductions)}</TableCell><TableCell align="right">{money(s.bonus)}</TableCell><TableCell align="right"><b>{money(s.net)}</b></TableCell>
                <TableCell align="right">{s.status === 'paid' ? <Chip size="small" color="success" label={`Paid ${s.paid_on}`} /> : (<>
                  <Button size="small" onClick={() => { setErr(''); setForm(s); setDlg('adjust'); }}>Adjust</Button>
                  <Button size="small" variant="contained" onClick={() => call(() => api.post(`/hr/payslips/${s.id}/pay/`), 'Marked paid and added to expenses')}>Mark paid</Button></>)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
        <Alert severity="info" sx={{ mt: 2 }}>Unpaid leave is deducted as salary divided by the days in the month. Marking a payslip paid records the salary under Salaries in Accounting.</Alert>
      </>)}

      <Dialog open={!!dlg} onClose={() => setDlg(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{dlg === 'employee' ? (form.id ? 'Edit employee' : 'Add employee') : dlg === 'leave' ? 'Record leave' : 'Adjust payslip'}</DialogTitle>
        <DialogContent dividers>
          {dlg === 'employee' && (<>
            <TextField required fullWidth margin="dense" label="Name" value={form.name || ''} onChange={set('name')} />
            <TextField fullWidth margin="dense" label="Role / designation" value={form.designation || ''} onChange={set('designation')} />
            <TextField fullWidth margin="dense" label="Phone" value={form.phone || ''} onChange={set('phone')} />
            <TextField required fullWidth margin="dense" type="number" label="Monthly salary (₹)" value={form.monthly_salary ?? ''} onChange={set('monthly_salary')} />
            <TextField fullWidth margin="dense" type="date" label="Joined on" InputLabelProps={{ shrink: true }} value={form.join_date || ''} onChange={set('join_date')} />
            <TextField fullWidth margin="dense" type="number" label="Paid leave days per year" value={form.paid_leave_per_year ?? 12} onChange={set('paid_leave_per_year')} />
            <TextField select fullWidth margin="dense" label="Status" value={form.is_active === false ? 'no' : 'yes'} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'yes' })}><MenuItem value="yes">Active</MenuItem><MenuItem value="no">Inactive (left)</MenuItem></TextField>
          </>)}
          {dlg === 'leave' && (<>
            <TextField select fullWidth margin="dense" label="Employee" value={form.employee || ''} onChange={set('employee')}>{employees.map(x => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}</TextField>
            <TextField select fullWidth margin="dense" label="Type" value={form.leave_type || 'PAID'} onChange={set('leave_type')}><MenuItem value="PAID">Paid leave</MenuItem><MenuItem value="UNPAID">Unpaid leave</MenuItem></TextField>
            <TextField fullWidth margin="dense" type="date" label="From" InputLabelProps={{ shrink: true }} value={form.start_date || ''} onChange={set('start_date')} />
            <TextField fullWidth margin="dense" type="date" label="To" InputLabelProps={{ shrink: true }} value={form.end_date || ''} onChange={set('end_date')} />
            <TextField fullWidth margin="dense" label="Reason" value={form.reason || ''} onChange={set('reason')} />
          </>)}
          {dlg === 'adjust' && (<>
            <TextField fullWidth margin="dense" type="number" label="Bonus (₹)" value={form.bonus ?? 0} onChange={set('bonus')} />
            <TextField fullWidth margin="dense" type="number" label="Other deductions (₹)" value={form.other_deductions ?? 0} onChange={set('other_deductions')} />
          </>)}
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setDlg(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default HR;
