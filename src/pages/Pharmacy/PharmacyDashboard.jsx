import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CircularProgress, Avatar } from '@mui/material';
import { 
  LocalPharmacy as PharmacyIcon, 
  LocalShipping as ShippingIcon, 
  Receipt as ReceiptIcon, 
  Description as PrescriptionIcon,
  ShoppingCart as PurchaseIcon,
  EventBusy as ExpiryIcon,
  AssignmentReturn as ReturnIcon,
  CardGiftcard as LoyaltyIcon
} from '@mui/icons-material';

import api from '../../services/api';
import useUrlTab from '../../hooks/useUrlTab';

// Modularized Tabs
import PharmacyInventoryTab from './components/PharmacyInventoryTab';
import PharmacySuppliersTab from './components/PharmacySuppliersTab';
import PharmacyPrescriptionsTab from './components/PharmacyPrescriptionsTab';
import PharmacyBillingTab from './components/PharmacyBillingTab';
import PharmacyPurchaseTab from './components/PharmacyPurchaseTab';
import PharmacyExpiryTab from './components/PharmacyExpiryTab';
import PharmacyReturnsTab from './components/PharmacyReturnsTab';
import PharmacyLoyaltyTab from './components/PharmacyLoyaltyTab';

const PHARMACY_TABS = ['inventory', 'suppliers', 'prescriptions', 'billing', 'purchases', 'expiry', 'returns', 'loyalty'];

const PharmacyDashboard = () => {
  const [tab, setTab] = useUrlTab(PHARMACY_TABS);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: 'primary.main' }}>
        Pharmacy Management
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
                Role: {userProfile.role ? userProfile.role.toUpperCase() : 'PHARMACY ADMIN'}
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
          <Tab icon={<PharmacyIcon />} label="Medicines Inventory" />
          <Tab icon={<ShippingIcon />} label="Suppliers" />
          <Tab icon={<PrescriptionIcon />} label="Prescriptions" />
          <Tab icon={<ReceiptIcon />} label="Billing" />
          <Tab icon={<PurchaseIcon />} label="Purchase Orders" />
          <Tab icon={<ExpiryIcon />} label="Expiry & Batches" />
          <Tab icon={<ReturnIcon />} label="Returns" />
          <Tab icon={<LoyaltyIcon />} label="Loyalty" />
        </Tabs>
      </Box>

      <Box sx={{ minHeight: 400 }}>
        {tab === 0 && <PharmacyInventoryTab />}
        {tab === 1 && <PharmacySuppliersTab />}
        {tab === 2 && <PharmacyPrescriptionsTab />}
        {tab === 3 && <PharmacyBillingTab />}
        {tab === 4 && <PharmacyPurchaseTab />}
        {tab === 5 && <PharmacyExpiryTab />}
        {tab === 6 && <PharmacyReturnsTab />}
        {tab === 7 && <PharmacyLoyaltyTab />}
      </Box>
    </Box>
  );
};

export default PharmacyDashboard;