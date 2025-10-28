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
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider
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
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';

// Configure axios base URL using environment variable (same as api.js)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
// Remove /api suffix for axios since we'll add it in each call, or keep it if API_BASE_URL already ends with /api
const baseURL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL;
axios.defaults.baseURL = baseURL;

const EducationDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [addStudentDialog, setAddStudentDialog] = useState(false);
  const [addClassDialog, setAddClassDialog] = useState(false);
  const [classForm, setClassForm] = useState({
    name: '',
    schedule: '',
    capacity: ''
  });
  const [recordAttendanceDialog, setRecordAttendanceDialog] = useState(false);
  const [collectFeeDialog, setCollectFeeDialog] = useState(false);
  
  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    parent_name: '',
    parent_phone: '',
    assigned_class_id: '',
    upper_id: ''
  });
  
  const [attendanceForm, setAttendanceForm] = useState({
    selectedClass: '',
    date: new Date().toISOString().split('T')[0],
    attendance: {} // student_id: 'present' or 'absent'
  });
  
  const [feeForm, setFeeForm] = useState({
    student_id: '',
    fee_structure_id: '',
    amount: '',
    payment_method: '',
    reference: '',
    notes: ''
  });
  
  const [teacherAttendanceDialog, setTeacherAttendanceDialog] = useState(false);
  const [teacherAttendance, setTeacherAttendance] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [availableFeeStructures, setAvailableFeeStructures] = useState([]);
  
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [recentPayments, setRecentPayments] = useState([]);
  const [schoolName, setSchoolName] = useState('Zenith ERP System');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Fee Structure states
  const [feeStructureDialog, setFeeStructureDialog] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feeStructureForm, setFeeStructureForm] = useState({
    fee_type: '',
    amount: '',
    class_id: '',
    description: '',
    due_date: ''
  });
  const [editingFeeStructure, setEditingFeeStructure] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchClasses();
    fetchStudents();
    fetchRecentPayments();
    fetchSchoolName();
    fetchTeachers();
  }, []);

  const fetchSchoolName = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/users/me/', { headers });
      
      // Store user data for role-based filtering
      setCurrentUser(response.data);
      
      // Get school name from tenant
      const school = response.data.tenant || response.data.tenant_name || 'Zenith ERP System';
      setSchoolName(school);
    } catch (error) {
      // Keep default value
    }
  };

  // Filter students based on user role
  const getFilteredStudents = (allStudents) => {
    if (!currentUser || !allStudents) return allStudents;
    
    // If user is admin or principal, show all students
    if (currentUser.role === 'admin' || currentUser.role === 'principal') {
      return allStudents;
    }
    
    // If user is teacher, show only students from assigned classes
    if (currentUser.role === 'teacher') {
      const assignedClassIds = currentUser.assigned_classes?.map(cls => cls.id) || [];
      return allStudents.filter(student => {
        // Handle different data structures
        const studentClassId = student.assigned_class?.id || student.class_id;
        return assignedClassIds.includes(studentClassId);
      });
    }
    
    // For other roles, show all students (or implement specific logic)
    return allStudents;
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Try comprehensive analytics first, fallback to basic analytics
      try {
        const response = await axios.get('/api/education/analytics/comprehensive/', { headers });
        setAnalytics(response.data);
    } catch (error) {
        // Fallback to basic analytics if comprehensive is not available
        const response = await axios.get('/api/education/analytics/', { headers });
        setAnalytics(response.data);
      }
    } catch (error) {
      // Keep existing analytics or set default
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/education/classes/', { headers });
      setClasses(response.data);
    } catch (error) {
      // Keep existing classes or set default
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/education/students/', { headers });
      setStudents(response.data);
    } catch (error) {
      // Keep existing students or set default
    }
  };

  const fetchRecentPayments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/education/fee-payments/', { headers });
      setRecentPayments(response.data.slice(0, 5)); // Get only the 5 most recent
    } catch (error) {
      // Keep existing payments or set default
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/users/', { headers });
      // Filter only teachers
      const teacherUsers = response.data.results?.filter(user => user.role === 'teacher') || [];
      setTeachers(teacherUsers);
    } catch (error) {
      // Keep existing teachers or set default
    }
  };

  const fetchTeacherAttendance = async (filters = {}) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const params = new URLSearchParams();
      if (filters.staff) params.append('staff', filters.staff);
      if (filters.class) params.append('class', filters.class);
      if (filters.date) params.append('date', filters.date);
      
      const response = await axios.get(`/api/education/staff-attendance/?${params}`, { headers });
      
      // Enhance the data with teacher information
      const enhancedAttendance = response.data.map(attendance => {
        // Try multiple ways to match the teacher
        const teacher = teachers.find(t => 
          t.id === attendance.staff?.id || 
          t.user?.id === attendance.staff?.user?.id ||
          t.user?.username === attendance.staff?.user?.username ||
          t.user?.email === attendance.staff?.user?.email
        );
        
        return {
          ...attendance,
          teacherInfo: teacher || null,
          displayName: teacher?.user?.username || teacher?.user?.email || teacher?.username || teacher?.email || attendance.staff?.user?.username || attendance.staff?.user?.email || 'Unknown Teacher',
          assignedClasses: teacher?.assigned_classes || attendance.staff?.assigned_classes || []
        };
      });
      
      setTeacherAttendance(enhancedAttendance);
    } catch (error) {
      // Keep existing attendance or set default
    }
  };

  const handleAddStudent = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Debug: Log current form state
      
      // Validate required fields
      if (!studentForm.name || !studentForm.email || !studentForm.assigned_class_id) {
        alert('Please fill in all required fields (Name, Email, and Class)');
        return;
      }
      
      // Prepare data for API
      const studentData = {
        name: studentForm.name,
        email: studentForm.email,
        assigned_class_id: parseInt(studentForm.assigned_class_id),
        admission_date: new Date().toISOString().split('T')[0], // Today's date
        phone: studentForm.phone || '',
        address: studentForm.address || '',
        date_of_birth: studentForm.date_of_birth || null,
        parent_name: studentForm.parent_name || '',
        parent_phone: studentForm.parent_phone || '',
        upper_id: studentForm.upper_id || '' // Will be auto-generated if empty
      };
      
      const response = await axios.post('/api/education/students/', studentData, { headers });
      
      if (response.status === 201) {
        alert('Student added successfully!');
        setAddStudentDialog(false);
        setStudentForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          date_of_birth: '',
          parent_name: '',
          parent_phone: '',
          assigned_class_id: '',
          upper_id: ''
        });
        fetchStudents();
        fetchDashboardData();
      }
    } catch (error) {
      alert('Error adding student: ' + (error.response?.data?.detail || error.response?.data?.message || error.message));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddClass = () => {
    setAddClassDialog(true);
  };

  const handleSaveClass = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const classData = {
        name: classForm.name,
        schedule: classForm.schedule || '',
        capacity: classForm.capacity ? parseInt(classForm.capacity) : null
      };
      
      const response = await axios.post('/api/education/classes/', classData, { headers });
      
      // Refresh classes list
      await fetchClasses();
      
      // Close dialog and reset form
      setAddClassDialog(false);
      setClassForm({ name: '', schedule: '', capacity: '' });
      
      // Show success message
      alert('Class created successfully!');
      
    } catch (error) {
      alert('Error creating class: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenAddStudentDialog = () => {
    setAddStudentDialog(true);
  };

  const handleRecordAttendance = () => {
    setRecordAttendanceDialog(true);
  };

  const handleOpenCollectFeeDialog = () => {
    setCollectFeeDialog(true);
  };

  const handleOpenTeacherAttendance = () => {
    setTeacherAttendanceDialog(true);
    fetchTeacherAttendance(); // Load all attendance records
  };

  const handleExportAttendance = () => {
    if (teacherAttendance.length === 0) {
      alert('No attendance data to export');
      return;
    }

    // Create CSV content
    const headers = ['Teacher Name', 'Email', 'Date', 'Check In', 'Check Out', 'Status', 'Classes'];
    const csvContent = [
      headers.join(','),
      ...teacherAttendance.map(attendance => [
        `"${attendance.displayName}"`,
        `"${attendance.teacherInfo?.email || attendance.staff?.user?.email || 'No email'}"`,
        `"${new Date(attendance.date).toLocaleDateString('en-GB')}"`,
        `"${attendance.check_in_time ? new Date(attendance.check_in_time).toLocaleTimeString() : 'Not checked in'}"`,
        `"${attendance.check_out_time ? new Date(attendance.check_out_time).toLocaleTimeString() : 'Not checked out'}"`,
        `"${attendance.check_in_time && attendance.check_out_time ? 'Complete' : attendance.check_in_time ? 'Present' : 'Absent'}"`,
        `"${attendance.assignedClasses.map(cls => cls.name || cls).join(', ') || 'No classes assigned'}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `teacher_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fee Structure handlers
  const handleOpenFeeStructureDialog = () => {
    setFeeStructureDialog(true);
    fetchFeeStructures();
  };

  const handleCloseFeeStructureDialog = () => {
    setFeeStructureDialog(false);
    setEditingFeeStructure(null);
    setFeeStructureForm({
      fee_type: '',
      amount: '',
      class_id: '',
      description: '',
      due_date: ''
    });
  };

  const fetchFeeStructures = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/education/fees/', { headers });
      setFeeStructures(response.data);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const handleSaveFeeStructure = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Validate required fields
      if (!feeStructureForm.fee_type || !feeStructureForm.amount || !feeStructureForm.class_id) {
        alert('Please fill in all required fields (Fee Type, Amount, Class)');
        return;
      }

      const feeStructureData = {
        fee_type: feeStructureForm.fee_type,
        amount: parseFloat(feeStructureForm.amount),
        class_obj_id: parseInt(feeStructureForm.class_id),
        description: feeStructureForm.description,
        due_date: feeStructureForm.due_date || null
      };

      console.log('Sending fee structure data:', feeStructureData);

      if (editingFeeStructure) {
        // Update existing fee structure
        await axios.put(`/api/education/fees/${editingFeeStructure.id}/`, feeStructureData, { headers });
        alert('Fee structure updated successfully!');
      } else {
        // Create new fee structure
        await axios.post('/api/education/fees/', feeStructureData, { headers });
        alert('Fee structure created successfully!');
      }

      handleCloseFeeStructureDialog();
      fetchFeeStructures();
      fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Error saving fee structure:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to save fee structure: ' + (error.response?.data?.error || error.response?.data || error.message));
    }
  };

  const handleEditFeeStructure = (feeStructure) => {
    setEditingFeeStructure(feeStructure);
    setFeeStructureForm({
      fee_type: feeStructure.fee_type || '',
      amount: feeStructure.amount || '',
      class_id: feeStructure.class_obj?.id || feeStructure.class_obj || '',
      description: feeStructure.description || '',
      due_date: feeStructure.due_date || ''
    });
    setFeeStructureDialog(true);
  };

  const handleDeleteFeeStructure = async (feeStructureId) => {
    if (!window.confirm('Are you sure you want to delete this fee structure?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/education/fees/${feeStructureId}/`, { headers });
      alert('Fee structure deleted successfully!');
      fetchFeeStructures();
      fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      alert('Failed to delete fee structure. Please try again.');
    }
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

  const handlePrintReceipt = (payment) => {
    // Create a window for printing receipt
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .receipt-title { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .receipt-info { margin: 10px 0; }
          .receipt-table { width: 100%; margin: 20px 0; }
          .receipt-table td { padding: 5px 10px; border-bottom: 1px solid #ddd; }
          .receipt-table td.label { font-weight: bold; width: 40%; }
          .amount-section { text-align: right; margin-top: 30px; }
          .total-amount { font-size: 20px; font-weight: bold; color: #333; }
          .footer { text-align: center; margin-top: 50px; color: #666; }
          @media print {
            body { padding: 0; }
            @page { size: A4; margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="receipt-title">FEE PAYMENT RECEIPT</div>
          <div>${schoolName}</div>
        </div>
        
        <table class="receipt-table">
          <tr><td class="label">Receipt Number:</td><td>${payment.receipt_number || `REC-${payment.id}`}</td></tr>
          <tr><td class="label">Date:</td><td>${new Date(payment.payment_date).toLocaleDateString()}</td></tr>
          <tr><td class="label">Student Name:</td><td>${payment.student?.name || 'N/A'}</td></tr>
          <tr><td class="label">Upper ID:</td><td>${payment.student?.upper_id || 'N/A'}</td></tr>
          <tr><td class="label">Email:</td><td>${payment.student?.email || 'N/A'}</td></tr>
          <tr><td class="label">Class:</td><td>${payment.student?.assigned_class?.name || 'N/A'}</td></tr>
          <tr><td class="label">Fee Type:</td><td>${payment.fee_structure?.fee_type || 'N/A'}</td></tr>
          <tr><td class="label">Payment Method:</td><td>${payment.payment_method}</td></tr>
          ${payment.notes ? `<tr><td class="label">Notes:</td><td>${payment.notes}</td></tr>` : ''}
        </table>
        
        <div class="amount-section">
          <div class="receipt-info">
            <strong>Amount Paid:</strong> ₹${parseFloat(payment.amount_paid || 0).toFixed(2)}
          </div>
          ${payment.fee_structure ? `
            <div class="receipt-info">
              <strong>Total Fee:</strong> ₹${parseFloat(payment.fee_structure.amount || 0).toFixed(2)}
            </div>
            <div class="receipt-info">
              <strong>Remaining:</strong> ₹${Math.max(0, parseFloat(payment.fee_structure.amount || 0) - parseFloat(payment.amount_paid || 0)).toFixed(2)}
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>This is a computer generated receipt.</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleSaveAttendance = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Validate required fields
      if (!attendanceForm.selectedClass || !attendanceForm.date) {
        alert('Please select a class and date');
        return;
      }
      
      // Prepare attendance data
      const attendanceData = {
        class_id: attendanceForm.selectedClass,
        date: attendanceForm.date,
        attendance_records: Object.entries(attendanceForm.attendance).map(([student_id, status]) => ({
          student_id: parseInt(student_id),
          present: status === 'present'
        }))
      };
      
      // TODO: Implement API call to save attendance
      alert('Attendance saved successfully!');
      setRecordAttendanceDialog(false);
      setAttendanceForm({
        selectedClass: '',
        date: new Date().toISOString().split('T')[0],
        attendance: {}
      });
    } catch (error) {
      alert('Error saving attendance: ' + error.message);
    }
  };

  // Load fee structures when student is selected
  const handleStudentSelection = async (studentId) => {
    setFeeForm({...feeForm, student_id: studentId, fee_structure_id: ''}); // Reset fee structure
    
    const selectedStudent = students.find(s => s.id == studentId);
    if (!selectedStudent || !selectedStudent.assigned_class) {
      setAvailableFeeStructures([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/education/fees/', { headers });
      
      const studentClassId = typeof selectedStudent.assigned_class === 'object' 
        ? selectedStudent.assigned_class.id 
        : selectedStudent.assigned_class;
      
      const studentClassFeeStructures = response.data.filter(fs => 
        Number(fs.class_obj?.id) === Number(studentClassId)
      );
      
      setAvailableFeeStructures(studentClassFeeStructures);
    } catch (error) {
      setAvailableFeeStructures([]);
    }
  };

  const handleCollectFee = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Validate required fields
      if (!feeForm.student_id || !feeForm.fee_structure_id || !feeForm.amount || !feeForm.payment_method) {
        alert('Please fill in all required fields (Student, Fee Type, Amount, Payment Method)');
        return;
      }
      
      const selectedFeeStructure = availableFeeStructures.find(fs => fs.id === parseInt(feeForm.fee_structure_id));
      if (!selectedFeeStructure) {
        alert('Please select a valid fee type');
        return;
      }
      
      // Map payment method to uppercase format expected by backend
      const paymentMethodMap = {
        'cash': 'CASH',
        'cheque': 'CHEQUE',
        'online': 'ONLINE',
        'card': 'CARD',
        'upi': 'UPI',
        'bank_transfer': 'BANK_TRANSFER'
      };
      
      const paymentMethod = paymentMethodMap[feeForm.payment_method.toLowerCase()] || feeForm.payment_method.toUpperCase();
      
      // Calculate remaining amount
      const totalDue = parseFloat(selectedFeeStructure.amount);
      const amountPaid = parseFloat(feeForm.amount);
      
      // Prepare fee payment data
      const feePaymentData = {
        student_id: parseInt(feeForm.student_id),
        fee_structure_id: selectedFeeStructure.id,
        amount_paid: amountPaid,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().split('T')[0],
        receipt_number: feeForm.reference || '',
        notes: feeForm.notes || '',
        discount_amount: 0,
        discount_reason: ''
      };
      
      // Make API call to collect fee
      const response = await axios.post('/api/education/fee-payments/', feePaymentData, { headers });
      
      if (response.status === 201) {
        alert('Fee collected successfully!');
        setCollectFeeDialog(false);
        setFeeForm({
          student_id: '',
          fee_structure_id: '',
          amount: '',
          payment_method: '',
          reference: '',
          notes: ''
        });
        setAvailableFeeStructures([]);
        // Refresh dashboard data
        fetchDashboardData();
        fetchRecentPayments();
      }
    } catch (error) {
      alert('Error collecting fee: ' + (error.response?.data?.detail || error.message));
    }
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {currentUser?.role === 'teacher' 
                      ? getFilteredStudents(students).length 
                      : (analytics?.overview?.total_students || analytics?.total_students || 0)
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ClassIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.overview?.total_classes || analytics?.total_classes || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Classes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.overview?.total_teachers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Teachers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    ₹{analytics?.overview?.total_fees_collected || analytics?.total_fees_collected || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fees Collected
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
            <Tooltip title="Add new students to the system">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
                onClick={handleOpenAddStudentDialog}
            >
              Add Student
            </Button>
            </Tooltip>
            <Tooltip title="Create new classes">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClass}
            >
              Add Class
            </Button>
            </Tooltip>
            <Tooltip title="Record daily attendance">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleRecordAttendance}
            >
              Record Attendance
            </Button>
            </Tooltip>
            <Tooltip title="Collect fees from students">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
                onClick={handleOpenCollectFeeDialog}
            >
              Collect Fee
            </Button>
            </Tooltip>
            <Tooltip title="Manage teacher attendance">
              <Button
                variant="contained"
                startIcon={<CalendarIcon />}
                onClick={handleOpenTeacherAttendance}
              >
                Teacher Attendance
              </Button>
            </Tooltip>
            <Tooltip title="Set up fee structures for classes">
              <Button
                variant="contained"
                startIcon={<MoneyIcon />}
                onClick={handleOpenFeeStructureDialog}
              >
                Manage Fee Structure
              </Button>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Class Analytics" />
            <Tab label="Student Analytics" />
            <Tab label="Teacher Analytics" />
            <Tab label="Fee Analytics" />
          </Tabs>

            {/* Class Analytics Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Class-wise Analytics
                </Typography>
                {analytics?.class_analytics && analytics.class_analytics.length > 0 ? (
                  analytics.class_analytics.map((classData) => (
                  <Accordion key={classData.class_id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" justifyContent="space-between" width="100%" mr={2}>
                        <Typography variant="h6">{classData.class_name}</Typography>
                        <Box display="flex" gap={2}>
                          <Chip label={`${classData.student_count} Students`} color="primary" />
                          <Chip label={`${classData.attendance_today.percentage}% Attendance`} color="success" />
                          <Chip label={`${classData.fee_summary.collection_percentage}% Fees`} color="info" />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Students ({classData.student_count})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Present Today: {classData.attendance_today.present} | 
                            Absent Today: {classData.attendance_today.absent}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={classData.attendance_today.percentage} 
                            sx={{ mt: 1 }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Fee Collection
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Collected: ₹{classData.fee_summary.collected} | 
                            Pending: ₹{classData.fee_summary.pending}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={classData.fee_summary.collection_percentage} 
                            sx={{ mt: 1 }}
                          />
                          {/* Fee Type Breakdown */}
                          {classData.fee_breakdown && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Fee Types:
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {Object.entries(classData.fee_breakdown).map(([feeType, amount]) => (
                                  <Chip 
                                    key={feeType}
                                    label={`${feeType}: ₹${amount}`}
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="subtitle1" gutterBottom>
                            Teachers
                          </Typography>
                          {classData.teachers.map((teacher) => (
                            <Chip 
                              key={teacher.id} 
                              label={teacher.name} 
                              variant="outlined" 
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Class Analytics Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Class analytics will appear here once you have classes with students and teachers assigned.
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 2 }}
                      onClick={() => setAddClassDialog(true)}
                    >
                      Add Your First Class
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Student Analytics Tab */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Student-wise Analytics
                </Typography>
                {analytics?.student_analytics && analytics.student_analytics.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Upper ID</TableCell>
                          <TableCell>Class</TableCell>
                          <TableCell>Fee Status</TableCell>
                          <TableCell>Attendance</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredStudents(analytics.student_analytics).map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <Chip label={student.upper_id} color="primary" size="small" />
                          </TableCell>
                          <TableCell>{student.class_name}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {student.fee_status.percentage}% Paid
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={student.fee_status.percentage} 
                                size="small"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${student.attendance_percentage}%`} 
                              color={student.attendance_percentage >= 80 ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Student Analytics Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Student analytics will appear here once you have students with fee and attendance data.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Teacher Analytics Tab */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Teacher-wise Analytics
                </Typography>
                {analytics?.teacher_analytics && analytics.teacher_analytics.length > 0 ? (
                  <Grid container spacing={2}>
                    {analytics.teacher_analytics.map((teacher) => (
                    <Grid size={{ xs: 12, md: 6 }} key={teacher.teacher_id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{teacher.name}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {teacher.email}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">
                            Students Taught: {teacher.students_taught}
                          </Typography>
                          <Typography variant="body2">
                            Attendance Records: {teacher.attendance_records}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            Classes: {teacher.assigned_classes.join(', ')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Teacher Analytics Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Teacher analytics will appear here once you have teachers assigned to classes.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Fee Analytics Tab */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Fee Collection Analytics
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Overall Fee Status
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          ₹{analytics?.overview?.total_fees_collected || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Collected out of ₹{analytics?.overview?.total_fees_due || 0}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={analytics?.overview?.collection_percentage || 0} 
                          sx={{ mt: 2 }}
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {analytics?.overview?.collection_percentage || 0}% Collection Rate
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Monthly Trends
                        </Typography>
                        {analytics?.monthly_fee_trends?.map((month) => (
                          <Box key={month.month} display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">{month.month}</Typography>
                            <Typography variant="body2">₹{month.amount}</Typography>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

      {/* Recent Activity */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Recent Students */}
        <Grid size={{ xs: 12, md: 6 }}>
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
                      <TableCell>Upper ID</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Admission Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredStudents(students).slice(0, 5).map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Chip label={student.upper_id} color="primary" size="small" />
                        </TableCell>
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
        <Grid size={{ xs: 12, md: 6 }}>
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
                      <TableCell>Fee Type</TableCell>
                      <TableCell>Amount Paid</TableCell>
                      <TableCell>Remaining</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPayments.length > 0 ? (
                      recentPayments.map((payment) => {
                        // Calculate remaining amount - ensure numeric values
                        const totalFee = parseFloat(payment.fee_structure?.amount) || 0;
                        const amountPaid = parseFloat(payment.amount_paid) || 0;
                        const remaining = Math.max(0, totalFee - amountPaid);
                        const isFullyPaid = remaining <= 0.01; // Allow for small floating point errors
                        
                        return (
                      <TableRow key={payment.id}>
                            <TableCell>{payment.student?.name || 'Unknown Student'}</TableCell>
                            <TableCell>{payment.fee_structure?.fee_type || 'N/A'}</TableCell>
                            <TableCell>₹{amountPaid.toFixed(2)}</TableCell>
                            <TableCell>
                              <Box>
                                <Chip 
                                  label={isFullyPaid ? 'Paid' : `₹${remaining.toFixed(2)}`} 
                                  color={isFullyPaid ? 'success' : 'warning'}
                                  size="small"
                                />
                                {!isFullyPaid && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {payment.fee_structure?.fee_type} Fee Remaining
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Print Receipt">
                                  <IconButton size="small" onClick={() => handlePrintReceipt(payment)}>
                                    <PrintIcon />
                                  </IconButton>
                                </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewPayment(payment.id)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                              </Box>
                        </TableCell>
                      </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No recent payments to display
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

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialog} onClose={() => setAddStudentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Student Name"
                  value={studentForm.name}
                  onChange={(e) => {
                    setStudentForm({...studentForm, name: e.target.value});
                  }}
              margin="normal"
              required
            />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
                  value={studentForm.email}
                  onChange={(e) => {
                    setStudentForm({...studentForm, email: e.target.value});
                  }}
              margin="normal"
              required
            />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Upper ID (Auto-generated if empty)"
                  value={studentForm.upper_id}
                  onChange={(e) => setStudentForm({...studentForm, upper_id: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
              margin="normal"
            />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={studentForm.date_of_birth}
                  onChange={(e) => setStudentForm({...studentForm, date_of_birth: e.target.value})}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned Class</InputLabel>
                  <Select
                    value={studentForm.assigned_class_id}
                    onChange={(e) => {
                      setStudentForm({...studentForm, assigned_class_id: e.target.value});
                    }}
                    label="Assigned Class"
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                    ))}
              </Select>
            </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Parent Name"
                  value={studentForm.parent_name}
                  onChange={(e) => setStudentForm({...studentForm, parent_name: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Parent Phone"
                  value={studentForm.parent_phone}
                  onChange={(e) => setStudentForm({...studentForm, parent_phone: e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid size={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
              margin="normal"
            />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStudent}>
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog open={addClassDialog} onClose={() => {
        setAddClassDialog(false);
        setClassForm({ name: '', schedule: '', capacity: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Class Name"
              margin="normal"
              required
              value={classForm.name}
              onChange={(e) => setClassForm({...classForm, name: e.target.value})}
            />
            <TextField
              fullWidth
              label="Schedule"
              multiline
              rows={3}
              margin="normal"
              placeholder="e.g., Monday to Friday, 8:00 AM - 2:00 PM"
              value={classForm.schedule}
              onChange={(e) => setClassForm({...classForm, schedule: e.target.value})}
            />
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              margin="normal"
              value={classForm.capacity}
              onChange={(e) => setClassForm({...classForm, capacity: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddClassDialog(false);
            setClassForm({ name: '', schedule: '', capacity: '' });
          }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveClass}
            disabled={!classForm.name.trim()}
          >
            Add Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Attendance Dialog */}
      <Dialog open={recordAttendanceDialog} onClose={() => setRecordAttendanceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Record Attendance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Class</InputLabel>
              <Select 
                label="Select Class"
                value={attendanceForm.selectedClass}
                onChange={(e) => setAttendanceForm({...attendanceForm, selectedClass: e.target.value})}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Date"
              type="date"
              margin="normal"
              value={attendanceForm.date}
              onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})}
            />
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Students in Selected Class
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Upper ID</TableCell>
                    <TableCell>Present</TableCell>
                    <TableCell>Absent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Chip label={student.upper_id} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant={attendanceForm.attendance[student.id] === 'present' ? 'contained' : 'outlined'}
                          color="success" 
                          size="small"
                          onClick={() => {
                            const newAttendance = {...attendanceForm.attendance};
                            newAttendance[student.id] = 'present';
                            setAttendanceForm({...attendanceForm, attendance: newAttendance});
                          }}
                        >
                          Present
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant={attendanceForm.attendance[student.id] === 'absent' ? 'contained' : 'outlined'}
                          color="error" 
                          size="small"
                          onClick={() => {
                            const newAttendance = {...attendanceForm.attendance};
                            newAttendance[student.id] = 'absent';
                            setAttendanceForm({...attendanceForm, attendance: newAttendance});
                          }}
                        >
                          Absent
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Click Present or Absent for each student to record their attendance.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecordAttendanceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAttendance}>
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collect Fee Dialog */}
      <Dialog open={collectFeeDialog} onClose={() => setCollectFeeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Collect Fee</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Student Search */}
            <TextField
              fullWidth
              label="Search Students"
              placeholder="Search by name, ID, or email..."
              margin="normal"
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Select Student</InputLabel>
              <Select 
                label="Select Student"
                value={feeForm.student_id}
                onChange={(e) => handleStudentSelection(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {getFilteredStudents(students)
                  .filter(student => 
                    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                    student.upper_id.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                    student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
                  )
                  .map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {student.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {student.upper_id} | Class: {student.assigned_class?.name || 'No Class'} | Email: {student.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required disabled={availableFeeStructures.length === 0}>
              <InputLabel>Select Fee Type</InputLabel>
              <Select 
                label="Select Fee Type"
                value={feeForm.fee_structure_id}
                onChange={(e) => setFeeForm({...feeForm, fee_structure_id: e.target.value})}
              >
                {availableFeeStructures.map((feeStructure) => (
                  <MenuItem key={feeStructure.id} value={feeStructure.id}>
                    {feeStructure.fee_type} - ₹{feeStructure.amount}
                  </MenuItem>
                ))}
                {availableFeeStructures.length === 0 && (
                  <MenuItem disabled>No fee structures available for this class</MenuItem>
                )}
              </Select>
            </FormControl>
            {availableFeeStructures.length > 0 && feeForm.fee_structure_id && (
              <Typography variant="body2" color="primary.main" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Total Due: ₹{availableFeeStructures.find(fs => fs.id === parseInt(feeForm.fee_structure_id))?.amount || 0}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              margin="normal"
              value={feeForm.amount}
              onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Payment Method</InputLabel>
              <Select 
                label="Payment Method"
                value={feeForm.payment_method}
                onChange={(e) => setFeeForm({...feeForm, payment_method: e.target.value})}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
                <MenuItem value="online">Online Transfer</MenuItem>
                <MenuItem value="card">Card Payment</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Payment Reference/Transaction ID"
              margin="normal"
              value={feeForm.reference}
              onChange={(e) => setFeeForm({...feeForm, reference: e.target.value})}
              placeholder="Optional: Enter transaction ID or reference number"
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              margin="normal"
              value={feeForm.notes}
              onChange={(e) => setFeeForm({...feeForm, notes: e.target.value})}
              placeholder="Additional notes about this payment"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollectFeeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCollectFee}>
            Collect Fee
          </Button>
        </DialogActions>
      </Dialog>
      {/* Teacher Attendance Dialog */}
      <Dialog open={teacherAttendanceDialog} onClose={() => setTeacherAttendanceDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Teacher Attendance Management</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Teacher</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => fetchTeacherAttendance({ staff: e.target.value })}
                    label="Filter by Teacher"
                  >
                    <MenuItem value="">All Teachers</MenuItem>
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.username || teacher.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Class</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => fetchTeacherAttendance({ class: e.target.value })}
                    label="Filter by Class"
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="Filter by Date"
                  type="date"
                  value=""
                  onChange={(e) => fetchTeacherAttendance({ date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => fetchTeacherAttendance()}
                  sx={{ height: '56px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>

            {/* Attendance Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Teacher</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Classes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teacherAttendance.length > 0 ? (
                    teacherAttendance.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {attendance.displayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {attendance.teacherInfo?.user?.email || attendance.teacherInfo?.email || attendance.staff?.user?.email || 'No email'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(attendance.date).toLocaleDateString('en-GB')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(attendance.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {attendance.check_in_time ? (
                            <Box>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                {new Date(attendance.check_in_time).toLocaleTimeString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(attendance.check_in_time).toLocaleDateString()}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="error.main">
                              Not checked in
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {attendance.check_out_time ? (
                            <Box>
                              <Typography variant="body2" fontWeight="bold" color="info.main">
                                {new Date(attendance.check_out_time).toLocaleTimeString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(attendance.check_out_time).toLocaleDateString()}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="warning.main">
                              Not checked out
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={attendance.check_in_time && attendance.check_out_time ? 'Complete' : 
                                   attendance.check_in_time ? 'Present' : 'Absent'} 
                            color={attendance.check_in_time && attendance.check_out_time ? 'success' : 
                                   attendance.check_in_time ? 'primary' : 'default'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {attendance.assignedClasses.length > 0 ? (
                            <Box>
                              {attendance.assignedClasses.map((cls, index) => (
                                <Chip 
                                  key={index} 
                                  label={cls.name || cls} 
                                  size="small" 
                                  color="secondary" 
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No classes assigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" startIcon={<ViewIcon />}>
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Stats */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Attendance Summary</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {teacherAttendance.filter(a => a.check_in_time).length}
                    </Typography>
                    <Typography variant="body2">Present Today</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {teacherAttendance.filter(a => a.check_in_time && a.check_out_time).length}
                    </Typography>
                    <Typography variant="body2">Complete Attendance</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {Math.max(0, teachers.length - teacherAttendance.filter(a => a.check_in_time).length)}
                    </Typography>
                    <Typography variant="body2">Absent Today</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {teachers.length}
                    </Typography>
                    <Typography variant="body2">Total Teachers</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Additional Stats */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="warning.main">
                        {teacherAttendance.filter(a => a.check_in_time && !a.check_out_time).length}
                      </Typography>
                      <Typography variant="body2">Checked In Only</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="secondary.main">
                        {teacherAttendance.length > 0 ? Math.round((teacherAttendance.filter(a => a.check_in_time).length / teacherAttendance.length) * 100) : 0}%
                      </Typography>
                      <Typography variant="body2">Attendance Rate</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="text.secondary">
                        {teacherAttendance.length}
                      </Typography>
                      <Typography variant="body2">Total Records</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeacherAttendanceDialog(false)}>Close</Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handleExportAttendance}
            disabled={teacherAttendance.length === 0}
          >
            Export CSV
          </Button>
          <Button variant="contained" onClick={() => fetchTeacherAttendance()}>
            Refresh
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fee Structure Dialog */}
      <Dialog open={feeStructureDialog} onClose={handleCloseFeeStructureDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFeeStructure ? 'Edit Fee Structure' : 'Add New Fee Structure'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Fee Type *</InputLabel>
                  <Select
                    value={feeStructureForm.fee_type}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, fee_type: e.target.value})}
                    label="Fee Type *"
                  >
                    <MenuItem value="TUITION">Tuition Fee</MenuItem>
                    <MenuItem value="EXAM">Examination Fee</MenuItem>
                    <MenuItem value="LIBRARY">Library Fee</MenuItem>
                    <MenuItem value="TRANSPORT">Transport Fee</MenuItem>
                    <MenuItem value="HOSTEL">Hostel Fee</MenuItem>
                    <MenuItem value="OTHER">Other Fee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Amount *"
                  type="number"
                  value={feeStructureForm.amount}
                  onChange={(e) => setFeeStructureForm({...feeStructureForm, amount: e.target.value})}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Class *</InputLabel>
                  <Select
                    value={feeStructureForm.class_id}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, class_id: e.target.value})}
                    label="Class *"
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={feeStructureForm.due_date}
                  onChange={(e) => setFeeStructureForm({...feeStructureForm, due_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={feeStructureForm.description}
                  onChange={(e) => setFeeStructureForm({...feeStructureForm, description: e.target.value})}
                  placeholder="Optional description for this fee structure"
                />
              </Grid>
            </Grid>

            {/* Existing Fee Structures */}
            {feeStructures.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Existing Fee Structures
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fee Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {feeStructures.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>{fee.fee_type}</TableCell>
                          <TableCell>₹{parseFloat(fee.amount).toFixed(2)}</TableCell>
                          <TableCell>{fee.class_obj?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {fee.due_date ? new Date(fee.due_date).toLocaleDateString('en-GB') : 'No due date'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleEditFeeStructure(fee)}
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteFeeStructure(fee.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeeStructureDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFeeStructure}>
            {editingFeeStructure ? 'Update Fee Structure' : 'Create Fee Structure'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationDashboard; 