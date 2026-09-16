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
  Tabs,
  Tab,
  Alert,
  Snackbar,
  TablePagination,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Event as EventIcon
} from '@mui/icons-material';
import {
  fetchPeriods, createPeriod, updatePeriod, deletePeriod,
  fetchRooms, createRoom, updateRoom, deleteRoom,
  fetchTimetable, createTimetable, updateTimetable, deleteTimetable, fetchTimetableByClass,
  fetchHolidays, createHoliday, updateHoliday, deleteHoliday,
  fetchSubstitutes, createSubstitute, updateSubstitute, deleteSubstitute,
  fetchClasses, fetchAcademicYears, fetchSubjects, fetchEducationStaff,
  fetchAvailableTeachers, fetchAvailableRooms, fetchTimetableSuggestions
} from '../../services/api';

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const TimetableManagement = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // Data states
  const [periods, setPeriods] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  
  // Dialog states
  const [periodDialog, setPeriodDialog] = useState(false);
  const [roomDialog, setRoomDialog] = useState(false);
  const [timetableDialog, setTimetableDialog] = useState(false);
  const [holidayDialog, setHolidayDialog] = useState(false);
  const [substituteDialog, setSubstituteDialog] = useState(false);
  
  // Form states
  const [periodForm, setPeriodForm] = useState({
    name: '',
    order: '',
    start_time: '',
    end_time: '',
    is_break: false,
    break_type: ''
  });
  
  const [roomForm, setRoomForm] = useState({
    name: '',
    room_number: '',
    room_type: 'classroom',
    capacity: '',
    facilities: ''
  });
  
  const [timetableForm, setTimetableForm] = useState({
    academic_year: '',
    class_obj: '',
    day: '',
    period: '',
    subject: '',
    teacher: '',
    room: '',
    notes: ''
  });
  
  const [holidayForm, setHolidayForm] = useState({
    academic_year: '',
    name: '',
    date: '',
    holiday_type: 'school',
    is_recurring: false,
    description: ''
  });
  
  const [substituteForm, setSubstituteForm] = useState({
    timetable: '',
    date: '',
    original_teacher: '',
    substitute_teacher: '',
    reason: '',
    notes: ''
  });
  
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Smart Suggestions State
  const [suggestions, setSuggestions] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState(null);
  const [availableRooms, setAvailableRooms] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Load timetable when filters change
  useEffect(() => {
    if (selectedClass && selectedAcademicYear) {
      loadTimetable();
    }
  }, [selectedClass, selectedAcademicYear, selectedDay]);
  
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [periodsData, roomsData, classesData, academicYearsData, teachersData] = await Promise.all([
        fetchPeriods(),
        fetchRooms(),
        fetchClasses(),
        fetchAcademicYears(),
        fetchEducationStaff()
      ]);
      
      setPeriods(periodsData);
      setRooms(roomsData);
      setClasses(classesData);
      setAcademicYears(academicYearsData);
      setTeachers(teachersData);
      
      // Set default academic year if available
      const currentYear = academicYearsData.find(ay => ay.is_current) || academicYearsData[0];
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id);
      }
      
      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id);
      }
      
      await loadSubjects();
      await loadHolidays();
      await loadSubstitutes();
    } catch (error) {
      showSnackbar('Error loading data: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const loadSubjects = async () => {
    try {
      if (selectedClass) {
        const subjectsData = await fetchSubjects();
        const filteredSubjects = subjectsData.filter(s => s.class_obj === parseInt(selectedClass));
        setSubjects(filteredSubjects);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };
  
  const loadTimetable = async () => {
    try {
      if (selectedClass && selectedAcademicYear) {
        const params = {
          academic_year: selectedAcademicYear,
          class: selectedClass
        };
        if (selectedDay) {
          params.day = selectedDay;
        }
        const data = await fetchTimetable(params);
        setTimetable(data);
      }
    } catch (error) {
      showSnackbar('Error loading timetable: ' + (error.response?.data?.error || error.message), 'error');
    }
  };
  
  const loadHolidays = async () => {
    try {
      const data = await fetchHolidays(selectedAcademicYear || null);
      setHolidays(data);
    } catch (error) {
      console.error('Error loading holidays:', error);
    }
  };
  
  const loadSubstitutes = async () => {
    try {
      const data = await fetchSubstitutes();
      setSubstitutes(data);
    } catch (error) {
      console.error('Error loading substitutes:', error);
    }
  };
  
  useEffect(() => {
    loadSubjects();
  }, [selectedClass]);
  
  useEffect(() => {
    loadHolidays();
  }, [selectedAcademicYear]);
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Period Management
  const handlePeriodSubmit = async () => {
    try {
      // Validate required fields
      if (!periodForm.name || !periodForm.name.trim()) {
        showSnackbar('Error: Period name is required', 'error');
        return;
      }
      if (!periodForm.order || isNaN(periodForm.order) || periodForm.order <= 0) {
        showSnackbar('Error: Valid order number is required', 'error');
        return;
      }
      if (!periodForm.start_time) {
        showSnackbar('Error: Start time is required', 'error');
        return;
      }
      if (!periodForm.end_time) {
        showSnackbar('Error: End time is required', 'error');
        return;
      }

      // Prepare data with proper formatting
      const periodData = {
        name: periodForm.name.trim(),
        order: parseInt(periodForm.order),
        start_time: periodForm.start_time, // HTML time input format (HH:MM) is accepted by Django
        end_time: periodForm.end_time,
        is_break: periodForm.is_break || false,
        break_type: periodForm.is_break ? (periodForm.break_type || '') : ''
      };

      if (editingId) {
        await updatePeriod(editingId, periodData);
        showSnackbar('Period updated successfully');
      } else {
        await createPeriod(periodData);
        showSnackbar('Period created successfully');
      }
      setPeriodDialog(false);
      setPeriodForm({ name: '', order: '', start_time: '', end_time: '', is_break: false, break_type: '' });
      setEditingId(null);
      await loadAllData();
    } catch (error) {
      console.error('Period submit error:', error);
      let errorMessage = 'Unknown error';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
          // Add details if available
          if (errorData.details) {
            if (typeof errorData.details === 'object') {
              const detailMessages = Object.entries(errorData.details).map(([field, msg]) => `${field}: ${msg}`);
              errorMessage += ' - ' + detailMessages.join(', ');
            } else {
              errorMessage += ' - ' + errorData.details;
            }
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          // Handle validation errors from Django
          const validationErrors = Object.entries(errorData).map(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msg}`;
          });
          errorMessage = validationErrors.join('; ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showSnackbar('Error: ' + errorMessage, 'error');
    }
  };
  
  const handlePeriodEdit = (period) => {
    setPeriodForm({
      name: period.name,
      order: period.order,
      start_time: period.start_time,
      end_time: period.end_time,
      is_break: period.is_break,
      break_type: period.break_type || ''
    });
    setEditingId(period.id);
    setPeriodDialog(true);
  };
  
  const handlePeriodDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this period?')) {
      try {
        await deletePeriod(id);
        showSnackbar('Period deleted successfully');
        await loadAllData();
      } catch (error) {
        showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
      }
    }
  };
  
  // Room Management
  const handleRoomSubmit = async () => {
    try {
      if (editingId) {
        await updateRoom(editingId, roomForm);
        showSnackbar('Room updated successfully');
      } else {
        await createRoom(roomForm);
        showSnackbar('Room created successfully');
      }
      setRoomDialog(false);
      setRoomForm({ name: '', room_number: '', room_type: 'classroom', capacity: '', facilities: '' });
      setEditingId(null);
      await loadAllData();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
    }
  };
  
  const handleRoomEdit = (room) => {
    setRoomForm({
      name: room.name,
      room_number: room.room_number || '',
      room_type: room.room_type,
      capacity: room.capacity || '',
      facilities: room.facilities || ''
    });
    setEditingId(room.id);
    setRoomDialog(true);
  };
  
  const handleRoomDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(id);
        showSnackbar('Room deleted successfully');
        await loadAllData();
      } catch (error) {
        showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
      }
    }
  };
  
  // Timetable Management
  const handleTimetableSubmit = async () => {
    try {
      const data = {
        academic_year: parseInt(timetableForm.academic_year),
        class_obj: parseInt(timetableForm.class_obj),
        day: timetableForm.day,
        period: parseInt(timetableForm.period),
        subject: parseInt(timetableForm.subject),
        teacher: timetableForm.teacher ? parseInt(timetableForm.teacher) : null,
        room: timetableForm.room ? parseInt(timetableForm.room) : null,
        notes: timetableForm.notes || ''
      };
      
      if (editingId) {
        await updateTimetable(editingId, data);
        showSnackbar('Timetable entry updated successfully');
      } else {
        await createTimetable(data);
        showSnackbar('Timetable entry created successfully');
      }
      setTimetableDialog(false);
      setTimetableForm({ academic_year: '', class_obj: '', day: '', period: '', subject: '', teacher: '', room: '', notes: '' });
      setEditingId(null);
      await loadTimetable();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      if (error.response?.status === 409) {
        showSnackbar(`Conflict: ${errorMsg}`, 'error');
      } else {
        showSnackbar('Error: ' + errorMsg, 'error');
      }
    }
  };
  
  const handleTimetableEdit = (entry) => {
    setTimetableForm({
      academic_year: entry.academic_year,
      class_obj: entry.class_obj,
      day: entry.day,
      period: entry.period,
      subject: entry.subject,
      teacher: entry.teacher || '',
      room: entry.room || '',
      notes: entry.notes || ''
    });
    setEditingId(entry.id);
    setTimetableDialog(true);
    // Load suggestions for editing
    loadTimetableSuggestions(entry.academic_year, entry.class_obj, entry.day, entry.period, entry.subject);
  };
  
  // Load smart suggestions
  const loadTimetableSuggestions = async (academicYearId, classId, day, periodId, subjectId = null) => {
    if (!academicYearId || !classId || !day || !periodId) return;
    
    try {
      setLoadingSuggestions(true);
      const suggestionsData = await fetchTimetableSuggestions(
        academicYearId,
        classId,
        day,
        periodId,
        subjectId
      );
      setSuggestions(suggestionsData);
      
      // Also load separate availability data
      const [teachersData, roomsData] = await Promise.all([
        fetchAvailableTeachers(academicYearId, day, periodId, classId),
        fetchAvailableRooms(academicYearId, day, periodId)
      ]);
      setAvailableTeachers(teachersData);
      setAvailableRooms(roomsData);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions(null);
      setAvailableTeachers(null);
      setAvailableRooms(null);
    } finally {
      setLoadingSuggestions(false);
    }
  };
  
  // Handle opening timetable dialog with smart suggestions
  const handleTimetableDialogOpen = (day = null, periodId = null) => {
    const formData = {
      academic_year: selectedAcademicYear || '',
      class_obj: selectedClass || '',
      day: day || '',
      period: periodId || '',
      subject: '',
      teacher: '',
      room: '',
      notes: ''
    };
    setTimetableForm(formData);
    setEditingId(null);
    setTimetableDialog(true);
    
    // Load suggestions if we have required data
    if (selectedAcademicYear && selectedClass && day && periodId) {
      loadTimetableSuggestions(selectedAcademicYear, selectedClass, day, periodId);
    }
  };
  
  // Auto-load suggestions when form fields change
  useEffect(() => {
    if (timetableDialog && !editingId && timetableForm.academic_year && 
        timetableForm.class_obj && timetableForm.day && timetableForm.period) {
      loadTimetableSuggestions(
        timetableForm.academic_year,
        timetableForm.class_obj,
        timetableForm.day,
        timetableForm.period,
        timetableForm.subject || null
      );
    }
  }, [timetableDialog, timetableForm.academic_year, timetableForm.class_obj, timetableForm.day, timetableForm.period, timetableForm.subject]);
  
  const handleTimetableDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await deleteTimetable(id);
        showSnackbar('Timetable entry deleted successfully');
        await loadTimetable();
      } catch (error) {
        showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
      }
    }
  };
  
  // Holiday Management
  const handleHolidaySubmit = async () => {
    try {
      const data = {
        academic_year: parseInt(holidayForm.academic_year),
        name: holidayForm.name,
        date: holidayForm.date,
        holiday_type: holidayForm.holiday_type,
        is_recurring: holidayForm.is_recurring,
        description: holidayForm.description || ''
      };
      
      if (editingId) {
        await updateHoliday(editingId, data);
        showSnackbar('Holiday updated successfully');
      } else {
        await createHoliday(data);
        showSnackbar('Holiday created successfully');
      }
      setHolidayDialog(false);
      setHolidayForm({ academic_year: '', name: '', date: '', holiday_type: 'school', is_recurring: false, description: '' });
      setEditingId(null);
      await loadHolidays();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
    }
  };
  
  const handleHolidayEdit = (holiday) => {
    setHolidayForm({
      academic_year: holiday.academic_year,
      name: holiday.name,
      date: holiday.date,
      holiday_type: holiday.holiday_type,
      is_recurring: holiday.is_recurring,
      description: holiday.description || ''
    });
    setEditingId(holiday.id);
    setHolidayDialog(true);
  };
  
  const handleHolidayDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await deleteHoliday(id);
        showSnackbar('Holiday deleted successfully');
        await loadHolidays();
      } catch (error) {
        showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
      }
    }
  };
  
  // Substitute Management
  const handleSubstituteSubmit = async () => {
    try {
      const data = {
        timetable: parseInt(substituteForm.timetable),
        date: substituteForm.date,
        original_teacher: parseInt(substituteForm.original_teacher),
        substitute_teacher: parseInt(substituteForm.substitute_teacher),
        reason: substituteForm.reason || '',
        notes: substituteForm.notes || ''
      };
      
      if (editingId) {
        await updateSubstitute(editingId, data);
        showSnackbar('Substitute assignment updated successfully');
      } else {
        await createSubstitute(data);
        showSnackbar('Substitute assignment created successfully');
      }
      setSubstituteDialog(false);
      setSubstituteForm({ timetable: '', date: '', original_teacher: '', substitute_teacher: '', reason: '', notes: '' });
      setEditingId(null);
      await loadSubstitutes();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
    }
  };
  
  const handleSubstituteEdit = (substitute) => {
    setSubstituteForm({
      timetable: substitute.timetable,
      date: substitute.date,
      original_teacher: substitute.original_teacher,
      substitute_teacher: substitute.substitute_teacher,
      reason: substitute.reason || '',
      notes: substitute.notes || ''
    });
    setEditingId(substitute.id);
    setSubstituteDialog(true);
  };
  
  const handleSubstituteDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this substitute assignment?')) {
      try {
        await deleteSubstitute(id);
        showSnackbar('Substitute assignment deleted successfully');
        await loadSubstitutes();
      } catch (error) {
        showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
      }
    }
  };
  
  // Render Timetable Grid
  const renderTimetableGrid = () => {
    if (!selectedClass || !selectedAcademicYear) {
      return (
        <Alert severity="info">Please select a class and academic year to view timetable</Alert>
      );
    }
    
    const filteredPeriods = periods.filter(p => !p.is_break).sort((a, b) => a.order - b.order);
    const filteredTimetable = selectedDay 
      ? timetable.filter(t => t.day === selectedDay)
      : timetable;
    
    // Create a grid: Days (columns) x Periods (rows)
    const days = selectedDay ? [selectedDay] : DAYS.map(d => d.value);
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Period</strong></TableCell>
              {days.map(day => (
                <TableCell key={day} align="center">
                  <strong>{DAYS.find(d => d.value === day)?.label}</strong>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPeriods.map(period => (
              <TableRow key={period.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {period.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {period.start_time_display} - {period.end_time_display}
                  </Typography>
                </TableCell>
                {days.map(day => {
                  const entry = filteredTimetable.find(
                    t => t.day === day && t.period === period.id
                  );
                  return (
                    <TableCell key={day} align="center">
                      {entry ? (
                        <Box>
                          <Chip 
                            label={entry.subject_name} 
                            size="small" 
                            color="primary"
                            sx={{ mb: 0.5 }}
                          />
                          {entry.teacher_name && (
                            <Typography variant="caption" display="block">
                              {entry.teacher_name}
                            </Typography>
                          )}
                          {entry.room_name && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {entry.room_name}
                            </Typography>
                          )}
                          <Box sx={{ mt: 0.5 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleTimetableEdit(entry)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleTimetableDelete(entry.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => handleTimetableDialogOpen(day, period.id)}
                          color="primary"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon /> Timetable Management
      </Typography>
      
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  label="Academic Year"
                >
                  {academicYears.map(ay => (
                    <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Class"
                >
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Day (Optional)</InputLabel>
                <Select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  label="Day (Optional)"
                >
                  <MenuItem value="">All Days</MenuItem>
                  {DAYS.map(day => (
                    <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Timetable Grid" icon={<ScheduleIcon />} iconPosition="start" />
        <Tab label="Periods" icon={<TimeIcon />} iconPosition="start" />
        <Tab label="Rooms" icon={<RoomIcon />} iconPosition="start" />
        <Tab label="Holidays" icon={<CalendarIcon />} iconPosition="start" />
        <Tab label="Substitutes" icon={<PersonIcon />} iconPosition="start" />
      </Tabs>
      
      {/* Timetable Grid Tab */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Timetable Grid</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleTimetableDialogOpen()}
              >
                Add Entry
              </Button>
            </Box>
            {renderTimetableGrid()}
          </CardContent>
        </Card>
      )}
      
      {/* Periods Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Periods</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setPeriodForm({ name: '', order: '', start_time: '', end_time: '', is_break: false, break_type: '' });
                  setEditingId(null);
                  setPeriodDialog(true);
                }}
              >
                Add Period
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods.sort((a, b) => a.order - b.order).map(period => (
                    <TableRow key={period.id}>
                      <TableCell>{period.name}</TableCell>
                      <TableCell>{period.order}</TableCell>
                      <TableCell>{period.start_time_display}</TableCell>
                      <TableCell>{period.end_time_display}</TableCell>
                      <TableCell>{period.duration_minutes} min</TableCell>
                      <TableCell>
                        {period.is_break ? (
                          <Chip label={period.break_type || 'Break'} size="small" color="warning" />
                        ) : (
                          <Chip label="Period" size="small" color="primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handlePeriodEdit(period)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handlePeriodDelete(period.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Rooms Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Rooms</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setRoomForm({ name: '', room_number: '', room_type: 'classroom', capacity: '', facilities: '' });
                  setEditingId(null);
                  setRoomDialog(true);
                }}
              >
                Add Room
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Room Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Facilities</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rooms.map(room => (
                    <TableRow key={room.id}>
                      <TableCell>{room.name}</TableCell>
                      <TableCell>{room.room_number || '-'}</TableCell>
                      <TableCell>{room.room_type_display}</TableCell>
                      <TableCell>{room.capacity || '-'}</TableCell>
                      <TableCell>{room.facilities || '-'}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleRoomEdit(room)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRoomDelete(room.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Holidays Tab */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Holidays</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setHolidayForm({ academic_year: selectedAcademicYear || '', name: '', date: '', holiday_type: 'school', is_recurring: false, description: '' });
                  setEditingId(null);
                  setHolidayDialog(true);
                }}
              >
                Add Holiday
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Recurring</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holidays.map(holiday => (
                    <TableRow key={holiday.id}>
                      <TableCell>{holiday.name}</TableCell>
                      <TableCell>{holiday.date_display}</TableCell>
                      <TableCell>{holiday.holiday_type_display}</TableCell>
                      <TableCell>{holiday.is_recurring ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleHolidayEdit(holiday)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleHolidayDelete(holiday.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Substitutes Tab */}
      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Substitute Teachers</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSubstituteForm({ timetable: '', date: '', original_teacher: '', substitute_teacher: '', reason: '', notes: '' });
                  setEditingId(null);
                  setSubstituteDialog(true);
                }}
              >
                Add Substitute
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Original Teacher</TableCell>
                    <TableCell>Substitute</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {substitutes.map(substitute => (
                    <TableRow key={substitute.id}>
                      <TableCell>{substitute.date_display}</TableCell>
                      <TableCell>{substitute.timetable_class}</TableCell>
                      <TableCell>{substitute.timetable_period}</TableCell>
                      <TableCell>{substitute.timetable_subject}</TableCell>
                      <TableCell>{substitute.original_teacher_name}</TableCell>
                      <TableCell>{substitute.substitute_teacher_name}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleSubstituteEdit(substitute)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleSubstituteDelete(substitute.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Period Dialog */}
      <Dialog open={periodDialog} onClose={() => setPeriodDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Period' : 'Add Period'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Period Name"
                value={periodForm.name}
                onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Order"
                type="number"
                value={periodForm.order}
                onChange={(e) => {
                  const val = e.target.value;
                  setPeriodForm({ ...periodForm, order: val === '' ? '' : parseInt(val) || '' });
                }}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={periodForm.is_break}
                    onChange={(e) => setPeriodForm({ ...periodForm, is_break: e.target.checked })}
                  />
                }
                label="Is Break?"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={periodForm.start_time}
                onChange={(e) => setPeriodForm({ ...periodForm, start_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={periodForm.end_time}
                onChange={(e) => setPeriodForm({ ...periodForm, end_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            {periodForm.is_break && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Break Type</InputLabel>
                  <Select
                    value={periodForm.break_type}
                    onChange={(e) => setPeriodForm({ ...periodForm, break_type: e.target.value })}
                    label="Break Type"
                  >
                    <MenuItem value="recess">Recess</MenuItem>
                    <MenuItem value="lunch">Lunch Break</MenuItem>
                    <MenuItem value="assembly">Assembly</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPeriodDialog(false)}>Cancel</Button>
          <Button onClick={handlePeriodSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Room Dialog */}
      <Dialog open={roomDialog} onClose={() => setRoomDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room Name"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Room Number"
                value={roomForm.room_number}
                onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={roomForm.room_type}
                  onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                  label="Room Type"
                >
                  <MenuItem value="classroom">Classroom</MenuItem>
                  <MenuItem value="lab">Laboratory</MenuItem>
                  <MenuItem value="library">Library</MenuItem>
                  <MenuItem value="hall">Hall</MenuItem>
                  <MenuItem value="computer_lab">Computer Lab</MenuItem>
                  <MenuItem value="physics_lab">Physics Lab</MenuItem>
                  <MenuItem value="chemistry_lab">Chemistry Lab</MenuItem>
                  <MenuItem value="biology_lab">Biology Lab</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facilities"
                multiline
                rows={3}
                value={roomForm.facilities}
                onChange={(e) => setRoomForm({ ...roomForm, facilities: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialog(false)}>Cancel</Button>
          <Button onClick={handleRoomSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Timetable Dialog */}
      <Dialog 
        open={timetableDialog} 
        onClose={() => {
          setTimetableDialog(false);
          setSuggestions(null);
          setAvailableTeachers(null);
          setAvailableRooms(null);
        }} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>{editingId ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
        <DialogContent>
          {/* Smart Suggestions Section */}
          {loadingSuggestions && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2">Loading smart suggestions...</Typography>
              <CircularProgress size={20} sx={{ ml: 1 }} />
            </Box>
          )}
          
          {suggestions && suggestions.suggestions && !loadingSuggestions && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>💡 Smart Recommendations:</strong>
              </Typography>
              {suggestions.suggestions.recommended_teacher && (
                <Box sx={{ mb: 1 }}>
                  <Chip 
                    label={`👨‍🏫 Recommended Teacher: ${suggestions.suggestions.recommended_teacher.name}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setTimetableForm({ ...timetableForm, teacher: suggestions.suggestions.recommended_teacher.id })}
                  >
                    Use This
                  </Button>
                </Box>
              )}
              {suggestions.suggestions.recommended_room && (
                <Box>
                  <Chip 
                    label={`🏫 Recommended Room: ${suggestions.suggestions.recommended_room.name}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setTimetableForm({ ...timetableForm, room: suggestions.suggestions.recommended_room.id })}
                  >
                    Use This
                  </Button>
                </Box>
              )}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={timetableForm.academic_year}
                  onChange={(e) => setTimetableForm({ ...timetableForm, academic_year: e.target.value })}
                  label="Academic Year"
                >
                  {academicYears.map(ay => (
                    <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={timetableForm.class_obj}
                  onChange={(e) => {
                    setTimetableForm({ ...timetableForm, class_obj: e.target.value });
                    // Load subjects for selected class
                  }}
                  label="Class"
                >
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Day</InputLabel>
                <Select
                  value={timetableForm.day}
                  onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value })}
                  label="Day"
                >
                  {DAYS.map(day => (
                    <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Period</InputLabel>
                <Select
                  value={timetableForm.period}
                  onChange={(e) => setTimetableForm({ ...timetableForm, period: e.target.value })}
                  label="Period"
                >
                  {periods.filter(p => !p.is_break).map(period => (
                    <MenuItem key={period.id} value={period.id}>
                      {period.name} ({period.start_time_display} - {period.end_time_display})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={timetableForm.subject}
                  onChange={(e) => setTimetableForm({ ...timetableForm, subject: e.target.value })}
                  label="Subject"
                >
                  {subjects.filter(s => s.class_obj === parseInt(timetableForm.class_obj || 0)).map(subject => (
                    <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Teacher (Optional)</InputLabel>
                <Select
                  value={timetableForm.teacher}
                  onChange={(e) => setTimetableForm({ ...timetableForm, teacher: e.target.value })}
                  label="Teacher (Optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {/* Show available teachers first (assigned to class) */}
                  {suggestions && suggestions.available_teachers?.assigned_to_class?.length > 0 && (
                    <MenuItem disabled>
                      <Typography variant="overline" color="primary">✓ Available - Assigned to Class</Typography>
                    </MenuItem>
                  )}
                  {suggestions && suggestions.available_teachers?.assigned_to_class?.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{teacher.name}</span>
                        <Chip label="Assigned" size="small" color="success" />
                        {teacher.has_taught_subject && (
                          <Chip label="Has Taught" size="small" color="info" />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                  {/* Show other available teachers */}
                  {suggestions && suggestions.available_teachers?.others?.length > 0 && (
                    <MenuItem disabled>
                      <Typography variant="overline" color="text.secondary">Other Available Teachers</Typography>
                    </MenuItem>
                  )}
                  {suggestions && suggestions.available_teachers?.others?.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{teacher.name}</span>
                        {teacher.has_taught_subject && (
                          <Chip label="Has Taught" size="small" color="info" />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                  {/* Show busy teachers (disabled) */}
                  {availableTeachers && availableTeachers.busy_teachers?.length > 0 && (
                    <MenuItem disabled>
                      <Typography variant="overline" color="error">⚠ Busy at this time</Typography>
                    </MenuItem>
                  )}
                  {availableTeachers && availableTeachers.busy_teachers?.map(teacher => (
                    <MenuItem key={teacher.id} value="" disabled>
                      {teacher.name} {teacher.busy_with && `(Busy with ${teacher.busy_with})`}
                    </MenuItem>
                  ))}
                  {/* Fallback to all teachers if suggestions not loaded */}
                  {(!suggestions || !availableTeachers) && teachers.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.user?.first_name || ''} {teacher.user?.last_name || ''} ({teacher.user?.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {suggestions && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {suggestions.available_teachers?.total || 0} teachers available, {availableTeachers?.total_busy || 0} busy
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Room (Optional)</InputLabel>
                <Select
                  value={timetableForm.room}
                  onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })}
                  label="Room (Optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {/* Show suitable rooms first (based on subject) */}
                  {suggestions && suggestions.available_rooms?.suitable?.length > 0 && (
                    <MenuItem disabled>
                      <Typography variant="overline" color="success.main">✓ Suitable for Subject</Typography>
                    </MenuItem>
                  )}
                  {suggestions && suggestions.available_rooms?.suitable?.map(room => (
                    <MenuItem key={room.id} value={room.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{room.name}</span>
                        <Chip label={room.room_type_display} size="small" color="success" />
                        {room.capacity && <Typography variant="caption">({room.capacity} seats)</Typography>}
                      </Box>
                    </MenuItem>
                  ))}
                  {/* Show other available rooms */}
                  {suggestions && suggestions.available_rooms?.others?.length > 0 && (
                    <MenuItem disabled>
                      <Typography variant="overline" color="text.secondary">Other Available Rooms</Typography>
                    </MenuItem>
                  )}
                  {suggestions && suggestions.available_rooms?.others?.map(room => (
                    <MenuItem key={room.id} value={room.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{room.name}</span>
                        <Chip label={room.room_type_display} size="small" />
                        {room.capacity && <Typography variant="caption">({room.capacity} seats)</Typography>}
                      </Box>
                    </MenuItem>
                  ))}
                  {/* Show booked rooms (disabled) */}
                  {availableRooms && availableRooms.booked_rooms?.length > 0 && (
                    <MenuItem disabled>
                      <Typography variant="overline" color="error">⚠ Booked at this time</Typography>
                    </MenuItem>
                  )}
                  {availableRooms && availableRooms.booked_rooms?.map(room => (
                    <MenuItem key={room.id} value="" disabled>
                      {room.name} {room.booked_by && `(Booked by ${room.booked_by})`}
                    </MenuItem>
                  ))}
                  {/* Fallback to all rooms if suggestions not loaded */}
                  {(!suggestions || !availableRooms) && rooms.map(room => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name} ({room.room_type_display})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {suggestions && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {suggestions.available_rooms?.total || 0} rooms available, {availableRooms?.total_booked || 0} booked
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={timetableForm.notes}
                onChange={(e) => setTimetableForm({ ...timetableForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setTimetableDialog(false);
              setSuggestions(null);
              setAvailableTeachers(null);
              setAvailableRooms(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleTimetableSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Holiday Dialog */}
      <Dialog open={holidayDialog} onClose={() => setHolidayDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={holidayForm.academic_year}
                  onChange={(e) => setHolidayForm({ ...holidayForm, academic_year: e.target.value })}
                  label="Academic Year"
                >
                  {academicYears.map(ay => (
                    <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Holiday Name"
                value={holidayForm.name}
                onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Holiday Type</InputLabel>
                <Select
                  value={holidayForm.holiday_type}
                  onChange={(e) => setHolidayForm({ ...holidayForm, holiday_type: e.target.value })}
                  label="Holiday Type"
                >
                  <MenuItem value="national">National Holiday</MenuItem>
                  <MenuItem value="regional">Regional Holiday</MenuItem>
                  <MenuItem value="religious">Religious Holiday</MenuItem>
                  <MenuItem value="school">School Holiday</MenuItem>
                  <MenuItem value="exam">Examination Holiday</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={holidayForm.is_recurring}
                    onChange={(e) => setHolidayForm({ ...holidayForm, is_recurring: e.target.checked })}
                  />
                }
                label="Recurring Holiday (every year)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={holidayForm.description}
                onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHolidayDialog(false)}>Cancel</Button>
          <Button onClick={handleHolidaySubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Substitute Dialog */}
      <Dialog open={substituteDialog} onClose={() => setSubstituteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Substitute Assignment' : 'Add Substitute Assignment'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timetable Entry</InputLabel>
                <Select
                  value={substituteForm.timetable}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, timetable: e.target.value })}
                  label="Timetable Entry"
                >
                  {timetable.map(entry => (
                    <MenuItem key={entry.id} value={entry.id}>
                      {entry.class_name} - {entry.day_display} - {entry.period_name}: {entry.subject_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={substituteForm.date}
                onChange={(e) => setSubstituteForm({ ...substituteForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Original Teacher</InputLabel>
                <Select
                  value={substituteForm.original_teacher}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, original_teacher: e.target.value })}
                  label="Original Teacher"
                >
                  {teachers.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.user?.first_name || ''} {teacher.user?.last_name || ''} ({teacher.user?.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Substitute Teacher</InputLabel>
                <Select
                  value={substituteForm.substitute_teacher}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, substitute_teacher: e.target.value })}
                  label="Substitute Teacher"
                >
                  {teachers.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.user?.first_name || ''} {teacher.user?.last_name || ''} ({teacher.user?.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason (Optional)"
                value={substituteForm.reason}
                onChange={(e) => setSubstituteForm({ ...substituteForm, reason: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={substituteForm.notes}
                onChange={(e) => setSubstituteForm({ ...substituteForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubstituteDialog(false)}>Cancel</Button>
          <Button onClick={handleSubstituteSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimetableManagement;

