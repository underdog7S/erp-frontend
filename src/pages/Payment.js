import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';
console.log('Razorpay Key:', RAZORPAY_KEY_ID); // Debug: Log the Razorpay key being used

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const planFromQuery = queryParams.get('plan') || '';
  const amountFromQuery = queryParams.get('amount') || '';

  const [plan, setPlan] = useState(planFromQuery);
  const [amount, setAmount] = useState(amountFromQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (success) {
      // Optionally, you can add a short delay before redirecting
      const timer = setTimeout(() => {
        // Optionally, trigger a dashboard refresh by updating localStorage or dispatching an event
        window.dispatchEvent(new Event('planChanged'));
        navigate('/dashboard');
      }, 2000); // 2 seconds
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Create order from backend
      // Use the correct access token from localStorage
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/payments/razorpay/order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      const { order } = data;

      // 2. Open Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ERP Payment',
        description: `Upgrade to ${plan} plan`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Handle payment success (send to backend for verification)
          try {
            const verifyRes = await fetch('http://localhost:8000/api/payments/razorpay/verify/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan,
                amount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');
            setSuccess('Payment verified and plan upgraded! Redirecting to dashboard...');
          } catch (err) {
            setError('Payment succeeded but verification failed: ' + err.message);
          }
        },
        prefill: {
          email: '',
        },
        theme: {
          color: '#3399cc',
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Upgrade Plan</h2>
      <form onSubmit={handlePayment}>
        <div style={{ marginBottom: 16 }}>
          <label>Plan: </label>
          <input
            type="text"
            value={plan}
            onChange={e => setPlan(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
            readOnly
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Amount (INR): </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            min="1"
            style={{ width: '100%', padding: 8 }}
            readOnly
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#3399cc', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Processing...' : `Pay ₹${amount} & Upgrade`}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
    </div>
  );
};

export default Payment; 