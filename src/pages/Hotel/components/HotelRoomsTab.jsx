import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Grid, Card, CardContent, Chip } from '@mui/material';
import api from '../../../services/api';

const HotelRoomsTab = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hotel/rooms/");
      setRooms(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'AVAILABLE': return '#4caf50';
      case 'OCCUPIED': return '#f44336';
      case 'DIRTY': return '#ff9800';
      case 'MAINTENANCE': return '#9e9e9e';
      default: return '#00f2fe';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Room Matrix</Typography>
        <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'white' }}>Add Room</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Grid container spacing={2}>
          {rooms.map(room => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={room.id}>
              <Card elevation={0} sx={{ 
                bgcolor: '#1a1a24', 
                borderTop: `4px solid ${getStatusColor(room.status)}`,
                color: 'white' 
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" fontWeight="bold">{room.number}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 1 }}>{room.type}</Typography>
                  <Chip size="small" label={room.status} sx={{ 
                    bgcolor: `${getStatusColor(room.status)}22`, 
                    color: getStatusColor(room.status),
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default HotelRoomsTab;
