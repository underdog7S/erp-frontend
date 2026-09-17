import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Divider, Button } from '@mui/material';
import api from '../../../services/api';

const RetailAnalyticsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get('/retail/analytics/');
      setData(res.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("Analytics features require a paid plan. Please upgrade your tenant plan to access this feature.");
      } else {
        setError("Failed to load analytics.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return <CircularProgress />;
  if (error) {
    if (error.includes("upgrade")) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => window.location.href='/dashboard'}>Upgrade Plan</Button>}>
            {error}
          </Alert>
        </Box>
      );
    }
    return <Alert severity="error">{error}</Alert>;
  }
  if (!data) return <Alert severity="info">No analytics data available.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Retail Analytics</Typography>
        <Button variant="outlined" onClick={fetchAnalytics}>Refresh Data</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Sales</Typography>
              <Typography variant="h4">${data.total_sales_amount || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Orders</Typography>
              <Typography variant="h4">{data.total_orders || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Low Stock Items</Typography>
              <Typography variant="h4" color="error">{data.low_stock_count || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>New Customers</Typography>
              <Typography variant="h4">{data.new_customers_today || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Raw Analytics Viewer</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 400, overflow: 'auto', bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <pre style={{ margin: 0, fontSize: '0.85rem' }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RetailAnalyticsTab;
