import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, 
  CircularProgress, Select, MenuItem, FormControl, InputLabel, 
  Paper, Divider, List, ListItem, ListItemText
} from '@mui/material';
import axios from 'axios';

const PublicFeePayment = () => {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant_id') || '';
  
  const [formData, setFormData] = useState({
    tenant_id: tenantId,
    student_roll_number: '',
    parent_phone: '',
    fee_structure_id: '',
    amount: '',
    parent_name: '',
    parent_email: ''
  });
  
  const [feeStatus, setFeeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'https://erp-backend-av9v.onrender.com/api';

  const checkFeeStatus = async () => {
    if (!formData.student_roll_number || !formData.parent_phone || !formData.tenant_id) {
      setError('Please enter student roll number, parent phone, and tenant ID');
      return;
    }

    setCheckingStatus(true);
    setError('');
    setFeeStatus(null);

    try {
      const response = await axios.get(`${API_BASE}/education/public/fee-status/`, {
        params: {
          tenant_id: formData.tenant_id,
          student_roll_number: formData.student_roll_number,
          parent_phone: formData.parent_phone
        }
      });

      if (response.data) {
        setFeeStatus(response.data);
        setSuccess('Fee status loaded successfully');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch fee status. Please verify your details.');
      setFeeStatus(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePayment = async () => {
    if (!formData.student_roll_number || !formData.parent_phone || !formData.fee_structure_id || !formData.amount || !formData.tenant_id) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE}/education/public/fee-payment/`, {
        tenant_id: parseInt(formData.tenant_id),
        student_roll_number: formData.student_roll_number,
        parent_phone: formData.parent_phone,
        fee_structure_id: parseInt(formData.fee_structure_id),
        amount: parseFloat(formData.amount),
        parent_name: formData.parent_name,
        parent_email: formData.parent_email
      });

      if (response.data) {
        if (response.data.payment) {
          // Initialize Razorpay
          setPaymentData(response.data);
          initializeRazorpay(response.data.payment.checkout_data);
        } else {
          setSuccess('Payment record created. Please contact school for payment processing.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpay = (checkoutData) => {
    if (window.Razorpay) {
      const options = {
        ...checkoutData,
        handler: function (response) {
          setSuccess(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          setPaymentData(null);
          // Optionally refresh fee status
          setTimeout(() => {
            checkFeeStatus();
          }, 2000);
        },
        prefill: checkoutData.prefill,
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            setPaymentData(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setError('Payment failed: ' + (response.error.description || 'Unknown error'));
        setPaymentData(null);
      });
      razorpay.open();
    } else {
      setError('Razorpay SDK not loaded. Please refresh the page.');
    }
  };

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" color="primary">
              Pay School Fees Online
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
              Enter your details to check fee status and pay fees securely
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="School Tenant ID"
                value={formData.tenant_id}
                onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                margin="normal"
                required
                helperText="Enter your school's tenant ID"
              />
              <TextField
                fullWidth
                label="Student Roll Number"
                value={formData.student_roll_number}
                onChange={(e) => setFormData({...formData, student_roll_number: e.target.value.toUpperCase()})}
                margin="normal"
                required
                placeholder="e.g., STU-2025-1234"
              />
              <TextField
                fullWidth
                label="Parent Phone Number"
                value={formData.parent_phone}
                onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                margin="normal"
                required
                type="tel"
                placeholder="10-digit phone number"
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={checkFeeStatus}
                disabled={checkingStatus}
                sx={{ mt: 2 }}
                startIcon={checkingStatus && <CircularProgress size={20} />}
              >
                {checkingStatus ? 'Checking...' : 'Check Fee Status'}
              </Button>
            </Box>

            {feeStatus && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }}>
                <Typography variant="h6" gutterBottom>
                  Fee Status for {feeStatus.student_name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Roll Number: {feeStatus.student_roll_number} | Class: {feeStatus.class_name}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body2">
                  Total Due: <strong>₹{feeStatus.total_due}</strong>
                </Typography>
                <Typography variant="body2">
                  Total Paid: <strong>₹{feeStatus.total_paid}</strong>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Fee Breakdown
                </Typography>
                <List>
                  {feeStatus.fee_status.map((fee, index) => (
                    <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={fee.fee_type_display}
                        secondary={
                          <>
                            Total: ₹{fee.total_amount} | 
                            Paid: ₹{fee.amount_paid} | 
                            Remaining: ₹{fee.remaining_amount}
                            {fee.is_paid && <span style={{ color: 'green' }}> (Paid)</span>}
                            {fee.due_date && <span> | Due: {fee.due_date}</span>}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {feeStatus && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Pay Fees
                </Typography>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Select Fee Type</InputLabel>
                  <Select
                    value={formData.fee_structure_id}
                    onChange={(e) => {
                      const selectedFee = feeStatus.fee_status.find(
                        f => f.fee_structure_id === parseInt(e.target.value)
                      );
                      setFormData({
                        ...formData,
                        fee_structure_id: e.target.value,
                        amount: selectedFee && parseFloat(selectedFee.remaining_amount) > 0 
                          ? selectedFee.remaining_amount 
                          : ''
                      });
                    }}
                    label="Select Fee Type"
                  >
                    <MenuItem value="">Select Fee Type</MenuItem>
                    {feeStatus.fee_status
                      .filter(fee => !fee.is_paid && parseFloat(fee.remaining_amount) > 0)
                      .map((fee) => (
                        <MenuItem key={fee.fee_structure_id} value={fee.fee_structure_id}>
                          {fee.fee_type_display} - Remaining: ₹{fee.remaining_amount}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  margin="normal"
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  fullWidth
                  label="Parent Name (Optional)"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Parent Email (Optional)"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
                  margin="normal"
                />
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePayment}
                  disabled={loading || !formData.fee_structure_id || !formData.amount}
                  sx={{ mt: 2 }}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Secure payment powered by Razorpay
              </Typography>
              <Typography variant="caption" color="textSecondary">
                For support, please contact your school administration
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PublicFeePayment;

