import React, { useState, useMemo, useEffect } from "react";
import api, { logout } from "../services/api";
import { useQuery } from 'react-query';
import { Card, CardContent, Typography, Grid, Box, Button, Alert, Avatar, CircularProgress, LinearProgress, Container } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorageIcon from '@mui/icons-material/Storage';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessIcon from '@mui/icons-material/Business';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';
import { saveAs } from 'file-saver';
import Snackbar from '@mui/material/Snackbar';
import { QuickStats, AttendanceChart, FeeCollectionChart, ClassPerformanceChart, StaffDistributionChart } from '../components/DashboardCharts';
import { format } from 'date-fns';
import Tooltip from '@mui/material/Tooltip';
import { hasPermission, PERMISSIONS } from '../permissions';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { fetchPlans, changePlan, fetchUserMe, getRazorpaySetupStatus, getStoredUser } from '../services/api';
import PricingModal from '../components/PricingModal';
import RazorpaySetupWizard from '../components/RazorpaySetupWizard';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SchoolIcon from '@mui/icons-material/School';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HotelIcon from '@mui/icons-material/Hotel';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import LaunchIcon from '@mui/icons-material/Launch';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const Dashboard = () => {
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [upgrading, setUpgrading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showRazorpaySetup, setShowRazorpaySetup] = useState(false);

  // Get user profile from localStorage at component level
  const userProfile = getStoredUser();
  // Handle role - could be string or object with name property
  const userRole = typeof userProfile.role === 'string' 
    ? userProfile.role 
    : (userProfile.role?.name || userProfile.role || '');
  const userIndustry = userProfile.industry || '';
  const isEducation = userIndustry.toLowerCase() === 'education';
  
  // Check if user is admin - more comprehensive check
  const isAdmin = useMemo(() => {
    const roleStr = typeof userRole === 'string' ? userRole.toLowerCase() : '';
    const roleName = userProfile?.role?.name?.toLowerCase() || '';
    const roleObj = typeof userProfile?.role === 'object' ? userProfile?.role?.name?.toLowerCase() : '';
    return roleStr === 'admin' || roleName === 'admin' || roleObj === 'admin' || 
           userProfile?.role === 'admin' || String(userProfile?.role).toLowerCase() === 'admin';
  }, [userRole, userProfile]);

  // React Query Fetching
  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery(
    'dashboardStats',
    () => api.get("/dashboard/").then(res => res.data)
  );

  const { data: alerts = [] } = useQuery(
    'alerts',
    () => api.get("/alerts/").then(res => res.data)
  );

  const { data: plans = [] } = useQuery(
    'plans',
    () => fetchPlans().catch(() => [])
  );

  const { data: razorpaySetupStatus, refetch: checkRazorpaySetup } = useQuery(
    'razorpayStatus',
    async () => {
      try {
        return await getRazorpaySetupStatus();
      } catch (e) {
        return {
          is_configured: false,
          has_key_id: false,
          has_key_secret: false,
          has_webhook_secret: false,
          is_enabled: false,
          setup_completed: false,
          setup_steps: []
        };
      }
    }
  );

  // Education data queries
  const { data: eduSummary } = useQuery('eduSummary', () => api.get("/education/admin-summary/").then(res => res.data).catch(() => ({})), { enabled: isEducation, retry: false });
  const { data: attendance = [], refetch: refetchAttendance } = useQuery('attendance', () => api.get("/education/staff-attendance/").then(res => res.data).catch(() => []), { enabled: isEducation, retry: false });
  const { data: classStats = [] } = useQuery('classStats', () => api.get("/education/analytics/class-stats/").then(res => res.data).catch(() => []), { enabled: isEducation, retry: false });
  const { data: monthlyReport, isLoading: loadingAnalytics } = useQuery(['monthlyReport', selectedMonth], () => api.get(`/education/analytics/monthly-report/?month=${selectedMonth}`).then(res => res.data).catch(() => null), { enabled: isEducation, retry: false });
  const { data: attendanceTrendsData = [] } = useQuery('attendanceTrends', () => api.get("/education/analytics/attendance-trends/").then(res => res.data).catch(() => []), { enabled: isEducation, retry: false });
  const { data: staffDistributionData = [] } = useQuery('staffDistribution', () => api.get("/education/analytics/staff-distribution/").then(res => res.data).catch(() => []), { enabled: isEducation, retry: false });
  const { data: feeCollectionData = [] } = useQuery('feeCollection', () => api.get("/education/analytics/fee-collection/").then(res => res.data).catch(() => []), { enabled: isEducation, retry: false });
  const { data: classPerformanceData = [] } = useQuery('classPerformance', () => api.get("/education/analytics/class-performance/").then(res => res.data).catch(() => []), { enabled: isEducation, retry: false });
  const { data: validStaffIds = [] } = useQuery('validStaffIds', () => api.get('/education/staff/').then(res => Array.isArray(res.data) ? res.data.map(staff => staff.id) : []).catch(() => []), { enabled: isEducation, retry: false });

  useEffect(() => {
    // Listen for plan upgrade event
    const handlePlanChanged = () => {
      setSnackbar({ open: true, message: 'Plan upgraded successfully!', severity: 'success' });
    };
    window.addEventListener('planChanged', handlePlanChanged);
    return () => window.removeEventListener('planChanged', handlePlanChanged);
  }, []);

  const loading = loadingStats;
  const error = statsError ? "Failed to load dashboard. Please login again." : "";

  if (loading) return <Box sx={{p:4, textAlign:'center'}}><Typography variant="h6">Loading dashboard...</Typography></Box>;
  if (error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={logout}>Login</Button>}>{error}</Alert>;
  if (!stats) return null;

  const handleCheckIn = async () => {

    // Only allow check-in for education industry
    if (!userIndustry || userIndustry.toLowerCase() !== 'education') {
      setSnackbar({ open: true, message: 'Check-in is only available for education industry.', severity: 'info' });
      return;
    }

    setCheckingIn(true);
    try {
      const user = getStoredUser();
      const staff_id = user.id || user.user_id;
      const department_id = user.department_id || user.department || user.assigned_department;
      if (!staff_id || !department_id) {
        setSnackbar({ open: true, message: 'Your profile is missing staff or department info. Please contact admin.', severity: 'error' });
        setCheckingIn(false);
        return;
      }
      if (!validStaffIds.includes(Number(staff_id))) {
        setSnackbar({ open: true, message: 'Your staff profile is invalid or missing. Please contact admin.', severity: 'error' });
        setCheckingIn(false);
        return;
      }
      await api.post("/education/staff-attendance/", {
        staff_id: staff_id,
        department_id,
        date: new Date().toISOString().slice(0,10),
        check_in: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      });
      refetchAttendance();
      setSnackbar({ open: true, message: 'Check-in successful!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Check-in failed!', severity: 'error' });
    } finally {
      setCheckingIn(false);
    }
  };
  const handleCheckOut = async (attendanceId) => {
    // Only allow check-out for education industry
    if (!userIndustry || userIndustry.toLowerCase() !== 'education') {
      setSnackbar({ open: true, message: 'Check-out is only available for education industry.', severity: 'info' });
      return;
    }

    setCheckingIn(true);
    try {
      const user = getStoredUser();
      const staff_id = user.id || user.user_id;
      const department_id = user.department_id || user.department || user.assigned_department;
      if (!staff_id || !department_id) {
        setSnackbar({ open: true, message: 'Your profile is missing staff or department info. Please contact admin.', severity: 'error' });
        setCheckingIn(false);
        return;
      }
      if (!validStaffIds.includes(Number(staff_id))) {
        setSnackbar({ open: true, message: 'Your staff profile is invalid or missing. Please contact admin.', severity: 'error' });
        setCheckingIn(false);
        return;
      }
      await api.put(`/education/staff-attendance/${attendanceId}/`, {
        staff_id: staff_id,
        department_id,
        check_out: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      });
      refetchAttendance();
      setSnackbar({ open: true, message: 'Check-out successful!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Check-out failed!', severity: 'error' });
    } finally {
      setCheckingIn(false);
    }
  };

  // Export handlers
  const handleExportClassStats = async () => {
    try {
      const res = await api.get('/education/analytics/class-stats/export/', { responseType: 'blob' });
      saveAs(res.data, 'class_analytics.csv');
    } catch {
      alert('Failed to export class analytics.');
    }
  };
  const handleExportMonthlyReport = async () => {
    try {
      const res = await api.get(`/education/analytics/monthly-report/export/?month=${selectedMonth}`, { responseType: 'blob' });
      saveAs(res.data, `monthly_report_${selectedMonth}.csv`);
    } catch {
      alert('Failed to export monthly report.');
    }
  };

  const canManageAttendance = hasPermission(userProfile, PERMISSIONS.MANAGE_ATTENDANCE);
  const canManageUsers = hasPermission(userProfile, PERMISSIONS.MANAGE_USERS);
  const isFreePlan = (userProfile && userProfile.plan && String(userProfile.plan).toLowerCase() === 'free') || (stats && stats.plan && String(stats.plan).toLowerCase() === 'free');

  const handleUpgrade = async (planKey) => {
    try {
      setUpgrading(true);
      await changePlan(planKey);
      const updated = await fetchUserMe();
      localStorage.setItem('user', JSON.stringify(updated));
      window.dispatchEvent(new Event('userChanged'));
      window.dispatchEvent(new Event('planChanged'));
      setSnackbar({ open: true, message: 'Plan upgraded successfully!', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Upgrade failed. Please try again.', severity: 'error' });
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Executive Hero Banner */}
      <Box sx={{
        mb: 4,
        p: { xs: 3, md: 6 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: 'white',
        boxShadow: '0 12px 40px rgba(48, 43, 99, 0.5)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -50,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0) 70%)',
          filter: 'blur(40px)',
          animation: 'pulse 6s infinite'
        }} />

        <Typography variant="h3" fontWeight="800" gutterBottom sx={{
          position: 'relative', zIndex: 1,
          background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          Welcome back, {userProfile.first_name || userRole || 'Admin'}!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.85, maxWidth: 600, position: 'relative', zIndex: 1, fontWeight: 300, lineHeight: 1.6 }}>
          You are currently logged into the {userIndustry || 'System'} control center.
          Manage your operations, monitor revenue, and drive growth with Zenith technology.
        </Typography>
      </Box>

      {/* Quick Launch Action Center */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        Quick Launch
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {userIndustry && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                cursor: 'pointer',
                bgcolor: '#1a1a24',
                color: "text.primary",
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderLeft: '4px solid #00f2fe',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,242,254,0.15)', borderColor: 'rgba(0,242,254,0.3)' }
              }}
              onClick={() => navigate(`/${userIndustry.toLowerCase()}`)}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 5 }}>
                <Box sx={{ p: 2, borderRadius: '50%', background: 'rgba(0,242,254,0.1)', mb: 3 }}>
                  {userIndustry.toLowerCase() === 'pharmacy' ? <LocalPharmacyIcon sx={{ fontSize: 50, color: '#00f2fe' }} /> :
                   userIndustry.toLowerCase() === 'retail' ? <StorefrontIcon sx={{ fontSize: 50, color: '#00f2fe' }} /> :
                   userIndustry.toLowerCase() === 'education' ? <SchoolIcon sx={{ fontSize: 50, color: '#00f2fe' }} /> :
                   userIndustry.toLowerCase() === 'restaurant' ? <RestaurantIcon sx={{ fontSize: 50, color: '#00f2fe' }} /> :
                   userIndustry.toLowerCase() === 'hotel' ? <HotelIcon sx={{ fontSize: 50, color: '#00f2fe' }} /> :
                   userIndustry.toLowerCase() === 'salon' ? <ContentCutIcon sx={{ fontSize: 50, color: '#00f2fe' }} /> :
                   <BusinessIcon sx={{ fontSize: 50, color: '#00f2fe' }} />
                  }
                </Box>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                  {userIndustry.charAt(0).toUpperCase() + userIndustry.slice(1)} Engine
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Launch the primary control board for your {userIndustry} operations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* System Settings Quick Link */}
        {isAdmin && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                cursor: 'pointer',
                bgcolor: '#1a1a24',
                color: "text.primary",
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }
              }}
              onClick={() => navigate('/settings')}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 5 }}>
                <Box sx={{ p: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', mb: 3 }}>
                  <StorageIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  System Settings
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Manage tenants, user permissions, and billing plans.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Razorpay Setup Status Card - Show if admin and not configured - MOVED TO TOP */}
      {isAdmin && (razorpaySetupStatus === null || (razorpaySetupStatus && !razorpaySetupStatus.is_configured)) && (
        <Card sx={{ mb: 3, borderLeft: '6px solid #1976d2', bgcolor: 'info.light', color: 'info.contrastText' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <PaymentIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Setup Razorpay Payment Gateway</Typography>
                  <Typography variant="body2">Enable online payments for your customers. Accept payments via Razorpay in all sectors.</Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowRazorpaySetup(true)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Setup Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Razorpay Active Card - Show if admin and configured - MOVED TO TOP */}
      {isAdmin && razorpaySetupStatus && razorpaySetupStatus.is_configured && (
        <Card sx={{ mb: 3, borderLeft: '6px solid #4caf50', bgcolor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <PaymentIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Razorpay Payment Gateway Active</Typography>
                  <Typography variant="body2">Your Razorpay account is configured and ready to accept payments.</Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setShowRazorpaySetup(true)}
                sx={{ whiteSpace: 'nowrap', borderColor: 'currentColor' }}
              >
                Update Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Section - Only show for Education */}
      {userIndustry && userIndustry.toLowerCase() === 'education' && (
        <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'primary.main', color: "text.primary" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <PeopleIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{eduSummary?.total_students || 0}</Typography>
                    <Typography variant="body2">Total Students</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'success.main', color: "text.primary" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <PeopleIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{eduSummary?.total_staff || 0}</Typography>
                    <Typography variant="body2">Total Staff</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'warning.main', color: "text.primary" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <StorageIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{monthlyReport?.total_fees_collected || 0}</Typography>
                    <Typography variant="body2">Fee Collection</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'info.main', color: "text.primary" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <EventAvailableIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{monthlyReport?.average_attendance || 0}%</Typography>
                    <Typography variant="body2">Attendance Rate</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tenant/Plan/Info Section */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        {[
          { icon: <BusinessIcon sx={{color: '#00f2fe'}} />, label: 'Tenant', value: stats.tenant || '-' },
          { icon: <WorkspacePremiumIcon sx={{color: '#ff0844'}} />, label: 'Plan', value: stats.plan || '-' },
          { icon: <EventAvailableIcon sx={{color: '#4facfe'}} />, label: 'Created At', value: stats.created_at && !isNaN(new Date(stats.created_at)) ? format(new Date(stats.created_at), 'yyyy-MM-dd HH:mm') : '-' },
          { icon: <PeopleIcon sx={{color: '#fa709a'}} />, label: 'Users', value: stats.user_count !== undefined && stats.plan_limits?.max_users !== undefined ? `${stats.user_count} / ${stats.plan_limits.max_users}` : '-' },
          { icon: <StorageIcon sx={{color: '#f6d365'}} />, label: 'Storage Used', value: stats.storage_used_mb !== undefined && stats.plan_limits?.storage_limit_mb !== undefined ? `${stats.storage_used_mb} MB / ${stats.plan_limits.storage_limit_mb} MB` : '-' },
          { icon: <BusinessIcon sx={{color: '#a18cd1'}} />, label: 'Industry', value: stats.industry || '-' }
        ].map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card elevation={0} sx={{
              bgcolor: '#1a1a24',
              color: "text.primary",
              border: '1px solid rgba(255,255,255,0.05)',
              '&:hover': { bgcolor: '#222230', borderColor: 'rgba(255,255,255,0.1)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>{item.label}</Typography>
                    <Typography variant="h6" fontWeight="bold">{item.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upgrade CTA for Free plan */}
      {isFreePlan && (
        <Card sx={{ mb: 3, borderLeft: '6px solid #ff9800' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <MonetizationOnIcon color="warning" />
                <Box>
                  <Typography variant="h6">You are on the Free plan</Typography>
                  <Typography variant="body2" color="text.secondary">Upgrade to unlock more users, storage, and features.</Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Button variant="contained" color="warning" onClick={() => setShowPricing(true)}>View Upgrade Options</Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Manual Razorpay Setup Button - Always show for admin (fallback if cards don't show) */}
      {isAdmin && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Button
            variant="text"
            color="primary"
            onClick={() => setShowRazorpaySetup(true)}
            startIcon={<PaymentIcon />}
            sx={{ textTransform: 'none' }}
          >
            {razorpaySetupStatus?.is_configured ? 'Update Razorpay Settings' : 'Setup Razorpay Payment Gateway'}
          </Button>
        </Box>
      )}

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} onUpgraded={() => setShowPricing(false)} />

      {/* Razorpay Setup Wizard Dialog */}
      {showRazorpaySetup && (
        <Dialog
          open={showRazorpaySetup}
          onClose={() => setShowRazorpaySetup(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <RazorpaySetupWizard
              onComplete={() => {
                setShowRazorpaySetup(false);
                checkRazorpaySetup();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Charts Section - Only show for Education */}
      {userIndustry && userIndustry.toLowerCase() === 'education' && (
        <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
          <Grid gridColumn="span 8">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Attendance Trends</Typography>
                <AttendanceChart data={attendanceTrendsData} />
              </CardContent>
            </Card>
          </Grid>
          <Grid gridColumn="span 4">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Staff Distribution</Typography>
                <StaffDistributionChart data={staffDistributionData} />
              </CardContent>
            </Card>
          </Grid>
          <Grid gridColumn="span 12">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Fee Collection</Typography>
                <FeeCollectionChart data={feeCollectionData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box mt={4}>
        <Typography variant="h5" gutterBottom><NotificationsIcon sx={{mr:1}}/>Alerts & Notifications</Typography>
        {alerts.length === 0 ? (
          <Alert severity="info">No alerts.</Alert>
        ) : (
          <Box>
            {alerts.map((a) => (
              <Alert key={a.id} severity={a.type === 'usage' ? 'warning' : a.type === 'plan' ? 'info' : 'success'} sx={{mb:1}}>
                <strong>[{a.type}]</strong> {a.message} <span style={{fontSize: '0.8em', color: '#888'}}>{a.created_at && !isNaN(new Date(a.created_at)) ? format(new Date(a.created_at), 'yyyy-MM-dd HH:mm:ss') : '-'}</span>
              </Alert>
            ))}
          </Box>
        )}
      </Box>

      {eduSummary && userIndustry && userIndustry.toLowerCase() === 'education' && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>Education Summary</Typography>
          <Grid container columns={12} columnSpacing={2}>
            <Grid gridColumn="span 6">
              <Card><CardContent><Typography>Total Students</Typography><Typography variant="h6">{eduSummary.total_students ?? '-'}</Typography></CardContent></Card>
            </Grid>
            <Grid gridColumn="span 6">
              <Card><CardContent><Typography>Total Staff</Typography><Typography variant="h6">{eduSummary.total_staff ?? '-'}</Typography></CardContent></Card>
            </Grid>
            <Grid gridColumn="span 6">
              <Card><CardContent><Typography>Fees Paid</Typography><Typography variant="h6">{eduSummary.fees_paid ?? '-'}</Typography></CardContent></Card>
            </Grid>
            <Grid gridColumn="span 6">
              <Card><CardContent><Typography>Fees Unpaid</Typography><Typography variant="h6">{eduSummary.fees_unpaid ?? '-'}</Typography></CardContent></Card>
            </Grid>
            <Grid gridColumn="span 6">
              <Card><CardContent><Typography>Staff Present Today</Typography><Typography variant="h6">{eduSummary.staff_present_today ?? '-'}</Typography></CardContent></Card>
            </Grid>
            <Grid gridColumn="span 6">
              <Card><CardContent><Typography>Staff Absent Today</Typography><Typography variant="h6">{eduSummary.staff_absent_today ?? '-'}</Typography></CardContent></Card>
            </Grid>
            <Grid gridColumn="span 6">
              <Card><CardContent><Typography>Student Present Today</Typography><Typography variant="h6">{eduSummary.student_present_today ?? '-'}</Typography></CardContent></Card>
            </Grid>
            <Grid gridColumn="span 6">
              <Card><CardContent><Typography>Student Absent Today</Typography><Typography variant="h6">{eduSummary.student_absent_today ?? '-'}</Typography></CardContent></Card>
            </Grid>
          </Grid>
        </Box>
      )}

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
    </Container>
  );
};

export default Dashboard;