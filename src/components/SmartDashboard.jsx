import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  LocalHospital as MedicineIcon,
  ShoppingCart as SalesIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Assessment as ReportIcon,
  Store as StoreIcon,
  Support as SupportIcon,
  DeleteSweep as CleaningIcon,
  Add as AddIcon,
  ShoppingCart as ProductIcon
} from '@mui/icons-material';

const SmartDashboard = ({ userRole = 'pharmacist', analytics = {} }) => {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [priorityTasks, setPriorityTasks] = useState([]);

  // Determine time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  // Get contextual actions based on time and role
  const getContextualActions = () => {
    const actions = {
      morning: {
        pharmacist: [
          { 
            title: 'Check Inventory', 
            icon: <InventoryIcon />, 
            priority: 'high',
            description: 'Review stock levels and low stock items',
            color: 'primary'
          },
          { 
            title: 'Review Expiring Items', 
            icon: <WarningIcon />, 
            priority: 'high',
            description: 'Check medicines expiring soon',
            color: 'warning'
          },
          { 
            title: 'Start Sales', 
            icon: <SalesIcon />, 
            priority: 'medium',
            description: 'Begin processing customer sales',
            color: 'success'
          }
        ],
        retail: [
          { 
            title: 'Open Store', 
            icon: <StoreIcon />, 
            priority: 'high',
            description: 'Prepare store for opening and check inventory',
            color: 'primary'
          },
          { 
            title: 'Check Stock Levels', 
            icon: <InventoryIcon />, 
            priority: 'high',
            description: 'Review product stock levels and reorder points',
            color: 'warning'
          },
          { 
            title: 'Start Sales', 
            icon: <SalesIcon />, 
            priority: 'medium',
            description: 'Begin processing customer transactions',
            color: 'success'
          }
        ],
        assistant: [
          { 
            title: 'Open Store', 
            icon: <StoreIcon />, 
            priority: 'high',
            description: 'Prepare store for opening',
            color: 'primary'
          },
          { 
            title: 'Check Attendance', 
            icon: <PeopleIcon />, 
            priority: 'medium',
            description: 'Record staff attendance',
            color: 'info'
          }
        ]
      },
      afternoon: {
        pharmacist: [
          { 
            title: 'Process Sales', 
            icon: <SalesIcon />, 
            priority: 'high',
            description: 'Handle customer transactions',
            color: 'success'
          },
          { 
            title: 'Manage Stock', 
            icon: <InventoryIcon />, 
            priority: 'medium',
            description: 'Update inventory levels',
            color: 'primary'
          },
          { 
            title: 'Customer Service', 
            icon: <SupportIcon />, 
            priority: 'medium',
            description: 'Assist customers with queries',
            color: 'info'
          }
        ],
        retail: [
          { 
            title: 'Process Sales', 
            icon: <SalesIcon />, 
            priority: 'high',
            description: 'Handle customer transactions and payments',
            color: 'success'
          },
          { 
            title: 'Manage Inventory', 
            icon: <InventoryIcon />, 
            priority: 'medium',
            description: 'Update product stock and transfer items',
            color: 'primary'
          },
          { 
            title: 'Customer Service', 
            icon: <SupportIcon />, 
            priority: 'medium',
            description: 'Assist customers with product queries',
            color: 'info'
          }
        ]
      },
      evening: {
        pharmacist: [
          { 
            title: 'End of Day Report', 
            icon: <ReportIcon />, 
            priority: 'high',
            description: 'Generate daily sales and inventory report',
            color: 'primary'
          },
          { 
            title: 'Stock Count', 
            icon: <InventoryIcon />, 
            priority: 'medium',
            description: 'Verify inventory accuracy',
            color: 'warning'
          },
          { 
            title: 'Cleanup', 
            icon: <CleaningIcon />, 
            priority: 'low',
            description: 'Organize workspace and files',
            color: 'default'
          }
        ],
        retail: [
          { 
            title: 'End of Day Report', 
            icon: <ReportIcon />, 
            priority: 'high',
            description: 'Generate daily sales and inventory report',
            color: 'primary'
          },
          { 
            title: 'Stock Count', 
            icon: <InventoryIcon />, 
            priority: 'medium',
            description: 'Verify product inventory accuracy',
            color: 'warning'
          },
          { 
            title: 'Cleanup', 
            icon: <CleaningIcon />, 
            priority: 'low',
            description: 'Organize workspace and close store',
            color: 'default'
          }
        ]
      }
    };

    return actions[timeOfDay]?.[userRole] || [];
  };

  const contextualActions = getContextualActions();

  // Get greeting based on time
  const getGreeting = () => {
    const greetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon', 
      evening: 'Good evening'
    };
    return greetings[timeOfDay] || 'Hello';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'default'
    };
    return colors[priority] || 'default';
  };

  return (
    <Box>
      {/* Welcome Message */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        {getGreeting()}, {userRole}!
      </Typography>
      
      {/* Time-based Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          It's {timeOfDay} - here are your priority tasks for this time of day.
        </Typography>
      </Alert>
      
      {/* Priority Actions */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Priority Tasks for {timeOfDay}
        </Typography>
        <Grid container spacing={2}>
          {contextualActions.map((action, index) => (
            <Grid key={index} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: action.priority === 'high' ? 2 : 1,
                  borderColor: action.priority === 'high' ? 'error.main' : 'divider',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  },
                  borderRadius: { xs: 3, sm: 2 },
                  boxShadow: { xs: 3, sm: 1 }
                }}
              >
                <CardContent sx={{ padding: { xs: 3, sm: 2 } }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{ color: `${action.color}.main` }}>
                      {action.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontSize: { xs: '1.25rem', sm: '1.125rem' },
                        fontWeight: 'bold'
                      }}
                    >
                      {action.title}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      fontSize: { xs: '1rem', sm: '0.875rem' }
                    }}
                  >
                    {action.description}
                  </Typography>
                  
                  <Chip 
                    label={action.priority} 
                    size="small" 
                    color={getPriorityColor(action.priority)}
                    sx={{ fontWeight: 'bold' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Stats */}
      {analytics && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Today's Overview
          </Typography>
                              <Grid container spacing={2}>
                      <Grid xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: { xs: 3, sm: 2 } }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                              <SalesIcon sx={{ fontSize: 40, color: 'success.main' }} />
                              <Box>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                  ₹{analytics.total_sales_amount || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Total Sales
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: { xs: 3, sm: 2 } }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                  {analytics.total_customers || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Customers Served
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                                             <Grid xs={12} sm={6} md={3}>
                         <Card sx={{ borderRadius: { xs: 3, sm: 2 } }}>
                           <CardContent>
                             <Box display="flex" alignItems="center" gap={2}>
                               {userRole === 'retail' ? (
                                 <ProductIcon sx={{ fontSize: 40, color: 'info.main' }} />
                               ) : (
                                 <MedicineIcon sx={{ fontSize: 40, color: 'info.main' }} />
                               )}
                               <Box>
                                 <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                   {userRole === 'retail' ? (analytics.total_products || 0) : (analytics.total_medicines || 0)}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   {userRole === 'retail' ? 'Products in Stock' : 'Medicines in Stock'}
                                 </Typography>
                               </Box>
                             </Box>
                           </CardContent>
                         </Card>
                       </Grid>

                       <Grid xs={12} sm={6} md={3}>
                         <Card sx={{ borderRadius: { xs: 3, sm: 2 } }}>
                           <CardContent>
                             <Box display="flex" alignItems="center" gap={2}>
                               <InventoryIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                               <Box>
                                 <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                   {analytics.low_stock_count || 0}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   {userRole === 'retail' ? 'Low Stock Products' : 'Low Stock Items'}
                                 </Typography>
                               </Box>
                             </Box>
                           </CardContent>
                         </Card>
                       </Grid>
                    </Grid>
        </Box>
      )}

      {/* Progress Indicator */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Daily Progress
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Tasks Completed</Typography>
            <Typography variant="body2" color="primary">
              {contextualActions.filter(a => a.priority === 'high').length} of {contextualActions.length}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(contextualActions.filter(a => a.priority === 'high').length / contextualActions.length) * 100}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SmartDashboard; 