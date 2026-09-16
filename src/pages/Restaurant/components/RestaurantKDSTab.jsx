import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Card, CardContent, Chip } from '@mui/material';
import api from '../../../services/api';

const RestaurantKDSTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/restaurant/kitchen-orders/");
      setOrders(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load active orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleMarkComplete = async (orderId) => {
    try {
      await api.put(`/restaurant/kitchen-orders/${orderId}/`, { status: 'COMPLETED' });
      fetchOrders();
    } catch {
      alert('Failed to update status.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Kitchen Display System (KDS)</Typography>
        <Button variant="outlined" sx={{ color: '#00f2fe', borderColor: '#00f2fe' }} onClick={fetchOrders}>Refresh Screen</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Grid container spacing={3}>
          {orders.length === 0 && <Typography sx={{ color: 'white', ml: 2 }}>No active orders in the kitchen.</Typography>}
          {orders.map(order => (
            <Grid item xs={12} sm={6} md={4} key={order.id}>
              <Card elevation={0} sx={{ bgcolor: '#2a1a1a', border: '1px solid #ff4b4b', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Order #{order.id}</Typography>
                    <Chip label="PREPARING" sx={{ bgcolor: 'rgba(255, 75, 75, 0.2)', color: '#ff4b4b' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>Table {order.table_number || 'Takeaway'}</Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    {order.items && order.items.map((item, idx) => (
                      <Typography key={idx}>- {item.quantity}x {item.name}</Typography>
                    ))}
                  </Box>

                  <Button variant="contained" color="success" fullWidth onClick={() => handleMarkComplete(order.id)}>
                    Mark Ready
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

export default RestaurantKDSTab;
