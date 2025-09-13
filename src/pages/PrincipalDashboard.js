import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';

const PrincipalDashboard = () => {
  // Mock data for demonstration
  const stats = {
    totalStaff: 18,
    totalStudents: 320,
    attendanceRate: '97%',
    alerts: 2,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Principal Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome! Here are your key school/organization stats and quick actions.
      </Typography>
      <Grid container spacing={3} mb={3}>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.totalStaff}</Typography>
                  <Typography variant="body2">Total Staff</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <SchoolIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.totalStudents}</Typography>
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
                <EventAvailableIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.attendanceRate}</Typography>
                  <Typography variant="body2">Attendance Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <NotificationsIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.alerts}</Typography>
                  <Typography variant="body2">Active Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3} mb={3}>
        <Grid gridColumn="span 8">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Staff & Student Management
              </Typography>
              <Box display="flex" gap={2}>
                <Button variant="contained" color="primary" startIcon={<AddIcon />}>Add Staff</Button>
                <Button variant="contained" color="secondary" startIcon={<AddIcon />}>Add Student</Button>
                <Button variant="outlined" color="primary">View All Staff</Button>
                <Button variant="outlined" color="secondary">View All Students</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 4">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="outlined" color="primary">View Attendance Summary</Button>
                <Button variant="outlined" color="warning">View Alerts</Button>
                <Button variant="outlined" color="info">Download Reports</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrincipalDashboard; 