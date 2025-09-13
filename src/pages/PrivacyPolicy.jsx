import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const PrivacyPolicy = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
    <Typography variant="h3" color="primary" gutterBottom>Privacy Policy</Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Your privacy is important to us. At Zenith ERP, we only collect the data necessary to provide our services and improve user experience.
    </Typography>
    <List>
      <ListItem><ListItemIcon><LockIcon color="success" /></ListItemIcon><ListItemText primary="We never sell or share your data with third parties." /></ListItem>
      <ListItem><ListItemIcon><LockIcon color="success" /></ListItemIcon><ListItemText primary="All user data is encrypted and securely stored on Oracle Cloud." /></ListItem>
      <ListItem><ListItemIcon><LockIcon color="success" /></ListItemIcon><ListItemText primary="You can request deletion of your data at any time." /></ListItem>
    </List>
    <Typography variant="body2" sx={{ mt: 2 }}>
      By using Zenith ERP, you consent to our collection and use of your data as outlined here.
    </Typography>
  </Box>
);

export default PrivacyPolicy; 