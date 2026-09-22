import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, TextField, Button,
  CircularProgress, IconButton, Grid, Alert, Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  EventAvailable as BookIcon,
  Settings as SettingsIcon,
  Web as WebIcon,
  Smartphone as AppIcon,
  Code as CodeIcon,
  Videocam as MeetIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { submitCustomServiceRequest } from '../../services/api';
import GoogleBookingEmbed from './GoogleBookingEmbed';

const SERVICE_OPTIONS = [
  { value: 'customization', label: 'ERP customization', icon: <SettingsIcon />, hint: 'Tailor Zenith to your workflow' },
  { value: 'web_development', label: 'Web app', icon: <WebIcon />, hint: 'Portals and dashboards' },
  { value: 'app_development', label: 'Mobile app', icon: <AppIcon />, hint: 'iOS and Android' },
  { value: 'both', label: 'Web + app', icon: <CodeIcon />, hint: 'Full product build' },
];

const TOPIC_CHIPS = ['Retail / POS', 'Education', 'Pharmacy', 'Hotel', 'CRM & leads', 'Integrations'];

const emptyForm = {
  service_type: '',
  name: '',
  email: '',
  phone: '',
  company_name: '',
  description: ''
};

// Two steps, two systems: Step 1 saves the lead in our own CRM (so your team
// has it even if the person never finishes booking) via `description`.
// Step 2 hands off to the REAL Google Calendar Appointment Schedule
// (GoogleBookingEmbed / utils/expertBooking.js) so the actual time slot,
// calendar event, Google Meet link, and confirmation email are all created
// by Google - not simulated by a custom picker that could show a "free"
// slot that isn't actually free on the calendar.
const CustomServiceFormDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('details'); // 'details' | 'schedule'

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleTopic = (topic) => {
    setFormData((prev) => {
      const current = prev.description.split(',').map((item) => item.trim()).filter(Boolean);
      const next = current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic];
      return { ...prev, description: next.join(', ') };
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.service_type) nextErrors.service_type = 'Pick what you want to talk about';
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await submitCustomServiceRequest({
        service_type: formData.service_type,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company_name: formData.company_name.trim(),
        description: formData.description.trim() || 'Free 30-minute consultation requested.',
        timeline: 'Picking exact time via Google Calendar'
      });
      setStep('schedule');
    } catch (error) {
      setErrors({ submit: error.response?.data?.errors || 'Could not save your request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) return;
    setFormData(emptyForm);
    setErrors({});
    setLoading(false);
    setStep('details');
  }, [open]);

  const selectedTopics = formData.description.split(',').map((item) => item.trim()).filter(Boolean);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: '#0d1018',
          color: 'white',
          backgroundImage: 'none',
          maxHeight: '94vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Book a free consultation</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.7)', mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MeetIcon sx={{ fontSize: 18, color: '#00f2fe' }} />
            30-minute Google Meet · India Standard Time
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close consultation form" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{
        pb: 3,
        '& .MuiOutlinedInput-root': {
          background: 'rgba(7, 12, 24, 0.88)',
          color: '#f8fafc',
          '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.45)' },
          '&:hover fieldset': { borderColor: '#4facfe' },
          '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
        },
        '& .MuiInputLabel-root': { color: 'rgba(226, 232, 240, 0.8)' },
      }}>
        {step === 'schedule' ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Thanks {formData.name.split(' ')[0] || 'there'} — we've saved your request. Pick your exact time
              below and Google will email a Meet invite to {formData.email}.
            </Alert>
            <GoogleBookingEmbed height={620} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={onClose}>Done</Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleContinue}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle2" sx={{ color: '#00f2fe', mb: 1.5, letterSpacing: 1 }}>WHAT DO YOU NEED?</Typography>
                <Grid container spacing={1.2} sx={{ mb: 2 }}>
                  {SERVICE_OPTIONS.map((option) => {
                    const selected = formData.service_type === option.value;
                    return (
                      <Grid item xs={6} key={option.value}>
                        <Box
                          role="button"
                          tabIndex={0}
                          onClick={() => setField('service_type', option.value)}
                          onKeyDown={(event) => event.key === 'Enter' && setField('service_type', option.value)}
                          sx={{
                            p: 1.5,
                            height: '100%',
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: selected ? '2px solid #00f2fe' : '1px solid rgba(255,255,255,0.12)',
                            bgcolor: selected ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.04)',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: '#00f2fe', transform: 'translateY(-2px)' }
                          }}
                        >
                          <Box sx={{ color: selected ? '#00f2fe' : '#4facfe', mb: 0.5 }}>{option.icon}</Box>
                          <Typography variant="subtitle2" fontWeight={700}>{option.label}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>{option.hint}</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
                {errors.service_type && <Typography variant="caption" color="error">{errors.service_type}</Typography>}

                <Grid container spacing={1.5} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField fullWidth required label="Your name" name="name" value={formData.name} onChange={(e) => setField('name', e.target.value)} error={!!errors.name} helperText={errors.name} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth required type="email" label="Email" name="email" value={formData.email} onChange={(e) => setField('email', e.target.value)} error={!!errors.email} helperText={errors.email} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={(e) => setField('phone', e.target.value)} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Company" name="company_name" value={formData.company_name} onChange={(e) => setField('company_name', e.target.value)} />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="subtitle2" sx={{ color: '#00f2fe', letterSpacing: 1, mb: 1.5 }}>WHAT SHOULD WE COVER?</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                  {TOPIC_CHIPS.map((topic) => (
                    <Chip
                      key={topic}
                      clickable
                      label={topic}
                      onClick={() => toggleTopic(topic)}
                      variant={selectedTopics.includes(topic) ? 'filled' : 'outlined'}
                      sx={{
                        borderColor: 'rgba(0,242,254,0.4)',
                        color: selectedTopics.includes(topic) ? '#041016' : 'white',
                        bgcolor: selectedTopics.includes(topic) ? '#4facfe' : 'transparent'
                      }}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Anything else we should prepare for the call?"
                  value={formData.description}
                  onChange={(e) => setField('description', e.target.value)}
                  sx={{ mb: 3 }}
                />

                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(0,242,254,0.08)',
                  border: '1px solid rgba(0,242,254,0.2)'
                }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1.5 }}>
                    Next you'll pick your exact time on our live Google Calendar — nothing here reserves a slot yet.
                  </Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BookIcon />}
                    endIcon={!loading && <ArrowIcon />}
                    sx={{ fontWeight: 800 }}
                  >
                    {loading ? 'Saving…' : 'Continue to pick a time'}
                  </Button>
                </Box>
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <Alert severity="error">{String(errors.submit)}</Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomServiceFormDialog;
