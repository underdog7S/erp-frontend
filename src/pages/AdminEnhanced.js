import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box, Card, CardContent, Typography, Grid, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, CircularProgress, Chip, Avatar, LinearProgress, Checkbox, ListItemText, FormControl, InputLabel, FormHelperText, IconButton, Tooltip, Divider, Paper, Badge, Tabs, Tab, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon, Switch, FormControlLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Group as GroupIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Storage as StorageIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  LocalHospital as LocalHospitalIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminEnhanced = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    username: "", email: "", password: "", role: "staff", assigned_classes: [],
    photo: null, phone: "", address: "", date_of_birth: "", gender: "",
    emergency_contact: "", job_title: "", joining_date: "", qualifications: "", bio: "", linkedin: ""
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
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', role: '', assigned_classes: [] });
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserLoading, setEditingUserLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = userProfile.role || '';
  const navigate = useNavigate();

  // Old columns definition removed - now using simplified columns in renderUserManagement

  // Fetch data
  const fetchAll = async () => {
    setUserLoading(true);
    setPlanLoading(true);
    setUserError("");
    setPlanError("");
    try {
      const params = { page: page + 1, page_size: pageSize };
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
      setUserLoading(false);
      setPlanLoading(false);
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

  // Handlers
  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setUserError("");
    try {
      const formData = new FormData();
      Object.entries(userForm).forEach(([key, value]) => {
        if (key === 'assigned_classes') {
          value.forEach(v => formData.append('assigned_classes', v));
        } else if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });
      await api.post('/users/add/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUserForm({
        username: "", email: "", password: "", role: "staff", assigned_classes: [],
        photo: null, phone: "", address: "", date_of_birth: "", gender: "",
        emergency_contact: "", job_title: "", joining_date: "", qualifications: "", bio: "", linkedin: ""
      });
      setOpenAddUser(false);
      setSnackbar({ open: true, message: 'User added successfully!', severity: 'success' });
      fetchAll();
    } catch (err) {
      let msg = 'Failed to add user.';
      if (err.response?.data?.error) {
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
      setSnackbar({ open: true, message: 'User removed successfully.', severity: 'success' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to remove user.', severity: 'error' });
    } finally {
      setRemoveUser(null);
    }
  };

  const handleOpenEditUser = (user) => {
    setEditUserForm({
      username: user.username,
      email: user.email,
      role: user.role,
      assigned_classes: user.assigned_classes || [],
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

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditingUserLoading(true);
    try {
      const formData = new FormData();
      Object.entries(editUserForm).forEach(([key, value]) => {
        if (key === 'assigned_classes') {
          value.forEach(v => formData.append('assigned_classes', v));
        } else if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });
      await api.post('/users/edit/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
      setOpenEditUser(false);
      fetchAll();
    } catch (err) {
      let msg = 'Failed to update user.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setEditingUserLoading(false);
    }
  };

  const handleUpgrade = (planKey, planPrice) => {
    if (planPrice > 0) {
      navigate(`/payment?plan=${planKey}&amount=${planPrice}`);
    } else {
      handleUpgradePlan(planKey);
    }
  };

  const handleUpgradePlan = async (newPlan) => {
    setUpgrading(true);
    try {
      await api.post('/plans/upgrade/', { plan: newPlan });
      setSnackbar({ open: true, message: 'Plan upgraded successfully!', severity: 'success' });
      fetchAll();
    } catch {
      setSnackbar({ open: true, message: 'Failed to upgrade plan.', severity: 'error' });
    } finally {
      setUpgrading(false);
    }
  };

  // Export Data Handler
  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await api.get("/admin/export-data/", {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `zenith-erp-export-${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: "Data exported successfully!", severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to export data. Please try again.", severity: 'error' });
    } finally {
      setExportLoading(false);
    }
  };

  // Import Data Handler
  const handleImportData = async () => {
    if (!importFile) {
      setSnackbar({ open: true, message: "Please select a file to import", severity: 'warning' });
      return;
    }

    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await api.post("/admin/import-data/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSnackbar({ open: true, message: "Data imported successfully!", severity: 'success' });
      setImportFile(null);
      fetchAll(); // Refresh data
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.error || "Failed to import data", severity: 'error' });
    } finally {
      setImportLoading(false);
    }
  };

  // File input handler
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };

  // Dashboard Stats Component
  const DashboardStats = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid gridColumn="span 3">
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  {dashboard?.user_count || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Total Users
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: { xs: 40, md: 56 }, 
                height: { xs: 40, md: 56 } 
              }}>
                <PeopleIcon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid gridColumn="span 3">
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  {dashboard?.plan_limits?.max_users || '∞'}
                </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  User Limit
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: { xs: 40, md: 56 }, 
                height: { xs: 40, md: 56 } 
              }}>
                <SecurityIcon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid gridColumn="span 3">
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  {dashboard?.storage_used_mb || 0} MB
                </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Storage Used
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: { xs: 40, md: 56 }, 
                height: { xs: 40, md: 56 } 
              }}>
                <StorageIcon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid gridColumn="span 3">
        <Card sx={{ 
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  {dashboard?.current_plan?.name || 'Free'}
                </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}>
                  Current Plan
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: { xs: 40, md: 56 }, 
                height: { xs: 40, md: 56 } 
              }}>
                <StarIcon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Tab Panel Component
  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  // User Management Tab
  const renderUserManagement = () => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Role mapping function to convert numeric IDs to string roles
    const mapRoleValue = (role) => {
      if (typeof role === 'number') {
        // Map numeric roles to string roles based on the data structure
        const roleMap = {
          1: 'admin',
          2: 'teacher', 
          3: 'student',
          4: 'accountant',
          5: 'staff'
        };
        return roleMap[role] || 'staff';
      }
      return role || 'staff';
    };

    const handleEditUser = (user) => {
      // Check if current user has admin privileges
      if (userRole !== 'admin' && userRole !== '1') {
        setSnackbar({ open: true, message: 'Only administrators can edit users.', severity: 'warning' });
        return;
      }
      setSelectedUser(user);
      setEditForm({
        username: user.username && user.username !== 'N/A' ? user.username : '',
        email: user.email && user.email !== 'No email' ? user.email : '',
        phone: user.phone && user.phone !== 'N/A' ? user.phone : '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: mapRoleValue(user.role),
        department: user.department && user.department !== 'N/A' ? user.department : null,
        job_title: user.job_title && user.job_title !== 'N/A' ? user.job_title : '',
        is_active: user.is_active !== false,
        assigned_classes: user.assigned_classes || [],
      });
      setEditDialogOpen(true);
    };

    const handleSaveUser = async () => {
      try {
        // Build payload with required fields and fallbacks
        const payload = {
          id: selectedUser?.id || editForm?.id,
          username: editForm.username || '',
          email: editForm.email || '',
          role: editForm.role, // ensure this is valid
          is_active: editForm.is_active !== false,
          phone: editForm.phone || '',
          first_name: editForm.first_name || '',
          last_name: editForm.last_name || '',
          department: editForm.department ? editForm.department : null,
          job_title: editForm.job_title || '',
          assigned_classes: editForm.assigned_classes || [],
          // add any other required fields here
        };
        // Remove any 'N/A' or 'No email' values from payload
        Object.keys(payload).forEach(key => {
          if (payload[key] === 'N/A' || payload[key] === 'No email') {
            payload[key] = '';
          }
        });
        const response = await fetch('/api/users/edit/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          setEditDialogOpen(false);
          setSelectedUser(null);
          // Use setTimeout to delay fetchAll to prevent focus issues
          setTimeout(() => {
            fetchAll();
          }, 100);
          setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
        } else {
          const error = await response.json();
          setSnackbar({ open: true, message: `Error: ${error.message || error.error || 'Failed to update user'}`, severity: 'error' });
        }
      } catch (error) {
        console.error('Error updating user:', error);
        setSnackbar({ open: true, message: 'Error updating user', severity: 'error' });
      }
    };

    const handleDeleteUser = async (userId) => {
      // Check if current user has admin privileges
      if (userRole !== 'admin' && userRole !== '1') {
        setSnackbar({ open: true, message: 'Only administrators can delete users.', severity: 'warning' });
        return;
      }
      
      if (window.confirm('Are you sure you want to delete this user?')) {
        try {
          const response = await fetch(`/api/users/delete/${userId}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });

          if (response.ok) {
            fetchAll();
            setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
          } else {
            setSnackbar({ open: true, message: 'Error deleting user', severity: 'error' });
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          setSnackbar({ open: true, message: 'Error deleting user', severity: 'error' });
        }
      }
    };

    // Simplified columns for better UX
    const columns = [
      {
        field: 'name',
        headerName: '👤 Name',
        width: 200,
        renderCell: (params) => {
          const user = params.row && params.row.user ? params.row.user : {};
          let name = 'No Name';
          if (user.first_name && user.last_name) {
            name = `${user.first_name} ${user.last_name}`;
          } else if (user.first_name) {
            name = user.first_name;
          } else if (user.last_name) {
            name = user.last_name;
          } else if (user.username) {
            name = user.username;
          } else if (user.email) {
            name = user.email.split('@')[0];
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <Box component="span" sx={{ fontWeight: 500 }}>
                {name}
              </Box>
            </Box>
          );
        }
      },
      {
        field: 'username',
        headerName: '🔑 Username',
        width: 150,
        valueGetter: (params) => (params.row && params.row.user && params.row.user.username) ? params.row.user.username : 'No Username',
        renderCell: (params) => <span>{params.value || 'No Username'}</span>
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 200,
        valueGetter: (params) => (params.row && params.row.user && params.row.user.email) ? params.row.user.email : 'No Email',
        renderCell: (params) => <span>{params.value || 'No Email'}</span>
      },
      {
        field: 'department',
        headerName: 'Department',
        width: 150,
        valueGetter: (params) => (params.row && params.row.department && params.row.department.name) ? params.row.department.name : 'No Department',
        renderCell: (params) => <span>{params.value || 'No Department'}</span>
      },
      {
        field: 'role',
        headerName: '🎭 Role',
        width: 120,
        renderCell: (params) => {
          const role = params.row && params.row.role ? params.row.role : 'No Role';
          const roleColors = {
            admin: '#d32f2f',
            teacher: '#1976d2',
            student: '#388e3c',
            accountant: '#f57c00',
            staff: '#7b1fa2'
          };
          let roleLabel = 'No Role';
          if (typeof role === 'string' && role.trim()) {
            roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
          }
          return (
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                bgcolor: roleColors[roleLabel.toLowerCase()] || '#757575',
                color: 'white',
                fontWeight: 500
              }}
            />
          );
        }
      },
      {
        field: 'status',
        headerName: '📊 Status',
        width: 100,
        renderCell: (params) => (
          <Chip
            label={params.row && params.row.is_active ? 'Active' : 'Inactive'}
            size="small"
            color={params.row && params.row.is_active ? 'success' : 'default'}
            variant={params.row && params.row.is_active ? 'filled' : 'outlined'}
          />
        )
      },
      {
        field: 'actions',
        headerName: '⚙️ Actions',
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(userRole === 'admin' || userRole === '1') && (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleEditUser(params.row)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteUser(params.row.id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
            {(userRole !== 'admin' && userRole !== '1') && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Admin only
              </Typography>
            )}
          </Box>
        )
      }
    ];

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            👥 User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (userRole !== 'admin' && userRole !== '1') {
                setSnackbar({ open: true, message: 'Only administrators can add new users.', severity: 'warning' });
                return;
              }
              setSnackbar({ open: true, message: 'Add user functionality coming soon!', severity: 'info' });
            }}
            disabled={userRole !== 'admin' && userRole !== '1'}
          >
            Add User
          </Button>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">
                  {users.length}
                </Typography>
                <Typography variant="body2">Total Users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">
                  {users.filter(u => u.is_active).length}
                </Typography>
                <Typography variant="body2">Active Users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">
                  {users.filter(u => !u.is_active).length}
                </Typography>
                <Typography variant="body2">Inactive Users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">
                  {users.filter(u => u.role === 'admin' || (u.role && u.role.name === 'admin')).length}
                </Typography>
                <Typography variant="body2">Administrators</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search users..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select label="Role" defaultValue="">
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="accountant">Accountant</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" defaultValue="">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Users Table */}
        <Card sx={{ overflow: 'hidden' }}>
          <DataGrid
            rows={users.map(u => {
              // Handle different possible data structures
              let userData = {
                id: u.id, // This should be the UserProfile ID from the API
                username: '',
                email: '',
                phone: '',
                job_title: '',
                department: '',
                role: '',
                assigned_classes: [],
                is_active: true,
                first_name: '',
                last_name: '',
                ...u // Keep all original data
              };

              // Try to extract user information from different possible structures
              if (u.user) {
                // If data is nested under 'user' key
                userData = {
                  ...userData,
                  username: u.user.username || u.username || 'No Username',
                  email: u.user.email || u.email || 'No Email',
                  phone: u.user.phone || u.phone || 'N/A',
                  job_title: u.user.job_title || u.job_title || 'N/A',
                  department: u.user.department || u.department || 'N/A',
                  role: mapRoleValue(u.user.role || u.role),
                  assigned_classes: u.user.assigned_classes || u.assigned_classes || [],
                  is_active: u.user.is_active !== undefined ? u.user.is_active : true,
                  first_name: u.user.first_name || u.first_name || '',
                  last_name: u.user.last_name || u.last_name || '',
                };
              } else if (u.staff) {
                // If data is nested under 'staff' key
                userData = {
                  ...userData,
                  username: u.staff.username || u.username || 'No Username',
                  email: u.staff.email || u.email || 'No Email',
                  phone: u.staff.phone || u.phone || 'N/A',
                  job_title: u.staff.job_title || u.job_title || 'N/A',
                  department: u.staff.department || u.department || 'N/A',
                  role: mapRoleValue(u.staff.role || u.role),
                  assigned_classes: u.staff.assigned_classes || u.assigned_classes || [],
                  is_active: u.staff.is_active !== undefined ? u.staff.is_active : true,
                  first_name: u.staff.first_name || u.first_name || '',
                  last_name: u.staff.last_name || u.last_name || '',
                };
              } else {
                // Direct data structure
                userData = {
                  ...userData,
                  username: u.username || 'No Username',
                  email: u.email || 'No Email',
                  phone: u.phone || 'N/A',
                  job_title: u.job_title || 'N/A',
                  department: u.department || 'N/A',
                  role: mapRoleValue(u.role),
                  assigned_classes: u.assigned_classes || [],
                  is_active: u.is_active !== undefined ? u.is_active : true,
                  first_name: u.first_name || '',
                  last_name: u.last_name || '',
                };
              }

              return userData;
            })}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e0e0e0',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'grey.50',
                borderBottom: '2px solid #e0e0e0',
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: 'grey.50',
              }
            }}
          />
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
          <DialogContent sx={{ pt: 3 }}>
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
              disabled={!editForm.username}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography variant="h3" fontWeight="bold" sx={{ 
          mb: 1, 
          color: 'primary.main',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
        }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{
          fontSize: { xs: '0.875rem', md: '1rem' }
        }}>
          Manage users, plans, and system settings
        </Typography>
      </Box>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Main Content Tabs */}
      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', overflow: 'auto' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ px: { xs: 1, sm: 2, md: 3 } }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              icon={<DashboardIcon />} 
              label="Overview" 
              iconPosition="start"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="User Management" 
              iconPosition="start"
            />
            <Tab 
              icon={<WorkspacePremiumIcon />} 
              label="Plan Management" 
              iconPosition="start"
            />
            <Tab 
              icon={<AnalyticsIcon />} 
              label="Analytics" 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Settings" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h5" sx={{ mb: 3 }}>System Overview</Typography>
            <Grid container spacing={2}>
              <Grid gridColumn="span 6">
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddUser(true)}
                        size="small"
                      >
                        Add User
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        size="small"
                        onClick={handleExportData}
                        disabled={exportLoading}
                      >
                        {exportLoading ? "Exporting..." : "Export Data"}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        size="small"
                        onClick={() => document.getElementById('import-file-input').click()}
                        disabled={importLoading}
                      >
                        {importLoading ? "Importing..." : "Import Data"}
                      </Button>
                      <input
                        id="import-file-input"
                        type="file"
                        accept=".zip,.json,.csv"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid gridColumn="span 6">
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>System Health</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>User Limit Usage</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={dashboard ? (dashboard.user_count / dashboard.plan_limits.max_users * 100) : 0}
                        sx={{ height: 8, borderRadius: 4, mb: 2 }}
                      />
                      <Typography variant="body2" sx={{ mb: 1 }}>Storage Usage</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={dashboard ? (dashboard.storage_used_mb / dashboard.storage_limit_mb * 100) : 0}
                        color="warning"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderUserManagement()}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Plan Management</Typography>
            {planLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
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
                    <Grid gridColumn="span 4" key={p.key}>
                      <Card 
                        sx={{ 
                          p: { xs: 2, md: 3 },
                          border: isCurrentPlan ? '2px solid' : '1px solid',
                          borderColor: isCurrentPlan ? 'primary.main' : 'divider',
                          bgcolor: isCurrentPlan ? 'primary.50' : 'background.paper',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            transition: 'transform 0.2s ease-in-out',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          }
                        }}
                      >
                        {p.popular && (
                          <Chip 
                            label="Popular" 
                            color="primary" 
                            sx={{ 
                              position: 'absolute', 
                              top: 16, 
                              right: 16,
                              fontWeight: 'bold'
                            }} 
                          />
                        )}
                        <Box textAlign="center" sx={{ mb: 3 }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 'bold', 
                            color: p.color, 
                            mb: 1,
                            fontSize: { xs: '1.5rem', md: '2rem' }
                          }}>
                            {p.name}
                          </Typography>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 'bold', 
                            mb: 1,
                            fontSize: { xs: '1rem', md: '1.5rem' }
                          }}>
                            {formatPrice(p.price, p.billing_cycle, p.monthly_equivalent)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {p.max_users === null ? 'Unlimited' : p.max_users} users • {(p.storage_limit_mb / 1024).toFixed(1)} GB storage
                          </Typography>
                        </Box>
                        <Button
                          variant={isCurrentPlan ? "contained" : "outlined"}
                          fullWidth
                          size="large"
                          disabled={upgrading || isCurrentPlan}
                          onClick={() => {
                            if (p.price > 0 && !isCurrentPlan) {
                              navigate(`/payment?plan=${p.key}&amount=${p.price}`);
                            } else if (!isCurrentPlan) {
                              handleUpgrade(p.key, p.price);
                            }
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          {isCurrentPlan ? 'Current Plan' : p.price === 0 ? 'Get Free' : 'Upgrade'}
                        </Button>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Analytics</Typography>
            <Grid container spacing={2}>
              <Grid gridColumn="span 6">
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>User Growth</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          +12%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This month
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid gridColumn="span 6">
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Storage Usage</Typography>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {dashboard?.storage_used_mb || 0} MB
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={dashboard ? (dashboard.storage_used_mb / dashboard.storage_limit_mb * 100) : 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        of {dashboard?.storage_limit_mb || 0} MB used
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h5" sx={{ mb: 3 }}>System Settings</Typography>
            <Grid container spacing={2}>
              <Grid gridColumn="span 6">
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>General Settings</Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        onClick={handleExportData}
                        disabled={exportLoading}
                      >
                        {exportLoading ? "Exporting..." : "Export System Data"}
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<UploadIcon />}
                        onClick={() => document.getElementById('import-file-input-2').click()}
                        disabled={importLoading}
                      >
                        {importLoading ? "Importing..." : "Import System Data"}
                      </Button>
                      <input
                        id="import-file-input-2"
                        type="file"
                        accept=".zip,.json,.csv"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <Button variant="outlined" startIcon={<SecurityIcon />}>
                        Security Settings
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid gridColumn="span 6">
                <Card>
                  <CardContent>
                    <Typography variant="h5" sx={{ mb: 3 }}>System Information</Typography>
                    <Grid container spacing={2}>
                      <Grid gridColumn="span 6">
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Server Status</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Version:</strong> 2.1.0
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Environment:</strong> Production
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                            </Typography>
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                <strong>Status:</strong>
                              </Typography>
                              <Chip label="Active" color="success" size="small" />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid gridColumn="span 6">
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Database</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Type:</strong> PostgreSQL
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Size:</strong> 2.4 GB
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Connections:</strong> 12/50
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={24} 
                              sx={{ mt: 1 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Card>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Add User"
          onClick={() => setOpenAddUser(true)}
        />
        <SpeedDialAction
          icon={<DownloadIcon />}
          tooltipTitle="Export Data"
          onClick={handleExportData}
        />
        <SpeedDialAction
          icon={<RefreshIcon />}
          tooltipTitle="Refresh"
          onClick={fetchAll}
        />
      </SpeedDial>

      {/* Dialogs */}
      {/* Add User Dialog */}
      <Dialog 
        open={openAddUser} 
        onClose={() => setOpenAddUser(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="body1" fontWeight="bold" fontSize="1.25rem">Add New User</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new user account with appropriate permissions
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddUser} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid gridColumn="span 6">
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={userForm.username}
                  onChange={handleUserFormChange}
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                />
              </Grid>
              <Grid gridColumn="span 6">
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
              </Grid>
              <Grid gridColumn="span 6">
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
                      <MenuItem key={role} value={role}>
                        {typeof role === 'string' ? role.charAt(0).toUpperCase() + role.slice(1) : role}
                      </MenuItem>
                    ))}
                  </Select>
                  {(rolesError || roles.length === 0) && (
                    <FormHelperText>{rolesError || 'No roles available.'}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" sx={{ mb: 2 }}>Additional Information</Typography>
            <Grid container spacing={2}>
              <Grid gridColumn="span 6">
                <TextField
                  margin="normal"
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={userForm.phone}
                  onChange={handleUserFormChange}
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  margin="normal"
                  fullWidth
                  label="Job Title"
                  name="job_title"
                  value={userForm.job_title}
                  onChange={handleUserFormChange}
                />
              </Grid>
              <Grid gridColumn="span 12">
                <TextField
                  margin="normal"
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={userForm.address}
                  onChange={handleUserFormChange}
                />
              </Grid>
            </Grid>
            
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={() => setOpenAddUser(false)} variant="outlined">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={addingUser || rolesLoading || !!rolesError || roles.length === 0}
                startIcon={addingUser ? <CircularProgress size={20} /> : null}
              >
                {addingUser ? "Adding..." : "Add User"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog 
        open={openEditUser} 
        onClose={() => setOpenEditUser(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="body1" fontWeight="bold" fontSize="1.25rem">Edit User</Typography>
          <Typography variant="body2" color="text.secondary">
            Update user information and permissions
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditUser} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Username"
                  value={editUserForm.username || ''}
                  onChange={(e) => setEditUserForm({...editUserForm, username: e.target.value})}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editUserForm.email || ''}
                  onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Phone"
                  value={editUserForm.phone || ''}
                  onChange={(e) => setEditUserForm({...editUserForm, phone: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Job Title"
                  value={editUserForm.job_title || ''}
                  onChange={(e) => setEditUserForm({...editUserForm, job_title: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="First Name"
                  value={editUserForm.first_name || ''}
                  onChange={(e) => setEditUserForm({...editUserForm, first_name: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editUserForm.last_name || ''}
                  onChange={(e) => setEditUserForm({...editUserForm, last_name: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 6">
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editUserForm.role || ''}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
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
              <Grid gridColumn="span 6">
                <TextField
                  fullWidth
                  label="Department"
                  value={editUserForm.department || ''}
                  onChange={(e) => setEditUserForm({...editUserForm, department: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid gridColumn="span 12">
                <FormControlLabel
                  control={
                    <Switch
                      checked={editUserForm.is_active}
                      onChange={(e) => setEditUserForm({...editUserForm, is_active: e.target.checked})}
                    />
                  }
                  label="Active User"
                />
              </Grid>
            </Grid>
            
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={() => setOpenEditUser(false)} variant="outlined">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={editingUserLoading}
                startIcon={editingUserLoading ? <CircularProgress size={20} /> : null}
              >
                {editingUserLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
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
          <Button onClick={() => setRemoveUser(null)} variant="outlined">
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleRemoveUser}>
            Remove User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminEnhanced; 
