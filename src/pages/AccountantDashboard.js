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
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AccountantDashboard = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    amount: '',
    payment_method: 'cash',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const userProfile = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAccountantData();
  }, []);

  const fetchAccountantData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Fetch students, payments, and fees data
      const [studentsRes, paymentsRes, feesRes] = await Promise.all([
        fetch('/api/education/students/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/education/payments/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/education/fees/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (feesRes.ok) setFees(await feesRes.json());

    } catch (err) {
      setError('Failed to load accountant data');
      console.error('Error fetching accountant data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/education/payments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paymentForm)
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Payment recorded successfully!', severity: 'success' });
        setOpenPaymentDialog(false);
        setPaymentForm({
          student_id: '',
          amount: '',
          payment_method: 'cash',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchAccountantData();
      } else {
        setSnackbar({ open: true, message: 'Failed to record payment', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error recording payment', severity: 'error' });
    }
  };

  // Mock data for charts
  const feeCollectionData = [
    { month: 'Jan', collected: 45000, pending: 15000 },
    { month: 'Feb', collected: 52000, pending: 12000 },
    { month: 'Mar', collected: 48000, pending: 18000 },
    { month: 'Apr', collected: 55000, pending: 10000 },
    { month: 'May', collected: 60000, pending: 8000 },
    { month: 'Jun', collected: 58000, pending: 12000 }
  ];

  const paymentMethods = [
    { name: 'Cash', value: 45, color: '#4caf50' },
    { name: 'Bank Transfer', value: 30, color: '#2196f3' },
    { name: 'Credit Card', value: 15, color: '#ff9800' },
    { name: 'Cheque', value: 10, color: '#f44336' }
  ];

  const totalCollected = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalPending = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0) - totalCollected;
  const totalStudents = students.length;
  const paidStudents = students.filter(student => student.fee_status === 'paid').length;

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading accountant dashboard...</Typography>
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
          💰 Accountant Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Welcome back, {userProfile.first_name || userProfile.username || 'Accountant'}!
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalanceIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">₹{totalCollected.toLocaleString()}</Typography>
                  <Typography variant="body2">Total Collected</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PaymentIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">₹{totalPending.toLocaleString()}</Typography>
                  <Typography variant="body2">Pending Fees</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ReceiptIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{totalStudents}</Typography>
                  <Typography variant="body2">Total Students</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{Math.round((paidStudents / totalStudents) * 100) || 0}%</Typography>
                  <Typography variant="body2">Payment Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container columns={12} spacing={3} sx={{ mb: 3 }}>
        <Grid gridColumn="span 8">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Monthly Fee Collection</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={feeCollectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collected" fill="#4caf50" name="Collected" />
                  <Bar dataKey="pending" fill="#f44336" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 4">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Payment Methods</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethods.map((entry, index) => (
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

      {/* Recent Payments and Fee Status */}
      <Grid container columns={12} spacing={3}>
        <Grid gridColumn="span 6">
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Payments</Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => setOpenPaymentDialog(true)}
                >
                  Record Payment
                </Button>
              </Box>
              <List>
                {payments.slice(0, 5).map((payment, index) => (
                  <React.Fragment key={payment.id || index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <PaymentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`₹${payment.amount || 0} - ${payment.student_name || 'Student'}`}
                        secondary={`${payment.payment_method || 'Cash'} • ${payment.date || 'Today'}`}
                      />
                      <Chip label="Paid" color="success" size="small" />
                    </ListItem>
                    {index < Math.min(payments.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {payments.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No payments recorded"
                      secondary="Record your first payment to get started"
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Fee Status Overview</Typography>
                <Button
                  startIcon={<DownloadIcon />}
                  size="small"
                  variant="outlined"
                >
                  Export Report
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.slice(0, 5).map((student, index) => (
                      <TableRow key={student.id || index}>
                        <TableCell>{student.name || `Student ${index + 1}`}</TableCell>
                        <TableCell>{student.class || 'N/A'}</TableCell>
                        <TableCell>₹{student.fee_amount || 0}</TableCell>
                        <TableCell>
                          <Chip 
                            label={student.fee_status || 'Pending'} 
                            color={student.fee_status === 'paid' ? 'success' : 'warning'} 
                            size="small" 
                          />
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

      {/* Record Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record New Payment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Student</InputLabel>
            <Select
              value={paymentForm.student_id}
              onChange={(e) => setPaymentForm({...paymentForm, student_id: e.target.value})}
              label="Student"
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name || `Student ${student.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value)})}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
              label="Payment Method"
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="credit_card">Credit Card</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            value={paymentForm.description}
            onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Payment Date"
            type="date"
            value={paymentForm.date}
            onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPayment} variant="contained">Record Payment</Button>
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

export default AccountantDashboard; 