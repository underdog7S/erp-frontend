import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box, Card, CardContent, Typography, Grid, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, CircularProgress, Chip, Avatar, LinearProgress, Checkbox, ListItemText, FormControl, InputLabel, FormHelperText, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import GroupIcon from '@mui/icons-material/Group';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { hasPermission, PERMISSIONS } from '../permissions';

// If you have a logo, import it here
// import logo from '../assets/zenith-logo.png';

const Admin = () => {
  // User management
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
    assigned_classes: [],
    department: "",
    photo: null,
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "",
    emergency_contact: "",
    job_title: "",
    joining_date: "",
    qualifications: "",
    bio: "",
    linkedin: ""
  });
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [removeUser, setRemoveUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editRole, setEditRole] = useState({ username: '', role: '' });
  const [classes, setClasses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  // Plan management
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  // Storage usage
  const [dashboard, setDashboard] = useState(null);

  // 2. Add edit user dialog state
  const [openEditUser, setOpenEditUser] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', role: '', assigned_classes: [], department: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserLoading, setEditingUserLoading] = useState(false);

  // 1. Add state for search, roleFilter, page, pageSize, totalUsers
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  // 1. Add state for departmentFilter and departments
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departments, setDepartments] = useState([]);

  const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = userProfile.role || '';
  const navigate = useNavigate();
  const canManageUsers = hasPermission(userProfile, PERMISSIONS.MANAGE_USERS);

  // Fetch users, plan, dashboard
  const fetchAll = async () => {
    setUserLoading(true); setPlanLoading(true); setUserError(""); setPlanError("");
    try {
      const params = {
        page: page + 1,
        page_size: pageSize
      };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (departmentFilter) params.department = departmentFilter;
      const [userRes, planRes, dashRes] = await Promise.all([
        api.get("/users/", { params }),
        api.get("/plans/"),
        api.get("/dashboard/")
      ]);
      setUsers(userRes.data.results || []);
      setTotalUsers(userRes.data.count || 0);
      setPlans(planRes.data);
      setDashboard(dashRes.data);
      setPlan(dashRes.data.plan);
    } catch (err) {
      setUserError("Failed to load admin data.");
      setPlanError("Failed to load plan data.");
    } finally {
      setUserLoading(false); setPlanLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // Only fetch classes and roles once
    // eslint-disable-next-line
  }, [search, roleFilter, page, pageSize]);
  useEffect(() => {
    api.get("/education/classes/").then(res => setClasses(res.data));
    // Fetch roles from backend
    const fetchRoles = async () => {
      setRolesLoading(true);
      setRolesError("");
      const token = localStorage.getItem('access_token');
      if (!token) {
        setRolesError('You are not logged in. Please log in again.');
        setRolesLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:8000/api/roles/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRoles(data.roles || []);
        } else {
          setRolesError('Failed to load roles.');
        }
      } catch (err) {
        setRolesError('Failed to load roles.');
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);
  // 2. Fetch departments in useEffect
  useEffect(() => {
    api.get("/education/departments/").then(res => setDepartments(res.data));
  }, []);

  // User CRUD
  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };
  const handleAddUser = async (e) => {
    e.preventDefault(); setAddingUser(true); setUserError("");
    // Validation: require assigned_classes for students/teachers
    if (["student", "teacher"].includes((userForm.role || '').toLowerCase()) && (!userForm.assigned_classes || userForm.assigned_classes.length === 0)) {
      setSnackbar({ open: true, message: 'Please assign at least one class for students and teachers.', severity: 'error' });
      setAddingUser(false);
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(userForm).forEach(([key, value]) => {
        if (key === 'assigned_classes') {
          (value || []).forEach(v => formData.append('assigned_classes', v));
        } else if (key === 'department') {
          // Send null if not set
          formData.append('department', value ? value : null);
        } else if (key === 'role') {
          // Ensure role is a valid string
          formData.append('role', roles.includes(value) ? value : 'staff');
        } else if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });
      const res = await api.post('/users/add/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUserForm({
        username: "",
        email: "",
        password: "",
        role: "staff",
        assigned_classes: [],
        department: "",
        photo: null,
        phone: "",
        address: "",
        date_of_birth: "",
        gender: "",
        emergency_contact: "",
        job_title: "",
        joining_date: "",
        qualifications: "",
        bio: "",
        linkedin: ""
      });
      setOpenAddUser(false);
      setSnackbar({ open: true, message: 'User added successfully!', severity: 'success' });
      fetchAll();
    } catch (err) {
      let msg = 'Failed to add user.';
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setAddingUser(false);
    }
  };
  const handleRemoveUser = async () => {
    if (!removeUser) return;
    try {
      await api.post("/users/remove/", { username: removeUser });
      setSnackbar({ open: true, message: 'User removed.', severity: 'success' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to remove user.', severity: 'error' });
    } finally {
      setRemoveUser(null);
    }
  };
  const handleEditRole = async () => {
    try {
      await api.post('/users/edit/', { username: editRole.username, role: editRole.role });
      setSnackbar({ open: true, message: 'Role updated.', severity: 'success' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to update role.', severity: 'error' });
    } finally {
      setEditRole({ username: '', role: '' });
    }
  };

  // 3. Add handler to open edit dialog
  const handleOpenEditUser = (user) => {
    setEditUserForm({
      username: user.username,
      email: user.email,
      role: user.role,
      assigned_classes: user.assigned_classes || [],
      department: user.department || '',
      photo: null,
      phone: user.phone || "",
      address: user.address || "",
      date_of_birth: user.date_of_birth || "",
      gender: user.gender || "",
      emergency_contact: user.emergency_contact || "",
      job_title: user.job_title || "",
      joining_date: user.joining_date || "",
      qualifications: user.qualifications || "",
      bio: user.bio || "",
      linkedin: user.linkedin || ""
    });
    setEditingUser(user.username);
    setOpenEditUser(true);
  };
  // 4. Edit user submit handler
  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditingUserLoading(true);
    // Validation: require assigned_classes for students/teachers
    if (["student", "teacher"].includes((editUserForm.role || '').toLowerCase()) && (!editUserForm.assigned_classes || editUserForm.assigned_classes.length === 0)) {
      setSnackbar({ open: true, message: 'Please assign at least one class for students and teachers.', severity: 'error' });
      setEditingUserLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(editUserForm).forEach(([key, value]) => {
        if (key === 'assigned_classes') {
          (value || []).forEach(v => formData.append('assigned_classes', v));
        } else if (key === 'department') {
          // Send null if not set
          formData.append('department', value ? value : null);
        } else if (key === 'role') {
          // Ensure role is a valid string
          formData.append('role', roles.includes(value) ? value : 'staff');
        } else if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });
      // Always include user id
      formData.append('id', editingUser);
      await api.post('/users/edit/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
      setOpenEditUser(false);
      fetchAll();
    } catch (err) {
      let msg = 'Failed to update user.';
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setEditingUserLoading(false);
    }
  };

  // Plan upgrade/downgrade
  const handleUpgradePlan = async (newPlan) => {
    setUpgrading(true); setPlanError("");
    try {
      // In a real app, call a backend endpoint to change the plan
      setSnackbar({ open: true, message: `Plan change to '${newPlan}' would be processed here.`, severity: 'info' });
      // await api.post("/plans/upgrade/", { plan: newPlan });
      setPlan(newPlan);
      fetchAll();
    } catch {
      setPlanError("Failed to change plan.");
    } finally { setUpgrading(false); }
  };

  // Add this function to handle plan upgrade
  const handleUpgrade = (planKey, planPrice) => {
    navigate(`/payment?plan=${planKey}&amount=${planPrice}`);
  };

  // Show clear feedback if a user tries a forbidden action
  const handleForbiddenAction = (message = 'You do not have permission to perform this action.') => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  // DataGrid columns
  const columns = [
    {
      field: 'photo',
      headerName: 'Photo',
      width: 70,
      renderCell: (params) => params.value ? <Avatar src={params.value} alt="profile" /> : <Avatar>{params.row.username ? params.row.username[0].toUpperCase() : '?'}</Avatar>
    },
    { field: 'username', headerName: 'Username', flex: 1, renderCell: (params) => <Tooltip title="Username"><span>{params.value || '-'}</span></Tooltip> },
    { field: 'email', headerName: 'Email', flex: 1, renderCell: (params) => <Tooltip title="Email"><span>{params.value || '-'}</span></Tooltip> },
    { field: 'phone', headerName: 'Phone', flex: 1, renderCell: (params) => <span>{params.value || '-'}</span> },
    { field: 'job_title', headerName: 'Job Title', flex: 1, renderCell: (params) => <span>{params.value || '-'}</span> },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      valueGetter: (params) => {
        if (!params || !params.row) return '-';
        const depId = params.row.department;
        if (!depId) return '-';
        if (typeof depId === 'object' && depId.name) return depId.name;
        if (Array.isArray(departments)) {
          const dep = departments.find(d => String(d.id) === String(depId));
          return dep ? dep.name : '-';
        }
        return '-';
      },
      renderCell: (params) => <Tooltip title="Department"><span>{params.value || '-'}</span></Tooltip>
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      renderCell: (params) => (
        editRole.username === params.row.username ? (
          <Select
            value={editRole.role}
            onChange={e => setEditRole({ ...editRole, role: e.target.value })}
            onBlur={handleEditRole}
            autoFocus
            size="small"
          >
            {roles.map(role => (
              <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
            ))}
          </Select>
        ) : (
          <Chip
            label={params.value || '-'}
            color={params.value === 'admin' ? 'error' : 'primary'}
            onClick={() => setEditRole({ username: params.row.username, role: params.value })}
            icon={<EditIcon fontSize="small" />}
            sx={{ cursor: 'pointer' }}
          />
        )
      )
    },
    // Status column
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value === 'active' ? 'Active' : 'Inactive'}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    // Assigned Classes column
    {
      field: 'assigned_classes',
      headerName: 'Assigned Classes',
      flex: 2,
      valueGetter: (params) => {
        if (!params || !params.row || !Array.isArray(params.row.assigned_classes)) return '-';
        const names = params.row.assigned_classes.map(cid => {
          const c = Array.isArray(classes) ? classes.find(cls => String(cls.id) === String(cid)) : null;
          return c ? c.name : null;
        }).filter(Boolean);
        return names.length > 0 ? names.join(', ') : '-';
      },
      renderCell: (params) => <Tooltip title="Assigned Classes"><span>{params.value || '-'}</span></Tooltip>
    },
    // Actions column
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Edit User"><span><Button color="primary" startIcon={<EditIcon />} onClick={() => handleOpenEditUser(params.row)} size="small">Edit</Button></span></Tooltip>
          <Tooltip title="Remove User"><span><Button color="error" startIcon={<DeleteIcon />} onClick={() => setRemoveUser(params.row.username)} size="small">Remove</Button></span></Tooltip>
        </Box>
      ),
      width: 180
    }
  ];

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, mb: 4 }}>
      {/* Header with logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {/* Uncomment and set src if you have a logo */}
        {/* <Avatar src={logo} alt="Zenith ERP" sx={{ width: 56, height: 56, mr: 2 }} /> */}
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 1 }}>Zenith ERP Admin</Typography>
      </Box>
      <Grid container columns={12} spacing={3}>
        {/* Users Section */}
        <Grid gridColumn="span 7">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <GroupIcon color="primary" />
                <Typography variant="h6">User Management</Typography>
                {canManageUsers && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ ml: 'auto' }}
                  onClick={() => setOpenAddUser(true)}
                >
                  Add User
                </Button>
                )}
                {!canManageUsers && (
                  <Tooltip title="You do not have permission to add users.">
                    <span>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        sx={{ ml: 'auto' }}
                        disabled
                      >
                        Add User
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Box>
              {canManageUsers && (
                <>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TextField
                      label="Search"
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(0); }}
                      size="small"
                      sx={{ minWidth: 200 }}
                    />
                    <FormControl sx={{ minWidth: 150 }} size="small">
                      <InputLabel id="role-filter-label">Role</InputLabel>
                      <Select
                        labelId="role-filter-label"
                        value={roleFilter}
                        label="Role"
                        onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
                      >
                        <MenuItem value="">All Roles</MenuItem>
                        {roles.map(role => (
                          <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 150 }} size="small">
                      <InputLabel id="department-filter-label">Department</InputLabel>
                      <Select
                        labelId="department-filter-label"
                        value={departmentFilter}
                        label="Department"
                        onChange={e => { setDepartmentFilter(e.target.value); setPage(0); }}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departments.map(dep => (
                          <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  {/* Show plan/user limits above the user table */}
                  {dashboard && dashboard.plan_limits && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        User Limit: {dashboard.user_count} / {dashboard.plan_limits.max_users}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={dashboard.user_count / dashboard.plan_limits.max_users * 100}
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      />
                    </Box>
                  )}
                  {/* Audit Log Placeholder */}
                  <Box mb={2}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" color="primary">Audit Log</Typography>
                        <Typography variant="body2" color="text.secondary">Audit log display coming soon. All user actions will be tracked here.</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <DataGrid
                    autoHeight
                    rows={users.map(u => ({ ...u, id: u.id || u.user || u.staff || u.username || Math.random(), status: u.is_active !== false ? 'active' : 'inactive' }))}
                    columns={columns}
                    page={page}
                    pageSize={pageSize}
                    rowCount={totalUsers}
                    pagination
                    paginationMode="server"
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    rowsPerPageOptions={[5, 10, 20, 50, 100]}
                    loading={userLoading}
                    disableSelectionOnClick
                    sx={{ background: '#fafbfc', borderRadius: 2 }}
                    getRowId={row => row.id || row.user || row.staff || row.username || Math.random()}
                  />
                </>
              )}
              {!canManageUsers && (
                <Tooltip title="You do not have permission to view or manage users.">
                  <span>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <TextField label="Search" size="small" sx={{ minWidth: 200 }} disabled />
                      <FormControl sx={{ minWidth: 150 }} size="small" disabled>
                        <InputLabel id="role-filter-label">Role</InputLabel>
                        <Select labelId="role-filter-label" value="" label="Role" disabled>
                          <MenuItem value="">All Roles</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ minWidth: 150 }} size="small" disabled>
                        <InputLabel id="department-filter-label">Department</InputLabel>
                        <Select labelId="department-filter-label" value="" label="Department" disabled>
                          <MenuItem value="">All Departments</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <DataGrid
                      autoHeight
                      rows={[]}
                      columns={columns}
                      page={0}
                      pageSize={pageSize}
                      rowCount={0}
                      pagination
                      paginationMode="server"
                      rowsPerPageOptions={[5, 10, 20, 50, 100]}
                      loading={false}
                      disableSelectionOnClick
                      sx={{ background: '#fafbfc', borderRadius: 2, opacity: 0.5 }}
                      getRowId={row => row.id || row.user || row.staff || row.username || Math.random()}
                      components={{ NoRowsOverlay: () => <Typography sx={{ p: 2 }}>No permission to view users.</Typography> }}
                    />
                  </span>
                </Tooltip>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* Plan Management Section */}
        <Grid gridColumn="span 5">
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <WorkspacePremiumIcon color="secondary" />
                <Typography variant="h6">Plan Management</Typography>
              </Box>
              {planLoading ? <CircularProgress /> : (
                <>
                  <Typography variant="subtitle1"><strong>Current Plan:</strong> {plan}</Typography>
                  <Box mt={2}>
                    <Typography variant="subtitle2">Available Plans:</Typography>
                    <Box display="flex" flexDirection="column" gap={1} mt={1}>
                      {plans.map((p) => {
                        const isCurrentPlan = p.key === plan;
                        const formatPrice = (price, billingCycle, monthlyEquivalent) => {
                          if (price === null || price === undefined) return 'Custom';
                          if (price === 0) return 'Free';
                          if (billingCycle === 'annual' && monthlyEquivalent) {
                            return `₹${price.toLocaleString()}/year (~₹${monthlyEquivalent}/month)`;
                          }
                          return `₹${price.toLocaleString()}/${billingCycle === 'annual' ? 'year' : 'month'}`;
                        };
                        
                        return (
                          <Card 
                            key={p.key} 
                            sx={{ 
                              p: 1, 
                              border: isCurrentPlan ? '2px solid' : '1px solid',
                              borderColor: isCurrentPlan ? 'primary.main' : 'divider',
                              bgcolor: isCurrentPlan ? 'primary.50' : 'background.paper'
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: p.color }}>
                                  {p.name}
                                  {p.popular && <Chip label="Popular" size="small" color="primary" sx={{ ml: 1 }} />}
                                  {p.savings && <Chip label={p.savings} size="small" color="success" sx={{ ml: 1 }} />}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatPrice(p.price, p.billing_cycle, p.monthly_equivalent)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {p.max_users === null ? 'Unlimited' : p.max_users} users • {(p.storage_limit_mb / 1024).toFixed(1)} GB storage
                                </Typography>
                              </Box>
                        <Button
                                variant={isCurrentPlan ? "contained" : "outlined"}
                                size="small"
                                disabled={upgrading || isCurrentPlan}
                                onClick={() => {
                                  if (p.price > 0 && !isCurrentPlan) {
                                    navigate(`/payment?plan=${p.key}&amount=${p.price}`);
                                  } else if (!isCurrentPlan) {
                                    handleUpgrade(p.key, p.price);
                                  }
                                }}
                        >
                                {isCurrentPlan ? 'Current' : p.price === 0 ? 'Get Free' : 'Upgrade'}
                        </Button>
                            </Box>
                          </Card>
                        );
                      })}
                    </Box>
                  </Box>
                  {/* Plan features/limits */}
                  {dashboard && dashboard.plan_limits && (
                    <Box mt={2}>
                      <Typography variant="subtitle2">User Limit</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={dashboard.user_count / dashboard.plan_limits.max_users * 100}
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                      />
                      <Typography variant="body2">{dashboard.user_count} / {dashboard.plan_limits.max_users} users</Typography>
                      <Typography variant="subtitle2" mt={2}>Storage Limit</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={dashboard.storage_used_mb / dashboard.plan_limits.storage_limit_mb * 100}
                        color="warning"
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                      />
                      <Typography variant="body2">{dashboard.storage_used_mb} MB / {dashboard.plan_limits.storage_limit_mb} MB</Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          {/* Storage Usage Section */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <StorageIcon color="warning" />
                <Typography variant="h6">Storage Usage</Typography>
              </Box>
              {dashboard ? (
                <>
                  <LinearProgress
                    variant="determinate"
                    value={dashboard.storage_used_mb / dashboard.storage_limit_mb * 100}
                    color="primary"
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Typography variant="body2">Used: {dashboard.storage_used_mb} MB</Typography>
                  <Typography variant="body2">Limit: {dashboard.storage_limit_mb} MB</Typography>
                </>
              ) : <CircularProgress />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Add User Dialog */}
      <Dialog open={openAddUser} onClose={() => setOpenAddUser(false)}>
        <DialogTitle>Add User</DialogTitle>
          <DialogContent>
          <Box component="form" onSubmit={handleAddUser} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              value={userForm.username}
              onChange={handleUserFormChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              value={userForm.email}
              onChange={handleUserFormChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={userForm.password}
              onChange={handleUserFormChange}
            />
            <FormControl fullWidth error={!!rolesError || (roles.length === 0)} required sx={{ mt: 2 }}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                label="Role"
                name="role"
                value={roles.length > 0 && roles.includes(userForm.role) ? userForm.role : ''}
                onChange={handleUserFormChange}
                disabled={rolesLoading || roles.length === 0}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
                ))}
              </Select>
              {(rolesError || roles.length === 0) && (
                <FormHelperText>{rolesError || 'No roles available. Please check your login or backend.'}</FormHelperText>
              )}
            </FormControl>
            <Select
              name="assigned_classes"
              multiple
              value={userForm.assigned_classes}
              onChange={e => {
                const value = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                setUserForm({ ...userForm, assigned_classes: value });
              }}
              renderValue={selected => selected.map(id => {
                const c = classes.find(cls => cls.id === id);
                return c ? c.name : id;
              }).join(', ')}
              fullWidth
              sx={{ mt: 2 }}
            >
              {classes.map(cls => (
                <MenuItem key={cls.id} value={cls.id}>
                  <Checkbox checked={userForm.assigned_classes.indexOf(cls.id) > -1} />
                  <ListItemText primary={cls.name} />
                </MenuItem>
              ))}
            </Select>
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={userForm.department}
                onChange={handleUserFormChange}
                label="Department"
                required
              >
                <MenuItem value="">No Department</MenuItem>
                {departments.map(dep => (
                  <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => setUserForm({ ...userForm, photo: e.target.files[0] })}
              />
            </Button>
            <TextField margin="normal" fullWidth label="Phone" name="phone" value={userForm.phone} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="Address" name="address" value={userForm.address} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="Date of Birth" name="date_of_birth" type="date" InputLabelProps={{ shrink: true }} value={userForm.date_of_birth} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="Gender" name="gender" value={userForm.gender} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="Emergency Contact" name="emergency_contact" value={userForm.emergency_contact} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="Job Title" name="job_title" value={userForm.job_title} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="Joining Date" name="joining_date" type="date" InputLabelProps={{ shrink: true }} value={userForm.joining_date} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="Qualifications" name="qualifications" value={userForm.qualifications} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="Bio" name="bio" value={userForm.bio} onChange={handleUserFormChange} />
            <TextField margin="normal" fullWidth label="LinkedIn" name="linkedin" value={userForm.linkedin} onChange={handleUserFormChange} />
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setOpenAddUser(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={addingUser || rolesLoading || !!rolesError || roles.length === 0}>
                {addingUser ? <CircularProgress size={24} /> : "Add"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Edit User Dialog */}
      <Dialog open={openEditUser} onClose={() => setOpenEditUser(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditUser} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              name="username"
              value={editUserForm.username}
              disabled
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              value={editUserForm.email}
              disabled
            />
            <Select
              name="role"
              value={editUserForm.role}
              onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}
              fullWidth
              sx={{ mt: 2 }}
            >
              {roles.map(role => (
                <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
              ))}
            </Select>
            <Select
              name="assigned_classes"
              multiple
              value={editUserForm.assigned_classes}
              onChange={e => {
                const value = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                setEditUserForm({ ...editUserForm, assigned_classes: value });
              }}
              renderValue={selected => selected.map(id => {
                const c = classes.find(cls => cls.id === id);
                return c ? c.name : id;
              }).join(', ')}
              fullWidth
              sx={{ mt: 2 }}
            >
              {classes.map(cls => (
                <MenuItem key={cls.id} value={cls.id}>
                  <Checkbox checked={editUserForm.assigned_classes.indexOf(cls.id) > -1} />
                  <ListItemText primary={cls.name} />
                </MenuItem>
              ))}
            </Select>
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={editUserForm.department}
                onChange={e => setEditUserForm({ ...editUserForm, department: e.target.value })}
                label="Department"
                required
              >
                <MenuItem value="">No Department</MenuItem>
                {departments.map(dep => (
                  <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => setEditUserForm({ ...editUserForm, photo: e.target.files[0] })}
              />
            </Button>
            <TextField margin="normal" fullWidth label="Phone" name="phone" value={editUserForm.phone} onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })} />
            <TextField margin="normal" fullWidth label="Address" name="address" value={editUserForm.address} onChange={e => setEditUserForm({ ...editUserForm, address: e.target.value })} />
            <TextField margin="normal" fullWidth label="Date of Birth" name="date_of_birth" type="date" InputLabelProps={{ shrink: true }} value={editUserForm.date_of_birth} onChange={e => setEditUserForm({ ...editUserForm, date_of_birth: e.target.value })} />
            <TextField margin="normal" fullWidth label="Gender" name="gender" value={editUserForm.gender} onChange={e => setEditUserForm({ ...editUserForm, gender: e.target.value })} />
            <TextField margin="normal" fullWidth label="Emergency Contact" name="emergency_contact" value={editUserForm.emergency_contact} onChange={e => setEditUserForm({ ...editUserForm, emergency_contact: e.target.value })} />
            <TextField margin="normal" fullWidth label="Job Title" name="job_title" value={editUserForm.job_title} onChange={e => setEditUserForm({ ...editUserForm, job_title: e.target.value })} />
            <TextField margin="normal" fullWidth label="Joining Date" name="joining_date" type="date" InputLabelProps={{ shrink: true }} value={editUserForm.joining_date} onChange={e => setEditUserForm({ ...editUserForm, joining_date: e.target.value })} />
            <TextField margin="normal" fullWidth label="Qualifications" name="qualifications" value={editUserForm.qualifications} onChange={e => setEditUserForm({ ...editUserForm, qualifications: e.target.value })} />
            <TextField margin="normal" fullWidth label="Bio" name="bio" value={editUserForm.bio} onChange={e => setEditUserForm({ ...editUserForm, bio: e.target.value })} />
            <TextField margin="normal" fullWidth label="LinkedIn" name="linkedin" value={editUserForm.linkedin} onChange={e => setEditUserForm({ ...editUserForm, linkedin: e.target.value })} />
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setOpenEditUser(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={editingUserLoading}>
                {editingUserLoading ? <CircularProgress size={24} /> : "Save"}
              </Button>
            </DialogActions>
          </Box>
          </DialogContent>
      </Dialog>
      {/* Remove User Confirmation */}
      <Dialog open={!!removeUser} onClose={() => setRemoveUser(null)}>
        <DialogTitle>Remove User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove user <strong>{removeUser}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveUser(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleRemoveUser}>Remove</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Admin; 