import React, { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Avatar, CircularProgress } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post('/password-reset/request/', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pt: 10,
      pb: 4,
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Card sx={{
        maxWidth: 420,
        width: '100%',
        p: 3,
        background: 'rgba(26, 26, 36, 0.8) !important',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        zIndex: 1,
        borderRadius: 4,
      }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{
              bgcolor: 'transparent',
              mb: 2,
              width: 56,
              height: 56,
              border: '2px solid #00f2fe',
              boxShadow: '0 0 15px rgba(0,242,254,0.3)'
            }}>
              <LockResetIcon sx={{ color: '#00f2fe' }} />
            </Avatar>
            <Typography variant="h4" fontWeight="800" sx={{
              background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }} textAlign="center">
              Enter your account email and we'll send you a reset link
            </Typography>
          </Box>

          {sent ? (
            <Alert severity="success" sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#69f0ae', border: '1px solid rgba(46, 125, 50, 0.3)' }}>
              If that email is registered, a password reset link has been sent. Check your inbox (and spam folder).
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                required
                autoFocus
                autoComplete="email"
                InputProps={{ sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)' } }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: '#00f2fe' } } }}
              />
              {error && <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff5252', border: '1px solid rgba(211, 47, 47, 0.3)' }}>{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0, 242, 254, 0.4)'
                }}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} sx={{ color: 'white' }} />}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <Box mt={3} textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              <Link
                to="/login"
                style={{
                  color: '#00f2fe',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Back to Login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
