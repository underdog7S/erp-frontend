import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import RazorpaySetupWizard from '../components/RazorpaySetupWizard';

const RazorpaySettings = () => {
  const handleComplete = () => {
    // Setup completed successfully
    // Optionally refresh the page or show success message
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Razorpay Payment Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure your Razorpay payment gateway to accept online payments from customers across all sectors.
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <RazorpaySetupWizard onComplete={handleComplete} />
      </Box>
    </Container>
  );
};

export default RazorpaySettings;

