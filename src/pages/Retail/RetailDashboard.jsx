import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CircularProgress, Avatar, Button } from '@mui/material';
import { 
  Inventory as InventoryIcon, 
  PointOfSale as SalesIcon, 
  People as PeopleIcon, 
  Timeline as TimelineIcon,
  LocalShipping as ShippingIcon,
  ArrowBack as ArrowBackIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useUrlTab from '../../hooks/useUrlTab';

// Modularized Tabs
import RetailInventoryTab from './components/RetailInventoryTab';
import RetailSalesTab from './components/RetailSalesTab';
import RetailCustomersTab from './components/RetailCustomersTab';
import RetailAnalyticsTab from './components/RetailAnalyticsTab';
import RetailTransitTab from './components/RetailTransitTab';
import RetailProcurementTab from './components/RetailProcurementTab';

const RETAIL_TABS = ['inventory', 'sales', 'customers', 'analytics', 'transit', 'procurement'];

const RetailDashboard = () => {
  const [tab, setTab] = useUrlTab(RETAIL_TABS);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const profRes = await api.get('/users/me/').catch(() => ({ data: {} }));
        setUserProfile(profRes.data);
      } catch (err) {
        console.error('Error loading profile', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchGlobalData();
  }, []);

  if (loadingInitial) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', color: 'text.primary', pt: 4, pb: 8, px: { xs: 2, md: 6 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'text.secondary', mb: 2, '&:hover': { color: 'text.primary' } }}
        >
          Back to Main Dashboard
        </Button>

        {/* Header */}
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight="800" sx={{
              background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
              mb: 1,
            }}>
              Retail Engine
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
              Manage inventory, process sales, track customers, and monitor stock transit across your branches.
            </Typography>
          </Box>

          {userProfile && (
            <Card elevation={0} sx={{
              bgcolor: 'background.paper',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              minWidth: 240,
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(45deg, #00f2fe, #4facfe)' }}>
                  {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : <StorefrontIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    {userProfile.first_name} {userProfile.last_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {userProfile.role ? userProfile.role.replace(/_/g, ' ') : 'Retail Admin'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ style: { background: 'linear-gradient(45deg, #00f2fe, #4facfe)', height: 3 } }}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
                color: 'text.secondary',
                '&.Mui-selected': { color: 'primary.main' },
              },
            }}
          >
            <Tab icon={<InventoryIcon />} iconPosition="start" label="Inventory" />
            <Tab icon={<SalesIcon />} iconPosition="start" label="Sales & POS" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Customers" />
            <Tab icon={<TimelineIcon />} iconPosition="start" label="Analytics" />
            <Tab icon={<ShippingIcon />} iconPosition="start" label="Transit" />
          <Tab icon={<InventoryIcon />} iconPosition="start" label="Procurement" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box>
          {tab === 0 && <RetailInventoryTab />}
          {tab === 1 && <RetailSalesTab />}
          {tab === 2 && <RetailCustomersTab />}
          {tab === 3 && <RetailAnalyticsTab />}
          {tab === 4 && <RetailTransitTab />}
          {tab === 5 && <RetailProcurementTab />}
        </Box>

      </Box>
    </Box>
  );
};

export default RetailDashboard;