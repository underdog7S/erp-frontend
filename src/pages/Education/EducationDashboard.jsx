import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  BarChart as ChartIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://127.0.0.1:8000';

const EducationDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  
  // Dialog states
  const [addStudentDialog, setAddStudentDialog] = useState(false);
  const [addClassDialog, setAddClassDialog] = useState(false);
  const [recordAttendanceDialog, setRecordAttendanceDialog] = useState(false);
  const [collectFeeDialog, setCollectFeeDialog] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch analytics
      const analyticsResponse = await axios.get('/api/education/analytics/', { headers });
      setAnalytics(analyticsResponse.data);

      // Fetch recent students
      const studentsResponse = await axios.get('/api/education/students/?limit=5', { headers });
      setRecentStudents(studentsResponse.data.results || []);

      // Fetch recent payments
      const paymentsResponse = await axios.get('/api/education/fee-payments/?limit=5', { headers });
      setRecentPayments(paymentsResponse.data.results || []);

      // Fetch attendance data
      const attendanceResponse = await axios.get('/api/education/attendance/?limit=10', { headers });
      setAttendanceData(attendanceResponse.data.results || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'error';
      default: return 'default';
    }
  };

  // Quick Actions handlers
  const handleAddStudent = () => {
    setAddStudentDialog(true);
  };

  const handleAddClass = () => {
    setAddClassDialog(true);
  };

  const handleRecordAttendance = () => {
    setRecordAttendanceDialog(true);
  };

  const handleCollectFee = () => {
    setCollectFeeDialog(true);
  };

  // Action handlers
  const handleViewStudent = (studentId) => {
    alert(`Viewing student details for student ID: ${studentId}`);
    // TODO: Implement student details view
  };

  const handlePrintReport = (studentId) => {
    alert(`Printing report for student ID: ${studentId}`);
    // TODO: Implement report printing
  };

  const handleViewPayment = (paymentId) => {
    alert(`Viewing payment details for payment ID: ${paymentId}`);
    // TODO: Implement payment details view
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Education Dashboard
      </Typography>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.total_students || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.total_classes || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Classes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    ₹{analytics?.total_fees_collected || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fees Collected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.attendance_rate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddStudent}
            >
              Add Student
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClass}
            >
              Add Class
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleRecordAttendance}
            >
              Record Attendance
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCollectFee}
            >
              Collect Fee
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Students */}
        <Grid xs={12} md={6} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Students
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Admission Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{new Date(student.admission_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleViewStudent(student.id)}>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print Report">
                              <IconButton size="small" onClick={() => handlePrintReport(student.id)}>
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Payments */}
        <Grid xs={12} md={6} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Fee Payments
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.student_name}</TableCell>
                        <TableCell>₹{payment.amount_paid}</TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewPayment(payment.id)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialog} onClose={() => setAddStudentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Student Name"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned Class</InputLabel>
              <Select label="Assigned Class">
                <MenuItem value="class10a">Class 10A</MenuItem>
                <MenuItem value="class10b">Class 10B</MenuItem>
                <MenuItem value="class11a">Class 11A</MenuItem>
                <MenuItem value="class11b">Class 11B</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddStudentDialog(false)}>
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog open={addClassDialog} onClose={() => setAddClassDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Class Name"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Schedule"
              multiline
              rows={3}
              margin="normal"
              placeholder="e.g., Monday to Friday, 8:00 AM - 2:00 PM"
            />
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddClassDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddClassDialog(false)}>
            Add Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Attendance Dialog */}
      <Dialog open={recordAttendanceDialog} onClose={() => setRecordAttendanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Attendance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Class</InputLabel>
              <Select label="Select Class">
                <MenuItem value="class10a">Class 10A</MenuItem>
                <MenuItem value="class10b">Class 10B</MenuItem>
                <MenuItem value="class11a">Class 11A</MenuItem>
                <MenuItem value="class11b">Class 11B</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Date"
              type="date"
              margin="normal"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Select the class and date to record attendance for all students.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecordAttendanceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setRecordAttendanceDialog(false)}>
            Record Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collect Fee Dialog */}
      <Dialog open={collectFeeDialog} onClose={() => setCollectFeeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Collect Fee</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Student</InputLabel>
              <Select label="Select Student">
                <MenuItem value="student1">Alice Johnson</MenuItem>
                <MenuItem value="student2">Bob Smith</MenuItem>
                <MenuItem value="student3">Carol Davis</MenuItem>
                <MenuItem value="student4">David Wilson</MenuItem>
                <MenuItem value="student5">Eva Brown</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Fee Type</InputLabel>
              <Select label="Fee Type">
                <MenuItem value="tuition">Tuition Fee</MenuItem>
                <MenuItem value="exam">Examination Fee</MenuItem>
                <MenuItem value="library">Library Fee</MenuItem>
                <MenuItem value="transport">Transport Fee</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select label="Payment Method">
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
                <MenuItem value="online">Online Transfer</MenuItem>
                <MenuItem value="card">Card Payment</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollectFeeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCollectFeeDialog(false)}>
            Collect Fee
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationDashboard; 