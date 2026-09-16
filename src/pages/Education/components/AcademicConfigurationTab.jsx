import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar } from '@mui/material';
import api from '../../../services/api';

const AcademicConfigurationTab = ({ classes = [] }) => {
  const [subTab, setSubTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // State for data
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ayRes, termsRes, subjRes, unitsRes] = await Promise.all([
        api.get('/education/academic-years/'),
        api.get('/education/terms/'),
        api.get('/education/subjects/'),
        api.get('/education/units/')
      ]);
      setAcademicYears(ayRes.data);
      setTerms(Array.isArray(termsRes.data) ? termsRes.data : termsRes.data.results || []);
      setSubjects(Array.isArray(subjRes.data) ? subjRes.data : subjRes.data.results || []);
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : unitsRes.data.results || []);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load configuration data.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Academic Configuration</Typography>
      <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{ mb: 3 }}>
        <Tab label="Academic Years" />
        <Tab label="Terms" />
        <Tab label="Subjects" />
        <Tab label="Units" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {subTab === 0 && <AcademicYearsSubTab data={academicYears} refresh={fetchAll} showSnackbar={showSnackbar} />}
          {subTab === 1 && <TermsSubTab data={terms} academicYears={academicYears} refresh={fetchAll} showSnackbar={showSnackbar} />}
          {subTab === 2 && <SubjectsSubTab data={subjects} classes={classes} refresh={fetchAll} showSnackbar={showSnackbar} />}
          {subTab === 3 && <UnitsSubTab data={units} subjects={subjects} refresh={fetchAll} showSnackbar={showSnackbar} />}
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

/* --- Academic Years --- */
const AcademicYearsSubTab = ({ data, refresh, showSnackbar }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", is_current: false });
  const [editingId, setEditingId] = useState(null);

  const handleOpen = (item = null) => {
    setEditingId(item?.id || null);
    setForm(item || { name: "", start_date: "", end_date: "", is_current: false });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) await api.put(`/education/academic-years/${editingId}/`, form);
      else await api.post(`/education/academic-years/`, form);
      showSnackbar(`Academic Year ${editingId ? 'updated' : 'added'}!`);
      setOpen(false);
      refresh();
    } catch { showSnackbar('Error saving academic year.', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api.delete(`/education/academic-years/${id}/`);
      showSnackbar('Deleted successfully!');
      refresh();
    } catch { showSnackbar('Error deleting.', 'error'); }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Academic Year</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Current</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.start_date}</TableCell>
                <TableCell>{row.end_date}</TableCell>
                <TableCell>{row.is_current ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(row)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Edit' : 'Add'} Academic Year</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextField fullWidth margin="dense" label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
          <TextField fullWidth margin="dense" label="End Date" type="date" InputLabelProps={{ shrink: true }} value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
          <FormControlLabel control={<Checkbox checked={form.is_current} onChange={e => setForm({...form, is_current: e.target.checked})} />} label="Is Current Year" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* --- Terms --- */
const TermsSubTab = ({ data, academicYears, refresh, showSnackbar }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ academic_year_id: "", name: "", order: 1, start_date: "", end_date: "", is_active: true });
  const [editingId, setEditingId] = useState(null);

  const handleOpen = (item = null) => {
    setEditingId(item?.id || null);
    setForm(item || { academic_year_id: "", name: "", order: 1, start_date: "", end_date: "", is_active: true });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) await api.put(`/education/terms/${editingId}/`, form);
      else await api.post(`/education/terms/`, form);
      showSnackbar(`Term ${editingId ? 'updated' : 'added'}!`);
      setOpen(false);
      refresh();
    } catch { showSnackbar('Error saving term.', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api.delete(`/education/terms/${id}/`);
      showSnackbar('Deleted successfully!');
      refresh();
    } catch { showSnackbar('Error deleting.', 'error'); }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Term</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{academicYears.find(ay => ay.id === row.academic_year_id)?.name || row.academic_year_id}</TableCell>
                <TableCell>{row.start_date} to {row.end_date}</TableCell>
                <TableCell>{row.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(row)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Edit' : 'Add'} Term</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Academic Year</InputLabel>
            <Select value={form.academic_year_id} onChange={e => setForm({...form, academic_year_id: e.target.value})} label="Academic Year">
              {academicYears.map(ay => <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth margin="dense" label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextField fullWidth margin="dense" label="Order" type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)})} />
          <TextField fullWidth margin="dense" label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
          <TextField fullWidth margin="dense" label="End Date" type="date" InputLabelProps={{ shrink: true }} value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
          <FormControlLabel control={<Checkbox checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />} label="Is Active" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* --- Subjects --- */
