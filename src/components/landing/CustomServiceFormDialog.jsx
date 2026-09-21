import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, TextField, Button, CircularProgress, IconButton, Grid, Alert } from '@mui/material';
import { Close as CloseIcon, Check as CheckIcon, ArrowForward as ArrowIcon, Settings as SettingsIcon, Web as WebIcon, Smartphone as AppIcon, Code as CodeIcon, Computer as ComputerIcon, Memory as MemoryIcon } from '@mui/icons-material';
import { submitCustomServiceRequest } from '../../services/api';
import GoogleBookingEmbed from './GoogleBookingEmbed';

const CustomServiceFormDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    service_type: '',
    name: '',
    email: '',
    phone: '',
    company_name: '',
    description: '',
    budget_range: '',
    timeline: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hoveredField, setHoveredField] = useState(null);
  
  const totalSteps = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.service_type) newErrors.service_type = 'Please select a service type';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your requirements';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await submitCustomServiceRequest(formData);
      setSuccess(true);
      // Removed auto-close so the user has time to click the Google Calendar link!
      // The user can close the dialog manually using the close button.
    } catch (error) {
      // Error submitting request - snackbar will show message
      setErrors({ submit: error.response?.data?.errors || 'Failed to submit request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.service_type) {
        setErrors({ service_type: 'Please select a service type' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.name || !formData.email) {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email address';
        }
        setErrors(newErrors);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepColor = (step) => {
    if (step < currentStep) return 'success.main';
    if (step === currentStep) return 'primary.main';
    return 'grey.300';
  };

  useEffect(() => {
    if (open) return;
    setSuccess(false);
    setCurrentStep(1);
    setErrors({});
    setLoading(false);
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: '#12121c',
          color: 'white',
          maxHeight: '92vh',
          '&::before': {
            content: '""',
        position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <SettingsIcon sx={{ 
            fontSize: 32,
            animation: 'rotateIcon 3s ease-in-out infinite',
            '@keyframes rotateIcon': {
              '0%, 100%': { transform: 'rotate(0deg)' },
              '50%': { transform: 'rotate(10deg)' }
            }
          }} />
          <Typography variant="h5" fontWeight={700}>
            Book a free consultation
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          aria-label="Close consultation form" 
          sx={{ 
            color: 'white',
            position: 'relative',
            zIndex: 1,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'rotate(90deg) scale(1.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Step Indicator */}
      {!success && (
        <Box sx={{ 
          bgcolor: 'rgba(255,255,255,0.05)', 
          px: 4, 
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: getStepColor(step),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      transition: 'all 0.3s ease',
                      boxShadow: step === currentStep ? '0 4px 12px rgba(25,118,210,0.4)' : 'none',
                      transform: step === currentStep ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {step < currentStep ? <CheckIcon /> : step}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      display: { xs: 'none', sm: 'block' },
                      fontWeight: step === currentStep ? 600 : 400,
                      color: step <= currentStep ? '#4facfe' : 'rgba(255,255,255,0.4)'
                    }}
                  >
                    {step === 1 ? 'Service' : step === 2 ? 'Contact' : 'Details'}
                  </Typography>
                </Box>
                {step < totalSteps && (
                  <Box
                    sx={{
                      flex: 1,
                      height: 2,
                      mx: 1,
                      bgcolor: step < currentStep ? 'success.main' : 'grey.300',
                      transition: 'background 0.3s ease'
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.85)', mt: 1.5 }}>
            30-minute call. We typically reply within one business day. We never sell your contact details.
          </Typography>
        </Box>
      )}

      <DialogContent sx={{
        p: 4,
        position: 'relative',
        bgcolor: '#12121c',
        color: 'white',
        overflow: 'auto',
        '& .MuiOutlinedInput-root': {
          background: 'rgba(7, 12, 24, 0.88)',
          color: '#f8fafc',
          '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.55)' },
          '&:hover fieldset': { borderColor: '#4facfe' },
          '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
        },
        '& .MuiInputLabel-root': { color: 'rgba(226, 232, 240, 0.8)' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
        '& .MuiInputBase-input::placeholder': { color: 'rgba(203, 213, 225, 0.65)', opacity: 1 },
        '& .MuiFormHelperText-root': { color: 'rgba(226, 232, 240, 0.68)' },
        '& .MuiFormHelperText-root.Mui-error': { color: '#fca5a5' },
      }}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'white', mb: 1 }}>
              Select an appointment time
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mb: 2 }}>
              30-minute Google Meet. Times are shown in India Standard Time.
            </Typography>
            <GoogleBookingEmbed height={620} />
          </Grid>
          <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: { xs: 1, md: 4 } }}>
    <Box
      sx={{
                animation: 'successPulse 0.6s ease-out',
                '@keyframes successPulse': {
                  '0%': { transform: 'scale(0)' },
                  '50%': { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            </Box>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'white' }}>
              Request Submitted Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
              Pick a date and time on the calendar. We will send a Google Meet invitation after you book.
            </Typography>
            <Button variant="text" onClick={onClose} sx={{ color: 'text.secondary' }}>
              I'll do this later
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Step 1: Service Type */}
            {currentStep === 1 && (
              <Box sx={{ 
                animation: 'slideInRight 0.4s ease-out'
              }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, color: 'white' }}>
                  What service do you need?
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { value: 'customization', label: 'Customization', icon: <SettingsIcon />, color: '#4caf50', desc: 'Tailor ERP to your workflow' },
                    { value: 'web_development', label: 'Web Development', icon: <WebIcon />, color: '#2196f3', desc: 'Professional web applications' },
                    { value: 'app_development', label: 'App Development', icon: <AppIcon />, color: '#ff9800', desc: 'Mobile apps for iOS & Android' },
                    { value: 'both', label: 'Web + App', icon: <CodeIcon />, color: '#9c27b0', desc: 'Complete digital solution' },
                    { value: 'pc_applications', label: 'PC Applications', icon: <ComputerIcon />, color: '#1976d2', desc: 'Custom desktop applications for Windows, Linux, and macOS' },
                    { value: 'plc_programming', label: 'PLC Programming', icon: <SettingsIcon />, color: '#ff9800', desc: 'Industrial automation programming and control system development' },
                    { value: 'control_operation', label: 'Control & Operation', icon: <MemoryIcon />, color: '#1976d2', desc: 'Industrial control systems and operational automation solutions' }
                  ].map((service) => (
                    <Grid item xs={12} sm={6} key={service.value}>
                      {/* Use a plain Box instead of Card to avoid MUI theme background override */}
                      <Box
                        onClick={() => {
                          setFormData(prev => ({ ...prev, service_type: service.value }));
                          setErrors(prev => ({ ...prev, service_type: '' }));
                          setTimeout(() => handleNext(), 300);
                        }}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          borderRadius: 2,
                          border: formData.service_type === service.value
                            ? `2px solid ${service.color}`
                            : '1px solid rgba(255,255,255,0.12)',
                          backgroundColor: formData.service_type === service.value
                            ? `${service.color}25`
                            : 'rgba(255,255,255,0.06)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${service.color}40`,
                            borderColor: service.color,
                            backgroundColor: `${service.color}18`,
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 4,
                            height: '100%',
                            bgcolor: service.color,
                            transform: formData.service_type === service.value ? 'scaleY(1)' : 'scaleY(0)',
                            transition: 'transform 0.3s ease'
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ color: service.color, fontSize: '2rem', display: 'flex', alignItems: 'center' }}>
                            {service.icon}
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={600} sx={{ color: 'white', lineHeight: 1.2 }}>
                              {service.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.3 }}>
                              {service.desc}
                            </Typography>
                          </Box>
                          {formData.service_type === service.value && (
                            <CheckIcon sx={{ ml: 'auto', color: service.color }} />
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {errors.service_type && (
                  <Alert severity="error" sx={{ mt: 2 }}>{errors.service_type}</Alert>
                )}
              </Box>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <Box sx={{ 
                animation: 'slideInRight 0.4s ease-out'
              }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, color: 'white' }}>
                  Tell us about yourself
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('name')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'name' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address *"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('email')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'email' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('phone')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'phone' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('company_name')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.company_name}
                      helperText={errors.company_name}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'company_name' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 3: Project Details */}
            {currentStep === 3 && (
              <Box sx={{ 
                animation: 'slideInRight 0.4s ease-out'
              }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, color: 'white' }}>
                  Project Requirements
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Project Requirements *"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('description')}
                      onBlur={() => setHoveredField(null)}
                      error={!!errors.description}
                      helperText={errors.description || `${formData.description.length}/20 characters minimum`}
                      required
                      placeholder="Describe your project requirements, features needed, target audience, etc..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: hoveredField === 'description' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.01)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Budget Range (Optional)"
                      name="budget_range"
                      value={formData.budget_range}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('budget')}
                      onBlur={() => setHoveredField(null)}
                      placeholder="e.g., Rs. 50k-1L, Rs. 1L-5L, Rs. 5L+"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'budget' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Expected Timeline (Optional)"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      onFocus={() => setHoveredField('timeline')}
                      onBlur={() => setHoveredField(null)}
                      placeholder="e.g., 1 month, 3 months, 6 months"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: hoveredField === 'timeline' ? '0 4px 12px rgba(25,118,210,0.2)' : 'none'
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  {errors.submit && (
                    <Grid item xs={12}>
                      <Alert severity="error">{errors.submit}</Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', pt: 3 }}>
              <Button 
                onClick={currentStep === 1 ? onClose : handleBack}
                variant="outlined"
      sx={{
                  transition: 'all 0.3s ease',
                  color: 'rgba(255,255,255,0.7)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    transform: 'translateX(-4px)',
                    borderColor: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<ArrowIcon />}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  Next Step
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6
                    },
                    '&:disabled': {
                      opacity: 0.6
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}
    </Box>
          </form>
        )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CustomServiceFormDialog;
