import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Checkbox,
  ListItemText,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../services/api';

const AdminEnhanced = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [totalInactiveUsers, setTotalInactiveUsers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [userLimit, setUserLimit] = useState(5);
  const [storageUsed, setStorageUsed] = useState(0);
  const [currentPlan, setCurrentPlan] = useState('Free');
  
  // Edit user states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    role: '',
    department: '',
    job_title: '',
    is_active: true,
    assigned_classes: []
  });
  const [editingUserLoading, setEditingUserLoading] = useState(false);
  
  // Remove user states
  const [removeUser, setRemoveUser] = useState(null);
  const [removeUserLoading, setRemoveUserLoading] = useState(false);
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Education-specific states
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState('');
  
  // Add user states
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'staff',
    department: '',
    company_name: '',
    industry: 'education',
    plan: 'free',
    assigned_classes: []
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  
  // Get user role from localStorage
  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        search: search,
        role: roleFilter,
        department: departmentFilter,
        page: page + 1,
        page_size: pageSize
      });

      const response = await api.get(`/users/?${params}`);
      setUsers(response.data.results || []);
      setTotalUsers(response.data.count || 0);
      
      // Calculate stats
      const activeUsers = response.data.results?.filter(user => user.user?.is_active) || [];
      const inactiveUsers = response.data.results?.filter(user => !user.user?.is_active) || [];
      const adminUsers = response.data.results?.filter(user => user.role === 'admin') || [];
      
      setTotalActiveUsers(activeUsers.length);
      setTotalInactiveUsers(inactiveUsers.length);
      setTotalAdmins(adminUsers.length);
      
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search, roleFilter, page, pageSize, departmentFilter]);

  useEffect(() => {
    // Only fetch education data if user is in education industry
    const userIndustry = JSON.parse(localStorage.getItem('user') || '{}').industry;
    if (userIndustry && userIndustry.toLowerCase() === 'education') {
      api.get("/education/classes/").then(res => setClasses(res.data));
      api.get("/education/departments/").then(res => setDepartments(res.data));
    }
    
    const fetchRoles = async () => {
      setRolesLoading(true);
      setRolesError("");
      const token = localStorage.getItem('access_token');
      try {
        const response = await fetch('/api/users/roles/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        setRolesError(error.message);
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleEditUser = (user) => {
    // Check if current user has admin privileges
    if (userRole !== 'admin' && userRole !== '1') {
      setSnackbar({ open: true, message: 'Only administrators can edit users.', severity: 'warning' });
      return;
    }
    setSelectedUser(user);
    setEditForm({
      username: user.user?.username && user.user.username !== 'N/A' ? user.user.username : '',
      email: user.user?.email && user.user.email !== 'No email' ? user.user.email : '',
      phone: user.phone && user.phone !== 'N/A' ? user.phone : '',
      first_name: user.user?.first_name || '',
      last_name: user.user?.last_name || '',
      role: mapRoleValue(user.role),
      department: user.department?.id || null,
      job_title: user.job_title && user.job_title !== 'N/A' ? user.job_title : '',
      is_active: user.user?.is_active !== false,
      assigned_classes: user.assigned_classes || [],
    });
    setEditDialogOpen(true);
  };

  const handleToggleUserStatus = async (user, isActive) => {
    try {
      console.log('Toggle user status - user object:', user);
      console.log('Toggle user status - user.user:', user.user);
      console.log('Toggle user status - user.user?.id:', user.user?.id);
      console.log('Toggle user status - isActive:', isActive);
      
      const token = localStorage.getItem('access_token');
      console.log('Toggle user status - token:', token);
      
      const payload = {
        user_id: user.user?.id,
        is_active: isActive
      };
      console.log('Toggle user status - payload:', payload);
      
      const response = await api.post('/users/toggle-status/', payload);
      
      if (response.status === 200) {
        // Update the user in the local state
        setUsers(users.map(u => 
          u.id === user.id 
            ? { ...u, user: { ...u.user, is_active: isActive } }
            : u
        ));
        
        // Refresh statistics
      fetchAll();
        
        setSnackbar({ open: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, severity: 'success' });
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      setSnackbar({ open: true, message: 'Failed to update user status', severity: 'error' });
    }
  };

  const handleAddUser = async () => {
    try {
      setAddUserLoading(true);
      
      // Validate required fields
      if (!addUserForm.username || !addUserForm.email || !addUserForm.password) {
        setSnackbar({ open: true, message: 'Please fill in all required fields (Username, Email, Password)', severity: 'error' });
      return;
    }

      const payload = {
        username: addUserForm.username,
        email: addUserForm.email,
        password: addUserForm.password,
        first_name: addUserForm.first_name,
        last_name: addUserForm.last_name,
        role: addUserForm.role,
        department: addUserForm.department || null,
        assigned_classes: addUserForm.assigned_classes
      };

      const response = await api.post('/users/add/', payload);
      
      if (response.status === 201) {
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
        setAddUserDialogOpen(false);
        setAddUserForm({
          username: '',
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'staff',
          department: '',
          company_name: '',
          industry: 'education',
          plan: 'free',
          assigned_classes: []
        });
        fetchAll(); // Refresh the user list
      }
    } catch (error) {
      console.error('Error adding user:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create user';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setAddUserLoading(false);
    }
  };

    const mapRoleValue = (role) => {
    if (role) {
        const roleMap = {
        'admin': 'admin',
        'teacher': 'teacher',
        'student': 'student',
        'accountant': 'accountant',
        'staff': 'staff'
        };
        return roleMap[role] || 'staff';
      }
      return role || 'staff';
    };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setEditingUserLoading(true);
    try {
      const formData = new FormData();
      // Add the user profile ID (not user ID)
      formData.append('id', selectedUser?.id || editForm?.id);
      formData.append('username', editForm.username || '');
      formData.append('email', editForm.email || '');
      formData.append('role', editForm.role?.toLowerCase() || 'staff'); // ensure this is valid lowercase
      formData.append('is_active', editForm.is_active !== false);
      formData.append('phone', editForm.phone || '');
      formData.append('first_name', editForm.first_name || '');
      formData.append('last_name', editForm.last_name || '');
      formData.append('department', editForm.department || null);
      formData.append('job_title', editForm.job_title || '');
      
      // Add assigned classes
      if (editForm.assigned_classes && editForm.assigned_classes.length > 0) {
        editForm.assigned_classes.forEach(classId => {
          formData.append('assigned_classes', classId);
        });
      }

      // Debug: Log the form data being sent
      console.log('Sending user edit data:', {
          id: selectedUser?.id || editForm?.id,
        username: editForm.username,
        email: editForm.email,
        role: editForm.role?.toLowerCase(),
        department: editForm.department,
        assigned_classes: editForm.assigned_classes
      });

      const response = await api.post('/users/edit/', formData);
      
      if (response.status === 200) {
          setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
        setEditDialogOpen(false);
        fetchAll(); // Refresh the user list
        } else {
        setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
        }
      } catch (error) {
      console.error('User edit error:', error.response?.data || error.message);
      setSnackbar({ 
        open: true, 
        message: 'Error updating user: ' + (error.response?.data?.error || error.message), 
        severity: 'error' 
      });
    } finally {
      setEditingUserLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!removeUser) return;
    
    setRemoveUserLoading(true);
    try {
      const response = await api.delete(`/users/${removeUser}/`);
      
      if (response.status === 204) {
        setSnackbar({ open: true, message: 'User removed successfully!', severity: 'success' });
        setRemoveUser(null);
        fetchAll(); // Refresh the user list
          } else {
        setSnackbar({ open: true, message: 'Failed to remove user', severity: 'error' });
          }
        } catch (error) {
      setSnackbar({ open: true, message: 'Error removing user: ' + error.message, severity: 'error' });
    } finally {
      setRemoveUserLoading(false);
    }
  };

    const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
      {
        field: 'username',
      headerName: 'Username', 
        width: 150,
      valueGetter: (value, row) => row?.user?.username || 'No Username'
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 200,
      valueGetter: (value, row) => row?.user?.email || 'No Email'
      },
      {
        field: 'department',
        headerName: 'Department',
        width: 150,
      valueGetter: (value, row) => row?.department?.name || 'No Department'
    },
    { field: 'role', headerName: 'Role', width: 120 },
    { 
      field: 'is_active', 
      headerName: 'Status', 
        width: 100,
        renderCell: (params) => (
          <Chip
          label={params.row.user?.is_active ? 'Active' : 'Inactive'} 
          color={params.row.user?.is_active ? 'success' : 'default'} 
            size="small"
          />
        )
      },
      {
        field: 'actions',
      headerName: 'Actions',
      width: 200,
        renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={params.row.user?.is_active || false}
                onChange={(e) => handleToggleUserStatus(params.row, e.target.checked)}
                  size="small"
              />
            }
            label={params.row.user?.is_active ? 'Active' : 'Inactive'}
            sx={{ margin: 0 }}
          />
          <Button
            size="small"
            variant="outlined"
                  onClick={() => handleEditUser(params.row)}
          >
            Edit
          </Button>
          <Button
                  size="small"
            variant="outlined"
            color="error"
            onClick={() => setRemoveUser(params.row.id)}
          >
            Remove
          </Button>
          </Box>
      ),
    },
  ];

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  };

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
          </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, plans, and system settings
        </Typography>
        </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
              <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Users
                  </Typography>
                <Typography variant="h4">
                    {totalUsers}
                </Typography>
                </Box>
                <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 1 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    👥
                  </Typography>
                </Box>
              </Box>
              </CardContent>
            </Card>
          </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
              <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    User Limit
                  </Typography>
                <Typography variant="h4">
                    {userLimit}
                </Typography>
                </Box>
                <Box sx={{ bgcolor: 'secondary.main', borderRadius: 2, p: 1 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    📊
                  </Typography>
                </Box>
              </Box>
              </CardContent>
            </Card>
          </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
              <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Storage Used
                  </Typography>
                <Typography variant="h4">
                    {storageUsed} MB
                </Typography>
                </Box>
                <Box sx={{ bgcolor: 'success.main', borderRadius: 2, p: 1 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    💾
                  </Typography>
                </Box>
              </Box>
              </CardContent>
            </Card>
          </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
              <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Current Plan
                  </Typography>
                <Typography variant="h4">
                    {currentPlan}
                </Typography>
                </Box>
                <Box sx={{ bgcolor: 'warning.main', borderRadius: 2, p: 1 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    📋
                  </Typography>
                </Box>
              </Box>
              </CardContent>
            </Card>
        </Grid>
      </Grid>

      {/* User Management Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5">
                👥 User Management
              </Typography>
              <Box component="span" sx={{ fontWeight: 500 }}>
                ({totalUsers} Total Users)
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setAddUserDialogOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Add New User
            </Button>
          </Box>

          {/* User Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                <Typography variant="h6" color="primary.contrastText">
                  {totalActiveUsers}
                </Typography>
                <Typography variant="body2" color="primary.contrastText">
                  Active Users
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.300', borderRadius: 2 }}>
                <Typography variant="h6" color="text.primary">
                  {totalInactiveUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inactive Users
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
                <Typography variant="h6" color="secondary.contrastText">
                  {totalAdmins}
                </Typography>
                <Typography variant="body2" color="secondary.contrastText">
                  Administrators
                </Typography>
              </Box>
          </Grid>
        </Grid>

        {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
                fullWidth
                label="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                variant="outlined"
            size="small"
          />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role"
                >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="accountant">Accountant</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
          </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="healthcare">Healthcare</MenuItem>
                  <MenuItem value="retail">Retail</MenuItem>
                  <MenuItem value="salon">Salon</MenuItem>
            </Select>
          </FormControl>
            </Grid>
          </Grid>

          {/* Data Grid */}
          <Box sx={{ height: 400, width: '100%', overflow: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell key={col.field} sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>{col.headerName}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.slice(page * pageSize, page * pageSize + pageSize).map((row) => (
                      <TableRow key={row.id}>
                        {columns.map((col) => (
                          <TableCell key={col.field}>
                            {col.renderCell 
                              ? col.renderCell({ row, value: col.valueGetter ? col.valueGetter(null, row) : row[col.field] }) 
                              : col.valueGetter 
                                ? col.valueGetter(null, row) 
                                : row[col.field]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            ✏️ Edit User: {selectedUser?.username}
          </DialogTitle>
        <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflow: 'auto' }}>
            <Grid container spacing={2}>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Username"
                  value={editForm.username || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditForm(prev => ({...prev, username: newValue}));
                  }}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditForm(prev => ({...prev, email: newValue}));
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Phone"
                  value={editForm.phone || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditForm(prev => ({...prev, phone: newValue}));
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Job Title"
                  value={editForm.job_title || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditForm(prev => ({...prev, job_title: newValue}));
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="First Name"
                  value={editForm.first_name || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditForm(prev => ({...prev, first_name: newValue}));
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editForm.last_name || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditForm(prev => ({...prev, last_name: newValue}));
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editForm.role || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditForm(prev => ({...prev, role: newValue}));
                    }}
                    label="Role"
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="accountant">Accountant</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            
            {/* ASSIGNED CLASSES FIELD */}
            <Grid gridColumn="span 12">
              <Box sx={{ mt: 3, p: 3, backgroundColor: '#e3f2fd', borderRadius: 2, border: '2px solid #1976d2' }}>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, textAlign: 'center', mb: 2 }}>
                  🎓 Assign Classes to Teacher
        </Typography>
                <Typography variant="body2" sx={{ color: '#1976d2', textAlign: 'center', mb: 2 }}>
                  Select the classes this teacher should be assigned to. Required for teachers.
        </Typography>
                <FormControl fullWidth>
                  <InputLabel>Assigned Classes</InputLabel>
                  <Select
                    multiple
                    value={editForm.assigned_classes || []}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditForm(prev => ({...prev, assigned_classes: newValue}));
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const classObj = classes.find(c => c.id === value);
                          return (
                          <Chip 
                              key={value} 
                              label={classObj ? classObj.name : value} 
                              size="small" 
                            color="primary" 
                            />
                  );
                })}
          </Box>
                    )}
                  >
                    {classes.map((classObj) => (
                      <MenuItem key={classObj.id} value={classObj.id}>
                        <Checkbox checked={(editForm.assigned_classes || []).indexOf(classObj.id) > -1} />
                        <ListItemText primary={classObj.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {editForm.role === 'teacher' ? 'Required: Teachers must be assigned to at least one class' : 'Optional: Assign classes for teachers'}
                  </FormHelperText>
                </FormControl>
              </Box>
            </Grid>
            
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Department"
                  value={editForm.department || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditForm(prev => ({...prev, department: newValue}));
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 12">
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.is_active}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setEditForm(prev => ({...prev, is_active: newValue}));
                      }}
                    />
                  }
                  label="Active User"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUser} 
              variant="contained"
                disabled={editingUserLoading}
                startIcon={editingUserLoading ? <CircularProgress size={20} /> : null}
            >
                {editingUserLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>

      {/* Remove User Confirmation */}
      <Dialog open={!!removeUser} onClose={() => setRemoveUser(null)}>
        <DialogTitle>Confirm User Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove user <strong>{removeUser}</strong>? This action cannot be undone.
        </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveUser(null)}>Cancel</Button>
                      <Button
            onClick={handleRemoveUser} 
            color="error" 
                        variant="contained"
            disabled={removeUserLoading}
            startIcon={removeUserLoading ? <CircularProgress size={20} /> : null}
                      >
            {removeUserLoading ? "Removing..." : "Remove User"}
                      </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Plan Upgrade Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🚀 Upgrade Your Plan
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Unlock premium features and increase your limits with our flexible pricing plans.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Starter
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    ₹999/year
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    20 users • 2.0 GB storage
                  </Typography>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0' }}>
                    <li>Advanced Analytics</li>
                    <li>Bulk Operations</li>
                    <li>Priority Support</li>
                    <li>Custom Reports</li>
                  </ul>
                      <Button
                        variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Choose Starter
                      </Button>
                  </CardContent>
                </Card>
              </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', position: 'relative', border: '2px solid', borderColor: 'primary.main' }}>
                          <Chip 
                            label="Popular" 
                            color="primary" 
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pro
                          </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    ₹2,499/year
                          </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    50 users • 10.0 GB storage
                          </Typography>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0' }}>
                    <li>Everything in Starter</li>
                    <li>Advanced Integrations</li>
                    <li>API Access</li>
                    <li>Custom Branding</li>
                    <li>24/7 Support</li>
                  </ul>
                        <Button
                    variant="contained" 
                          fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Choose Pro
                        </Button>
                </CardContent>
                      </Card>
                    </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', position: 'relative' }}>
                  <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Business
                        </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    ₹4,999/year
                        </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    150 users • 20.0 GB storage
                      </Typography>
                  <Chip 
                    label="Save ₹2,989 annually" 
                    color="success" 
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <ul style={{ paddingLeft: '20px', margin: '16px 0' }}>
                    <li>Everything in Pro</li>
                    <li>White-label Solution</li>
                    <li>Dedicated Manager</li>
                    <li>Custom Development</li>
                    <li>SLA Guarantee</li>
                  </ul>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Choose Business
                  </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Need a custom solution? 
                      <Button 
                variant="text" 
                color="primary"
                onClick={() => window.open('mailto:support@zenitherp.com', '_blank')}
              >
                Contact Sales
                      </Button>
                            </Typography>
                            </Box>
                          </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog 
        open={addUserDialogOpen} 
        onClose={() => setAddUserDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          ➕ Add New User
        </DialogTitle>
        <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflow: 'auto' }}>
            <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                fullWidth
                label="Username *"
                value={addUserForm.username}
                onChange={(e) => setAddUserForm(prev => ({...prev, username: e.target.value}))}
                  margin="normal"
                  required
                />
              </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                label="Email *"
                  type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm(prev => ({...prev, email: e.target.value}))}
                  margin="normal"
                  required
                />
              </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                label="Password *"
                type="password"
                value={addUserForm.password}
                onChange={(e) => setAddUserForm(prev => ({...prev, password: e.target.value}))}
                  margin="normal"
                  required
                />
              </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                value={addUserForm.first_name}
                onChange={(e) => setAddUserForm(prev => ({...prev, first_name: e.target.value}))}
                  margin="normal"
                />
              </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                value={addUserForm.last_name}
                onChange={(e) => setAddUserForm(prev => ({...prev, last_name: e.target.value}))}
                  margin="normal"
                />
              </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth margin="normal" required>
                  <InputLabel>Role</InputLabel>
                  <Select
                  value={addUserForm.role}
                  onChange={(e) => setAddUserForm(prev => ({...prev, role: e.target.value}))}
                    label="Role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="accountant">Accountant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={addUserForm.department}
                  onChange={(e) => setAddUserForm(prev => ({...prev, department: e.target.value}))}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>
            
            {/* Assigned Classes Section */}
            {(addUserForm.role === 'teacher' || addUserForm.role === 'student') && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'primary.light', 
                  borderRadius: 2, 
                  border: '2px solid', 
                  borderColor: 'primary.main',
                  boxShadow: 3
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                    🎓 Assign Classes
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.contrastText', mb: 2 }}>
                    Select the classes for this {addUserForm.role}.
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Assigned Classes</InputLabel>
                    <Select
                      multiple
                      value={addUserForm.assigned_classes}
                      onChange={(e) => setAddUserForm(prev => ({...prev, assigned_classes: e.target.value}))}
                      label="Assigned Classes"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const classObj = classes.find(c => c.id === value);
                            return (
                              <Chip key={value} label={classObj?.name || value} size="small" />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {classes.map((classObj) => (
                        <MenuItem key={classObj.id} value={classObj.id}>
                          <Checkbox checked={addUserForm.assigned_classes.indexOf(classObj.id) > -1} />
                          <ListItemText primary={classObj.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            )}
            </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setAddUserDialogOpen(false)}
            color="secondary"
          >
                Cancel
              </Button>
              <Button 
            onClick={handleAddUser}
                variant="contained" 
            disabled={addUserLoading}
            startIcon={addUserLoading ? <CircularProgress size={20} /> : <AddIcon />}
              >
            {addUserLoading ? 'Adding User...' : 'Add User'}
              </Button>
            </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEnhanced; 