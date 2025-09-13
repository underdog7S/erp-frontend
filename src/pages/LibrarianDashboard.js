import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';

const LibrarianDashboard = () => {
  // Mock data for demonstration
  const stats = {
    totalBooks: 4200,
    issuedBooks: 320,
    returnedBooks: 310,
    overdueAlerts: 5,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Librarian Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome! Here are your key library stats and quick actions.
      </Typography>
      <Grid container spacing={3} mb={3}>
        <Grid gridColumn="span 4">
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <LibraryBooksIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.totalBooks}</Typography>
                  <Typography variant="body2">Total Books</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 4">
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AssignmentTurnedInIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.issuedBooks}</Typography>
                  <Typography variant="body2">Issued Books</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 4">
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AssignmentReturnIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.returnedBooks}</Typography>
                  <Typography variant="body2">Returned Books</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 4">
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <NotificationsIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.overdueAlerts}</Typography>
                  <Typography variant="body2">Overdue Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3} mb={3}>
        <Grid gridColumn="span 9">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Book Inventory Management
              </Typography>
              <Box display="flex" gap={2}>
                <Button variant="contained" color="primary" startIcon={<AddIcon />}>Add Book</Button>
                <Button variant="outlined" color="primary">View All Books</Button>
                <Button variant="outlined" color="success">View Issued Books</Button>
                <Button variant="outlined" color="info">View Returned Books</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid gridColumn="span 3">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="outlined" color="warning">View Overdue Alerts</Button>
                <Button variant="outlined" color="primary">Download Inventory Report</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LibrarianDashboard; 