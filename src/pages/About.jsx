import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const About = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
    <Typography variant="h3" color="primary" gutterBottom>About Zenith ERP</Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Zenith ERP is a cloud-based enterprise resource planning (ERP) software built to simplify and automate business operations across various industries including <b>Education</b>, <b>Manufacturing</b>.
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      We provide a <b>secure, scalable</b>, and <b>industry-specific ERP</b> experience tailored for small and medium-sized businesses.
    </Typography>
    <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Our Mission</Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      To empower organizations with smart, efficient, and modular ERP systems that grow with their business.
    </Typography>
    <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Why Zenith?</Typography>
    <List>
      <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Industry-specific dashboards" /></ListItem>
      <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Hosted securely on Oracle Cloud" /></ListItem>
      <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Scalable with your growth" /></ListItem>
      <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Simple enough for non-technical users" /></ListItem>
    </List>
  </Box>
);

export default About; 