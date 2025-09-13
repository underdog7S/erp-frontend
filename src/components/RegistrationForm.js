import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import api from '../services/api';

const steps = ['Company Information', 'Industry & Education', 'Plan Selection'];

const RegistrationForm = ({ googleUser }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    company_name: '',
    industry: 'education',
    education_sector: '',
    plan: 'free',
    phone: '',
    address: '',
    website: '',
    employee_count: '',
    description: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Combine Google user data with form data
      const registrationData = {
        ...googleUser,
        ...formData,
        email: googleUser.email,
        first_name: googleUser.given_name,
        last_name: googleUser.family_name,
        profile_picture: googleUser.picture
      };

      // Register the user with complete information
      const response = await api.post('/register/', registrationData);
      
      if (response.data) {
        // Show email verification message instead of redirecting
        setError(''); // Clear any previous errors
        setLoading(false);
        
        // Show success message for email verification
        alert(`Registration successful! Please check your email (${googleUser.email}) to verify your account before logging in.`);
        
        // Redirect to login page
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Welcome, {googleUser?.given_name}! Let's set up your company profile.
            </Typography>
            <TextField
              label="Company Name *"
              value={formData.company_name}
              onChange={handleInputChange('company_name')}
              fullWidth
              margin="normal"
              required
              autoFocus
            />
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Website"
              value={formData.website}
              onChange={handleInputChange('website')}
              fullWidth
              margin="normal"
              placeholder="https://yourcompany.com"
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={handleInputChange('address')}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tell us about your business
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Current Industry: {formData.industry}
            </Typography>
            <FormControl fullWidth margin="normal" sx={{ minHeight: '56px' }}>
              <InputLabel id="industry-label">Industry *</InputLabel>
              <Select
                labelId="industry-label"
                value={formData.industry}
                onChange={handleInputChange('industry')}
                required
                displayEmpty
                sx={{ 
                  minHeight: '56px',
                  '& .MuiSelect-select': {
                    minHeight: '20px'
                  }
                }}
              >
                <MenuItem value="education">Education Management</MenuItem>
                <MenuItem value="pharmacy">Pharmacy Management</MenuItem>
                <MenuItem value="retail">Retail & Wholesale</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Education Sector</InputLabel>
              <Select
                value={formData.education_sector}
                onChange={handleInputChange('education_sector')}
              >
                <MenuItem value="">Not Applicable</MenuItem>
                <MenuItem value="school">School</MenuItem>
                <MenuItem value="college">College</MenuItem>
                <MenuItem value="university">University</MenuItem>
                <MenuItem value="training_center">Training Center</MenuItem>
                <MenuItem value="online_education">Online Education</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Number of Employees"
              value={formData.employee_count}
              onChange={handleInputChange('employee_count')}
              fullWidth
              margin="normal"
              type="number"
            />
            
            <TextField
              label="Company Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="Brief description of your company..."
            />
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose your plan
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Plan *</InputLabel>
              <Select
                value={formData.plan}
                onChange={handleInputChange('plan')}
                required
              >
                <MenuItem value="free">
                  <Box>
                    <Typography variant="subtitle1">Free Plan - ₹0</Typography>
                    <Typography variant="body2" color="textSecondary">
                      5 Users, 500 MB Storage, 1 Industry Module
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="starter">
                  <Box>
                    <Typography variant="subtitle1">Starter Plan - ₹999/year</Typography>
                    <Typography variant="body2" color="textSecondary">
                      20 Users, 2 GB Storage, 1 Industry Module
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="pro">
                  <Box>
                    <Typography variant="subtitle1">Pro Plan - ₹2,499/year</Typography>
                    <Typography variant="body2" color="textSecondary">
                      50 Users, 10 GB Storage, 1 Industry Module
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="business">
                  <Box>
                    <Typography variant="subtitle1">Business Plan - ₹4,999/year</Typography>
                    <Typography variant="body2" color="textSecondary">
                      150 Users, 20 GB Storage, 1 Industry Module
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              You can change your plan anytime from your dashboard.
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f6fa' }}>
      <Card sx={{ maxWidth: 600, width: '100%', p: 3 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" gutterBottom>Complete Your Registration</Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Current Step: {activeStep + 1} of {steps.length} - {steps[activeStep]}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !formData.company_name}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!formData.company_name}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegistrationForm; 