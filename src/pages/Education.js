/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, no-console */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { Box, Tabs, Tab, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress, Avatar, Select, MenuItem, InputLabel, FormControl, Menu, InputAdornment, Chip, Grid, LinearProgress, Tooltip, IconButton, Badge } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
// Removed unused imports
import Checkbox from '@mui/material/Checkbox';
import { format } from 'date-fns';
import FeeManagement from '../components/FeeManagement';
import { hasPermission, PERMISSIONS } from '../permissions';
import { fetchClassAttendanceStatus } from '../services/api';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SubjectIcon from '@mui/icons-material/Subject';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import QuizIcon from '@mui/icons-material/Quiz';
import GradeIcon from '@mui/icons-material/Grade';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';
import CakeIcon from '@mui/icons-material/Cake';
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import MessageIcon from '@mui/icons-material/Message';
// Removed unused imports

// FIX: Ensure all DataGrid rows have a unique 'id' property, using a fallback if 'id' is missing.
const Education = () => {
  const [searchParams] = useSearchParams();
  // Tabs
  const [tab, setTab] = useState(0);
  
  // Read tab from URL params on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setTab(parseInt(tabParam, 10));
    }
  }, [searchParams]);

  // Auto-open dialogs based on URL param (without relying on tab render order)
  useEffect(() => {
    const openParam = searchParams.get('open');
    if (openParam === 'addReportCard') {
      setTimeout(() => setOpenReportCardDialog(true), 0);
    } else if (openParam === 'generateReportCard') {
      setTimeout(() => setGenerateReportCardDialogOpen(true), 0);
    }
  }, [searchParams]);

  // Removed auto-open safety net - user must click buttons

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
  const [studentForm, setStudentForm] = useState({ name: "", email: "", admission_date: "", assigned_class: "", upper_id: "", gender: "", cast: "General", religion: "", phone: "", address: "", date_of_birth: "", parent_name: "", parent_phone: "" });

  // Fee structures (used by installment dialogs in this page)
  const [feeStructures, setFeeStructures] = useState([]);

  // Student filters
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [admissionDateFrom, setAdmissionDateFrom] = useState("");
  const [admissionDateTo, setAdmissionDateTo] = useState("");

  // Class-wise filters and searches for academic entities
  const [filterClassId, setFilterClassId] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [marksEntrySearch, setMarksEntrySearch] = useState("");
  const [reportCardSearch, setReportCardSearch] = useState("");
  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [orgAnalytics, setOrgAnalytics] = useState({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    students_per_class: [],
    fees_remaining_by_class: [],
    gender_distribution_per_class: [],
    cast_distribution_per_class: [],
    upcoming_birthdays_today: [],
    student_contacts: [],
  });
  const [analyticsClassId, setAnalyticsClassId] = useState("");
  const [analyticsDate, setAnalyticsDate] = useState("");
  const [classAttendanceSummary, setClassAttendanceSummary] = useState({ present: 0, absent: 0, total: 0 });
  const [todayTeacherAttendance, setTodayTeacherAttendance] = useState({ checkins: 0, checkouts: 0 });
  const [analyticsInstallments, setAnalyticsInstallments] = useState([]);
  const [analyticsDaysAhead, setAnalyticsDaysAhead] = useState(30);

  const handleViewStudentFromAnalytics = (studentId) => {
    try {
      // Switch to Students tab and optionally set a focused student id if available
      setTab(1);
      // If a student search/filter exists, set it here (subject to implementation)
      // setStudentSearchById?.(studentId);
    } catch (e) {
      // no-op
    }
  };

  const handleSendFeeReminder = async (studentId) => {
    try {
      await api.post(`/education/students/${studentId}/fee-reminder/`);
      setSnackbar({ open: true, message: 'Reminder sent successfully.', severity: 'success' });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to send reminder.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleOpenWhatsApp = (phoneNumber, studentName, className, dueAmount = null, dueDate = null) => {
    if (!phoneNumber) {
      setSnackbar({ open: true, message: 'Phone number not available.', severity: 'warning' });
      return;
    }

    // Format phone number (remove spaces, dashes, parentheses, and + sign)
    let formattedPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    
    // Handle Indian phone numbers - always ensure 91 country code is present
    // If starts with 0, remove it first
    if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    // Now check if it already has country code 91
    if (formattedPhone.startsWith('91')) {
      // Already has 91, check if it's valid (should be 91 + 10 digits = 12 digits total)
      if (formattedPhone.length === 12 && /^91\d{10}$/.test(formattedPhone)) {
        // Valid format, use as is
        formattedPhone = formattedPhone;
      } else if (formattedPhone.length > 12) {
        // Has 91 but too many digits, might have extra characters, use as is
        formattedPhone = formattedPhone;
      } else {
        // Has 91 but not 12 digits, might be incomplete, try to fix
        if (formattedPhone.length < 12) {
          // If less than 12, it's missing digits after 91, use as is (might be valid for other countries)
          formattedPhone = formattedPhone;
        }
      }
    } else {
      // Doesn't start with 91
      // If it's exactly 10 digits (Indian mobile number), add 91
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = '91' + formattedPhone;
      }
      // If it's not 10 digits and doesn't start with 91, might be international number from another country
      // Use as is (user will need to ensure it has correct country code)
      else {
        formattedPhone = formattedPhone;
      }
    }
    
    // Final validation: Ensure the number looks valid for WhatsApp (should be numeric only)
    if (!/^\d+$/.test(formattedPhone)) {
      setSnackbar({ open: true, message: 'Invalid phone number format.', severity: 'error' });
      return;
    }

    // Create fee reminder message
    let message = `Dear Parent,\n\n`;
    message += `This is a reminder regarding fee payment for your ward *${studentName}* (Class: ${className}).\n\n`;
    
    if (dueAmount && dueDate) {
      const formattedDate = dueDate ? (typeof dueDate === 'string' ? dueDate : new Date(dueDate).toLocaleDateString('en-GB')) : '';
      message += `*Pending Amount:* ₹${Number(dueAmount).toFixed(2)}\n`;
      message += `*Due Date:* ${formattedDate}\n\n`;
    }
    
    message += `Please make the payment at the earliest convenience.\n\n`;
    message += `Thank you.\n${userProfile?.tenant?.name || 'School'}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp Web/App
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const fetchOrgAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      let data = {};
      try {
        const res = await api.get('/education/analytics/');
        data = res.data || {};
      } catch {
        data = {};
      }

      // Fallbacks if backend analytics is missing/incomplete
      const [studentsRes, classesRes, staffRes, installmentsRes] = await Promise.allSettled([
        api.get('/education/students/'),
        api.get('/education/classes/'),
        api.get('/education/staff/'),
        api.get('/education/installments/')
      ]);

      const toArray = (res) => (res?.status === 'fulfilled' ? (Array.isArray(res.value.data) ? res.value.data : (res.value.data?.results || [])) : []);
      const studentsArr = toArray(studentsRes);
      const classesArr = toArray(classesRes);
      const staffArr = toArray(staffRes);
      const installmentsArr = toArray(installmentsRes);
      setAnalyticsInstallments(installmentsArr);

      const studentsPerClass = classesArr.map(c => ({
        class_name: c.name,
        count: studentsArr.filter(s => String(s.assigned_class?.id) === String(c.id)).length
      }));

      const feesRemainingByClass = classesArr.map(c => {
        const classStudentIds = new Set(studentsArr.filter(s => String(s.assigned_class?.id) === String(c.id)).map(s => s.id));
        let studentsWithDues = 0;
        let totalDue = 0;
        installmentsArr.filter(inst => classStudentIds.has(inst.student?.id || inst.student)).forEach(inst => {
          const remaining = Number(inst.remaining_amount || 0);
          if (remaining > 0) {
            studentsWithDues += 1;
            totalDue += remaining;
          }
        });
        return { class_name: c.name, students_with_dues: studentsWithDues, total_due: Number(totalDue.toFixed(2)) };
      });

      setOrgAnalytics({
        total_students: data.total_students || data.overview?.total_students || studentsArr.length,
        total_teachers: data.total_teachers || data.overview?.total_teachers || staffArr.length,
        total_classes: data.total_classes || data.overview?.total_classes || classesArr.length,
        students_per_class: Array.isArray(data.students_per_class) && data.students_per_class.length ? data.students_per_class : studentsPerClass,
        fees_remaining_by_class: Array.isArray(data.fees_remaining_by_class) && data.fees_remaining_by_class.length ? data.fees_remaining_by_class : feesRemainingByClass,
        gender_distribution_per_class: Array.isArray(data.gender_distribution_per_class) ? data.gender_distribution_per_class : [],
        cast_distribution_per_class: Array.isArray(data.cast_distribution_per_class) ? data.cast_distribution_per_class : [],
        upcoming_birthdays_today: Array.isArray(data.upcoming_birthdays_today) ? data.upcoming_birthdays_today : [],
        student_contacts: Array.isArray(data.student_contacts) ? data.student_contacts : [],
      });
    } catch (err) {
      console.error('fetchOrgAnalytics error', err);
      setAnalyticsError('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchAnalyticsClassAttendance = async () => {
    if (!analyticsClassId) { setClassAttendanceSummary({ present: 0, absent: 0, total: 0 }); return; }
    try {
      const params = { class_id: analyticsClassId };
      if (analyticsDate) params.date = analyticsDate;
      const res = await api.get('/education/class-attendance-status/', { params });
      const list = Array.isArray(res.data) ? res.data : [];
      const present = list.filter(item => item.present).length;
      const total = list.length;
      setClassAttendanceSummary({ present, absent: Math.max(total - present, 0), total });
    } catch (err) {
      console.error('fetchAnalyticsClassAttendance error', err);
      setClassAttendanceSummary({ present: 0, absent: 0, total: 0 });
    }
  };

  const fetchTodayTeacherStats = async () => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const res = await api.get('/education/staff-attendance/', { params: { date: dateStr } });
      const list = Array.isArray(res.data) ? res.data : [];
      const checkins = list.filter(i => !!i.check_in).length;
      const checkouts = list.filter(i => !!i.check_out).length;
      setTodayTeacherAttendance({ checkins, checkouts });
    } catch (err) {
      console.error('fetchTodayTeacherStats error', err);
      setTodayTeacherAttendance({ checkins: 0, checkouts: 0 });
    }
  };

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

  // Fetch fee structures for dialogs on this page
  const fetchFeeStructures = async () => {
    try {
      const res = await api.get('/education/fees/');
      setFeeStructures(res.data || []);
    } catch (err) {
      // Non-blocking: keep empty if it fails (403 errors are expected for some roles)
      if (err?.response?.status !== 403) {
        console.warn('Failed to fetch fee structures:', err);
      }
      setFeeStructures([]);
    }
  };
  useEffect(() => { fetchFeeStructures(); }, []);

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

  // Load enhanced report card data when component mounts
  useEffect(() => {
    fetchAcademicYears();
    fetchAssessmentTypes();
  }, []);

  // Load data when switching to specific tabs
  useEffect(() => {
    if (tab === 5) { // Terms tab
      fetchTerms();
    } else if (tab === 6) { // Subjects tab
      fetchSubjects();
    } else if (tab === 7) { // Units tab
      fetchUnits();
    } else if (tab === 8) { // Assessments tab
      fetchAssessments();
    } else if (tab === 9) { // Marks Entry tab
      fetchMarksEntries();
    }
  }, [tab]);

  // Enhanced Report Card System - Fetch Functions
  const fetchAcademicYears = async () => {
    setAcademicYearsLoading(true);
    try {
      const res = await api.get("/education/academic-years/");
      setAcademicYears(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setAcademicYearsLoading(false);
    }
  };

  const fetchTerms = async (academicYearId = null) => {
    setTermsLoading(true);
    try {
      const url = academicYearId ? `/education/terms/?academic_year=${academicYearId}` : "/education/terms/";
      const res = await api.get(url);
      setTerms(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setTermsLoading(false);
    }
  };

  const fetchSubjects = async (classId = null) => {
    setSubjectsLoading(true);
    try {
      const url = classId ? `/education/subjects/?class=${classId}` : "/education/subjects/";
      const res = await api.get(url);
      setSubjects(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchUnits = async (subjectId = null) => {
    setUnitsLoading(true);
    try {
      const url = subjectId ? `/education/units/?subject=${subjectId}` : "/education/units/";
      const res = await api.get(url);
      setUnits(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setUnitsLoading(false);
    }
  };

  const fetchAssessmentTypes = async () => {
    setAssessmentTypesLoading(true);
    try {
      const res = await api.get("/education/assessment-types/");
      setAssessmentTypes(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setAssessmentTypesLoading(false);
    }
  };

  const fetchAssessments = async (termId = null, subjectId = null) => {
    setAssessmentsLoading(true);
    try {
      let url = "/education/assessments/";
      const params = new URLSearchParams();
      if (termId) params.append("term", termId);
      if (subjectId) params.append("subject", subjectId);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await api.get(url);
      setAssessments(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setAssessmentsLoading(false);
    }
  };

  const fetchMarksEntries = async (studentId = null, assessmentId = null, termId = null) => {
    setMarksEntriesLoading(true);
    try {
      let url = "/education/marks-entries/";
      const params = new URLSearchParams();
      if (studentId) params.append("student", studentId);
      if (assessmentId) params.append("assessment", assessmentId);
      if (termId) params.append("term", termId);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await api.get(url);
      setMarksEntries(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setMarksEntriesLoading(false);
    }
  };

  // Installment Management - Fetch Functions
  const fetchInstallmentPlans = async () => {
    setInstallmentPlansLoading(true);
    setInstallmentPlansError(null);
    try {
      const res = await api.get('/education/installment-plans/');
      setInstallmentPlans(res.data);
    } catch (err) {
      // Error handled silently
      setInstallmentPlansError('Failed to load installment plans');
    } finally {
      setInstallmentPlansLoading(false);
    }
  };

  const fetchInstallments = async () => {
    setInstallmentsLoading(true);
    setInstallmentsError(null);
    try {
      const res = await api.get('/education/installments/');
      setInstallments(res.data);
    } catch (err) {
      // Error handled silently
      setInstallmentsError('Failed to load installments');
    } finally {
      setInstallmentsLoading(false);
    }
  };

  const fetchStudentInstallments = async (studentId) => {
    setStudentInstallmentsLoading(true);
    try {
      const res = await api.get(`/education/students/${studentId}/installments/`);
      setStudentInstallments(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setStudentInstallmentsLoading(false);
    }
  };

  const fetchOverdueInstallments = async () => {
    setOverdueLoading(true);
    try {
      const res = await api.get('/education/installments/overdue/');
      setOverdueInstallments(res.data);
    } catch (err) {
      // Error handled silently
    } finally {
      setOverdueLoading(false);
    }
  };

  const handleOpenStudentDialog = (student = null) => {
    setEditingStudent(student);
    // Get assigned_class_id from nested object or direct field
    let assignedClassId = "";
    if (student) {
      if (student.assigned_class_id) {
        assignedClassId = String(student.assigned_class_id);
      } else if (student.assigned_class) {
        // Handle nested object
        if (typeof student.assigned_class === 'object' && student.assigned_class !== null) {
          assignedClassId = String(student.assigned_class.id || "");
        } else {
          assignedClassId = String(student.assigned_class || "");
        }
      }
    }
    
    setStudentForm(student ? { 
      name: student.name, 
      email: student.email, 
      admission_date: student.admission_date, 
      assigned_class: assignedClassId || "", 
      upper_id: student.upper_id || "",
      gender: student.gender || "",
      cast: student.cast || "General",
      religion: student.religion || "",
      phone: student.phone || "",
      address: student.address || "",
      date_of_birth: student.date_of_birth || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || ""
    } : { name: "", email: "", admission_date: "", assigned_class: "", upper_id: "", gender: "", cast: "General", religion: "", phone: "", address: "", date_of_birth: "", parent_name: "", parent_phone: "" });
    setOpenStudentDialog(true);
  };
  const handleCloseStudentDialog = () => {
    setOpenStudentDialog(false);
    setEditingStudent(null);
    setStudentForm({ name: "", email: "", admission_date: "", assigned_class: "", upper_id: "", gender: "", cast: "General", religion: "", phone: "", address: "", date_of_birth: "", parent_name: "", parent_phone: "" });
  };
  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveStudent = async () => {
    if (!studentForm.name || !studentForm.email || !studentForm.admission_date || !studentForm.assigned_class || !studentForm.cast) {
      setSnackbar({ open: true, message: 'Please fill all required fields (Name, Email, Admission Date, Assigned Class, Cast).', severity: 'error' });
      return;
    }
    try {
      const payload = { ...studentForm };
      if (payload.upper_id) payload.upper_id = String(payload.upper_id).toUpperCase();
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
      .catch((err) => {
        // Only show error if not a 403 (permission denied is expected for some roles)
        if (err?.response?.status !== 403) {
          setDepartmentsError("Failed to load departments.");
          console.warn('Failed to fetch departments:', err);
        }
      })
      .finally(() => setDepartmentsLoading(false));
  }, []);

  // FIX: Department column now robustly displays department name by checking for undefined/null and looking up from departments list if needed.
  const studentColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'gender', headerName: 'Gender', flex: 0.8 },
    { field: 'cast', headerName: 'Cast', flex: 0.8 },
    { field: 'religion', headerName: 'Religion', flex: 0.8 },
    { field: 'admission_date', headerName: 'Admission Date', flex: 1 },
    { field: 'assigned_class', headerName: 'Assigned Class', flex: 1, valueGetter: (params) => {
        if (!params || !params.row) return '';
        // Prefer nested object from API
        if (params.row.assigned_class && params.row.assigned_class.name) return params.row.assigned_class.name;
        // Fallback to id lookup
        const acId = params.row.assigned_class_id || params.row.assigned_class;
        if (!acId || !Array.isArray(classes)) return '';
        const classObj = classes.find(cls => String(cls.id) === String(acId));
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

  // Enhanced Report Card columns
  const reportCardColumns = [
    { field: 'student', headerName: 'Student', flex: 1, valueGetter: (params) => {
        return params?.row?.student?.name || 'N/A';
      }
    },
    { field: 'academic_year_name', headerName: 'Academic Year', flex: 1, valueGetter: (params) => {
        return params?.row?.academic_year_name || params?.row?.legacy_term || 'N/A';
      }
    },
    { field: 'term_name', headerName: 'Term', flex: 1, valueGetter: (params) => {
        return params?.row?.term_name || 'N/A';
      }
    },
    { field: 'class_obj_name', headerName: 'Class', flex: 1, valueGetter: (params) => {
        return params?.row?.class_obj_name || 'N/A';
      }
    },
    { field: 'total_marks', headerName: 'Total Marks', flex: 1, valueGetter: (params) => {
        return `${params?.row?.total_marks || 0}/${params?.row?.max_total_marks || 0}`;
      }
    },
    { field: 'percentage', headerName: 'Percentage', flex: 1, valueGetter: (params) => {
        return `${params?.row?.percentage || 0}%`;
      }
    },
    { field: 'grade', headerName: 'Grade', flex: 1, valueGetter: (params) => {
        return params?.row?.grade || 'N/A';
      }
    },
    { field: 'rank_in_class', headerName: 'Rank', flex: 1, valueGetter: (params) => {
        return params?.row?.rank_in_class || 'N/A';
      }
    },
    { field: 'attendance_percentage', headerName: 'Attendance', flex: 1, valueGetter: (params) => {
        return `${params?.row?.attendance_percentage || 0}%`;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => params?.row && handleOpenReportCardDialog(params.row)}>Edit</Button>
          <Button size="small" onClick={() => params?.row && handleGenerateReportCard(params.row)}>Regenerate</Button>
          <Button size="small" onClick={() => params?.row && handleViewReportCardPDF(params.row)}>View PDF</Button>
          <Button size="small" onClick={() => params?.row && handleDownloadReportCardPDF(params.row)}>Download PDF</Button>
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

  // Installment Plans state
  const [installmentPlans, setInstallmentPlans] = useState([]);
  const [installmentPlansLoading, setInstallmentPlansLoading] = useState(false);
  const [installmentPlansError, setInstallmentPlansError] = useState(null);
  const [installmentPlanDialogOpen, setInstallmentPlanDialogOpen] = useState(false);
  const [installmentPlanForm, setInstallmentPlanForm] = useState({
    fee_structure_id: '',
    name: '',
    number_of_installments: 4,
    installment_type: 'EQUAL',
    description: ''
  });

  // Installments state
  const [installments, setInstallments] = useState([]);
  const [installmentsLoading, setInstallmentsLoading] = useState(false);
  const [installmentsError, setInstallmentsError] = useState(null);
  const [installmentDialogOpen, setInstallmentDialogOpen] = useState(false);
  const [installmentForm, setInstallmentForm] = useState({
    student_id: '',
    fee_structure_id: '',
    installment_plan_id: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  // Student Installments state
  const [studentInstallments, setStudentInstallments] = useState([]);
  const [studentInstallmentsLoading, setStudentInstallmentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Overdue Installments state
  const [overdueInstallments, setOverdueInstallments] = useState([]);
  const [overdueLoading, setOverdueLoading] = useState(false);

  // Enhanced Report Card System State
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [marksEntries, setMarksEntries] = useState([]);
  
  // Loading states
  const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [assessmentTypesLoading, setAssessmentTypesLoading] = useState(false);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [marksEntriesLoading, setMarksEntriesLoading] = useState(false);
  
  // Dialog states
  const [openAcademicYearDialog, setOpenAcademicYearDialog] = useState(false);
  const [openTermDialog, setOpenTermDialog] = useState(false);
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
  const [openUnitDialog, setOpenUnitDialog] = useState(false);
  const [openAssessmentTypeDialog, setOpenAssessmentTypeDialog] = useState(false);
  const [openAssessmentDialog, setOpenAssessmentDialog] = useState(false);
  const [openMarksEntryDialog, setOpenMarksEntryDialog] = useState(false);
  const [openReportCardGenerateDialog, setOpenReportCardGenerateDialog] = useState(false);
  
  // Form states
  const [academicYearForm, setAcademicYearForm] = useState({ name: "", start_date: "", end_date: "", is_current: false });
  const [termForm, setTermForm] = useState({ academic_year_id: "", name: "", order: 1, start_date: "", end_date: "", is_active: true });
  const [subjectForm, setSubjectForm] = useState({ class_obj_id: "", name: "", code: "", max_marks: 100, has_practical: false, practical_max_marks: 0, order: 1 });
  const [unitForm, setUnitForm] = useState({ subject_id: "", name: "", number: 1, description: "", order: 1 });
  const [assessmentTypeForm, setAssessmentTypeForm] = useState({ name: "", code: "", max_marks: 100, weightage: 100, order: 1 });
  const [assessmentForm, setAssessmentForm] = useState({ subject_id: "", term_id: "", assessment_type_id: "", unit_id: "", name: "", date: "", max_marks: 100, passing_marks: 40 });
  const [marksEntryForm, setMarksEntryForm] = useState({ student_id: "", assessment_id: "", marks_obtained: "", max_marks: "", remarks: "" });
  const [reportCardGenerateForm, setReportCardGenerateForm] = useState({ student_id: "", academic_year_id: "", term_id: "", teacher_remarks: "", principal_remarks: "", conduct_grade: "", issued_date: "" });
  
  // Editing states
  const [editingAcademicYear, setEditingAcademicYear] = useState(null);
  const [editingTerm, setEditingTerm] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingAssessmentType, setEditingAssessmentType] = useState(null);

  // Subject dialog handlers
  const handleOpenSubjectDialog = (subject = null) => {
    setEditingSubject(subject);
    if (subject) {
      setSubjectForm({
        class_obj_id: subject.class_obj?.id || subject.class_obj_id || "",
        name: subject.name || "",
        code: subject.code || "",
        max_marks: subject.max_marks ?? 100,
        has_practical: !!subject.has_practical,
        practical_max_marks: subject.practical_max_marks ?? 0,
        order: subject.order ?? 1
      });
    } else {
      setSubjectForm({ class_obj_id: "", name: "", code: "", max_marks: 100, has_practical: false, practical_max_marks: 0, order: 1 });
    }
    setOpenSubjectDialog(true);
  };

  // Unit dialog handlers
  const handleOpenUnitDialog = (unit = null) => {
    setEditingUnit(unit);
    if (unit) {
      setUnitForm({
        subject_id: unit.subject?.id || unit.subject_id || '',
        name: unit.name || '',
        number: unit.number ?? 1,
        description: unit.description || '',
        order: unit.order ?? 1
      });
    } else {
      setUnitForm({ subject_id: '', name: '', number: 1, description: '', order: 1 });
    }
    setOpenUnitDialog(true);
  };

  // Assessment dialog handlers
  const handleOpenAssessmentDialog = (assessment = null) => {
    setEditingAssessment(assessment);
    if (assessment) {
      setAssessmentForm({
        subject_id: assessment.subject?.id || assessment.subject_id || '',
        term_id: assessment.term?.id || assessment.term_id || '',
        assessment_type_id: assessment.assessment_type?.id || assessment.assessment_type_id || '',
        unit_id: assessment.unit?.id || assessment.unit_id || '',
        name: assessment.name || '',
        date: assessment.date || '',
        max_marks: assessment.max_marks ?? 100,
        passing_marks: assessment.passing_marks ?? 40
      });
    } else {
      setAssessmentForm({ subject_id: '', term_id: '', assessment_type_id: '', unit_id: '', name: '', date: '', max_marks: 100, passing_marks: 40 });
    }
    setOpenAssessmentDialog(true);
  };

  // Marks Entry dialog handlers
  const handleOpenMarksEntryDialog = (entry = null) => {
    setEditingMarksEntry(entry);
    if (entry) {
      setMarksEntryForm({
        student_id: entry.student?.id || entry.student_id || '',
        assessment_id: entry.assessment?.id || entry.assessment_id || '',
        marks_obtained: entry.marks_obtained ?? '',
        max_marks: entry.max_marks ?? '',
        remarks: entry.remarks || ''
      });
    } else {
      setMarksEntryForm({ student_id: '', assessment_id: '', marks_obtained: '', max_marks: '', remarks: '' });
    }
    setOpenMarksEntryDialog(true);
  };

  // Generic form change helpers
  const handleSubjectFormChange = (e) => {
    const { name, value } = e.target;
    setSubjectForm(prev => ({ ...prev, [name]: value }));
  };
  const handleUnitFormChange = (e) => {
    const { name, value } = e.target;
    setUnitForm(prev => ({ ...prev, [name]: value }));
  };
  const handleAssessmentFormChange = (e) => {
    const { name, value } = e.target;
    setAssessmentForm(prev => ({ ...prev, [name]: value }));
  };
  const handleMarksEntryFormChange = (e) => {
    const { name, value } = e.target;
    setMarksEntryForm(prev => ({ ...prev, [name]: value }));
  };

  // Close handlers
  const handleCloseSubjectDialog = () => {
    setOpenSubjectDialog(false);
    setEditingSubject(null);
  };
  const handleCloseUnitDialog = () => {
    setOpenUnitDialog(false);
    setEditingUnit(null);
  };
  const handleCloseAssessmentDialog = () => {
    setOpenAssessmentDialog(false);
    setEditingAssessment(null);
  };
  const handleCloseMarksEntryDialog = () => {
    setOpenMarksEntryDialog(false);
    setEditingMarksEntry(null);
  };

  // Save handlers
  const handleSaveSubject = async () => {
    try {
      const payload = {
        class_obj_id: subjectForm.class_obj_id || null,
        name: subjectForm.name,
        code: subjectForm.code,
        max_marks: Number(subjectForm.max_marks) || 100,
        has_practical: !!subjectForm.has_practical,
        practical_max_marks: Number(subjectForm.practical_max_marks) || 0,
        order: Number(subjectForm.order) || 1,
      };
      if (editingSubject?.id) {
        await api.put(`/education/subjects/${editingSubject.id}/`, payload);
      } else {
        await api.post('/education/subjects/', payload);
      }
      handleCloseSubjectDialog();
      fetchSubjects();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save subject.', severity: 'error' });
    }
  };

  const handleSaveUnit = async () => {
    try {
      const payload = {
        subject_id: unitForm.subject_id || null,
        name: unitForm.name,
        number: Number(unitForm.number) || 1,
        description: unitForm.description || '',
        order: Number(unitForm.order) || 1,
      };
      if (editingUnit?.id) {
        await api.put(`/education/units/${editingUnit.id}/`, payload);
      } else {
        await api.post('/education/units/', payload);
      }
      handleCloseUnitDialog();
      fetchUnits();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save unit.', severity: 'error' });
    }
  };

  const handleSaveAssessment = async () => {
    try {
      const payload = {
        subject_id: assessmentForm.subject_id || null,
        term_id: assessmentForm.term_id || null,
        assessment_type_id: assessmentForm.assessment_type_id || null,
        unit_id: assessmentForm.unit_id || null,
        name: assessmentForm.name,
        date: assessmentForm.date,
        max_marks: Number(assessmentForm.max_marks) || 100,
        passing_marks: Number(assessmentForm.passing_marks) || 40,
      };
      if (editingAssessment?.id) {
        await api.put(`/education/assessments/${editingAssessment.id}/`, payload);
      } else {
        await api.post('/education/assessments/', payload);
      }
      handleCloseAssessmentDialog();
      fetchAssessments();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save assessment.', severity: 'error' });
    }
  };

  const handleSaveMarksEntry = async () => {
    try {
      const payload = {
        student_id: marksEntryForm.student_id || null,
        assessment_id: marksEntryForm.assessment_id || null,
        marks_obtained: Number(marksEntryForm.marks_obtained) || 0,
        max_marks: Number(marksEntryForm.max_marks) || 0,
        remarks: marksEntryForm.remarks || '',
      };
      if (editingMarksEntry?.id) {
        await api.put(`/education/marks-entries/${editingMarksEntry.id}/`, payload);
      } else {
        await api.post('/education/marks-entries/', payload);
      }
      handleCloseMarksEntryDialog();
      fetchMarksEntries();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save marks entry.', severity: 'error' });
    }
  };
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [editingMarksEntry, setEditingMarksEntry] = useState(null);

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
      // Assignments loaded
    } catch (err) {
      // Error handled silently
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

  // Enhanced Report Card Dialog handlers
  const handleOpenReportCardDialog = (reportCard = null) => {
    setEditingReportCard(reportCard);
    setReportCardForm(reportCard ? {
      student_id: reportCard.student?.id || '',
      academic_year_id: reportCard.academic_year?.id || '',
      term_id: reportCard.term?.id || '',
      class_obj_id: reportCard.class_obj?.id || '',
      teacher_remarks: reportCard.teacher_remarks || '',
      principal_remarks: reportCard.principal_remarks || '',
      conduct_grade: reportCard.conduct_grade || '',
      issued_date: reportCard.issued_date || ''
    } : { 
      student_id: '', 
      academic_year_id: '', 
      term_id: '', 
      class_obj_id: '',
      teacher_remarks: '',
      principal_remarks: '',
      conduct_grade: '',
      issued_date: ''
    });
    setOpenReportCardDialog(true);
  };

  const handleCloseReportCardDialog = () => {
    setOpenReportCardDialog(false);
    setEditingReportCard(null);
    setReportCardForm({ 
      student_id: '', 
      academic_year_id: '', 
      term_id: '', 
      class_obj_id: '',
      teacher_remarks: '',
      principal_remarks: '',
      conduct_grade: '',
      issued_date: ''
    });
  };

  const handleReportCardFormChange = (e) => {
    const { name, value } = e.target;
    setReportCardForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'academic_year_id') {
      fetchTerms(value);
    }
  };

  const handleGenerateReportCard = async (reportCard) => {
    if (!reportCard?.student?.id || !reportCard?.academic_year?.id || !reportCard?.term?.id) {
      setSnackbar({ open: true, message: 'Invalid report card data for regeneration.', severity: 'error' });
      return;
    }
    try {
      const payload = {
        student: reportCard.student.id,
        student_id: reportCard.student.id,
        academic_year: reportCard.academic_year.id,
        academic_year_id: reportCard.academic_year.id,
        term: reportCard.term.id,
        term_id: reportCard.term.id,
        class_obj: reportCard.class_obj?.id || reportCard.class_obj_id || undefined,
        teacher_remarks: reportCard.teacher_remarks || '',
        principal_remarks: reportCard.principal_remarks || '',
        conduct_grade: reportCard.conduct_grade || '',
        issued_date: reportCard.issued_date || new Date().toISOString().split('T')[0]
      };
      await api.post('/education/reportcards/generate/', payload);
      setSnackbar({ open: true, message: 'Report card regenerated successfully!', severity: 'success' });
      fetchReportCards();
    } catch (err) {
      const detail = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to regenerate report card.';
      setSnackbar({ open: true, message: detail, severity: 'error' });
    }
  };

  const handleViewReportCardPDF = async (reportCard) => {
    if (!reportCard?.id) {
      setSnackbar({ open: true, message: 'No report card selected.', severity: 'error' });
      return;
    }
    try {
      const res = await api.get(`/education/reportcards/${reportCard.id}/pdf/`, { responseType: 'blob' });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Do not revoke immediately; let the user view it
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      const msg = err?.message || 'Failed to open PDF.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDownloadReportCardPDF = async (reportCard) => {
    if (!reportCard?.id) {
      setSnackbar({ open: true, message: 'No report card selected.', severity: 'error' });
      return;
    }
    try {
      const res = await api.get(`/education/reportcards/${reportCard.id}/pdf/`, { responseType: 'blob' });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reportcard_${reportCard.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      const msg = err?.message || 'Failed to download PDF.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  // Generate Report Card Dialog
  const [generateReportCardDialogOpen, setGenerateReportCardDialogOpen] = useState(false);
  const [generateReportCardForm, setGenerateReportCardForm] = useState({
    student_id: '',
    academic_year_id: '',
    term_id: '',
    teacher_remarks: '',
    principal_remarks: '',
    conduct_grade: '',
    issued_date: new Date().toISOString().split('T')[0]
  });

  const handleOpenGenerateReportCardDialog = () => {
    setGenerateReportCardForm({
      student_id: '',
      academic_year_id: '',
      term_id: '',
      teacher_remarks: '',
      principal_remarks: '',
      conduct_grade: '',
      issued_date: new Date().toISOString().split('T')[0]
    });
    // Ensure terms are loaded for the dropdown
    if (!terms || terms.length === 0) {
      fetchTerms();
    }
    setGenerateReportCardDialogOpen(true);
  };

  const handleCloseGenerateReportCardDialog = () => {
    setGenerateReportCardDialogOpen(false);
  };

  const handleGenerateReportCardFormChange = (e) => {
    const { name, value } = e.target;
    setGenerateReportCardForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'academic_year_id') {
      fetchTerms(value);
    }
  };

  const handleGenerateReportCardSubmit = async () => {
    if (!generateReportCardForm.student_id || !generateReportCardForm.academic_year_id || !generateReportCardForm.term_id) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    try {
      const payload = {
        student: generateReportCardForm.student_id,
        student_id: generateReportCardForm.student_id,
        academic_year: generateReportCardForm.academic_year_id,
        academic_year_id: generateReportCardForm.academic_year_id,
        term: generateReportCardForm.term_id,
        term_id: generateReportCardForm.term_id,
        class_obj: generateReportCardForm.class_obj_id || undefined,
        teacher_remarks: generateReportCardForm.teacher_remarks || '',
        principal_remarks: generateReportCardForm.principal_remarks || '',
        conduct_grade: generateReportCardForm.conduct_grade || '',
        issued_date: generateReportCardForm.issued_date
      };
      await api.post('/education/reportcards/generate/', payload);
      setSnackbar({ open: true, message: 'Report card generated successfully!', severity: 'success' });
      handleCloseGenerateReportCardDialog();
      fetchReportCards();
    } catch (err) {
      const detail = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to generate report card.';
      setSnackbar({ open: true, message: detail, severity: 'error' });
    }
  };

  const handleSaveReportCard = async () => {
    if (!reportCardForm.student_id || !reportCardForm.academic_year_id || !reportCardForm.term_id) {
      setSnackbar({ open: true, message: 'Please fill all required fields (Student, Academic Year, Term).', severity: 'error' });
      return;
    }
    try {
      const payload = {
        student: reportCardForm.student_id,
        academic_year: reportCardForm.academic_year_id,
        term: reportCardForm.term_id,
        class_obj: reportCardForm.class_obj_id || undefined,
        teacher_remarks: reportCardForm.teacher_remarks || '',
        principal_remarks: reportCardForm.principal_remarks || '',
        conduct_grade: reportCardForm.conduct_grade || '',
        issued_date: reportCardForm.issued_date || new Date().toISOString().split('T')[0]
      };
      if (editingReportCard) {
        await api.put(`/education/reportcards/${editingReportCard.id}/`, payload);
        setSnackbar({ open: true, message: 'Report Card updated!', severity: 'success' });
      } else {
        await api.post(`/education/reportcards/`, payload);
        setSnackbar({ open: true, message: 'Report Card added!', severity: 'success' });
      }
      handleCloseReportCardDialog();
      fetchReportCards();
    } catch (err) {
      const detail = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to save report card.';
      setSnackbar({ open: true, message: detail, severity: 'error' });
    }
  };

  // Enhanced Report Card System - Dialog Handlers
  const handleOpenAcademicYearDialog = (academicYear = null) => {
    setEditingAcademicYear(academicYear);
    setAcademicYearForm(academicYear ? {
      name: academicYear.name,
      start_date: academicYear.start_date,
      end_date: academicYear.end_date,
      is_current: academicYear.is_current
    } : { name: "", start_date: "", end_date: "", is_current: false });
    setOpenAcademicYearDialog(true);
  };

  const handleCloseAcademicYearDialog = () => {
    setOpenAcademicYearDialog(false);
    setEditingAcademicYear(null);
    setAcademicYearForm({ name: "", start_date: "", end_date: "", is_current: false });
  };

  const handleAcademicYearFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAcademicYearForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAcademicYear = async () => {
    if (!academicYearForm.name || !academicYearForm.start_date || !academicYearForm.end_date) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    try {
      if (editingAcademicYear) {
        await api.put(`/education/academic-years/${editingAcademicYear.id}/`, academicYearForm);
        setSnackbar({ open: true, message: 'Academic Year updated!', severity: 'success' });
      } else {
        await api.post('/education/academic-years/', academicYearForm);
        setSnackbar({ open: true, message: 'Academic Year added!', severity: 'success' });
      }
      handleCloseAcademicYearDialog();
      fetchAcademicYears();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save academic year.', severity: 'error' });
    }
  };

  const handleOpenTermDialog = (term = null) => {
    setEditingTerm(term);
    setTermForm(term ? {
      academic_year_id: term.academic_year_id,
      name: term.name,
      order: term.order,
      start_date: term.start_date,
      end_date: term.end_date,
      is_active: term.is_active
    } : { academic_year_id: "", name: "", order: 1, start_date: "", end_date: "", is_active: true });
    setOpenTermDialog(true);
  };

  const handleCloseTermDialog = () => {
    setOpenTermDialog(false);
    setEditingTerm(null);
    setTermForm({ academic_year_id: "", name: "", order: 1, start_date: "", end_date: "", is_active: true });
  };

  const handleTermFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTermForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveTerm = async () => {
    if (!termForm.academic_year_id || !termForm.name || !termForm.start_date || !termForm.end_date) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    try {
      if (editingTerm) {
        await api.put(`/education/terms/${editingTerm.id}/`, termForm);
        setSnackbar({ open: true, message: 'Term updated!', severity: 'success' });
      } else {
        await api.post('/education/terms/', termForm);
        setSnackbar({ open: true, message: 'Term added!', severity: 'success' });
      }
      handleCloseTermDialog();
      fetchTerms();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save term.', severity: 'error' });
    }
  };

  // Installment Management - Dialog Handlers
  const handleOpenInstallmentPlanDialog = (plan = null) => {
    setInstallmentPlanForm(plan ? {
      fee_structure_id: plan.fee_structure_id || '',
      name: plan.name || '',
      number_of_installments: plan.number_of_installments || 4,
      installment_type: plan.installment_type || 'EQUAL',
      description: plan.description || ''
    } : {
      fee_structure_id: '',
      name: '',
      number_of_installments: 4,
      installment_type: 'EQUAL',
      description: ''
    });
    setInstallmentPlanDialogOpen(true);
  };

  const handleCloseInstallmentPlanDialog = () => {
    setInstallmentPlanDialogOpen(false);
    setInstallmentPlanForm({
      fee_structure_id: '',
      name: '',
      number_of_installments: 4,
      installment_type: 'EQUAL',
      description: ''
    });
  };

  const handleInstallmentPlanFormChange = (e) => {
    const { name, value } = e.target;
    setInstallmentPlanForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveInstallmentPlan = async () => {
    if (!installmentPlanForm.fee_structure_id || !installmentPlanForm.name) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    try {
      await api.post('/education/installment-plans/', installmentPlanForm);
      setSnackbar({ open: true, message: 'Installment plan created!', severity: 'success' });
      handleCloseInstallmentPlanDialog();
      fetchInstallmentPlans();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save installment plan.', severity: 'error' });
    }
  };

  const handleOpenInstallmentDialog = () => {
    setInstallmentForm({
      student_id: '',
      fee_structure_id: '',
      installment_plan_id: '',
      start_date: new Date().toISOString().split('T')[0]
    });
    setInstallmentDialogOpen(true);
  };

  const handleCloseInstallmentDialog = () => {
    setInstallmentDialogOpen(false);
    setInstallmentForm({
      student_id: '',
      fee_structure_id: '',
      installment_plan_id: '',
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleInstallmentFormChange = (e) => {
    const { name, value } = e.target;
    setInstallmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateInstallments = async () => {
    if (!installmentForm.student_id || !installmentForm.fee_structure_id || !installmentForm.installment_plan_id) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    try {
      await api.post('/education/installments/generate/', installmentForm);
      setSnackbar({ open: true, message: 'Installments generated successfully!', severity: 'success' });
      handleCloseInstallmentDialog();
      fetchInstallments();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to generate installments.', severity: 'error' });
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
      // Expecting an array of { student: {id, name, ...}, present: bool }
      if (Array.isArray(data)) {
        setAttendanceStatus(data);
      } else {
        throw new Error('Unexpected response');
      }
    } catch (e) {
      // Fallback: load students for the selected class so user can still take attendance
      try {
        const res = await api.get(`/education/students/?class=${studentClass}`);
        const studentsList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setAttendanceStatus(studentsList.map(s => ({ student: s, present: false })));
      } catch {
        setAttendanceStatus([]);
      }
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
    // eslint-disable-next-line
  }, [studentClass, attendanceDate]);

  useEffect(() => {
    fetchOrgAnalytics();
    fetchTodayTeacherStats();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchAnalyticsClassAttendance();
    // eslint-disable-next-line
  }, [analyticsClassId, analyticsDate]);

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
        <Tab icon={<CalendarTodayIcon />} label="Academic Years" />
        <Tab icon={<AutoStoriesIcon />} label="Terms" />
        <Tab icon={<SubjectIcon />} label="Subjects" />
        <Tab icon={<LibraryBooksIcon />} label="Units" />
        <Tab icon={<QuizIcon />} label="Assessments" />
        <Tab icon={<GradeIcon />} label="Marks Entry" />
        <Tab icon={<AssessmentIcon />} label="Report Cards" />
        <Tab icon={<AssessmentIcon />} label="Analytics" />
      </Tabs>
      {/* Classes Tab */}
      {tab === 0 && (
        <Box>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Classes</Typography>
            <Button variant="contained" onClick={() => handleOpenClassDialog()}>Add Class</Button>
          </Box>
          {classLoading ? (
            <Box textAlign="center"><CircularProgress aria-label="Loading classes" /></Box>
          ) : classError ? (
            <Alert severity="error">{classError}</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {classColumns.map((col) => (
                      <TableCell key={col.field}>{col.headerName}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((row) => {
                    const rowId = row.id || row.user || row.staff || Math.random();
                    return (
                      <TableRow key={rowId}>
                        {classColumns.map((col) => (
                          <TableCell key={col.field}>
                            {col.renderCell 
                              ? col.renderCell({ row, value: row[col.field] }) 
                              : col.valueGetter 
                                ? col.valueGetter({ row }, row) 
                                : row[col.field]}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {studentColumns.map((col) => (
                      <TableCell key={col.field}>{col.headerName}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((row) => {
                    const rowId = row.id || row.user || row.staff || row.username || Math.random();
                    return (
                      <TableRow key={rowId}>
                        {studentColumns.map((col) => (
                          <TableCell key={col.field}>
                            {col.renderCell 
                              ? col.renderCell({ row, value: row[col.field] }) 
                              : col.valueGetter 
                                ? col.valueGetter({ row }, row) 
                                : row[col.field]}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {/* Add/Edit Student Dialog */}
          <Dialog open={openStudentDialog} onClose={handleCloseStudentDialog} maxWidth="sm" fullWidth sx={{ zIndex: 2000 }}>
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
          <TextField
            margin="dense"
            label="Upper ID"
            name="upper_id"
            value={studentForm.upper_id}
            onChange={handleStudentFormChange}
            fullWidth
            helperText="Optional. Leave blank to auto-generate."
          />
              {/* Assigned Class Dropdown using MUI Select */}
              <FormControl fullWidth margin="dense" required>
                <InputLabel id="assigned-class-label" shrink={!!studentForm.assigned_class}>Assigned Class *</InputLabel>
                <Select
                  labelId="assigned-class-label"
                  name="assigned_class"
                  value={String(studentForm.assigned_class || "")}
                  label="Assigned Class *"
                  onChange={handleStudentFormChange}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected || selected === "") {
                      return <Typography variant="body2" color="text.secondary">Select Class</Typography>;
                    }
                    const selectedClass = classes.find(c => String(c.id) === String(selected));
                    return selectedClass ? selectedClass.name : "Unknown Class";
                  }}
                  MenuProps={{ 
                    disablePortal: true, 
                    PaperProps: { sx: { zIndex: 2200, maxHeight: 300 } },
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' }
                  }}
                >
                  <MenuItem value="">
                    <em>Select Class</em>
                  </MenuItem>
                  {classes && classes.length > 0 ? (
                    classes.map(cls => (
                      <MenuItem key={cls.id} value={String(cls.id)}>{cls.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {classLoading ? "Loading classes..." : "No classes available. Please create a class first."}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
                {classes && classes.length === 0 && !classLoading && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    💡 Create classes in the Classes tab first
                  </Typography>
                )}
              </FormControl>
              <TextField
                margin="dense"
                label="Phone"
                name="phone"
                value={studentForm.phone}
                onChange={handleStudentFormChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="Address"
                name="address"
                value={studentForm.address}
                onChange={handleStudentFormChange}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                margin="dense"
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={studentForm.date_of_birth}
                onChange={handleStudentFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              {/* Gender Dropdown */}
              <FormControl fullWidth margin="dense">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={studentForm.gender}
                  label="Gender"
                  onChange={handleStudentFormChange}
                  MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              {/* Cast Dropdown - Required */}
              <FormControl fullWidth margin="dense" required>
                <InputLabel id="cast-label">Cast *</InputLabel>
                <Select
                  labelId="cast-label"
                  name="cast"
                  value={studentForm.cast}
                  label="Cast *"
                  onChange={handleStudentFormChange}
                  MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="OBC">Other Backward Class (OBC)</MenuItem>
                  <MenuItem value="SC">Scheduled Caste (SC)</MenuItem>
                  <MenuItem value="ST">Scheduled Tribe (ST)</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              {/* Religion Text Field */}
              <TextField
                margin="dense"
                label="Religion"
                name="religion"
                value={studentForm.religion}
                onChange={handleStudentFormChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="Parent Name"
                name="parent_name"
                value={studentForm.parent_name}
                onChange={handleStudentFormChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="Parent Phone"
                name="parent_phone"
                value={studentForm.parent_phone}
                onChange={handleStudentFormChange}
                fullWidth
              />
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
      {/* Academic Years Tab */}
      {tab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Academic Years</Typography>
            {academicYearsLoading ? <CircularProgress /> : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Current</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {academicYears.map((ay) => (
                      <TableRow key={ay.id}>
                        <TableCell>{ay.name}</TableCell>
                        <TableCell>{ay.start_date}</TableCell>
                        <TableCell>{ay.end_date}</TableCell>
                        <TableCell>{ay.is_current ? <Chip label="Current" color="primary" size="small" /> : ""}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenAcademicYearDialog(ay)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenAcademicYearDialog()}>Add Academic Year</Button>
          </CardContent>
        </Card>
      )}

      {/* Terms Tab */}
      {tab === 5 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Terms</Typography>
            {termsLoading ? <CircularProgress /> : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {terms.map((term) => (
                      <TableRow key={term.id}>
                        <TableCell>{term.academic_year?.name}</TableCell>
                        <TableCell>{term.name}</TableCell>
                        <TableCell>{term.order}</TableCell>
                        <TableCell>{term.start_date}</TableCell>
                        <TableCell>{term.end_date}</TableCell>
                        <TableCell>{term.is_active ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" color="default" size="small" />}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenTermDialog(term)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenTermDialog()}>Add Term</Button>
          </CardContent>
        </Card>
      )}

      {/* Subjects Tab */}
      {tab === 6 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Subjects</Typography>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  label="Filter by Class"
                  value={filterClassId}
                  onChange={(e) => { setFilterClassId(e.target.value); fetchSubjects(e.target.value || null); }}
                >
                  <MenuItem value="">All</MenuItem>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Search Subject"
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
              />
            </Box>
            {subjectsLoading ? <CircularProgress /> : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Class</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Max Marks</TableCell>
                      <TableCell>Practical</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjects
                      .filter(s => !filterClassId || String(s.class_obj?.id) === String(filterClassId))
                      .filter(s => !subjectSearch || (s.name || '').toLowerCase().includes(subjectSearch.toLowerCase()))
                      .map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell>{subject.class_obj?.name}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell>{subject.max_marks}</TableCell>
                        <TableCell>{subject.has_practical ? <Chip label="Yes" color="primary" size="small" /> : <Chip label="No" color="default" size="small" />}</TableCell>
                        <TableCell>{subject.order}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenSubjectDialog(subject)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenSubjectDialog()}>Add Subject</Button>
          </CardContent>
        </Card>
      )}

      {/* Units Tab */}
      {tab === 7 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Units</Typography>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  label="Filter by Class"
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Search Unit"
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
              />
            </Box>
            {unitsLoading ? <CircularProgress /> : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Number</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {units
                      .filter(u => !filterClassId || String(u.subject?.class_obj?.id) === String(filterClassId))
                      .filter(u => !unitSearch || (u.name || '').toLowerCase().includes(unitSearch.toLowerCase()))
                      .map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell>{unit.subject?.name}</TableCell>
                        <TableCell>{unit.name}</TableCell>
                        <TableCell>{unit.number}</TableCell>
                        <TableCell>{unit.description}</TableCell>
                        <TableCell>{unit.order}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenUnitDialog(unit)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenUnitDialog()}>Add Unit</Button>
          </CardContent>
        </Card>
      )}

      {/* Assessments Tab */}
      {tab === 8 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Assessments</Typography>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  label="Filter by Class"
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Search Assessment"
                value={assessmentSearch}
                onChange={(e) => setAssessmentSearch(e.target.value)}
              />
            </Box>
            {assessmentsLoading ? <CircularProgress /> : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Term</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Max Marks</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assessments
                      .filter(a => !filterClassId || String(a.subject?.class_obj?.id) === String(filterClassId))
                      .filter(a => !assessmentSearch || (a.name || '').toLowerCase().includes(assessmentSearch.toLowerCase()))
                      .map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>{assessment.subject?.name}</TableCell>
                        <TableCell>{assessment.term?.name}</TableCell>
                        <TableCell>{assessment.assessment_type?.name}</TableCell>
                        <TableCell>{assessment.unit?.name || "General"}</TableCell>
                        <TableCell>{assessment.name}</TableCell>
                        <TableCell>{assessment.date}</TableCell>
                        <TableCell>{assessment.max_marks}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenAssessmentDialog(assessment)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenAssessmentDialog()}>Add Assessment</Button>
          </CardContent>
        </Card>
      )}

      {/* Marks Entry Tab */}
      {tab === 9 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Marks Entry</Typography>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  label="Filter by Class"
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Search Student/Assessment"
                value={marksEntrySearch}
                onChange={(e) => setMarksEntrySearch(e.target.value)}
              />
            </Box>
            {marksEntriesLoading ? <CircularProgress /> : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Assessment</TableCell>
                      <TableCell>Marks Obtained</TableCell>
                      <TableCell>Max Marks</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {marksEntries
                      .filter(me => !filterClassId || String(me.assessment?.subject?.class_obj?.id) === String(filterClassId))
                      .filter(me => {
                        const needle = marksEntrySearch.toLowerCase();
                        return !needle || (me.student?.name || '').toLowerCase().includes(needle) || (me.assessment?.name || '').toLowerCase().includes(needle);
                      })
                      .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.student?.name}</TableCell>
                        <TableCell>{entry.assessment?.name}</TableCell>
                        <TableCell>{entry.marks_obtained}</TableCell>
                        <TableCell>{entry.max_marks}</TableCell>
                        <TableCell>{entry.percentage?.toFixed(1)}%</TableCell>
                        <TableCell><Chip label={entry.grade} color={entry.grade === 'A+' ? 'success' : entry.grade === 'F' ? 'error' : 'primary'} size="small" /></TableCell>
                        <TableCell>{entry.remarks}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenMarksEntryDialog(entry)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenMarksEntryDialog()}>Add Marks Entry</Button>
          </CardContent>
        </Card>
      )}

      {/* Report Cards Tab */}
      {tab === 10 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Report Cards</Typography>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  label="Filter by Class"
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Search Student"
                value={reportCardSearch}
                onChange={(e) => setReportCardSearch(e.target.value)}
              />
            </Box>
            {reportCardLoading ? <CircularProgress aria-label="Loading report cards" /> : reportCardError ? <Alert severity="error">{reportCardError}</Alert> : (
              <TableContainer component={Paper} sx={{ background: '#fafbfc', borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {reportCardColumns.map((col) => (
                        <TableCell key={col.field}>{col.headerName}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportCards
                      .filter(rc => rc && typeof rc.student !== 'undefined' && rc.student !== null)
                      .filter(rc => !filterClassId || String(rc.class_obj?.id || rc.class_obj_id) === String(filterClassId))
                      .filter(rc => !reportCardSearch || (rc.student?.name || '').toLowerCase().includes(reportCardSearch.toLowerCase()))
                      .map((row) => {
                      const rowId = row.id || row.user || row.staff || row.student || Math.random();
                      return (
                        <TableRow key={rowId}>
                          {reportCardColumns.map((col) => (
                            <TableCell key={col.field}>
                              {col.renderCell 
                                ? col.renderCell({ row, value: row[col.field] }) 
                                : col.valueGetter 
                                  ? col.valueGetter({ row }, row) 
                                  : row[col.field]}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => handleOpenReportCardDialog()}
              >
                Add Report Card
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => handleOpenGenerateReportCardDialog()}
              >
                Generate Report Card
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {tab === 11 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Organization Analytics</Typography>
            {analyticsError && <Alert severity="error" sx={{ mb: 2 }}>{analyticsError}</Alert>}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined"><CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}><GroupIcon /></Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Total Students</Typography>
                      <Typography variant="h5">{orgAnalytics.total_students}</Typography>
                    </Box>
                  </Box>
                </CardContent></Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined"><CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'success.main' }}><PersonIcon /></Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Total Teachers</Typography>
                      <Typography variant="h5">{orgAnalytics.total_teachers}</Typography>
                    </Box>
                  </Box>
                </CardContent></Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined"><CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}><ClassIcon /></Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Total Classes</Typography>
                      <Typography variant="h5">{orgAnalytics.total_classes}</Typography>
                    </Box>
                  </Box>
                </CardContent></Card>
              </Grid>
            </Grid>

            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Class (for detailed view)</InputLabel>
                <Select
                  label="Class (for detailed view)"
                  value={analyticsClassId}
                  onChange={(e) => setAnalyticsClassId(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={analyticsDate}
                onChange={(e) => setAnalyticsDate(e.target.value)}
              />
              <Button disabled={analyticsLoading} onClick={fetchOrgAnalytics}>Refresh</Button>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Upcoming Window</InputLabel>
                <Select
                  label="Upcoming Window"
                  value={String(analyticsDaysAhead)}
                  onChange={(e) => setAnalyticsDaysAhead(parseInt(e.target.value, 10))}
                >
                  <MenuItem value={7}>Next 7 days</MenuItem>
                  <MenuItem value={15}>Next 15 days</MenuItem>
                  <MenuItem value={30}>Next 30 days</MenuItem>
                  <MenuItem value={60}>Next 60 days</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined"><CardContent>
                  <Typography variant="subtitle1" gutterBottom>Class Attendance (Selected Day)</Typography>
                  {analyticsClassId ? (
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box position="relative" display="inline-flex">
                        {(() => {
                          const total = Math.max(1, classAttendanceSummary.total);
                          const percent = Math.round((classAttendanceSummary.present / total) * 100);
                          return (
                            <>
                              <CircularProgress variant="determinate" value={percent} size={64} />
                              <Box
                                top={0}
                                left={0}
                                bottom={0}
                                right={0}
                                position="absolute"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Typography variant="caption" component="div">{`${percent}%`}</Typography>
                              </Box>
                            </>
                          );
                        })()}
                      </Box>
                      <Box>
                        <Typography>Present: {classAttendanceSummary.present}</Typography>
                        <Typography>Absent: {classAttendanceSummary.absent}</Typography>
                        <Typography>Total: {classAttendanceSummary.total}</Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">Select a class to view attendance summary.</Typography>
                  )}
                </CardContent></Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined"><CardContent>
                  <Typography variant="subtitle1" gutterBottom>Teacher Check-ins Today</Typography>
                  {(() => {
                    const total = Math.max(1, todayTeacherAttendance.checkins + todayTeacherAttendance.checkouts);
                    const pctIn = Math.round((todayTeacherAttendance.checkins / total) * 100);
                    return (
                      <>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2">Check-ins</Typography>
                          <Chip size="small" label={todayTeacherAttendance.checkins} />
                        </Box>
                        <LinearProgress variant="determinate" value={pctIn} />
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="body2">Check-outs</Typography>
                          <Chip size="small" label={todayTeacherAttendance.checkouts} />
                        </Box>
                      </>
                    );
                  })()}
                </CardContent></Card>
              </Grid>
            </Grid>

            {/* Class-wise Student Count */}
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                <ClassIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Class-wise Student Count
              </Typography>
              <Card variant="outlined"><CardContent>
                {(() => {
                  const rows = orgAnalytics.students_per_class || [];
                  // Calculate totals - handle both with and without gender breakdown
                  const totalStudents = rows.reduce((sum, row) => {
                    if (row.male !== undefined || row.female !== undefined) {
                      // Has gender breakdown
                      return sum + Number(row.male || 0) + Number(row.female || 0) + Number(row.other || 0);
                    } else {
                      // Just count
                      return sum + Number(row.count || row.total || 0);
                    }
                  }, 0);
                  
                  return rows.length ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Class</strong></TableCell>
                            {rows.some(r => r.male !== undefined || r.female !== undefined) ? (
                              <>
                                <TableCell align="right"><strong>Male</strong></TableCell>
                                <TableCell align="right"><strong>Female</strong></TableCell>
                                <TableCell align="right"><strong>Other</strong></TableCell>
                              </>
                            ) : null}
                            <TableCell align="right"><strong>Total Students</strong></TableCell>
                            <TableCell align="right"><strong>% of Total</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row, idx) => {
                            const hasGenderBreakdown = row.male !== undefined || row.female !== undefined;
                            const count = Number(row.count || row.total || 0);
                            const male = Number(row.male || 0);
                            const female = Number(row.female || 0);
                            const other = Number(row.other || 0);
                            const total = hasGenderBreakdown ? (male + female + other) : count;
                            const percentage = totalStudents > 0 ? Math.round((total / totalStudents) * 100) : 0;
                            
                            return (
                              <TableRow key={idx} hover>
                                <TableCell><strong>{row.class_name || row.class || '-'}</strong></TableCell>
                                {hasGenderBreakdown ? (
                                  <>
                                    <TableCell align="right">
                                      <Chip size="small" label={male} color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip size="small" label={female} color="secondary" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip size="small" label={other} variant="outlined" />
                                    </TableCell>
                                  </>
                                ) : null}
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                                    {total}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" color="text.secondary">
                                    {percentage}%
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell><strong>Total</strong></TableCell>
                            {rows.some(r => r.male !== undefined || r.female !== undefined) ? (
                              <>
                                <TableCell align="right">
                                  <Chip size="small" label={rows.reduce((sum, r) => sum + Number(r.male || 0), 0)} color="primary" />
                                </TableCell>
                                <TableCell align="right">
                                  <Chip size="small" label={rows.reduce((sum, r) => sum + Number(r.female || 0), 0)} color="secondary" />
                                </TableCell>
                                <TableCell align="right">
                                  <Chip size="small" label={rows.reduce((sum, r) => sum + Number(r.other || 0), 0)} />
                                </TableCell>
                              </>
                            ) : null}
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="bold" color="primary.main">
                                {totalStudents}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                100%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : <Typography color="text.secondary">No classes found.</Typography>;
                })()}
              </CardContent></Card>
            </Box>

            {/* Gender Distribution per Class */}
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                <WcIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Gender Distribution per Class
              </Typography>
              <Card variant="outlined"><CardContent>
                {(() => {
                  const rows = orgAnalytics.gender_distribution_per_class || [];
                  return rows.length ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Class</TableCell>
                            <TableCell align="right">Male</TableCell>
                            <TableCell align="right">Female</TableCell>
                            <TableCell align="right">Other</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell><strong>{row.class_name || '-'}</strong></TableCell>
                              <TableCell align="right">
                                <Chip size="small" label={row.male || 0} color="primary" variant="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Chip size="small" label={row.female || 0} color="secondary" variant="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Chip size="small" label={row.other || 0} variant="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="bold">{row.total || 0}</Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : <Typography color="text.secondary">No gender data available.</Typography>;
                })()}
              </CardContent></Card>
            </Box>

            {/* Cast Distribution per Class */}
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                <GroupIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Cast Distribution per Class
              </Typography>
              <Card variant="outlined"><CardContent>
                {(() => {
                  const rows = orgAnalytics.cast_distribution_per_class || [];
                  return rows.length ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Class</strong></TableCell>
                            <TableCell align="right"><strong>General</strong></TableCell>
                            <TableCell align="right"><strong>OBC</strong></TableCell>
                            <TableCell align="right"><strong>SC</strong></TableCell>
                            <TableCell align="right"><strong>ST</strong></TableCell>
                            <TableCell align="right"><strong>Other</strong></TableCell>
                            <TableCell align="right"><strong>Total</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell><strong>{row.class_name || '-'}</strong></TableCell>
                              <TableCell align="right">
                                <Chip size="small" label={row.general || 0} color="primary" variant="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Chip size="small" label={row.obc || 0} color="info" variant="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Chip size="small" label={row.sc || 0} color="warning" variant="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Chip size="small" label={row.st || 0} color="success" variant="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Chip size="small" label={row.other || 0} variant="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="bold">{row.total || 0}</Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell align="right">
                              <Chip size="small" label={rows.reduce((sum, r) => sum + Number(r.general || 0), 0)} color="primary" />
                            </TableCell>
                            <TableCell align="right">
                              <Chip size="small" label={rows.reduce((sum, r) => sum + Number(r.obc || 0), 0)} color="info" />
                            </TableCell>
                            <TableCell align="right">
                              <Chip size="small" label={rows.reduce((sum, r) => sum + Number(r.sc || 0), 0)} color="warning" />
                            </TableCell>
                            <TableCell align="right">
                              <Chip size="small" label={rows.reduce((sum, r) => sum + Number(r.st || 0), 0)} color="success" />
                            </TableCell>
                            <TableCell align="right">
                              <Chip size="small" label={rows.reduce((sum, r) => sum + Number(r.other || 0), 0)} />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="bold" color="primary.main">
                                {rows.reduce((sum, r) => sum + Number(r.total || 0), 0)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : <Typography color="text.secondary">No cast data available.</Typography>;
                })()}
              </CardContent></Card>
            </Box>

            {/* Upcoming Birthdays Today */}
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                <CakeIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'secondary.main' }} />
                Birthdays Today
              </Typography>
              <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  {(() => {
                    const birthdays = orgAnalytics.upcoming_birthdays_today || [];
                    return birthdays.length > 0 ? (
                      <Grid container spacing={2}>
                        {birthdays.map((birthday, idx) => (
                          <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Card 
                              sx={{ 
                                bgcolor: 'secondary.light', 
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)' }
                              }}
                              onClick={() => handleViewStudentFromAnalytics(birthday.student_id)}
                            >
                              <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                                    <CakeIcon />
                                  </Avatar>
                                  <Box flex={1}>
                                    <Typography variant="h6" fontWeight="bold">
                                      {birthday.student_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {birthday.class_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ID: {birthday.upper_id} • Age: {birthday.age}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box textAlign="center" py={3}>
                        <CakeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">No birthdays today</Typography>
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>Fees Remaining by Class</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Class</TableCell>
                      <TableCell align="right">Students With Dues</TableCell>
                      <TableCell align="right">Total Due (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(orgAnalytics.fees_remaining_by_class || []).map((row, idx) => {
                      const due = Number(row.total_due || 0);
                      const hasDue = due > 0;
                      return (
                        <TableRow key={idx} hover>
                          <TableCell>{row.class_name || row.class || '-'}</TableCell>
                          <TableCell align="right">
                            <Badge color={hasDue ? 'error' : 'success'} badgeContent={row.students_with_dues || 0}>
                              <Box width={0} />
                            </Badge>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={hasDue ? 'error.main' : 'text.primary'}>₹{due.toFixed(2)}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>Upcoming Installments (Reminders)</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Class</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Fee Type</TableCell>
                      <TableCell align="right">Inst #</TableCell>
                      <TableCell align="right">Remaining (₹)</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const base = analyticsDate ? new Date(analyticsDate) : new Date();
                      const end = new Date(base.getTime() + analyticsDaysAhead * 24 * 60 * 60 * 1000);
                      const dd = (d) => {
                        const dt = new Date(d);
                        const day = String(dt.getDate()).padStart(2, '0');
                        const mo = String(dt.getMonth() + 1).padStart(2, '0');
                        const yr = dt.getFullYear();
                        return `${day}/${mo}/${yr}`;
                      };
                      const rows = (analyticsInstallments || [])
                        .filter(inst => (inst.status !== 'PAID'))
                        .filter(inst => {
                          const due = new Date(inst.due_date);
                          return !Number.isNaN(due.getTime()) && due >= base && due <= end;
                        })
                        .filter(inst => !analyticsClassId || String(inst.student?.assigned_class?.id) === String(analyticsClassId))
                        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                        .slice(0, 100);
                      return rows.length ? rows.map((inst, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{inst.student?.assigned_class?.name || '-'}</TableCell>
                          <TableCell>{inst.student?.name || '-'}</TableCell>
                          <TableCell>{inst.fee_structure_fee_type || inst.fee_structure?.fee_type || inst.fee_structure_name || '-'}</TableCell>
                          <TableCell align="right">{inst.installment_number}</TableCell>
                          <TableCell align="right">₹{Number(inst.remaining_amount || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <AccessTimeIcon fontSize="small"/>
                              <Typography variant="body2">{dd(inst.due_date)}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" color={inst.status === 'OVERDUE' ? 'error' : inst.status === 'PARTIAL' ? 'warning' : 'default'} label={inst.status} />
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={0.5} justifyContent="center">
                              <Tooltip title="View student">
                                <IconButton size="small" onClick={() => handleViewStudentFromAnalytics(inst.student?.id)}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Send email reminder">
                                <IconButton size="small" onClick={() => handleSendFeeReminder(inst.student?.id)}>
                                  <EmailIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {(() => {
                                // Try to get parent phone from student object or lookup from contacts
                                const parentPhone = inst.student?.parent_phone || 
                                  (() => {
                                    const contact = orgAnalytics.student_contacts?.find(c => c.student_id === inst.student?.id);
                                    return contact?.parent_phone;
                                  })();
                                
                                return parentPhone ? (
                                  <Tooltip title="Send WhatsApp fee reminder">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleOpenWhatsApp(
                                        parentPhone, 
                                        inst.student?.name || 'Student', 
                                        inst.student?.assigned_class?.name || '-',
                                        inst.remaining_amount,
                                        inst.due_date
                                      )}
                                      color="success"
                                    >
                                      <MessageIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={8} align="center">No upcoming installments in selected window.</TableCell></TableRow>
                      );
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Student Contact Information */}
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                <PhoneIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Student Contact Information
              </Typography>
              <Card variant="outlined"><CardContent>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Upper ID</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Student Phone</TableCell>
                        <TableCell>Parent Name</TableCell>
                        <TableCell>Parent Phone</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        const contacts = orgAnalytics.student_contacts || [];
                        const filteredContacts = analyticsClassId 
                          ? contacts.filter(c => {
                              const classMatch = classes.find(cls => cls.id === parseInt(analyticsClassId));
                              return classMatch && c.class_name === classMatch.name;
                            })
                          : contacts;
                        
                        return filteredContacts.length > 0 ? filteredContacts.map((contact, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell><strong>{contact.student_name || '-'}</strong></TableCell>
                            <TableCell>{contact.upper_id || '-'}</TableCell>
                            <TableCell>{contact.class_name || '-'}</TableCell>
                            <TableCell>
                              {contact.student_phone ? (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <PhoneIcon fontSize="small" color="primary" />
                                  <Typography variant="body2" component="a" href={`tel:${contact.student_phone}`} sx={{ textDecoration: 'none', color: 'primary.main' }}>
                                    {contact.student_phone}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>{contact.parent_name || '-'}</TableCell>
                            <TableCell>
                              {contact.parent_phone ? (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <PhoneIcon fontSize="small" color="secondary" />
                                  <Typography variant="body2" component="a" href={`tel:${contact.parent_phone}`} sx={{ textDecoration: 'none', color: 'secondary.main' }}>
                                    {contact.parent_phone}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {contact.email ? (
                                <Typography variant="body2" component="a" href={`mailto:${contact.email}`} sx={{ textDecoration: 'none', color: 'primary.main' }}>
                                  {contact.email}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={0.5} justifyContent="center">
                                <Tooltip title="View student">
                                  <IconButton size="small" onClick={() => handleViewStudentFromAnalytics(contact.student_id)}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {contact.parent_phone && (
                                  <Tooltip title="Send WhatsApp fee reminder">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleOpenWhatsApp(contact.parent_phone, contact.student_name, contact.class_name)}
                                      color="success"
                                    >
                                      <MessageIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={8} align="center">
                              <Typography color="text.secondary">No contact information available.</Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent></Card>
            </Box>
          </CardContent>
        </Card>
      )}


      {/* Installment Plan Dialog */}
      <Dialog open={installmentPlanDialogOpen} onClose={handleCloseInstallmentPlanDialog}>
        <DialogTitle>Create Installment Plan</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Fee Structure</InputLabel>
            <Select
              name="fee_structure_id"
              value={installmentPlanForm.fee_structure_id}
              onChange={handleInstallmentPlanFormChange}
              label="Fee Structure"
              required
            >
              {feeStructures.map(fs => (
                <MenuItem key={fs.id} value={fs.id}>
                  {fs.fee_type} - ₹{fs.amount}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="name"
            label="Plan Name"
            value={installmentPlanForm.name}
            onChange={handleInstallmentPlanFormChange}
            fullWidth
            required
            margin="dense"
            placeholder="e.g., 4 Monthly Installments"
          />
          <TextField
            name="number_of_installments"
            label="Number of Installments"
            type="number"
            value={installmentPlanForm.number_of_installments}
            onChange={handleInstallmentPlanFormChange}
            fullWidth
            required
            margin="dense"
            inputProps={{ min: 1, max: 12 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Installment Type</InputLabel>
            <Select
              name="installment_type"
              value={installmentPlanForm.installment_type}
              onChange={handleInstallmentPlanFormChange}
              label="Installment Type"
              required
            >
              <MenuItem value="EQUAL">Equal Amounts</MenuItem>
              <MenuItem value="CUSTOM">Custom Amounts</MenuItem>
              <MenuItem value="PERCENTAGE">Percentage Based</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="description"
            label="Description"
            value={installmentPlanForm.description}
            onChange={handleInstallmentPlanFormChange}
            fullWidth
            margin="dense"
            multiline
            rows={2}
            placeholder="Optional description"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstallmentPlanDialog}>Cancel</Button>
          <Button onClick={handleSaveInstallmentPlan} variant="contained">Create Plan</Button>
        </DialogActions>
      </Dialog>

      {/* Subject Dialog */}
      <Dialog open={openSubjectDialog} onClose={handleCloseSubjectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Class</InputLabel>
            <Select
              name="class_obj_id"
              value={subjectForm.class_obj_id || ''}
              onChange={handleSubjectFormChange}
              label="Class"
              required
            >
              {classes.map(cls => <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField name="name" label="Subject Name" value={subjectForm.name || ''} onChange={handleSubjectFormChange} fullWidth margin="dense" required />
          <TextField name="code" label="Code" value={subjectForm.code || ''} onChange={handleSubjectFormChange} fullWidth margin="dense" />
          <TextField name="max_marks" label="Max Marks" type="number" value={subjectForm.max_marks ?? 100} onChange={handleSubjectFormChange} fullWidth margin="dense" />
          <FormControl fullWidth margin="dense">
            <InputLabel>Has Practical</InputLabel>
            <Select name="has_practical" value={subjectForm.has_practical ? 'true' : 'false'} onChange={(e) => handleSubjectFormChange({ target: { name: 'has_practical', value: e.target.value === 'true' } })} label="Has Practical" MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}>
              <MenuItem value={'false'}>No</MenuItem>
              <MenuItem value={'true'}>Yes</MenuItem>
            </Select>
          </FormControl>
          <TextField name="practical_max_marks" label="Practical Max Marks" type="number" value={subjectForm.practical_max_marks ?? 0} onChange={handleSubjectFormChange} fullWidth margin="dense" />
          <TextField name="order" label="Order" type="number" value={subjectForm.order ?? 1} onChange={handleSubjectFormChange} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubjectDialog}>Cancel</Button>
          <Button onClick={handleSaveSubject} variant="contained">{editingSubject ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Unit Dialog */}
      <Dialog open={openUnitDialog} onClose={handleCloseUnitDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUnit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Subject</InputLabel>
            <Select
              name="subject_id"
              value={unitForm.subject_id || ''}
              onChange={handleUnitFormChange}
              label="Subject"
              required
            >
              {subjects.map(sub => <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField name="name" label="Unit Name" value={unitForm.name || ''} onChange={handleUnitFormChange} fullWidth margin="dense" required />
          <TextField name="number" label="Number" type="number" value={unitForm.number ?? 1} onChange={handleUnitFormChange} fullWidth margin="dense" />
          <TextField name="description" label="Description" value={unitForm.description || ''} onChange={handleUnitFormChange} fullWidth margin="dense" multiline minRows={2} />
          <TextField name="order" label="Order" type="number" value={unitForm.order ?? 1} onChange={handleUnitFormChange} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnitDialog}>Cancel</Button>
          <Button onClick={handleSaveUnit} variant="contained">{editingUnit ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Assessment Dialog */}
      <Dialog open={openAssessmentDialog} onClose={handleCloseAssessmentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAssessment ? 'Edit Assessment' : 'Add Assessment'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Subject</InputLabel>
            <Select name="subject_id" value={assessmentForm.subject_id || ''} onChange={handleAssessmentFormChange} label="Subject" required MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}>
              {subjects.map(sub => <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Term</InputLabel>
            <Select name="term_id" value={assessmentForm.term_id || ''} onChange={handleAssessmentFormChange} label="Term" required MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}>
              {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Assessment Type</InputLabel>
            <Select name="assessment_type_id" value={assessmentForm.assessment_type_id || ''} onChange={handleAssessmentFormChange} label="Assessment Type" required MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}>
              {assessmentTypes.map(at => <MenuItem key={at.id} value={at.id}>{at.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Unit</InputLabel>
            <Select name="unit_id" value={assessmentForm.unit_id || ''} onChange={handleAssessmentFormChange} label="Unit" MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}>
              <MenuItem value="">None</MenuItem>
              {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField name="name" label="Name" value={assessmentForm.name || ''} onChange={handleAssessmentFormChange} fullWidth margin="dense" required />
          <TextField name="date" label="Date" type="date" value={assessmentForm.date || ''} onChange={handleAssessmentFormChange} fullWidth margin="dense" InputLabelProps={{ shrink: true }} />
          <TextField name="max_marks" label="Max Marks" type="number" value={assessmentForm.max_marks ?? 100} onChange={handleAssessmentFormChange} fullWidth margin="dense" />
          <TextField name="passing_marks" label="Passing Marks" type="number" value={assessmentForm.passing_marks ?? 40} onChange={handleAssessmentFormChange} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssessmentDialog}>Cancel</Button>
          <Button onClick={handleSaveAssessment} variant="contained">{editingAssessment ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Marks Entry Dialog */}
      <Dialog open={openMarksEntryDialog} onClose={handleCloseMarksEntryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMarksEntry ? 'Edit Marks Entry' : 'Add Marks Entry'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Student</InputLabel>
            <Select name="student_id" value={marksEntryForm.student_id || ''} onChange={handleMarksEntryFormChange} label="Student" required MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}>
              {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Assessment</InputLabel>
            <Select name="assessment_id" value={marksEntryForm.assessment_id || ''} onChange={handleMarksEntryFormChange} label="Assessment" required MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}>
              {assessments.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField name="marks_obtained" label="Marks Obtained" type="number" value={marksEntryForm.marks_obtained ?? ''} onChange={handleMarksEntryFormChange} fullWidth margin="dense" />
          <TextField name="max_marks" label="Max Marks" type="number" value={marksEntryForm.max_marks ?? ''} onChange={handleMarksEntryFormChange} fullWidth margin="dense" />
          <TextField name="remarks" label="Remarks" value={marksEntryForm.remarks || ''} onChange={handleMarksEntryFormChange} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMarksEntryDialog}>Cancel</Button>
          <Button onClick={handleSaveMarksEntry} variant="contained">{editingMarksEntry ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Installments Dialog */}
      <Dialog open={installmentDialogOpen} onClose={handleCloseInstallmentDialog}>
        <DialogTitle>Generate Installments for Student</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Student</InputLabel>
            <Select
              name="student_id"
              value={installmentForm.student_id}
              onChange={handleInstallmentFormChange}
              label="Student"
              required
            >
              {students.map(student => (
                <MenuItem key={student.id} value={student.id}>{student.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Fee Structure</InputLabel>
            <Select
              name="fee_structure_id"
              value={installmentForm.fee_structure_id}
              onChange={handleInstallmentFormChange}
              label="Fee Structure"
              required
            >
              {feeStructures.map(fs => (
                <MenuItem key={fs.id} value={fs.id}>
                  {fs.fee_type} - ₹{fs.amount}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Installment Plan</InputLabel>
            <Select
              name="installment_plan_id"
              value={installmentForm.installment_plan_id}
              onChange={handleInstallmentFormChange}
              label="Installment Plan"
              required
            >
              {installmentPlans.map(plan => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name} ({plan.number_of_installments} installments)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="start_date"
            label="Start Date"
            type="date"
            value={installmentForm.start_date}
            onChange={handleInstallmentFormChange}
            fullWidth
            required
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstallmentDialog}>Cancel</Button>
          <Button onClick={handleGenerateInstallments} variant="contained">Generate Installments</Button>
        </DialogActions>
      </Dialog>

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
      {/* Enhanced Report Card Dialog */}
      <Dialog open={openReportCardDialog} onClose={handleCloseReportCardDialog} maxWidth="md" fullWidth sx={{ zIndex: 2000 }}>
        <DialogTitle>{editingReportCard ? 'Edit Report Card' : 'Add Report Card'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Student</InputLabel>
            <Select
              name="student_id"
              value={reportCardForm.student_id || ''}
              onChange={handleReportCardFormChange}
              label="Student"
              required
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Academic Year</InputLabel>
            <Select
              name="academic_year_id"
              value={reportCardForm.academic_year_id || ''}
              onChange={handleReportCardFormChange}
              label="Academic Year"
              required
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              {academicYears.map(ay => <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Term</InputLabel>
            <Select
              name="term_id"
              value={reportCardForm.term_id || ''}
              onChange={handleReportCardFormChange}
              label="Term"
              required
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              {terms.map(term => <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Class</InputLabel>
            <Select
              name="class_obj_id"
              value={reportCardForm.class_obj_id || ''}
              onChange={handleReportCardFormChange}
              label="Class"
              required
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              {classes.map(cls => <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            name="teacher_remarks"
            label="Teacher Remarks"
            value={reportCardForm.teacher_remarks || ''}
            onChange={handleReportCardFormChange}
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            placeholder="Enter teacher remarks..."
          />
          <TextField
            name="principal_remarks"
            label="Principal Remarks"
            value={reportCardForm.principal_remarks || ''}
            onChange={handleReportCardFormChange}
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            placeholder="Enter principal remarks..."
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Conduct Grade</InputLabel>
            <Select
              name="conduct_grade"
              value={reportCardForm.conduct_grade || ''}
              onChange={handleReportCardFormChange}
              label="Conduct Grade"
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              <MenuItem value="">Select Grade</MenuItem>
              <MenuItem value="A+">A+</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B+">B+</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C+">C+</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="issued_date"
            label="Issued Date"
            type="date"
            value={reportCardForm.issued_date || ''}
            onChange={handleReportCardFormChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportCardDialog}>Cancel</Button>
          <Button onClick={handleSaveReportCard} variant="contained">{editingReportCard ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Report Card Dialog */}
      <Dialog open={generateReportCardDialogOpen} onClose={handleCloseGenerateReportCardDialog} maxWidth="md" fullWidth sx={{ zIndex: 2000 }}>
        <DialogTitle>Generate Report Card</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Student</InputLabel>
            <Select
              name="student_id"
              value={generateReportCardForm.student_id || ''}
              onChange={handleGenerateReportCardFormChange}
              label="Student"
              required
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Academic Year</InputLabel>
            <Select
              name="academic_year_id"
              value={generateReportCardForm.academic_year_id || ''}
              onChange={handleGenerateReportCardFormChange}
              label="Academic Year"
              required
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              {academicYears.map(ay => <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Term</InputLabel>
            <Select
              name="term_id"
              value={generateReportCardForm.term_id || ''}
              onChange={handleGenerateReportCardFormChange}
              label="Term"
              required
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              {terms.map(term => <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            name="teacher_remarks"
            label="Teacher Remarks"
            value={generateReportCardForm.teacher_remarks || ''}
            onChange={handleGenerateReportCardFormChange}
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            placeholder="Enter teacher remarks..."
          />
          <TextField
            name="principal_remarks"
            label="Principal Remarks"
            value={generateReportCardForm.principal_remarks || ''}
            onChange={handleGenerateReportCardFormChange}
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            placeholder="Enter principal remarks..."
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Conduct Grade</InputLabel>
            <Select
              name="conduct_grade"
              value={generateReportCardForm.conduct_grade || ''}
              onChange={handleGenerateReportCardFormChange}
              label="Conduct Grade"
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              <MenuItem value="">Select Grade</MenuItem>
              <MenuItem value="A+">A+</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B+">B+</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C+">C+</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="issued_date"
            label="Issued Date"
            type="date"
            value={generateReportCardForm.issued_date || ''}
            onChange={handleGenerateReportCardFormChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGenerateReportCardDialog}>Cancel</Button>
          <Button onClick={handleGenerateReportCardSubmit} variant="contained">Generate Report Card</Button>
        </DialogActions>
      </Dialog>

      {/* Academic Year Dialog */}
      <Dialog open={openAcademicYearDialog} onClose={handleCloseAcademicYearDialog}>
        <DialogTitle>{editingAcademicYear ? 'Edit Academic Year' : 'Add Academic Year'}</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Academic Year Name"
            value={academicYearForm.name}
            onChange={handleAcademicYearFormChange}
            fullWidth
            required
            margin="dense"
            placeholder="e.g., 2024-25"
          />
          <TextField
            name="start_date"
            label="Start Date"
            type="date"
            value={academicYearForm.start_date}
            onChange={handleAcademicYearFormChange}
            fullWidth
            required
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="end_date"
            label="End Date"
            type="date"
            value={academicYearForm.end_date}
            onChange={handleAcademicYearFormChange}
            fullWidth
            required
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="dense">
            <label>
              <input
                type="checkbox"
                name="is_current"
                checked={academicYearForm.is_current}
                onChange={handleAcademicYearFormChange}
              />
              Set as Current Academic Year
            </label>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAcademicYearDialog}>Cancel</Button>
          <Button onClick={handleSaveAcademicYear} variant="contained">{editingAcademicYear ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Term Dialog */}
      <Dialog open={openTermDialog} onClose={handleCloseTermDialog}>
        <DialogTitle>{editingTerm ? 'Edit Term' : 'Add Term'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Academic Year</InputLabel>
            <Select
              name="academic_year_id"
              value={termForm.academic_year_id}
              onChange={handleTermFormChange}
              label="Academic Year"
              required
            >
              {academicYears.map(ay => <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            name="name"
            label="Term Name"
            value={termForm.name}
            onChange={handleTermFormChange}
            fullWidth
            required
            margin="dense"
            placeholder="e.g., Term 1, Semester 1"
          />
          <TextField
            name="order"
            label="Order"
            type="number"
            value={termForm.order}
            onChange={handleTermFormChange}
            fullWidth
            required
            margin="dense"
          />
          <TextField
            name="start_date"
            label="Start Date"
            type="date"
            value={termForm.start_date}
            onChange={handleTermFormChange}
            fullWidth
            required
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="end_date"
            label="End Date"
            type="date"
            value={termForm.end_date}
            onChange={handleTermFormChange}
            fullWidth
            required
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="dense">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={termForm.is_active}
                onChange={handleTermFormChange}
              />
              Active
            </label>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTermDialog}>Cancel</Button>
          <Button onClick={handleSaveTerm} variant="contained">{editingTerm ? 'Update' : 'Add'}</Button>
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