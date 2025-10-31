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
import { 
  Add as AddIcon, Cake as CakeIcon, Work as WorkIcon, EmojiEvents as TrophyIcon, 
  TrendingUp as TrendingUpIcon, AttachMoney as MoneyIcon, 
  Warning as WarningIcon, Event as EventIcon, Notifications as NotificationsIcon,
  People as PeopleIcon, History as HistoryIcon, ArrowForward as ArrowForwardIcon,
  Download as DownloadIcon, Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, LinearProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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
    assigned_classes: [],
    // Personal Info fields
    address: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    joining_date: '',
    qualifications: '',
    bio: '',
    linkedin: ''
  });
  const [editingUserLoading, setEditingUserLoading] = useState(false);
  
  // Remove user states
  const [removeUser, setRemoveUser] = useState(null);
  const [removeUserLoading, setRemoveUserLoading] = useState(false);
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Employee Analytics states
  const [employeeAnalytics, setEmployeeAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetailDialog, setEmployeeDetailDialog] = useState(false);
  
  // Fee Analytics states
  const [feeAnalytics, setFeeAnalytics] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [oldBalanceSummary, setOldBalanceSummary] = useState(null);
  const [upcomingDues, setUpcomingDues] = useState([]);
  
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
    assigned_classes: [],
    // Personal Info fields
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    job_title: '',
    joining_date: '',
    qualifications: '',
    bio: '',
    linkedin: ''
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
    // Fetch education data (classes and departments) - try to fetch regardless of industry
    // This allows staff/teachers to be assigned classes even if tenant industry isn't set to education
    const fetchEducationData = async () => {
      try {
        const classesRes = await api.get("/education/classes/");
        if (classesRes.data && Array.isArray(classesRes.data)) {
          setClasses(classesRes.data);
        }
      } catch (err) {
        console.log('Could not fetch classes:', err);
        setClasses([]);
      }
      
      try {
        const deptRes = await api.get("/education/departments/");
        if (deptRes.data && Array.isArray(deptRes.data)) {
          setDepartments(deptRes.data);
        }
      } catch (err) {
        console.log('Could not fetch departments:', err);
        setDepartments([]);
      }
    };
    
    fetchEducationData();
    
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
    
    // Fetch employee analytics
    fetchEmployeeAnalytics();
    // Fetch fee analytics
    fetchFeeAnalytics();
    // Fetch old balance summary
    fetchOldBalanceSummary();
    // Fetch upcoming dues
    fetchUpcomingDues();
  }, []);
  
  const fetchEmployeeAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get('/users/employee-analytics/');
      setEmployeeAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching employee analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchFeeAnalytics = async () => {
    setFeeLoading(true);
    try {
      // Fetch fee data from education analytics
      const [analyticsRes, installmentsRes, paymentsRes] = await Promise.allSettled([
        api.get('/education/analytics/').catch(err => {
          // Handle 403 gracefully - expected for some roles
          if (err?.response?.status === 403) {
            return { status: 'rejected', reason: err };
          }
          throw err;
        }),
        api.get('/education/installments/').catch(err => {
          if (err?.response?.status === 403) {
            return { status: 'rejected', reason: err };
          }
          throw err;
        }),
        api.get('/education/fee-payments/').catch(err => {
          if (err?.response?.status === 403) {
            return { status: 'rejected', reason: err };
          }
          throw err;
        })
      ]);
      
      // Handle analytics response
      let analytics = {};
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value && analyticsRes.value.data) {
        analytics = analyticsRes.value.data;
      }
      
      // Handle installments response
      let installments = [];
      if (installmentsRes.status === 'fulfilled' && installmentsRes.value && installmentsRes.value.data) {
        installments = Array.isArray(installmentsRes.value.data) 
          ? installmentsRes.value.data 
          : (installmentsRes.value.data?.results || []);
      }
      
      // Handle payments response
      let payments = [];
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value && paymentsRes.value.data) {
        payments = Array.isArray(paymentsRes.value.data) 
          ? paymentsRes.value.data 
          : (paymentsRes.value.data?.results || []);
      }
      
      // Calculate fee statistics
      const totalDue = installments.reduce((sum, inst) => sum + Number(inst.due_amount || 0), 0);
      const totalPaid = payments.reduce((sum, pay) => sum + Number(pay.amount_paid || 0), 0);
      const totalRemaining = installments.reduce((sum, inst) => sum + Number(inst.remaining_amount || 0), 0);
      
      // Class-wise fee breakdown
      const classWiseFees = {};
      installments.forEach(inst => {
        const className = inst.student?.assigned_class?.name || 
                         (inst.student?.assigned_class?.name) ||
                         (typeof inst.student?.assigned_class === 'string' ? inst.student.assigned_class : 'Not Assigned');
        if (!classWiseFees[className]) {
          classWiseFees[className] = { due: 0, paid: 0, remaining: 0 };
        }
        classWiseFees[className].due += Number(inst.due_amount || 0);
        classWiseFees[className].remaining += Number(inst.remaining_amount || 0);
      });
      
      payments.forEach(pay => {
        const className = pay.student?.assigned_class?.name || 
                         (typeof pay.student?.assigned_class === 'string' ? pay.student.assigned_class : 'Not Assigned');
        if (!classWiseFees[className]) {
          classWiseFees[className] = { due: 0, paid: 0, remaining: 0 };
        }
        classWiseFees[className].paid += Number(pay.amount_paid || 0);
      });
      
      // Payment status distribution
      const paymentStatus = {
        paid: installments.filter(inst => inst.status === 'PAID' || Number(inst.remaining_amount || 0) <= 0).length,
        pending: installments.filter(inst => inst.status === 'PENDING' && Number(inst.remaining_amount || 0) > 0).length,
        overdue: installments.filter(inst => inst.is_overdue && Number(inst.remaining_amount || 0) > 0).length
      };
      
      // Always set analytics, even if empty (so charts can show empty state)
      setFeeAnalytics({
        totalDue: totalDue,
        totalPaid: totalPaid,
        totalRemaining: totalRemaining,
        classWiseFees: Object.entries(classWiseFees).map(([name, data]) => ({
          name,
          ...data
        })),
        paymentStatus: paymentStatus,
        collectionRate: totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(1) : 0,
        hasData: installments.length > 0 || payments.length > 0
      });
    } catch (err) {
      console.error('Error fetching fee analytics:', err);
      // Set empty analytics instead of null so UI can still render
      setFeeAnalytics({
        totalDue: 0,
        totalPaid: 0,
        totalRemaining: 0,
        classWiseFees: [],
        paymentStatus: { paid: 0, pending: 0, overdue: 0 },
        collectionRate: 0,
        hasData: false
      });
    } finally {
      setFeeLoading(false);
    }
  };

  const fetchOldBalanceSummary = async () => {
    try {
      const res = await api.get('/education/old-balances/summary/');
      setOldBalanceSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch old balance summary:', err);
      setOldBalanceSummary(null);
    }
  };

  const fetchUpcomingDues = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 14); // Next 14 days
      
      const res = await api.get('/education/installments/', {
        params: {
          due_date__gte: today.toISOString().split('T')[0],
          due_date__lte: nextWeek.toISOString().split('T')[0],
          status: 'PENDING'
        }
      });
      
      const installments = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setUpcomingDues(installments.slice(0, 10)); // Top 10 upcoming
    } catch (err) {
      console.error('Failed to fetch upcoming dues:', err);
      setUpcomingDues([]);
    }
  };

  const handleEditUser = (user) => {
    // Check if current user has admin privileges
    if (userRole !== 'admin' && userRole !== '1') {
      setSnackbar({ open: true, message: 'Only administrators can edit users.', severity: 'warning' });
      return;
    }
    setSelectedUser(user);
    // Extract assigned class IDs - handle both array of objects and array of IDs
    let assignedClassIds = [];
    if (user.assigned_classes) {
      if (Array.isArray(user.assigned_classes)) {
        assignedClassIds = user.assigned_classes.map(cls => 
          typeof cls === 'object' && cls !== null ? cls.id : cls
        );
      }
    }
    
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
      assigned_classes: assignedClassIds,
      // Personal Info fields
      address: user.address || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      emergency_contact: user.emergency_contact || '',
      joining_date: user.joining_date || '',
      qualifications: user.qualifications || '',
      bio: user.bio || '',
      linkedin: user.linkedin || ''
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
      
      // Send User ID if available, otherwise send UserProfile ID (backend will handle both)
      const userId = user.user?.id || user.id;
      
      const payload = {
        user_id: userId,
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
        assigned_classes: addUserForm.assigned_classes,
        // Personal Info fields
        phone: addUserForm.phone || '',
        address: addUserForm.address || '',
        date_of_birth: addUserForm.date_of_birth || null,
        gender: addUserForm.gender || '',
        emergency_contact: addUserForm.emergency_contact || '',
        job_title: addUserForm.job_title || '',
        joining_date: addUserForm.joining_date || null,
        qualifications: addUserForm.qualifications || '',
        bio: addUserForm.bio || '',
        linkedin: addUserForm.linkedin || ''
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
          assigned_classes: [],
          // Personal Info fields
          phone: '',
          address: '',
          date_of_birth: '',
          gender: '',
          emergency_contact: '',
          job_title: '',
          joining_date: '',
          qualifications: '',
          bio: '',
          linkedin: ''
        });
        fetchAll(); // Refresh the user list
      }
    } catch (error) {
      console.error('Error adding user:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Extract error message properly
      let errorMessage = 'Failed to create user';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : JSON.stringify(error.response.data.error);
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = JSON.stringify(error.response.data.errors);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
      
      // Add Personal Info fields
      formData.append('address', editForm.address || '');
      formData.append('date_of_birth', editForm.date_of_birth || '');
      formData.append('gender', editForm.gender || '');
      formData.append('emergency_contact', editForm.emergency_contact || '');
      formData.append('joining_date', editForm.joining_date || '');
      formData.append('qualifications', editForm.qualifications || '');
      formData.append('bio', editForm.bio || '');
      formData.append('linkedin', editForm.linkedin || '');
      
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

        {/* Employee Analytics Section */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                📊 Employee Analytics & Insights
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={fetchEmployeeAnalytics}
                disabled={analyticsLoading}
              >
                {analyticsLoading ? <CircularProgress size={20} /> : 'Refresh'}
              </Button>
            </Box>
            
            {analyticsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading employee analytics...
                </Typography>
              </Box>
            ) : employeeAnalytics ? (
              <Grid container spacing={3}>
                {/* Statistics Cards */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Employees
                      </Typography>
                      <Typography variant="h4">
                        {employeeAnalytics.statistics?.total_employees || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Employees
                      </Typography>
                      <Typography variant="h4">
                        {employeeAnalytics.statistics?.active_employees || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        New Hires (This Month)
                      </Typography>
                      <Typography variant="h4">
                        {employeeAnalytics.statistics?.new_hires_this_month || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Inactive Employees
                      </Typography>
                      <Typography variant="h4">
                        {employeeAnalytics.statistics?.inactive_employees || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Birthdays Today */}
                {employeeAnalytics.birthdays_today && employeeAnalytics.birthdays_today.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText', mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <CakeIcon sx={{ fontSize: 32 }} />
                          <Typography variant="h6">
                            🎉 Birthdays Today!
                          </Typography>
                        </Box>
                        <Grid container spacing={2}>
                          {employeeAnalytics.birthdays_today.map((emp) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={emp.id}>
                              <Card variant="outlined" sx={{ bgcolor: 'white' }}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                                      {emp.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="h6">{emp.name}</Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {emp.job_title} • {emp.department}
                                      </Typography>
                                      <Typography variant="body2" color="primary">
                                        Turning {emp.age + 1} today! 🎂
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Upcoming Birthdays */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CakeIcon color="primary" />
                        <Typography variant="h6">
                          Upcoming Birthdays (Next 30 Days)
                        </Typography>
                      </Box>
                      {employeeAnalytics.upcoming_birthdays && employeeAnalytics.upcoming_birthdays.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Days Until</TableCell>
                                <TableCell>Age</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {employeeAnalytics.upcoming_birthdays.slice(0, 5).map((emp) => (
                                <TableRow key={emp.id} hover>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        {emp.name.charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                          {emp.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {emp.job_title}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={`${emp.days_until} days`} 
                                      color={emp.days_until <= 7 ? 'error' : 'primary'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>Turning {emp.age + 1}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          No upcoming birthdays in the next 30 days
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Work Anniversaries */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrophyIcon color="primary" />
                        <Typography variant="h6">
                          Work Anniversaries (Next 30 Days)
                        </Typography>
                      </Box>
                      {employeeAnalytics.upcoming_anniversaries && employeeAnalytics.upcoming_anniversaries.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Days Until</TableCell>
                                <TableCell>Years</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {employeeAnalytics.upcoming_anniversaries.slice(0, 5).map((emp) => (
                                <TableRow key={emp.id} hover>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                                        {emp.name.charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                          {emp.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {emp.job_title}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={`${emp.days_until} days`} 
                                      color={emp.days_until <= 7 ? 'error' : 'success'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>{emp.years_of_service} years</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          No upcoming anniversaries in the next 30 days
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Gender Distribution */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Gender Distribution
                      </Typography>
                      {employeeAnalytics.gender_distribution && (
                        <Box sx={{ mt: 2 }}>
                          {Object.entries(employeeAnalytics.gender_distribution).map(([gender, count]) => {
                            const total = Object.values(employeeAnalytics.gender_distribution).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            return (
                              <Box key={gender} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">{gender}</Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {count} ({percentage.toFixed(1)}%)
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Role Distribution */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Role Distribution
                      </Typography>
                      {employeeAnalytics.role_distribution && employeeAnalytics.role_distribution.length > 0 ? (
                        <Box sx={{ mt: 2 }}>
                          {employeeAnalytics.role_distribution.map((item) => {
                            const total = employeeAnalytics.statistics?.total_employees || 1;
                            const percentage = (item.count / total) * 100;
                            return (
                              <Box key={item.role} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">{item.role}</Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {item.count} ({percentage.toFixed(1)}%)
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  color="secondary"
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          No role data available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Age Distribution */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Age Distribution
                      </Typography>
                      {employeeAnalytics.age_distribution && (
                        <Box sx={{ mt: 2 }}>
                          {Object.entries(employeeAnalytics.age_distribution).map(([ageGroup, count]) => {
                            const total = Object.values(employeeAnalytics.age_distribution).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            return (
                              <Box key={ageGroup} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">{ageGroup} years</Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {count} ({percentage.toFixed(1)}%)
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  color="info"
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Years of Service Distribution */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Years of Service
                      </Typography>
                      {employeeAnalytics.service_years_distribution && (
                        <Box sx={{ mt: 2 }}>
                          {Object.entries(employeeAnalytics.service_years_distribution).map(([range, count]) => {
                            const total = Object.values(employeeAnalytics.service_years_distribution).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            return (
                              <Box key={range} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">{range}</Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {count} ({percentage.toFixed(1)}%)
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  color="warning"
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Employee Directory with Search */}
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          👥 Employee Directory
                        </Typography>
                        <TextField
                          size="small"
                          label="Search employees..."
                          variant="outlined"
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          placeholder="Search by name, email, phone, emergency contact, job title..."
                          sx={{ minWidth: 300 }}
                        />
                      </Box>
                      
                      {employeeAnalytics.employee_directory && employeeAnalytics.employee_directory.length > 0 ? (
                        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Emergency Contact</TableCell>
                                <TableCell>Job Title</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {employeeAnalytics.employee_directory
                                .filter((emp) => {
                                  if (!employeeSearch) return true;
                                  const searchLower = employeeSearch.toLowerCase();
                                  return (
                                    emp.full_name.toLowerCase().includes(searchLower) ||
                                    emp.email.toLowerCase().includes(searchLower) ||
                                    emp.phone.toLowerCase().includes(searchLower) ||
                                    emp.emergency_contact.toLowerCase().includes(searchLower) ||
                                    emp.job_title.toLowerCase().includes(searchLower) ||
                                    emp.department.toLowerCase().includes(searchLower) ||
                                    emp.role.toLowerCase().includes(searchLower) ||
                                    (emp.address && emp.address.toLowerCase().includes(searchLower)) ||
                                    (emp.qualifications && emp.qualifications.toLowerCase().includes(searchLower))
                                  );
                                })
                                .map((emp) => (
                                  <TableRow key={emp.id} hover>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                          {emp.full_name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography variant="body2" fontWeight="bold">
                                          {emp.full_name}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>{emp.email}</TableCell>
                                    <TableCell>{emp.phone}</TableCell>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {emp.emergency_contact}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{emp.job_title}</TableCell>
                                    <TableCell>{emp.department}</TableCell>
                                    <TableCell>{emp.role}</TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={emp.is_active ? 'Active' : 'Inactive'} 
                                        color={emp.is_active ? 'success' : 'default'}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                          setSelectedEmployee(emp);
                                          setEmployeeDetailDialog(true);
                                        }}
                                      >
                                        View Details
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          No employees found
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                No employee analytics data available. Please ensure employees have their date of birth and joining dates filled in.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Employee Detail Dialog */}
        <Dialog
          open={employeeDetailDialog}
          onClose={() => setEmployeeDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            👤 Employee Details: {selectedEmployee?.full_name}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedEmployee && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
                      {selectedEmployee.full_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h5">{selectedEmployee.full_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEmployee.job_title} • {selectedEmployee.department}
                      </Typography>
                      <Chip 
                        label={selectedEmployee.is_active ? 'Active' : 'Inactive'} 
                        color={selectedEmployee.is_active ? 'success' : 'default'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedEmployee.email}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedEmployee.phone}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Emergency Contact</Typography>
                  <Typography variant="body1" fontWeight="bold" color="error">
                    {selectedEmployee.emergency_contact}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                  <Typography variant="body1">{selectedEmployee.gender}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{selectedEmployee.address}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1">
                    {selectedEmployee.date_of_birth ? `${selectedEmployee.date_of_birth} (Age: ${selectedEmployee.age || 'N/A'})` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Joining Date</Typography>
                  <Typography variant="body1">
                    {selectedEmployee.joining_date ? `${selectedEmployee.joining_date} (${selectedEmployee.years_of_service || 0} years)` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                  <Typography variant="body1">{selectedEmployee.role}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{selectedEmployee.department}</Typography>
                </Grid>
                {selectedEmployee.qualifications && selectedEmployee.qualifications !== 'N/A' && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">Qualifications</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {selectedEmployee.qualifications}
                    </Typography>
                  </Grid>
                )}
                {selectedEmployee.bio && selectedEmployee.bio !== 'N/A' && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {selectedEmployee.bio}
                    </Typography>
                  </Grid>
                )}
                {selectedEmployee.linkedin && selectedEmployee.linkedin !== 'N/A' && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">LinkedIn</Typography>
                    <Typography variant="body1">
                      <a href={selectedEmployee.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                        {selectedEmployee.linkedin}
                      </a>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmployeeDetailDialog(false)}>Close</Button>
            {selectedEmployee && (
              <Button 
                variant="contained" 
                onClick={() => {
                  const user = users.find(u => u.id === selectedEmployee.id);
                  if (user) {
                    handleEditUser(user);
                    setEmployeeDetailDialog(false);
                  }
                }}
              >
                Edit Employee
              </Button>
            )}
          </DialogActions>
        </Dialog>

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
            
            {/* ASSIGNED CLASSES FIELD - Show for teacher, student, and staff */}
            {(editForm.role === 'teacher' || editForm.role === 'student' || editForm.role === 'staff') && (
              <Grid gridColumn="span 12">
                <Box sx={{ mt: 3, p: 3, backgroundColor: '#e3f2fd', borderRadius: 2, border: '2px solid #1976d2' }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, textAlign: 'center', mb: 2 }}>
                    🎓 Assign Classes
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1976d2', textAlign: 'center', mb: 2 }}>
                    Select the classes for this {editForm.role}. Hold down Ctrl (or Cmd on Mac) to select multiple classes.
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="assigned-classes-label-edit">Assigned Classes</InputLabel>
                    <Select
                      labelId="assigned-classes-label-edit"
                      multiple
                      value={editForm.assigned_classes || []}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setEditForm(prev => ({...prev, assigned_classes: newValue}));
                      }}
                      label="Assigned Classes"
                      MenuProps={{ 
                        disablePortal: true, 
                        PaperProps: { sx: { maxHeight: 300, zIndex: 2200 } },
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        transformOrigin: { vertical: 'top', horizontal: 'left' }
                      }}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) {
                          return <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Select classes...</Typography>;
                        }
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const classObj = classes.find(c => c.id === value || String(c.id) === String(value));
                              return (
                                <Chip 
                                  key={value} 
                                  label={classObj ? classObj.name : `Class ${value}`} 
                                  size="small" 
                                  color="primary" 
                                />
                              );
                            })}
                          </Box>
                        );
                      }}
                    >
                      {classes && classes.length > 0 ? (
                        classes.map((classObj) => (
                          <MenuItem key={classObj.id} value={classObj.id}>
                            <Checkbox checked={(editForm.assigned_classes || []).some(id => String(id) === String(classObj.id))} />
                            <ListItemText primary={classObj.name || `Class ${classObj.id}`} />
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                            No classes available. Please create classes in the Education module first.
                          </Typography>
                        </MenuItem>
                      )}
                    </Select>
                    <FormHelperText>
                      {editForm.role === 'teacher' ? 'Required: Teachers must be assigned to at least one class' : `Optional: Assign classes for ${editForm.role}`}
                      {classes.length === 0 && (
                        <span style={{ display: 'block', marginTop: '4px' }}>
                          💡 Tip: Create classes in the Education Module → Classes tab first.
                        </span>
                      )}
                    </FormHelperText>
                  </FormControl>
                </Box>
              </Grid>
            )}
            
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

              {/* Personal Info Section in Edit Form */}
              <Grid gridColumn="span 12">
                <Box sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 2, 
                  border: '1px solid #ddd' 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid gridColumn="span 6">
                      <TextField
                        fullWidth
                        label="Phone"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))}
                        margin="normal"
                      />
                    </Grid>
                    <Grid gridColumn="span 6">
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={editForm.date_of_birth || ''}
                        onChange={(e) => setEditForm(prev => ({...prev, date_of_birth: e.target.value}))}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid gridColumn="span 6">
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={editForm.gender || ''}
                          onChange={(e) => setEditForm(prev => ({...prev, gender: e.target.value}))}
                          label="Gender"
                          MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
                        >
                          <MenuItem value="">Select Gender</MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid gridColumn="span 6">
                      <TextField
                        fullWidth
                        label="Joining Date"
                        type="date"
                        value={editForm.joining_date || ''}
                        onChange={(e) => setEditForm(prev => ({...prev, joining_date: e.target.value}))}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid gridColumn="span 6">
                      <TextField
                        fullWidth
                        label="Emergency Contact"
                        value={editForm.emergency_contact || ''}
                        onChange={(e) => setEditForm(prev => ({...prev, emergency_contact: e.target.value}))}
                        margin="normal"
                        placeholder="Name and phone number"
                      />
                    </Grid>
                    <Grid gridColumn="span 12">
                      <TextField
                        fullWidth
                        label="Address"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm(prev => ({...prev, address: e.target.value}))}
                        margin="normal"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid gridColumn="span 12">
                      <TextField
                        fullWidth
                        label="Qualifications"
                        value={editForm.qualifications || ''}
                        onChange={(e) => setEditForm(prev => ({...prev, qualifications: e.target.value}))}
                        margin="normal"
                        multiline
                        rows={2}
                        placeholder="Enter educational qualifications, certifications, etc."
                      />
                    </Grid>
                    <Grid gridColumn="span 12">
                      <TextField
                        fullWidth
                        label="Bio"
                        value={editForm.bio || ''}
                        onChange={(e) => setEditForm(prev => ({...prev, bio: e.target.value}))}
                        margin="normal"
                        multiline
                        rows={3}
                        placeholder="Brief biography or description"
                      />
                    </Grid>
                    <Grid gridColumn="span 12">
                      <TextField
                        fullWidth
                        label="LinkedIn Profile URL"
                        value={editForm.linkedin || ''}
                        onChange={(e) => setEditForm(prev => ({...prev, linkedin: e.target.value}))}
                        margin="normal"
                        placeholder="https://linkedin.com/in/username"
                        helperText="Enter the full LinkedIn profile URL"
                      />
                    </Grid>
                  </Grid>
                </Box>
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

      {/* Fee Analytics & Charts Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MoneyIcon sx={{ color: 'primary.main' }} />
            💰 Fee Analytics & Collection Insights
          </Typography>
          
          {feeLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : feeAnalytics ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Fee Collection Overview Pie Chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Fee Collection Overview
                    </Typography>
                    {feeAnalytics.hasData && feeAnalytics.totalDue > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Collected', value: Number(feeAnalytics.totalPaid), fill: '#4caf50' },
                              { name: 'Remaining', value: Number(feeAnalytics.totalRemaining), fill: '#ff9800' }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#4caf50" />
                            <Cell fill="#ff9800" />
                          </Pie>
                          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          No fee data available yet
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Fee structures and payments will appear here once configured
                        </Typography>
                      </Box>
                    )}
                    {feeAnalytics.hasData ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Total Due:</strong> ₹{Number(feeAnalytics.totalDue).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          <strong>Collected:</strong> ₹{Number(feeAnalytics.totalPaid).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="body2" color="warning.main">
                          <strong>Remaining:</strong> ₹{Number(feeAnalytics.totalRemaining).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Collection Rate:</strong> {feeAnalytics.collectionRate}%
                        </Typography>
                      </Box>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>

              {/* Payment Status Distribution */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Status Distribution
                    </Typography>
                    {feeAnalytics.hasData && feeAnalytics.paymentStatus && (
                      feeAnalytics.paymentStatus.paid > 0 || feeAnalytics.paymentStatus.pending > 0 || feeAnalytics.paymentStatus.overdue > 0
                    ) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Paid', value: feeAnalytics.paymentStatus.paid || 0, fill: '#4caf50' },
                              { name: 'Pending', value: feeAnalytics.paymentStatus.pending || 0, fill: '#2196f3' },
                              { name: 'Overdue', value: feeAnalytics.paymentStatus.overdue || 0, fill: '#f44336' }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#4caf50" />
                            <Cell fill="#2196f3" />
                            <Cell fill="#f44336" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          No payment data available yet
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Payment status will appear here once payments are recorded
                        </Typography>
                      </Box>
                    )}
                    {feeAnalytics.hasData && feeAnalytics.paymentStatus ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="success.main">
                          <strong>Paid:</strong> {feeAnalytics.paymentStatus.paid || 0} installments
                        </Typography>
                        <Typography variant="body2" color="primary.main">
                          <strong>Pending:</strong> {feeAnalytics.paymentStatus.pending || 0} installments
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          <strong>Overdue:</strong> {feeAnalytics.paymentStatus.overdue || 0} installments
                        </Typography>
                      </Box>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>

              {/* Old Balance Summary Card */}
              {oldBalanceSummary && oldBalanceSummary.total_outstanding > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ bgcolor: 'warning.light' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon />
                        Outstanding Old Balances
                      </Typography>
                      <Typography variant="h4" color="error" sx={{ mb: 1 }}>
                        ₹{Number(oldBalanceSummary.total_outstanding).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {oldBalanceSummary.total_students_with_balance} students have balances from previous years
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ArrowForwardIcon />}
                          onClick={() => window.location.href = '/education?tab=2&subtab=old-balances'}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Collection Rate Performance Card */}
              {feeAnalytics.hasData && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Collection Performance
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h3" color={Number(feeAnalytics.collectionRate) >= 80 ? 'success.main' : Number(feeAnalytics.collectionRate) >= 50 ? 'warning.main' : 'error.main'}>
                          {feeAnalytics.collectionRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Collection Rate
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Number(feeAnalytics.collectionRate)}
                          sx={{ mt: 2, height: 8, borderRadius: 1 }}
                          color={Number(feeAnalytics.collectionRate) >= 80 ? 'success' : Number(feeAnalytics.collectionRate) >= 50 ? 'warning' : 'error'}
                        />
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Target: 80%</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {Number(feeAnalytics.collectionRate) >= 80 ? '✓ On Target' : `${(80 - Number(feeAnalytics.collectionRate)).toFixed(1)}% below target`}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Class-wise Fee Collection Bar Chart */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Class-wise Fee Collection
                    </Typography>
                    {feeAnalytics.classWiseFees && feeAnalytics.classWiseFees.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={feeAnalytics.classWiseFees.map(cls => ({
                            name: cls.name,
                            Due: Number(cls.due || 0),
                            Paid: Number(cls.paid || 0),
                            Remaining: Number(cls.remaining || 0)
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                          <Legend />
                          <Bar dataKey="Due" fill="#9e9e9e" />
                          <Bar dataKey="Paid" fill="#4caf50" />
                          <Bar dataKey="Remaining" fill="#ff9800" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No class-wise fee data available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Class-wise Fee Table */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Class-wise Fee Breakdown
                    </Typography>
                    {feeAnalytics.classWiseFees && feeAnalytics.classWiseFees.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Class</strong></TableCell>
                              <TableCell align="right"><strong>Total Due (₹)</strong></TableCell>
                              <TableCell align="right"><strong>Paid (₹)</strong></TableCell>
                              <TableCell align="right"><strong>Remaining (₹)</strong></TableCell>
                              <TableCell align="right"><strong>Collection Rate</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {feeAnalytics.classWiseFees.map((cls, idx) => {
                              const totalDue = Number(cls.due || 0);
                              const totalPaid = Number(cls.paid || 0);
                              const remaining = Number(cls.remaining || 0);
                              const rate = totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(1) : 0;
                              
                              return (
                                <TableRow key={idx} hover>
                                  <TableCell><strong>{cls.name}</strong></TableCell>
                                  <TableCell align="right">₹{totalDue.toLocaleString('en-IN')}</TableCell>
                                  <TableCell align="right" sx={{ color: 'success.main' }}>
                                    ₹{totalPaid.toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell align="right" sx={{ color: 'warning.main' }}>
                                    ₹{remaining.toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip 
                                      label={`${rate}%`} 
                                      color={rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                              <TableCell><strong>Total</strong></TableCell>
                              <TableCell align="right">
                                <strong>₹{Number(feeAnalytics.totalDue).toLocaleString('en-IN')}</strong>
                              </TableCell>
                              <TableCell align="right" sx={{ color: 'success.main' }}>
                                <strong>₹{Number(feeAnalytics.totalPaid).toLocaleString('en-IN')}</strong>
                              </TableCell>
                              <TableCell align="right" sx={{ color: 'warning.main' }}>
                                <strong>₹{Number(feeAnalytics.totalRemaining).toLocaleString('en-IN')}</strong>
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${feeAnalytics.collectionRate}%`} 
                                  color={Number(feeAnalytics.collectionRate) >= 80 ? 'success' : Number(feeAnalytics.collectionRate) >= 50 ? 'warning' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No fee data available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Loading fee analytics...
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Alerts Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: 'primary.main' }} />
            ⚡ Quick Actions & Alerts
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Quick Actions */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<MoneyIcon />}
                      onClick={() => window.location.href = '/education?tab=2'}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Manage Fee Payments
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<HistoryIcon />}
                      onClick={() => window.location.href = '/education?tab=2&subtab=old-balances'}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      View Old Balances
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<PeopleIcon />}
                      onClick={() => window.location.href = '/education?tab=0'}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Manage Students
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={() => setAddUserDialogOpen(true)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Add New User
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={() => window.location.href = '/education?tab=analytics'}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Generate Reports
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Dues & Alerts */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ color: 'warning.main' }} />
                    Upcoming Fee Dues (Next 14 Days)
                  </Typography>
                  {upcomingDues.length > 0 ? (
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', mt: 2 }}>
                      {upcomingDues.map((due, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            borderLeft: '3px solid',
                            borderColor: 'warning.main'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {due.student?.name || 'Unknown Student'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {due.fee_structure?.fee_type || 'Fee'} - Installment {due.installment_number}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="body2" fontWeight="bold" color="warning.main">
                                ₹{Number(due.remaining_amount || due.due_amount).toLocaleString('en-IN')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(due.due_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                      <Button
                        size="small"
                        fullWidth
                        variant="text"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => window.location.href = '/education?tab=2'}
                        sx={{ mt: 1 }}
                      >
                        View All Dues
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No upcoming dues in the next 14 days
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Old Balance Alert */}
            {oldBalanceSummary && oldBalanceSummary.total_outstanding > 0 && (
              <Grid size={{ xs: 12 }}>
                <Alert 
                  severity="warning" 
                  icon={<HistoryIcon />}
                  sx={{ mb: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => window.location.href = '/education?tab=2&subtab=old-balances'}
                    >
                      View Details
                    </Button>
                  }
                >
                  <Typography variant="subtitle2">
                    Outstanding Old Balances: ₹{Number(oldBalanceSummary.total_outstanding).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption">
                    {oldBalanceSummary.total_students_with_balance} students have outstanding balances from previous academic years
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Overdue Alerts */}
            {feeAnalytics && feeAnalytics.paymentStatus && feeAnalytics.paymentStatus.overdue > 0 && (
              <Grid size={{ xs: 12 }}>
                <Alert 
                  severity="error" 
                  icon={<WarningIcon />}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => window.location.href = '/education?tab=2'}
                    >
                      Take Action
                    </Button>
                  }
                >
                  <Typography variant="subtitle2">
                    {feeAnalytics.paymentStatus.overdue} Overdue Installments
                  </Typography>
                  <Typography variant="caption">
                    Immediate attention required for overdue fee payments
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

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
                    ₹4,500/year
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    25 users • 5.0 GB storage
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
                    ₹8,999/year
                          </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    100 users • 20.0 GB storage
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
                    ₹19,999/year
                        </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Unlimited users • 50.0 GB storage
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
            
            {/* Assigned Classes Section - Show for teacher, student, and staff roles */}
            {(addUserForm.role === 'teacher' || addUserForm.role === 'student' || addUserForm.role === 'staff') && (
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
                    Select the classes for this {addUserForm.role}. Hold down Ctrl (or Cmd on Mac) to select multiple classes.
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="assigned-classes-label-add">Assigned Classes</InputLabel>
                    <Select
                      labelId="assigned-classes-label-add"
                      multiple
                      value={addUserForm.assigned_classes || []}
                      onChange={(e) => setAddUserForm(prev => ({...prev, assigned_classes: e.target.value}))}
                      label="Assigned Classes"
                      MenuProps={{ 
                        disablePortal: true, 
                        PaperProps: { sx: { maxHeight: 300, zIndex: 2200 } },
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        transformOrigin: { vertical: 'top', horizontal: 'left' }
                      }}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) {
                          return <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Select classes...</Typography>;
                        }
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const classObj = classes.find(c => c.id === value || String(c.id) === String(value));
                              return (
                                <Chip key={value} label={classObj?.name || `Class ${value}`} size="small" />
                              );
                            })}
                          </Box>
                        );
                      }}
                    >
                      {classes && classes.length > 0 ? (
                        classes.map((classObj) => (
                          <MenuItem key={classObj.id} value={classObj.id}>
                            <Checkbox checked={(addUserForm.assigned_classes || []).some(id => String(id) === String(classObj.id))} />
                            <ListItemText primary={classObj.name || `Class ${classObj.id}`} />
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                            {classes.length === 0 ? 'No classes available. Please create classes in the Education module first.' : 'Loading classes...'}
                          </Typography>
                        </MenuItem>
                      )}
                    </Select>
                    {classes.length === 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        💡 Tip: Create classes in the Education Module → Classes tab before assigning them here.
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              </Grid>
            )}

            {/* Personal Info Section */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: 'grey.300',
                mt: 2
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={addUserForm.phone}
                      onChange={(e) => setAddUserForm(prev => ({...prev, phone: e.target.value}))}
                      margin="normal"
                      placeholder="Enter phone number"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={addUserForm.date_of_birth}
                      onChange={(e) => setAddUserForm(prev => ({...prev, date_of_birth: e.target.value}))}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={addUserForm.gender}
                        onChange={(e) => setAddUserForm(prev => ({...prev, gender: e.target.value}))}
                        label="Gender"
                        MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
                      >
                        <MenuItem value="">Select Gender</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      value={addUserForm.job_title}
                      onChange={(e) => setAddUserForm(prev => ({...prev, job_title: e.target.value}))}
                      margin="normal"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Joining Date"
                      type="date"
                      value={addUserForm.joining_date}
                      onChange={(e) => setAddUserForm(prev => ({...prev, joining_date: e.target.value}))}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Emergency Contact"
                      value={addUserForm.emergency_contact}
                      onChange={(e) => setAddUserForm(prev => ({...prev, emergency_contact: e.target.value}))}
                      margin="normal"
                      placeholder="Name and phone number"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={addUserForm.address}
                      onChange={(e) => setAddUserForm(prev => ({...prev, address: e.target.value}))}
                      margin="normal"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Qualifications"
                      value={addUserForm.qualifications}
                      onChange={(e) => setAddUserForm(prev => ({...prev, qualifications: e.target.value}))}
                      margin="normal"
                      multiline
                      rows={2}
                      placeholder="Enter educational qualifications, certifications, etc."
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Bio"
                      value={addUserForm.bio}
                      onChange={(e) => setAddUserForm(prev => ({...prev, bio: e.target.value}))}
                      margin="normal"
                      multiline
                      rows={3}
                      placeholder="Brief biography or description"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="LinkedIn Profile URL"
                      value={addUserForm.linkedin}
                      onChange={(e) => setAddUserForm(prev => ({...prev, linkedin: e.target.value}))}
                      margin="normal"
                      placeholder="https://linkedin.com/in/username"
                      helperText="Enter the full LinkedIn profile URL"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
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