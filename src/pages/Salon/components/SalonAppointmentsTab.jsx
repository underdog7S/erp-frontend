import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from '../../../services/api';

const SalonAppointmentsTab = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/salon/appointments/");
      setAppointments(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Upcoming Appointments</Typography>
        <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'white' }}>Book Client</Button>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} sx={{ bgcolor: '#1a1a24', color: 'white', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Client</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Service</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Stylist</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Date & Time</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length === 0 && (
                <TableRow><TableCell colSpan={6} sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>No upcoming appointments.</TableCell></TableRow>
              )}
              {appointments.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: 'white' }}>{row.client_name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.service_name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.stylist_name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{row.datetime}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    <Chip size="small" color={row.status === 'CONFIRMED' ? 'success' : 'warning'} label={row.status} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: '#00f2fe' }}>Check In</Button>
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

export default SalonAppointmentsTab;
