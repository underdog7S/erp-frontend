import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Chip, FormControlLabel, Switch, Divider, Grid } from '@mui/material';
import api from '../../../services/api';

const AdminTenantsTab = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [tenantForm, setTenantForm] = useState({
    name: '', domain: '', admin_email: '', plan: 'Free', is_active: true,
    feature_config: {
      is_sms_enabled: false,
      sms_monthly_limit: 100,
      is_whatsapp_enabled: false,
      whatsapp_monthly_limit: 100,
      is_ai_enabled: false,
      ai_tokens_monthly_limit: 5000,
      is_telegram_enabled: false
    }
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
    setTenantForm(tenant ? { 
      ...tenant,
      feature_config: tenant.feature_config || {
        is_sms_enabled: false, sms_monthly_limit: 100,
        is_whatsapp_enabled: false, whatsapp_monthly_limit: 100,
        is_ai_enabled: false, ai_tokens_monthly_limit: 5000,
        is_telegram_enabled: false
      }
    } : { 
      name: '', domain: '', admin_email: '', plan: 'Free', is_active: true,
      feature_config: {
        is_sms_enabled: false, sms_monthly_limit: 100,
        is_whatsapp_enabled: false, whatsapp_monthly_limit: 100,
        is_ai_enabled: false, ai_tokens_monthly_limit: 5000,
        is_telegram_enabled: false
      }
    });
    setOpenDialog(true);
  };

  const handleFeatureToggle = (field) => (e) => {
    setTenantForm({
      ...tenantForm,
      feature_config: {
        ...tenantForm.feature_config,
        [field]: e.target.checked
      }
    });
  };

  const handleFeatureLimitChange = (field) => (e) => {
    setTenantForm({
      ...tenantForm,
      feature_config: {
        ...tenantForm.feature_config,
        [field]: parseInt(e.target.value) || 0
      }
    });
  };

  const handleSave = async () => {
    try {
      if (editingTenant) {
        await api.put(`/admin/tenants/${editingTenant.id}/`, tenantForm);
        setSnackbar({ open: true, message: 'Tenant updated successfully!', severity: 'success' });
      } else {
        await api.post(`/admin/tenants/`, tenantForm);
        setSnackbar({ open: true, message: 'Tenant created successfully!', severity: 'success' });
      }
      fetchTenants();
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save tenant configuration.', severity: 'error' });
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
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Plan</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Active Features</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: 'white' }}>{row.name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.domain || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" sx={{ bgcolor: 'rgba(79, 172, 254, 0.2)', color: '#4facfe', border: '1px solid rgba(79, 172, 254, 0.5)' }} label={row.plan} />
                  </TableCell>
                  <TableCell sx={{ color: 'white', display: 'flex', gap: 1 }}>
                    {row.feature_config?.is_sms_enabled && <Chip size="small" color="primary" label="SMS" />}
                    {row.feature_config?.is_whatsapp_enabled && <Chip size="small" color="success" label="WhatsApp" />}
                    {row.feature_config?.is_ai_enabled && <Chip size="small" color="secondary" label="AI Engine" />}
                  </TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: '#00f2fe' }} onClick={() => handleOpenDialog(row)}>Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog maxWidth="md" fullWidth open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { bgcolor: '#1a1a24', color: 'white', border: '1px solid rgba(0, 242, 254, 0.3)' } }}>
        <DialogTitle>{editingTenant ? 'Manage Tenant & Add-ons' : 'Create Tenant'}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, mt: 1 }}>Basic Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField name="name" label="Tenant Name" value={tenantForm.name} onChange={e => setTenantForm({...tenantForm, name: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField name="domain" label="Domain Name" value={tenantForm.domain} onChange={e => setTenantForm({...tenantForm, domain: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>Platform Add-on Access</Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FormControlLabel 
                control={<Switch checked={tenantForm.feature_config.is_sms_enabled} onChange={handleFeatureToggle('is_sms_enabled')} color="primary" />} 
                label="Enable SMS" 
              />
              <TextField 
                disabled={!tenantForm.feature_config.is_sms_enabled}
                label="Monthly Limit" type="number" fullWidth margin="dense" size="small"
                value={tenantForm.feature_config.sms_monthly_limit} onChange={handleFeatureLimitChange('sms_monthly_limit')}
                InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel 
                control={<Switch checked={tenantForm.feature_config.is_whatsapp_enabled} onChange={handleFeatureToggle('is_whatsapp_enabled')} color="success" />} 
                label="Enable WhatsApp" 
              />
              <TextField 
                disabled={!tenantForm.feature_config.is_whatsapp_enabled}
                label="Monthly Limit" type="number" fullWidth margin="dense" size="small"
                value={tenantForm.feature_config.whatsapp_monthly_limit} onChange={handleFeatureLimitChange('whatsapp_monthly_limit')}
                InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel 
                control={<Switch checked={tenantForm.feature_config.is_ai_enabled} onChange={handleFeatureToggle('is_ai_enabled')} color="secondary" />} 
                label="Enable AI Engine" 
              />
              <TextField 
                disabled={!tenantForm.feature_config.is_ai_enabled}
                label="Monthly Token Limit" type="number" fullWidth margin="dense" size="small"
                value={tenantForm.feature_config.ai_tokens_monthly_limit} onChange={handleFeatureLimitChange('ai_tokens_monthly_limit')}
                InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
              />
            </Grid>
          </Grid>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Button>
          <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)' }} onClick={handleSave}>Save Config</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTenantsTab;
