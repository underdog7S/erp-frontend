import React, { useMemo, useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, TextField, Button,
  CircularProgress, IconButton, Grid, Alert, MenuItem
} from '@mui/material';
import { Close as CloseIcon, EventAvailable as BookIcon } from '@mui/icons-material';
import { submitCustomServiceRequest } from '../../services/api';

const SERVICE_OPTIONS = [
  { value: 'customization', label: 'Customization' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'app_development', label: 'App Development' },
  { value: 'both', label: 'Web + App' },
];

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

const emptyForm = {
  service_type: '',
  name: '',
  email: '',
  phone: '',
  company_name: '',
  description: '',
  appointment_date: '',
  appointment_time: ''
};

const todayIso = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

const slotDateTime = (date, time) => new Date(`${date}T${time}:00+05:30`);

const formatSlot = (date, time) => {
  const dt = slotDateTime(date, time);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(dt);
};

const CustomServiceFormDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedSlot, setBookedSlot] = useState('');

  const minDate = todayIso();

  const availableTimes = useMemo(() => {
    if (!formData.appointment_date) return [];
    return TIME_SLOTS.filter((time) => slotDateTime(formData.appointment_date, time).getTime() > Date.now() + 30 * 60 * 1000);
  }, [formData.appointment_date]);

  const canBook = Boolean(
    formData.service_type &&
    formData.name.trim() &&
    formData.email.trim() &&
    formData.appointment_date &&
    formData.appointment_time &&
    availableTimes.includes(formData.appointment_time)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'appointment_date') next.appointment_time = '';
      return next;
    });
    if (errors[name] || errors.appointment) {
      setErrors((prev) => ({ ...prev, [name]: '', appointment: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.service_type) nextErrors.service_type = 'Select a service';
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email';
    if (!formData.appointment_date || !formData.appointment_time) {
      nextErrors.appointment = 'Select a date and time before booking';
    } else if (!availableTimes.includes(formData.appointment_time)) {
      nextErrors.appointment = 'That time is no longer available. Choose another slot.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleBook = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const slotLabel = formatSlot(formData.appointment_date, formData.appointment_time);
    try {
      await submitCustomServiceRequest({
        service_type: formData.service_type,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company_name: formData.company_name.trim(),
        description: formData.description.trim() || `Free 30-minute consultation requested.`,
        timeline: `Appointment: ${slotLabel} (IST)`
      });
      setBookedSlot(slotLabel);
      setSuccess(true);
    } catch (error) {
      setErrors({ submit: error.response?.data?.errors || 'Could not book this consultation. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) return;
    setFormData(emptyForm);
    setErrors({});
    setLoading(false);
    setSuccess(false);
    setBookedSlot('');
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: '#12121c',
          color: 'white',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
        <Typography variant="h5" fontWeight={700}>Book a free consultation</Typography>
        <IconButton onClick={onClose} aria-label="Close consultation form" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{
        pb: 3,
        '& .MuiOutlinedInput-root': {
          background: 'rgba(7, 12, 24, 0.88)',
          color: '#f8fafc',
          '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.55)' },
          '&:hover fieldset': { borderColor: '#4facfe' },
          '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
        },
        '& .MuiInputLabel-root': { color: 'rgba(226, 232, 240, 0.8)' },
        '& .MuiSelect-icon': { color: 'rgba(226, 232, 240, 0.8)' },
      }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <BookIcon sx={{ fontSize: 64, color: '#00e676', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>Consultation booked</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
              {bookedSlot}. We will send a 30-minute Google Meet invitation to your email.
            </Typography>
            <Button variant="contained" onClick={onClose}>Done</Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleBook}>
            <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.8)', mb: 3 }}>
              30-minute Google Meet. Choose a date and time, then book. Booking is disabled until a slot is selected.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Service"
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  error={!!errors.service_type}
                  helperText={errors.service_type}
                >
                  {SERVICE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Your name" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="email" label="Email" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Company" name="company_name" value={formData.company_name} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Appointment date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  error={!!errors.appointment}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: minDate }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Appointment time (IST)"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  error={!!errors.appointment}
                  helperText={errors.appointment || 'India Standard Time'}
                  disabled={!formData.appointment_date || availableTimes.length === 0}
                >
                  {availableTimes.length === 0 && formData.appointment_date && (
                    <MenuItem value="" disabled>No remaining slots on this date</MenuItem>
                  )}
                  {availableTimes.map((time) => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="What should we cover? (optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Industry, workflow, or what you want from the call"
                />
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <Alert severity="error">{String(errors.submit)}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!canBook || loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BookIcon />}
                  sx={{ fontWeight: 800, py: 1.4 }}
                >
                  {loading ? 'Booking…' : 'Book consultation'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomServiceFormDialog;
