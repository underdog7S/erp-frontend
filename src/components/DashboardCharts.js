import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
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
      {Array.isArray(data) && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="present"
              stroke="#4caf50"
              strokeWidth={2}
              name="Present"
            />
            <Line
              type="monotone"
              dataKey="absent"
              stroke="#f44336"
              strokeWidth={2}
              name="Absent"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Placeholder text="Capturing attendance data..." />
      )}
    </CardContent>
  </Card>
);

export const FeeCollectionChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Fee Collection
      </Typography>
      {Array.isArray(data) && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="collected"
              stackId="1"
              stroke="#1a237e"
              fill="#1a237e"
              fillOpacity={0.6}
              name="Collected"
            />
            <Area
              type="monotone"
              dataKey="pending"
              stackId="1"
              stroke="#ff6f00"
              fill="#ff6f00"
              fillOpacity={0.6}
              name="Pending"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Placeholder text="Capturing fee collection data..." />
      )}
    </CardContent>
  </Card>
);

export const ClassPerformanceChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Class Performance
      </Typography>
      {Array.isArray(data) && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#1a237e" name="Average Score" />
            <Bar dataKey="attendance" fill="#4caf50" name="Attendance %" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Placeholder text="Capturing class performance data..." />
      )}
    </CardContent>
  </Card>
);

export const StaffDistributionChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Staff Distribution
      </Typography>
      {Array.isArray(data) && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Placeholder text="Capturing staff distribution data..." />
      )}
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