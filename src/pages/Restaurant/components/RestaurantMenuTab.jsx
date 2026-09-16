import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from '../../../services/api';

const RestaurantMenuTab = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  
  const [menuForm, setMenuForm] = useState({
    name: '', category: '', price: '', description: '', is_available: true
  });

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

  const handleOpenDialog = () => {
    setMenuForm({ name: '', category: '', price: '', description: '', is_available: true });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      await api.post(`/restaurant/menu/`, menuForm);
      fetchMenu();
      setOpenDialog(false);
    } catch {
      alert('Failed to save menu item.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Menu Editor</Typography>
        <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'white' }} onClick={handleOpenDialog}>Add Item</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} sx={{ bgcolor: '#1a1a24', color: 'white', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Name</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Category</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Price</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {menuItems.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: 'white' }}>{row.name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.category}</TableCell>
                  <TableCell sx={{ color: 'white' }}>${row.price}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" color={row.is_available ? 'success' : 'error'} label={row.is_available ? 'Available' : 'Sold Out'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { bgcolor: '#1a1a24', color: 'white', border: '1px solid rgba(0, 242, 254, 0.3)' } }}>
        <DialogTitle>Add Menu Item</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Item Name" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
          <TextField name="category" label="Category" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
          <TextField name="price" label="Price" type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} fullWidth margin="dense" InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Button>
          <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)' }} onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantMenuTab;
