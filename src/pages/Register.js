
import React, { useState } from "react";
import { register } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Avatar, CircularProgress, MenuItem, Select, InputLabel, FormControl, Divider } from '@mui/material';
import PricingModal from '../components/PricingModal';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

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
          alert(`⚠️ ${response.data.warning}\n\nYour account has been created, but the verification email could not be sent.\n\nYou can still log in with your credentials.`);
          navigate("/login");
          return;
        }
        
        // Check if email verification is required
        if (response.data.message && response.data.message.includes("check your email")) {
          // Email verification required
          alert(`Registration successful! Please check your email (${form.email}) to verify your account before logging in.`);
          navigate("/login");
        } else if (response.data.access && response.data.refresh) {
          // Immediate login (no email verification)
          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);
          alert(`Registration successful! You can now log in.`);
          navigate("/dashboard");
        } else {
          // Registration successful - user can login (email may have been sent)
          alert(`Registration successful! Please check your email (${form.email}) for verification link.\n\nYou can also log in directly if email verification is optional.`);
          navigate("/login");
        }
      } else {
        setError("Registration failed. Please check your details.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please check your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f6fa' }}>
      <Card sx={{ maxWidth: 450, width: '100%', p: 3 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'secondary.main', mb: 1 }}>
              <PersonAddAltIcon />
            </Avatar>
            <Typography variant="h5" gutterBottom>Create Your Account</Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              Get started with Zenith ERP in just a few clicks
            </Typography>
          </Box>
          
          
          <Box sx={{ my: 2 }}>
            <Divider>
              <Typography variant="body2" color="textSecondary">OR</Typography>
            </Divider>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoFocus
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Company Name"
              name="company"
              value={form.company}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="industry-label">Industry</InputLabel>
              <Select
                labelId="industry-label"
                value={industry}
                label="Industry"
                onChange={e => setIndustry(e.target.value)}
              >
                <MenuItem value="Education">Education Management</MenuItem>
                <MenuItem value="Pharmacy">Pharmacy Management</MenuItem>
                <MenuItem value="Retail">Retail & Wholesale</MenuItem>
                <MenuItem value="Hotel">Hotel</MenuItem>
                <MenuItem value="Restaurant">Restaurant</MenuItem>
                <MenuItem value="Salon">Salon</MenuItem>
              </Select>
            </FormControl>
            {/* Remove the Role and Department dropdowns from the form UI */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Plan</InputLabel>
              <Select
                name="plan"
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
                label="Plan"
                required
              >
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Starter">Starter</MenuItem>
                <MenuItem value="Pro">Pro</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" fullWidth onClick={() => setShowPricing(true)} sx={{ mt: 1 }}>View Plan Details</Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              All new signups start with the <b>Free</b> plan. You can upgrade after registration.
            </Typography>
            <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
      </form>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Already have an account? <a href="/login">Login</a>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