const SubjectsSubTab = ({ data, classes, refresh, showSnackbar }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ class_obj_id: "", name: "", code: "", max_marks: 100, weightage: 100, has_practical: false, practical_max_marks: 0, order: 1 });
  const [editingId, setEditingId] = useState(null);

  const handleOpen = (item = null) => {
    setEditingId(item?.id || null);
    setForm(item ? { ...item, class_obj_id: item.class_obj?.id || item.class_obj_id } : { class_obj_id: "", name: "", code: "", max_marks: 100, weightage: 100, has_practical: false, practical_max_marks: 0, order: 1 });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) await api.put(`/education/subjects/${editingId}/`, form);
      else await api.post(`/education/subjects/`, form);
      showSnackbar(`Subject ${editingId ? 'updated' : 'added'}!`);
      setOpen(false);
      refresh();
    } catch { showSnackbar('Error saving subject.', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api.delete(`/education/subjects/${id}/`);
      showSnackbar('Deleted successfully!');
      refresh();
    } catch { showSnackbar('Error deleting.', 'error'); }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Subject</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Max Marks</TableCell>
              <TableCell>Practical</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.class_obj?.name || classes.find(c => c.id === row.class_obj_id)?.name}</TableCell>
                <TableCell>{row.max_marks}</TableCell>
                <TableCell>{row.has_practical ? `Yes (${row.practical_max_marks})` : 'No'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(row)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Edit' : 'Add'} Subject</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Class</InputLabel>
            <Select value={form.class_obj_id} onChange={e => setForm({...form, class_obj_id: e.target.value})} label="Class">
              {classes.map(cls => <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth margin="dense" label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextField fullWidth margin="dense" label="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
          <TextField fullWidth margin="dense" label="Max Marks" type="number" value={form.max_marks} onChange={e => setForm({...form, max_marks: e.target.value})} />
          <FormControlLabel control={<Checkbox checked={form.has_practical} onChange={e => setForm({...form, has_practical: e.target.checked})} />} label="Has Practical" />
          {form.has_practical && <TextField fullWidth margin="dense" label="Practical Max Marks" type="number" value={form.practical_max_marks} onChange={e => setForm({...form, practical_max_marks: e.target.value})} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* --- Units --- */
const UnitsSubTab = ({ data, subjects, refresh, showSnackbar }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject_id: "", name: "", number: 1, description: "", order: 1 });
  const [editingId, setEditingId] = useState(null);

  const handleOpen = (item = null) => {
    setEditingId(item?.id || null);
    setForm(item ? { ...item, subject_id: item.subject?.id || item.subject_id } : { subject_id: "", name: "", number: 1, description: "", order: 1 });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) await api.put(`/education/units/${editingId}/`, form);
      else await api.post(`/education/units/`, form);
      showSnackbar(`Unit ${editingId ? 'updated' : 'added'}!`);
      setOpen(false);
      refresh();
    } catch { showSnackbar('Error saving unit.', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api.delete(`/education/units/${id}/`);
      showSnackbar('Deleted successfully!');
      refresh();
    } catch { showSnackbar('Error deleting.', 'error'); }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Unit</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.number}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.subject?.name || subjects.find(s => s.id === row.subject_id)?.name}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(row)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Edit' : 'Add'} Unit</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Subject</InputLabel>
            <Select value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} label="Subject">
              {subjects.map(sub => <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth margin="dense" label="Unit Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextField fullWidth margin="dense" label="Unit Number" type="number" value={form.number} onChange={e => setForm({...form, number: e.target.value})} />
          <TextField fullWidth margin="dense" label="Description" multiline rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AcademicConfigurationTab;
