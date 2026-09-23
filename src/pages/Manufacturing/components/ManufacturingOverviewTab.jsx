import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Chip, List, ListItem, ListItemText } from '@mui/material';
import api from '../../../services/api';

const StatCard = ({ label, value, color = 'primary.main' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h4" fontWeight="700" sx={{ color, mt: 0.5 }}>{value}</Typography>
    </CardContent>
  </Card>
);

const ManufacturingOverviewTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/manufacturing/overview/')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load overview. Make sure your plan includes Manufacturing.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={3}><StatCard label="Raw Materials" value={data.raw_material_count} /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="Finished Goods" value={data.finished_good_count} /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="Active BOMs" value={data.active_bom_count} /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="Pending Purchase Orders" value={data.pending_purchase_orders} color="warning.main" /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="Production: Planned" value={data.production_orders_planned} /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="Production: In Progress" value={data.production_orders_in_progress} color="info.main" /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="Production: Completed" value={data.production_orders_completed} color="success.main" /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="Pending Sales Orders" value={data.pending_sales_orders} color="warning.main" /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="QC Pending" value={data.quality_checks_pending} color="warning.main" /></Grid>
        <Grid item xs={6} sm={4} md={3}><StatCard label="QC Failed" value={data.quality_checks_failed} color="error.main" /></Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>Raw Material Low Stock</Typography>
              {data.raw_material_low_stock.length === 0 ? (
                <Typography variant="body2" color="text.secondary">All raw materials are above reorder level.</Typography>
              ) : (
                <List dense>
                  {data.raw_material_low_stock.map((item, i) => (
                    <ListItem key={i} disableGutters secondaryAction={<Chip size="small" color="error" label={`${item.available} left`} />}>
                      <ListItemText primary={item.raw_material} secondary={`${item.warehouse} · reorder at ${item.reorder_level}`} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>Finished Goods Low Stock</Typography>
              {data.finished_good_low_stock.length === 0 ? (
                <Typography variant="body2" color="text.secondary">All finished goods are above reorder level.</Typography>
              ) : (
                <List dense>
                  {data.finished_good_low_stock.map((item, i) => (
                    <ListItem key={i} disableGutters secondaryAction={<Chip size="small" color="error" label={`${item.available} left`} />}>
                      <ListItemText primary={item.finished_good} secondary={`${item.warehouse} · reorder at ${item.reorder_level}`} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManufacturingOverviewTab;
