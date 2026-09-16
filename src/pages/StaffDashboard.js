import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api, { unwrapList, getStoredUser } from '../services/api';

const StaffDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const userProfile = getStoredUser();

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);

      // Use the shared `api` instance instead of raw fetch('/api/...') - a
      // relative path only works when frontend and backend share an origin,
      // which isn't true in production, so this always 404'd there (and
      // skipped the 401 refresh/logout interceptor). The notifications path
      // was also wrong ('education/notifications/' doesn't exist - the real
      // endpoint is just 'notifications/'). There is no backend "tasks"
      // feature at all yet, so that fetch is dropped rather than pointed at
      // a nonexistent endpoint - `tasks` stays an empty array.
      const [attendanceRes, notificationsRes] = await Promise.all([
        api.get('/education/staff-attendance/'),
        api.get('/notifications/')
      ]);

      setAttendance(unwrapList(attendanceRes.data));
      setNotifications(unwrapList(notificationsRes.data));

    } catch (err) {
      setError('Failed to load staff data');
      console.error('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post('/education/staff-attendance/check-in/', {
        staff_id: userProfile.id,
        date: new Date().toISOString().split('T')[0]
      });
      setSnackbar({ open: true, message: 'Check-in successful!', severity: 'success' });
      fetchStaffData();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Check-in failed', severity: 'error' });
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/education/staff-attendance/check-out/', {
        staff_id: userProfile.id,
        date: new Date().toISOString().split('T')[0]
      });
      setSnackbar({ open: true, message: 'Check-out successful!', severity: 'success' });
      fetchStaffData();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Check-out failed', severity: 'error' });
    }
  };

  // Mock data for charts
  const attendanceTrend = [
    { week: 'Week 1', present: 5, absent: 0 },
    { week: 'Week 2', present: 4, absent: 1 },
    { week: 'Week 3', present: 5, absent: 0 },
    { week: 'Week 4', present: 3, absent: 2 },
    { week: 'Week 5', present: 5, absent: 0 }
  ];

  const taskStatus = [
    { name: 'Completed', value: 60, color: '#4caf50' },
    { name: 'In Progress', value: 25, color: '#2196f3' },
    { name: 'Pending', value: 15, color: '#ff9800' }
  ];

  const workHours = [
    { day: 'Mon', hours: 8 },
    { day: 'Tue', hours: 7.5 },
    { day: 'Wed', hours: 8 },
    { day: 'Thu', hours: 6.5 },
    { day: 'Fri', hours: 8 },
    { day: 'Sat', hours: 4 },
    { day: 'Sun', hours: 0 }
  ];

  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const todayAttendance = attendance.find(a => a.date === new Date().toISOString().split('T')[0]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading staff dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#0f0c29", color: "white" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#0f0c29", color: "white" }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
          👨‍💼 Staff Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Welcome back, {userProfile.first_name || userProfile.username || 'Staff'}!
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{Math.round((presentDays / totalDays) * 100) || 0}%</Typography>
                  <Typography variant="body2">Attendance Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{completedTasks}</Typography>
                  <Typography variant="body2">Completed Tasks</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <NotificationsIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{unreadNotifications}</Typography>
                  <Typography variant="body2">New Notifications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WorkIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">42</Typography>
                  <Typography variant="body2">Total Hours</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Check-in/out */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Today's Attendance</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body1" sx={{ flex: 1 }}>
              Date: {new Date().toLocaleDateString()}
            </Typography>
            {todayAttendance ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`Check-in: ${todayAttendance.check_in || 'Not recorded'}`} 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={`Check-out: ${todayAttendance.check_out || 'Not recorded'}`} 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<CheckInIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleCheckIn}
                >
                  Check In
                </Button>
                <Button
                  startIcon={<CheckOutIcon />}
                  variant="outlined"
                  color="secondary"
                  onClick={handleCheckOut}
                >
                  Check Out
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 6">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Weekly Attendance Trend</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#4caf50" strokeWidth={2} />
                  <Line type="monotone" dataKey="absent" stroke="#f44336" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 6">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Task Status Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Work Hours Chart */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 12">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Weekly Work Hours</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks and Notifications */}
      <Grid container columns={12} spacing={3}>
        <Grid gridColumn="span 6">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Tasks</Typography>
              <List>
                {tasks.slice(0, 5).map((task, index) => (
                  <React.Fragment key={task.id || index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: task.status === 'completed' ? 'success.main' : 'warning.main' }}>
                          <AssignmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText sx={{ "& .MuiListItemText-primary": { color: "white" }, "& .MuiListItemText-secondary": { color: "rgba(255,255,255,0.6)" } }} primary={task.title || `Task ${index + 1}`}
                        secondary={`Due: ${task.due_date || 'Not set'} • Priority: ${task.priority || 'Medium'}`}
                      />
                      <Chip 
                        label={task.status || 'Pending'} 
                        color={task.status === 'completed' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </ListItem>
                    {index < Math.min(tasks.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {tasks.length === 0 && (
                  <ListItem>
                    <ListItemText sx={{ "& .MuiListItemText-primary": { color: "white" }, "& .MuiListItemText-secondary": { color: "rgba(255,255,255,0.6)" } }} primary="No tasks assigned"
                      secondary="Your tasks will appear here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid gridColumn="span 6">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Notifications</Typography>
              <List>
                {notifications.slice(0, 5).map((notification, index) => (
                  <React.Fragment key={notification.id || index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: notification.read ? 'grey.400' : 'primary.main' }}>
                          <NotificationsIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText sx={{ "& .MuiListItemText-primary": { color: "white" }, "& .MuiListItemText-secondary": { color: "rgba(255,255,255,0.6)" } }} primary={notification.title || `Notification ${index + 1}`}
                        secondary={`${notification.message || 'No message'} • ${notification.date || 'Today'}`}
                      />
                      {!notification.read && (
                        <Chip label="New" color="primary" size="small" />
                      )}
                    </ListItem>
                    {index < Math.min(notifications.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {notifications.length === 0 && (
                  <ListItem>
                    <ListItemText sx={{ "& .MuiListItemText-primary": { color: "white" }, "& .MuiListItemText-secondary": { color: "rgba(255,255,255,0.6)" } }} primary="No notifications"
                      secondary="Your notifications will appear here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance History */}
      <Grid container columns={12} spacing={3} sx={{ mt: 1 }}>
        <Grid gridColumn="span 12">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Attendance History</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell>Total Hours</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.slice(0, 10).map((record, index) => (
                      <TableRow key={record.id || index}>
                        <TableCell>{record.date || `Date ${index + 1}`}</TableCell>
                        <TableCell>{record.check_in || 'Not recorded'}</TableCell>
                        <TableCell>{record.check_out || 'Not recorded'}</TableCell>
                        <TableCell>{record.total_hours || 0} hrs</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status || 'Present'} 
                            color={record.status === 'present' ? 'success' : 'error'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {attendance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                            No attendance records available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffDashboard; 
