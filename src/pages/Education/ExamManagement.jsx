import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Tabs, Tab, Grid, TextField,
  Select, MenuItem, InputLabel, FormControl, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Checkbox, FormControlLabel, Divider
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon,
  Assignment as AssignmentIcon, Event as EventIcon, Chair as ChairIcon,
  ConfirmationNumber as TicketIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  fetchExams, createExam, updateExam, deleteExam,
  fetchExamSchedules, createExamSchedule, updateExamSchedule, deleteExamSchedule,
  fetchSeatingArrangements, createSeatingArrangement, updateSeatingArrangement, deleteSeatingArrangement,
  fetchHallTickets, createHallTicket, updateHallTicket, generateHallTickets,
  fetchClasses, fetchAcademicYears, fetchTerms, fetchSubjects, fetchRooms, fetchEducationStaff
} from '../../services/api';
import api from '../../services/api';
import { useFeaturePermission } from '../../hooks/useFeaturePermission';
import FeaturePermissionAlert from '../../components/FeaturePermissionAlert';

const ExamManagement = () => {
  const { hasPermission, isLoading: permissionLoading, error: permissionError } = useFeaturePermission('education');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);
  
  // Exams
  const [exams, setExams] = useState([]);
  const [examDialog, setExamDialog] = useState(false);
  const [examForm, setExamForm] = useState({
    name: '', exam_type: 'mid_term', academic_year: '', term: '', description: '',
    start_date: '', end_date: '', is_active: true
  });
  const [editingExamId, setEditingExamId] = useState(null);
  
  // Exam Schedules
  const [examSchedules, setExamSchedules] = useState([]);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    exam: '', class_obj: '', subject: '', date: '', start_time: '', end_time: '',
    room: '', max_marks: 100, instructions: '', invigilator: '', is_active: true
  });
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  
  // Seating Arrangements
  const [seatingArrangements, setSeatingArrangements] = useState([]);
  const [seatingDialog, setSeatingDialog] = useState(false);
  const [seatingForm, setSeatingForm] = useState({
    exam_schedule: '', student: '', seat_number: '', row_number: '', column_number: '',
    room: '', is_active: true
  });
  const [editingSeatingId, setEditingSeatingId] = useState(null);
  
  // Hall Tickets
  const [hallTickets, setHallTickets] = useState([]);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    exam: '', student: '', exam_schedule: '', seating_arrangement: '',
    status: 'generated', photo_verified: false, signature_verified: false, remarks: ''
  });
  const [editingTicketId, setEditingTicketId] = useState(null);
  
  // Master data
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [examsData, schedulesData, seatingData, ticketsData, classesData, yearsData,
            termsData, subjectsData, studentsRes, roomsData, staffData] = await Promise.all([
        fetchExams(),
        fetchExamSchedules(),
        fetchSeatingArrangements(),
        fetchHallTickets(),
        fetchClasses(),
        fetchAcademicYears(),
        fetchTerms(),
        fetchSubjects(),
        api.get('/education/students/'),
        fetchRooms(),
        fetchEducationStaff()
      ]);
      
      const studentsData = studentsRes.data || [];
      
      setExams(examsData);
      setExamSchedules(schedulesData);
      setSeatingArrangements(seatingData);
      setHallTickets(ticketsData);
      setClasses(classesData);
      setAcademicYears(yearsData);
      setTerms(termsData);
      setSubjects(subjectsData);
      setStudents(studentsData);
      setRooms(roomsData);
      setStaff(staffData);
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.';
      }
      showSnackbar('Error loading data: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (hasPermission) {
      loadAllData();
    }
  }, [hasPermission]);
  
  // Exam handlers
  const handleOpenExamDialog = (exam = null) => {
    setEditingExamId(exam ? exam.id : null);
    setExamForm(exam ? {
      name: exam.name, exam_type: exam.exam_type, academic_year: exam.academic_year,
      term: exam.term || '', description: exam.description || '',
      start_date: exam.start_date, end_date: exam.end_date, is_active: exam.is_active
    } : {
      name: '', exam_type: 'mid_term', academic_year: '', term: '', description: '',
      start_date: '', end_date: '', is_active: true
    });
    setExamDialog(true);
  };
  
  const handleExamSubmit = async () => {
    try {
      if (!examForm.name || !examForm.academic_year || !examForm.start_date || !examForm.end_date) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }
      
      // Validate dates
      const startDate = new Date(examForm.start_date);
      const endDate = new Date(examForm.end_date);
      if (endDate < startDate) {
        showSnackbar('End date must be greater than or equal to start date', 'error');
        return;
      }
      
      if (editingExamId) {
        await updateExam(editingExamId, examForm);
        showSnackbar('Exam updated successfully');
      } else {
        await createExam(examForm);
        showSnackbar('Exam created successfully');
      }
      setExamDialog(false);
      await loadAllData();
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
          if (error.response.data.details) {
            if (typeof error.response.data.details === 'object') {
              const detailMessages = Object.entries(error.response.data.details).map(([field, msg]) => `${field}: ${msg}`);
              errorMessage += ' - ' + detailMessages.join(', ');
            } else {
              errorMessage += ' - ' + error.response.data.details;
            }
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          const validationErrors = Object.entries(error.response.data).map(([field, messages]) => {
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
  
  const handleExamDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteExam(id);
        showSnackbar('Exam deleted successfully');
        await loadAllData();
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.status === 404) {
          errorMessage = 'Exam not found. It may have already been deleted.';
        }
        showSnackbar('Error: ' + errorMessage, 'error');
      }
    }
  };
  
  // Exam Schedule handlers
  const handleOpenScheduleDialog = (schedule = null) => {
    setEditingScheduleId(schedule ? schedule.id : null);
    setScheduleForm(schedule ? {
      exam: schedule.exam, class_obj: schedule.class_obj, subject: schedule.subject,
      date: schedule.date, start_time: schedule.start_time, end_time: schedule.end_time,
      room: schedule.room || '', max_marks: schedule.max_marks || 100,
      instructions: schedule.instructions || '', invigilator: schedule.invigilator || '',
      is_active: schedule.is_active
    } : {
      exam: '', class_obj: '', subject: '', date: '', start_time: '', end_time: '',
      room: '', max_marks: 100, instructions: '', invigilator: '', is_active: true
    });
    setScheduleDialog(true);
  };
  
  const handleScheduleSubmit = async () => {
    try {
      if (!scheduleForm.exam || !scheduleForm.class_obj || !scheduleForm.subject ||
          !scheduleForm.date || !scheduleForm.start_time || !scheduleForm.end_time) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }
      
      // Validate times
      const startTime = scheduleForm.start_time;
      const endTime = scheduleForm.end_time;
      if (endTime <= startTime) {
        showSnackbar('End time must be greater than start time', 'error');
        return;
      }
      
      if (editingScheduleId) {
        await updateExamSchedule(editingScheduleId, scheduleForm);
        showSnackbar('Exam schedule updated successfully');
      } else {
        await createExamSchedule(scheduleForm);
        showSnackbar('Exam schedule created successfully');
      }
      setScheduleDialog(false);
      await loadAllData();
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.response?.status === 409) {
        errorMessage = error.response?.data?.error || 'Conflict occurred';
        showSnackbar(`Conflict: ${errorMessage}`, 'error');
      } else if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
          if (error.response.data.details) {
            if (typeof error.response.data.details === 'object') {
              const detailMessages = Object.entries(error.response.data.details).map(([field, msg]) => `${field}: ${msg}`);
              errorMessage += ' - ' + detailMessages.join(', ');
            } else {
              errorMessage += ' - ' + error.response.data.details;
            }
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          const validationErrors = Object.entries(error.response.data).map(([field, messages]) => {
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
  
  const handleScheduleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam schedule?')) {
      try {
        await deleteExamSchedule(id);
        showSnackbar('Exam schedule deleted successfully');
        await loadAllData();
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.status === 404) {
          errorMessage = 'Exam schedule not found. It may have already been deleted.';
        }
        showSnackbar('Error: ' + errorMessage, 'error');
      }
    }
  };
  
  // Seating Arrangement handlers
  const handleOpenSeatingDialog = (seating = null) => {
    setEditingSeatingId(seating ? seating.id : null);
    setSeatingForm(seating ? {
      exam_schedule: seating.exam_schedule, student: seating.student,
      seat_number: seating.seat_number, row_number: seating.row_number || '',
      column_number: seating.column_number || '', room: seating.room || '',
      is_active: seating.is_active
    } : {
      exam_schedule: '', student: '', seat_number: '', row_number: '', column_number: '',
      room: '', is_active: true
    });
    setSeatingDialog(true);
  };
  
  const handleSeatingSubmit = async () => {
    try {
      if (!seatingForm.exam_schedule || !seatingForm.student || !seatingForm.seat_number) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }
      
      const data = {
        ...seatingForm,
        row_number: seatingForm.row_number || null,
        column_number: seatingForm.column_number || null,
        room: seatingForm.room || null
      };
      
      if (editingSeatingId) {
        await updateSeatingArrangement(editingSeatingId, data);
        showSnackbar('Seating arrangement updated successfully');
      } else {
        await createSeatingArrangement(data);
        showSnackbar('Seating arrangement created successfully');
      }
      setSeatingDialog(false);
      await loadAllData();
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
          if (error.response.data.details) {
            if (typeof error.response.data.details === 'object') {
              const detailMessages = Object.entries(error.response.data.details).map(([field, msg]) => `${field}: ${msg}`);
              errorMessage += ' - ' + detailMessages.join(', ');
            } else {
              errorMessage += ' - ' + error.response.data.details;
            }
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          const validationErrors = Object.entries(error.response.data).map(([field, messages]) => {
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
  
  const handleSeatingDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this seating arrangement?')) {
      try {
        await deleteSeatingArrangement(id);
        showSnackbar('Seating arrangement deleted successfully');
        await loadAllData();
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.status === 404) {
          errorMessage = 'Seating arrangement not found. It may have already been deleted.';
        }
        showSnackbar('Error: ' + errorMessage, 'error');
      }
    }
  };
  
  // Hall Ticket handlers
  const handleOpenTicketDialog = (ticket = null) => {
    setEditingTicketId(ticket ? ticket.id : null);
    setTicketForm(ticket ? {
      exam: ticket.exam, student: ticket.student,
      exam_schedule: ticket.exam_schedule || '', seating_arrangement: ticket.seating_arrangement || '',
      status: ticket.status, photo_verified: ticket.photo_verified || false,
      signature_verified: ticket.signature_verified || false, remarks: ticket.remarks || ''
    } : {
      exam: '', student: '', exam_schedule: '', seating_arrangement: '',
      status: 'generated', photo_verified: false, signature_verified: false, remarks: ''
    });
    setTicketDialog(true);
  };
  
  const handleTicketSubmit = async () => {
    try {
      if (!ticketForm.exam || !ticketForm.student) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }
      
      const data = {
        ...ticketForm,
        exam_schedule: ticketForm.exam_schedule || null,
        seating_arrangement: ticketForm.seating_arrangement || null
      };
      
      if (editingTicketId) {
        await updateHallTicket(editingTicketId, data);
        showSnackbar('Hall ticket updated successfully');
      } else {
        await createHallTicket(data);
        showSnackbar('Hall ticket created successfully');
      }
      setTicketDialog(false);
      await loadAllData();
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
          if (error.response.data.details) {
            if (typeof error.response.data.details === 'object') {
              const detailMessages = Object.entries(error.response.data.details).map(([field, msg]) => `${field}: ${msg}`);
              errorMessage += ' - ' + detailMessages.join(', ');
            } else {
              errorMessage += ' - ' + error.response.data.details;
            }
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          const validationErrors = Object.entries(error.response.data).map(([field, messages]) => {
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
  
  const handleGenerateBulkTickets = async () => {
    if (!examForm.exam) {
      showSnackbar('Please select an exam first', 'error');
      return;
    }
    
    if (window.confirm('Generate hall tickets for all students in this exam?')) {
      try {
        setLoading(true);
        const result = await generateHallTickets({ exam_id: parseInt(examForm.exam) });
        showSnackbar(`Generated ${result.generated_count} hall tickets`);
        await loadAllData();
      } catch (error) {
        showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
      } finally {
        setLoading(false);
      }
    }
  };
  
  if (permissionLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (permissionError) {
    return <FeaturePermissionAlert featureName="Exam Management" />;
  }
  
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIcon /> Exam Management
      </Typography>
      
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<AssignmentIcon />} label="Exams" iconPosition="start" />
        <Tab icon={<EventIcon />} label="Exam Schedules" iconPosition="start" />
        <Tab icon={<ChairIcon />} label="Seating Arrangements" iconPosition="start" />
        <Tab icon={<TicketIcon />} label="Hall Tickets" iconPosition="start" />
      </Tabs>
      
      {/* Exams Tab */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Exams</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenExamDialog()}>
                Add Exam
              </Button>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Term</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exams.map(exam => (
                      <TableRow key={exam.id}>
                        <TableCell>{exam.name}</TableCell>
                        <TableCell>{exam.exam_type_display}</TableCell>
                        <TableCell>{exam.academic_year_name}</TableCell>
                        <TableCell>{exam.term_name || '-'}</TableCell>
                        <TableCell>{exam.start_date}</TableCell>
                        <TableCell>{exam.end_date}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenExamDialog(exam)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleExamDelete(exam.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Exam Schedules Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Exam Schedules</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenScheduleDialog()}>
                Add Schedule
              </Button>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Exam</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examSchedules.map(schedule => (
                      <TableRow key={schedule.id}>
                        <TableCell>{schedule.exam_name}</TableCell>
                        <TableCell>{schedule.class_name}</TableCell>
                        <TableCell>{schedule.subject_name}</TableCell>
                        <TableCell>{schedule.date}</TableCell>
                        <TableCell>{schedule.start_time} - {schedule.end_time}</TableCell>
                        <TableCell>{schedule.room_name || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenScheduleDialog(schedule)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleScheduleDelete(schedule.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Seating Arrangements Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Seating Arrangements</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenSeatingDialog()}>
                Add Arrangement
              </Button>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Seat Number</TableCell>
                      <TableCell>Row</TableCell>
                      <TableCell>Column</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seatingArrangements.map(arrangement => (
                      <TableRow key={arrangement.id}>
                        <TableCell>{arrangement.student_name} ({arrangement.student_roll_number || '-'})</TableCell>
                        <TableCell>{arrangement.exam_schedule_info?.subject || '-'}</TableCell>
                        <TableCell>{arrangement.seat_number}</TableCell>
                        <TableCell>{arrangement.row_number || '-'}</TableCell>
                        <TableCell>{arrangement.column_number || '-'}</TableCell>
                        <TableCell>{arrangement.room_name || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenSeatingDialog(arrangement)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleSeatingDelete(arrangement.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Hall Tickets Tab */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Hall Tickets</Typography>
              <Box>
                <FormControl sx={{ minWidth: 200, mr: 1 }}>
                  <InputLabel>Select Exam for Bulk Generation</InputLabel>
                  <Select
                    value={examForm.exam || ''}
                    onChange={(e) => setExamForm({ ...examForm, exam: e.target.value })}
                    label="Select Exam for Bulk Generation"
                  >
                    {exams.map(exam => (
                      <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />} 
                  onClick={handleGenerateBulkTickets} 
                  sx={{ mr: 1 }}
                  disabled={!examForm.exam}
                >
                  Generate Bulk
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenTicketDialog()}>
                  Add Ticket
                </Button>
              </Box>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticket Number</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Exam</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Issued Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hallTickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.ticket_number}</TableCell>
                        <TableCell>{ticket.student_name} ({ticket.student_roll_number || '-'})</TableCell>
                        <TableCell>{ticket.exam_name}</TableCell>
                        <TableCell>
                          <Chip label={ticket.status_display} size="small" color={
                            ticket.status === 'generated' ? 'default' :
                            ticket.status === 'issued' ? 'primary' :
                            ticket.status === 'downloaded' ? 'success' : 'error'
                          } />
                        </TableCell>
                        <TableCell>{ticket.issued_date}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenTicketDialog(ticket)}>
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Exam Dialog */}
      <Dialog open={examDialog} onClose={() => setExamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingExamId ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Exam Name" value={examForm.name}
                onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exam Type</InputLabel>
                <Select value={examForm.exam_type} onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })} label="Exam Type">
                  <MenuItem value="unit_test">Unit Test</MenuItem>
                  <MenuItem value="mid_term">Mid-Term Exam</MenuItem>
                  <MenuItem value="final">Final Exam</MenuItem>
                  <MenuItem value="preliminary">Preliminary Exam</MenuItem>
                  <MenuItem value="mock">Mock Exam</MenuItem>
                  <MenuItem value="internal">Internal Assessment</MenuItem>
                  <MenuItem value="assignment">Assignment</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="practical">Practical Exam</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select value={examForm.academic_year} onChange={(e) => setExamForm({ ...examForm, academic_year: e.target.value })} label="Academic Year" required>
                  {academicYears.map(ay => (
                    <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Term (Optional)</InputLabel>
                <Select value={examForm.term} onChange={(e) => setExamForm({ ...examForm, term: e.target.value })} label="Term (Optional)">
                  <MenuItem value="">None</MenuItem>
                  {terms.filter(t => t.academic_year === parseInt(examForm.academic_year)).map(term => (
                    <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Start Date" type="date" value={examForm.start_date}
                onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="End Date" type="date" value={examForm.end_date}
                onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} value={examForm.description}
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExamDialog(false)}>Cancel</Button>
          <Button onClick={handleExamSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Exam Schedule Dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingScheduleId ? 'Edit Exam Schedule' : 'Add Exam Schedule'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exam</InputLabel>
                <Select value={scheduleForm.exam} onChange={(e) => setScheduleForm({ ...scheduleForm, exam: e.target.value })} label="Exam" required>
                  {exams.map(exam => (
                    <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select value={scheduleForm.class_obj} onChange={(e) => setScheduleForm({ ...scheduleForm, class_obj: e.target.value })} label="Class" required>
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select value={scheduleForm.subject} onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })} label="Subject" required>
                  {subjects.filter(s => s.class_obj === parseInt(scheduleForm.class_obj)).map(subject => (
                    <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Date" type="date" value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Start Time" type="time" value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="End Time" type="time" value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Room (Optional)</InputLabel>
                <Select value={scheduleForm.room} onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })} label="Room (Optional)">
                  <MenuItem value="">None</MenuItem>
                  {rooms.map(room => (
                    <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Max Marks" type="number" value={scheduleForm.max_marks}
                onChange={(e) => setScheduleForm({ ...scheduleForm, max_marks: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Invigilator (Optional)</InputLabel>
                <Select value={scheduleForm.invigilator} onChange={(e) => setScheduleForm({ ...scheduleForm, invigilator: e.target.value })} label="Invigilator (Optional)">
                  <MenuItem value="">None</MenuItem>
                  {staff.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.user?.get_full_name?.() || s.user?.username || s.id}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Instructions" multiline rows={3} value={scheduleForm.instructions}
                onChange={(e) => setScheduleForm({ ...scheduleForm, instructions: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleScheduleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Seating Arrangement Dialog */}
      <Dialog open={seatingDialog} onClose={() => setSeatingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSeatingId ? 'Edit Seating Arrangement' : 'Add Seating Arrangement'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Exam Schedule</InputLabel>
                <Select value={seatingForm.exam_schedule} onChange={(e) => setSeatingForm({ ...seatingForm, exam_schedule: e.target.value })} label="Exam Schedule" required>
                  {examSchedules.map(schedule => (
                    <MenuItem key={schedule.id} value={schedule.id}>
                      {schedule.exam_name} - {schedule.subject_name} ({schedule.class_name}) - {schedule.date}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select value={seatingForm.student} onChange={(e) => setSeatingForm({ ...seatingForm, student: e.target.value })} label="Student" required>
                  {students.map(student => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} ({student.upper_id || student.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Seat Number" value={seatingForm.seat_number}
                onChange={(e) => setSeatingForm({ ...seatingForm, seat_number: e.target.value })} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Row Number" type="number" value={seatingForm.row_number}
                onChange={(e) => setSeatingForm({ ...seatingForm, row_number: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Column Number" type="number" value={seatingForm.column_number}
                onChange={(e) => setSeatingForm({ ...seatingForm, column_number: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Room (Optional)</InputLabel>
                <Select value={seatingForm.room} onChange={(e) => setSeatingForm({ ...seatingForm, room: e.target.value })} label="Room (Optional)">
                  <MenuItem value="">None</MenuItem>
                  {rooms.map(room => (
                    <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeatingDialog(false)}>Cancel</Button>
          <Button onClick={handleSeatingSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Hall Ticket Dialog */}
      <Dialog open={ticketDialog} onClose={() => setTicketDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTicketId ? 'Edit Hall Ticket' : 'Add Hall Ticket'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exam</InputLabel>
                <Select value={ticketForm.exam} onChange={(e) => setTicketForm({ ...ticketForm, exam: e.target.value })} label="Exam" required>
                  {exams.map(exam => (
                    <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select value={ticketForm.student} onChange={(e) => setTicketForm({ ...ticketForm, student: e.target.value })} label="Student" required>
                  {students.map(student => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} ({student.upper_id || student.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={ticketForm.status} onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value })} label="Status">
                  <MenuItem value="generated">Generated</MenuItem>
                  <MenuItem value="issued">Issued</MenuItem>
                  <MenuItem value="downloaded">Downloaded</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Checkbox checked={ticketForm.photo_verified} onChange={(e) => setTicketForm({ ...ticketForm, photo_verified: e.target.checked })} />}
                label="Photo Verified"
              />
              <FormControlLabel
                control={<Checkbox checked={ticketForm.signature_verified} onChange={(e) => setTicketForm({ ...ticketForm, signature_verified: e.target.checked })} />}
                label="Signature Verified"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Remarks" multiline rows={2} value={ticketForm.remarks}
                onChange={(e) => setTicketForm({ ...ticketForm, remarks: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialog(false)}>Cancel</Button>
          <Button onClick={handleTicketSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
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

export default ExamManagement;

