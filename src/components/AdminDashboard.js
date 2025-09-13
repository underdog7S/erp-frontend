import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip, LinearProgress, IconButton, Tooltip, Paper, Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  LocalHospital as LocalHospitalIcon,
  Build as BuildIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import api from '../services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle, onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" gap={1}>
                {trend > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography 
                  variant="caption" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  fontWeight="600"
                >
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: `${color}.main`,
              color: 'white'
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const ProgressCard = ({ title, current, total, color, icon, unit = '' }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="600">
              {title}
            </Typography>
            <Avatar sx={{ width: 40, height: 40, bgcolor: `${color}.main` }}>
              {icon}
            </Avatar>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {current}{unit}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              of {total}{unit} used
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={color}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {percentage.toFixed(1)}% utilized
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const AlertCard = ({ title, message, severity, time }) => {
    const getSeverityIcon = () => {
      switch (severity) {
        case 'success': return <CheckCircleIcon color="success" />;
        case 'warning': return <WarningIcon color="warning" />;
        case 'error': return <ErrorIcon color="error" />;
        default: return <InfoIcon color="info" />;
      }
    };

    const getSeverityColor = () => {
      switch (severity) {
        case 'success': return 'success.main';
        case 'warning': return 'warning.main';
        case 'error': return 'error.main';
        default: return 'info.main';
      }
    };

    return (
      <Card sx={{ borderLeft: `4px solid ${getSeverityColor()}` }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start" gap={2}>
            {getSeverityIcon()}
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {time}
              </Typography>
            </Box>
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Avatar 
          sx={{ 
            width: 48, 
            height: 48, 
            bgcolor: `${color}.main`,
            color: 'white',
            mx: 'auto',
            mb: 2
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, color: 'primary.main' }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your system today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container columns={12} spacing={3} sx={{ mb: 4 }}>
        <Grid gridColumn="span 3">
          <StatCard
            title="Total Users"
            value={dashboardData?.user_count || 0}
            icon={<PeopleIcon />}
            color="primary"
            trend={12}
            subtitle="Active accounts"
          />
        </Grid>
        <Grid gridColumn="span 3">
          <StatCard
            title="User Limit"
            value={dashboardData?.plan_limits?.max_users || '∞'}
            icon={<SecurityIcon />}
            color="secondary"
            subtitle="Plan capacity"
          />
        </Grid>
        <Grid gridColumn="span 3">
          <StatCard
            title="Storage Used"
            value={`${dashboardData?.storage_used_mb || 0} MB`}
            icon={<StorageIcon />}
            color="info"
            trend={-5}
            subtitle="File storage"
          />
        </Grid>
        <Grid gridColumn="span 3">
          <StatCard
            title="Current Plan"
            value={dashboardData?.plan || 'Free'}
            icon={<BusinessIcon />}
            color="success"
            subtitle="Active subscription"
          />
        </Grid>
      </Grid>

      {/* Progress and Quick Actions */}
      <Grid container columns={12} spacing={3} sx={{ mb: 4 }}>
        <Grid gridColumn="span 8">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                System Usage
              </Typography>
              <Grid container spacing={3}>
                <Grid gridColumn="span 6">
                  <ProgressCard
                    title="User Limit"
                    current={dashboardData?.user_count || 0}
                    total={dashboardData?.plan_limits?.max_users || 100}
                    color="primary"
                    icon={<PeopleIcon />}
                  />
                </Grid>
                <Grid gridColumn="span 6">
                  <ProgressCard
                    title="Storage Usage"
                    current={dashboardData?.storage_used_mb || 0}
                    total={dashboardData?.storage_limit_mb || 1000}
                    color="warning"
                    icon={<StorageIcon />}
                    unit=" MB"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 4">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <QuickActionCard
                  title="Add User"
                  description="Create new user account"
                  icon={<PeopleIcon />}
                  color="primary"
                />
                <QuickActionCard
                  title="System Settings"
                  description="Configure system preferences"
                  icon={<SecurityIcon />}
                  color="secondary"
                />
                <QuickActionCard
                  title="View Reports"
                  description="Access system analytics"
                  icon={<BusinessIcon />}
                  color="info"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Module Status */}
      <Grid container columns={12} spacing={3} sx={{ mb: 4 }}>
        <Grid gridColumn="span 12">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                Module Status
              </Typography>
              <Grid container spacing={2}>
                <Grid gridColumn="span 3">
                  <Box display="flex" alignItems="center" gap={2} p={2} sx={{ bgcolor: 'success.50', borderRadius: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        Education
                      </Typography>
                      <Chip label="Active" color="success" size="small" />
                    </Box>
                  </Box>
                </Grid>
                <Grid gridColumn="span 3">
                  <Box display="flex" alignItems="center" gap={2} p={2} sx={{ bgcolor: 'info.50', borderRadius: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <LocalHospitalIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        Healthcare
                      </Typography>
                      <Chip label="Active" color="info" size="small" />
                    </Box>
                  </Box>
                </Grid>
                <Grid gridColumn="span 3">
                  <Box display="flex" alignItems="center" gap={2} p={2} sx={{ bgcolor: 'warning.50', borderRadius: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <BuildIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        Manufacturing
                      </Typography>
                      <Chip label="Active" color="warning" size="small" />
                    </Box>
                  </Box>
                </Grid>
                <Grid gridColumn="span 3">
                  <Box display="flex" alignItems="center" gap={2} p={2} sx={{ bgcolor: 'secondary.50', borderRadius: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        Business
                      </Typography>
                      <Chip label="Active" color="secondary" size="small" />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      <Grid container columns={12} spacing={3}>
        <Grid gridColumn="span 6">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                  Recent Alerts
                </Typography>
                <IconButton size="small">
                  <NotificationsIcon />
                </IconButton>
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                <AlertCard
                  title="System Update Available"
                  message="A new system update is ready to be installed"
                  severity="info"
                  time="2 hours ago"
                />
                <AlertCard
                  title="Storage Warning"
                  message="Storage usage is approaching 80% capacity"
                  severity="warning"
                  time="4 hours ago"
                />
                <AlertCard
                  title="New User Registered"
                  message="A new user has successfully registered"
                  severity="success"
                  time="6 hours ago"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 6">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                System Health
              </Typography>
              <Box display="flex" flexDirection="column" gap={3}>
                <Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">API Response Time</Typography>
                    <Typography variant="body2" fontWeight="600">45ms</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Database Performance</Typography>
                    <Typography variant="body2" fontWeight="600">98%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={98} 
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Uptime</Typography>
                    <Typography variant="body2" fontWeight="600">99.9%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={99.9} 
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Security Status</Typography>
                    <Typography variant="body2" fontWeight="600">Secure</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 