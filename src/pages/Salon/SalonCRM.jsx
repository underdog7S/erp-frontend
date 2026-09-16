import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, InputAdornment,
  CircularProgress, Alert, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';

const COLUMN_LABELS = [
  'Name',
  'Email',
  'Phone',
  'Type',
  'Lifecycle',
  'Company',
  'Notes',
];

const SalonCRM = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState('all');

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/crm/contacts/');
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setContacts(payload);
    } catch (err) {
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts
      .filter((contact) => {
        if (tab === 'students' && contact.contact_type !== 'student') return false;
        if (tab === 'customers' && contact.contact_type !== 'customer') return false;
        if (tab === 'leads' && contact.lifecycle_stage !== 'lead') return false;
        return true;
      })
      .filter((contact) => {
        if (!filter.trim()) return true;
        const needle = filter.toLowerCase();
        return (
          (contact.full_name || `${contact.first_name} ${contact.last_name}` || '')
            .toLowerCase()
            .includes(needle) ||
          (contact.email || '').toLowerCase().includes(needle) ||
          (contact.phone || '').includes(needle)
        );
      });
  }, [contacts, filter, tab]);

  const summary = useMemo(() => {
    const total = contacts.length;
    const students = contacts.filter(c => c.contact_type === 'student').length;
    const customers = contacts.filter(c => c.contact_type === 'customer').length;
    const leads = contacts.filter(c => c.lifecycle_stage === 'lead').length;
    return { total, students, customers, leads };
  }, [contacts]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Salon CRM & Contacts
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Contacts
              </Typography>
              <Typography variant="h4">{summary.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Students
              </Typography>
              <Typography variant="h4">{summary.students}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Customers
              </Typography>
              <Typography variant="h4">{summary.customers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Leads & Targets
              </Typography>
              <Typography variant="h4">{summary.leads}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {['all', 'students', 'customers', 'leads'].map((state) => (
          <Button
            key={state}
            variant={tab === state ? 'contained' : 'outlined'}
            onClick={() => setTab(state)}
          >
            {state === 'all' ? 'All Contacts' : state.charAt(0).toUpperCase() + state.slice(1)}
          </Button>
        ))}
        <TextField
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search contacts..."
          size="small"
          sx={{ ml: 'auto', minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {COLUMN_LABELS.map((label) => (
                      <TableCell key={label}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        {contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'N/A'}
                      </TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
                      <TableCell>{contact.phone || contact.mobile || '-'}</TableCell>
                      <TableCell>
                        <Chip label={contact.contact_type || 'Other'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={contact.lifecycle_stage || 'N/A'} size="small" color="info" />
                      </TableCell>
                      <TableCell>{contact.company_name || '-'}</TableCell>
                      <TableCell>{contact.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!filteredContacts.length && (
                    <TableRow>
                      <TableCell colSpan={COLUMN_LABELS.length} align="center">
                        No contacts found for the current filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalonCRM;

