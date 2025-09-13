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
  ShoppingCart as ProductIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as WarehouseIcon,
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
import api, { 
  createRetailProduct, 
  createRetailCustomer, 
  createRetailSale,
  fetchRetailProducts,
  fetchRetailCustomers,
  fetchRetailSales,
  fetchRetailStaffAttendance,
  checkInRetailStaff,
  checkOutRetailStaff
} from '../../services/api';

// Version: 1.0.1 - Added QR/Barcode scanning functionality
const RetailDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Attendance states
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Dialog states
  const [addProductDialog, setAddProductDialog] = useState(false);
  const [newSaleDialog, setNewSaleDialog] = useState(false);
  const [stockTransferDialog, setStockTransferDialog] = useState(false);
  const [addCustomerDialog, setAddCustomerDialog] = useState(false);
  const [saleDetailsDialog, setSaleDetailsDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    brand: '',
    unit_of_measure: 'PCS',
    cost_price: '',
    selling_price: '',
    mrp: '',
    reorder_level: 10,
    max_stock_level: 100,
    is_active: true,
    initial_stock: '',
    description: '',
    manufacturer: '',
    image: null
  });
  
  const [saleForm, setSaleForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    payment_method: 'CASH',
    items: [{ product: '', quantity: 1, price: '' }]
  });
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gst_number: ''
  });
  
  const [transferForm, setTransferForm] = useState({
    from_warehouse: '',
    to_warehouse: '',
    product: '',
    quantity: '',
    reason: ''
  });

  // Search states
  const [productSearch, setProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [showProductSearchResults, setShowProductSearchResults] = useState(false);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerSearchResults, setShowCustomerSearchResults] = useState(false);

  // Scanning state
  const [scanDialog, setScanDialog] = useState(false);
  const [scanMode, setScanMode] = useState(''); // 'add_product' or 'sale'
  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    fetchDashboardData();
    fetchTodayAttendance();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching retail dashboard data...');

      // Fetch analytics
      const analyticsResponse = await api.get('/retail/analytics/');
      setAnalytics(analyticsResponse.data);

      // Fetch recent sales using helper function
      const salesResponse = await fetchRetailSales({ limit: 5 });
      setRecentSales(salesResponse || []);

      // Fetch low stock products
      const lowStockResponse = await api.get('/retail/inventory/?quantity_available__lte=10');
      setLowStockProducts(lowStockResponse.data.results || []);

      // Fetch recent transfers
      const transfersResponse = await api.get('/retail/stock-transfers/?limit=5');
      setRecentTransfers(transfersResponse.data.results || []);

      // Fetch all products for search using helper function
      const productsResponse = await fetchRetailProducts();
      console.log('Products response:', productsResponse);
      setProducts(productsResponse || []);

      // Fetch all customers for search using helper function
      const customersResponse = await fetchRetailCustomers();
      console.log('Customers response:', customersResponse);
      setCustomers(customersResponse || []);

      // Fetch categories for product form
      const categoriesResponse = await api.get('/retail/categories/');
      setCategories(categoriesResponse.data.results || []);

      console.log('Retail dashboard data fetched successfully');

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'PENDING': return 'info';
      default: return 'default';
    }
  };

  const getQuantityColor = (quantity) => {
    return quantity <= 5 ? 'error' : 'warning';
  };

  // Quick Actions handlers
  const handleAddProduct = () => {
    setAddProductDialog(true);
  };

  const handleNewSale = () => {
    setNewSaleDialog(true);
  };

  const handleStockTransfer = () => {
    setStockTransferDialog(true);
  };

  const handleAddCustomer = () => {
    setAddCustomerDialog(true);
  };

  // Attendance functions
  const fetchTodayAttendance = async () => {
    try {
      const res = await fetchRetailStaffAttendance();
      const today = new Date().toISOString().slice(0, 10);
      const record = Array.isArray(res) ? res.find(r => r.date === today) : null;
      setTodayAttendance(record);
    } catch {
      setTodayAttendance(null);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      await checkInRetailStaff();
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
      await checkOutRetailStaff();
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
  const handleProductFormChange = (field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaleFormChange = (field, value) => {
    setSaleForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTransferFormChange = (field, value) => {
    setTransferForm(prev => ({ ...prev, [field]: value }));
  };

  // Submit handlers
  const handleSubmitProduct = async () => {
    try {
      console.log('Submitting product:', productForm);
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('sku', productForm.sku);
      formData.append('category', productForm.category);
      formData.append('brand', productForm.brand);
      formData.append('unit_of_measure', productForm.unit_of_measure);
      formData.append('cost_price', productForm.cost_price);
      formData.append('selling_price', productForm.selling_price);
      formData.append('mrp', productForm.mrp);
      formData.append('reorder_level', productForm.reorder_level);
      formData.append('max_stock_level', productForm.max_stock_level);
      formData.append('is_active', productForm.is_active);
      formData.append('description', productForm.description);
      formData.append('manufacturer', productForm.manufacturer);
      
      // Add image if selected
      if (productForm.image) {
        formData.append('image', productForm.image);
      }
      
      // Make API call to create product using helper function
      const response = await createRetailProduct(formData);
      
      setSnackbar({ open: true, message: `Product "${productForm.name}" added successfully!`, severity: 'success' });
      setAddProductDialog(false);
      setProductForm({
        name: '',
        sku: '',
        category: '',
        brand: '',
        unit_of_measure: 'PCS',
        cost_price: '',
        selling_price: '',
        mrp: '',
        reorder_level: 10,
        max_stock_level: 100,
        is_active: true,
        initial_stock: '',
        description: '',
        manufacturer: '',
        image: null
      });
      
      // Refresh dashboard data to include the new product
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating product:', error);
      let errorMessage = 'Failed to create product.';
      if (error.response?.data) {
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitSale = async () => {
    try {
    console.log('Submitting sale:', saleForm);
      
      // Prepare sale data
      const saleData = {
        customer_name: saleForm.customer_name,
        phone: saleForm.phone,
        email: saleForm.email,
        payment_method: saleForm.payment_method,
        items: saleForm.items.filter(item => item.product && item.quantity > 0)
      };
      
      // Make API call to create sale using helper function
      const response = await createRetailSale(saleData);
      
      setSnackbar({ open: true, message: `Sale for customer "${saleForm.customer_name}" created successfully!`, severity: 'success' });
    setNewSaleDialog(false);
    setSaleForm({
      customer_name: '',
      phone: '',
      email: '',
      payment_method: 'CASH',
      items: [{ product: '', quantity: 1, price: '' }]
    });
      
      // Refresh dashboard data to show the new sale
      await fetchDashboardData();
      
    } catch (error) {
      console.error('Error creating sale:', error);
      let errorMessage = 'Failed to create sale.';
      if (error.response?.data) {
        errorMessage += ' ' + JSON.stringify(error.response.data);
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSubmitCustomer = async () => {
    try {
    console.log('Submitting customer:', customerForm);
      
      // Make API call to create customer using helper function
      const response = await createRetailCustomer(customerForm);
      
      setSnackbar({ open: true, message: `Customer "${customerForm.name}" added successfully!`, severity: 'success' });
    setAddCustomerDialog(false);
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      gst_number: ''
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

  const handleSubmitTransfer = () => {
    console.log('Submitting transfer:', transferForm);
    alert(`Stock transfer created successfully!`);
    setStockTransferDialog(false);
    setTransferForm({
      from_warehouse: '',
      to_warehouse: '',
      product: '',
      quantity: '',
      reason: ''
    });
  };

  // Search functions
  const handleProductSearch = (searchTerm) => {
    console.log('Product search called with:', searchTerm);
    console.log('Available products:', products);
    console.log('Products type:', typeof products);
    console.log('Products length:', products ? products.length : 'null');
    
    setProductSearch(searchTerm);
    
    if (searchTerm.length > 0) {
      // Filter products from the dashboard data
      const filtered = (products || []).filter(product => {
        const productName = String(product.name || '');
        const category = String(product.category?.name || product.category || '');
        const manufacturer = String(product.manufacturer || '');
        
        console.log('Product:', product.name, 'matches:', {
          productName: productName.toLowerCase().includes(searchTerm.toLowerCase()),
          category: category.toLowerCase().includes(searchTerm.toLowerCase()),
          manufacturer: manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
        });
        
        return productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               category.toLowerCase().includes(searchTerm.toLowerCase()) ||
               manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      console.log('Filtered products:', filtered);
      setProductSearchResults(filtered);
      setShowProductSearchResults(true);
    } else {
      setProductSearchResults([]);
      setShowProductSearchResults(false);
    }
  };

  const handleSelectProduct = (product) => {
    console.log('Product selected:', product);
    setProductForm(prev => {
      const updated = {
      ...prev,
      name: product.name || '',
      category: product.category?.name || product.category || '',
      cost_price: product.cost_price || '',
      selling_price: product.selling_price || '',
      description: product.description || '',
      manufacturer: product.manufacturer || ''
      };
      console.log('Updated product form:', updated);
      return updated;
    });
    setProductSearch(product.name || '');
    setShowProductSearchResults(false);
  };

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

  const processScannedCode = (code) => {
    setScanning(true);
    
    // Simulate API call to find product by barcode
    setTimeout(() => {
      const foundProduct = (products || []).find(product => 
        product.barcode === code || 
        (product.name && product.name.toLowerCase().includes(code.toLowerCase()))
      );
      
      if (foundProduct) {
        setScanResult(foundProduct);
        if (scanMode === 'add_product') {
          // Auto-fill product form
          setProductForm(prev => ({
            ...prev,
            name: foundProduct.name || '',
            category: foundProduct.category?.name || foundProduct.category || '',
            cost_price: foundProduct.cost_price || '',
            selling_price: foundProduct.selling_price || '',
            description: foundProduct.description || '',
            manufacturer: foundProduct.manufacturer || ''
          }));
          setAddProductDialog(true);
          setScanDialog(false);
        } else if (scanMode === 'sale') {
          // Auto-fill sale form
          setSaleForm(prev => ({
            ...prev,
            items: [{
              ...prev.items[0],
              product: foundProduct.name || '',
              price: foundProduct.selling_price || 0
            }]
          }));
          setNewSaleDialog(true);
          setScanDialog(false);
        }
      } else {
        setScanResult({ error: 'Product not found' });
      }
      setScanning(false);
    }, 1000);
  };

  const handleScanSuccess = (code) => {
    setScannedCode(code);
    processScannedCode(code);
  };

  const handleScanError = (error) => {
    console.error('Scan error:', error);
    setScanResult({ error: 'Scan failed. Please try again.' });
    setScanning(false);
  };

  // Camera scanner functions

  const handleScan = async () => {
    console.log('Starting scan process...');
    if (cameraActive && videoRef.current && codeReader.current) {
      try {
        console.log('Initializing ZXing scanner...');
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
      } catch (error) {
        console.error('Camera initialization error:', error);
        handleError(error);
      }
    } else {
      console.error('Cannot start scan - missing requirements:', {
        cameraActive,
        videoRef: !!videoRef.current,
        codeReader: !!codeReader.current
      });
      setScanResult({ error: 'Camera not ready. Please try again.' });
    }
  };

  const handleError = (err) => {
    console.error('Scan error:', err);
    if (err.name === 'NotAllowedError') {
      setScanResult({ error: 'Camera access denied. Please allow camera permissions.' });
    } else if (err.name === 'NotFoundError') {
      setScanResult({ error: 'No camera found on this device.' });
    } else {
      setScanResult({ error: 'Camera error: ' + err.message });
    }
    setCameraActive(false);
  };

  const handleStartCamera = async () => {
    console.log('Starting camera...');
    setScanning(true);
    setScanResult(null);
    
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
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, starting scan...');
            videoRef.current.play().then(() => {
              // Start scanning after video is ready
              setTimeout(() => {
                handleScan();
              }, 500);
            }).catch(error => {
              console.error('Error playing video:', error);
              setScanResult({ error: 'Failed to start video stream. Please try again.' });
            });
          };
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
  };

  // Action handlers
  const handleViewSale = (saleId) => {
    const sale = (recentSales || []).find(s => s.id === saleId);
    if (sale) {
      setSelectedSale(sale);
      setSaleDetailsDialog(true);
    }
  };

  const handlePrintInvoice = (saleId) => {
    const sale = (recentSales || []).find(s => s.id === saleId);
    if (sale) {
      const invoiceContent = `
        ==========================================
        RETAIL INVOICE
        ==========================================
        Invoice Number: ${sale.invoice_number}
        Date: ${new Date(sale.sale_date).toLocaleDateString()}
        Customer: ${sale.customer_name}
        
        Items:
        - Product: ${sale.product_name || 'Various'}
        - Quantity: ${sale.quantity || 1}
        - Unit Price: ₹${sale.unit_price || sale.total_amount}
        - Total: ₹${sale.total_amount}
        
        Payment Status: ${sale.payment_status}
        Payment Method: ${sale.payment_method || 'Cash'}
        
        ==========================================
        Thank you for your purchase!
        ==========================================
      `;
      
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
                <h2>RETAIL INVOICE</h2>
                <p>Zenith ERP Retail</p>
              </div>
              <div class="details">
                <p><strong>Invoice Number:</strong> ${sale.invoice_number}</p>
                <p><strong>Date:</strong> ${new Date(sale.sale_date).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${sale.customer_name}</p>
                <p><strong>Payment Status:</strong> ${sale.payment_status}</p>
                <p><strong>Payment Method:</strong> ${sale.payment_method || 'Cash'}</p>
              </div>
              <div class="total">
                <p><strong>Total Amount: ₹${sale.total_amount}</strong></p>
              </div>
              <div class="footer">
                <p>Thank you for your purchase!</p>
                <p>Zenith ERP Retail</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
        Retail Dashboard
      </Typography>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 3" }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ProductIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {analytics?.total_products || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 3" }}>
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

        <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 3" }}>
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

        <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 3" }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarehouseIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
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
      {lowStockProducts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="warning">
            {lowStockProducts.length} products are running low on stock
          </Alert>
        </Box>
      )}

      {/* Staff Attendance */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Staff Attendance
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Today's Status: {todayAttendance?.check_in_time ? 
                (todayAttendance?.check_out_time ? 'Checked Out' : 'Checked In') : 
                'Not Checked In'
              }
            </Typography>
            {todayAttendance?.check_in_time && !todayAttendance?.check_out_time && (
              <Typography variant="body2" color="text.secondary">
                Check-in: {new Date(todayAttendance.check_in_time).toLocaleTimeString()}
              </Typography>
            )}
            {todayAttendance?.check_out_time && (
              <Typography variant="body2" color="text.secondary">
                Check-out: {new Date(todayAttendance.check_out_time).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            {(!todayAttendance || !todayAttendance.check_in_time) && (
            <Button 
              variant="contained" 
              color="primary"
                onClick={handleCheckIn}
                disabled={attendanceLoading}
                sx={{ mr: 1 }}
              >
                {attendanceLoading ? 'Loading...' : 'Check In'}
            </Button>
            )}
            {todayAttendance && todayAttendance.check_in_time && !todayAttendance.check_out_time && (
            <Button 
              variant="contained" 
              color="secondary"
                onClick={handleCheckOut}
                disabled={attendanceLoading}
              >
                {attendanceLoading ? 'Loading...' : 'Check Out'}
            </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Smart Dashboard */}
      <SmartDashboard userRole="retail" analytics={analytics} />

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <EnhancedButton
              title="Add Product"
              description="Add new products to inventory with barcode scanning"
              icon={<AddIcon />}
              onClick={handleAddProduct}
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
              title="Stock Transfer"
              description="Transfer stock between warehouses and locations"
              icon={<AddIcon />}
              onClick={handleStockTransfer}
              color="secondary"
            />
            <EnhancedButton
              title="Add Customer"
              description="Register new customers with contact information"
              icon={<AddIcon />}
              onClick={handleAddCustomer}
              color="info"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Sales */}
        <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
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

        {/* Low Stock Products */}
        <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Products
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Available</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(lowStockProducts || []).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Chip 
                            label={product.quantity_available} 
                            color={getQuantityColor(product.quantity_available)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => alert(`Reorder ${product.name} - Current stock: ${product.quantity_available}`)}
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
      </Grid>

      {/* Recent Transfers */}
      {recentTransfers.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Stock Transfers
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Transfer ID</TableCell>
                    <TableCell>From Warehouse</TableCell>
                    <TableCell>To Warehouse</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(recentTransfers || []).map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{transfer.transfer_number}</TableCell>
                      <TableCell>{transfer.from_warehouse_name}</TableCell>
                      <TableCell>{transfer.to_warehouse_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transfer.status} 
                          color={getStatusColor(transfer.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addProductDialog} onClose={() => setAddProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    variant="outlined"
                    placeholder="e.g., Paracetamol 500mg"
                    value={productForm.name}
                    onChange={(e) => handleProductFormChange('name', e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<QrCodeIcon />}
                    onClick={() => handleScanBarcode('add_product')}
                    sx={{ height: 56 }}
                  >
                    Scan
                  </Button>
                </Box>
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Search Product"
                    variant="outlined"
                    placeholder="Search for existing product..."
                    value={productSearch}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    onBlur={() => setShowProductSearchResults(false)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {showProductSearchResults && (productSearchResults || []).length > 0 && (
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
                        {(productSearchResults || []).map((product) => (
                          <ListItem 
                            key={product.id}
                            button
                            onClick={() => handleSelectProduct(product)}
                            sx={{ 
                              borderBottom: '1px solid #eee',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                          >
                            <ListItemText
                              primary={product.name}
                              secondary={`${product.category?.name || product.category || ''} - ₹${product.selling_price || 0}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="SKU"
                  variant="outlined"
                  placeholder="e.g., PROD001"
                  value={productForm.sku}
                  onChange={(e) => handleProductFormChange('sku', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={productForm.category || ''}
                  onChange={(e) => handleProductFormChange('category', e.target.value)}
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
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Brand"
                  variant="outlined"
                  placeholder="e.g., Samsung"
                  value={productForm.brand}
                  onChange={(e) => handleProductFormChange('brand', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <FormControl fullWidth>
                  <InputLabel>Unit of Measure</InputLabel>
                  <Select
                    value={productForm.unit_of_measure || 'PCS'}
                    onChange={(e) => handleProductFormChange('unit_of_measure', e.target.value)}
                    label="Unit of Measure"
                  >
                    <MenuItem value="PCS">Pieces</MenuItem>
                    <MenuItem value="KG">Kilograms</MenuItem>
                    <MenuItem value="LTR">Liters</MenuItem>
                    <MenuItem value="MTR">Meters</MenuItem>
                    <MenuItem value="BOX">Box</MenuItem>
                    <MenuItem value="PACK">Pack</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Cost Price"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  value={productForm.cost_price}
                  onChange={(e) => handleProductFormChange('cost_price', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Selling Price"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  value={productForm.selling_price}
                  onChange={(e) => handleProductFormChange('selling_price', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="MRP"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  value={productForm.mrp}
                  onChange={(e) => handleProductFormChange('mrp', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Reorder Level"
                  variant="outlined"
                  type="number"
                  placeholder="10"
                  value={productForm.reorder_level}
                  onChange={(e) => handleProductFormChange('reorder_level', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Max Stock Level"
                  variant="outlined"
                  type="number"
                  placeholder="100"
                  value={productForm.max_stock_level}
                  onChange={(e) => handleProductFormChange('max_stock_level', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={productForm.is_active || true}
                      onChange={(e) => handleProductFormChange('is_active', e.target.checked)}
                    />
                  }
                  label="Active Product"
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Initial Stock"
                  variant="outlined"
                  type="number"
                  placeholder="0"
                  value={productForm.initial_stock}
                  onChange={(e) => handleProductFormChange('initial_stock', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Manufacturer"
                  variant="outlined"
                  placeholder="e.g., ABC Company"
                  value={productForm.manufacturer}
                  onChange={(e) => handleProductFormChange('manufacturer', e.target.value)}
                />
              </Grid>
              <Grid gridColumn="span 12" >
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Product description, features, etc."
                  value={productForm.description}
                  onChange={(e) => handleProductFormChange('description', e.target.value)}
                />
              </Grid>
              <Grid gridColumn="span 12" >
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Product Image
                  </Typography>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="product-image-upload"
                    type="file"
                    onChange={(e) => handleProductFormChange('image', e.target.files[0])}
                  />
                  <label htmlFor="product-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<QrCodeIcon />}
                      sx={{ mb: 2 }}
                    >
                      {productForm.image ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {productForm.image && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Selected: {productForm.image.name}
                      </Typography>
                      <Box sx={{ mt: 1, maxWidth: 200 }}>
                        <img
                          src={URL.createObjectURL(productForm.image)}
                          alt="Product preview"
                          style={{ 
                            width: '100%', 
                            height: 'auto', 
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProductDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitProduct}>
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Sale Dialog */}
      <Dialog open={newSaleDialog} onClose={() => setNewSaleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Sale</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
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
                            button
                            onClick={() => handleSelectCustomer(customer)}
                            sx={{ 
                              borderBottom: '1px solid #eee',
                              '&:hover': { backgroundColor: '#f5f5f5' }
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
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Customer Phone"
                  variant="outlined"
                  placeholder="e.g., +91 98765 43210"
                  value={saleForm.phone}
                  onChange={(e) => handleSaleFormChange('phone', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Customer Email"
                  variant="outlined"
                  type="email"
                  placeholder="e.g., customer@email.com"
                  value={saleForm.email}
                  onChange={(e) => handleSaleFormChange('email', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={saleForm.payment_method}
                    label="Payment Method"
                    onChange={(e) => handleSaleFormChange('payment_method', e.target.value)}
                  >
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="CARD">Card</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid gridColumn="span 12" >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Product Items
                </Typography>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid gridColumn={{ xs: "span 12", md: "span 4" }} >
                      <TextField
                        fullWidth
                        label="Product"
                        variant="outlined"
                        placeholder="Select product"
                        value={saleForm.items[0].product}
                        onChange={(e) => handleSaleFormChange('items', [{ ...saleForm.items[0], product: e.target.value }])}
                      />
                    </Grid>
                    <Grid gridColumn={{ xs: "span 12", md: "span 2" }} >
                      <TextField
                        fullWidth
                        label="Quantity"
                        variant="outlined"
                        type="number"
                        placeholder="1"
                        value={saleForm.items[0].quantity}
                        onChange={(e) => handleSaleFormChange('items', [{ ...saleForm.items[0], quantity: e.target.value }])}
                      />
                    </Grid>
                    <Grid gridColumn={{ xs: "span 12", md: "span 2" }} >
                      <TextField
                        fullWidth
                        label="Price"
                        variant="outlined"
                        type="number"
                        placeholder="0.00"
                        InputProps={{
                          startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                        }}
                        value={saleForm.items[0].price}
                        onChange={(e) => handleSaleFormChange('items', [{ ...saleForm.items[0], price: e.target.value }])}
                      />
                    </Grid>
                    <Grid gridColumn={{ xs: "span 12", md: "span 2" }} >
                      <TextField
                        fullWidth
                        label="Total"
                        variant="outlined"
                        type="number"
                        placeholder="0.00"
                        InputProps={{
                          startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                        }}
                        value={(saleForm.items[0].quantity * saleForm.items[0].price) || 0}
                        disabled
                      />
                    </Grid>
                    <Grid gridColumn={{ xs: "span 12", md: "span 2" }} >
                      <Button variant="outlined" color="error" fullWidth>
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    + Add Product
                  </Button>
                </Box>
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    label="Product"
                    variant="outlined"
                    placeholder="Search for product..."
                    value={productSearch}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    onBlur={() => setShowProductSearchResults(false)}
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
                    sx={{ height: 56 }}
                  >
                    Scan
                  </Button>
                </Box>
                {showProductSearchResults && (productSearchResults || []).length > 0 && (
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
                      {(productSearchResults || []).map((product) => (
                        <ListItem 
                          key={product.id}
                          button
                          onClick={() => handleSelectProduct(product)}
                          sx={{ 
                            borderBottom: '1px solid #eee',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                          }}
                        >
                          <ListItemText
                            primary={product.name}
                            secondary={`${product.category?.name || product.category || ''} - ₹${product.selling_price || 0}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
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

      {/* Stock Transfer Dialog */}
      <Dialog open={stockTransferDialog} onClose={() => setStockTransferDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Stock Transfer</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <FormControl fullWidth>
                  <InputLabel>From Warehouse</InputLabel>
                  <Select
                    value={transferForm.from_warehouse}
                    label="From Warehouse"
                    onChange={(e) => handleTransferFormChange('from_warehouse', e.target.value)}
                  >
                    <MenuItem value="warehouse1">Main Warehouse</MenuItem>
                    <MenuItem value="warehouse2">Branch Warehouse</MenuItem>
                    <MenuItem value="warehouse3">Storage Facility</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <FormControl fullWidth>
                  <InputLabel>To Warehouse</InputLabel>
                  <Select
                    value={transferForm.to_warehouse}
                    label="To Warehouse"
                    onChange={(e) => handleTransferFormChange('to_warehouse', e.target.value)}
                  >
                    <MenuItem value="warehouse1">Main Warehouse</MenuItem>
                    <MenuItem value="warehouse2">Branch Warehouse</MenuItem>
                    <MenuItem value="warehouse3">Storage Facility</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Product"
                  variant="outlined"
                  placeholder="Select product"
                  value={transferForm.product}
                  onChange={(e) => handleTransferFormChange('product', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  placeholder="0"
                  value={transferForm.quantity}
                  onChange={(e) => handleTransferFormChange('quantity', e.target.value)}
                />
              </Grid>
              <Grid gridColumn="span 12" >
                <TextField
                  fullWidth
                  label="Transfer Reason"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="e.g., Restocking, Inventory redistribution, etc."
                  value={transferForm.reason}
                  onChange={(e) => handleTransferFormChange('reason', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockTransferDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitTransfer}>
            Create Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addCustomerDialog} onClose={() => setAddCustomerDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Customer Name"
                  variant="outlined"
                  placeholder="e.g., John Doe"
                  value={customerForm.name}
                  onChange={(e) => handleCustomerFormChange('name', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  placeholder="e.g., +91 98765 43210"
                  value={customerForm.phone}
                  onChange={(e) => handleCustomerFormChange('phone', e.target.value)}
                />
              </Grid>
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
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
              <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                <TextField
                  fullWidth
                  label="GST Number"
                  variant="outlined"
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  value={customerForm.gst_number}
                  onChange={(e) => handleCustomerFormChange('gst_number', e.target.value)}
                />
              </Grid>
              <Grid gridColumn="span 12" >
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
                <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                  <Typography variant="subtitle1" fontWeight="bold">Invoice Number:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedSale.invoice_number}</Typography>
                </Grid>
                <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                  <Typography variant="subtitle1" fontWeight="bold">Date:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{new Date(selectedSale.sale_date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                  <Typography variant="subtitle1" fontWeight="bold">Customer:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedSale.customer_name}</Typography>
                </Grid>
                <Grid gridColumn={{ xs: "span 12", md: "span 6" }} >
                  <Typography variant="subtitle1" fontWeight="bold">Payment Status:</Typography>
                  <Chip 
                    label={selectedSale.payment_status} 
                    color={getStatusColor(selectedSale.payment_status)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid gridColumn="span 12" >
                  <Typography variant="subtitle1" fontWeight="bold">Sale Items:</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Unit Price</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{selectedSale.product_name || 'Various Products'}</TableCell>
                          <TableCell>{selectedSale.quantity || 1}</TableCell>
                          <TableCell>₹{selectedSale.unit_price || selectedSale.total_amount}</TableCell>
                          <TableCell>₹{selectedSale.total_amount}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid gridColumn="span 12" >
                  <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
                    Total Amount: ₹{selectedSale.total_amount}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaleDetailsDialog(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            if (selectedSale) {
                              handlePrintInvoice(selectedSale?.id);
            }
          }}>
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
          {scanMode === 'add_product' ? 'Scan Product Barcode' : 'Scan Product for Sale'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid gridColumn="span 12" >
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {scanMode === 'add_product' 
                    ? 'Scan the product barcode to auto-fill the Add Product form'
                    : 'Scan the product barcode to add it to the sale'
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
              <Grid gridColumn="span 12" >
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
                    </>
                  )}
                </Box>
              </Grid>

              {/* Manual Input */}
              <Grid gridColumn="span 12" >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Or enter barcode manually:
                </Typography>
                <TextField
                  fullWidth
                  label="Barcode/Product Name"
                  variant="outlined"
                  placeholder="Enter barcode or product name"
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
              <Grid gridColumn="span 12" >
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
                <Grid gridColumn="span 12" >
                  {scanResult.error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {scanResult.error}
                    </Alert>
                  ) : (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Found: {scanResult.name} - ₹{scanResult.selling_price}
                    </Alert>
                  )}
                </Grid>
              )}

              {/* Demo Barcodes */}
              <Grid gridColumn="span 12" >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Demo - Try these product names:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {(products || []).slice(0, 3).map((product) => (
                    <Chip
                      key={product.id}
                      label={product.name}
                      onClick={() => handleManualBarcodeInput(product.name)}
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

export default RetailDashboard; 