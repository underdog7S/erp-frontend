import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar } from '@mui/material';
import api from '../../../services/api';

const ClassesTab = () => {
  const [classes, setClasses] = useState([]);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState("");
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({ name: "", schedule: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchClasses = async () => {
    setClassLoading(true);
    setClassError("");
    try {
      const res = await api.get("/education/classes/");
      setClasses(res.data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setClassError("You do not have permission to view classes.");
      } else if (err?.response?.status === 404) {
        setClassError("Classes not found.");
      } else {
        setClassError("Failed to load classes.");
      }
    } finally {
      setClassLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleOpenClassDialog = (cls = null) => {
    setEditingClass(cls);
    setClassForm(cls ? { name: cls.name, schedule: cls.schedule } : { name: "", schedule: "" });
    setOpenClassDialog(true);
  };

  const handleCloseClassDialog = () => {
    setOpenClassDialog(false);
    setEditingClass(null);
    setClassForm({ name: "", schedule: "" });
  };

  const handleClassFormChange = (e) => {
    const { name, value } = e.target;
    setClassForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClass = async () => {
    if (!classForm.name || !classForm.schedule) {
      setSnackbar({ open: true, message: 'Please fill all required fields (Name, Schedule).', severity: 'error' });
      return;
    }
    try {
      if (editingClass) {
        await api.put(`/education/classes/${editingClass.id}/`, classForm);
        setSnackbar({ open: true, message: 'Class updated!', severity: 'success' });
      } else {
        await api.post(`/education/classes/`, classForm);
        setSnackbar({ open: true, message: 'Class added!', severity: 'success' });
      }
      fetchClasses();
      handleCloseClassDialog();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save class.', severity: 'error' });
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await api.delete(`/education/classes/${id}/`);
      setSnackbar({ open: true, message: 'Class deleted!', severity: 'success' });
      fetchClasses();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete class.', severity: 'error' });
    }
  };

  const classColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'schedule', headerName: 'Schedule', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => params?.row && handleOpenClassDialog(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => params?.row && handleDeleteClass(params.row.id)}>Delete</Button>
        </Box>
      ),
      flex: 1,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Classes</Typography>
        <Button variant="contained" onClick={() => handleOpenClassDialog()}>Add Class</Button>
      </Box>
      {classLoading ? (
        <CircularProgress />
      ) : classError ? (
        <Alert severity="error">{classError}</Alert>
      ) : classes.length === 0 ? (
        <Alert severity="info">No classes found. Add one to get started.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {classColumns.map((col) => (
                  <TableCell key={col.field}>{col.headerName}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((row) => {
                const rowId = row.id || Math.random();
                return (
                  <TableRow key={rowId}>
                    {classColumns.map((col) => (
                      <TableCell key={col.field}>
                        {col.renderCell 
                          ? col.renderCell({ row, value: row[col.field] }) 
                          : col.valueGetter 
                            ? col.valueGetter({ row }, row) 
                            : row[col.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Class Dialog */}
      <Dialog open={openClassDialog} onClose={handleCloseClassDialog}>
        <DialogTitle>{editingClass ? 'Edit Class' : 'Add Class'}</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Class Name" value={classForm.name} onChange={handleClassFormChange} fullWidth margin="dense" />
          <TextField name="schedule" label="Schedule" value={classForm.schedule} onChange={handleClassFormChange} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClassDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveClass}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassesTab;
