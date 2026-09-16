import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

const PharmacyAnalytics = ({ analytics, featureError }) => {
  const [analyticsTab, setAnalyticsTab] = useState(0);

  if (!analytics || featureError) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Analytics & Reports
        </Typography>
        <Tabs value={analyticsTab} onChange={(e, newValue) => setAnalyticsTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Sales Analytics" />
          <Tab label="Inventory Analytics" />
          <Tab label="Customer Analytics" />
          <Tab label="Profitability" />
        </Tabs>

        {/* Sales Analytics Tab */}
        {analyticsTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Sales vs Profit (30 Days)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        {
                          name: 'Revenue',
                          value: analytics?.profitability?.total_revenue_30_days || 0
                        },
                        {
                          name: 'Profit',
                          value: analytics?.profitability?.profit_margin_30_days || 0
                        }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Payment Methods Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Cash', value: analytics?.overview?.cash_payments || 0, fill: '#4caf50' },
                            { name: 'Card', value: analytics?.overview?.card_payments || 0, fill: '#2196f3' },
                            { name: 'UPI', value: analytics?.overview?.upi_payments || 0, fill: '#ff9800' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4caf50" />
                          <Cell fill="#2196f3" />
                          <Cell fill="#ff9800" />
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              {analytics?.top_medicines && analytics.top_medicines.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Top Selling Medicines (Last 30 Days)
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={analytics.top_medicines.map(m => ({
                            name: m.medicine_batch__medicine__name || m.medicine_name || 'Unknown',
                            quantity: m.total_quantity || 0,
                            revenue: Number(m.total_revenue || 0)
                          }))}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <RechartsTooltip formatter={(value, name) => 
                            name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : value
                          } />
                          <Legend />
                          <Bar dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
                          <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Inventory Analytics Tab */}
        {analyticsTab === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Inventory Status
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'In Stock', value: (analytics?.overview?.total_medicines || 0) - (analytics?.inventory?.low_stock_medicines || 0), fill: '#4caf50' },
                            { name: 'Low Stock', value: analytics?.inventory?.low_stock_medicines || 0, fill: '#ff9800' },
                            { name: 'Expired', value: analytics?.inventory?.expired_medicines || 0, fill: '#f44336' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4caf50" />
                          <Cell fill="#ff9800" />
                          <Cell fill="#f44336" />
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Stock Value Breakdown
                    </Typography>
                    <Box sx={{ py: 2 }}>
                      <Typography variant="h6" color="primary">
                        ₹{Number(analytics?.inventory?.total_stock_value || 0).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Total Stock Value
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Inventory Value: ₹{Number(analytics?.inventory?.total_stock_value || 0).toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Customer Analytics Tab */}
        {analyticsTab === 2 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Customer Overview
                    </Typography>
                    <Box sx={{ py: 2 }}>
                      <Typography variant="h4" color="primary">
                        {analytics?.overview?.total_customers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Customers
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        New (30 days): {analytics?.overview?.recent_customers || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Prescription Analytics
                    </Typography>
                    <Box sx={{ py: 2 }}>
                      <Typography variant="h4" color="primary">
                        {analytics?.overview?.total_prescriptions || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Prescriptions
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Recent (30 days): {analytics?.overview?.recent_prescriptions || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Profitability Tab */}
        {analyticsTab === 3 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Profit Margin Analysis
                    </Typography>
                    <Box sx={{ py: 2 }}>
                      <Typography variant="h4" color="success.main">
                        {Number(analytics?.profitability?.profit_percentage || 0).toFixed(2)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Profit Margin (30 Days)
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Number(analytics?.profitability?.profit_percentage || 0)} 
                        sx={{ height: 8, borderRadius: 4, mt: 2 }}
                        color="success"
                      />
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Revenue: ₹{Number(analytics?.profitability?.total_revenue_30_days || 0).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="body2">
                          Profit: ₹{Number(analytics?.profitability?.profit_margin_30_days || 0).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Revenue vs Profit
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Revenue', value: Number(analytics?.profitability?.total_revenue_30_days || 0), fill: '#2196f3' },
                            { name: 'Profit', value: Number(analytics?.profitability?.profit_margin_30_days || 0), fill: '#4caf50' },
                            { name: 'Cost', value: Number((analytics?.profitability?.total_revenue_30_days || 0) - (analytics?.profitability?.profit_margin_30_days || 0)), fill: '#ff9800' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#2196f3" />
                          <Cell fill="#4caf50" />
                          <Cell fill="#ff9800" />
                        </Pie>
                        <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PharmacyAnalytics;
