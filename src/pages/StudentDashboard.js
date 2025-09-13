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
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  Book as BookIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const userProfile = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Fetch student's assignments, grades, attendance, and fees
      const [assignmentsRes, gradesRes, attendanceRes, feesRes] = await Promise.all([
        fetch('/api/education/assignments/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/education/grades/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/education/attendance/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/education/fees/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());
      if (gradesRes.ok) setGrades(await gradesRes.json());
      if (attendanceRes.ok) setAttendance(await attendanceRes.json());
      if (feesRes.ok) setFees(await feesRes.json());

    } catch (err) {
      setError('Failed to load student data');
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const gradeProgress = [
    { subject: 'Math', grade: 85 },
    { subject: 'Science', grade: 92 },
    { subject: 'English', grade: 78 },
    { subject: 'History', grade: 88 },
    { subject: 'Geography', grade: 90 }
  ];

  const attendanceData = [
    { month: 'Jan', present: 22, absent: 3 },
    { month: 'Feb', present: 20, absent: 5 },
    { month: 'Mar', present: 23, absent: 2 },
    { month: 'Apr', present: 21, absent: 4 },
    { month: 'May', present: 24, absent: 1 },
    { month: 'Jun', present: 22, absent: 3 }
  ];

  const subjectPerformance = [
    { name: 'Excellent (90-100)', value: 30, color: '#4caf50' },
    { name: 'Good (80-89)', value: 40, color: '#2196f3' },
    { name: 'Average (70-79)', value: 20, color: '#ff9800' },
    { name: 'Below Average (<70)', value: 10, color: '#f44336' }
  ];

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(assignment => assignment.status === 'completed').length;
  const averageGrade = grades.length > 0 ? grades.reduce((sum, grade) => sum + (grade.score || 0), 0) / grades.length : 0;
  const attendanceRate = attendance.length > 0 ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100 : 0;
  const pendingFees = fees.filter(fee => fee.status === 'pending').length;

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading student dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          👨‍🎓 Student Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Welcome back, {userProfile.first_name || userProfile.username || 'Student'}!
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{totalAssignments}</Typography>
                  <Typography variant="body2">Total Assignments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GradeIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{Math.round(averageGrade)}%</Typography>
                  <Typography variant="body2">Average Grade</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{Math.round(attendanceRate)}%</Typography>
                  <Typography variant="body2">Attendance Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: pendingFees > 0 ? 'warning.main' : 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BookIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{pendingFees}</Typography>
                  <Typography variant="body2">Pending Fees</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 6">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Subject Performance</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="grade" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 6">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Grade Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectPerformance}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectPerformance.map((entry, index) => (
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

      {/* Assignment Progress and Recent Grades */}
      <Grid container columns={12} spacing={3}>
        <Grid gridColumn="span 6">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Assignment Progress</Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completed</Typography>
                  <Typography variant="body2">{completedAssignments}/{totalAssignments}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <List>
                {assignments.slice(0, 5).map((assignment, index) => (
                  <React.Fragment key={assignment.id || index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: assignment.status === 'completed' ? 'success.main' : 'warning.main' }}>
                          {assignment.status === 'completed' ? <CheckCircleIcon /> : <AssignmentIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={assignment.title || `Assignment ${index + 1}`}
                        secondary={`Due: ${assignment.due_date || 'Not set'} • Status: ${assignment.status || 'Pending'}`}
                      />
                      <Chip 
                        label={assignment.status || 'Pending'} 
                        color={assignment.status === 'completed' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </ListItem>
                    {index < Math.min(assignments.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {assignments.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No assignments yet"
                      secondary="Your assignments will appear here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid gridColumn="span 6">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Grades</Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Assignment</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grades.slice(0, 5).map((grade, index) => (
                      <TableRow key={grade.id || index}>
                        <TableCell>{grade.subject || `Subject ${index + 1}`}</TableCell>
                        <TableCell>{grade.assignment || `Assignment ${index + 1}`}</TableCell>
                        <TableCell>{grade.score || 0}%</TableCell>
                        <TableCell>
                          <Chip 
                            label={grade.score >= 80 ? 'Excellent' : grade.score >= 70 ? 'Good' : 'Needs Improvement'} 
                            color={grade.score >= 80 ? 'success' : grade.score >= 70 ? 'warning' : 'error'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {grades.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No grades available yet
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

      {/* Fee Status */}
      <Grid container columns={12} spacing={3} sx={{ mt: 1 }}>
        <Grid gridColumn="span 12">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Fee Status</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fee Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fees.map((fee, index) => (
                      <TableRow key={fee.id || index}>
                        <TableCell>{fee.fee_type || `Fee ${index + 1}`}</TableCell>
                        <TableCell>₹{fee.amount || 0}</TableCell>
                        <TableCell>{fee.due_date || 'Not set'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={fee.status || 'Pending'} 
                            color={fee.status === 'paid' ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {fee.status !== 'paid' && (
                            <Button size="small" variant="outlined" color="primary">
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {fees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No fee records available
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

export default StudentDashboard; 