import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  QrCodeScanner as QrCodeIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const QuickSaleDialog = ({
  open,
  onClose,
  quickSaleForm,
  handleQuickSaleFormChange,
  handleQuickSaleCustomerSearch,
  quickSaleMedicineSearch,
  handleQuickSaleMedicineSearch,
  setShowQuickSaleSearch,
  handleScanBarcode,
  showQuickSaleSearch,
  quickSaleSearchResults,
  handleAddQuickSaleItem,
  batches,
  quickSaleItems,
  handleUpdateQuickSaleItem,
  handleRemoveQuickSaleItem,
  calculateQuickSaleTotal,
  handleSubmitQuickSale
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Quick Sale - Fast Checkout</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Customer Info */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Phone (Optional)"
                variant="outlined"
                placeholder="Enter phone number"
                value={quickSaleForm.customer_phone}
                onChange={(e) => {
                  const phone = e.target.value;
                  handleQuickSaleFormChange('customer_phone', phone);
                  if (phone.length >= 10) {
                    handleQuickSaleCustomerSearch(phone);
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name (Auto-filled)"
                variant="outlined"
                placeholder="Will be auto-filled from phone"
                value={quickSaleForm.customer_name}
                onChange={(e) => handleQuickSaleFormChange('customer_name', e.target.value)}
                disabled={!!quickSaleForm.customer_phone}
              />
            </Grid>

            {/* Medicine Search */}
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Search & Add Medicine"
                  variant="outlined"
                  placeholder="Type medicine name or scan barcode..."
                  value={quickSaleMedicineSearch}
                  onChange={(e) => handleQuickSaleMedicineSearch(e.target.value)}
                  onFocus={() => setShowQuickSaleSearch(true)}
                  onBlur={() => setTimeout(() => setShowQuickSaleSearch(false), 200)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleScanBarcode('quick_sale')}>
                          <QrCodeIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {showQuickSaleSearch && quickSaleSearchResults.length > 0 && (
                  <Paper 
                    sx={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      zIndex: 1000,
                      maxHeight: 200,
                      overflow: 'auto',
                      mt: 1,
                      boxShadow: 3,
                      border: '1px solid #ddd'
                    }}
                  >
                    <List>
                      {quickSaleSearchResults.map((medicine) => (
                        <ListItem 
                          key={medicine.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddQuickSaleItem(medicine);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#e3f2fd' }
                          }}
                        >
                          <ListItemText
                            primary={medicine.medicine_name || medicine.name}
                            secondary={`₹${medicine.unit_price || medicine.selling_price || 0} - Stock: ${batches.find(b => b.medicine?.id === medicine.id)?.quantity_available || 0}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </Grid>

            {/* Cart Items */}
            {quickSaleItems.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Cart ({quickSaleItems.length} {quickSaleItems.length === 1 ? 'item' : 'items'})
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflowX: 'auto', width: '100%' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quickSaleItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.medicine_name || item.medicine?.medicine_name || item.medicine?.name}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuickSaleItem(index, 'quantity', e.target.value)}
                              inputProps={{ min: 1 }}
                              sx={{ width: 70 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.price || item.unit_price}
                              onChange={(e) => handleUpdateQuickSaleItem(index, 'price', e.target.value)}
                              InputProps={{
                                startAdornment: <Typography variant="caption">₹</Typography>,
                              }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || parseFloat(item.unit_price) || 0)).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRemoveQuickSaleItem(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {/* Payment & Total */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={quickSaleForm.payment_method}
                  onChange={(e) => handleQuickSaleFormChange('payment_method', e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="NETBANKING">Net Banking</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ₹{calculateQuickSaleTotal().toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="success"
          onClick={handleSubmitQuickSale}
          disabled={quickSaleItems.length === 0}
          startIcon={<MoneyIcon />}
          sx={{ minWidth: 150 }}
        >
          Complete Sale (₹{calculateQuickSaleTotal().toFixed(2)})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickSaleDialog;
