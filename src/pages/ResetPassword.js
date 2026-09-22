import React, { useState } from "react";
import api from "../services/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Avatar, CircularProgress } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const missingLinkParams = !email || !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/password-reset/confirm/', { email, token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. The link may have expired - request a new one.");
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
              Set New Password
            </Typography>
            {!missingLinkParams && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }} textAlign="center">
                {email}
              </Typography>
            )}
          </Box>

          {missingLinkParams ? (
            <Alert severity="error" sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff5252', border: '1px solid rgba(211, 47, 47, 0.3)' }}>
              This reset link is invalid or incomplete. Please request a new one.
            </Alert>
          ) : success ? (
            <Alert severity="success" sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#69f0ae', border: '1px solid rgba(46, 125, 50, 0.3)' }}>
              Password reset! Redirecting you to login...
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
                autoFocus
                autoComplete="new-password"
                InputProps={{ sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)' } }}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: '#00f2fe' } } }}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
                autoComplete="new-password"
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
                {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
