import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../../../services/api';

const SalonServicesTab = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/salon/services/");
      setServices(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Services Menu</Typography>
        <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'white' }}>Add Service</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} sx={{ bgcolor: '#1a1a24', color: 'white', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Service Name</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Duration</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Price</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length === 0 && (
                <TableRow><TableCell colSpan={4} sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>No services available.</TableCell></TableRow>
              )}
              {services.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: 'white' }}>{row.name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.duration_minutes} mins</TableCell>
                  <TableCell sx={{ color: 'white' }}>${row.price}</TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: '#00f2fe' }}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SalonServicesTab;
