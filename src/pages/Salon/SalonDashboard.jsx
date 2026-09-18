import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CircularProgress, Avatar, Button } from '@mui/material';
import { 
  ContentCut as ContentCutIcon, 
  EventNote as EventNoteIcon, 
  Group as GroupIcon, 
  Spa as SpaIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Modularized Tabs
import SalonAppointmentsTab from './components/SalonAppointmentsTab';
import SalonStaffTab from './components/SalonStaffTab';
import SalonCommissionTab from './components/SalonCommissionTab';
import SalonServicesTab from './components/SalonServicesTab';

const SalonDashboard = () => {
  const [tab, setTab] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const profRes = await api.get('/users/me/').catch(() => ({ data: {} }));
        setUserProfile(profRes.data);
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchGlobalData();
  }, []);

  if (loadingInitial) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'transparent' }}>
        <CircularProgress sx={{ color: '#00f2fe' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', color: 'white', pt: 4, pb: 8, px: { xs: 2, md: 6 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, '&:hover': { color: 'white' } }}
        >
          Back to Main Dashboard
        </Button>

        {/* Zenith Header */}
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h3" fontWeight="800" sx={{ 
              background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
              mb: 1
            }}>
              Salon Engine
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600 }}>
              Seamlessly manage your appointments, stylists, and service offerings with Zenith beauty infrastructure.
            </Typography>
          </Box>
          
          {userProfile && (
            <Card elevation={0} sx={{ 
              bgcolor: 'rgba(255,255,255,0.03)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              minWidth: 250
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(45deg, #00f2fe, #4facfe)' }}>
                  {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : <ContentCutIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="white">
                    {userProfile.first_name} {userProfile.last_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#00f2fe', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Salon Manager
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Custom Zenith Tabs */}
        <Box sx={{ mb: 4, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)} 
            variant="scrollable" 
            scrollButtons="auto"
            TabIndicatorProps={{ style: { background: 'linear-gradient(45deg, #00f2fe, #4facfe)', height: 3 } }}
            sx={{ 
              '& .MuiTab-root': { 
                color: 'rgba(255,255,255,0.5)', 
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 64
              },
              '& .Mui-selected': { 
                color: '#00f2fe !important'
              }
            }}
          >
            <Tab icon={<EventNoteIcon />} iconPosition="start" label="Appointments" />
            <Tab icon={<GroupIcon />} iconPosition="start" label="Stylist Roster" />
            <Tab icon={<SpaIcon />} iconPosition="start" label="Services Menu" />
            <Tab icon={<GroupIcon />} iconPosition="start" label="Commissions" />
          </Tabs>
        </Box>

        {/* Tab Contents */}
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
          {tab === 0 && <SalonAppointmentsTab />}
          {tab === 1 && <SalonStaffTab />}
          {tab === 2 && <SalonServicesTab />}
          {tab === 3 && <SalonCommissionTab />}
        </Box>

      </Box>
    </Box>
  );
};

export default SalonDashboard;
