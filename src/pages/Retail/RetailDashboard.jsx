import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CircularProgress, Avatar } from '@mui/material';
import { 
  Inventory as InventoryIcon, 
  PointOfSale as SalesIcon, 
  People as PeopleIcon, 
  Timeline as TimelineIcon
} from '@mui/icons-material';

import api from '../../services/api';

// Modularized Tabs
import RetailInventoryTab from './components/RetailInventoryTab';
import RetailSalesTab from './components/RetailSalesTab';
import RetailCustomersTab from './components/RetailCustomersTab';
import RetailAnalyticsTab from './components/RetailAnalyticsTab';

const RetailDashboard = () => {
  const [tab, setTab] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const profRes = await api.get('/users/profile/').catch(() => ({ data: {} }));
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: 'primary.main' }}>
        Retail Management
      </Typography>
      
      {userProfile && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6">{userProfile.first_name} {userProfile.last_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Role: {userProfile.role ? userProfile.role.toUpperCase() : 'RETAIL ADMIN'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { fontWeight: 'bold' } }}
        >
          <Tab icon={<InventoryIcon />} label="Inventory" />
          <Tab icon={<SalesIcon />} label="Sales & POS" />
          <Tab icon={<PeopleIcon />} label="Customers" />
          <Tab icon={<TimelineIcon />} label="Analytics" />
        </Tabs>
      </Box>

      <Box sx={{ minHeight: 400 }}>
        {tab === 0 && <RetailInventoryTab />}
        {tab === 1 && <RetailSalesTab />}
        {tab === 2 && <RetailCustomersTab />}
        {tab === 3 && <RetailAnalyticsTab />}
      </Box>
    </Box>
  );
};

export default RetailDashboard;