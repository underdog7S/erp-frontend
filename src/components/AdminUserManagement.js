import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  IconButton, Tooltip, Alert, LinearProgress, Grid, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Checkbox,
  FormControlLabel, Switch, Avatar, Badge
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  FilterList as FilterIcon, Download as DownloadIcon, Upload as UploadIcon,
  Visibility as ViewIcon, Block as BlockIcon, CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../services/api';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
    assigned_classes: [],
    photo: null,
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    job_title: '',
    joining_date: '',
    qualifications: '',
    bio: '',
    linkedin: '',
    is_active: true
  });

  const [classes, setClasses] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchClasses();
    fetchRoles();
  }, [page, pageSize, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        page_size: pageSize,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      };
      const response = await api.get('/users/', { params });
      setUsers(response.data.results || []);
      setTotalUsers(response.data.count || 0);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/education/classes/');
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles/');
      setRoles(response.data.roles || []);
    } catch (err) {
      console.error('Failed to fetch roles');
    }
  };

  const handleAddUser = async () => {
    try {
      const formData = new FormData();
      Object.entries(userForm).forEach(([key, value]) => {
        if (key === 'assigned_classes') {
          value.forEach(v => formData.append('assigned_classes', v));
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      
      await api.post('/users/add/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setOpenAddDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError('Failed to add user');
    }
  };

  const handleEditUser = async () => {
    try {
      const formData = new FormData();
      Object.entries(userForm).forEach(([key, value]) => {
        if (key === 'assigned_classes') {
          value.forEach(v => formData.append('assigned_classes', v));
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      
      await api.put(`/users/edit/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setOpenEditDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}/`);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    try {
      switch (bulkAction) {
        case 'delete':
          await Promise.all(selectedUsers.map(id => api.delete(`/users/${id}/`)));
          break;
        case 'activate':
          await Promise.all(selectedUsers.map(id => api.patch(`/users/${id}/`, { is_active: true })));
          break;
        case 'deactivate':
          await Promise.all(selectedUsers.map(id => api.patch(`/users/${id}/`, { is_active: false })));
          break;
        default:
          break;
      }
      setSelectedUsers([]);
      setBulkAction('');
      fetchUsers();
    } catch (err) {
      setError('Failed to perform bulk action');
    }
  };

  const resetForm = () => {
    setUserForm({
      username: '',
      email: '',
      password: '',
      role: 'staff',
      assigned_classes: [],
      photo: null,
      phone: '',
      address: '',
      date_of_birth: '',
      gender: '',
      emergency_contact: '',
      job_title: '',
      joining_date: '',
      qualifications: '',
      bio: '',
      linkedin: '',
      is_active: true
    });
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      renderCell: (params) => (
        <Checkbox
          checked={selectedUsers.includes(params.value)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, params.value]);
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== params.value));
            }
          }}
        />
      )
    },
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 80,
      renderCell: (params) => (
        <Avatar src={params.row.photo} alt={params.row.username}>
          {params.row.username.charAt(0).toUpperCase()}
        </Avatar>
      )
    },
    {
      field: 'username',
      headerName: 'Username',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.email}
          </Typography>
        </Box>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'admin' ? 'error' : params.value === 'teacher' ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          icon={params.row.is_active ? <ActiveIcon /> : <BlockIcon />}
          label={params.row.is_active ? 'Active' : 'Inactive'}
          color={params.row.is_active ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'assigned_classes',
      headerName: 'Classes',
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.value?.slice(0, 2).map((cls, index) => (
            <Chip key={index} label={cls.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
          ))}
          {params.value?.length > 2 && (
            <Chip label={`+${params.value.length - 2}`} size="small" variant="outlined" />
          )}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleViewUser(params.row)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenEditDialog(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDeleteUser(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const handleViewUser = (user) => {
    setSelectedUser(user);
    // Open view dialog
  };

  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      assigned_classes: user.assigned_classes || [],
      photo: null,
      phone: user.phone || '',
      address: user.address || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      emergency_contact: user.emergency_contact || '',
      job_title: user.job_title || '',
      joining_date: user.joining_date || '',
      qualifications: user.qualifications || '',
      bio: user.bio || '',
      linkedin: user.linkedin || '',
      is_active: user.is_active
    });
    setOpenEditDialog(true);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              User Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
            >
              Add User
            </Button>
          </Box>

          {/* Filters */}
          <Grid container columns={12} spacing={2} mb={3}>
            <Grid gridColumn="span 4">
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid gridColumn="span 3">
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid gridColumn="span 3">
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid gridColumn="span 2">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {/* Export functionality */}}
              >
                Export
              </Button>
            </Grid>
          </Grid>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: 'primary.light', color: 'white' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">
                  {selectedUsers.length} user(s) selected
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
                  >
                    <MenuItem value="">Select Action</MenuItem>
                    <MenuItem value="activate">Activate</MenuItem>
                    <MenuItem value="deactivate">Deactivate</MenuItem>
                    <MenuItem value="delete">Delete</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  sx={{ backgroundColor: 'white', color: 'primary.main' }}
                >
                  Apply
                </Button>
              </Box>
            </Paper>
          )}

          {/* Users Table */}
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={users}
              columns={columns}
              pageSize={pageSize}
              page={page}
              rowCount={totalUsers}
              loading={loading}
              paginationMode="server"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              checkboxSelection={false}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid rgba(0,0,0,0.1)',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <UserForm
            form={userForm}
            setForm={setUserForm}
            classes={classes}
            roles={roles}
            isEdit={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <UserForm
            form={userForm}
            setForm={setUserForm}
            classes={classes}
            roles={roles}
            isEdit={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained">Update User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const UserForm = ({ form, setForm, classes, roles, isEdit }) => {
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Username"
          value={form.username}
          onChange={(e) => handleChange('username', e.target.value)}
          required
        />
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />
      </Grid>
      {!isEdit && (
        <Grid gridColumn="span 6">
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
          />
        </Grid>
      )}
      <Grid gridColumn="span 6">
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value)}
            label="Role"
          >
            {roles.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Phone"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Job Title"
          value={form.job_title}
          onChange={(e) => handleChange('job_title', e.target.value)}
        />
      </Grid>
      <Grid gridColumn="span 12">
        <FormControl fullWidth>
          <InputLabel>Assigned Classes</InputLabel>
          <Select
            multiple
            value={form.assigned_classes}
            onChange={(e) => handleChange('assigned_classes', e.target.value)}
            label="Assigned Classes"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const cls = classes.find(c => c.id === value);
                  return <Chip key={value} label={cls ? cls.name : value} size="small" />;
                })}
              </Box>
            )}
          >
            {classes.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 12">
        <FormControlLabel
          control={
            <Switch
              checked={form.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
            />
          }
          label="Active User"
        />
      </Grid>
    </Grid>
  );
};

export default AdminUserManagement; 