import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  AttachMoney as MoneyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const PharmacyReturnsTable = ({
  returns,
  handleAddReturn,
  handleViewReturn,
  handleProcessReturn,
  handleDeleteReturn,
  getReturnStatusColor
}) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Returns Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddReturn}
            sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
          >
            Create Return
          </Button>
        </Box>
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflowX: 'auto', width: '100%' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Return Number</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(returns || []).map((returnObj) => (
                <TableRow key={returnObj.id}>
                  <TableCell>{returnObj.return_number}</TableCell>
                  <TableCell>{returnObj.sale_invoice_number || returnObj.sale?.invoice_number}</TableCell>
                  <TableCell>{returnObj.customer_name || returnObj.customer?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(returnObj.return_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={returnObj.return_type} 
                      size="small"
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell>₹{returnObj.refund_amount}</TableCell>
                  <TableCell>
                    <Chip 
                      label={returnObj.status} 
                      color={getReturnStatusColor(returnObj.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewReturn(returnObj.id)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {returnObj.status !== 'PROCESSED' && (
                        <Tooltip title="Process Return">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleProcessReturn(returnObj.id)}
                          >
                            <MoneyIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteReturn(returnObj.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {(!returns || returns.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No returns found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default PharmacyReturnsTable;
