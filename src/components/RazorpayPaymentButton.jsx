import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/api';

/**
 * Razorpay Payment Button Component
 * 
 * @param {Object} props
 * @param {string} props.sector - Sector type: 'education', 'restaurant', 'salon', 'pharmacy', 'retail', 'hotel'
 * @param {string|number} props.referenceId - ID of the record (fee_payment_id, order_id, appointment_id, etc.)
 * @param {number} props.amount - Payment amount
 * @param {string} props.description - Payment description
 * @param {Function} props.onSuccess - Callback on successful payment
 * @param {Function} props.onError - Callback on payment error
 * @param {string} props.variant - Button variant ('contained', 'outlined', 'text')
 * @param {string} props.color - Button color
 * @param {boolean} props.fullWidth - Full width button
 */
const RazorpayPaymentButton = ({
  sector,
  referenceId,
  amount,
  description = 'Payment',
  onSuccess,
  onError,
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  disabled = false,
  children
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    if (!sector || !referenceId || !amount) {
      setError('Missing required payment information');
      return;
    }

    if (!window.Razorpay) {
      setError('Razorpay script not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Razorpay order
      const orderData = await createRazorpayOrder({
        amount: amount,
        currency: 'INR',
        sector: sector,
        reference_id: referenceId,
        description: description
      });

      if (!orderData.order_id || !orderData.key_id) {
        throw new Error('Failed to create payment order');
      }

      // Open Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ZenERP',
        description: description,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyData = await verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              sector: sector,
              reference_id: referenceId
            });

            if (onSuccess) {
              onSuccess(verifyData);
            } else {
              // Default success handling
              alert('Payment successful!');
              window.location.reload();
            }
          } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Payment verification failed';
            setError(errorMsg);
            if (onError) {
              onError(err);
            }
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          // You can prefill customer details if available
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response) {
        const errorMsg = response.error?.description || 'Payment failed';
        setError(errorMsg);
        setLoading(false);
        if (onError) {
          onError(new Error(errorMsg));
        }
      });
      
      rzp.open();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to initiate payment';
      setError(errorMsg);
      setLoading(false);
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Button
        variant={variant}
        color={color}
        fullWidth={fullWidth}
        disabled={disabled || loading}
        onClick={handlePayment}
        startIcon={loading ? <CircularProgress size={16} /> : <PaymentIcon />}
      >
        {loading ? 'Processing...' : (children || `Pay ₹${amount}`)}
      </Button>
    </>
  );
};

export default RazorpayPaymentButton;

