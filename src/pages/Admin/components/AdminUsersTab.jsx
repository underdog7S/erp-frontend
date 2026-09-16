import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip } from '@mui/material';
import api from '../../../services/api';

const AdminUsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [userForm, setUserForm] = useState({
    username: '', email: '', role: 'USER', is_active: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users/");
      setUsers(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    setUserForm(user ? { ...user } : { username: '', email: '', role: 'USER', is_active: true });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}/`, userForm);
        setSnackbar({ open: true, message: 'User updated!', severity: 'success' });
      } else {
        await api.post(`/admin/users/`, userForm);
        setSnackbar({ open: true, message: 'User created!', severity: 'success' });
      }
      fetchUsers();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save user.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>User Management</Typography>
        <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'white' }} onClick={() => handleOpenDialog()}>Add User</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} sx={{ bgcolor: '#1a1a24', color: 'white', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Username</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Email</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Role</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: 'white' }}>{row.username}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.email}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" sx={{ bgcolor: 'rgba(79, 172, 254, 0.2)', color: '#4facfe', border: '1px solid rgba(79, 172, 254, 0.5)' }} label={row.role} />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" color={row.is_active ? 'success' : 'error'} label={row.is_active ? 'Active' : 'Disabled'} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: '#00f2fe' }} onClick={() => handleOpenDialog(row)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { bgcolor: '#1a1a24', color: 'white', border: '1px solid rgba(0, 242, 254, 0.3)' } }}>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField name="username" label="Username" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
          <TextField name="email" label="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
          <TextField name="role" label="Role" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Button>
          <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)' }} onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsersTab;
