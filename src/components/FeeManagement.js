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
  Receipt as ReceiptIcon, TrendingUp as TrendingUpIcon, History as HistoryIcon,
  Assessment as AssessmentIcon, CheckCircle as CheckCircleIcon
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
  
  // Installment Management State
  const [installmentPlans, setInstallmentPlans] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [installmentPlansLoading, setInstallmentPlansLoading] = useState(false);
  const [installmentsLoading, setInstallmentsLoading] = useState(false);
  const [installmentPlansError, setInstallmentPlansError] = useState(null);
  const [installmentsError, setInstallmentsError] = useState(null);
  
  // Old Balance Management State
  const [oldBalances, setOldBalances] = useState([]);
  const [balanceAdjustments, setBalanceAdjustments] = useState([]);
  const [oldBalanceSummary, setOldBalanceSummary] = useState(null);
  const [oldBalanceLoading, setOldBalanceLoading] = useState(false);
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [settledFilter, setSettledFilter] = useState('unsettled');
  
  // Dialog states for installments
  const [openInstallmentPlanDialog, setOpenInstallmentPlanDialog] = useState(false);
  const [openInstallmentDialog, setOpenInstallmentDialog] = useState(false);
  const [editingInstallmentPlan, setEditingInstallmentPlan] = useState(null);
  
  // Dialog states for old balances
  const [openOldBalanceDialog, setOpenOldBalanceDialog] = useState(false);
  const [openAdjustmentDialog, setOpenAdjustmentDialog] = useState(false);
  const [openCarryForwardDialog, setOpenCarryForwardDialog] = useState(false);
  const [editingOldBalance, setEditingOldBalance] = useState(null);
  
  const [installmentPlanForm, setInstallmentPlanForm] = useState({
    fee_structure_id: '',
    name: '',
    number_of_installments: '',
    installment_type: 'EQUAL',
    description: '',
    is_active: true
  });
  
  const [installmentForm, setInstallmentForm] = useState({
    student_id: '',
    fee_structure_id: '',
    installment_plan_id: '',
    start_date: ''
  });

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
    discount_type: 'percentage',
    discount_value: '',
    applicable_fee_types: [],
    min_amount: 0,
    max_discount: '',
    valid_from: new Date(),
    valid_until: null,
    is_active: true,
    description: ''
  });

  const [oldBalanceForm, setOldBalanceForm] = useState({
    student: '',
    academic_year: '',
    class_name: '',
    balance_amount: '',
    carried_forward_to: '',
    notes: ''
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    student: '',
    adjustment_type: 'WAIVER',
    amount: '',
    reason: '',
    academic_year: '',
    fee_structure: ''
  });

  const [carryForwardForm, setCarryForwardForm] = useState({
    from_academic_year: '',
    to_academic_year: '',
    class_name: ''
  });

  useEffect(() => {
    fetchData();
    fetchInstallmentPlans();
    fetchInstallments();
    fetchOldBalances();
    fetchBalanceAdjustments();
    fetchOldBalanceSummary();
  }, [academicYearFilter, classFilter, settledFilter]);

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
      const toArray = (data) => Array.isArray(data) ? data : (data?.results ? data.results : []);
      setFeeStructures(toArray(structuresRes.data));
      setFeePayments(toArray(paymentsRes.data));
      setFeeDiscounts(toArray(discountsRes.data));
      setClasses(toArray(classesRes.data));
      setStudents(toArray(studentsRes.data));
    } catch (err) {
      // Handle 403 (permission denied) gracefully - expected for some roles
      if (err?.response?.status === 403) {
        setError('You do not have permission to view fee management data.');
        // Set empty arrays so component still renders
        setFeeStructures([]);
        setFeePayments([]);
        setFeeDiscounts([]);
      } else {
        console.error('Fetch error:', err);
        setError('Failed to fetch fee data: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInstallmentPlans = async () => {
    setInstallmentPlansLoading(true);
    setInstallmentPlansError(null);
    try {
      const res = await api.get('/education/installment-plans/');
      setInstallmentPlans(res.data || []);
    } catch (err) {
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
      setInstallments(res.data || []);
    } catch (err) {
      setInstallmentsError('Failed to load installments');
    } finally {
      setInstallmentsLoading(false);
    }
  };

  const fetchOldBalances = async () => {
    setOldBalanceLoading(true);
    try {
      const params = new URLSearchParams();
      if (academicYearFilter !== 'all') params.append('academic_year', academicYearFilter);
      if (classFilter) params.append('class_name', classFilter);
      if (settledFilter !== 'all') params.append('is_settled', settledFilter === 'settled');
      
      const res = await api.get(`/education/old-balances/?${params.toString()}`);
      setOldBalances(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch old balances:', err);
      setOldBalances([]);
    } finally {
      setOldBalanceLoading(false);
    }
  };

  const fetchBalanceAdjustments = async () => {
    try {
      const res = await api.get('/education/balance-adjustments/');
      setBalanceAdjustments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch balance adjustments:', err);
      setBalanceAdjustments([]);
    }
  };

  const fetchOldBalanceSummary = async () => {
    try {
      const res = await api.get('/education/old-balances/summary/');
      setOldBalanceSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch old balance summary:', err);
      setOldBalanceSummary(null);
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

  // Installment handlers
  const handleOpenInstallmentPlanDialog = (plan = null) => {
    if (plan) {
      setEditingInstallmentPlan(plan);
      setInstallmentPlanForm({
        fee_structure_id: plan.fee_structure_id || plan.fee_structure?.id,
        name: plan.name,
        number_of_installments: plan.number_of_installments,
        installment_type: plan.installment_type,
        description: plan.description,
        is_active: plan.is_active
      });
    } else {
      setEditingInstallmentPlan(null);
      setInstallmentPlanForm({
        fee_structure_id: '',
        name: '',
        number_of_installments: '',
        installment_type: 'EQUAL',
        description: '',
        is_active: true
      });
    }
    setOpenInstallmentPlanDialog(true);
  };

  const handleCloseInstallmentPlanDialog = () => {
    setOpenInstallmentPlanDialog(false);
    setEditingInstallmentPlan(null);
  };

  const handleSaveInstallmentPlan = async () => {
    try {
      const data = {
        fee_structure_id: installmentPlanForm.fee_structure_id,
        name: installmentPlanForm.name,
        number_of_installments: parseInt(installmentPlanForm.number_of_installments),
        installment_type: installmentPlanForm.installment_type,
        description: installmentPlanForm.description,
        is_active: installmentPlanForm.is_active
      };

      if (editingInstallmentPlan && editingInstallmentPlan.id) {
        await api.put(`/education/installment-plans/${editingInstallmentPlan.id}/`, data);
      } else {
        await api.post('/education/installment-plans/', data);
      }

      handleCloseInstallmentPlanDialog();
      fetchInstallmentPlans();
    } catch (err) {
      console.error('Error saving installment plan:', err);
    }
  };

  const handleGenerateInstallments = async () => {
    try {
      const data = {
        student_id: installmentForm.student_id,
        fee_structure_id: installmentForm.fee_structure_id,
        installment_plan_id: installmentForm.installment_plan_id,
        start_date: installmentForm.start_date || new Date().toISOString().split('T')[0]
      };

      try {
        await api.post('/education/installments/generate/', data);
      } catch (err) {
        const msg = err?.response?.data?.error || '';
        if (msg.includes('Installments already exist')) {
          const confirmRegen = window.confirm('Installments already exist for this student and fee structure. Regenerate from the selected plan? This will replace existing installments.');
          if (confirmRegen) {
            await api.post('/education/installments/regenerate/', data);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      setOpenInstallmentDialog(false);
      setInstallmentForm({
        student_id: '',
        fee_structure_id: '',
        installment_plan_id: '',
        start_date: ''
      });
      fetchInstallments();
    } catch (err) {
      const detail = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to generate installments.';
      console.error('Error generating installments:', detail);
      alert(detail);
    }
  };

  const handleOpenInstallmentDialog = () => {
    setOpenInstallmentDialog(true);
  };

  const handleCloseInstallmentDialog = () => {
    setOpenInstallmentDialog(false);
  };

  // Helpers
  const formatDate = (value) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return value;
    }
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
      renderCell: (params) => params.value ? formatDate(params.value) : 'Not Set'
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
      renderCell: (params) => `₹${Number(params.value).toFixed(2)}`
    },
    {
      field: 'payment_date',
      headerName: 'Payment Date',
      width: 120,
      renderCell: (params) => formatDate(params.value)
    },
    {
      field: 'payment_method',
      headerName: 'Method',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={(String(params.value).toUpperCase() === 'CASH') ? 'success' : 'primary'}
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
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const schoolName = 'Your School Name';
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
          .footer { text-align: center; margin-top: 40px; color: #666; }
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
          <tr><td class="label">Payment Method:</td><td>${payment.payment_method || 'N/A'}</td></tr>
          <tr><td class="label">Notes:</td><td>${payment.notes || '-'}</td></tr>
        </table>
        <div class="amount-section">
          <div class="receipt-info"><strong>Amount Paid:</strong> ₹${parseFloat(payment.amount_paid || 0).toFixed(2)}</div>
          ${payment.fee_structure ? `
            <div class="receipt-info"><strong>Total Fee:</strong> ₹${parseFloat(payment.fee_structure.amount || 0).toFixed(2)}</div>
            <div class="receipt-info"><strong>Remaining:</strong> ₹${Math.max(0, parseFloat(payment.fee_structure.amount || 0) - parseFloat(payment.amount_paid || 0)).toFixed(2)}</div>
          ` : ''}
          <div class="total-amount">Total: ₹${parseFloat(payment.amount_paid || 0).toFixed(2)}</div>
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
    printWindow.print();
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
                  {(Array.isArray(feeDiscounts) ? feeDiscounts : []).map((row) => (
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
      case 3:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Installment Plans</Typography>
              <Button variant="contained" onClick={handleOpenInstallmentPlanDialog}>
                Create Plan
              </Button>
            </Box>
            {installmentPlansLoading ? <Typography>Loading...</Typography> : installmentPlansError ? <Alert severity="error">{installmentPlansError}</Alert> : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan Name</TableCell>
                      <TableCell>Fee Structure</TableCell>
                      <TableCell>Installments</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {installmentPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>{plan.fee_structure_fee_type || 'N/A'}</TableCell>
                        <TableCell>{plan.number_of_installments}</TableCell>
                        <TableCell>
                          <Chip 
                            label={plan.installment_type} 
                            color={plan.installment_type === 'EQUAL' ? 'primary' : 'secondary'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{plan.description || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={plan.is_active ? 'Active' : 'Inactive'} 
                            color={plan.is_active ? 'success' : 'default'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenInstallmentPlanDialog(plan)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );
      case 4:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">All Installments</Typography>
              <Button variant="contained" onClick={handleOpenInstallmentDialog}>
                Generate Installments
              </Button>
            </Box>
            {installmentsLoading ? <Typography>Loading...</Typography> : installmentsError ? <Alert severity="error">{installmentsError}</Alert> : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Fee Type</TableCell>
                      <TableCell>Installment #</TableCell>
                      <TableCell>Due Amount</TableCell>
                      <TableCell>Paid Amount</TableCell>
                      <TableCell>Remaining</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Late Fee</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {installments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.student?.name || 'N/A'}</TableCell>
                    <TableCell>{installment.fee_structure_fee_type || installment.fee_structure?.fee_type || installment.fee_structure_name || 'N/A'}</TableCell>
                        <TableCell>{installment.installment_number}</TableCell>
                    <TableCell>₹{Number(installment.due_amount).toFixed(2)}</TableCell>
                    <TableCell>₹{Number(installment.paid_amount).toFixed(2)}</TableCell>
                    <TableCell>₹{Number(installment.remaining_amount).toFixed(2)}</TableCell>
                    <TableCell>{formatDate(installment.due_date)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={installment.status} 
                            color={
                              installment.status === 'PAID' ? 'success' : 
                              installment.status === 'PARTIAL' ? 'warning' : 
                              installment.status === 'OVERDUE' ? 'error' : 'default'
                            } 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>₹{installment.late_fee || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );
      case 5:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Old Balances (Previous Academic Years)</Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenCarryForwardDialog(true)}
                  startIcon={<TrendingUpIcon />}
                >
                  Carry Forward
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingOldBalance(null);
                    setOldBalanceForm({
                      student: '',
                      academic_year: '',
                      class_name: '',
                      balance_amount: '',
                      carried_forward_to: '',
                      notes: ''
                    });
                    setOpenOldBalanceDialog(true);
                  }}
                >
                  Add Old Balance
                </Button>
              </Box>
            </Box>

            {/* Summary Cards */}
            {oldBalanceSummary && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Outstanding</Typography>
                      <Typography variant="h5" color="error">
                        ₹{Number(oldBalanceSummary.total_outstanding || 0).toLocaleString('en-IN')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Students with Balance</Typography>
                      <Typography variant="h5">
                        {oldBalanceSummary.total_students_with_balance || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Academic Years</Typography>
                      <Typography variant="h5">
                        {Object.keys(oldBalanceSummary.by_academic_year || {}).length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Filters */}
            <Box display="flex" gap={2} mb={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={academicYearFilter}
                  label="Academic Year"
                  onChange={(e) => setAcademicYearFilter(e.target.value)}
                >
                  <MenuItem value="all">All Years</MenuItem>
                  {oldBalanceSummary && Object.keys(oldBalanceSummary.by_academic_year || {}).map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Class</InputLabel>
                <Select
                  value={classFilter}
                  label="Class"
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {Array.from(new Set(oldBalances.map(b => b.class_name))).map(cls => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={settledFilter}
                  label="Status"
                  onChange={(e) => setSettledFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="unsettled">Unsettled</MenuItem>
                  <MenuItem value="settled">Settled</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Old Balances Table */}
            {oldBalanceLoading ? (
              <Typography>Loading old balances...</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Balance Amount</TableCell>
                      <TableCell>Carried Forward To</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Settled Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {oldBalances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography color="textSecondary">No old balances found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      oldBalances.map((balance) => (
                        <TableRow key={balance.id}>
                          <TableCell>{balance.student_name}</TableCell>
                          <TableCell>{balance.student_upper_id || '-'}</TableCell>
                          <TableCell>{balance.class_name}</TableCell>
                          <TableCell>{balance.academic_year}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="error">
                              ₹{Number(balance.balance_amount).toLocaleString('en-IN')}
                            </Typography>
                          </TableCell>
                          <TableCell>{balance.carried_forward_to || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={balance.is_settled ? 'Settled' : 'Outstanding'}
                              color={balance.is_settled ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {balance.settled_date ? new Date(balance.settled_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Mark as Settled">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={async () => {
                                    try {
                                      await api.put(`/education/old-balances/${balance.id}/`, {
                                        is_settled: true,
                                        settled_date: new Date().toISOString().split('T')[0]
                                      });
                                      fetchOldBalances();
                                      fetchOldBalanceSummary();
                                    } catch (err) {
                                      console.error('Error marking as settled:', err);
                                    }
                                  }}
                                  disabled={balance.is_settled}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingOldBalance(balance);
                                    setOldBalanceForm({
                                      student: balance.student,
                                      academic_year: balance.academic_year,
                                      class_name: balance.class_name,
                                      balance_amount: balance.balance_amount,
                                      carried_forward_to: balance.carried_forward_to || '',
                                      notes: balance.notes || ''
                                    });
                                    setOpenOldBalanceDialog(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );
      case 6:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Balance Adjustments</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setAdjustmentForm({
                    student: '',
                    adjustment_type: 'WAIVER',
                    amount: '',
                    reason: '',
                    academic_year: '',
                    fee_structure: ''
                  });
                  setOpenAdjustmentDialog(true);
                }}
              >
                Add Adjustment
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {balanceAdjustments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="textSecondary">No adjustments found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    balanceAdjustments.map((adj) => (
                      <TableRow key={adj.id}>
                        <TableCell>{adj.student_name}</TableCell>
                        <TableCell>
                          <Chip label={adj.adjustment_type} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={adj.amount > 0 ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {adj.amount > 0 ? '+' : ''}₹{Number(adj.amount).toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell>{adj.reason}</TableCell>
                        <TableCell>{adj.academic_year || '-'}</TableCell>
                        <TableCell>{adj.created_by_name || '-'}</TableCell>
                        <TableCell>
                          {new Date(adj.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
              <Tab label="Installment Plans" />
              <Tab label="Installments" />
              <Tab label="Old Balances" icon={<HistoryIcon />} />
              <Tab label="Adjustments" icon={<AssessmentIcon />} />
            </Tabs>

            {getTabContent()}
          </CardContent>
        </Card>

        {/* Fee Structure Dialog */}
        <Dialog open={openStructureDialog} onClose={() => setOpenStructureDialog(false)} maxWidth="md" fullWidth keepMounted disableEnforceFocus disableAutoFocus sx={{ zIndex: 2000 }}>
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
        <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="md" fullWidth keepMounted disableEnforceFocus disableAutoFocus sx={{ zIndex: 2000 }}>
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
        <Dialog open={openDiscountDialog} onClose={() => setOpenDiscountDialog(false)} maxWidth="md" fullWidth keepMounted disableEnforceFocus disableAutoFocus sx={{ zIndex: 2000 }}>
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

        {/* Installment Plan Dialog */}
        <Dialog open={openInstallmentPlanDialog} onClose={handleCloseInstallmentPlanDialog} maxWidth="md" fullWidth keepMounted disableEnforceFocus disableAutoFocus sx={{ zIndex: 2000 }}>
          <DialogTitle>{editingInstallmentPlan ? 'Edit Installment Plan' : 'Create Installment Plan'}</DialogTitle>
          <DialogContent>
            <InstallmentPlanForm
              form={installmentPlanForm}
              setForm={setInstallmentPlanForm}
              feeStructures={feeStructures}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInstallmentPlanDialog}>Cancel</Button>
            <Button onClick={handleSaveInstallmentPlan} variant="contained">
              {editingInstallmentPlan ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Installment Dialog */}
        <Dialog open={openInstallmentDialog} onClose={handleCloseInstallmentDialog} maxWidth="md" fullWidth keepMounted disableEnforceFocus disableAutoFocus sx={{ zIndex: 2000 }}>
          <DialogTitle>Generate Installments</DialogTitle>
          <DialogContent>
            <InstallmentForm
              form={installmentForm}
              setForm={setInstallmentForm}
              students={students}
              feeStructures={feeStructures}
              installmentPlans={installmentPlans}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInstallmentDialog}>Cancel</Button>
            <Button onClick={handleGenerateInstallments} variant="contained">Generate</Button>
          </DialogActions>
        </Dialog>

        {/* Old Balance Dialog */}
        <Dialog open={openOldBalanceDialog} onClose={() => setOpenOldBalanceDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingOldBalance ? 'Edit Old Balance' : 'Add Old Balance'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Student</InputLabel>
                <Select
                  value={oldBalanceForm.student}
                  onChange={(e) => setOldBalanceForm({ ...oldBalanceForm, student: e.target.value })}
                  label="Student"
                >
                  {students.map((stu) => (
                    <MenuItem key={stu.id} value={stu.id}>{stu.name} ({stu.upper_id || stu.id})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Academic Year"
                value={oldBalanceForm.academic_year}
                onChange={(e) => setOldBalanceForm({ ...oldBalanceForm, academic_year: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="e.g., 2023-24"
              />
              <TextField
                fullWidth
                label="Class Name"
                value={oldBalanceForm.class_name}
                onChange={(e) => setOldBalanceForm({ ...oldBalanceForm, class_name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Balance Amount"
                type="number"
                value={oldBalanceForm.balance_amount}
                onChange={(e) => setOldBalanceForm({ ...oldBalanceForm, balance_amount: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Carried Forward To (Optional)"
                value={oldBalanceForm.carried_forward_to}
                onChange={(e) => setOldBalanceForm({ ...oldBalanceForm, carried_forward_to: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="e.g., 2024-25"
              />
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={oldBalanceForm.notes}
                onChange={(e) => setOldBalanceForm({ ...oldBalanceForm, notes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOldBalanceDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  const data = {
                    student: oldBalanceForm.student,
                    academic_year: oldBalanceForm.academic_year,
                    class_name: oldBalanceForm.class_name,
                    balance_amount: parseFloat(oldBalanceForm.balance_amount),
                    carried_forward_to: oldBalanceForm.carried_forward_to || null,
                    notes: oldBalanceForm.notes || ''
                  };
                  if (editingOldBalance) {
                    await api.put(`/education/old-balances/${editingOldBalance.id}/`, data);
                  } else {
                    await api.post('/education/old-balances/', data);
                  }
                  setOpenOldBalanceDialog(false);
                  fetchOldBalances();
                  fetchOldBalanceSummary();
                } catch (err) {
                  console.error('Error saving old balance:', err);
                  setError('Failed to save old balance: ' + (err.response?.data?.detail || err.message));
                }
              }}
            >
              {editingOldBalance ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Carry Forward Dialog */}
        <Dialog open={openCarryForwardDialog} onClose={() => setOpenCarryForwardDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Carry Forward Balances</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              This will carry forward all unpaid installments from the old academic year to the new year.
            </Alert>
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="From Academic Year"
                value={carryForwardForm.from_academic_year}
                onChange={(e) => setCarryForwardForm({ ...carryForwardForm, from_academic_year: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="e.g., 2023-24"
              />
              <TextField
                fullWidth
                label="To Academic Year"
                value={carryForwardForm.to_academic_year}
                onChange={(e) => setCarryForwardForm({ ...carryForwardForm, to_academic_year: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="e.g., 2024-25"
              />
              <FormControl fullWidth>
                <InputLabel>Class (Optional - leave blank for all)</InputLabel>
                <Select
                  value={carryForwardForm.class_name}
                  onChange={(e) => setCarryForwardForm({ ...carryForwardForm, class_name: e.target.value })}
                  label="Class (Optional - leave blank for all)"
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.name}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCarryForwardDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  const data = {
                    from_academic_year: carryForwardForm.from_academic_year,
                    to_academic_year: carryForwardForm.to_academic_year,
                    class_name: carryForwardForm.class_name || null
                  };
                  const res = await api.post('/education/old-balances/carry-forward/', data);
                  setOpenCarryForwardDialog(false);
                  setCarryForwardForm({ from_academic_year: '', to_academic_year: '', class_name: '' });
                  fetchOldBalances();
                  fetchOldBalanceSummary();
                  alert(res.data.message || 'Balances carried forward successfully!');
                } catch (err) {
                  console.error('Error carrying forward balances:', err);
                  setError('Failed to carry forward balances: ' + (err.response?.data?.detail || err.message));
                }
              }}
            >
              Carry Forward
            </Button>
          </DialogActions>
        </Dialog>

        {/* Balance Adjustment Dialog */}
        <Dialog open={openAdjustmentDialog} onClose={() => setOpenAdjustmentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add Balance Adjustment</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Student</InputLabel>
                <Select
                  value={adjustmentForm.student}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, student: e.target.value })}
                  label="Student"
                >
                  {students.map((stu) => (
                    <MenuItem key={stu.id} value={stu.id}>{stu.name} ({stu.upper_id || stu.id})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Adjustment Type</InputLabel>
                <Select
                  value={adjustmentForm.adjustment_type}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjustment_type: e.target.value })}
                  label="Adjustment Type"
                >
                  <MenuItem value="WAIVER">Fee Waiver</MenuItem>
                  <MenuItem value="DISCOUNT">Discount Applied</MenuItem>
                  <MenuItem value="CORRECTION">Correction/Adjustment</MenuItem>
                  <MenuItem value="REFUND">Refund</MenuItem>
                  <MenuItem value="LATE_FEE_WAIVER">Late Fee Waiver</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={adjustmentForm.amount}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                sx={{ mb: 2 }}
                helperText="Positive for reduction, negative for addition"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Reason"
                multiline
                rows={3}
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Academic Year (Optional)"
                value={adjustmentForm.academic_year}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, academic_year: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="e.g., 2024-25"
              />
              <FormControl fullWidth>
                <InputLabel>Fee Structure (Optional)</InputLabel>
                <Select
                  value={adjustmentForm.fee_structure}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, fee_structure: e.target.value })}
                  label="Fee Structure (Optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {feeStructures.map((fs) => (
                    <MenuItem key={fs.id} value={fs.id}>{fs.class_obj?.name || 'N/A'} - {fs.fee_type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdjustmentDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  const data = {
                    student: adjustmentForm.student,
                    adjustment_type: adjustmentForm.adjustment_type,
                    amount: parseFloat(adjustmentForm.amount),
                    reason: adjustmentForm.reason,
                    academic_year: adjustmentForm.academic_year || null,
                    fee_structure: adjustmentForm.fee_structure || null
                  };
                  await api.post('/education/balance-adjustments/', data);
                  setOpenAdjustmentDialog(false);
                  setAdjustmentForm({
                    student: '',
                    adjustment_type: 'WAIVER',
                    amount: '',
                    reason: '',
                    academic_year: '',
                    fee_structure: ''
                  });
                  fetchBalanceAdjustments();
                } catch (err) {
                  console.error('Error adding adjustment:', err);
                  setError('Failed to add adjustment: ' + (err.response?.data?.detail || err.message));
                }
              }}
            >
              Add Adjustment
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
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
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
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
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
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
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
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
          >
            {feeStructures.map(structure => (
              <MenuItem key={structure.id} value={structure.id}>
                {structure.fee_type} - ₹{Number(structure.amount).toFixed(2)}
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
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
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
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
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
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
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

const InstallmentPlanForm = ({ form, setForm, feeStructures }) => {
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid gridColumn="span 12">
        <FormControl fullWidth>
          <InputLabel>Fee Structure</InputLabel>
          <Select
            value={form.fee_structure_id}
            onChange={(e) => handleChange('fee_structure_id', e.target.value)}
            label="Fee Structure"
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
          >
            {feeStructures.map(structure => (
              <MenuItem key={structure.id} value={structure.id}>
                {structure.fee_type} - ₹{Number(structure.amount).toFixed(2)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Plan Name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Number of Installments"
          type="number"
          value={form.number_of_installments}
          onChange={(e) => handleChange('number_of_installments', e.target.value)}
        />
      </Grid>
      <Grid gridColumn="span 12">
        <FormControl fullWidth>
            <InputLabel>Installment Type</InputLabel>
            <Select
              value={form.installment_type || 'EQUAL'}
              onChange={(e) => handleChange('installment_type', e.target.value)}
              label="Installment Type"
              MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
            >
              <MenuItem value="EQUAL">Equal Split</MenuItem>
              <MenuItem value="CUSTOM">Custom Amounts</MenuItem>
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
      <Grid gridColumn="span 12">
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
    </Grid>
  );
};

const InstallmentForm = ({ form, setForm, students, feeStructures, installmentPlans }) => {
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
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
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
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
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
        <FormControl fullWidth>
          <InputLabel>Installment Plan</InputLabel>
          <Select
            value={form.installment_plan_id}
            onChange={(e) => handleChange('installment_plan_id', e.target.value)}
            label="Installment Plan"
            MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 2200 } } }}
          >
            {installmentPlans.map(plan => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.name} - {plan.number_of_installments} installments
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid gridColumn="span 6">
        <TextField
          fullWidth
          label="Start Date"
          type="date"
          value={form.start_date}
          onChange={(e) => handleChange('start_date', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
};

export default FeeManagement; 