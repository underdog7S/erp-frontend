import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip } from '@mui/material';
import api from '../../../services/api';

const AdminTenantsTab = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [tenantForm, setTenantForm] = useState({
    name: '', domain: '', admin_email: '', plan: 'Free', is_active: true
  });

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/tenants/");
      setTenants(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load tenants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleOpenDialog = (tenant = null) => {
    setEditingTenant(tenant);
    setTenantForm(tenant ? { ...tenant } : { name: '', domain: '', admin_email: '', plan: 'Free', is_active: true });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingTenant) {
        await api.put(`/admin/tenants/${editingTenant.id}/`, tenantForm);
        setSnackbar({ open: true, message: 'Tenant updated!', severity: 'success' });
      } else {
        await api.post(`/admin/tenants/`, tenantForm);
        setSnackbar({ open: true, message: 'Tenant created!', severity: 'success' });
      }
      fetchTenants();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save tenant.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>Tenant Management</Typography>
        <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'white' }} onClick={() => handleOpenDialog()}>Create Tenant</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} sx={{ bgcolor: '#1a1a24', color: 'white', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Tenant Name</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Domain</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Admin Email</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Plan</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: 'white' }}>{row.name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.domain}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.admin_email}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" sx={{ bgcolor: 'rgba(79, 172, 254, 0.2)', color: '#4facfe', border: '1px solid rgba(79, 172, 254, 0.5)' }} label={row.plan} />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" color={row.is_active ? 'success' : 'error'} label={row.is_active ? 'Active' : 'Suspended'} />
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
        <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Create Tenant'}</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Tenant Name" value={tenantForm.name} onChange={e => setTenantForm({...tenantForm, name: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
          <TextField name="domain" label="Domain Name" value={tenantForm.domain} onChange={e => setTenantForm({...tenantForm, domain: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
          <TextField name="admin_email" label="Admin Email" value={tenantForm.admin_email} onChange={e => setTenantForm({...tenantForm, admin_email: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
          <TextField name="plan" label="Subscription Plan" value={tenantForm.plan} onChange={e => setTenantForm({...tenantForm, plan: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
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

export default AdminTenantsTab;
