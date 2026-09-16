import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Checkbox, Card, CardContent } from '@mui/material';
import api from '../../../services/api';

const AttendanceTab = ({ classes = [] }) => {
  const [studentClass, setStudentClass] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));
  
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [attendanceList, setAttendanceList] = useState([]); // Array of selected student IDs
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAttendanceStatus = async () => {
    if (!studentClass || !attendanceDate) {
      setAttendanceStatus([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/education/attendance/class-status/?class_id=${studentClass}&date=${attendanceDate}`);
      setAttendanceStatus(res.data);
      // Pre-select students who are already marked present
      const presentIds = res.data.filter(item => item.present).map(item => item.student.id);
      setAttendanceList(presentIds);
    } catch (e) {
      // Fallback: load students for the selected class so user can still take attendance
      try {
        const res = await api.get(`/education/students/?assigned_class_id=${studentClass}`);
        const studentsList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setAttendanceStatus(studentsList.map(s => ({ student: s, present: false })));
        setAttendanceList([]);
      } catch {
        setError("Failed to load students for attendance.");
        setAttendanceStatus([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, [studentClass, attendanceDate]);

  const handleAttendanceCheckbox = (studentId) => {
    setAttendanceList(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmitAttendance = async () => {
    if (!studentClass || !attendanceDate) {
      setSnackbar({ open: true, message: 'Select class and date.', severity: 'warning' });
      return;
    }
    try {
      // The original code made individual requests. We will do the same for compatibility.
      // But it's better to update both present and absent if possible.
      // We will loop through attendanceStatus and mark present based on attendanceList
      await Promise.all(attendanceStatus.map(item => 
        api.post('/education/attendance/', {
          student: item.student.id,
          date: attendanceDate,
          present: attendanceList.includes(item.student.id),
        })
      ));
      
      setSnackbar({ open: true, message: 'Attendance submitted!', severity: 'success' });
      fetchAttendanceStatus(); // Refresh
    } catch {
      setSnackbar({ open: true, message: 'Failed to submit attendance.', severity: 'error' });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setAttendanceList(attendanceStatus.map(item => item.student.id));
    } else {
      setAttendanceList([]);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Daily Attendance</Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Class</InputLabel>
            <Select 
              value={studentClass} 
              onChange={e => setStudentClass(e.target.value)} 
              label="Select Class"
            >
              {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField 
            label="Date" 
            type="date" 
            InputLabelProps={{ shrink: true }} 
            value={attendanceDate} 
            onChange={e => setAttendanceDate(e.target.value)} 
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchAttendanceStatus}
            disabled={!studentClass || loading}
          >
            Refresh
          </Button>
        </CardContent>
      </Card>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : attendanceStatus.length === 0 ? (
        <Alert severity="info">{studentClass ? 'No students found for this class.' : 'Select a class to view students.'}</Alert>
      ) : (
        <Box>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox 
                      onChange={handleSelectAll}
                      checked={attendanceStatus.length > 0 && attendanceList.length === attendanceStatus.length}
                      indeterminate={attendanceList.length > 0 && attendanceList.length < attendanceStatus.length}
                    />
                  </TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Roll Number / Upper ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceStatus.map((row) => (
                  <TableRow key={row.student.id}>
                    <TableCell padding="checkbox">
                      <Checkbox 
                        checked={attendanceList.includes(row.student.id)}
                        onChange={() => handleAttendanceCheckbox(row.student.id)}
                      />
                    </TableCell>
                    <TableCell>{row.student.name}</TableCell>
                    <TableCell>{row.student.upper_id || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="contained" color="success" onClick={handleSubmitAttendance}>
            Submit Attendance
          </Button>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceTab;
