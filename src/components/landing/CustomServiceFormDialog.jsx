import React, { useMemo, useState, useEffect } from 'react';
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
  Videocam as MeetIcon
} from '@mui/icons-material';
import { submitCustomServiceRequest } from '../../services/api';

const SERVICE_OPTIONS = [
  { value: 'customization', label: 'ERP customization', icon: <SettingsIcon />, hint: 'Tailor Zenith to your workflow' },
  { value: 'web_development', label: 'Web app', icon: <WebIcon />, hint: 'Portals and dashboards' },
  { value: 'app_development', label: 'Mobile app', icon: <AppIcon />, hint: 'iOS and Android' },
  { value: 'both', label: 'Web + app', icon: <CodeIcon />, hint: 'Full product build' },
];

const TOPIC_CHIPS = ['Retail / POS', 'Education', 'Pharmacy', 'Hotel', 'CRM & leads', 'Integrations'];

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

const istParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return {
    iso: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: get('weekday'),
    day: Number(get('day')),
    month: get('month')
  };
};

const addDaysIso = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d + days, 6, 30);
  return istParts(new Date(utc));
};

const monthLabel = (iso) => new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  month: 'long',
  year: 'numeric'
}).format(new Date(`${iso}T12:00:00+05:30`));

const slotDateTime = (date, time) => new Date(`${date}T${time}:00+05:30`);

const formatSlot = (date, time) => new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit'
}).format(slotDateTime(date, time));

const formatTimeChip = (time) => {
  const [h, min] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${min.toString().padStart(2, '0')} ${suffix}`;
};

const CustomServiceFormDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedSlot, setBookedSlot] = useState('');
  const [weekStart, setWeekStart] = useState(istParts().iso);

  const today = istParts().iso;

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDaysIso(weekStart, index)),
    [weekStart]
  );

  const availableTimes = useMemo(() => {
    if (!formData.appointment_date) return [];
    return TIME_SLOTS.filter((time) => slotDateTime(formData.appointment_date, time).getTime() > Date.now() + 30 * 60 * 1000);
  }, [formData.appointment_date]);

  const canGoBack = weekStart > today;
  const canGoForward = addDaysIso(weekStart, 7).iso <= addDaysIso(today, 21).iso;

  const canBook = Boolean(
    formData.service_type &&
    formData.name.trim() &&
    formData.email.trim() &&
    formData.appointment_date &&
    formData.appointment_time &&
    availableTimes.includes(formData.appointment_time)
  );

  const setField = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'appointment_date') next.appointment_time = '';
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: '', appointment: '' }));
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
    if (!formData.appointment_date || !formData.appointment_time) {
      nextErrors.appointment = 'Select a date and a time slot to book';
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
        description: formData.description.trim() || 'Free 30-minute consultation requested.',
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
    setWeekStart(istParts().iso);
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
        {success ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <BookIcon sx={{ fontSize: 72, color: '#00e676', mb: 2 }} />
            <Typography variant="h6" fontWeight={800} gutterBottom>You are booked</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
              {bookedSlot} IST. A Google Meet link will be sent to {formData.email}.
            </Typography>
            <Button variant="contained" onClick={onClose}>Done</Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleBook}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ color: '#00f2fe', letterSpacing: 1 }}>PICK A SLOT</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button size="small" disabled={!canGoBack} onClick={() => setWeekStart(addDaysIso(weekStart, -7).iso)} sx={{ minWidth: 36, color: 'white' }}>{'‹'}</Button>
                    <Typography variant="body2" sx={{ minWidth: 130, textAlign: 'center' }}>{monthLabel(weekStart)}</Typography>
                    <Button size="small" disabled={!canGoForward} onClick={() => setWeekStart(addDaysIso(weekStart, 7).iso)} sx={{ minWidth: 36, color: 'white' }}>{'›'}</Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.8, mb: 2 }}>
                  {days.map((day) => {
                    const selected = formData.appointment_date === day.iso;
                    const isPast = day.iso < today;
                    return (
                      <Box
                        key={day.iso}
                        onClick={() => !isPast && setField('appointment_date', day.iso)}
                        sx={{
                          py: 1.2,
                          textAlign: 'center',
                          borderRadius: 2,
                          cursor: isPast ? 'not-allowed' : 'pointer',
                          opacity: isPast ? 0.35 : 1,
                          border: selected ? '2px solid #00f2fe' : '1px solid rgba(255,255,255,0.1)',
                          bgcolor: selected ? 'rgba(0,242,254,0.16)' : 'rgba(255,255,255,0.03)',
                          '&:hover': isPast ? {} : { borderColor: '#4facfe' }
                        }}
                      >
                        <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.55)' }}>{day.weekday}</Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>{day.day}</Typography>
                      </Box>
                    );
                  })}
                </Box>

                {!formData.appointment_date ? (
                  <Box sx={{ p: 3, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.2)', textAlign: 'center', color: 'rgba(255,255,255,0.55)' }}>
                    Tap a date to see open 30-minute times
                  </Box>
                ) : availableTimes.length === 0 ? (
                  <Alert severity="info">No remaining slots on this date. Pick another day.</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableTimes.map((time) => {
                      const selected = formData.appointment_time === time;
                      return (
                        <Chip
                          key={time}
                          clickable
                          label={formatTimeChip(time)}
                          onClick={() => setField('appointment_time', time)}
                          sx={{
                            fontWeight: 700,
                            bgcolor: selected ? '#00f2fe' : 'rgba(255,255,255,0.08)',
                            color: selected ? '#041016' : 'white',
                            '&:hover': { bgcolor: selected ? '#4facfe' : 'rgba(0,242,254,0.2)' }
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                {errors.appointment && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>{errors.appointment}</Typography>}

                <Typography variant="subtitle2" sx={{ color: '#00f2fe', letterSpacing: 1, mt: 3, mb: 1 }}>WHAT SHOULD WE COVER?</Typography>
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
                />
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <Alert severity="error">{String(errors.submit)}</Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(0,242,254,0.08)',
                  border: '1px solid rgba(0,242,254,0.2)'
                }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    {formData.appointment_date && formData.appointment_time
                      ? `Selected: ${formatSlot(formData.appointment_date, formData.appointment_time)} IST`
                      : 'Select a date and time to enable booking'}
                  </Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!canBook || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BookIcon />}
                    sx={{ fontWeight: 800, px: 4, whiteSpace: 'nowrap' }}
                  >
                    {loading ? 'Booking…' : 'Book consultation'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomServiceFormDialog;
