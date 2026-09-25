import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Alert } from '@mui/material';
import api from '../../../services/api';

const COLUMNS = [
  { key: 'queued', title: 'New', next: 'preparing', action: 'Start cooking' },
  { key: 'preparing', title: 'Preparing', next: 'ready', action: 'Mark ready' },
  { key: 'ready', title: 'Ready', next: 'completed', action: 'Picked up' },
];

// Live kitchen board: tickets appear when an order is placed and move left to right.
const RestaurantKDSTab = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/restaurant/kds/tickets/');
      setTickets(res.data);
      setError('');
    } catch (e) { setError('Could not load kitchen tickets.'); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, 5000);
    return () => clearInterval(t);
  }, [load]);

  const advance = async (ticket, status) => {
    setTickets(ts => ts.map(x => (x.id === ticket.id ? { ...x, status } : x)).filter(x => x.status !== 'completed'));
    try { await api.post(`/restaurant/kds/tickets/${ticket.id}/status/`, { status }); } catch (e) { setError('Update failed.'); }
    load();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Kitchen display</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {COLUMNS.map(col => {
          const list = tickets.filter(t => t.status === col.key);
          return (
            <Box key={col.key}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{col.title} ({list.length})</Typography>
              {list.length === 0 && <Typography variant="body2" color="text.secondary">Nothing here.</Typography>}
              {list.map(t => (
                <Card key={t.id} variant="outlined" sx={{ mb: 1.5 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography fontWeight={700}>{t.table_number} · #{t.order}</Typography>
                      <Chip size="small" color={t.minutes_waiting >= 15 ? 'error' : t.minutes_waiting >= 8 ? 'warning' : 'default'} label={`${t.minutes_waiting} min`} />
                    </Box>
                    {t.items.map((i, idx) => <Typography key={idx}>{i.quantity} × {i.name}</Typography>)}
                    {t.notes && <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>Note: {t.notes}</Typography>}
                    <Button fullWidth size="small" variant="contained" sx={{ mt: 1.5 }} onClick={() => advance(t, col.next)}>{col.action}</Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RestaurantKDSTab;
