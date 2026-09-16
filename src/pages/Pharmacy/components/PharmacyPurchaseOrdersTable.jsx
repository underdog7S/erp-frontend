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
  Visibility as ViewIcon
} from '@mui/icons-material';

const PharmacyPurchaseOrdersTable = ({
  allPurchaseOrders,
  selectedPurchaseOrders,
  showPurchaseOrdersTable,
  setShowPurchaseOrdersTable,
  handleSelectAllPurchaseOrders,
  handleSelectPurchaseOrder,
  handleBulkDeletePurchaseOrders,
  openBulkStatusDialog,
  getStatusColor
}) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Purchase Orders Management
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowPurchaseOrdersTable(!showPurchaseOrdersTable)}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              {showPurchaseOrdersTable ? 'Hide' : 'Show'} All Purchase Orders
            </Button>
            {selectedPurchaseOrders.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDeletePurchaseOrders}
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  Delete ({selectedPurchaseOrders.length})
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => openBulkStatusDialog('purchase_orders')}
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  Update Status ({selectedPurchaseOrders.length})
                </Button>
              </>
            )}
          </Box>
        </Box>
        {showPurchaseOrdersTable && (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflowX: 'auto', width: '100%' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedPurchaseOrders.length > 0 && selectedPurchaseOrders.length < allPurchaseOrders.length}
                      checked={allPurchaseOrders.length > 0 && selectedPurchaseOrders.length === allPurchaseOrders.length}
                      onChange={handleSelectAllPurchaseOrders}
                    />
                  </TableCell>
                  <TableCell>PO Number</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Expected Delivery</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allPurchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedPurchaseOrders.includes(po.id)}
                        onChange={() => handleSelectPurchaseOrder(po.id)}
                      />
                    </TableCell>
                    <TableCell>{po.po_number}</TableCell>
                    <TableCell>{po.supplier?.name || po.supplier_name || 'N/A'}</TableCell>
                    <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>{po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={po.status} 
                        color={getStatusColor(po.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
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

export default PharmacyPurchaseOrdersTable;
