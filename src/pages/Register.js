
import React, { useState } from "react";
import { register } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Avatar, CircularProgress, MenuItem, Select, InputLabel, FormControl, Divider, Grid } from '@mui/material';
import PricingModal from '../components/PricingModal';
import Logo from '../components/Logo';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import GoogleIcon from '@mui/icons-material/Google';

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    company: "",
    industry: "education",
    plan: "free",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const planFromQuery = queryParams.get('plan');
  const [selectedPlan, setSelectedPlan] = useState(planFromQuery || 'Free');
  const [industry, setIndustry] = useState('Education');
  const [showPricing, setShowPricing] = useState(false);
  // Note: Departments and roles are no longer needed for registration
  // Backend automatically assigns admin role to first user of new tenant

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Suppress unhandled promise rejections from browser extensions
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('message port closed')) {
        // Ignore browser extension errors
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    try {
      const payload = {
        ...form,
        plan: selectedPlan,
        industry: (industry || '').toLowerCase(),
        role: 'admin', // Always set role to 'admin'
        department: null, // Do not send department
        assigned_classes: [], // Remove assigned_classes from payload
      };
      const response = await register(payload);
      
      // Check if registration was successful
      if (response && response.data) {
        // Check for email sending warning
        if (response.data.warning) {
          // Email failed to send - show warning
          const warningMessage = `⚠️ ${response.data.warning}\n\nYour account has been created, but the verification email could not be sent.\n\nYou can still log in with your credentials.`;
          
          // Use setTimeout to ensure navigation happens after alert is handled
          setTimeout(() => {
            alert(warningMessage);
            setTimeout(() => {
              navigate("/login");
            }, 100);
          }, 0);
          return;
        }
        
        // Check if email verification is required
        if (response.data.message && response.data.message.includes("check your email")) {
          // Email verification required
          setTimeout(() => {
            alert(`Registration successful! Please check your email (${form.email}) to verify your account before logging in.`);
            setTimeout(() => {
              navigate("/login");
            }, 100);
          }, 0);
        } else if (response.data.access && response.data.refresh) {
          // Immediate login (no email verification)
          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);
          setTimeout(() => {
            alert(`Registration successful! You can now log in.`);
            setTimeout(() => {
              navigate("/dashboard");
            }, 100);
          }, 0);
        } else {
          // Registration successful - user can login (email may have been sent)
          setTimeout(() => {
            alert(`Registration successful! Please check your email (${form.email}) for verification link.\n\nYou can also log in directly if email verification is optional.`);
            setTimeout(() => {
              navigate("/login");
            }, 100);
          }, 0);
        }
      } else {
        setError("Registration failed. Please check your details.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Prevent uncaught promise errors
      if (err && err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err && err.message && !err.message.includes('message port closed')) {
        setError(err.message);
      } else {
        setError("Registration failed. Please check your details.");
      }
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Google OAuth implementation
    // This will redirect to Google OAuth
    let apiBaseUrl = process.env.REACT_APP_API_URL;
    if (!apiBaseUrl) {
      // Auto-detect: if running on localhost, use HTTP; otherwise use HTTPS
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        apiBaseUrl = 'http://localhost:8000/api';
      } else {
        apiBaseUrl = 'https://erp-backend-av9v.onrender.com/api';
      }
    } else if (!apiBaseUrl.endsWith('/api')) {
      apiBaseUrl = apiBaseUrl.endsWith('/') ? `${apiBaseUrl}api` : `${apiBaseUrl}/api`;
    }
    const googleAuthUrl = `${apiBaseUrl}/auth/google/?state=register`;
    window.location.href = googleAuthUrl;
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
      overflowX: 'hidden'
    }}>
      {/* Background glow effects */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 242, 254, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(60px)',
        animation: 'pulse 8s infinite',
        zIndex: 0
      }} />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, zIndex: 1 }}>
        <Card sx={{ 
          maxWidth: 500, 
          width: '100%', 
          p: 3, 
          background: 'rgba(26, 26, 36, 0.8) !important',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          borderRadius: 4,
          '&:hover': {
            background: 'rgba(26, 26, 36, 0.9) !important',
            transform: 'none'
          }
        }}>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Box sx={{ mb: 2 }}>
                <Logo height={40} textVariant="h5" />
              </Box>
              <Typography variant="h5" fontWeight="600" gutterBottom>Create Your Account</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }} textAlign="center">
                Initialize your enterprise control center
              </Typography>
            </Box>
            
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
              Sign up with Google
            </Button>
            
            <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
              <Divider sx={{ flexGrow: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', px: 2 }}>OR</Typography>
              <Divider sx={{ flexGrow: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            </Box>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)' } }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: '#00f2fe' } } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)' } }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: '#00f2fe' } } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)' } }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: '#00f2fe' } } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Company Name"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)' } }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: '#00f2fe' } } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="industry-label" sx={{ color: 'rgba(255,255,255,0.6)' }}>Industry</InputLabel>
                  <Select
                    labelId="industry-label"
                    value={industry}
                    label="Industry"
                    onChange={e => setIndustry(e.target.value)}
                    sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.2)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00f2fe' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.6)' } }}
                  >
                    <MenuItem value="Education">Education Management</MenuItem>
                    <MenuItem value="Pharmacy">Pharmacy Management</MenuItem>
                    <MenuItem value="Retail">Retail & Wholesale</MenuItem>
                    <MenuItem value="Hotel">Hotel</MenuItem>
                    <MenuItem value="Restaurant">Restaurant</MenuItem>
                    <MenuItem value="Salon">Salon</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Plan</InputLabel>
                  <Select
                    name="plan"
                    value={selectedPlan}
                    onChange={e => setSelectedPlan(e.target.value)}
                    label="Plan"
                    required
                    sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.2)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00f2fe' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.6)' } }}
                  >
                    <MenuItem value="Free">Free</MenuItem>
                    <MenuItem value="Starter">Starter</MenuItem>
                    <MenuItem value="Pro">Pro</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button variant="outlined" fullWidth onClick={() => setShowPricing(true)} sx={{ mt: 2, color: '#00f2fe', borderColor: 'rgba(0,242,254,0.3)', '&:hover': { borderColor: '#00f2fe', bgcolor: 'rgba(0,242,254,0.05)' } }}>
              View Plan Details
            </Button>
            
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
              {loading ? "Deploying Tenant..." : "Initialize Tenant"}
            </Button>
            
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 2, textAlign: 'center', fontSize: '0.8rem' }}>
              All new signups start with the <b>Free</b> tier. You can upgrade post-deployment.
            </Typography>
            <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
          </form>
          
          <Box mt={4} textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#00f2fe', textDecoration: 'none', fontWeight: 600 }}>Login here</a>
            </Typography>
          </Box>
          
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Register;
