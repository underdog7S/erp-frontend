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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api, { getStoredUser } from '../services/api';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    due_date: '',
    class_id: '',
    max_score: 100
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const userProfile = getStoredUser();

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      const [classesRes, studentsRes, assignmentsRes, attendanceRes] = await Promise.all([
        api.get('/education/classes/'),
        api.get('/education/students/'),
        api.get('/education/assignments/'),
        api.get('/education/attendance/')
      ]);

      setClasses(classesRes.data);
      setStudents(studentsRes.data);
      setAssignments(assignmentsRes.data);
      setAttendance(attendanceRes.data);

    } catch (err) {
      setError('Failed to load teacher data');
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = async () => {
    try {
      const response = await api.post('/education/assignments/', assignmentForm);

      if (response.status === 201 || response.status === 200) {
        setSnackbar({ open: true, message: 'Assignment added successfully!', severity: 'success' });
        setOpenAssignmentDialog(false);
        setAssignmentForm({ title: '', description: '', due_date: '', class_id: '', max_score: 100 });
        fetchTeacherData();
      } else {
        setSnackbar({ open: true, message: 'Failed to add assignment', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error adding assignment', severity: 'error' });
    }
  };

  // Mock data for charts
  const attendanceData = [
    { name: 'Mon', present: 85, absent: 15 },
    { name: 'Tue', present: 90, absent: 10 },
    { name: 'Wed', present: 88, absent: 12 },
    { name: 'Thu', present: 92, absent: 8 },
    { name: 'Fri', present: 87, absent: 13 }
  ];

  const gradeDistribution = [
    { name: 'A (90-100)', value: 25, color: '#4caf50' },
    { name: 'B (80-89)', value: 35, color: '#2196f3' },
    { name: 'C (70-79)', value: 25, color: '#ff9800' },
    { name: 'D (60-69)', value: 10, color: '#f44336' },
    { name: 'F (<60)', value: 5, color: '#9c27b0' }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading teacher dashboard...</Typography>
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
          👨‍🏫 Teacher Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Welcome back, {userProfile.first_name || userProfile.username || 'Teacher'}!
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{classes.length}</Typography>
                  <Typography variant="body2">My Classes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{students.length}</Typography>
                  <Typography variant="body2">Total Students</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{assignments.length}</Typography>
                  <Typography variant="body2">Assignments</Typography>
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
                  <Typography variant="h4">85%</Typography>
                  <Typography variant="body2">Avg Attendance</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 8">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Weekly Attendance Trends</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
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
        <Grid gridColumn="span 4">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Grade Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {gradeDistribution.map((entry, index) => (
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

      {/* Classes and Assignments */}
      <Grid container columns={12} spacing={3}>
        <Grid gridColumn="span 6">
          <Card sx={{ bgcolor: "#1a1a24", color: "white", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">My Classes</Typography>
                <Chip label={`${classes.length} Classes`} color="primary" size="small" />
              </Box>
              <List>
                {classes.map((cls, index) => (
                  <React.Fragment key={cls.id || index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText sx={{ "& .MuiListItemText-primary": { color: "white" }, "& .MuiListItemText-secondary": { color: "rgba(255,255,255,0.6)" } }} primary={cls.name || `Class ${index + 1}`}
                        secondary={`${cls.student_count || 0} students • ${cls.subject || 'General'}`}
                      />
                      <Chip label="Active" color="success" size="small" />
                    </ListItem>
                    {index < classes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {classes.length === 0 && (
                  <ListItem>
                    <ListItemText sx={{ "& .MuiListItemText-primary": { color: "white" }, "& .MuiListItemText-secondary": { color: "rgba(255,255,255,0.6)" } }} primary="No classes assigned"
                      secondary="You will see your assigned classes here"
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Assignments</Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => setOpenAssignmentDialog(true)}
                >
                  Add Assignment
                </Button>
              </Box>
              <List>
                {assignments.slice(0, 5).map((assignment, index) => (
                  <React.Fragment key={assignment.id || index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <AssignmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText sx={{ "& .MuiListItemText-primary": { color: "white" }, "& .MuiListItemText-secondary": { color: "rgba(255,255,255,0.6)" } }} primary={assignment.title || `Assignment ${index + 1}`}
                        secondary={`Due: ${assignment.due_date || 'Not set'} • Max Score: ${assignment.max_score || 100}`}
                      />
                      <Chip 
                        label={assignment.status || 'Active'} 
                        color={assignment.status === 'Completed' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </ListItem>
                    {index < Math.min(assignments.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {assignments.length === 0 && (
                  <ListItem>
                    <ListItemText sx={{ "& .MuiListItemText-primary": { color: "white" }, "& .MuiListItemText-secondary": { color: "rgba(255,255,255,0.6)" } }} primary="No assignments yet"
                      secondary="Create your first assignment to get started"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Assignment Dialog */}
      <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Assignment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Assignment Title"
            value={assignmentForm.title}
            onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={assignmentForm.description}
            onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={assignmentForm.due_date}
            onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Class</InputLabel>
            <Select
              value={assignmentForm.class_id}
              onChange={(e) => setAssignmentForm({...assignmentForm, class_id: e.target.value})}
              label="Class"
            >
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name || `Class ${cls.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Maximum Score"
            type="number"
            value={assignmentForm.max_score}
            onChange={(e) => setAssignmentForm({...assignmentForm, max_score: parseInt(e.target.value)})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignmentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddAssignment} variant="contained">Add Assignment</Button>
        </DialogActions>
      </Dialog>

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

export default TeacherDashboard; 
