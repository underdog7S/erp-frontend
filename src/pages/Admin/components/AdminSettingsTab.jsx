import React from 'react';
import { Box, Typography, Card, CardContent, Divider, Switch, FormControlLabel, Button } from '@mui/material';

const AdminSettingsTab = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>Platform Settings</Typography>
      
      <Card elevation={0} sx={{ bgcolor: '#1a1a24', color: 'white', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Security & Authentication</Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
          
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel 
              control={<Switch defaultChecked color="info" />} 
              label="Require Two-Factor Authentication (2FA) for Admins" 
            />
            <FormControlLabel 
              control={<Switch defaultChecked color="info" />} 
              label="Enable SSO via Google Workspace" 
            />
            <FormControlLabel 
              control={<Switch color="info" />} 
              label="Strict IP Allowlisting" 
            />
          </Box>
          <Button variant="contained" sx={{ mt: 3, background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'white' }}>Save Security Preferences</Button>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ bgcolor: '#1a1a24', color: 'white', border: '1px solid rgba(255,255,255,0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Payment Gateway (Razorpay)</Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
          
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
            Manage the global API keys for your master Razorpay account. This allows you to collect subscription fees from tenants.
          </Typography>
          
          <Button variant="outlined" sx={{ color: '#00f2fe', borderColor: '#00f2fe' }}>Configure Razorpay</Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSettingsTab;
