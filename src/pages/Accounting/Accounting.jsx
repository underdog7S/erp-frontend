import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Snackbar, Chip
} from '@mui/material';
import api from '../../services/api';

const asList = (d) => (Array.isArray(d) ? d : (d.results || []));
const money = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const iso = (d) => d.toISOString().slice(0, 10);
const monthStart = () => { const d = new Date(); return iso(new Date(d.getFullYear(), d.getMonth(), 1)); };
const errText = (e, f) => {
  const d = e.response?.data;
  if (!d || typeof d === 'string') return f;
  return d.error || d.detail || Object.values(d).flat().map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
};

// Expenses, and a profit and GST summary built from every module's sales.
const Accounting = () => {
  const [tab, setTab] = useState(0);
  const [range, setRange] = useState({ date_from: monthStart(), date_to: iso(new Date()) });
  const [expenses, setExpenses] = useState([]);
  const [cats, setCats] = useState([]);
  const [report, setReport] = useState(null);
  const [dlg, setDlg] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [e, c, r] = await Promise.all([
        api.get('/accounting/expenses/', { params: range }), api.get('/accounting/categories/'), api.get('/accounting/report/', { params: range })]);
      setExpenses(asList(e.data)); setCats(asList(c.data)); setReport(r.data);
    } catch (e) { setToast(e.response?.status === 403 ? 'Accounting is for administrators only.' : 'Could not load accounting.'); }
  }, [range]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setErr('');
    try {
      if (dlg === 'cat') await api.post('/accounting/categories/', { name: form.name });
      else if (form.id) await api.patch(`/accounting/expenses/${form.id}/`, form);
      else await api.post('/accounting/expenses/', form);
      setDlg(null); load();
    } catch (e) { setErr(errText(e, 'Could not save.')); }
  };
  const remove = async (x) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await api.delete(`/accounting/expenses/${x.id}/`); load(); } catch (e) { setToast('Could not delete.'); }
  };
  const download = async () => {
    try {
      const res = await api.get('/accounting/report/', { params: { ...range, export: 'csv' }, responseType: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(res.data); a.download = `report_${range.date_from}_${range.date_to}.csv`; a.click();
    } catch (e) { setToast('Could not download.'); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const t = report?.totals;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700}>Accounting</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, my: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }} value={range.date_from} onChange={(e) => setRange({ ...range, date_from: e.target.value })} />
        <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }} value={range.date_to} onChange={(e) => setRange({ ...range, date_to: e.target.value })} />
        <Button variant="outlined" onClick={download}>Download CSV</Button>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}><Tab label="Profit & GST" /><Tab label="Expenses" /></Tabs>

      {tab === 0 && t && (<>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1.5, mb: 3 }}>
          {[['Sales (excl. GST)', t.net_revenue], ['Expenses (excl. GST)', t.net_expenses], ['Profit', t.profit], ['GST payable', report.gst.payable]].map(([l, v]) => (
            <Paper key={l} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">{l}</Typography>
              <Typography variant="h6" color={Number(v) < 0 ? 'error.main' : 'text.primary'}>{money(v)}</Typography>
            </Paper>
          ))}
        </Box>
        <Typography variant="subtitle1" fontWeight={600}>Income by module</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}><Table size="small">
          <TableHead><TableRow><TableCell>Source</TableCell><TableCell align="right">Sales (incl. GST)</TableCell><TableCell align="right">GST collected</TableCell></TableRow></TableHead>
          <TableBody>
            {report.income.length === 0 && <TableRow><TableCell colSpan={3} align="center">No sales in this period.</TableCell></TableRow>}
            {report.income.map(i => <TableRow key={i.source}><TableCell>{i.source}</TableCell><TableCell align="right">{money(i.revenue)}</TableCell><TableCell align="right">{money(i.tax)}</TableCell></TableRow>)}
          </TableBody>
        </Table></TableContainer>
        <Typography variant="subtitle1" fontWeight={600}>Expenses by category</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}><Table size="small"><TableBody>
          {report.expenses_by_category.length === 0 && <TableRow><TableCell align="center">No expenses in this period.</TableCell></TableRow>}
          {report.expenses_by_category.map(c => <TableRow key={c.category}><TableCell>{c.category}</TableCell><TableCell align="right">{money(c.amount)}</TableCell></TableRow>)}
        </TableBody></Table></TableContainer>
        <Alert severity="info">GST payable is the GST collected on sales minus the GST paid on purchases you recorded. A negative figure is credit to carry forward. Check the final return with your accountant.</Alert>
      </>)}

      {tab === 1 && (<>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
          <Button variant="outlined" onClick={() => { setErr(''); setForm({}); setDlg('cat'); }}>Add category</Button>
          <Button variant="contained" disabled={cats.length === 0} onClick={() => { setErr(''); setForm({ category: cats[0]?.id, date: iso(new Date()), payment_method: 'CASH', gst_amount: 0 }); setDlg('expense'); }}>Add expense</Button>
        </Box>
        {cats.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Add a category (Rent, Salaries, Electricity...) first.</Alert>}
        <TableContainer component={Paper} variant="outlined"><Table size="small">
          <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Category</TableCell><TableCell>Vendor</TableCell><TableCell align="right">Amount</TableCell><TableCell align="right">GST in it</TableCell><TableCell>Paid by</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {expenses.length === 0 && <TableRow><TableCell colSpan={7} align="center">No expenses in this period.</TableCell></TableRow>}
            {expenses.map(x => (
              <TableRow key={x.id} hover>
                <TableCell>{x.date}</TableCell><TableCell><Chip size="small" label={x.category_name} /></TableCell><TableCell>{x.vendor || x.description || '-'}</TableCell>
                <TableCell align="right">{money(x.amount)}</TableCell><TableCell align="right">{Number(x.gst_amount) ? money(x.gst_amount) : '-'}</TableCell><TableCell>{x.payment_method}</TableCell>
                <TableCell align="right"><Button size="small" onClick={() => { setErr(''); setForm(x); setDlg('expense'); }}>Edit</Button><Button size="small" color="error" onClick={() => remove(x)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
      </>)}

      <Dialog open={!!dlg} onClose={() => setDlg(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{dlg === 'cat' ? 'Add category' : form.id ? 'Edit expense' : 'Add expense'}</DialogTitle>
        <DialogContent dividers>
          {dlg === 'cat' ? <TextField autoFocus required fullWidth margin="dense" label="Category name" value={form.name || ''} onChange={set('name')} /> : (<>
            <TextField select fullWidth margin="dense" label="Category" value={form.category || ''} onChange={set('category')}>{cats.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</TextField>
            <TextField fullWidth margin="dense" type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.date || ''} onChange={set('date')} />
            <TextField fullWidth margin="dense" label="Vendor" value={form.vendor || ''} onChange={set('vendor')} />
            <TextField fullWidth margin="dense" label="Description" value={form.description || ''} onChange={set('description')} />
            <TextField required fullWidth margin="dense" type="number" label="Total paid (₹, including GST)" value={form.amount ?? ''} onChange={set('amount')} />
            <TextField fullWidth margin="dense" type="number" label="GST included (₹)" value={form.gst_amount ?? 0} onChange={set('gst_amount')} helperText="From the supplier bill. Counts as input tax." />
            <TextField select fullWidth margin="dense" label="Paid by" value={form.payment_method || 'CASH'} onChange={set('payment_method')}>{['CASH', 'UPI', 'CARD', 'BANK', 'CHEQUE'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField>
            <TextField fullWidth margin="dense" label="Supplier bill no." value={form.invoice_number || ''} onChange={set('invoice_number')} />
          </>)}
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setDlg(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default Accounting;
