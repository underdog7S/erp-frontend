import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CircularProgress, Avatar } from '@mui/material';
import { 
  Business as BusinessIcon, 
  People as PeopleIcon, 
  Receipt as ReceiptIcon, 
  Settings as SettingsIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

import api from '../services/api';

// Modularized Tabs
import AdminTenantsTab from './Admin/components/AdminTenantsTab';
import AdminBillingTab from './Admin/components/AdminBillingTab';
import AdminUsersTab from './Admin/components/AdminUsersTab';
import AdminSettingsTab from './Admin/components/AdminSettingsTab';

const AdminEnhanced = () => {
  const [tab, setTab] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0f0c29' }}>
        <CircularProgress sx={{ color: '#00f2fe' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0c29', color: 'white', pt: 4, pb: 8, px: { xs: 2, md: 6 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        
        {/* Admin Header */}
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h3" fontWeight="800" sx={{ 
              background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
              mb: 1
            }}>
              Master Control System
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600 }}>
              Global management panel for all tenants, users, and infrastructure configuration across the ZenERP ecosystem.
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
                  {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : <SecurityIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="white">
                    {userProfile.first_name} {userProfile.last_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#00f2fe', textTransform: 'uppercase', letterSpacing: 1 }}>
                    System Administrator
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Custom Admin Tabs */}
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
            <Tab icon={<BusinessIcon />} iconPosition="start" label="Tenants" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Users & Roles" />
            <Tab icon={<ReceiptIcon />} iconPosition="start" label="Billing & Subscriptions" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Platform Settings" />
          </Tabs>
        </Box>

        {/* Tab Contents rendered with fade-in effect */}
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
          {tab === 0 && <AdminTenantsTab />}
          {tab === 1 && <AdminUsersTab />}
          {tab === 2 && <AdminBillingTab />}
          {tab === 3 && <AdminSettingsTab />}
        </Box>

      </Box>
    </Box>
  );
};

export default AdminEnhanced;