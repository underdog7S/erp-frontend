import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Card, CardContent, Chip } from '@mui/material';
import api from '../../../services/api';

const HotelHousekeepingTab = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hotel/housekeeping/");
      setTasks(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load housekeeping tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleMarkClean = async (roomId) => {
    try {
      await api.put(`/hotel/rooms/${roomId}/`, { status: 'CLEAN' });
      fetchTasks();
    } catch {
      alert('Failed to update room status.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Housekeeping Dispatch</Typography>
        <Button variant="outlined" sx={{ color: '#00f2fe', borderColor: '#00f2fe' }} onClick={fetchTasks}>Refresh Schedule</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Grid container spacing={3}>
          {tasks.length === 0 && <Typography sx={{ color: 'white', ml: 2 }}>All rooms are clean.</Typography>}
          {tasks.map(task => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card elevation={0} sx={{ bgcolor: '#2a1a1a', border: '1px solid #ff9800', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Room {task.room_number}</Typography>
                    <Chip label="DIRTY" sx={{ bgcolor: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>Guest checked out at {task.checkout_time || 'N/A'}</Typography>
                  
                  <Button variant="contained" color="success" fullWidth onClick={() => handleMarkClean(task.room_id)}>
                    Mark as Clean
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default HotelHousekeepingTab;
