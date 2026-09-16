import React, { useState, useEffect } from "react";
import { login } from "../services/api";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Avatar, CircularProgress, Divider } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoutReason, setLogoutReason] = useState("");
  const navigate = useNavigate();

  // Check for logout reason from session expiration
  useEffect(() => {
    const reason = sessionStorage.getItem('logoutReason');
    if (reason) {
      setLogoutReason(reason);
      sessionStorage.removeItem('logoutReason');
    }
  }, []);

  const handleGoogleSignIn = () => {
    // Google OAuth implementation
    let apiBaseUrl = process.env.REACT_APP_API_URL;
    if (!apiBaseUrl) {
      // Auto-detect: if running on localhost, use HTTP; otherwise use HTTPS
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        apiBaseUrl = 'http://localhost:8000/api';
      } else {
        apiBaseUrl = 'https://api.zenitherp.online/api';
      }
    } else if (!apiBaseUrl.endsWith('/api')) {
      apiBaseUrl = apiBaseUrl.endsWith('/') ? `${apiBaseUrl}api` : `${apiBaseUrl}/api`;
    }
    const googleAuthUrl = `${apiBaseUrl}/auth/google/?state=login`;
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password); // sets tokens in localStorage
      // Fetch user profile after login
      const res = await api.get('/users/me/');
      if (res && res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('userChanged'));
        navigate("/dashboard");
      } else {
        setError("Failed to fetch user profile after login.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message;
      if (errorMessage && typeof errorMessage === 'string') {
        setError(errorMessage);
      } else {
        setError("Invalid username or password. Please check your credentials and try again.");
      }
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
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effects */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(40px)',
        animation: 'pulse 6s infinite'
      }} />
      
      <Card sx={{ 
        maxWidth: 420, 
        width: '100%', 
        p: 3, 
        bgcolor: 'rgba(26, 26, 36, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        zIndex: 1,
        borderRadius: 4
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
              <LockOutlinedIcon sx={{ color: '#00f2fe' }} />
            </Avatar>
            <Typography variant="h4" fontWeight="800" sx={{ 
              background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              Zenith Portal
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }} textAlign="center">
              Authenticate to access your unified dashboard
            </Typography>
          </Box>
          
          {logoutReason && (
            <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#4fc3f7', border: '1px solid rgba(2, 136, 209, 0.3)' }}>
              {logoutReason}
            </Alert>
          )}
          
          {/* Google Sign In Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{
              mb: 3,
              py: 1.5,
              textTransform: 'none',
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.03)',
              '&:hover': {
                borderColor: '#ffffff',
                bgcolor: 'rgba(255,255,255,0.08)'
              }
            }}
          >
            Sign in with Google
          </Button>
          
          <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flexGrow: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', px: 2 }}>OR</Typography>
            <Divider sx={{ flexGrow: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          </Box>
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
              autoComplete="username"
              InputProps={{ sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)' } }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: '#00f2fe' } } }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoComplete="current-password"
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
              {loading ? "Authenticating..." : "Login to System"}
            </Button>
          </form>
          
          <Box mt={3} textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#00f2fe', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'text-shadow 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.textShadow = '0 0 8px rgba(0,242,254,0.5)'}
                onMouseLeave={(e) => e.target.style.textShadow = 'none'}
              >
                Request Access
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
