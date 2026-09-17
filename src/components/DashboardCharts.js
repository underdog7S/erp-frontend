import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const COLORS = ['#00f2fe', '#4facfe', '#7b2ff7', '#9d5bfa', '#00e676', '#ff9100'];

const EmptyState = ({ message = "Not enough data yet" }) => (
  <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
    <ShowChartIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
      {message}
    </Typography>
  </Box>
);

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
          {change !== undefined && change !== null && (
            <Box display="flex" alignItems="center" mt={1}>
              {change >= 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={change >= 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f2fe'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const AttendanceChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>Attendance Trends</Typography>
      {(!data || data.length === 0) ? (
        <EmptyState message="Log attendance to generate analytics." />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: '#101015', borderColor: '#00f2fe', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#00e676" strokeWidth={3} />
            <Line type="monotone" dataKey="absent" stroke="#ff1744" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

export const FeeCollectionChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>Fee Collection</Typography>
      {(!data || data.length === 0) ? (
        <EmptyState message="Record payments to visualize revenue." />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: '#101015', borderColor: '#00f2fe', color: '#fff' }} />
            <Legend />
            <Bar dataKey="collected" fill="#00f2fe" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="#ff9100" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

export const ClassPerformanceChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>Class Performance</Typography>
      {(!data || data.length === 0) ? (
        <EmptyState message="Not enough grades entered yet." />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
            <YAxis dataKey="class_name" type="category" stroke="rgba(255,255,255,0.5)" width={80} />
            <Tooltip contentStyle={{ backgroundColor: '#101015', borderColor: '#00f2fe', color: '#fff' }} />
            <Legend />
            <Bar dataKey="average_score" fill="#7b2ff7" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

export const StaffDistributionChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>Staff Distribution</Typography>
      {(!data || data.length === 0) ? (
        <EmptyState message="Add staff members to view distribution." />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#101015', borderColor: '#00f2fe', color: '#fff' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

export const QuickStats = ({ stats }) => (
  <Grid container spacing={3} mb={3}>
    <Grid item xs={12} md={3}>
      <StatCard
        title="Total Students"
        value={stats?.totalStudents || 0}
        change={stats?.studentGrowth || 0}
        icon={<PeopleIcon />}
        color="primary"
      />
    </Grid>
    <Grid item xs={12} md={3}>
      <StatCard
        title="Total Staff"
        value={stats?.totalStaff || 0}
        change={stats?.staffGrowth || 0}
        icon={<SchoolIcon />}
        color="secondary"
      />
    </Grid>
    <Grid item xs={12} md={3}>
      <StatCard
        title="Fee Collection"
        value={`$${stats?.feeCollection || 0}`}
        change={stats?.feeGrowth || 0}
        icon={<AttachMoneyIcon />}
        color="success"
      />
    </Grid>
    <Grid item xs={12} md={3}>
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