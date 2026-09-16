import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UpgradeIcon from '@mui/icons-material/Upgrade';

/**
 * Component to display feature permission error with upgrade prompt
 */
const FeaturePermissionAlert = ({ errorMessage, moduleName }) => {
  const navigate = useNavigate();

  return (
    <Alert 
      severity="warning" 
      sx={{ mb: 3 }}
      action={
        <Button 
          color="inherit" 
          size="small" 
          startIcon={<UpgradeIcon />}
          onClick={() => navigate('/pricing')}
        >
          Upgrade Plan
        </Button>
      }
    >
      <AlertTitle>Feature Not Available</AlertTitle>
      {errorMessage || `${moduleName || 'This feature'} module is not available in your current plan. Please upgrade to access this feature.`}
    </Alert>
  );
};

export default FeaturePermissionAlert;

