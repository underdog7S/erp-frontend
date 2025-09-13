import React, { useEffect, useState } from "react";
import api, { logout } from "../services/api";
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
import { fetchPlans, changePlan, fetchUserMe } from '../services/api';
import PricingModal from '../components/PricingModal';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eduSummary, setEduSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [classStats, setClassStats] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [validStaffIds, setValidStaffIds] = useState([]);
  const [attendanceTrendsData, setAttendanceTrendsData] = useState([]);
  const [staffDistributionData, setStaffDistributionData] = useState([]);
  const [feeCollectionData, setFeeCollectionData] = useState([]);
  const [classPerformanceData, setClassPerformanceData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [upgrading, setUpgrading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Get user profile from localStorage at component level
  const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = userProfile.role || '';
  const userIndustry = userProfile.industry || '';

  useEffect(() => {
    // Redirect to industry-specific dashboard based on user's industry
    if (userIndustry) {
      const industryLower = userIndustry.toLowerCase();
      if (industryLower === 'pharmacy') {
        navigate('/pharmacy');
        return;
      } else if (industryLower === 'retail') {
        navigate('/retail');
        return;
      } else if (industryLower === 'education') {
        navigate('/education');
        return;
      }
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsRes, alertsRes] = await Promise.all([
          api.get("/dashboard/"),
          api.get("/alerts/")
        ]);
        setStats(statsRes.data);
        setAlerts(alertsRes.data);
        // Log dashboard stats for debugging
        console.log('Dashboard stats:', statsRes.data);
      } catch (err) {
        setError("Failed to load dashboard. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    // Fetch dashboard data for all roles
    fetchData();
    // Load plans for upgrade card
    fetchPlans().then(setPlans).catch(()=>setPlans([]));
    
    // Only fetch education data if user is in education industry
    if (userIndustry && userIndustry.toLowerCase() === 'education') {
      api.get("/education/admin-summary/").then(res => {
        setEduSummary(res.data);
        console.log('Admin summary:', res.data);
      }).catch(()=>{});
      api.get("/education/staff-attendance/").then(res => setAttendance(res.data)).catch(()=>{});
      api.get("/education/analytics/class-stats/").then(res => {
        setClassStats(res.data);
        console.log('Class stats:', res.data);
      }).catch(()=>{});
      fetchMonthlyReport(selectedMonth);
      api.get("/education/analytics/attendance-trends/").then(res => setAttendanceTrendsData(res.data)).catch(()=>setAttendanceTrendsData([]));
      api.get("/education/analytics/staff-distribution/").then(res => setStaffDistributionData(res.data)).catch(()=>setStaffDistributionData([]));
      api.get("/education/analytics/fee-collection/").then(res => setFeeCollectionData(res.data)).catch(()=>setFeeCollectionData([]));
      api.get("/education/analytics/class-performance/").then(res => setClassPerformanceData(res.data)).catch(()=>setClassPerformanceData([]));
    }
  }, [navigate, selectedMonth]);

  useEffect(() => {
    // Fetch valid staff IDs for the tenant on mount (only for education industry)
    if (userIndustry && userIndustry.toLowerCase() === 'education') {
      api.get('/education/staff/').then(res => {
        if (Array.isArray(res.data)) {
          setValidStaffIds(res.data.map(staff => staff.id));
        }
      }).catch(() => {});
    }
  }, [userIndustry]);

  useEffect(() => {
    // Listen for plan upgrade event
    const handlePlanChanged = () => {
      setSnackbar({ open: true, message: 'Plan upgraded successfully!', severity: 'success' });
      // Optionally, refresh dashboard data here
      // fetchData();
    };
    window.addEventListener('planChanged', handlePlanChanged);
    return () => window.removeEventListener('planChanged', handlePlanChanged);
  }, []);

  const fetchMonthlyReport = (month) => {
    // Only fetch education monthly report if user is in education industry
    if (!userIndustry || userIndustry.toLowerCase() !== 'education') {
      return;
    }
    
    setLoadingAnalytics(true);
    api.get(`/education/analytics/monthly-report/?month=${month}`)
      .then(res => {
        setMonthlyReport(res.data);
        console.log('Monthly report:', res.data);
      })
      .catch(()=>setMonthlyReport(null))
      .finally(()=>setLoadingAnalytics(false));
  };

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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
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
      api.get("/education/staff-attendance/").then(res => setAttendance(res.data));
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
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
      api.get("/education/staff-attendance/").then(res => setAttendance(res.data));
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
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Welcome to Zenith ERP
      </Typography>
      
      {/* Industry-specific welcome message */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Welcome to your {userIndustry} Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are currently logged in as a {userProfile.role || 'user'} in the {userIndustry} industry.
            Use the navigation menu to access your industry-specific features.
          </Typography>
          <Box sx={{ mt: 2 }}>
            {userIndustry && userIndustry.toLowerCase() === 'pharmacy' && (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => navigate('/pharmacy')}
                sx={{ mr: 2 }}
              >
                Go to Pharmacy Dashboard
              </Button>
            )}
            {userIndustry && userIndustry.toLowerCase() === 'retail' && (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => navigate('/retail')}
                sx={{ mr: 2 }}
              >
                Go to Retail Dashboard
              </Button>
            )}
            {userIndustry && userIndustry.toLowerCase() === 'education' && (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => navigate('/education')}
                sx={{ mr: 2 }}
              >
                Go to Education Dashboard
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Quick Stats Section - Only show for Education */}
      {userIndustry && userIndustry.toLowerCase() === 'education' && (
        <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
          <Grid gridColumn="span 3">
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
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
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
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
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
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
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
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
            <Grid gridColumn="span 4">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <BusinessIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">Tenant</Typography>
                  <Typography variant="h6">{stats.tenant || '-'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid gridColumn="span 4">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <WorkspacePremiumIcon color="secondary" />
                    <Box>
                      <Typography variant="subtitle2">Plan</Typography>
                  <Typography variant="h6">{stats.plan || '-'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid gridColumn="span 4">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EventAvailableIcon color="success" />
                    <Box>
                      <Typography variant="subtitle2">Created At</Typography>
                  <Typography variant="h6">{stats.created_at && !isNaN(new Date(stats.created_at)) ? format(new Date(stats.created_at), 'yyyy-MM-dd HH:mm') : '-'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid gridColumn="span 4">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PeopleIcon color="info" />
                    <Box>
                      <Typography variant="subtitle2">Users</Typography>
                  <Typography variant="h6">{stats.user_count !== undefined && stats.plan_limits?.max_users !== undefined ? `${stats.user_count} / ${stats.plan_limits.max_users}` : '-'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid gridColumn="span 4">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <StorageIcon color="warning" />
                    <Box>
                      <Typography variant="subtitle2">Storage Used</Typography>
                  <Typography variant="h6">{stats.storage_used_mb !== undefined && stats.plan_limits?.storage_limit_mb !== undefined ? `${stats.storage_used_mb} MB / ${stats.plan_limits.storage_limit_mb} MB` : '-'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid gridColumn="span 4">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <BusinessIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Industry</Typography>
                  <Typography variant="h6">{stats.industry || '-'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
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

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} onUpgraded={() => setShowPricing(false)} />

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
