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
  Checkbox,
  Paper,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const PharmacySalesTable = ({
  allSales,
  selectedSales,
  showSalesTable,
  setShowSalesTable,
  handleSelectAllSales,
  handleSelectSale,
  handleBulkDeleteSales,
  openBulkStatusDialog,
  handlePrintInvoice,
  setSaleForRazorpay,
  razorpaySetupStatus,
  setSelectedSale,
  setSaleDetailsDialog,
  getStatusColor
}) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Sales Management
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowSalesTable(!showSalesTable)}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              {showSalesTable ? 'Hide' : 'Show'} All Sales
            </Button>
            {selectedSales.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDeleteSales}
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  Delete ({selectedSales.length})
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => openBulkStatusDialog('sales')}
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  Update Status ({selectedSales.length})
                </Button>
              </>
            )}
          </Box>
        </Box>
        {showSalesTable && (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflowX: 'auto', width: '100%' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedSales.length > 0 && selectedSales.length < allSales.length}
                      checked={allSales.length > 0 && selectedSales.length === allSales.length}
                      onChange={handleSelectAllSales}
                    />
                  </TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedSales.includes(sale.id)}
                        onChange={() => handleSelectSale(sale.id)}
                      />
                    </TableCell>
                    <TableCell>{sale.invoice_number}</TableCell>
                    <TableCell>{sale.customer?.name || sale.customer_name || 'Walk-in'}</TableCell>
                    <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{sale.total_amount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.payment_status} 
                        color={getStatusColor(sale.payment_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => {
                            setSelectedSale(sale);
                            setSaleDetailsDialog(true);
                          }}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Invoice">
                          <IconButton size="small" onClick={() => handlePrintInvoice(sale?.id)}>
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        {sale.payment_status !== 'PAID' && razorpaySetupStatus?.is_configured && (
                          <Tooltip title="Pay with Razorpay">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => setSaleForRazorpay(sale)}
                            >
                              <MoneyIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PharmacySalesTable;
