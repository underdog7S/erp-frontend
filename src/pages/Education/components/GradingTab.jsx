import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Grid, Card, CardContent } from '@mui/material';
import api from '../../../services/api';

const GradingTab = ({ students = [], subjects = [], terms = [], academicYears = [] }) => {
  const [subTab, setSubTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const [assessments, setAssessments] = useState([]);
  const [marksEntries, setMarksEntries] = useState([]);

  useEffect(() => {
    fetchAssessments();
    fetchMarksEntries();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/education/assessments/');
      setAssessments(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load assessments.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMarksEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/education/marks-entries/');
      setMarksEntries(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load marks entries.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (msg, severity = 'success') => setSnackbar({ open: true, message: msg, severity });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Grading & Assessments</Typography>
      <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{ mb: 3 }}>
        <Tab label="Assessments" />
        <Tab label="Marks Entry" />
        <Tab label="Report Cards" />
      </Tabs>

      {loading && <CircularProgress sx={{ mb: 2, display: 'block' }} />}

      {subTab === 0 && <AssessmentsSubTab data={assessments} subjects={subjects} terms={terms} refresh={fetchAssessments} showSnackbar={showSnackbar} />}
      {subTab === 1 && <MarksEntrySubTab data={marksEntries} students={students} assessments={assessments} refresh={fetchMarksEntries} showSnackbar={showSnackbar} />}
      {subTab === 2 && <ReportCardsSubTab students={students} academicYears={academicYears} terms={terms} showSnackbar={showSnackbar} />}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

/* --- Assessments --- */
const AssessmentsSubTab = ({ data, subjects, terms, refresh, showSnackbar }) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ subject_id: "", term_id: "", name: "", date: "", max_marks: 100, passing_marks: 40 });

  const handleOpen = (item = null) => {
    setEditingId(item?.id || null);
    setForm(item ? { 
      subject_id: item.subject?.id || item.subject_id, 
      term_id: item.term?.id || item.term_id, 
      name: item.name, 
      date: item.date, 
      max_marks: item.max_marks, 
      passing_marks: item.passing_marks 
    } : { subject_id: "", term_id: "", name: "", date: "", max_marks: 100, passing_marks: 40 });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) await api.put(`/education/assessments/${editingId}/`, form);
      else await api.post(`/education/assessments/`, form);
      showSnackbar(`Assessment ${editingId ? 'updated' : 'added'}!`);
      setOpen(false);
      refresh();
    } catch { showSnackbar('Failed to save assessment', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api.delete(`/education/assessments/${id}/`);
      showSnackbar('Deleted successfully');
      refresh();
    } catch { showSnackbar('Delete failed', 'error'); }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Assessment</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Term</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Marks (Max/Pass)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.subject?.name || subjects.find(s => s.id === row.subject_id)?.name}</TableCell>
                <TableCell>{row.term?.name || terms.find(t => t.id === row.term_id)?.name}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.max_marks} / {row.passing_marks}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(row)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Edit' : 'Add'} Assessment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Subject</InputLabel>
            <Select value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} label="Subject">
              {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Term</InputLabel>
            <Select value={form.term_id} onChange={e => setForm({...form, term_id: e.target.value})} label="Term">
              {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth margin="dense" label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextField fullWidth margin="dense" label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <TextField fullWidth margin="dense" label="Max Marks" type="number" value={form.max_marks} onChange={e => setForm({...form, max_marks: e.target.value})} />
          <TextField fullWidth margin="dense" label="Passing Marks" type="number" value={form.passing_marks} onChange={e => setForm({...form, passing_marks: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* --- Marks Entry --- */
const MarksEntrySubTab = ({ data, students, assessments, refresh, showSnackbar }) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ student_id: "", assessment_id: "", marks_obtained: "", max_marks: "", remarks: "" });

  const handleOpen = (item = null) => {
    setEditingId(item?.id || null);
    setForm(item ? { 
      student_id: item.student?.id || item.student_id, 
      assessment_id: item.assessment?.id || item.assessment_id, 
      marks_obtained: item.marks_obtained, 
      max_marks: item.max_marks, 
      remarks: item.remarks 
    } : { student_id: "", assessment_id: "", marks_obtained: "", max_marks: "", remarks: "" });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) await api.put(`/education/marks-entries/${editingId}/`, form);
      else await api.post(`/education/marks-entries/`, form);
      showSnackbar(`Marks ${editingId ? 'updated' : 'added'}!`);
      setOpen(false);
      refresh();
    } catch { showSnackbar('Failed to save marks', 'error'); }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Marks Entry</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Assessment</TableCell>
              <TableCell>Marks Obtained</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.student?.name || students.find(s => s.id === row.student_id)?.name}</TableCell>
                <TableCell>{row.assessment?.name || assessments.find(a => a.id === row.assessment_id)?.name}</TableCell>
                <TableCell>{row.marks_obtained} / {row.max_marks || row.assessment?.max_marks}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(row)}>Edit</Button>
                  <Button size="small" color="error" onClick={async () => {
                    if(window.confirm("Delete?")) {
                      try { await api.delete(`/education/marks-entries/${row.id}/`); refresh(); } 
                      catch { showSnackbar('Failed to delete', 'error'); }
                    }
                  }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Edit' : 'Add'} Marks Entry</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Student</InputLabel>
            <Select value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} label="Student">
              {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Assessment</InputLabel>
            <Select value={form.assessment_id} onChange={e => setForm({...form, assessment_id: e.target.value})} label="Assessment">
              {assessments.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth margin="dense" label="Marks Obtained" type="number" value={form.marks_obtained} onChange={e => setForm({...form, marks_obtained: e.target.value})} />
          <TextField fullWidth margin="dense" label="Max Marks (Optional override)" type="number" value={form.max_marks} onChange={e => setForm({...form, max_marks: e.target.value})} />
          <TextField fullWidth margin="dense" label="Remarks" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* --- Report Cards --- */
const ReportCardsSubTab = ({ students, academicYears, terms, showSnackbar }) => {
  const [form, setForm] = useState({ student_id: "", academic_year_id: "", term_id: "", teacher_remarks: "", principal_remarks: "", conduct_grade: "", issued_date: new Date().toISOString().split('T')[0] });
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!form.student_id || !form.academic_year_id) {
      showSnackbar("Student and Academic Year are required", "warning");
      return;
    }
    setGenerating(true);
    try {
      await api.post(`/education/report-cards/generate/`, form);
      showSnackbar("Report Card Generated successfully!");
    } catch {
      showSnackbar("Failed to generate report card", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Generate Report Card</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Student *</InputLabel>
              <Select value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} label="Student *">
                {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Academic Year *</InputLabel>
              <Select value={form.academic_year_id} onChange={e => setForm({...form, academic_year_id: e.target.value})} label="Academic Year *">
                {academicYears.map(ay => <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Term</InputLabel>
              <Select value={form.term_id} onChange={e => setForm({...form, term_id: e.target.value})} label="Term">
                {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Teacher Remarks" value={form.teacher_remarks} onChange={e => setForm({...form, teacher_remarks: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Principal Remarks" value={form.principal_remarks} onChange={e => setForm({...form, principal_remarks: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Conduct Grade" value={form.conduct_grade} onChange={e => setForm({...form, conduct_grade: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Issued Date" type="date" InputLabelProps={{ shrink: true }} value={form.issued_date} onChange={e => setForm({...form, issued_date: e.target.value})} />
          </Grid>
        </Grid>
        <Box mt={3}>
          <Button variant="contained" onClick={handleGenerate} disabled={generating}>
            {generating ? <CircularProgress size={24} /> : 'Generate Report Card'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GradingTab;
