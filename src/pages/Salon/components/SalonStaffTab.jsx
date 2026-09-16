import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Card, CardContent, Avatar } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import api from '../../../services/api';

const SalonStaffTab = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get("/salon/staff/");
      setStaff(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load staff roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Stylist Roster</Typography>
        <Button variant="outlined" sx={{ color: '#00f2fe', borderColor: '#00f2fe' }}>Add Stylist</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Grid container spacing={3}>
          {staff.length === 0 && <Typography sx={{ color: 'white', ml: 2 }}>No staff registered.</Typography>}
          {staff.map(member => (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid rgba(255,255,255,0.05)', color: 'white' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(0, 242, 254, 0.2)', color: '#00f2fe', width: 56, height: 56 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{member.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>{member.specialty || 'General Stylist'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SalonStaffTab;
