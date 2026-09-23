import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CircularProgress, Avatar, Button } from '@mui/material';
import {
  Dashboard as OverviewIcon,
  Category as RawMaterialIcon,
  Inventory as FinishedGoodIcon,
  AccountTree as BomIcon,
  PrecisionManufacturing as ProductionIcon,
  LocalShipping as ProcurementIcon,
  PointOfSale as SalesIcon,
  VerifiedUser as QualityIcon,
  ArrowBack as ArrowBackIcon,
  Factory as FactoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import ManufacturingOverviewTab from './components/ManufacturingOverviewTab';
import RawMaterialsTab from './components/RawMaterialsTab';
import FinishedGoodsTab from './components/FinishedGoodsTab';
import BillOfMaterialsTab from './components/BillOfMaterialsTab';
import ProductionOrdersTab from './components/ProductionOrdersTab';
import ProcurementTab from './components/ProcurementTab';
import SalesTab from './components/SalesTab';
import QualityControlTab from './components/QualityControlTab';

const ManufacturingDashboard = () => {
  const [tab, setTab] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me/').catch(() => ({ data: {} }));
        setUserProfile(res.data);
      } catch (err) {
        console.error('Error loading profile', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchProfile();
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

        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight="800" sx={{
              background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
              mb: 1,
            }}>
              Manufacturing Engine
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640 }}>
              Raw materials, Bill of Materials, production orders, quality control, and wholesale sales - end to end.
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
                  {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : <FactoryIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    {userProfile.first_name} {userProfile.last_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {userProfile.role ? userProfile.role.replace(/_/g, ' ') : 'Manufacturing Admin'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

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
            <Tab icon={<OverviewIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<RawMaterialIcon />} iconPosition="start" label="Raw Materials" />
            <Tab icon={<FinishedGoodIcon />} iconPosition="start" label="Finished Goods" />
            <Tab icon={<BomIcon />} iconPosition="start" label="Bill of Materials" />
            <Tab icon={<ProductionIcon />} iconPosition="start" label="Production Orders" />
            <Tab icon={<ProcurementIcon />} iconPosition="start" label="Procurement" />
            <Tab icon={<SalesIcon />} iconPosition="start" label="Sales" />
            <Tab icon={<QualityIcon />} iconPosition="start" label="Quality Control" />
          </Tabs>
        </Box>

        <Box>
          {tab === 0 && <ManufacturingOverviewTab />}
          {tab === 1 && <RawMaterialsTab />}
          {tab === 2 && <FinishedGoodsTab />}
          {tab === 3 && <BillOfMaterialsTab />}
          {tab === 4 && <ProductionOrdersTab />}
          {tab === 5 && <ProcurementTab />}
          {tab === 6 && <SalesTab />}
          {tab === 7 && <QualityControlTab />}
        </Box>

      </Box>
    </Box>
  );
};

export default ManufacturingDashboard;
