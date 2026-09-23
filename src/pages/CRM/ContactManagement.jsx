import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Menu, MenuItem, FormControl, InputLabel, Select,
  Grid, Card, CardContent, Alert, CircularProgress, Tabs, Tab
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  MoreVert as MoreVertIcon, Search as SearchIcon, FilterList as FilterIcon,
  Phone as PhoneIcon, Email as EmailIcon, Business as BusinessIcon,
  Sms as SmsIcon, WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ContactManagement = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLifecycle, setFilterLifecycle] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    contact_type: 'customer',
    lifecycle_stage: 'lead',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    job_title: '',
    company: '',
    notes: '',
  });

  useEffect(() => {
    fetchContacts();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterLifecycle]);

  // Cancels a still-in-flight contacts request when a newer one supersedes
  // it, so fast typing (handleSearch fires a request per keystroke once >=2
  // chars) can't resolve out of order and leave stale results on screen.
  const contactsAbortRef = useRef(null);

  const fetchContacts = async (searchOverride) => {
    if (contactsAbortRef.current) {
      contactsAbortRef.current.abort();
    }
    const controller = new AbortController();
    contactsAbortRef.current = controller;
    try {
      setLoading(true);
      const params = {};
      const effectiveSearch = searchOverride !== undefined ? searchOverride : searchTerm;
      if (effectiveSearch) params.search = effectiveSearch;
      if (filterType) params.contact_type = filterType;
      if (filterLifecycle) params.lifecycle_stage = filterLifecycle;

      const response = await api.get('/crm/contacts/', { params, signal: controller.signal });
      // Handle both paginated and non-paginated responses
      const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setContacts(data);
      setError(null);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/crm/contacts/stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set default stats if API fails
      setStats({ total: 0, recent: 0, by_type: [], by_lifecycle: [] });
    }
  };

  const searchDebounceRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (value.length >= 2 || value.length === 0) {
      // Debounce so a request isn't fired on every single keystroke, and
      // pass the value directly rather than relying on `searchTerm` state -
      // setSearchTerm() above hasn't been applied to state yet at this
      // point, so reading the state var here would always be one keystroke
      // behind.
      searchDebounceRef.current = setTimeout(() => fetchContacts(value), 400);
    }
  };

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        contact_type: contact.contact_type || 'customer',
        lifecycle_stage: contact.lifecycle_stage || 'lead',
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        address_line1: contact.address_line1 || '',
        city: contact.city || '',
        state: contact.state || '',
        postal_code: contact.postal_code || '',
        country: contact.country || '',
        job_title: contact.job_title || '',
        company: contact.company || '',
        notes: contact.notes || '',
      });
    } else {
      setEditingContact(null);
      setFormData({
        contact_type: 'customer',
        lifecycle_stage: 'lead',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        mobile: '',
        address_line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        job_title: '',
        company: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContact(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingContact) {
        await api.put(`/crm/contacts/${editingContact.id}/`, formData);
      } else {
        await api.post('/crm/contacts/', formData);
      }
      await fetchContacts();
      await fetchStats();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to save contact');
      console.error('Error saving contact:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    try {
      setLoading(true);
      await api.delete(`/crm/contacts/${contactId}/`);
      await fetchContacts();
      await fetchStats();
      setAnchorEl(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete contact');
      console.error('Error deleting contact:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, contact) => {
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContact(null);
  };

  const [messageError, setMessageError] = useState(null);

  const handleStartConversation = async (channel) => {
    const contact = selectedContact;
    handleMenuClose();
    if (!contact) return;
    try {
      const res = await api.post(`/crm/contacts/${contact.id}/start-conversation/`, { channel });
      navigate(`/crm/inbox?thread=${res.data.thread_id}`);
    } catch (err) {
      setMessageError(err.response?.data?.error || `Failed to start ${channel} conversation`);
      console.error('Error starting conversation:', err);
    }
  };

  const getContactTypeColor = (type) => {
    const colors = {
      student: 'primary',
      parent: 'success',
      customer: 'info',
      lead: 'warning',
      vendor: 'secondary',
    };
    return colors[type] || 'default';
  };

  const getLifecycleColor = (stage) => {
    const colors = {
      lead: 'warning',
      customer: 'success',
      opportunity: 'info',
      vip: 'error',
      inactive: 'default',
    };
    return colors[stage] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Contact Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Contact
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {messageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setMessageError(null)}>
          {messageError}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Contacts
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  New This Period
                </Typography>
                <Typography variant="h4">{stats.recent}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Contact Type</InputLabel>
              <Select
                value={filterType}
                label="Contact Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Lifecycle Stage</InputLabel>
              <Select
                value={filterLifecycle}
                label="Lifecycle Stage"
                onChange={(e) => setFilterLifecycle(e.target.value)}
              >
                <MenuItem value="">All Stages</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="opportunity">Opportunity</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setFilterType('');
                setFilterLifecycle('');
                setSearchTerm('');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Contacts Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Lifecycle</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Company</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 6,
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6">No contacts yet</Typography>
                      <Typography color="textSecondary">
                        Add students, parents, or customers to keep your CRM active.
                      </Typography>
                      <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                        Add Sample Contact
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.contact_type}
                        color={getContactTypeColor(contact.contact_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.lifecycle_stage}
                        color={getLifecycleColor(contact.lifecycle_stage)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{contact.email}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{contact.phone}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.company_name ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BusinessIcon fontSize="small" color="action" />
                          <Typography variant="body2">{contact.company_name}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, contact)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedContact?.phone && (
          <MenuItem onClick={() => handleStartConversation('sms')}>
            <SmsIcon sx={{ mr: 1 }} fontSize="small" />
            Message via SMS
          </MenuItem>
        )}
        {selectedContact?.phone && (
          <MenuItem onClick={() => handleStartConversation('whatsapp')}>
            <WhatsAppIcon sx={{ mr: 1 }} fontSize="small" />
            Message via WhatsApp
          </MenuItem>
        )}
        {selectedContact?.email && (
          <MenuItem onClick={() => handleStartConversation('email')}>
            <EmailIcon sx={{ mr: 1 }} fontSize="small" />
            Send Email
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleOpenDialog(selectedContact);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleDelete(selectedContact?.id);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContact ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Contact Type</InputLabel>
                <Select
                  value={formData.contact_type}
                  label="Contact Type"
                  onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="parent">Parent</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                  <MenuItem value="vendor">Vendor</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lifecycle Stage</InputLabel>
                <Select
                  value={formData.lifecycle_stage}
                  label="Lifecycle Stage"
                  onChange={(e) => setFormData({ ...formData, lifecycle_stage: e.target.value })}
                >
                  <MenuItem value="lead">Lead</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="opportunity">Opportunity</MenuItem>
                  <MenuItem value="vip">VIP</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingContact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactManagement;

