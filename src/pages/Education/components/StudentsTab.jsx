import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Grid } from '@mui/material';
import api from '../../../services/api';

const StudentsTab = ({ classes = [] }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [studentForm, setStudentForm] = useState({
    name: '', email: '', admission_date: '', upper_id: '', assigned_class: '', 
    department: '', phone: '', address: '', date_of_birth: '', gender: '', 
    cast: '', religion: '', parent_name: '', parent_phone: ''
  });

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/education/students/");
      setStudents(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleOpenDialog = (student = null) => {
    setEditingStudent(student);
    setStudentForm(student ? { 
      name: student.name || '', 
      email: student.email || '', 
      admission_date: student.admission_date || '', 
      upper_id: student.upper_id || '', 
      assigned_class: student.assigned_class?.id || student.assigned_class_id || student.assigned_class || '', 
      department: student.department || '', 
      phone: student.phone || '', 
      address: student.address || '', 
      date_of_birth: student.date_of_birth || '', 
      gender: student.gender || '', 
      cast: student.cast || '', 
      religion: student.religion || '', 
      parent_name: student.parent_name || '', 
      parent_phone: student.parent_phone || ''
    } : {
      name: '', email: '', admission_date: new Date().toISOString().split('T')[0], upper_id: '', assigned_class: '', 
      department: '', phone: '', address: '', date_of_birth: '', gender: '', 
      cast: '', religion: '', parent_name: '', parent_phone: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!studentForm.name || !studentForm.email || !studentForm.assigned_class) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    
    try {
      const payload = { ...studentForm };
      // Fallback for assigned_class format based on backend expectation
      payload.assigned_class_id = payload.assigned_class; 
      
      if (editingStudent) {
        await api.put(`/education/students/${editingStudent.id}/`, payload);
        setSnackbar({ open: true, message: 'Student updated!', severity: 'success' });
      } else {
        await api.post(`/education/students/`, payload);
        setSnackbar({ open: true, message: 'Student added!', severity: 'success' });
      }
      fetchStudents();
      handleCloseDialog();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save student.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api.delete(`/education/students/${id}/`);
      setSnackbar({ open: true, message: 'Student deleted!', severity: 'success' });
      fetchStudents();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete student.', severity: 'error' });
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'admission_date', headerName: 'Admission Date', flex: 1 },
    { field: 'assigned_class', headerName: 'Class', flex: 1, renderCell: (params) => {
        const row = params.row;
        const acId = row.assigned_class?.id || row.assigned_class_id || row.assigned_class;
        return classes.find(c => String(c.id) === String(acId))?.name || row.assigned_class?.name || 'N/A';
    }},
    { field: 'phone', headerName: 'Phone', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => handleOpenDialog(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>Delete</Button>
        </Box>
      ),
      flex: 1,
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Students</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>Add Student</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(c => <TableCell key={c.field}>{c.headerName}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(row => (
                <TableRow key={row.id}>
                  {columns.map(c => (
                    <TableCell key={c.field}>
                      {c.renderCell ? c.renderCell({ row }) : row[c.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Name *" value={studentForm.name} onChange={handleFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="email" label="Email *" value={studentForm.email} onChange={handleFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="admission_date" label="Admission Date *" type="date" InputLabelProps={{ shrink: true }} value={studentForm.admission_date} onChange={handleFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="upper_id" label="Upper ID (Optional)" value={studentForm.upper_id} onChange={handleFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned Class *</InputLabel>
                <Select name="assigned_class" value={String(studentForm.assigned_class)} onChange={handleFormChange} label="Assigned Class *">
                  {classes.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phone" label="Phone" value={studentForm.phone} onChange={handleFormChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField name="address" label="Address" value={studentForm.address} onChange={handleFormChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="date_of_birth" label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={studentForm.date_of_birth} onChange={handleFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={studentForm.gender} onChange={handleFormChange} label="Gender">
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Cast *</InputLabel>
                <Select name="cast" value={studentForm.cast} onChange={handleFormChange} label="Cast *">
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="OBC">OBC</MenuItem>
                  <MenuItem value="SC">SC</MenuItem>
                  <MenuItem value="ST">ST</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="parent_name" label="Parent Name" value={studentForm.parent_name} onChange={handleFormChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="parent_phone" label="Parent Phone" value={studentForm.parent_phone} onChange={handleFormChange} fullWidth />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentsTab;
