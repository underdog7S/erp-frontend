import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Card, CardContent, TextField, Chip, Divider } from '@mui/material';
import api from '../../../services/api';

const RestaurantPOSTab = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get("/restaurant/menu/");
      setMenuItems(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, height: '70vh' }}>
      {/* Menu Area */}
      <Box sx={{ flex: 2, overflowY: 'auto' }}>
        <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>Point of Sale</Typography>
        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
          <Grid container spacing={2}>
            {menuItems.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    bgcolor: '#1a1a24', color: 'white', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                    '&:hover': { borderColor: '#00f2fe' }
                  }}
                  onClick={() => addToCart(item)}
                >
                  <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" sx={{ color: '#00f2fe' }}>${item.price}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Cart Area */}
      <Box sx={{ flex: 1, bgcolor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Current Order</Typography>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {cart.map(item => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'white' }}>
              <Typography>{item.quantity}x {item.name}</Typography>
              <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
            </Box>
          ))}
          {cart.length === 0 && <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Cart is empty.</Typography>}
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, color: 'white' }}>
          <Typography variant="h5">Total:</Typography>
          <Typography variant="h5" sx={{ color: '#00f2fe' }}>${calculateTotal().toFixed(2)}</Typography>
        </Box>
        <Button variant="contained" fullWidth sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)' }} disabled={cart.length === 0}>
          Fire to Kitchen
        </Button>
      </Box>
    </Box>
  );
};

export default RestaurantPOSTab;
