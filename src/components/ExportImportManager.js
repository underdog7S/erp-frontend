import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  IconButton, Tooltip, Alert, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Tab, Switch, FormControlLabel,
  InputAdornment, Divider, LinearProgress
} from '@mui/material';
import {
  Download as DownloadIcon, Upload as UploadIcon, FileUpload as FileUploadIcon,
  Description as DescriptionIcon, PictureAsPdf as PdfIcon, TableChart as CsvIcon,
  CloudDownload as CloudDownloadIcon, CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import api from '../services/api';

console.log('ExportImportManager rendered');

const ExportImportManager = ({ module, dataType, onExport, onImport }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('export'); // 'export' or 'import'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Export states
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFilters, setExportFilters] = useState({});
  
  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importFormat, setImportFormat] = useState('csv');
  const [importPreview, setImportPreview] = useState([]);
  const [backendPreview, setBackendPreview] = useState([]);
  const [backendErrors, setBackendErrors] = useState([]);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('format', exportFormat);
      
      // Add filters
      Object.keys(exportFilters).forEach(key => {
        if (exportFilters[key]) {
          params.append(key, exportFilters[key]);
        }
      });
      
      const endpoint = `/${module}/${dataType}/export/?${params.toString()}`;
      const response = await api.get(endpoint, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${module}_${dataType}_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Export completed successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setBackendPreview([]);
      setBackendErrors([]);
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('format', importFormat);
      
      const response = await api.post(`/${module}/${dataType}/import/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess('Import completed successfully!');
      setBackendPreview(response.data.preview_data || []);
      setBackendErrors(response.data.errors || []);
      setTimeout(() => setSuccess(''), 3000);
      
      if (onImport) onImport(response.data);
      // Do NOT close the dialog immediately!
      // setOpenDialog(false);
      
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    console.log('DIALOG handleFileChange called');
    const file = event.target.files[0];
    console.log('Selected file:', file);
    setImportFile(file);
    setImportPreview([]);

    // Accept CSV by extension as well as MIME type
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      // Preview CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index] || '';
          });
          return row;
        });
        setImportPreview(preview);
        console.log('Preview:', preview);
      };
      reader.readAsText(file);
    } else {
      setImportPreview([]);
    }
  };

  const openExportDialog = () => {
    setDialogType('export');
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const openImportDialog = () => {
    setDialogType('import');
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const getModuleConfig = () => {
    const configs = {
      education: {
        fees: {
          title: 'Fee Structures',
          filters: [
            { key: 'class', label: 'Class', type: 'select' },
            { key: 'fee_type', label: 'Fee Type', type: 'select' },
            { key: 'academic_year', label: 'Academic Year', type: 'text' }
          ]
        },
        'fee-payments': {
          title: 'Fee Payments',
          filters: [
            { key: 'student', label: 'Student', type: 'select' },
            { key: 'payment_method', label: 'Payment Method', type: 'select' },
            { key: 'payment_date_from', label: 'Date From', type: 'date' },
            { key: 'payment_date_to', label: 'Date To', type: 'date' }
          ]
        },
        'fee-discounts': {
          title: 'Fee Discounts',
          filters: [
            { key: 'discount_type', label: 'Discount Type', type: 'select' },
            { key: 'is_active', label: 'Active Status', type: 'select' }
          ]
        }
      },
      pharmacy: {
        medicines: {
          title: 'Medicines',
          filters: [
            { key: 'category', label: 'Category', type: 'select' },
            { key: 'search', label: 'Search', type: 'text' },
            { key: 'manufacturer', label: 'Manufacturer', type: 'text' }
          ]
        },
        sales: {
          title: 'Sales',
          filters: [
            { key: 'customer', label: 'Customer', type: 'select' },
            { key: 'payment_method', label: 'Payment Method', type: 'select' },
            { key: 'date_from', label: 'Date From', type: 'date' },
            { key: 'date_to', label: 'Date To', type: 'date' }
          ]
        },
        'purchase-orders': {
          title: 'Purchase Orders',
          filters: [
            { key: 'supplier', label: 'Supplier', type: 'select' },
            { key: 'status', label: 'Status', type: 'select' },
            { key: 'date_from', label: 'Date From', type: 'date' },
            { key: 'date_to', label: 'Date To', type: 'date' }
          ]
        },
        inventory: {
          title: 'Inventory',
          filters: [
            { key: 'medicine', label: 'Medicine', type: 'select' },
            { key: 'supplier', label: 'Supplier', type: 'select' },
            { key: 'expiry_status', label: 'Expiry Status', type: 'select' }
          ]
        }
      },
      retail: {
        products: {
          title: 'Products',
          filters: [
            { key: 'category', label: 'Category', type: 'select' },
            { key: 'search', label: 'Search', type: 'text' },
            { key: 'supplier', label: 'Supplier', type: 'select' }
          ]
        },
        sales: {
          title: 'Sales',
          filters: [
            { key: 'customer', label: 'Customer', type: 'select' },
            { key: 'payment_method', label: 'Payment Method', type: 'select' },
            { key: 'date_from', label: 'Date From', type: 'date' },
            { key: 'date_to', label: 'Date To', type: 'date' }
          ]
        },
        'purchase-orders': {
          title: 'Purchase Orders',
          filters: [
            { key: 'supplier', label: 'Supplier', type: 'select' },
            { key: 'status', label: 'Status', type: 'select' },
            { key: 'date_from', label: 'Date From', type: 'date' },
            { key: 'date_to', label: 'Date To', type: 'date' }
          ]
        },
        inventory: {
          title: 'Inventory',
          filters: [
            { key: 'warehouse', label: 'Warehouse', type: 'select' },
            { key: 'product', label: 'Product', type: 'select' },
            { key: 'low_stock', label: 'Low Stock Only', type: 'checkbox' }
          ]
        }
      }
    };
    
    return configs[module]?.[dataType] || { title: 'Data', filters: [] };
  };

  const getImportColumns = () => {
    if (module === 'education' && dataType === 'fees') {
      return [
        { key: 'class_obj_id', label: 'Class ID (numeric)' },
        { key: 'fee_type', label: 'Fee Type (TUITION/EXAM/LIBRARY/TRANSPORT/HOSTEL/OTHER)' },
        { key: 'amount', label: 'Amount (number)' },
        { key: 'description', label: 'Description (optional)' },
        { key: 'is_optional', label: 'Is Optional (true/false)' },
        { key: 'due_date', label: 'Due Date (YYYY-MM-DD, optional)' },
        { key: 'academic_year', label: 'Academic Year (e.g., 2024-25)' }
      ];
    }
    if (module === 'education' && dataType === 'fee-payments') {
      return [
        { key: 'student_id', label: 'Student ID (numeric)' },
        { key: 'fee_structure_id', label: 'Fee Structure ID (numeric)' },
        { key: 'amount_paid', label: 'Amount Paid (number)' },
        { key: 'payment_date', label: 'Payment Date (YYYY-MM-DD)' },
        { key: 'payment_method', label: 'Payment Method (CASH/CARD/ONLINE)' },
        { key: 'receipt_number', label: 'Receipt Number (optional)' },
        { key: 'notes', label: 'Notes (optional)' }
      ];
    }
    if (module === 'education' && dataType === 'fee-discounts') {
      return [
        { key: 'name', label: 'Discount Name' },
        { key: 'discount_type', label: 'Discount Type (percentage/fixed)' },
        { key: 'discount_value', label: 'Discount Value (number)' },
        { key: 'applicable_fee_types', label: 'Applicable Fee Structure IDs (comma-separated)' },
        { key: 'min_amount', label: 'Minimum Amount (number, optional)' },
        { key: 'max_discount', label: 'Maximum Discount (number, optional)' },
        { key: 'valid_from', label: 'Valid From (YYYY-MM-DD)' },
        { key: 'valid_until', label: 'Valid Until (YYYY-MM-DD, optional)' },
        { key: 'is_active', label: 'Is Active (true/false)' },
        { key: 'description', label: 'Description (optional)' }
      ];
    }
    return [];
  };

  const downloadTemplate = () => {
    const cols = getImportColumns();
    if (cols.length === 0) return;
    const header = cols.map(c => c.key).join(',');
    const csv = header + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${module}_${dataType}_template.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const config = getModuleConfig();

  return (
    <>
      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          startIcon={<CloudDownloadIcon />}
          onClick={openExportDialog}
          size="small"
        >
          Export
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={openImportDialog}
          size="small"
        >
          Import
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'export' ? `Export ${config.title}` : `Import ${config.title}`}
        </DialogTitle>
        <DialogContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {dialogType === 'export' ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Export Options
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Export Format</InputLabel>
                    <Select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      label="Export Format"
                    >
                      <MenuItem value="csv">
                        <Box display="flex" alignItems="center">
                          <CsvIcon sx={{ mr: 1 }} />
                          CSV
                        </Box>
                      </MenuItem>
                      <MenuItem value="pdf">
                        <Box display="flex" alignItems="center">
                          <PdfIcon sx={{ mr: 1 }} />
                          PDF
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {config.filters.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Filters (Optional)
                  </Typography>
                  <Grid container spacing={2}>
                    {config.filters.map((filter) => (
                      <Grid item xs={6} key={filter.key}>
                        {filter.type === 'select' ? (
                          <FormControl fullWidth>
                            <InputLabel>{filter.label}</InputLabel>
                            <Select
                              value={exportFilters[filter.key] || ''}
                              onChange={(e) => setExportFilters(prev => ({
                                ...prev,
                                [filter.key]: e.target.value
                              }))}
                              label={filter.label}
                            >
                              <MenuItem value="">All</MenuItem>
                              {/* Add options based on filter */}
                            </Select>
                          </FormControl>
                        ) : filter.type === 'checkbox' ? (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={exportFilters[filter.key] || false}
                                onChange={(e) => setExportFilters(prev => ({
                                  ...prev,
                                  [filter.key]: e.target.checked
                                }))}
                              />
                            }
                            label={filter.label}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            label={filter.label}
                            type={filter.type}
                            value={exportFilters[filter.key] || ''}
                            onChange={(e) => setExportFilters(prev => ({
                              ...prev,
                              [filter.key]: e.target.value
                            }))}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Import Options
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Import Format</InputLabel>
                    <Select
                      value={importFormat}
                      onChange={(e) => setImportFormat(e.target.value)}
                      label="Import Format"
                    >
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />
              </Box>

              {/* Column guide and template download */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Required Columns</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Column</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getImportColumns().map(col => (
                        <TableRow key={col.key}>
                          <TableCell>{col.key}</TableCell>
                          <TableCell>{col.label}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {getImportColumns().length > 0 && (
                  <Button sx={{ mt: 1 }} size="small" startIcon={<DownloadIcon />} onClick={downloadTemplate}>
                    Download CSV Template
                  </Button>
                )}
              </Box>

              {importFile && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected File: {importFile.name}
                  </Typography>
                  
                  {importPreview.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Preview (First 5 rows):
                      </Typography>
                      <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {Object.keys(importPreview[0] || {}).map((header) => (
                                <TableCell key={header}>{header}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {importPreview.map((row, index) => (
                              <TableRow key={index}>
                                {Object.values(row).map((value, cellIndex) => (
                                  <TableCell key={cellIndex}>{value}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                  {/* Show backend errors if any */}
                  {backendErrors.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {backendErrors.map((e, i) => <div key={i}>{e}</div>)}
                    </Alert>
                  )}
                  {/* Show backend preview if any */}
                  {backendPreview.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Imported Preview (from backend):
                      </Typography>
                      <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {Object.keys(backendPreview[0] || {}).map((header) => (
                                <TableCell key={header}>{header}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {backendPreview.map((row, index) => (
                              <TableRow key={index}>
                                {Object.values(row).map((value, cellIndex) => (
                                  <TableCell key={cellIndex}>{value}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button
            onClick={dialogType === 'export' ? handleExport : handleImport}
            variant="contained"
            disabled={loading || (dialogType === 'import' && !importFile)}
          >
            {dialogType === 'export' ? 'Export' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportImportManager; 