import React from 'react';
// import {
//   LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const COLORS = ['#1a237e', '#ff6f00', '#4caf50', '#f44336', '#9c27b0', '#00bcd4'];

export const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {change && (
            <Box display="flex" alignItems="center" mt={1}>
              {change > 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={change > 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Placeholder = ({ text = 'Capturing data...' }) => (
  <Box display="flex" alignItems="center" justifyContent="center" height={300}>
    <Box sx={{
      bgcolor: '#f5f5f5',
      borderRadius: 2,
      p: 3,
      boxShadow: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      fontStyle: 'italic',
      color: '#888',
      fontSize: 18,
    }}>
      <span role="img" aria-label="chat">💬</span> {text}
    </Box>
  </Box>
);

export const AttendanceChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Attendance Trends
      </Typography>
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chart placeholder - {data?.length || 0} data points
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const FeeCollectionChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Fee Collection
      </Typography>
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chart placeholder - {data?.length || 0} data points
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const ClassPerformanceChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Class Performance
      </Typography>
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chart placeholder - {data?.length || 0} data points
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const StaffDistributionChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Staff Distribution
      </Typography>
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chart placeholder - {data?.length || 0} data points
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const QuickStats = ({ stats }) => (
  <Grid container spacing={3} mb={3}>
    <Grid gridColumn="span 3">
      <StatCard
        title="Total Students"
        value={stats?.totalStudents || 0}
        change={stats?.studentGrowth || 0}
        icon={<PeopleIcon />}
        color="primary"
      />
    </Grid>
    <Grid gridColumn="span 3">
      <StatCard
        title="Total Staff"
        value={stats?.totalStaff || 0}
        change={stats?.staffGrowth || 0}
        icon={<SchoolIcon />}
        color="secondary"
      />
    </Grid>
    <Grid gridColumn="span 3">
      <StatCard
        title="Fee Collection"
        value={`$${stats?.feeCollection || 0}`}
        change={stats?.feeGrowth || 0}
        icon={<AttachMoneyIcon />}
        color="success"
      />
    </Grid>
    <Grid gridColumn="span 3">
      <StatCard
        title="Attendance Rate"
        value={`${stats?.attendanceRate || 0}%`}
        change={stats?.attendanceGrowth || 0}
        icon={<TrendingUpIcon />}
        color="warning"
      />
    </Grid>
  </Grid>
);

export default {
  StatCard,
  AttendanceChart,
  FeeCollectionChart,
  ClassPerformanceChart,
  StaffDistributionChart,
  QuickStats,
}; 