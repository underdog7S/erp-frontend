import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from '../../../services/api';

const HotelBookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hotel/bookings/");
      setBookings(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Reservation Desk</Typography>
        <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'white' }}>New Booking</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} sx={{ bgcolor: '#1a1a24', color: 'white', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Guest</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Room Type</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Check-in</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Check-out</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 && (
                <TableRow><TableCell colSpan={6} sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>No upcoming bookings.</TableCell></TableRow>
              )}
              {bookings.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: 'white' }}>{row.guest_name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.room_type}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.check_in_date}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.check_out_date}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" color={row.status === 'CONFIRMED' ? 'success' : 'warning'} label={row.status} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: '#00f2fe' }}>View</Button>
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

export default HotelBookingsTab;
