import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
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
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert as MuiAlert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import EnhancedButton from '../../components/EnhancedButton';
import SmartSearch from '../../components/SmartSearch';
import SmartDashboard from '../../components/SmartDashboard';
import GuidedWorkflow from '../../components/GuidedWorkflow';
import {
  LocalHospital as MedicineIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as SalesIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  BarChart as ChartIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  CameraAlt as QrCodeIcon,
  QrCode2 as QrCodeDisplayIcon
} from '@mui/icons-material';
import { BrowserMultiFormatReader } from '@zxing/library';
import api from '../../services/api';

// Version: 1.0.2 - Added QR/Barcode scanning functionality
const PharmacyDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [medicines, setMedicines] = useState([]);
  
  // Attendance states
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Dialog states
  const [addMedicineDialog, setAddMedicineDialog] = useState(false);
  const [newSaleDialog, setNewSaleDialog] = useState(false);
  const [addPrescriptionDialog, setAddPrescriptionDialog] = useState(false);
  const [addCustomerDialog, setAddCustomerDialog] = useState(false);
  const [saleDetailsDialog, setSaleDetailsDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  // New dialog states for missing features
  const [addSupplierDialog, setAddSupplierDialog] = useState(false);
  const [addPurchaseOrderDialog, setAddPurchaseOrderDialog] = useState(false);
  const [addStockAdjustmentDialog, setAddStockAdjustmentDialog] = useState(false);
  const [addBatchDialog, setAddBatchDialog] = useState(false);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [manageInventoryDialog, setManageInventoryDialog] = useState(false);
  
  // Form states
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    generic_name: '',
    category: '',
    manufacturer: '',
    strength: '',
    dosage_form: '',
    prescription_required: false,
    unit_price: '',
    initial_stock: '',
    batch_number: '',
    expiry_date: '',
    description: '',
    barcode: ''
  });
  
  const [saleForm, setSaleForm] = useState({
    customer_name: '',
    phone: '',
    prescription_number: '',
    doctor_name: '',
    payment_method: 'CASH',
    items: [{ medicine: '', quantity: 1, price: '' }]
  });
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    address: '',
    allergies: '',
    medical_history: ''
  });
  
  const [prescriptionForm, setPrescriptionForm] = useState({
    customer: '',
    doctor_name: '',
    prescription_date: '',
    diagnosis: '',
    notes: '',
    medicines: [{ medicine: '', dosage: '', frequency: '', duration: '', quantity: 1 }]
  });

  // New form states for missing features
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    gst_number: '',
    payment_terms: 'Net 30'
  });

  const [purchaseOrderForm, setPurchaseOrderForm] = useState({
    supplier: '',
    po_number: '',
    order_date: '',
    expected_delivery: '',
    notes: '',
    items: [{ medicine: '', quantity: 1, unit_cost: '' }]
  });

  const [stockAdjustmentForm, setStockAdjustmentForm] = useState({
    medicine_batch: '',
    adjustment_type: 'ADD',
    quantity: '',
    reason: ''
  });

  const [batchForm, setBatchForm] = useState({
    medicine: '',
    batch_number: '',
    supplier: '',
    manufacturing_date: '',
    expiry_date: '',
    cost_price: '',
    selling_price: '',
    mrp: '',
    quantity_received: '',
    location: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Medicine search state
  const [medicineSearch, setMedicineSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Customer search state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerSearchResults, setShowCustomerSearchResults] = useState(false);
  const [customers, setCustomers] = useState([]);

  // Sale medicine search state
  const [saleMedicineSearch, setSaleMedicineSearch] = useState('');
  const [saleMedicineSearchResults, setSaleMedicineSearchResults] = useState([]);
  const [showSaleMedicineSearchResults, setShowSaleMedicineSearchResults] = useState(false);
  
  // Individual medicine dropdown states
  const [medicineDropdownStates, setMedicineDropdownStates] = useState({});

  // Prescription search state
  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [prescriptionSearchResults, setPrescriptionSearchResults] = useState([]);
  const [showPrescriptionSearchResults, setShowPrescriptionSearchResults] = useState(false);
  const [prescriptionMedicineSearch, setPrescriptionMedicineSearch] = useState('');
  const [prescriptionMedicineSearchResults, setPrescriptionMedicineSearchResults] = useState([]);
  const [showPrescriptionMedicineSearchResults, setShowPrescriptionMedicineSearchResults] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);

  // New state variables for missing features
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [batches, setBatches] = useState([]);

  // Scanning state
  const [scanDialog, setScanDialog] = useState(false);
  const [scanMode, setScanMode] = useState(''); // 'add_medicine' or 'sale'
  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    fetchDashboardData();
    fetchTodayAttendance();
  }, []);

  // Debug dropdown state
  useEffect(() => {
    console.log('Sale medicine dropdown state:', {
      show: showSaleMedicineSearchResults,
      results: saleMedicineSearchResults?.length || 0
    });
  }, [showSaleMedicineSearchResults, saleMedicineSearchResults]);

  useEffect(() => {
    console.log('Prescription medicine dropdown state:', {
      show: showPrescriptionMedicineSearchResults,
      results: prescriptionMedicineSearchResults?.length || 0
    });
  }, [showPrescriptionMedicineSearchResults, prescriptionMedicineSearchResults]);

  useEffect(() => {
    console.log('Customer dropdown state:', {
      show: showCustomerSearchResults,
      results: customerSearchResults?.length || 0
    });
  }, [showCustomerSearchResults, customerSearchResults]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');

      // Fetch analytics
      const analyticsResponse = await api.get('/pharmacy/analytics/');
      setAnalytics(analyticsResponse.data);

      // Fetch recent sales
      const salesResponse = await api.get('/pharmacy/sales/?limit=5');
      console.log('Sales response:', salesResponse.data);
      console.log('Recent sales:', salesResponse.data.results);
      setRecentSales(salesResponse.data.results || []);

      // Fetch low stock medicines
      const lowStockResponse = await api.get('/pharmacy/batches/?quantity_available__lte=10');
      setLowStockMedicines(lowStockResponse.data.results || []);

      // Fetch expiring medicines
      const expiringResponse = await api.get('/pharmacy/batches/?expiry_date__lte=30');
      setExpiringMedicines(expiringResponse.data.results || []);

      // Fetch all medicines for search
      const medicinesResponse = await api.get('/pharmacy/medicines/');
      console.log('Medicines response:', medicinesResponse.data);
      setMedicines(medicinesResponse.data.results || []);

      // Fetch all customers for search
      const customersResponse = await api.get('/pharmacy/customers/');
      console.log('Customers response:', customersResponse.data);
      setCustomers(customersResponse.data.results || []);

      // Fetch all prescriptions for search
      const prescriptionsResponse = await api.get('/pharmacy/prescriptions/');
      setPrescriptions(prescriptionsResponse.data.results || []);

      // Fetch additional data for new features
      const suppliersResponse = await api.get('/pharmacy/suppliers/');
      setSuppliers(suppliersResponse.data.results || []);

      const categoriesResponse = await api.get('/pharmacy/categories/');
      setCategories(categoriesResponse.data.results || []);

      const purchaseOrdersResponse = await api.get('/pharmacy/purchase-orders/');
      setPurchaseOrders(purchaseOrdersResponse.data.results || []);

      const stockAdjustmentsResponse = await api.get('/pharmacy/stock-adjustments/');
      setStockAdjustments(stockAdjustmentsResponse.data.results || []);

      const batchesResponse = await api.get('/pharmacy/batches/');
      setBatches(batchesResponse.data.results || []);

      console.log('Dashboard data fetched successfully');

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getQuantityColor = (quantity) => {
    return quantity <= 5 ? 'error' : 'warning';
  };

  // Quick Actions handlers
  const handleAddMedicine = () => {
    console.log('Add Medicine button clicked');
    setAddMedicineDialog(true);
  };

  const handleNewSale = () => {
    console.log('New Sale button clicked');
    setNewSaleDialog(true);
  };

  const handleAddPrescription = () => {
    console.log('Add Prescription button clicked');
    setAddPrescriptionDialog(true);
  };

  const handleAddCustomer = () => {
    console.log('Add Customer button clicked');
    setAddCustomerDialog(true);
  };

  // New handler functions for missing features
  const handleAddSupplier = () => {
    console.log('Add Supplier button clicked');
    setAddSupplierDialog(true);
  };

  const handleAddPurchaseOrder = () => {
    console.log('Add Purchase Order button clicked');
    setAddPurchaseOrderDialog(true);
  };

  const handleAddStockAdjustment = () => {
    console.log('Add Stock Adjustment button clicked');
    setAddStockAdjustmentDialog(true);
  };

  const handleAddBatch = () => {
    console.log('Add Batch button clicked');
    setAddBatchDialog(true);
  };

  const handleAddCategory = () => {
    console.log('Add Category button clicked');
    setAddCategoryDialog(true);
  };

  const handleManageInventory = () => {
    console.log('Manage Inventory button clicked');
    setManageInventoryDialog(true);
  };

  // Attendance functions
  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get('/pharmacy/staff-attendance/');
      const today = new Date().toISOString().slice(0, 10);
      const record = Array.isArray(res.data) ? res.data.find(r => r.date === today) : null;
      setTodayAttendance(record);
    } catch {
      setTodayAttendance(null);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      await api.post('/pharmacy/staff-attendance/check-in/');
      setSnackbar({ open: true, message: 'Check-in successful!', severity: 'success' });
      await fetchTodayAttendance();
    } catch (err) {
      let msg = 'Staff check-in failed.';
      if (err?.response?.data) {
        msg += ' ' + JSON.stringify(err.response.data);
      } else if (err?.message) {
        msg += ' ' + err.message;
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceLoading(true);
    try {
      await api.post('/pharmacy/staff-attendance/check-out/');
      setSnackbar({ open: true, message: 'Check-out successful!', severity: 'success' });
      await fetchTodayAttendance();
    } catch (err) {
      let msg = 'Staff check-out failed.';
      if (err?.response?.data) {
        msg += ' ' + JSON.stringify(err.response.data);
      } else if (err?.message) {
        msg += ' ' + err.message;
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Form handlers
  const handleMedicineFormChange = (field, value) => {
    setMedicineForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaleFormChange = (field, value) => {
    setSaleForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionFormChange = (field, value) => {
    setPrescriptionForm(prev => ({ ...prev, [field]: value }));
  };

  // New form change handlers for missing features
  const handleSupplierFormChange = (field, value) => {
    setSupplierForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePurchaseOrderFormChange = (field, value) => {
    setPurchaseOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStockAdjustmentFormChange = (field, value) => {
    setStockAdjustmentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBatchFormChange = (field, value) => {
    setBatchForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryFormChange = (field, value) => {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  };

  // Submit handlers
  const handleSubmitMedicine = async () => {
    try {
    console.log('Submitting medicine:', medicineForm);
      
      // Convert numeric fields to proper types
      const medicineData = {
        ...medicineForm,
        unit_price: parseFloat(medicineForm.unit_price) || 0,
        initial_stock: parseInt(medicineForm.initial_stock) || 0
      };
      
      // Make API call to create medicine
      const response = await api.post('/pharmacy/medicines/', medicineData);
      
      setSnackbar({ open: true, message: `Medicine "${medicineForm.name}" added successfully!`, severity: 'success' });
    setAddMedicineDialog(false);
    setMedicineForm({
      name: '',
      generic_name: '',
      category: '',
      manufacturer: '',
        strength: '',
        dosage_form: '',
        prescription_required: false,
      unit_price: '',
      initial_stock: '',
      batch_number: '',
      expiry_date: '',
        description: '',
        barcode: ''
      });
      
      // Refresh dashboard data to include the new medicine
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating medicine:', error);
      let errorMessage = 'Failed to create medicine.';
      if (error.response?.data) {
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitSale = async () => {
    try {
    console.log('Submitting sale:', saleForm);
      console.log('Sale form details:', {
        customer_name: saleForm.customer_name,
        phone: saleForm.phone,
        items: saleForm.items,
        payment_method: saleForm.payment_method
      });
      
      // Calculate totals
      const items = saleForm.items.filter(item => item.medicine && item.quantity > 0).map(item => ({
        ...item,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price) || 0
      }));
      
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const total_amount = subtotal; // No tax or discounts for now
      
      // Generate invoice number
      const invoice_number = `INV${Date.now()}`;
      
      // Prepare sale data
      const saleData = {
        customer_name_input: saleForm.customer_name,
        phone: saleForm.phone,
        prescription_number: saleForm.prescription_number,
        doctor_name: saleForm.doctor_name,
        payment_method: saleForm.payment_method,
        invoice_number: invoice_number,
        subtotal: subtotal,
        total_amount: total_amount,
        items: items
      };
      
      console.log('Prepared sale data:', saleData);
      console.log('Sale data items:', saleData.items);
      
      // Make API call to create sale
      const response = await api.post('/pharmacy/sales/', saleData);
      
      setSnackbar({ open: true, message: `Sale for customer "${saleForm.customer_name}" created successfully!`, severity: 'success' });
    setNewSaleDialog(false);
    setSaleForm({
      customer_name: '',
      phone: '',
      prescription_number: '',
      doctor_name: '',
      payment_method: 'CASH',
      items: [{ medicine: '', quantity: 1, price: '' }]
    });
      
      // Refresh dashboard data to show the new sale
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating sale:', error);
      console.log('Full error object:', error);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      console.log('Error response headers:', error.response?.headers);
      let errorMessage = 'Failed to create sale.';
      if (error.response?.data) {
        console.log('API Error Response:', error.response.data);
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitCustomer = async () => {
    try {
    console.log('Submitting customer:', customerForm);
      
      // Make API call to create customer
      const response = await api.post('/pharmacy/customers/', customerForm);
      
      setSnackbar({ open: true, message: `Customer "${customerForm.name}" added successfully!`, severity: 'success' });
    setAddCustomerDialog(false);
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      date_of_birth: '',
      address: '',
      allergies: '',
      medical_history: ''
    });
      
      // Refresh dashboard data to include the new customer
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating customer:', error);
      let errorMessage = 'Failed to create customer.';
      if (error.response?.data) {
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitPrescription = async () => {
    try {
    console.log('Submitting prescription:', prescriptionForm);
      
      // Convert numeric fields to proper types
      const prescriptionData = {
        ...prescriptionForm,
        medicines: prescriptionForm.medicines.map(medicine => ({
          ...medicine,
          quantity: parseInt(medicine.quantity) || 1
        }))
      };
      
      // Make API call to create prescription
      const response = await api.post('/pharmacy/prescriptions/', prescriptionData);
      
      setSnackbar({ open: true, message: `Prescription for customer "${prescriptionForm.customer}" added successfully!`, severity: 'success' });
    setAddPrescriptionDialog(false);
    setPrescriptionForm({
      customer: '',
      doctor_name: '',
      prescription_date: '',
      diagnosis: '',
      notes: '',
      medicines: [{ medicine: '', dosage: '', frequency: '', duration: '', quantity: 1 }]
    });
      
      // Refresh dashboard data to include the new prescription
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating prescription:', error);
      let errorMessage = 'Failed to create prescription.';
      if (error.response?.data) {
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // New submit handlers for missing features
  const handleSubmitSupplier = async () => {
    try {
      console.log('Submitting supplier:', supplierForm);
      
      // Validate required fields
      if (!supplierForm.name || !supplierForm.contact_person || !supplierForm.phone || !supplierForm.address) {
        setSnackbar({ open: true, message: 'Please fill in all required fields (Name, Contact Person, Phone, Address)', severity: 'error' });
        return;
      }
      
      const response = await api.post('/pharmacy/suppliers/', supplierForm);
      
      setSnackbar({ open: true, message: `Supplier "${supplierForm.name}" added successfully!`, severity: 'success' });
      setAddSupplierDialog(false);
      setSupplierForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        gst_number: '',
        payment_terms: 'Net 30'
      });
      
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating supplier:', error);
      let errorMessage = 'Failed to create supplier.';
      if (error.response?.data) {
        console.log('API Error Response:', error.response.data);
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitPurchaseOrder = async () => {
    try {
      console.log('Submitting purchase order:', purchaseOrderForm);
      
      // Validate required fields
      if (!purchaseOrderForm.po_number || !purchaseOrderForm.supplier || !purchaseOrderForm.order_date || !purchaseOrderForm.expected_delivery) {
        setSnackbar({ open: true, message: 'Please fill in all required fields (PO Number, Supplier, Order Date, Expected Delivery)', severity: 'error' });
        return;
      }
      
      // Convert numeric fields to proper types
      const purchaseOrderData = {
        ...purchaseOrderForm,
        items: purchaseOrderForm.items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          unit_cost: parseFloat(item.unit_cost)
        }))
      };
      
      const response = await api.post('/pharmacy/purchase-orders/', purchaseOrderData);
      
      setSnackbar({ open: true, message: `Purchase Order "${purchaseOrderForm.po_number}" created successfully!`, severity: 'success' });
      setAddPurchaseOrderDialog(false);
      setPurchaseOrderForm({
        supplier: '',
        po_number: '',
        order_date: '',
        expected_delivery: '',
        notes: '',
        items: [{ medicine: '', quantity: 1, unit_cost: '' }]
      });
      
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating purchase order:', error);
      let errorMessage = 'Failed to create purchase order.';
      if (error.response?.data) {
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitStockAdjustment = async () => {
    try {
      console.log('Submitting stock adjustment:', stockAdjustmentForm);
      
      // Validate required fields
      if (!stockAdjustmentForm.medicine_batch || !stockAdjustmentForm.quantity || !stockAdjustmentForm.reason) {
        setSnackbar({ open: true, message: 'Please fill in all required fields (Medicine Batch, Quantity, Reason)', severity: 'error' });
        return;
      }
      
      // Convert quantity to integer
      const stockAdjustmentData = {
        ...stockAdjustmentForm,
        quantity: parseInt(stockAdjustmentForm.quantity)
      };
      
      const response = await api.post('/pharmacy/stock-adjustments/', stockAdjustmentData);
      
      setSnackbar({ open: true, message: `Stock adjustment created successfully!`, severity: 'success' });
      setAddStockAdjustmentDialog(false);
      setStockAdjustmentForm({
        medicine_batch: '',
        adjustment_type: 'ADD',
        quantity: '',
        reason: ''
      });
      
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating stock adjustment:', error);
      let errorMessage = 'Failed to create stock adjustment.';
      if (error.response?.data) {
        console.log('API Error Response:', error.response.data);
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitBatch = async () => {
    try {
      console.log('Submitting batch:', batchForm);
      
      // Validate required fields
      if (!batchForm.medicine || !batchForm.batch_number || !batchForm.supplier || !batchForm.manufacturing_date || !batchForm.expiry_date || !batchForm.cost_price || !batchForm.selling_price || !batchForm.quantity_received) {
        setSnackbar({ open: true, message: 'Please fill in all required fields (Medicine, Batch Number, Supplier, Manufacturing Date, Expiry Date, Cost Price, Selling Price, Quantity Received)', severity: 'error' });
        return;
      }
      
      // Convert numeric fields to proper types
      const batchData = {
        ...batchForm,
        cost_price: parseFloat(batchForm.cost_price),
        selling_price: parseFloat(batchForm.selling_price),
        mrp: batchForm.mrp ? parseFloat(batchForm.mrp) : 0,
        quantity_received: parseInt(batchForm.quantity_received)
      };
      
      const response = await api.post('/pharmacy/batches/', batchData);
      
      setSnackbar({ open: true, message: `Batch "${batchForm.batch_number}" added successfully!`, severity: 'success' });
      setAddBatchDialog(false);
      setBatchForm({
        medicine: '',
        batch_number: '',
        supplier: '',
        manufacturing_date: '',
        expiry_date: '',
        cost_price: '',
        selling_price: '',
        mrp: '',
        quantity_received: '',
        location: ''
      });
      
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating batch:', error);
      let errorMessage = 'Failed to create batch.';
      if (error.response?.data) {
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitCategory = async () => {
    try {
      console.log('Submitting category:', categoryForm);
      
      // Validate required fields
      if (!categoryForm.name) {
        setSnackbar({ open: true, message: 'Please fill in the category name', severity: 'error' });
        return;
      }
      
      const response = await api.post('/pharmacy/categories/', categoryForm);
      
      setSnackbar({ open: true, message: `Category "${categoryForm.name}" added successfully!`, severity: 'success' });
      setAddCategoryDialog(false);
      setCategoryForm({
        name: '',
        description: ''
      });
      
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating category:', error);
      let errorMessage = 'Failed to create category.';
      if (error.response?.data) {
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Medicine search function
  const handleMedicineSearch = (searchTerm) => {
    console.log('handleMedicineSearch called with:', searchTerm);
    setMedicineSearch(searchTerm);
    
    if (searchTerm.length > 0) {
      // Filter medicines from the dashboard data
      const filtered = (medicines || []).filter(medicine => {
        console.log('Processing medicine:', medicine);
        const medicineName = String(medicine.medicine_name || '');
        const genericName = String(medicine.generic_name || '');
        const category = String(medicine.category?.name || medicine.category || '');
        const manufacturer = String(medicine.manufacturer || '');
        
        console.log('Processed values:', { medicineName, genericName, category, manufacturer });
        
        return medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               category.toLowerCase().includes(searchTerm.toLowerCase()) ||
               manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      });
      console.log('Filtered results:', filtered);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSelectMedicine = (medicine) => {
    setMedicineForm(prev => ({
      ...prev,
      name: medicine.medicine_name || '',
      generic_name: medicine.generic_name || '',
      category: medicine.category?.name || medicine.category || '',
      manufacturer: medicine.manufacturer || '',
      unit_price: medicine.unit_price || '',
      description: medicine.description || ''
    }));
    setMedicineSearch(medicine.medicine_name || '');
    setShowSearchResults(false);
  };

  // Customer search function
  const handleCustomerSearch = (searchTerm) => {
    console.log('Customer search called with:', searchTerm);
    console.log('Available customers:', customers);
    console.log('Customers type:', typeof customers);
    console.log('Customers length:', customers ? customers.length : 'null');
    
    setCustomerSearch(searchTerm);
    
    if (searchTerm.length > 0) {
      // Filter customers from the dashboard data
      const filtered = (customers || []).filter(customer => {
        const nameMatch = (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const phoneMatch = (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        console.log('Customer:', customer.name, 'matches:', { nameMatch, phoneMatch, emailMatch });
        
        return nameMatch || phoneMatch || emailMatch;
      });
      
      console.log('Filtered customers:', filtered);
      setCustomerSearchResults(filtered);
      setShowCustomerSearchResults(true);
      console.log('Customer dropdown state set to show with', filtered.length, 'results');
    } else {
      setCustomerSearchResults([]);
      setShowCustomerSearchResults(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    console.log('Customer selected for sale:', customer);
    setSaleForm(prev => {
      const updated = {
      ...prev,
      customer_name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || ''
      };
      console.log('Updated sale form:', updated);
      return updated;
    });
    setCustomerSearch(customer.name || '');
    setShowCustomerSearchResults(false);
  };

  const handleSelectCustomerForPrescription = (customer) => {
    console.log('Customer selected for prescription:', customer);
    setPrescriptionForm(prev => {
      const updated = {
        ...prev,
        customer: customer.name || ''
      };
      console.log('Updated prescription form:', updated);
      return updated;
    });
    setCustomerSearch(customer.name || '');
    setShowCustomerSearchResults(false);
  };

    // Sale medicine search function
  const handleSaleMedicineSearch = (searchTerm, itemIndex) => {
    console.log('Medicine search called with:', searchTerm, 'for item index:', itemIndex);
    console.log('Available medicines:', medicines);
    console.log('Medicines type:', typeof medicines);
    console.log('Medicines length:', medicines ? medicines.length : 'null');
    
    setSaleMedicineSearch(searchTerm);
    
    if (medicines && medicines.length > 0) {
      if (searchTerm.length > 0) {
        console.log('Starting medicine search with term:', searchTerm);
        console.log('Total medicines available:', medicines.length);
        
        // Filter medicines from the dashboard data
        const filtered = medicines.filter(medicine => {
          console.log('Processing medicine:', medicine);
          console.log('Medicine keys:', Object.keys(medicine));
          
          const medicineName = String(medicine.name || medicine.medicine_name || '');
          const genericName = String(medicine.generic_name || '');
          const category = String(medicine.category?.name || medicine.category || '');
          const manufacturer = String(medicine.manufacturer || '');
          
          console.log('Medicine:', medicineName, 'matches:', {
            medicineName: medicineName.toLowerCase().includes(searchTerm.toLowerCase()),
            genericName: genericName.toLowerCase().includes(searchTerm.toLowerCase()),
            category: category.toLowerCase().includes(searchTerm.toLowerCase()),
            manufacturer: manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
          });
          
          return medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        console.log('Filtered medicines:', filtered);
        setSaleMedicineSearchResults(filtered);
        showMedicineDropdown(itemIndex);
      } else {
        // Show all medicines when search term is empty
        console.log('Showing all medicines');
        setSaleMedicineSearchResults(medicines);
        showMedicineDropdown(itemIndex);
      }
    } else {
      console.log('No medicines available');
      setSaleMedicineSearchResults([]);
      hideMedicineDropdown(itemIndex);
    }
  };

  const handleSelectSaleMedicine = (medicine, index = 0) => {
    console.log('Selecting sale medicine:', medicine, 'for index:', index, 'current items:', saleForm.items.length);
    console.log('Medicine data:', {
      name: medicine.name,
      medicine_name: medicine.medicine_name,
      unit_price: medicine.unit_price,
      selling_price: medicine.selling_price
    });
    
    // Update the specific item in the sale form
    setSaleForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? {
          ...item,
          medicine: medicine.name || medicine.medicine_name || '',
          price: medicine.unit_price || medicine.selling_price || 0
        } : item
      )
    }));
    
    // Update the search input field
    setSaleMedicineSearch(medicine.name || medicine.medicine_name || '');
    hideMedicineDropdown(index);
    
    console.log('Sale form updated with medicine:', medicine.name || medicine.medicine_name);
    console.log('Updated saleForm:', {
      items: saleForm.items.map((item, i) => 
        i === index ? {
          ...item,
          medicine: medicine.name || medicine.medicine_name || '',
          price: medicine.unit_price || medicine.selling_price || 0
        } : item
      )
    });
  };

  const handleClickOutside = () => {
    setShowSearchResults(false);
  };

  // Action handlers
  const handleViewSale = (saleId) => {
    const sale = (recentSales || []).find(s => s.id === saleId);
    console.log('Selected sale:', sale);
    console.log('Sale items:', sale?.items);
    if (sale) {
      setSelectedSale(sale);
      setSaleDetailsDialog(true);
    }
  };

  const handlePrintInvoice = (saleId) => {
    const sale = (recentSales || []).find(s => s.id === saleId);
    if (sale) {
      // Create a printable invoice
      const itemsList = sale.items && sale.items.length > 0 
        ? sale.items.map(item => 
            `- ${item.medicine_name || 'Unknown Medicine'} (Qty: ${item.quantity}, Price: ₹${item.unit_price}, Total: ₹${item.total_price})`
          ).join('\n        ')
        : '- Various Medicines (Qty: 1, Price: ₹' + sale.total_amount + ', Total: ₹' + sale.total_amount + ')';
      
      const invoiceContent = `
        ==========================================
        PHARMACY INVOICE
        ==========================================
        Invoice Number: ${sale.invoice_number}
        Date: ${new Date(sale.sale_date).toLocaleDateString()}
        Customer: ${sale.customer_name}
        
        Items:
        ${itemsList}
        
        Payment Status: ${sale.payment_status}
        Payment Method: ${sale.payment_method || 'Cash'}
        
        ==========================================
        Thank you for your purchase!
        ==========================================
      `;
      
      // Open print dialog
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${sale.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .invoice { border: 1px solid #ccc; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .details { margin: 20px 0; }
              .total { font-weight: bold; font-size: 18px; }
              .footer { text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="invoice">
              <div class="header">
                <h2>PHARMACY INVOICE</h2>
                <p>Zenith ERP Pharmacy</p>
              </div>
              <div class="details">
                <p><strong>Invoice Number:</strong> ${sale.invoice_number}</p>
                <p><strong>Date:</strong> ${new Date(sale.sale_date).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${sale.customer_name}</p>
                <p><strong>Payment Status:</strong> ${sale.payment_status}</p>
                <p><strong>Payment Method:</strong> ${sale.payment_method || 'Cash'}</p>
              </div>
              <div class="items">
                <h3>Items:</h3>
                ${sale.items && sale.items.length > 0 
                  ? sale.items.map(item => 
                      `<p>- ${item.medicine_name || 'Unknown Medicine'} (Qty: ${item.quantity}, Price: ₹${item.unit_price}, Total: ₹${item.total_price})</p>`
                    ).join('')
                  : `<p>- Various Medicines (Qty: 1, Price: ₹${sale.total_amount}, Total: ₹${sale.total_amount})</p>`
                }
              </div>
              <div class="total">
                <p><strong>Total Amount: ₹${sale.total_amount}</strong></p>
              </div>
              <div class="footer">
                <p>Thank you for your purchase!</p>
                <p>Zenith ERP Pharmacy</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleReorder = (medicineId) => {
    const medicine = (lowStockMedicines || []).find(m => m.id === medicineId);
    if (medicine) {
      const reorderQuantity = Math.max(50, medicine.quantity_available * 2); // Order 2x current stock or minimum 50
      const reorderMessage = `Creating reorder for ${medicine.medicine_name} (Batch: ${medicine.batch_number})\n\nReorder Details:\n- Current Stock: ${medicine.quantity_available}\n- Suggested Order: ${reorderQuantity} units\n- Estimated Cost: ₹${(reorderQuantity * (medicine.unit_price || 10)).toFixed(2)}\n\nThis will create a purchase order for the supplier.`;
      
      if (window.confirm(reorderMessage)) {
        // TODO: Implement actual reorder API call
        alert(`Reorder created successfully for ${medicine.medicine_name}!`);
      }
    }
  };

  const handleViewMedicine = (medicineId) => {
    const medicine = (lowStockMedicines || []).find(m => m.id === medicineId);
    if (medicine) {
      const medicineDetails = `
Medicine Details:
================
Name: ${medicine.medicine_name}
Batch: ${medicine.batch_number}
Available Quantity: ${medicine.quantity_available}
Expiry Date: ${medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
Manufacturer: ${medicine.manufacturer || 'N/A'}
Category: ${medicine.category_name || 'N/A'}
Unit Price: ₹${medicine.unit_price || 'N/A'}
Location: ${medicine.location || 'N/A'}

Stock Status: ${medicine.quantity_available <= 10 ? 'LOW STOCK' : 'Adequate'}
      `;
      
      alert(medicineDetails);
    }
  };

  const handleDisposeMedicine = (medicineId) => {
    alert(`Disposing medicine with ID: ${medicineId}`);
    // TODO: Implement medicine disposal
  };

  // Prescription search function
  const handlePrescriptionSearch = (searchTerm) => {
    setPrescriptionSearch(searchTerm);
    
    if (searchTerm.length > 0) {
      const filtered = (prescriptions || []).filter(prescription => 
        (prescription.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.doctor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPrescriptionSearchResults(filtered);
      setShowPrescriptionSearchResults(true);
    } else {
      setPrescriptionSearchResults([]);
      setShowPrescriptionSearchResults(false);
    }
  };

  // Prescription medicine search function
  const handlePrescriptionMedicineSearch = (searchTerm) => {
    console.log('Prescription medicine search called with:', searchTerm);
    console.log('Available medicines for prescription:', medicines);
    
    setPrescriptionMedicineSearch(searchTerm);
    
    if (searchTerm.length > 0 && medicines && medicines.length > 0) {
      console.log('Starting prescription medicine search with term:', searchTerm);
      console.log('Total medicines available for prescription:', medicines.length);
      
      const filtered = medicines.filter(medicine => {
        const medicineName = String(medicine.name || medicine.medicine_name || '');
        const genericName = String(medicine.generic_name || '');
        const category = String(medicine.category?.name || medicine.category || '');
        const manufacturer = String(medicine.manufacturer || '');
        
        return medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               category.toLowerCase().includes(searchTerm.toLowerCase()) ||
               manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      console.log('Filtered prescription medicines:', filtered);
      setPrescriptionMedicineSearchResults(filtered);
      setShowPrescriptionMedicineSearchResults(true);
    } else {
      console.log('No prescription search term or no medicines available');
      setPrescriptionMedicineSearchResults([]);
      setShowPrescriptionMedicineSearchResults(false);
    }
  };

  const handleSelectPrescriptionMedicine = (medicine) => {
    console.log('Selecting prescription medicine:', medicine);
    console.log('Prescription medicine data:', {
      name: medicine.name,
      medicine_name: medicine.medicine_name,
      id: medicine.id
    });
    
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [{
        ...prev.medicines[0],
        medicine: medicine.name || medicine.medicine_name || '',
        medicine_id: medicine.id
      }]
    }));
    setPrescriptionMedicineSearch(medicine.name || medicine.medicine_name || '');
    setShowPrescriptionMedicineSearchResults(false);
    
    console.log('Prescription form updated with medicine:', medicine.name || medicine.medicine_name);
    console.log('Updated prescriptionForm:', {
      medicines: [{
        medicine: medicine.name || medicine.medicine_name || '',
        medicine_id: medicine.id
      }]
    });
  };

  const handleSelectPrescription = (prescription) => {
    setPrescriptionForm(prev => ({
      ...prev,
      customer: prescription.customer_name || '',
      doctor_name: prescription.doctor_name || '',
      diagnosis: prescription.diagnosis || '',
      notes: prescription.notes || ''
    }));
    setPrescriptionSearch(prescription.customer_name || '');
    setShowPrescriptionSearchResults(false);
  };

  // Scanning functions
  const handleScanBarcode = (mode) => {
    setScanMode(mode);
    setScanDialog(true);
    setScannedCode('');
    setScanResult(null);
  };

  const handleManualBarcodeInput = (code) => {
    setScannedCode(code);
    processScannedCode(code);
  };

  const processScannedCode = async (code) => {
    setScanning(true);
    console.log('Processing scanned code:', code);
    
    try {
      // First, try to search for existing medicine by barcode
      console.log('Searching for barcode:', code);
      const searchResponse = await api.get(`/pharmacy/medicines/search/?barcode=${encodeURIComponent(code)}`);
      console.log('Search response:', searchResponse.data);
      
      if (searchResponse.data.found) {
        const foundMedicine = searchResponse.data.medicine;
        console.log('Found existing medicine:', foundMedicine);
        
        setScanResult({
          message: `Found existing medicine: ${foundMedicine.name}`,
          medicine: foundMedicine
        });
        
        if (scanMode === 'add_medicine') {
          // Auto-fill medicine form with existing data
          setMedicineForm(prev => ({
            ...prev,
            name: foundMedicine.name || '',
            generic_name: foundMedicine.generic_name || '',
            category: foundMedicine.category_name || foundMedicine.category || '',
            manufacturer: foundMedicine.manufacturer || '',
            unit_price: foundMedicine.selling_price || '0',
            description: foundMedicine.description || '',
            barcode: foundMedicine.barcode || ''
          }));
          setAddMedicineDialog(true);
          setScanDialog(false);
        } else if (scanMode === 'sale') {
          // Auto-fill sale form
          setSaleForm(prev => ({
            ...prev,
            items: [{
              ...prev.items[0],
              medicine: foundMedicine.name || '',
              price: foundMedicine.selling_price || 0
            }]
          }));
          setNewSaleDialog(true);
          setScanDialog(false);
        }
      } else {
        // No existing medicine found, try to parse QR code data
    let medicineData = null;
    
    try {
      // Try to parse as JSON first
      medicineData = JSON.parse(code);
    } catch (e) {
      // If not JSON, try to parse as CSV or use as plain text
      if (code.includes(',')) {
        // CSV format: name,generic_name,category,manufacturer,price,description
        const parts = code.split(',');
        medicineData = {
          name: parts[0]?.trim() || '',
          generic_name: parts[1]?.trim() || '',
          category: parts[2]?.trim() || '',
          manufacturer: parts[3]?.trim() || '',
          unit_price: parts[4]?.trim() || '0',
          description: parts[5]?.trim() || ''
        };
      } else {
        // Plain text - treat as medicine name
        medicineData = {
          name: code.trim(),
          generic_name: '',
          category: '',
          manufacturer: '',
          unit_price: '0',
          description: ''
        };
      }
    }
    
    // Auto-fill medicine form with scanned data
    if (medicineData) {
      console.log('Auto-filling form with scanned data:', medicineData);
      setMedicineForm(prev => ({
        ...prev,
        name: medicineData.name || '',
        generic_name: medicineData.generic_name || '',
        category: medicineData.category || '',
        manufacturer: medicineData.manufacturer || '',
        unit_price: medicineData.unit_price || '0',
            description: medicineData.description || '',
            barcode: code // Use the scanned code as barcode
      }));
      
      setScanResult({ 
            message: `New medicine data loaded: ${medicineData.name}`,
        medicine_name: medicineData.name,
        unit_price: medicineData.unit_price
      });
      
      // Open the Add Medicine dialog
      setAddMedicineDialog(true);
      setScanDialog(false);
      } else {
        setScanResult({ error: 'Could not parse QR code data. Please enter manually.' });
      }
    }
    } catch (error) {
      console.error('Error searching for medicine:', error);
      setScanResult({ error: 'Error searching for medicine. Please try again.' });
    }
    
    setScanning(false);
  };

  const handleScanSuccess = (code) => {
    console.log('Scan successful:', code);
    setScannedCode(code);
    processScannedCode(code);
  };

  const handleScanError = (error) => {
    console.error('Scan error:', error);
    setScanResult({ error: 'Scan failed. Please try again.' });
    setScanning(false);
  };

  // Test function to verify scanner is working
  const testScanner = () => {
    console.log('Testing scanner...');
    if (videoRef.current && codeReader.current && cameraActive) {
      console.log('Scanner components available and camera active');
      setScanResult({ message: 'Scanner is ready! Try pointing at a QR code or barcode.' });
    } else if (videoRef.current && codeReader.current) {
      console.log('Scanner components available but camera not active');
      setScanResult({ message: 'Scanner components ready. Please start camera first.' });
    } else {
      console.log('Scanner components not available');
      setScanResult({ error: 'Scanner not ready. Please try starting camera again.' });
    }
  };

  // Camera scanner functions

  const handleScan = async () => {
    console.log('Starting scan process...');
    // Check if video element is available and playing
    if (videoRef.current && codeReader.current && !scannerInitialized) {
      try {
        console.log('Initializing ZXing scanner...');
        // Reset scanner first to prevent multiple initializations
        await codeReader.current.reset();
        
        await codeReader.current.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result, error) => {
            if (result) {
              console.log('Scanned:', result.text);
              handleScanSuccess(result.text);
              stopCamera();
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('Scan error:', error);
              handleError(error);
            }
          }
        );
        console.log('ZXing scanner initialized successfully');
        setScannerInitialized(true);
      } catch (error) {
        console.error('ZXing scanner failed, trying fallback method:', error);
        // Fallback: Just show camera is working, user can manually input
        setScanResult({ 
          message: 'Camera is active! Point at QR codes/barcodes and manually enter the code below.' 
        });
        setScannerInitialized(true);
      }
    } else {
      console.error('Cannot start scan - missing requirements or already initialized:', {
        videoRef: !!videoRef.current,
        codeReader: !!codeReader.current,
        scannerInitialized
      });
      if (scannerInitialized) {
        setScanResult({ message: 'Scanner is already active and ready to scan!' });
      } else {
        setScanResult({ error: 'Camera not ready. Please try again.' });
      }
    }
  };

  const handleError = (err) => {
    console.error('Scan error:', err);
    if (err.name === 'NotAllowedError') {
      setScanResult({ error: 'Camera access denied. Please allow camera permissions.' });
      setCameraActive(false);
    } else if (err.name === 'NotFoundError') {
      setScanResult({ error: 'No camera found on this device.' });
      setCameraActive(false);
    } else {
      setScanResult({ error: 'Camera error: ' + err.message });
      // Don't set cameraActive to false for other errors, let user try again
    }
  };

  const handleStartCamera = async () => {
    console.log('Starting camera...');
    setScanning(true);
    setScanResult(null);
    setScannerInitialized(false); // Reset scanner flag
    
    try {
      // Check if camera is available
      console.log('Checking for camera devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Found video devices:', videoDevices.length);
      
      if (videoDevices.length === 0) {
        setScanResult({ error: 'No camera found on this device.' });
        setScanning(false);
        return;
      }

      // Request camera permission
      console.log('Requesting camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera permission granted, setting up video element...');
      
      // Set camera active first to render video element
      setCameraActive(true);
      setScanning(false);
      
      // Wait for video element to be rendered, then set up stream
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Video element found, setting up stream...');
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true; // Required for autoplay
          
          // Use a one-time event listener to prevent multiple calls
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded, starting scan...');
            videoRef.current.play().then(() => {
              console.log('Video playing successfully, camera is active');
              // Start scanning after video is ready, but only if not already initialized
              if (!scannerInitialized) {
                setTimeout(() => {
                  handleScan();
                  setScannerInitialized(true);
                }, 1000); // Give more time for video to stabilize
              }
            }).catch(error => {
              console.error('Error playing video:', error);
              setScanResult({ error: 'Failed to start video stream. Please try again.' });
              setCameraActive(false);
            });
            // Remove the event listener to prevent multiple calls
            videoRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
          };
          
          videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
        } else {
          console.error('Video ref still not available after timeout');
          setScanResult({ error: 'Camera setup failed. Please try again.' });
          setCameraActive(false);
        }
      }, 100); // Small delay to ensure video element is rendered
      
    } catch (error) {
      console.error('Camera permission error:', error);
      if (error.name === 'NotAllowedError') {
        setScanResult({ error: 'Camera access denied. Please allow camera permissions and try again.' });
      } else if (error.name === 'NotFoundError') {
        setScanResult({ error: 'No camera found on this device.' });
      } else {
        setScanResult({ error: 'Camera error: ' + error.message });
      }
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    console.log('Stopping camera...');
    try {
      // Stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      // Reset scanner
      if (codeReader.current) {
        await codeReader.current.reset();
      }
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
    setCameraActive(false);
    setScannerInitialized(false);
  };

  // Add new functions for multi-item sales
  const addSaleItem = () => {
    const newItemIndex = saleForm.items.length;
    setSaleForm(prev => ({
      ...prev,
      items: [...prev.items, { medicine: '', quantity: 1, price: '' }]
    }));
    // Initialize dropdown state for new item
    setMedicineDropdownStates(prev => ({
      ...prev,
      [newItemIndex]: false
    }));
  };

  const removeSaleItem = (index) => {
    if (saleForm.items.length > 1) {
      setSaleForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      // Clean up dropdown state for removed item
      setMedicineDropdownStates(prev => {
        const newState = { ...prev };
        delete newState[index];
        // Reindex remaining items
        const reindexedState = {};
        Object.keys(newState).forEach(key => {
          const keyNum = parseInt(key);
          if (keyNum > index) {
            reindexedState[keyNum - 1] = newState[key];
          } else {
            reindexedState[keyNum] = newState[key];
          }
        });
        return reindexedState;
      });
    }
  };

  const updateSaleItem = (index, field, value) => {
    setSaleForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateItemTotal = (quantity, price) => {
    return (parseFloat(quantity) || 0) * (parseFloat(price) || 0);
  };

  const calculateSaleTotal = () => {
    return saleForm.items.reduce((total, item) => {
      return total + calculateItemTotal(item.quantity, item.price);
    }, 0);
  };

  // Individual dropdown management functions
  const showMedicineDropdown = (itemIndex) => {
    setMedicineDropdownStates(prev => ({
      ...prev,
      [itemIndex]: true
    }));
  };

  const hideMedicineDropdown = (itemIndex) => {
    setMedicineDropdownStates(prev => ({
      ...prev,
      [itemIndex]: false
    }));
  };

  const isMedicineDropdownVisible = (itemIndex) => {
    return medicineDropdownStates[itemIndex] || false;
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Pharmacy Dashboard
      </Typography>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MedicineIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.total_medicines || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Medicines
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.total_customers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    ₹{analytics?.total_sales_amount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3} >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SalesIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.total_sales || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sales Count
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {(lowStockMedicines.length > 0 || expiringMedicines.length > 0) && (
        <Box sx={{ mb: 3 }}>
          {lowStockMedicines.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {lowStockMedicines.length} medicines are running low on stock
            </Alert>
          )}
          {expiringMedicines.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {expiringMedicines.length} medicines are expiring soon
            </Alert>
          )}
        </Box>
      )}



      {/* Smart Dashboard */}
      <SmartDashboard userRole="pharmacist" analytics={analytics} />

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <EnhancedButton
              title="Add Medicine"
              description="Add new medicines to inventory with barcode scanning support"
              icon={<AddIcon />}
              onClick={handleAddMedicine}
              color="primary"
            />
            <EnhancedButton
              title="New Sale"
              description="Start a new sale with customer search and barcode scanning"
              icon={<AddIcon />}
              onClick={handleNewSale}
              color="success"
            />
            <EnhancedButton
              title="Add Prescription"
              description="Create prescription records for customers"
              icon={<AddIcon />}
              onClick={handleAddPrescription}
              color="secondary"
            />
            <EnhancedButton
              title="Add Customer"
              description="Register new customers with contact information"
              icon={<AddIcon />}
              onClick={handleAddCustomer}
              color="info"
            />
            <EnhancedButton
              title="Add Supplier"
              description="Add new medicine suppliers and vendors"
              icon={<AddIcon />}
              onClick={handleAddSupplier}
              color="warning"
            />
            <EnhancedButton
              title="Purchase Order"
              description="Create purchase orders for inventory restocking"
              icon={<AddIcon />}
              onClick={handleAddPurchaseOrder}
              color="error"
            />
            <EnhancedButton
              title="Add Batch"
              description="Add new medicine batches with expiry tracking"
              icon={<AddIcon />}
              onClick={handleAddBatch}
              color="primary"
              variant="outlined"
            />
            <EnhancedButton
              title="Add Category"
              description="Create new medicine categories for organization"
              icon={<AddIcon />}
              onClick={handleAddCategory}
              color="secondary"
              variant="outlined"
            />
            <EnhancedButton
              title="Stock Adjustment"
              description="Adjust inventory levels and stock counts"
              icon={<AddIcon />}
              onClick={handleAddStockAdjustment}
              color="warning"
              variant="outlined"
            />
            <EnhancedButton
              title="Manage Inventory"
              description="View and manage all inventory items"
              icon={<AddIcon />}
              onClick={handleManageInventory}
              color="info"
              variant="outlined"
            />
          </Box>
        </CardContent>
          </Card>

      {/* Recent Sales */}
      <Grid container spacing={3}>
        <Grid xs={12} md={6} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Sales
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(recentSales || []).map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.invoice_number}</TableCell>
                        <TableCell>{sale.customer_name}</TableCell>
                        <TableCell>₹{sale.total_amount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={sale.payment_status} 
                            color={getStatusColor(sale.payment_status)}
              size="small"
            />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleViewSale(sale?.id)}>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print Invoice">
                              <IconButton size="small" onClick={() => handlePrintInvoice(sale?.id)}>
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Medicines */}
        <Grid xs={12} md={6} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Medicines
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Batch</TableCell>
                      <TableCell>Available</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(lowStockMedicines || []).map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell>{medicine.medicine_name}</TableCell>
                        <TableCell>{medicine.batch_number}</TableCell>
                        <TableCell>
                          <Chip 
                            label={medicine.quantity_available} 
                            color={getQuantityColor(medicine.quantity_available)}
              size="small"
            />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleReorder(medicine?.id)}
                          >
                            Reorder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Prescriptions */}
        <Grid xs={12} md={6} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Prescriptions
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescriptions.slice(0, 5).map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell>{prescription.customer_name}</TableCell>
                        <TableCell>{prescription.doctor_name}</TableCell>
                        <TableCell>{new Date(prescription.prescription_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => alert(`Viewing prescription details for ${prescription.customer_name}`)}>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print Prescription">
                              <IconButton size="small" onClick={() => alert(`Printing prescription for ${prescription.customer_name}`)}>
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

      {/* Expiring Medicines */}
        <Grid xs={12} md={6} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expiring Medicines
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Batch</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(expiringMedicines || []).slice(0, 5).map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell>{medicine.medicine_name}</TableCell>
                        <TableCell>{medicine.batch_number}</TableCell>
                        <TableCell>
                          <Chip 
                            label={new Date(medicine.expiry_date).toLocaleDateString()} 
                            color="error"
                size="small"
              />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            color="error"
                            size="small"
                            onClick={() => handleDisposeMedicine(medicine?.id)}
                          >
                            Dispose
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
            </Card>
        </Grid>
      </Grid>

      {/* Add Medicine Dialog */}
      <Dialog open={addMedicineDialog} onClose={() => setAddMedicineDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Medicine</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Search Medicine"
                    variant="outlined"
                    placeholder="Search for existing medicine..."
                    value={medicineSearch}
                    onChange={(e) => handleMedicineSearch(e.target.value)}
                    onBlur={handleClickOutside}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<QrCodeIcon />}
                    onClick={() => handleScanBarcode('add_medicine')}
                    sx={{ height: 56 }}
                  >
                    Scan
                  </Button>
                </Box>
                {showSearchResults && (searchResults || []).length > 0 && (
                  <Paper 
                    sx={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      zIndex: 1000,
                      maxHeight: 200,
                      overflow: 'auto',
                      mt: 1
                    }}
                  >
                    <List>
                      {(searchResults || []).map((medicine) => (
                        <ListItem 
                          key={medicine.id}
                          onClick={() => handleSelectMedicine(medicine)}
                          sx={{ 
                            borderBottom: '1px solid #eee',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                            cursor: 'pointer'
                          }}
                        >
                          <ListItemText
                            primary={medicine.medicine_name}
                            secondary={`${medicine.generic_name || ''} - ${medicine.category?.name || medicine.category || ''} - ₹${medicine.unit_price || 0}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Generic Name"
                  variant="outlined"
                  placeholder="e.g., Acetaminophen"
                  value={medicineForm.generic_name}
                  onChange={(e) => handleMedicineFormChange('generic_name', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={medicineForm.category || ''}
                  onChange={(e) => handleMedicineFormChange('category', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Manufacturer"
                  variant="outlined"
                  placeholder="e.g., ABC Pharmaceuticals"
                  value={medicineForm.manufacturer}
                  onChange={(e) => handleMedicineFormChange('manufacturer', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Strength"
                  variant="outlined"
                  placeholder="e.g., 500mg"
                  value={medicineForm.strength}
                  onChange={(e) => handleMedicineFormChange('strength', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <FormControl fullWidth>
                  <InputLabel>Dosage Form</InputLabel>
                  <Select
                    value={medicineForm.dosage_form || ''}
                    onChange={(e) => handleMedicineFormChange('dosage_form', e.target.value)}
                    label="Dosage Form"
                  >
                    <MenuItem value="">Select Dosage Form</MenuItem>
                    <MenuItem value="TABLET">Tablet</MenuItem>
                    <MenuItem value="CAPSULE">Capsule</MenuItem>
                    <MenuItem value="SYRUP">Syrup</MenuItem>
                    <MenuItem value="INJECTION">Injection</MenuItem>
                    <MenuItem value="CREAM">Cream</MenuItem>
                    <MenuItem value="OINTMENT">Ointment</MenuItem>
                    <MenuItem value="DROPS">Drops</MenuItem>
                    <MenuItem value="INHALER">Inhaler</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6} >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={medicineForm.prescription_required || false}
                      onChange={(e) => handleMedicineFormChange('prescription_required', e.target.checked)}
                    />
                  }
                  label="Prescription Required"
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Unit Price"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  value={medicineForm.unit_price}
                  onChange={(e) => handleMedicineFormChange('unit_price', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Initial Stock"
                  variant="outlined"
                  type="number"
                  placeholder="0"
                  value={medicineForm.initial_stock}
                  onChange={(e) => handleMedicineFormChange('initial_stock', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Batch Number"
                  variant="outlined"
                  placeholder="e.g., BATCH001"
                  value={medicineForm.batch_number}
                  onChange={(e) => handleMedicineFormChange('batch_number', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Barcode"
                  variant="outlined"
                  placeholder="e.g., 1234567890123"
                  value={medicineForm.barcode}
                  onChange={(e) => handleMedicineFormChange('barcode', e.target.value)}
                  helperText="Product barcode for scanning"
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Expiry Date"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={medicineForm.expiry_date}
                  onChange={(e) => handleMedicineFormChange('expiry_date', e.target.value)}
                />
              </Grid>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Medicine description, side effects, etc."
                  value={medicineForm.description}
                  onChange={(e) => handleMedicineFormChange('description', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMedicineDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitMedicine}>
            Add Medicine
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Sale Dialog */}
              <Dialog 
          open={newSaleDialog} 
          onClose={() => setNewSaleDialog(false)} 
          maxWidth="md" 
          fullWidth
          disableEnforceFocus
          disableAutoFocus
          onClick={(e) => {
            // Close dropdowns when clicking on dialog backdrop
            if (e.target === e.currentTarget) {
              setShowSaleMedicineSearchResults(false);
              setShowCustomerSearchResults(false);
            }
          }}
        >
        <DialogTitle>Create New Sale</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Search Customer"
                    variant="outlined"
                    placeholder="Search for existing customer..."
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onBlur={() => setShowCustomerSearchResults(false)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {showCustomerSearchResults && (customerSearchResults || []).length > 0 && (
                    <Paper 
                      sx={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        right: 0, 
                        zIndex: 1000,
                        maxHeight: 200,
                        overflow: 'auto',
                        mt: 1
                      }}
                    >
                      <List>
                        {(customerSearchResults || []).map((customer) => (
                          <ListItem 
                            key={customer.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('ListItem clicked for customer:', customer);
                              alert('Customer clicked: ' + customer.name);
                              handleSelectCustomer(customer);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            sx={{ 
                              borderBottom: '1px solid #eee',
                              '&:hover': { backgroundColor: '#f5f5f5' },
                              cursor: 'pointer',
                              padding: '8px 16px'
                            }}
                          >
                            <ListItemText
                              primary={customer.name}
                              secondary={`${customer.phone || ''} - ${customer.email || ''}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Customer Phone"
                  variant="outlined"
                  placeholder="e.g., +91 98765 43210"
                  value={saleForm.phone}
                  onChange={(e) => handleSaleFormChange('phone', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Prescription Number"
                  variant="outlined"
                  placeholder="e.g., RX001"
                  value={saleForm.prescription_number}
                  onChange={(e) => handleSaleFormChange('prescription_number', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Doctor Name"
                  variant="outlined"
                  placeholder="e.g., Dr. Smith"
                  value={saleForm.doctor_name}
                  onChange={(e) => handleSaleFormChange('doctor_name', e.target.value)}
                />
              </Grid>
              <Grid xs={12} >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Medicine Items
                </Typography>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                                    {saleForm.items.map((item, itemIndex) => (
                    <Box key={itemIndex} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={12} md={4} >
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              fullWidth
                              label={`Medicine ${itemIndex + 1}`}
                              variant="outlined"
                              placeholder="Search for medicine..."
                              value={item.medicine || ''}
                              onChange={(e) => {
                                const searchTerm = e.target.value;
                                updateSaleItem(itemIndex, 'medicine', searchTerm);
                                handleSaleMedicineSearch(searchTerm, itemIndex);
                              }}
                              onFocus={() => {
                                setSaleMedicineSearch('');
                                // Show all medicines when focused
                                if (medicines && medicines.length > 0) {
                                  setSaleMedicineSearchResults(medicines);
                                  showMedicineDropdown(itemIndex);
                                }
                              }}
                              onBlur={() => {
                                // Delay hiding dropdown to allow clicking
                                setTimeout(() => hideMedicineDropdown(itemIndex), 200);
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <SearchIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<QrCodeIcon />}
                          onClick={() => handleScanBarcode('sale')}
                          sx={{ height: 56, mt: 1 }}
                        >
                          Scan
                        </Button>
                            {isMedicineDropdownVisible(itemIndex) && (
                          <Paper 
                            sx={{ 
                              position: 'absolute', 
                              top: '100%', 
                              left: 0, 
                              right: 0, 
                              zIndex: 1000,
                              maxHeight: 200,
                              overflow: 'auto',
                                  mt: 1,
                                  boxShadow: 3,
                                  border: '1px solid #ddd',
                                  backgroundColor: '#fff'
                            }}
                          >
                            <List>
                                  {(saleMedicineSearchResults || []).length > 0 ? (
                                    (saleMedicineSearchResults || []).map((medicine) => (
                                <ListItem 
                                  key={medicine.id}
                                                                          onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('ListItem clicked for medicine:', medicine, 'for item index:', itemIndex);
                                      handleSelectSaleMedicine(medicine, itemIndex);
                                    }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                  sx={{ 
                                    borderBottom: '1px solid #eee',
                                        '&:hover': { backgroundColor: '#e3f2fd' },
                                        cursor: 'pointer',
                                        padding: '8px 16px',
                                        '&:last-child': { borderBottom: 'none' }
                                  }}
                                >
                                  <ListItemText
                                          primary={medicine.name || medicine.medicine_name}
                                          secondary={`${medicine.generic_name || ''} - ${medicine.category?.name || medicine.category || ''} - ₹${medicine.unit_price || medicine.selling_price || 0}`}
                                  />
                                </ListItem>
                                    ))
                                  ) : (
                                    <ListItem>
                                      <ListItemText
                                        primary="No medicines available"
                                        secondary="Add some medicines first"
                                      />
                                    </ListItem>
                                  )}
                            </List>
                          </Paper>
                        )}
                      </Box>
                    </Grid>
                                                <Grid xs={12} md={2} >
                          <TextField
                            fullWidth
                            label="Quantity"
                            variant="outlined"
                            type="number"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => updateSaleItem(itemIndex, 'quantity', e.target.value)}
                          />
                        </Grid>
                        <Grid xs={12} md={2} >
                          <TextField
                            fullWidth
                            label="Price"
                            variant="outlined"
                            type="number"
                            placeholder="0.00"
                            InputProps={{
                              startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                            }}
                            value={item.price}
                            onChange={(e) => updateSaleItem(itemIndex, 'price', e.target.value)}
                          />
                        </Grid>
                        <Grid xs={12} md={2} >
                      <TextField
                        fullWidth
                        label="Total"
                        variant="outlined"
                        type="number"
                        placeholder="0.00"
                            value={calculateItemTotal(item.quantity, item.price).toFixed(2)}
                        InputProps={{
                          startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                        }}
                      />
                    </Grid>
                        <Grid xs={12} md={2} >
                                                    <Button 
                            variant="outlined" 
                            color="error" 
                            fullWidth
                            onClick={() => removeSaleItem(itemIndex)}
                            disabled={saleForm.items.length === 1}
                          >
                            Remove
                          </Button>
                    </Grid>
                  </Grid>
                    </Box>
                  ))}
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={addSaleItem}>
                    + Add Medicine
                  </Button>
                </Box>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Payment Method"
                  variant="outlined"
                  select
                  defaultValue="cash"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="netbanking">Net Banking</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Total Amount"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  value={calculateSaleTotal().toFixed(2)}
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSaleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitSale}>
            Create Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Prescription Dialog */}
      <Dialog open={addPrescriptionDialog} onClose={() => setAddPrescriptionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Prescription</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Search Customer"
                    variant="outlined"
                    placeholder="Search for existing customer..."
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onBlur={() => setShowCustomerSearchResults(false)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {showCustomerSearchResults && (customerSearchResults || []).length > 0 && (
                    <Paper 
                      sx={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        right: 0, 
                        zIndex: 1000,
                        maxHeight: 200,
                        overflow: 'auto',
                        mt: 1
                      }}
                    >
                      <List>
                        {(customerSearchResults || []).map((customer) => (
                          <ListItem 
                            key={customer.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('ListItem clicked for customer (prescription):', customer);
                              handleSelectCustomerForPrescription(customer);
                            }}
                            sx={{ 
                              borderBottom: '1px solid #eee',
                              '&:hover': { backgroundColor: '#f5f5f5' },
                              cursor: 'pointer'
                            }}
                          >
                            <ListItemText
                              primary={customer.name}
                              secondary={`${customer.phone || ''} - ${customer.email || ''}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Doctor Name"
                  variant="outlined"
                  placeholder="e.g., Dr. Smith"
                  value={prescriptionForm.doctor_name}
                  onChange={(e) => handlePrescriptionFormChange('doctor_name', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Prescription Date"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={prescriptionForm.prescription_date}
                  onChange={(e) => handlePrescriptionFormChange('prescription_date', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Diagnosis"
                  variant="outlined"
                  placeholder="e.g., Common cold, fever"
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => handlePrescriptionFormChange('diagnosis', e.target.value)}
                />
              </Grid>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Notes"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Additional notes about the prescription"
                  value={prescriptionForm.notes}
                  onChange={(e) => handlePrescriptionFormChange('notes', e.target.value)}
                />
              </Grid>
              <Grid xs={12} >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Prescribed Medicines
                </Typography>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid xs={12} md={3} >
                      <Box sx={{ position: 'relative' }}>
                        <TextField
                          fullWidth
                          label="Search Medicine"
                          variant="outlined"
                          placeholder="Search for medicine..."
                          value={prescriptionMedicineSearch}
                          onChange={(e) => {
                            console.log('Prescription medicine search input changed:', e.target.value);
                            handlePrescriptionMedicineSearch(e.target.value);
                          }}
                          onBlur={() => {
                            // Don't hide dropdown immediately to allow clicking
                            // setTimeout(() => setShowPrescriptionMedicineSearchResults(false), 200);
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                        {showPrescriptionMedicineSearchResults && (prescriptionMedicineSearchResults || []).length > 0 && (
                          <Paper 
                            sx={{ 
                              position: 'absolute', 
                              top: '100%', 
                              left: 0, 
                              right: 0, 
                              zIndex: 1000,
                              maxHeight: 200,
                              overflow: 'auto',
                              mt: 1,
                              boxShadow: 3,
                              border: '1px solid #ddd',
                              backgroundColor: '#fff'
                            }}
                          >
                            <List>
                              {(prescriptionMedicineSearchResults || []).length > 0 ? (
                                (prescriptionMedicineSearchResults || []).map((medicine) => (
                                <ListItem 
                                  key={medicine.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('ListItem clicked for prescription medicine:', medicine);
                                    handleSelectPrescriptionMedicine(medicine);
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  sx={{ 
                                    borderBottom: '1px solid #eee',
                                    '&:hover': { backgroundColor: '#e3f2fd' },
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    '&:last-child': { borderBottom: 'none' }
                                  }}
                                >
                                  <ListItemText
                                      primary={medicine.name || medicine.medicine_name}
                                      secondary={`${medicine.generic_name || ''} - ${medicine.category?.name || medicine.category || ''}`}
                                  />
                                </ListItem>
                                ))
                              ) : (
                                <ListItem>
                                  <ListItemText
                                    primary="No medicines found"
                                    secondary="Try a different search term"
                                  />
                                </ListItem>
                              )}
                            </List>
                          </Paper>
                        )}
                      </Box>
                    </Grid>
                    <Grid xs={12} md={2} >
                      <TextField
                        fullWidth
                        label="Dosage"
                        variant="outlined"
                        placeholder="e.g., 1 tablet"
                        value={prescriptionForm.medicines[0].dosage}
                        onChange={(e) => handlePrescriptionFormChange('medicines', [{ ...prescriptionForm.medicines[0], dosage: e.target.value }])}
                      />
                    </Grid>
                    <Grid xs={12} md={2} >
                      <TextField
                        fullWidth
                        label="Frequency"
                        variant="outlined"
                        placeholder="e.g., Twice daily"
                        value={prescriptionForm.medicines[0].frequency}
                        onChange={(e) => handlePrescriptionFormChange('medicines', [{ ...prescriptionForm.medicines[0], frequency: e.target.value }])}
                      />
                    </Grid>
                    <Grid xs={12} md={2} >
                      <TextField
                        fullWidth
                        label="Duration"
                        variant="outlined"
                        placeholder="e.g., 7 days"
                        value={prescriptionForm.medicines[0].duration}
                        onChange={(e) => handlePrescriptionFormChange('medicines', [{ ...prescriptionForm.medicines[0], duration: e.target.value }])}
                      />
                    </Grid>
                    <Grid xs={12} md={2} >
                      <TextField
                        fullWidth
                        label="Quantity"
                        variant="outlined"
                        type="number"
                        placeholder="10"
                        value={prescriptionForm.medicines[0].quantity}
                        onChange={(e) => handlePrescriptionFormChange('medicines', [{ ...prescriptionForm.medicines[0], quantity: e.target.value }])}
                      />
                    </Grid>
                    <Grid xs={12} md={1} >
                      <Button variant="outlined" color="error" fullWidth>
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    + Add Medicine
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPrescriptionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitPrescription}>
            Add Prescription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addCustomerDialog} onClose={() => setAddCustomerDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Customer Name"
                  variant="outlined"
                  placeholder="e.g., John Doe"
                  value={customerForm.name}
                  onChange={(e) => handleCustomerFormChange('name', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  placeholder="e.g., +91 98765 43210"
                  value={customerForm.phone}
                  onChange={(e) => handleCustomerFormChange('phone', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  placeholder="e.g., john.doe@email.com"
                  value={customerForm.email}
                  onChange={(e) => handleCustomerFormChange('email', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Date of Birth"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={customerForm.date_of_birth}
                  onChange={(e) => handleCustomerFormChange('date_of_birth', e.target.value)}
                />
              </Grid>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Address"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Enter complete address"
                  value={customerForm.address}
                  onChange={(e) => handleCustomerFormChange('address', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Allergies"
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="List any known allergies"
                  value={customerForm.allergies}
                  onChange={(e) => handleCustomerFormChange('allergies', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Medical History"
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="Any relevant medical history"
                  value={customerForm.medical_history}
                  onChange={(e) => handleCustomerFormChange('medical_history', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCustomerDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitCustomer}>
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addCustomerDialog} onClose={() => setAddCustomerDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Customer Name"
                  variant="outlined"
                  placeholder="e.g., John Doe"
                  value={customerForm.name}
                  onChange={(e) => handleCustomerFormChange('name', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  placeholder="e.g., +91 98765 43210"
                  value={customerForm.phone}
                  onChange={(e) => handleCustomerFormChange('phone', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  placeholder="e.g., john.doe@email.com"
                  value={customerForm.email}
                  onChange={(e) => handleCustomerFormChange('email', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Date of Birth"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={customerForm.date_of_birth}
                  onChange={(e) => handleCustomerFormChange('date_of_birth', e.target.value)}
                />
              </Grid>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Address"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Enter complete address"
                  value={customerForm.address}
                  onChange={(e) => handleCustomerFormChange('address', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Allergies"
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="List any known allergies"
                  value={customerForm.allergies}
                  onChange={(e) => handleCustomerFormChange('allergies', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Medical History"
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="Any relevant medical history"
                  value={customerForm.medical_history}
                  onChange={(e) => handleCustomerFormChange('medical_history', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCustomerDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitCustomer}>
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sale Details Dialog */}
      <Dialog open={saleDetailsDialog} onClose={() => setSaleDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sale Details</DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={12} md={6} >
                  <Typography variant="subtitle2" color="text.secondary">Invoice Number</Typography>
                  <Typography variant="h6">{selectedSale.invoice_number}</Typography>
                </Grid>
                <Grid xs={12} md={6} >
                  <Typography variant="subtitle2" color="text.secondary">Sale Date</Typography>
                  <Typography variant="h6">{new Date(selectedSale.sale_date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid xs={12} md={6} >
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="h6">{selectedSale.customer_name}</Typography>
                </Grid>
                <Grid xs={12} md={6} >
                  <Typography variant="subtitle2" color="text.secondary">Payment Status</Typography>
                  <Chip 
                    label={selectedSale.payment_status} 
                    color={getStatusColor(selectedSale.payment_status)}
                    size="small"
                  />
                </Grid>
                <Grid xs={12} md={6} >
                  <Typography variant="subtitle2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="h6">{selectedSale.payment_method || 'Cash'}</Typography>
                </Grid>
                <Grid xs={12} md={6} >
                  <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="h6" color="success.main">₹{selectedSale.total_amount}</Typography>
                </Grid>
                <Grid xs={12} >
                  <Typography variant="subtitle2" color="text.secondary">Sale Items</Typography>
                  <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Medicine</TableCell>
                          <TableCell>Batch</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Unit Price</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSale.items && selectedSale.items.length > 0 ? (
                          selectedSale.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.medicine_name || 'Unknown Medicine'}</TableCell>
                              <TableCell>{item.medicine_batch?.batch_number || 'N/A'}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>₹{item.unit_price}</TableCell>
                              <TableCell>₹{item.total_price}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No items found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaleDetailsDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (selectedSale) {
                handlePrintInvoice(selectedSale.id);
              }
            }}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scan Dialog */}
      <Dialog open={scanDialog} onClose={() => {
        stopCamera();
        setScanDialog(false);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {scanMode === 'add_medicine' ? 'Scan Medicine Barcode' : 'Scan Medicine for Sale'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} >
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {scanMode === 'add_medicine' 
                    ? 'Scan the medicine barcode to auto-fill the Add Medicine form'
                    : 'Scan the medicine barcode to add it to the sale'
                  }
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Tips:</strong>
                    <br />• Make sure your browser has camera permissions
                    <br />• Point the camera at QR codes or barcodes
                    <br />• If camera doesn't work, try manual input below
                    <br />• Works best in good lighting conditions
                  </Typography>
                </Alert>
              </Grid>
              
              {/* Camera/Scanner Area */}
              <Grid xs={12} >
                <Box 
                  sx={{ 
                    border: 2, 
                    borderColor: 'primary.main', 
                    borderRadius: 2, 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: '#f5f5f5',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {scanning ? (
                    <CircularProgress size={60} />
                  ) : cameraActive ? (
                    <Box sx={{ width: '100%', textAlign: 'center' }}>
                      <video
                        ref={videoRef}
                        style={{ 
                          width: '100%', 
                          maxWidth: '400px', 
                          height: 'auto',
                          border: '2px solid #1976d2',
                          borderRadius: '8px'
                        }}
                        autoPlay
                        playsInline
                        muted
                      />
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={stopCamera}
                        sx={{ mt: 2 }}
                      >
                        Stop Camera
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <QrCodeDisplayIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" color="primary">
                        Camera Scanner
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        Click "Start Camera" to scan QR codes and barcodes
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleStartCamera}
                        startIcon={<QrCodeIcon />}
                      >
                        Start Camera
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="secondary"
                        onClick={testScanner}
                        sx={{ mt: 1 }}
                      >
                        Test Scanner
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>

              {/* Manual Input */}
              <Grid xs={12} >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Or enter barcode manually:
                </Typography>
                <TextField
                  fullWidth
                  label="Barcode/Medicine Name"
                  variant="outlined"
                  placeholder="Enter barcode or medicine name"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualBarcodeInput(scannedCode);
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          variant="contained" 
                          onClick={() => handleManualBarcodeInput(scannedCode)}
                          disabled={!scannedCode.trim()}
                        >
                          Search
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* File Upload Option */}
              <Grid xs={12} >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Or upload QR code image:
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<QrCodeIcon />}
                >
                  Upload QR Code Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // For now, just show a message
                        setScanResult({ error: 'File upload scanning not implemented yet. Please use camera or manual input.' });
                      }
                    }}
                  />
                </Button>
              </Grid>

              {/* Scan Result */}
              {scanResult && (
                <Grid xs={12} >
                  {scanResult.error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {scanResult.error}
                    </Alert>
                  ) : scanResult.message ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {scanResult.message}
                    </Alert>
                  ) : (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Found: {scanResult.medicine_name} - ₹{scanResult.unit_price}
                    </Alert>
                  )}
                </Grid>
              )}

              {/* Demo Barcodes */}
              <Grid xs={12} >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Demo - Try these QR code formats:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip
                    label="JSON Format"
                    onClick={() => handleManualBarcodeInput('{"name":"Paracetamol 500mg","generic_name":"Acetaminophen","category":"Pain Relief","manufacturer":"ABC Pharma","unit_price":"10.50","description":"Fever and pain relief"}')}
                    variant="outlined"
                    clickable
                    color="primary"
                  />
                  <Chip
                    label="CSV Format"
                    onClick={() => handleManualBarcodeInput('Amoxicillin 250mg,Amoxicillin,Antibiotic,XYZ Pharma,15.00,Antibiotic for bacterial infections')}
                    variant="outlined"
                    clickable
                    color="secondary"
                  />
                  <Chip
                    label="Plain Text"
                    onClick={() => handleManualBarcodeInput('Omeprazole 20mg')}
                    variant="outlined"
                    clickable
                    color="success"
                  />
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Or try existing medicine names:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {(medicines || []).slice(0, 3).map((medicine) => (
                    <Chip
                      key={medicine.id}
                      label={medicine.medicine_name}
                      onClick={() => handleManualBarcodeInput(medicine.medicine_name)}
                      variant="outlined"
                      clickable
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleManualBarcodeInput(scannedCode)}
            disabled={!scannedCode.trim()}
          >
            Process Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={addSupplierDialog} onClose={() => setAddSupplierDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Supplier</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Supplier Name *"
                  variant="outlined"
                  placeholder="e.g., ABC Pharmaceuticals"
                  value={supplierForm.name}
                  onChange={(e) => handleSupplierFormChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Contact Person *"
                  variant="outlined"
                  placeholder="e.g., John Smith"
                  value={supplierForm.contact_person}
                  onChange={(e) => handleSupplierFormChange('contact_person', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Phone Number *"
                  variant="outlined"
                  placeholder="e.g., +91 98765 43210"
                  value={supplierForm.phone}
                  onChange={(e) => handleSupplierFormChange('phone', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  placeholder="e.g., contact@abcpharma.com"
                  value={supplierForm.email}
                  onChange={(e) => handleSupplierFormChange('email', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="GST Number"
                  variant="outlined"
                  placeholder="e.g., 27ABCDE1234F1Z5"
                  value={supplierForm.gst_number}
                  onChange={(e) => handleSupplierFormChange('gst_number', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Payment Terms"
                  variant="outlined"
                  placeholder="e.g., Net 30"
                  value={supplierForm.payment_terms}
                  onChange={(e) => handleSupplierFormChange('payment_terms', e.target.value)}
                />
              </Grid>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Address *"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Enter complete address"
                  value={supplierForm.address}
                  onChange={(e) => handleSupplierFormChange('address', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSupplierDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitSupplier}>
            Add Supplier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Purchase Order Dialog */}
      <Dialog open={addPurchaseOrderDialog} onClose={() => setAddPurchaseOrderDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create Purchase Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="PO Number *"
                  variant="outlined"
                  placeholder="e.g., PO-2024-001"
                  value={purchaseOrderForm.po_number}
                  onChange={(e) => handlePurchaseOrderFormChange('po_number', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Supplier *"
                  variant="outlined"
                  select
                  value={purchaseOrderForm.supplier}
                  onChange={(e) => handlePurchaseOrderFormChange('supplier', e.target.value)}
                  required
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Order Date *"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={purchaseOrderForm.order_date}
                  onChange={(e) => handlePurchaseOrderFormChange('order_date', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Expected Delivery *"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={purchaseOrderForm.expected_delivery}
                  onChange={(e) => handlePurchaseOrderFormChange('expected_delivery', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Notes"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Additional notes about the purchase order"
                  value={purchaseOrderForm.notes}
                  onChange={(e) => handlePurchaseOrderFormChange('notes', e.target.value)}
                />
              </Grid>
              <Grid xs={12} >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Order Items
                </Typography>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid xs={12} md={4} >
                      <TextField
                        fullWidth
                        label="Medicine"
                        variant="outlined"
                        select
                        value={purchaseOrderForm.items[0].medicine}
                        onChange={(e) => handlePurchaseOrderFormChange('items', [{ ...purchaseOrderForm.items[0], medicine: e.target.value }])}
                      >
                        {medicines.map((medicine) => (
                          <MenuItem key={medicine.id} value={medicine.id}>
                            {medicine.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid xs={12} md={4} >
                      <TextField
                        fullWidth
                        label="Quantity"
                        variant="outlined"
                        type="number"
                        placeholder="100"
                        value={purchaseOrderForm.items[0].quantity}
                        onChange={(e) => handlePurchaseOrderFormChange('items', [{ ...purchaseOrderForm.items[0], quantity: e.target.value }])}
                      />
                    </Grid>
                    <Grid xs={12} md={4} >
                      <TextField
                        fullWidth
                        label="Unit Cost"
                        variant="outlined"
                        type="number"
                        placeholder="0.00"
                        InputProps={{
                          startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                        }}
                        value={purchaseOrderForm.items[0].unit_cost}
                        onChange={(e) => handlePurchaseOrderFormChange('items', [{ ...purchaseOrderForm.items[0], unit_cost: e.target.value }])}
                      />
                    </Grid>
                  </Grid>
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    + Add Item
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPurchaseOrderDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitPurchaseOrder}>
            Create Purchase Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Stock Adjustment Dialog */}
      <Dialog open={addStockAdjustmentDialog} onClose={() => setAddStockAdjustmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Stock Adjustment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Medicine Batch *"
                  variant="outlined"
                  select
                  value={stockAdjustmentForm.medicine_batch}
                  onChange={(e) => handleStockAdjustmentFormChange('medicine_batch', e.target.value)}
                  required
                >
                  {batches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.medicine_name} - Batch {batch.batch_number}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Adjustment Type"
                  variant="outlined"
                  select
                  value={stockAdjustmentForm.adjustment_type}
                  onChange={(e) => handleStockAdjustmentFormChange('adjustment_type', e.target.value)}
                >
                  <MenuItem value="ADD">Add Stock</MenuItem>
                  <MenuItem value="REMOVE">Remove Stock</MenuItem>
                  <MenuItem value="DAMAGED">Damaged</MenuItem>
                  <MenuItem value="EXPIRED">Expired</MenuItem>
                  <MenuItem value="THEFT">Theft</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Quantity *"
                  variant="outlined"
                  type="number"
                  placeholder="0"
                  value={stockAdjustmentForm.quantity}
                  onChange={(e) => handleStockAdjustmentFormChange('quantity', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Reason *"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Reason for stock adjustment"
                  value={stockAdjustmentForm.reason}
                  onChange={(e) => handleStockAdjustmentFormChange('reason', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStockAdjustmentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitStockAdjustment}>
            Add Adjustment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Batch Dialog */}
      <Dialog open={addBatchDialog} onClose={() => setAddBatchDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Batch</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Medicine *"
                  variant="outlined"
                  select
                  value={batchForm.medicine}
                  onChange={(e) => handleBatchFormChange('medicine', e.target.value)}
                  required
                >
                  {medicines.map((medicine) => (
                    <MenuItem key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Batch Number *"
                  variant="outlined"
                  placeholder="e.g., BATCH001"
                  value={batchForm.batch_number}
                  onChange={(e) => handleBatchFormChange('batch_number', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Supplier"
                  variant="outlined"
                  select
                  value={batchForm.supplier}
                  onChange={(e) => handleBatchFormChange('supplier', e.target.value)}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Manufacturing Date"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={batchForm.manufacturing_date}
                  onChange={(e) => handleBatchFormChange('manufacturing_date', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Expiry Date"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={batchForm.expiry_date}
                  onChange={(e) => handleBatchFormChange('expiry_date', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Cost Price"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  value={batchForm.cost_price}
                  onChange={(e) => handleBatchFormChange('cost_price', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Selling Price"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  value={batchForm.selling_price}
                  onChange={(e) => handleBatchFormChange('selling_price', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="MRP"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  value={batchForm.mrp}
                  onChange={(e) => handleBatchFormChange('mrp', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Quantity Received"
                  variant="outlined"
                  type="number"
                  placeholder="0"
                  value={batchForm.quantity_received}
                  onChange={(e) => handleBatchFormChange('quantity_received', e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} >
                <TextField
                  fullWidth
                  label="Location"
                  variant="outlined"
                  placeholder="e.g., Shelf A1"
                  value={batchForm.location}
                  onChange={(e) => handleBatchFormChange('location', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBatchDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitBatch}>
            Add Batch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialog} onClose={() => setAddCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Category Name *"
                  variant="outlined"
                  placeholder="e.g., Pain Relief"
                  value={categoryForm.name}
                  onChange={(e) => handleCategoryFormChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid xs={12} >
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Category description"
                  value={categoryForm.description}
                  onChange={(e) => handleCategoryFormChange('description', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitCategory}>
            Add Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Inventory Dialog */}
      <Dialog open={manageInventoryDialog} onClose={() => setManageInventoryDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Manage Inventory</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid xs={12} md={6} >
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Stock Overview
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medicine</TableCell>
                            <TableCell>Batch</TableCell>
                            <TableCell>Available</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(batches || []).slice(0, 5).map((batch) => (
                            <TableRow key={batch.id}>
                              <TableCell>{batch.medicine_name}</TableCell>
                              <TableCell>{batch.batch_number}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={batch.quantity_available} 
                                  color={getQuantityColor(batch.quantity_available)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  onClick={() => handleAddStockAdjustment()}
                                >
                                  Adjust
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={12} md={6} >
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Adjustments
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(stockAdjustments || []).slice(0, 5).map((adjustment) => (
                            <TableRow key={adjustment.id}>
                              <TableCell>
                                <Chip 
                                  label={adjustment.adjustment_type} 
                                  color={adjustment.adjustment_type === 'ADD' ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{adjustment.quantity}</TableCell>
                              <TableCell>{new Date(adjustment.adjustment_date).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageInventoryDialog(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setManageInventoryDialog(false);
            setAddStockAdjustmentDialog(true);
          }}>
            Add Adjustment
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default PharmacyDashboard; 