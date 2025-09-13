import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import api from '../services/api';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token found in URL.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      setLoading(true);
      const response = await api.post('/verify-email/', {
        token: verificationToken
      });

      setStatus('success');
      setMessage(response.data.message);
      
      // Store tokens for automatic login
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
    } catch (error) {
      console.error('Verification error:', error);
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
        if (error.response.data.error.includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setMessage('Please enter your email address.');
      return;
    }

    try {
      setResendLoading(true);
      await api.post('/resend-verification/', {
        email: resendEmail
      });

      setMessage('Verification email sent successfully! Please check your inbox.');
      setResendDialogOpen(false);
      setResendEmail('');
    } catch (error) {
      console.error('Resend error:', error);
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Failed to send verification email. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress size={60} />
            <Typography variant="h6">Verifying your email...</Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your email address.
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CheckCircle color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="success.main">
              Email Verified Successfully!
            </Typography>
            <Typography variant="body1" textAlign="center">
              {message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Error color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="error.main">
              Verification Failed
            </Typography>
            <Typography variant="body1" textAlign="center">
              {message}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setResendDialogOpen(true)}
              startIcon={<Email />}
            >
              Resend Verification Email
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </Box>
        );

      case 'expired':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Error color="warning" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="warning.main">
              Link Expired
            </Typography>
            <Typography variant="body1" textAlign="center">
              {message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setResendDialogOpen(true)}
              startIcon={<Email />}
            >
              Request New Verification Email
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Email Verification
        </Typography>
        
        {getStatusContent()}

        {/* Resend Verification Dialog */}
        <Dialog open={resendDialogOpen} onClose={() => setResendDialogOpen(false)}>
          <DialogTitle>Resend Verification Email</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter your email address to receive a new verification link.
            </Typography>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResendVerification}
              variant="contained"
              disabled={resendLoading}
            >
              {resendLoading ? <CircularProgress size={20} /> : 'Send Email'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Alert for messages */}
        {message && status !== 'verifying' && (
          <Alert 
            severity={status === 'success' ? 'success' : 'error'} 
            sx={{ mt: 2 }}
          >
            {message}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default EmailVerification; 