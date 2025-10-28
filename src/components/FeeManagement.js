import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  IconButton, Tooltip, Alert, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Tab, Switch, FormControlLabel,
  InputAdornment, Divider
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Download as DownloadIcon, AttachMoney as MoneyIcon, Discount as DiscountIcon,
  Receipt as ReceiptIcon, TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';
import ExportImportManager from './ExportImportManager';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [feeDiscounts, setFeeDiscounts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [openStructureDialog, setOpenStructureDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openDiscountDialog, setOpenDiscountDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [structureForm, setStructureForm] = useState({
    class_obj_id: '',
    fee_type: 'TUITION',
    amount: '',
    description: '',
    is_optional: false,
    due_date: null,
    academic_year: '2024-25'
  });

  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    fee_structure_id: '',
    amount_paid: '',
    payment_date: new Date(),
    payment_method: 'CASH',
    receipt_number: '',
    notes: '',
    discount_amount: 0,
    discount_reason: ''
  });

  const [discountForm, setDiscountForm] = useState({
    name: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    applicable_fee_types: [],
    min_amount: 0,
    max_discount: '',
    valid_from: new Date(),
    valid_until: null,
    is_active: true,
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [structuresRes, paymentsRes, discountsRes, classesRes, studentsRes] = await Promise.all([
        api.get('/education/fees/'),
        api.get('/education/fee-payments/'),
        api.get('/education/fee-discounts/'),
        api.get('/education/classes/'),
        api.get('/education/students/')
      ]);

      console.log('Fee structures response:', structuresRes.data);
      setFeeStructures(structuresRes.data || []);
      setFeePayments(paymentsRes.data || []);
      setFeeDiscounts(discountsRes.data || []);
      setClasses(classesRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch fee data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddStructure = async () => {
    try {
      // Convert form data to JSON format
      const structureData = {
        class_obj_id: structureForm.class_obj_id,
        fee_type: structureForm.fee_type,
        amount: parseFloat(structureForm.amount),
        description: structureForm.description || '',
        is_optional: structureForm.is_optional,
        due_date: structureForm.due_date ? new Date(structureForm.due_date).toISOString().split('T')[0] : null,
        academic_year: structureForm.academic_year
      };

      console.log('Submitting fee structure:', structureData);
      const response = await api.post('/education/fees/', structureData);
      console.log('Fee structure response:', response.data);
      
      setOpenStructureDialog(false);
      resetStructureForm();
      fetchData();
    } catch (err) {
      console.error('Structure error:', err);
      setError('Failed to add fee structure: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleAddPayment = async () => {
    try {
      // Convert form data to JSON format
      const paymentData = {
        student_id: paymentForm.student_id,
        fee_structure_id: paymentForm.fee_structure_id,
        amount_paid: parseFloat(paymentForm.amount_paid),
        payment_date: paymentForm.payment_date ? new Date(paymentForm.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        payment_method: paymentForm.payment_method,
        receipt_number: paymentForm.receipt_number || '',
        notes: paymentForm.notes || '',
        discount_amount: parseFloat(paymentForm.discount_amount) || 0,
        discount_reason: paymentForm.discount_reason || ''
      };

      await api.post('/education/fee-payments/', paymentData);
      setOpenPaymentDialog(false);
      resetPaymentForm();
      fetchData();
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to add payment: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleAddDiscount = async () => {
    try {
      // Convert form data to JSON format
      const discountData = {
        name: discountForm.name,
        discount_type: discountForm.discount_type,
        discount_value: parseFloat(discountForm.discount_value),
        applicable_fee_types: discountForm.applicable_fee_types,
        min_amount: parseFloat(discountForm.min_amount) || 0,
        max_discount: discountForm.max_discount ? parseFloat(discountForm.max_discount) : null,
        valid_from: discountForm.valid_from ? new Date(discountForm.valid_from).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        valid_until: discountForm.valid_until ? new Date(discountForm.valid_until).toISOString().split('T')[0] : null,
        is_active: discountForm.is_active,
        description: discountForm.description || ''
      };

      await api.post('/education/fee-discounts/', discountData);
      setOpenDiscountDialog(false);
      resetDiscountForm();
      fetchData();
    } catch (err) {
      console.error('Discount error:', err);
      setError('Failed to add discount: ' + (err.response?.data?.detail || err.message));
    }
  };

  const resetStructureForm = () => {
    setStructureForm({
      class_obj_id: '',
      fee_type: 'TUITION',
      amount: '',
      description: '',
      is_optional: false,
      due_date: null,
      academic_year: '2024-25'
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      student_id: '',
      fee_structure_id: '',
      amount_paid: '',
      payment_date: new Date(),
      payment_method: 'CASH',
      receipt_number: '',
      notes: '',
      discount_amount: 0,
      discount_reason: ''
    });
  };

  const resetDiscountForm = () => {
    setDiscountForm({
      name: '',
      discount_type: 'PERCENTAGE',
      discount_value: '',
      applicable_fee_types: [],
      min_amount: 0,
      max_discount: '',
      valid_from: new Date(),
      valid_until: null,
      is_active: true,
      description: ''
    });
  };

  const structureColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'class_obj',
      headerName: 'Class',
      width: 150,
      renderCell: (params) => params.row.class_obj?.name || 'N/A'
    },
    {
      field: 'fee_type',
      headerName: 'Fee Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'TUITION' ? 'primary' : 'secondary'}
          size="small"
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => `₹${params.value}`
    },
    {
      field: 'is_optional',
      headerName: 'Optional',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'due_date',
      headerName: 'Due Date',
      width: 120,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'Not Set'
    },
    {
      field: 'academic_year',
      headerName: 'Academic Year',
      width: 120,
      renderCell: (params) => params.value || 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditStructure(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDeleteStructure(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const paymentColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'student',
      headerName: 'Student',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.row.student?.name || 'N/A'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.student?.roll_number || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'fee_structure',
      headerName: 'Fee Type',
      width: 150,
      renderCell: (params) => params.row.fee_structure?.fee_type || 'N/A'
    },
    {
      field: 'amount_paid',
      headerName: 'Amount Paid',
      width: 120,
      renderCell: (params) => `$${params.value}`
    },
    {
      field: 'payment_date',
      headerName: 'Payment Date',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'payment_method',
      headerName: 'Method',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'cash' ? 'success' : 'primary'}
          size="small"
        />
      )
    },
    {
      field: 'receipt_number',
      headerName: 'Receipt',
      width: 120,
      renderCell: (params) => params.value || 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Tooltip title="View Receipt">
          <IconButton size="small" onClick={() => handleViewReceipt(params.row)}>
            <ReceiptIcon />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  const discountColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'discount_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'percentage' ? 'Percentage' : 'Fixed'}
          color={params.value === 'percentage' ? 'primary' : 'secondary'}
          size="small"
        />
      )
    },
    {
      field: 'discount_value',
      headerName: 'Value',
      width: 120,
      renderCell: (params) => {
        const row = params.row;
        return row.discount_type === 'percentage' ? `${row.discount_value}%` : `$${row.discount_value}`;
      }
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      width: 120,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'No End'
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditDiscount(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDeleteDiscount(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const handleEditStructure = (structure) => {
    setEditingItem(structure);
    setStructureForm({
      class_obj_id: structure.class_obj_id || structure.class_obj?.id,
      fee_type: structure.fee_type,
      amount: structure.amount,
      description: structure.description,
      is_optional: structure.is_optional,
      due_date: structure.due_date,
      academic_year: structure.academic_year
    });
    setOpenStructureDialog(true);
  };

  const handleEditDiscount = (discount) => {
    setEditingItem(discount);
    setDiscountForm({
      name: discount.name,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      applicable_fee_types: discount.applicable_fee_types || [],
      min_amount: discount.min_amount,
      max_discount: discount.max_discount,
      valid_from: discount.valid_from,
      valid_until: discount.valid_until,
      is_active: discount.is_active,
      description: discount.description
    });
    setOpenDiscountDialog(true);
  };

  const handleDeleteStructure = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await api.delete(`/education/fees/${id}/`);
        fetchData();
      } catch (err) {
        setError('Failed to delete fee structure');
      }
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await api.delete(`/education/fee-discounts/${id}/`);
        fetchData();
      } catch (err) {
        setError('Failed to delete discount');
      }
    }
  };

  const handleViewReceipt = (payment) => {
    // Implement receipt view functionality
    console.log('View receipt:', payment);
  };

  const handleExportData = async (type, format = 'csv') => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (type) {
        case 'fee-structures':
          endpoint = `/education/fees/export/?format=${format}`;
          break;
        case 'fee-payments':
          endpoint = `/education/fee-payments/export/?format=${format}`;
          break;
        case 'fee-discounts':
          endpoint = `/education/fee-discounts/export/?format=${format}`;
          break;
        default:
          setError('Invalid export type');
          return;
      }
      
      const response = await api.get(endpoint, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Fee Structures</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <ExportImportManager module="education" dataType="fees" />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenStructureDialog(true)}
                >
                  Add Structure
                </Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {structureColumns.map((col) => (
                      <TableCell key={col.field}>{col.headerName}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeStructures.map((row) => (
                    <TableRow key={row.id}>
                      {structureColumns.map((col) => (
                        <TableCell key={col.field}>
                          {col.renderCell ? col.renderCell({ row, value: row[col.field] }) : row[col.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Fee Payments</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <ExportImportManager module="education" dataType="fee-payments" />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenPaymentDialog(true)}
                >
                  Record Payment
                </Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {paymentColumns.map((col) => (
                      <TableCell key={col.field}>{col.headerName}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feePayments.map((row) => (
                    <TableRow key={row.id}>
                      {paymentColumns.map((col) => (
                        <TableCell key={col.field}>
                          {col.renderCell ? col.renderCell({ row, value: row[col.field] }) : row[col.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Fee Discounts</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <ExportImportManager module="education" dataType="fee-discounts" />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDiscountDialog(true)}
                >
                  Add Discount
                </Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {discountColumns.map((col) => (
                      <TableCell key={col.field}>{col.headerName}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeDiscounts.map((row) => (
                    <TableRow key={row.id}>
                      {discountColumns.map((col) => (
                        <TableCell key={col.field}>
                          {col.renderCell ? col.renderCell({ row, value: row[col.field] }) : row[col.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Fee Management
            </Typography>
            
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Fee Structures" icon={<MoneyIcon />} />
              <Tab label="Payments" icon={<ReceiptIcon />} />
              <Tab label="Discounts" icon={<DiscountIcon />} />
            </Tabs>

            {getTabContent()}
          </CardContent>
        </Card>

        {/* Fee Structure Dialog */}
        <Dialog open={openStructureDialog} onClose={() => setOpenStructureDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingItem ? 'Edit Fee Structure' : 'Add Fee Structure'}</DialogTitle>
          <DialogContent>
            <FeeStructureForm
              form={structureForm}
              setForm={setStructureForm}
              classes={classes}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStructureDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStructure} variant="contained">
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <PaymentForm
              form={paymentForm}
              setForm={setPaymentForm}
              students={students}
              feeStructures={feeStructures}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPayment} variant="contained">Record Payment</Button>
          </DialogActions>
        </Dialog>

        {/* Discount Dialog */}
        <Dialog open={openDiscountDialog} onClose={() => setOpenDiscountDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingItem ? 'Edit Discount' : 'Add Discount'}</DialogTitle>
          <DialogContent>
            <DiscountForm
              form={discountForm}
              setForm={setDiscountForm}
              classes={classes}
              feeStructures={feeStructures}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDiscountDialog(false)}>Cancel</Button>
            <Button onClick={handleAddDiscount} variant="contained">
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

const FeeStructureForm = ({ form, setForm, classes }) => {
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid gridColumn="span 6">
        <FormControl fullWidth>
          <InputLabel>Class</InputLabel>
          <Select
            value={form.class_obj_id}
            onChange={(e) => handleChange('class_obj_id', e.target.value)}
            label="Class"
          >
            {classes.map(cls => (
              <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 6">
        <FormControl fullWidth>
          <InputLabel>Fee Type</InputLabel>
          <Select
            value={form.fee_type}
            onChange={(e) => handleChange('fee_type', e.target.value)}
            label="Fee Type"
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
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      <Grid gridColumn="span 6">
        <FormControlLabel
          control={
            <Switch
              checked={form.is_optional}
              onChange={(e) => handleChange('is_optional', e.target.checked)}
            />
          }
          label="Is Optional"
        />
      </Grid>
      <Grid gridColumn="span 6">
        <DatePicker
          label="Due Date"
          value={form.due_date}
          onChange={(date) => handleChange('due_date', date)}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Academic Year"
          value={form.academic_year}
          onChange={(e) => handleChange('academic_year', e.target.value)}
        />
      </Grid>
      <Grid gridColumn="span 12">
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </Grid>
    </Grid>
  );
};

const PaymentForm = ({ form, setForm, students, feeStructures }) => {
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid gridColumn="span 6">
        <FormControl fullWidth>
          <InputLabel>Student</InputLabel>
          <Select
            value={form.student_id}
            onChange={(e) => handleChange('student_id', e.target.value)}
            label="Student"
          >
            {students.map(student => (
              <MenuItem key={student.id} value={student.id}>
                {student.name} - {student.roll_number}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 6">
        <FormControl fullWidth>
          <InputLabel>Fee Structure</InputLabel>
          <Select
            value={form.fee_structure_id}
            onChange={(e) => handleChange('fee_structure_id', e.target.value)}
            label="Fee Structure"
          >
            {feeStructures.map(structure => (
              <MenuItem key={structure.id} value={structure.id}>
                {structure.fee_type} - ${structure.amount}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Amount Paid"
          type="number"
          value={form.amount_paid}
          onChange={(e) => handleChange('amount_paid', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      <Grid gridColumn="span 6">
                  <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={form.payment_method}
              onChange={(e) => handleChange('payment_method', e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CHEQUE">Cheque</MenuItem>
              <MenuItem value="ONLINE">Online Transfer</MenuItem>
              <MenuItem value="CARD">Card Payment</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
            </Select>
          </FormControl>
      </Grid>
      <Grid gridColumn="span 6">
        <DatePicker
          label="Payment Date"
          value={form.payment_date}
          onChange={(date) => handleChange('payment_date', date)}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Receipt Number"
          value={form.receipt_number}
          onChange={(e) => handleChange('receipt_number', e.target.value)}
        />
      </Grid>
      <Grid gridColumn="span 12">
        <TextField
          fullWidth
          label="Notes"
          multiline
          rows={3}
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </Grid>
    </Grid>
  );
};

const DiscountForm = ({ form, setForm, classes, feeStructures }) => {
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Discount Name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </Grid>
      <Grid gridColumn="span 6">
        <FormControl fullWidth>
          <InputLabel>Discount Type</InputLabel>
          <Select
            value={form.discount_type}
            onChange={(e) => handleChange('discount_type', e.target.value)}
            label="Discount Type"
          >
            <MenuItem value="percentage">Percentage</MenuItem>
            <MenuItem value="fixed">Fixed Amount</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Discount Value"
          type="number"
          value={form.discount_value}
          onChange={(e) => handleChange('discount_value', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">
              {form.discount_type === 'percentage' ? '%' : '$'}
            </InputAdornment>,
          }}
        />
      </Grid>
      <Grid gridColumn="span 6">
        <FormControlLabel
          control={
            <Switch
              checked={form.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
            />
          }
          label="Active"
        />
      </Grid>
      <Grid gridColumn="span 6">
        <DatePicker
          label="Start Date"
          value={form.valid_from}
          onChange={(date) => handleChange('valid_from', date)}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
      </Grid>
      <Grid gridColumn="span 6">
        <DatePicker
          label="End Date"
          value={form.valid_until}
          onChange={(date) => handleChange('valid_until', date)}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
      </Grid>
      <Grid gridColumn="span 12">
        <FormControl fullWidth>
          <InputLabel>Applicable Fee Types</InputLabel>
          <Select
            multiple
            value={form.applicable_fee_types}
            onChange={(e) => handleChange('applicable_fee_types', e.target.value)}
            label="Applicable Fee Types"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={feeStructures.find(s => s.id === value)?.fee_type} size="small" />
                ))}
              </Box>
            )}
          >
            {feeStructures.map((structure) => (
              <MenuItem key={structure.id} value={structure.id}>
                {structure.fee_type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 12">
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </Grid>
    </Grid>
  );
};

export default FeeManagement; 