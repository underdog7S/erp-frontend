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
  DragIndicator as DragIcon, BarChart as BarChartIcon, Assessment as AssessmentIcon,
  CompareArrows as CompareIcon, Build as BuildIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  fetchReportFields, createReportField, updateReportField, deleteReportField,
  fetchReportTemplates, createReportTemplate, updateReportTemplate, deleteReportTemplate,
  buildCustomReport, getComparativeAnalysis,
  fetchClasses, fetchAcademicYears, fetchTerms
} from '../../services/api';

const AdvancedReporting = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Report Fields
  const [reportFields, setReportFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldDialog, setFieldDialog] = useState(false);
  const [fieldForm, setFieldForm] = useState({
    name: '', field_key: '', field_type: 'number', data_source: 'ReportCard',
    data_field: '', aggregate_type: '', display_name: '', format_string: ''
  });
  const [editingFieldId, setEditingFieldId] = useState(null);
  
  // Report Templates
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '', description: '', report_type: 'custom', template_config: {},
    available_filters: [], default_parameters: {}, is_public: false
  });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  
  // Custom Report Builder
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [reportFilters, setReportFilters] = useState({
    academic_year_id: '', term_id: '', class_id: '', student_id: ''
  });
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Comparative Analysis
  const [comparisonType, setComparisonType] = useState('classes');
  const [comparisonMetric, setComparisonMetric] = useState('percentage');
  const [comparisonFilters, setComparisonFilters] = useState({
    academic_year_id: '', term_id: '', class_id: ''
  });
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  
  // Dropdown data
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  
  useEffect(() => {
    loadAllData();
  }, []);
  
  const loadAllData = async () => {
    try {
      setFieldsLoading(true);
      const [fieldsData, templatesData, classesData, yearsData] = await Promise.all([
        fetchReportFields(),
        fetchReportTemplates(),
        fetchClasses(),
        fetchAcademicYears()
      ]);
      setReportFields(fieldsData);
      setAvailableFields(fieldsData);
      setTemplates(templatesData);
      setClasses(classesData);
      setAcademicYears(yearsData);
      
      // Load terms if academic year is selected
      if (comparisonFilters.academic_year_id) {
        const termsData = await fetchTerms({ academic_year: comparisonFilters.academic_year_id });
        setTerms(termsData);
      }
    } catch (error) {
      showSnackbar('Error loading data: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setFieldsLoading(false);
    }
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  // Report Fields Management
  const handleFieldSubmit = async () => {
    try {
      if (!fieldForm.name || !fieldForm.field_key || !fieldForm.data_field) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }
      
      if (editingFieldId) {
        await updateReportField(editingFieldId, fieldForm);
        showSnackbar('Report field updated successfully');
      } else {
        await createReportField(fieldForm);
        showSnackbar('Report field created successfully');
      }
      setFieldDialog(false);
      setFieldForm({ name: '', field_key: '', field_type: 'number', data_source: 'ReportCard', data_field: '', aggregate_type: '', display_name: '', format_string: '' });
      setEditingFieldId(null);
      await loadAllData();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
    }
  };
  
  const handleFieldDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await deleteReportField(id);
        showSnackbar('Report field deleted successfully');
        await loadAllData();
      } catch (error) {
        showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
      }
    }
  };
  
  // Report Templates Management
  const handleTemplateSubmit = async () => {
    try {
      if (!templateForm.name) {
        showSnackbar('Please enter template name', 'error');
        return;
      }
      
      if (editingTemplateId) {
        await updateReportTemplate(editingTemplateId, templateForm);
        showSnackbar('Report template updated successfully');
      } else {
        await createReportTemplate(templateForm);
        showSnackbar('Report template created successfully');
      }
      setTemplateDialog(false);
      setTemplateForm({ name: '', description: '', report_type: 'custom', template_config: {}, available_filters: [], default_parameters: {}, is_public: false });
      setEditingTemplateId(null);
      await loadAllData();
    } catch (error) {
      showSnackbar('Error: ' + (error.response?.data?.error || error.message), 'error');
    }
  };
  
  // Custom Report Builder
  const handleBuildReport = async () => {
    if (selectedFields.length === 0) {
      showSnackbar('Please select at least one field', 'error');
      return;
    }
    
    try {
      setReportLoading(true);
      const reportRequest = {
        fields: selectedFields.map(f => f.field_key),
        filters: Object.fromEntries(
          Object.entries(reportFilters).filter(([_, v]) => v !== '' && v !== null)
        ),
        limit: 1000
      };
      
      const result = await buildCustomReport(reportRequest);
      setReportData(result.data || []);
      showSnackbar(`Report generated with ${result.total || 0} records`);
    } catch (error) {
      showSnackbar('Error generating report: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setReportLoading(false);
    }
  };
  
  const handleAddField = (field) => {
    if (!selectedFields.find(f => f.field_key === field.field_key)) {
      setSelectedFields([...selectedFields, field]);
    }
  };
  
  const handleRemoveField = (fieldKey) => {
    setSelectedFields(selectedFields.filter(f => f.field_key !== fieldKey));
  };
  
  // Comparative Analysis
  const handleRunComparison = async () => {
    try {
      setComparisonLoading(true);
      const comparisonRequest = {
        comparison_type: comparisonType,
        metric: comparisonMetric,
        filters: Object.fromEntries(
          Object.entries(comparisonFilters).filter(([_, v]) => v !== '' && v !== null)
        )
      };
      
      // Add group IDs based on comparison type
      if (comparisonType === 'classes' && comparisonFilters.class_id) {
        comparisonRequest.class_ids = [parseInt(comparisonFilters.class_id)];
      } else if (comparisonType === 'terms' && comparisonFilters.term_id) {
        comparisonRequest.term_ids = [parseInt(comparisonFilters.term_id)];
      } else if (comparisonType === 'academic_years' && comparisonFilters.academic_year_id) {
        comparisonRequest.academic_year_ids = [parseInt(comparisonFilters.academic_year_id)];
      }
      
      const result = await getComparativeAnalysis(comparisonRequest);
      setComparisonData(result);
      showSnackbar('Comparative analysis generated successfully');
    } catch (error) {
      showSnackbar('Error generating comparison: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setComparisonLoading(false);
    }
  };
  
  // Load terms when academic year changes
  useEffect(() => {
    const loadTerms = async () => {
      if (comparisonFilters.academic_year_id) {
        try {
          const termsData = await fetchTerms({ academic_year: comparisonFilters.academic_year_id });
          setTerms(termsData);
        } catch (error) {
          console.error('Error loading terms:', error);
        }
      } else {
        setTerms([]);
      }
    };
    loadTerms();
  }, [comparisonFilters.academic_year_id]);
  
  // Prepare chart data for comparative analysis
  const prepareChartData = () => {
    if (!comparisonData || !comparisonData.data) return [];
    
    const metricKey = comparisonMetric === 'percentage' ? 'avg_percentage' :
                     comparisonMetric === 'total_marks' ? 'avg_total_marks' :
                     comparisonMetric === 'attendance' ? 'avg_attendance' : null;
    
    if (!metricKey) return [];
    
    return comparisonData.data.map(item => ({
      name: item[comparisonType === 'classes' ? 'class_obj__name' :
                  comparisonType === 'terms' ? 'term__name' :
                  'academic_year__name'] || 'Unknown',
      value: item[metricKey] || 0,
      max: item[`max_${comparisonMetric.replace('total_marks', 'total_marks')}`] || item.max_percentage || item.max_total_marks || item.max_attendance || 0,
      min: item[`min_${comparisonMetric.replace('total_marks', 'total_marks')}`] || item.min_percentage || item.min_total_marks || item.min_attendance || 0,
      count: item.student_count || 0
    }));
  };
  
  const chartData = prepareChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon /> Advanced Reporting
      </Typography>
      
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<BuildIcon />} label="Report Builder" iconPosition="start" />
        <Tab icon={<CompareIcon />} label="Comparative Analysis" iconPosition="start" />
        <Tab icon={<BarChartIcon />} label="Report Fields" iconPosition="start" />
        <Tab icon={<AssessmentIcon />} label="Templates" iconPosition="start" />
      </Tabs>
      
      {/* Custom Report Builder Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Available Fields</Typography>
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {availableFields.map(field => (
                    <Chip
                      key={field.id}
                      label={field.display_name || field.name}
                      onClick={() => handleAddField(field)}
                      sx={{ m: 0.5, cursor: 'pointer' }}
                      icon={<DragIcon />}
                    />
                  ))}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Selected Fields</Typography>
                <Box sx={{ minHeight: 100 }}>
                  {selectedFields.map(field => (
                    <Chip
                      key={field.field_key}
                      label={field.display_name || field.name}
                      onDelete={() => handleRemoveField(field.field_key)}
                      sx={{ m: 0.5 }}
                      color="primary"
                    />
                  ))}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Filters</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={reportFilters.academic_year_id}
                    onChange={(e) => setReportFilters({ ...reportFilters, academic_year_id: e.target.value })}
                    label="Academic Year"
                  >
                    <MenuItem value="">All</MenuItem>
                    {academicYears.map(ay => (
                      <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={reportFilters.class_id}
                    onChange={(e) => setReportFilters({ ...reportFilters, class_id: e.target.value })}
                    label="Class"
                  >
                    <MenuItem value="">All</MenuItem>
                    {classes.map(cls => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleBuildReport}
                  disabled={reportLoading || selectedFields.length === 0}
                  startIcon={reportLoading ? <CircularProgress size={20} /> : <BuildIcon />}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Report Results</Typography>
                {reportLoading ? (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Generating report...</Typography>
                  </Box>
                ) : reportData.length > 0 ? (
                  <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {selectedFields.map(field => (
                            <TableCell key={field.field_key}>
                              <strong>{field.display_name || field.name}</strong>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.map((row, idx) => (
                          <TableRow key={idx}>
                            {selectedFields.map(field => (
                              <TableCell key={field.field_key}>
                                {row[field.field_key] !== null && row[field.field_key] !== undefined
                                  ? row[field.field_key]
                                  : '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                    <Typography>No data. Select fields and generate report.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Comparative Analysis Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Comparison Settings</Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Comparison Type</InputLabel>
                  <Select
                    value={comparisonType}
                    onChange={(e) => setComparisonType(e.target.value)}
                    label="Comparison Type"
                  >
                    <MenuItem value="classes">Classes</MenuItem>
                    <MenuItem value="terms">Terms</MenuItem>
                    <MenuItem value="academic_years">Academic Years</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Metric</InputLabel>
                  <Select
                    value={comparisonMetric}
                    onChange={(e) => setComparisonMetric(e.target.value)}
                    label="Metric"
                  >
                    <MenuItem value="percentage">Average Percentage</MenuItem>
                    <MenuItem value="total_marks">Total Marks</MenuItem>
                    <MenuItem value="attendance">Attendance %</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={comparisonFilters.academic_year_id}
                    onChange={(e) => setComparisonFilters({ ...comparisonFilters, academic_year_id: e.target.value })}
                    label="Academic Year"
                  >
                    <MenuItem value="">All</MenuItem>
                    {academicYears.map(ay => (
                      <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {comparisonType === 'terms' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Term</InputLabel>
                    <Select
                      value={comparisonFilters.term_id}
                      onChange={(e) => setComparisonFilters({ ...comparisonFilters, term_id: e.target.value })}
                      label="Term"
                    >
                      <MenuItem value="">All</MenuItem>
                      {terms.map(term => (
                        <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                {comparisonType === 'classes' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Class</InputLabel>
                    <Select
                      value={comparisonFilters.class_id}
                      onChange={(e) => setComparisonFilters({ ...comparisonFilters, class_id: e.target.value })}
                      label="Class"
                    >
                      <MenuItem value="">All</MenuItem>
                      {classes.map(cls => (
                        <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleRunComparison}
                  disabled={comparisonLoading}
                  startIcon={comparisonLoading ? <CircularProgress size={20} /> : <CompareIcon />}
                >
                  Run Comparison
                </Button>
              </CardContent>
            </Card>
            
            {comparisonData && comparisonData.summary && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Summary</Typography>
                  <Typography><strong>Average:</strong> {comparisonData.summary.average?.toFixed(2)}</Typography>
                  <Typography><strong>Maximum:</strong> {comparisonData.summary.maximum?.toFixed(2)}</Typography>
                  <Typography><strong>Minimum:</strong> {comparisonData.summary.minimum?.toFixed(2)}</Typography>
                  <Typography><strong>Total Groups:</strong> {comparisonData.summary.total_groups}</Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Comparison Results</Typography>
                {comparisonLoading ? (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Generating comparison...</Typography>
                  </Box>
                ) : chartData.length > 0 ? (
                  <Box>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Average" />
                        <Bar dataKey="max" fill="#82ca9d" name="Maximum" />
                        <Bar dataKey="min" fill="#ffc658" name="Minimum" />
                      </BarChart>
                    </ResponsiveContainer>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell align="right"><strong>Average</strong></TableCell>
                            <TableCell align="right"><strong>Maximum</strong></TableCell>
                            <TableCell align="right"><strong>Minimum</strong></TableCell>
                            <TableCell align="right"><strong>Students</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {chartData.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell align="right">{row.value.toFixed(2)}</TableCell>
                              <TableCell align="right">{row.max.toFixed(2)}</TableCell>
                              <TableCell align="right">{row.min.toFixed(2)}</TableCell>
                              <TableCell align="right">{row.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                    <Typography>No comparison data. Configure settings and run comparison.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Report Fields Management Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Report Fields</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setFieldForm({ name: '', field_key: '', field_type: 'number', data_source: 'ReportCard', data_field: '', aggregate_type: '', display_name: '', format_string: '' });
                  setEditingFieldId(null);
                  setFieldDialog(true);
                }}
              >
                Add Field
              </Button>
            </Box>
            
            {fieldsLoading ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Field Key</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Data Source</strong></TableCell>
                      <TableCell><strong>Data Field</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportFields.map(field => (
                      <TableRow key={field.id}>
                        <TableCell>{field.display_name || field.name}</TableCell>
                        <TableCell>{field.field_key}</TableCell>
                        <TableCell>{field.field_type_display || field.field_type}</TableCell>
                        <TableCell>{field.data_source}</TableCell>
                        <TableCell>{field.data_field}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => {
                            setFieldForm(field);
                            setEditingFieldId(field.id);
                            setFieldDialog(true);
                          }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleFieldDelete(field.id)}>
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
      
      {/* Templates Management Tab */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Report Templates</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setTemplateForm({ name: '', description: '', report_type: 'custom', template_config: {}, available_filters: [], default_parameters: {}, is_public: false });
                  setEditingTemplateId(null);
                  setTemplateDialog(true);
                }}
              >
                Add Template
              </Button>
            </Box>
            
            {templatesLoading ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {templates.map(template => (
                  <Grid item xs={12} md={6} key={template.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{template.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.report_type_display}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {template.description}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => {
                            setTemplateForm(template);
                            setEditingTemplateId(template.id);
                            setTemplateDialog(true);
                          }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => {
                            if (window.confirm('Delete this template?')) {
                              deleteReportTemplate(template.id).then(() => {
                                showSnackbar('Template deleted');
                                loadAllData();
                              }).catch(err => showSnackbar('Error: ' + err.message, 'error'));
                            }
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Field Dialog */}
      <Dialog open={fieldDialog} onClose={() => setFieldDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFieldId ? 'Edit Field' : 'Add Field'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field Name"
                value={fieldForm.name}
                onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field Key"
                value={fieldForm.field_key}
                onChange={(e) => setFieldForm({ ...fieldForm, field_key: e.target.value })}
                required
                helperText="Unique identifier (e.g., total_marks, attendance_percentage)"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={fieldForm.field_type}
                  onChange={(e) => setFieldForm({ ...fieldForm, field_type: e.target.value })}
                  label="Field Type"
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                  <MenuItem value="aggregate">Aggregate</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Data Source</InputLabel>
                <Select
                  value={fieldForm.data_source}
                  onChange={(e) => setFieldForm({ ...fieldForm, data_source: e.target.value })}
                  label="Data Source"
                >
                  <MenuItem value="ReportCard">Report Card</MenuItem>
                  <MenuItem value="MarksEntry">Marks Entry</MenuItem>
                  <MenuItem value="Attendance">Attendance</MenuItem>
                  <MenuItem value="Student">Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data Field"
                value={fieldForm.data_field}
                onChange={(e) => setFieldForm({ ...fieldForm, data_field: e.target.value })}
                required
                helperText="Model field name (e.g., total_marks, percentage)"
              />
            </Grid>
            {fieldForm.field_type === 'aggregate' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Aggregate Type</InputLabel>
                  <Select
                    value={fieldForm.aggregate_type}
                    onChange={(e) => setFieldForm({ ...fieldForm, aggregate_type: e.target.value })}
                    label="Aggregate Type"
                  >
                    <MenuItem value="sum">Sum</MenuItem>
                    <MenuItem value="avg">Average</MenuItem>
                    <MenuItem value="max">Maximum</MenuItem>
                    <MenuItem value="min">Minimum</MenuItem>
                    <MenuItem value="count">Count</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                value={fieldForm.display_name}
                onChange={(e) => setFieldForm({ ...fieldForm, display_name: e.target.value })}
                helperText="Optional: Custom display name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Format String"
                value={fieldForm.format_string}
                onChange={(e) => setFieldForm({ ...fieldForm, format_string: e.target.value })}
                helperText="Optional: Format (e.g., %.2f for 2 decimals)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldDialog(false)}>Cancel</Button>
          <Button onClick={handleFieldSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Template Dialog */}
      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplateId ? 'Edit Template' : 'Add Template'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={templateForm.report_type}
                  onChange={(e) => setTemplateForm({ ...templateForm, report_type: e.target.value })}
                  label="Report Type"
                >
                  <MenuItem value="student_performance">Student Performance</MenuItem>
                  <MenuItem value="class_performance">Class Performance</MenuItem>
                  <MenuItem value="attendance">Attendance</MenuItem>
                  <MenuItem value="fee_collection">Fee Collection</MenuItem>
                  <MenuItem value="comparative">Comparative Analysis</MenuItem>
                  <MenuItem value="custom">Custom Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={templateForm.is_public}
                    onChange={(e) => setTemplateForm({ ...templateForm, is_public: e.target.checked })}
                  />
                }
                label="Public Template"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Template configuration (JSON) will be managed through the drag-and-drop builder in future updates.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialog(false)}>Cancel</Button>
          <Button onClick={handleTemplateSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvancedReporting;
