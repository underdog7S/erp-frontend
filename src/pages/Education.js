import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Box, Tabs, Tab, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress, Avatar, Grid, Select, MenuItem, InputLabel, FormControl, Menu, InputAdornment } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid } from '@mui/x-data-grid';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { format } from 'date-fns';
import FeeManagement from '../components/FeeManagement';
import { hasPermission, PERMISSIONS } from '../permissions';
import { fetchClassAttendanceStatus } from '../services/api';

// FIX: Ensure all DataGrid rows have a unique 'id' property, using a fallback if 'id' is missing.
const Education = () => {
  // Tabs
  const [tab, setTab] = useState(0);

  // User profile from localStorage
  const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
  const canManageClasses = hasPermission(userProfile, PERMISSIONS.MANAGE_CLASSES);
  const canManageAttendance = hasPermission(userProfile, PERMISSIONS.MANAGE_ATTENDANCE);
  const canManageFees = hasPermission(userProfile, PERMISSIONS.MANAGE_FEES);

  // Educator profile (example logic)
  const [educatorProfile, setEducatorProfile] = useState(null);
  
  // Initialize user profile and check if user is staff/teacher
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Example: fetch educator profile if user is educator
    api.get('/users/me/').then(res => {
      if (res.data.role === 'educator') {
        setEducatorProfile({
          name: res.data.name,
          email: res.data.email,
          avatar: res.data.avatar,
          classes: res.data.classes || [],
        });
      }
    }).catch(() => {});
  }, []);

  // Classes state
  const [classes, setClasses] = useState([]);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState("");
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({ name: "", schedule: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchClasses = async () => {
    setClassLoading(true);
    setClassError("");
    try {
      const res = await api.get("/education/classes/");
      setClasses(res.data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setClassError("You do not have permission to view classes.");
      } else if (err?.response?.status === 404) {
        setClassError("Classes not found.");
      } else {
      setClassError("Failed to load classes.");
      }
    } finally {
      setClassLoading(false);
    }
  };
  useEffect(() => { fetchClasses(); }, []);

  const handleOpenClassDialog = (cls = null) => {
    setEditingClass(cls);
    setClassForm(cls ? { name: cls.name, schedule: cls.schedule } : { name: "", schedule: "" });
    setOpenClassDialog(true);
  };
  const handleCloseClassDialog = () => {
    setOpenClassDialog(false);
    setEditingClass(null);
    setClassForm({ name: "", schedule: "" });
  };
  const handleClassFormChange = (e) => {
    const { name, value } = e.target;
    setClassForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveClass = async () => {
    if (!classForm.name || !classForm.schedule) {
      setSnackbar({ open: true, message: 'Please fill all required fields (Name, Schedule).', severity: 'error' });
      return;
    }
    try {
      if (editingClass) {
        await api.put(`/education/classes/${editingClass.id}/`, classForm);
        setSnackbar({ open: true, message: 'Class updated!', severity: 'success' });
      } else {
        await api.post(`/education/classes/`, classForm);
        setSnackbar({ open: true, message: 'Class added!', severity: 'success' });
      }
      fetchClasses();
      handleCloseClassDialog();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save class.', severity: 'error' });
    }
  };
  const handleDeleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await api.delete(`/education/classes/${id}/`);
      setSnackbar({ open: true, message: 'Class deleted!', severity: 'success' });
      fetchClasses();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete class.', severity: 'error' });
    }
  };

  // Columns for DataGrid
  const classColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'schedule', headerName: 'Schedule', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => params?.row && handleOpenClassDialog(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => params?.row && handleDeleteClass(params.row.id)}>Delete</Button>
        </Box>
      ),
      flex: 1,
    },
  ];

  // Students state
  const [students, setStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState("");
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({ name: "", email: "", admission_date: "", assigned_class: "" });

  // Student filters
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [admissionDateFrom, setAdmissionDateFrom] = useState("");
  const [admissionDateTo, setAdmissionDateTo] = useState("");

  // Update fetchStudents to use filters
  const fetchStudents = async () => {
    setStudentLoading(true);
    setStudentError("");
    try {
      const params = {};
      if (studentSearch) params.search = studentSearch;
      if (studentClass) params.class = studentClass;
      if (admissionDateFrom) params.admission_date_from = admissionDateFrom;
      if (admissionDateTo) params.admission_date_to = admissionDateTo;
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/education/students/${query ? `?${query}` : ""}`);
      setStudents(res.data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setStudentError("You do not have permission to view students.");
      } else if (err?.response?.status === 404) {
        setStudentError("Students not found.");
      } else {
      setStudentError("Failed to load students.");
      }
    } finally {
      setStudentLoading(false);
    }
  };
  useEffect(() => { fetchStudents(); }, [studentSearch, studentClass, admissionDateFrom, admissionDateTo]);

  // Fetch attendance
  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    setAttendanceError("");
    try {
      const res = await api.get("/education/attendance/");
      setAttendance(res.data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setAttendanceError("You do not have permission to view attendance.");
      } else if (err?.response?.status === 404) {
        setAttendanceError("Attendance records not found.");
      } else {
      setAttendanceError("Failed to load attendance.");
      }
    } finally {
      setAttendanceLoading(false);
    }
  };
  useEffect(() => { fetchAttendance(); }, []);

  // Fetch report cards
  const fetchReportCards = async () => {
    setReportCardLoading(true);
    setReportCardError("");
    try {
      const res = await api.get("/education/reportcards/");
      setReportCards(res.data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setReportCardError("You do not have permission to view report cards.");
      } else if (err?.response?.status === 404) {
        setReportCardError("Report cards not found.");
      } else {
      setReportCardError("Failed to load report cards.");
      }
    } finally {
      setReportCardLoading(false);
    }
  };
  useEffect(() => { fetchReportCards(); }, []);

  const handleOpenStudentDialog = (student = null) => {
    setEditingStudent(student);
    setStudentForm(student ? { name: student.name, email: student.email, admission_date: student.admission_date, assigned_class: student.assigned_class_id || "" } : { name: "", email: "", admission_date: "", assigned_class: "" });
    setOpenStudentDialog(true);
  };
  const handleCloseStudentDialog = () => {
    setOpenStudentDialog(false);
    setEditingStudent(null);
    setStudentForm({ name: "", email: "", admission_date: "", assigned_class: "" });
  };
  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveStudent = async () => {
    if (!studentForm.name || !studentForm.email || !studentForm.admission_date || !studentForm.assigned_class) {
      setSnackbar({ open: true, message: 'Please fill all required fields (Name, Email, Admission Date, Assigned Class).', severity: 'error' });
      return;
    }
    try {
      const payload = { ...studentForm };
      if (payload.assigned_class) payload.assigned_class_id = payload.assigned_class;
      delete payload.assigned_class;
      if (editingStudent) {
        await api.put(`/education/students/${editingStudent.id}/`, payload);
        setSnackbar({ open: true, message: 'Student updated!', severity: 'success' });
      } else {
        await api.post(`/education/students/`, payload);
        setSnackbar({ open: true, message: 'Student added!', severity: 'success' });
      }
      fetchStudents();
      handleCloseStudentDialog();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save student.', severity: 'error' });
    }
  };
  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api.delete(`/education/students/${id}/`);
      setSnackbar({ open: true, message: 'Student deleted!', severity: 'success' });
      fetchStudents();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete student.', severity: 'error' });
    }
  };

  // --- Departments State ---
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState("");
  useEffect(() => {
    setDepartmentsLoading(true);
    setDepartmentsError("");
    api.get('/education/departments/')
      .then(res => setDepartments(res.data))
      .catch(() => setDepartmentsError("Failed to load departments."))
      .finally(() => setDepartmentsLoading(false));
  }, []);

  // FIX: Department column now robustly displays department name by checking for undefined/null and looking up from departments list if needed.
  const studentColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'admission_date', headerName: 'Admission Date', flex: 1 },
    { field: 'assigned_class', headerName: 'Assigned Class', flex: 1, valueGetter: (params) => {
        if (!params || !params.row || !params.row.assigned_class_id || !Array.isArray(classes)) return '';
        const classObj = classes.find(cls => String(cls.id) === String(params.row.assigned_class_id));
        return classObj ? classObj.name : '';
      }
    },
    { field: 'department', headerName: 'Department', flex: 1, valueGetter: (params) => {
        if (!params || !params.row) return '';
        const dep = params.row.department;
        if (!dep) return '';
        if (typeof dep === 'object' && dep.name) return dep.name;
        if (Array.isArray(departments)) {
          const depObj = departments.find(d => String(d.id) === String(dep));
          return depObj ? depObj.name : dep;
        }
        return dep;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => handleOpenStudentDialog(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleDeleteStudent(params.row.id)}>Delete</Button>
        </Box>
      ),
      flex: 1,
    },
  ];

  // Attendance columns
  const attendanceColumns = [
    { field: 'student_name', headerName: 'Student', flex: 1, valueGetter: (params) => {
        if (!params || !params.row || !params.row.student_id || !Array.isArray(students)) return '';
        const student = students.find(s => String(s.id) === String(params.row.student_id));
        return student ? student.name : '';
      }
    },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'present', headerName: 'Present', flex: 1, valueGetter: (params) => params.row.present ? 'Yes' : 'No' },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => params?.row && handleOpenAttendanceDialog(params.row)}>Edit</Button>
        </Box>
      ),
      flex: 1,
    },
  ];

  // Report Card columns
  const reportCardColumns = [
    { field: 'student_name', headerName: 'Student', flex: 1, valueGetter: (params) => {
        if (!params || !params.row || !params.row.student_id || !Array.isArray(students)) return '';
        const student = students.find(s => String(s.id) === String(params.row.student_id));
        return student ? student.name : '';
      }
    },
    { field: 'term', headerName: 'Term', flex: 1 },
    { field: 'grades', headerName: 'Grades', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => params?.row && handleOpenReportCardDialog(params.row)}>Edit</Button>
        </Box>
      ),
      flex: 1,
    },
  ];

  // Export menu state
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const handleExportClick = (event) => setExportAnchorEl(event.currentTarget);
  const handleExportClose = () => setExportAnchorEl(null);
  // Update export to use filters
  const handleExport = async (format) => {
    handleExportClose();
    try {
      const token = localStorage.getItem('access');
      const params = {};
      if (studentSearch) params.search = studentSearch;
      if (studentClass) params.class = studentClass;
      if (admissionDateFrom) params.admission_date_from = admissionDateFrom;
      if (admissionDateTo) params.admission_date_to = admissionDateTo;
      params.format = format;
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/education/students/export/?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 'students.csv' : 'students.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setSnackbar({ open: true, message: 'Export failed.', severity: 'error' });
    }
  };

  // Report Cards state
  const [reportCards, setReportCards] = useState([]);
  const [reportCardLoading, setReportCardLoading] = useState(true);
  const [reportCardError, setReportCardError] = useState("");
  const [openReportCardDialog, setOpenReportCardDialog] = useState(false);
  const [editingReportCard, setEditingReportCard] = useState(null);
  const [reportCardForm, setReportCardForm] = useState({ student: "", term: "", grades: "" });

  // Attendance state
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Staff Attendance state
  const [staffAttendance, setStaffAttendance] = useState([]);
  const [staffAttendanceLoading, setStaffAttendanceLoading] = useState(false);
  const [staffAttendanceToday, setStaffAttendanceToday] = useState(null);
  const [staffAttendanceHistory, setStaffAttendanceHistory] = useState([]);
  const [showStaffAttendance, setShowStaffAttendance] = useState(false);

  // Attendance Dialog state
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({ student: '', date: '', present: true });

  useEffect(() => {
    // Only show check-in/out for teacher or staff
    if (canManageAttendance && userProfile) {
      setShowStaffAttendance(true);
      api.get('/education/staff/').then(res => {
        const staff = res.data.find(s =>
          (userProfile?.username && s.name === userProfile.username) ||
          (userProfile?.name && s.name === userProfile.name) ||
          (userProfile?.email && s.email === userProfile.email)
        );
        if (staff) {
          // setCurrentStaffId(staff.id); // This state was removed
          // setCurrentDepartmentId(staff.department_id || 1); // This state was removed
          localStorage.setItem('user', JSON.stringify({ ...userProfile, id: staff.id, department_id: staff.department_id || 1 }));
        }
      });
    } else {
      setShowStaffAttendance(false);
    }
  }, [canManageAttendance, userProfile]);

  // Fetch today's attendance and history for current staff
  const fetchStaffAttendance = async () => {
    // if (!currentStaffId) return; // This state was removed
    if (!userProfile?.id) return;
    setStaffAttendanceLoading(true);
    try {
      // Fetch today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const resToday = await api.get(`/education/staff-attendance/?staff=${userProfile.id}&date=${today}`); // Assuming userProfile.id is the staff ID
      setStaffAttendanceToday(resToday.data[0] || null);
      // Fetch recent history (last 7 days)
      const resHistory = await api.get(`/education/staff-attendance/?staff=${userProfile.id}`); // Assuming userProfile.id is the staff ID
      setStaffAttendanceHistory(resHistory.data.slice(0, 7));
    } catch {
      setStaffAttendanceToday(null);
      setStaffAttendanceHistory([]);
    } finally {
      setStaffAttendanceLoading(false);
    }
  };

  useEffect(() => { 
    if (userProfile?.id) {
      fetchStaffAttendance(); 
    }
  }, [userProfile?.id]); // Assuming userProfile.id is the staff ID

  // Update check-in to use new endpoint
  const handleStaffCheckIn = async () => {
    if (!canManageAttendance || !userProfile?.id) return;
    setStaffAttendanceLoading(true);
    try {
      await api.post('/education/staff-attendance/check-in/', { staff_id: userProfile.id }); // Assuming userProfile.id is the staff ID
      setSnackbar({ open: true, message: 'Checked in successfully!', severity: 'success' });
      fetchStaffAttendance();
    } catch (err) {
      let msg = 'Check-in failed.';
      if (err?.response?.data) msg += ' ' + JSON.stringify(err.response.data);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setStaffAttendanceLoading(false);
    }
  };

  // Add check-out logic
  const handleStaffCheckOut = async () => {
    if (!canManageAttendance || !userProfile?.id) return;
    setStaffAttendanceLoading(true);
    try {
      await api.post('/education/staff-attendance/check-out/', { staff_id: userProfile.id }); // Assuming userProfile.id is the staff ID
      setSnackbar({ open: true, message: 'Checked out successfully!', severity: 'success' });
      fetchStaffAttendance();
    } catch (err) {
      let msg = 'Check-out failed.';
      if (err?.response?.data) msg += ' ' + JSON.stringify(err.response.data);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setStaffAttendanceLoading(false);
    }
  };

  // Add this function near the other fetch functions
  const fetchAssignments = async () => {
    try {
      const res = await api.get('/education/assignments/');
      // If you have an assignments state, set it here:
      // setAssignments(res.data);
      console.log('Assignments:', res.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  // Attendance Dialog handlers
  const handleOpenAttendanceDialog = (attendance = null) => {
    setEditingAttendance(attendance);
    setAttendanceForm(attendance ? { 
      student: attendance.student_id || '', 
      date: attendance.date || '', 
      present: attendance.present || true 
    } : { student: '', date: '', present: true });
    setOpenAttendanceDialog(true);
  };

  const handleCloseAttendanceDialog = () => {
    setOpenAttendanceDialog(false);
    setEditingAttendance(null);
    setAttendanceForm({ student: '', date: '', present: true });
  };

  const handleAttendanceFormChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAttendance = async () => {
    if (!attendanceForm.student || !attendanceForm.date) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    try {
      const payload = { ...attendanceForm };
      if (payload.student) payload.student_id = payload.student;
      delete payload.student;
      
      if (editingAttendance) {
        await api.put(`/education/attendance/${editingAttendance.id}/`, payload);
        setSnackbar({ open: true, message: 'Attendance updated!', severity: 'success' });
      } else {
        await api.post(`/education/attendance/`, payload);
        setSnackbar({ open: true, message: 'Attendance added!', severity: 'success' });
      }
      handleCloseAttendanceDialog();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save attendance.', severity: 'error' });
    }
  };

  // Report Card Dialog */}
  const handleOpenReportCardDialog = (reportCard = null) => {
    setEditingReportCard(reportCard);
    setReportCardForm(reportCard ? {
      student: reportCard.student_id || '',
      term: reportCard.term || '',
      grades: reportCard.grades || ''
    } : { student: '', term: '', grades: '' });
    setOpenReportCardDialog(true);
  };

  const handleCloseReportCardDialog = () => {
    setOpenReportCardDialog(false);
    setEditingReportCard(null);
    setReportCardForm({ student: '', term: '', grades: '' });
  };

  const handleReportCardFormChange = (e) => {
    const { name, value } = e.target;
    setReportCardForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveReportCard = async () => {
    if (!reportCardForm.student || !reportCardForm.term || !reportCardForm.grades) {
      setSnackbar({ open: true, message: 'Please fill all required fields (Student, Term, Grades).', severity: 'error' });
      return;
    }
    try {
      const payload = { ...reportCardForm };
      if (payload.student) payload.student_id = payload.student;
      delete payload.student;
      if (editingReportCard) {
        await api.put(`/education/reportcards/${editingReportCard.id}/`, payload);
        setSnackbar({ open: true, message: 'Report Card updated!', severity: 'success' });
      } else {
        await api.post(`/education/reportcards/`, payload);
        setSnackbar({ open: true, message: 'Report Card added!', severity: 'success' });
      }
      handleCloseReportCardDialog();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save report card.', severity: 'error' });
    }
  };

  // Add state and handlers for attendance checkboxes and submission
  const [attendanceList, setAttendanceList] = useState([]);
  const handleAttendanceCheckbox = (studentId) => {
    setAttendanceList(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };
  const handleSubmitAttendance = async () => {
    if (!studentClass || attendanceList.length === 0) return;
    try {
      const date = attendanceDate;
      // Submit attendance for each student
      await Promise.all(attendanceList.map(studentId =>
        api.post('/education/attendance/', {
          student_id: studentId,
          date,
          present: true,
        })
      ));
      setSnackbar({ open: true, message: 'Attendance submitted!', severity: 'success' });
      setAttendanceList([]);
      fetchAttendanceStatus(); // Refresh the attendance list
    } catch {
      setSnackbar({ open: true, message: 'Failed to submit attendance.', severity: 'error' });
    }
  };

  const fetchAttendanceStatus = async () => {
    if (!studentClass || !attendanceDate) {
      setAttendanceStatus([]);
      return;
    }
    try {
      const data = await fetchClassAttendanceStatus(studentClass, attendanceDate);
      setAttendanceStatus(data);
    } catch {
      setAttendanceStatus([]);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
    // eslint-disable-next-line
  }, [studentClass, attendanceDate]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Education Module</Typography>
      {/* Educator Profile Card (show if user is educator) */}
      {educatorProfile && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={educatorProfile.avatar} sx={{ width: 56, height: 56 }}><PersonIcon /></Avatar>
              <Box>
                <Typography variant="h6">{educatorProfile.name}</Typography>
                <Typography color="text.secondary">{educatorProfile.email}</Typography>
                <Typography color="text.secondary">Assigned Classes: {educatorProfile.classes?.join(', ')}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        <Tab icon={<SchoolIcon />} label="Classes" />
        <Tab icon={<PersonIcon />} label="Students" />
        <Tab icon={<AttachMoneyIcon />} label="Fee Management" />
        <Tab icon={<EventAvailableIcon />} label="Attendance" />
        <Tab icon={<AssessmentIcon />} label="Report Cards" />
      </Tabs>
      {/* Classes Tab */}
      {tab === 0 && (
        <Box>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Classes</Typography>
            <Button variant="contained" onClick={() => handleOpenClassDialog()}>Add Class</Button>
          </Box>
          {classLoading ? (
            <Box textAlign="center"><CircularProgress /></Box>
          ) : classError ? (
            <Alert severity="error">{classError}</Alert>
          ) : (
            <DataGrid
              autoHeight
              rows={classes.map(cls => ({ ...cls, id: cls.id || cls.user || cls.staff || Math.random() }))}
              columns={classColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              disableSelectionOnClick
              getRowId={row => row.id || row.user || row.staff || Math.random()}
            />
          )}
          {/* Add/Edit Class Dialog */}
          <Dialog open={openClassDialog} onClose={handleCloseClassDialog}>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Add Class'}</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Class Name"
                name="name"
                value={classForm.name}
                onChange={handleClassFormChange}
                fullWidth
                required
              />
              <TextField
                margin="dense"
                label="Schedule"
                name="schedule"
                value={classForm.schedule}
                onChange={handleClassFormChange}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseClassDialog}>Cancel</Button>
              <Button onClick={handleSaveClass} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* Students Tab */}
      {tab === 1 && (
        <Box>
          {/* Filter UI */}
          <Box mb={2} display="flex" gap={2} alignItems="center">
            <TextField
              label="Search Name/Email"
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="filter-class-label">Class</InputLabel>
              <Select
                labelId="filter-class-label"
                value={studentClass}
                label="Class"
                onChange={e => setStudentClass(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {classes.map(cls => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Admission Date From"
              type="date"
              value={admissionDateFrom}
              onChange={e => setAdmissionDateFrom(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Admission Date To"
              type="date"
              value={admissionDateTo}
              onChange={e => setAdmissionDateTo(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Students</Typography>
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={() => handleOpenStudentDialog()}>Add Student</Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportClick}
              >
                Export
              </Button>
              <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportClose}>
                <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
                <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
              </Menu>
            </Box>
          </Box>
          {studentLoading ? (
            <Box textAlign="center"><CircularProgress /></Box>
          ) : studentError ? (
            <Alert severity="error">{studentError}</Alert>
          ) : (
            <DataGrid
              autoHeight
              rows={students.map(s => ({ ...s, id: s.id || s.user || s.staff || s.username || Math.random() }))}
              columns={studentColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              disableSelectionOnClick
              getRowId={row => row.id || row.user || row.staff || row.username || Math.random()}
            />
          )}
          {/* Add/Edit Student Dialog */}
          <Dialog open={openStudentDialog} onClose={handleCloseStudentDialog}>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Student Name"
                name="name"
                value={studentForm.name}
                onChange={handleStudentFormChange}
                fullWidth
                required
              />
              <TextField
                margin="dense"
                label="Email"
                name="email"
                value={studentForm.email}
                onChange={handleStudentFormChange}
                fullWidth
                required
              />
              <TextField
                margin="dense"
                label="Admission Date"
                name="admission_date"
                type="date"
                value={studentForm.admission_date}
                onChange={handleStudentFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
              {/* Assigned Class Dropdown using MUI Select */}
              <FormControl fullWidth margin="dense">
                <InputLabel id="assigned-class-label">Assigned Class</InputLabel>
                <Select
                  labelId="assigned-class-label"
                  name="assigned_class"
                  value={studentForm.assigned_class}
                  label="Assigned Class"
                  onChange={handleStudentFormChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseStudentDialog}>Cancel</Button>
              <Button onClick={handleSaveStudent} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {/* Fee Management Tab */}
      {tab === 2 && (
        <FeeManagement />
      )}
      {/* Attendance Tab */}
      {tab === 3 && (
        <>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Attendance</Typography>
              {/* Attendance data is now managed by FeeManagement, so this grid is no longer needed here */}
              {/* {attendanceLoading ? <CircularProgress /> : attendanceError ? <Alert severity="error">{attendanceError}</Alert> : (
                <DataGrid
                  autoHeight
                  rows={attendance.filter(att => att && typeof att.student !== 'undefined' && att.student !== null).map(att => ({ ...att, id: att.id || att.user || att.staff || att.student || Math.random() }))}
                  columns={attendanceColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  disableSelectionOnClick
                  sx={{ background: '#fafbfc', borderRadius: 2 }}
                  getRowId={row => row.id || row.user || row.staff || row.student || Math.random()}
                />
              )} */}
              {/* <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenAttendanceDialog()}>Add Attendance</Button> */}
            </CardContent>
          </Card>
          {/* Teacher Attendance Section - only show in Attendance tab */}
          {showStaffAttendance && canManageAttendance && (
            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1} mt={2}>
              <Box display="flex" gap={1}>
                <Button variant="contained" color="primary" onClick={handleStaffCheckIn} disabled={Boolean(staffAttendanceLoading || (staffAttendanceToday && staffAttendanceToday.check_in_time))}>
                  {staffAttendanceLoading ? <CircularProgress size={20} color="inherit" /> : 'Check In'}
                </Button>
                <Button variant="contained" color="secondary" onClick={handleStaffCheckOut} disabled={Boolean(staffAttendanceLoading || !(staffAttendanceToday && staffAttendanceToday.check_in_time) || (staffAttendanceToday && staffAttendanceToday.check_out_time))}>
                  {staffAttendanceLoading ? <CircularProgress size={20} color="inherit" /> : 'Check Out'}
                </Button>
              </Box>
              {/* Show current user's name and today's check-in/check-out times */}
              <Box mt={2} textAlign="right">
                <Typography variant="subtitle1">Your Attendance Today</Typography>
                <Typography variant="body2"><b>User:</b> {userProfile?.username || userProfile?.name || userProfile?.email || 'Unknown'}</Typography>
                {staffAttendanceToday ? (
                  <>
                    <Typography variant="body2"><b>Check-in:</b> {staffAttendanceToday.check_in_time ? new Date(staffAttendanceToday.check_in_time).toLocaleTimeString() : 'Not checked in'}</Typography>
                    <Typography variant="body2"><b>Check-out:</b> {staffAttendanceToday.check_out_time ? new Date(staffAttendanceToday.check_out_time).toLocaleTimeString() : 'Not checked out'}</Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">You have not checked in today.</Typography>
                )}
              </Box>
            </Box>
          )}
          {canManageAttendance && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>Class-wise Attendance</Typography>
                <FormControl fullWidth margin="dense" sx={{ maxWidth: 300 }}>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={studentClass}
                    onChange={e => setStudentClass(e.target.value)}
                    label="Select Class"
                  >
                    {classes.map(cls => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Date"
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  sx={{ ml: 2, minWidth: 180 }}
                  InputLabelProps={{ shrink: true }}
                />
                <Box mt={2}>
                  {attendanceStatus.length === 0 ? (
                    <Typography>No students found for this class and date.</Typography>
                  ) : (
                    attendanceStatus.map(item => (
                      <Box key={item.student.id} display="flex" alignItems="center" mb={1}>
                        <Checkbox
                          checked={attendanceList.includes(item.student.id) || !!item.present}
                          onChange={() => handleAttendanceCheckbox(item.student.id)}
                        />
                        <Typography>{item.student.name} {item.present === true ? '(Present)' : item.present === false ? '(Absent)' : ''}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={handleSubmitAttendance}
                  disabled={!Boolean(studentClass) || attendanceStatus.length === 0}
                >
                  Submit Attendance
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
      {/* Report Cards Tab */}
      {tab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Report Cards</Typography>
            {reportCardLoading ? <CircularProgress /> : reportCardError ? <Alert severity="error">{reportCardError}</Alert> : (
              <DataGrid
                autoHeight
                rows={reportCards.filter(rc => rc && typeof rc.student !== 'undefined' && rc.student !== null).map(rc => ({ ...rc, id: rc.id || rc.user || rc.staff || rc.student || Math.random() }))}
                columns={reportCardColumns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
                sx={{ background: '#fafbfc', borderRadius: 2 }}
                getRowId={row => row.id || row.user || row.staff || row.student || Math.random()}
              />
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenReportCardDialog()}>Add Report Card</Button>
          </CardContent>
        </Card>
      )}
      {/* Fee Dialog */}
      {/* Attendance Dialog */}
      <Dialog open={openAttendanceDialog} onClose={handleCloseAttendanceDialog}>
        <DialogTitle>{editingAttendance ? 'Edit Attendance' : 'Add Attendance'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Student</InputLabel>
            <Select
              name="student"
              value={attendanceForm.student}
              onChange={handleAttendanceFormChange}
              label="Student"
              required
            >
              {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            name="date"
            label="Date"
            value={attendanceForm.date}
            onChange={handleAttendanceFormChange}
            fullWidth
            required
            margin="dense"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Present</InputLabel>
            <Select
              name="present"
              value={attendanceForm.present}
              onChange={handleAttendanceFormChange}
              label="Present"
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttendanceDialog}>Cancel</Button>
          <Button onClick={handleSaveAttendance} variant="contained">{editingAttendance ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      {/* Report Card Dialog */}
      <Dialog open={openReportCardDialog} onClose={handleCloseReportCardDialog}>
        <DialogTitle>{editingReportCard ? 'Edit Report Card' : 'Add Report Card'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Student</InputLabel>
            <Select
              name="student"
              value={reportCardForm.student}
              onChange={handleReportCardFormChange}
              label="Student"
              required
            >
              {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            name="term"
            label="Term"
            value={reportCardForm.term}
            onChange={handleReportCardFormChange}
            fullWidth
            required
            margin="dense"
          />
          <TextField
            name="grades"
            label="Grades (JSON or CSV)"
            value={reportCardForm.grades}
            onChange={handleReportCardFormChange}
            fullWidth
            required
            margin="dense"
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportCardDialog}>Cancel</Button>
          <Button onClick={handleSaveReportCard} variant="contained">{editingReportCard ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Education; 