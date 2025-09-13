import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';

const Terms = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
    <Typography variant="h3" color="primary" gutterBottom>Terms & Conditions</Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      By registering and using Zenith ERP, you agree to the following:
    </Typography>
    <List>
      <ListItem><ListItemIcon><GavelIcon color="success" /></ListItemIcon><ListItemText primary="You are responsible for managing access to your organization's data." /></ListItem>
      <ListItem><ListItemIcon><GavelIcon color="success" /></ListItemIcon><ListItemText primary="Zenith ERP is not liable for any business decisions made based on reports or analytics provided." /></ListItem>
      <ListItem><ListItemIcon><GavelIcon color="success" /></ListItemIcon><ListItemText primary="Plans may change and pricing may be updated with prior notice." /></ListItem>
      <ListItem><ListItemIcon><GavelIcon color="success" /></ListItemIcon><ListItemText primary="Abuse of services or violation of fair usage policies may result in account suspension." /></ListItem>
    </List>
    <Typography variant="body2" sx={{ mt: 2 }}>
      You retain full ownership of your data. We provide you with access and tools to manage it securely.
    </Typography>
  </Box>
);

export default Terms; 