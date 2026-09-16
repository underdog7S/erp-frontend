import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Menu, MenuItem, FormControl, InputLabel, Select,
  Grid, Card, CardActions, CardContent, Alert, CircularProgress, Tabs, Tab, Tooltip,
  Switch, FormControlLabel, Checkbox, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  MoreVert as MoreVertIcon, Search as SearchIcon, Send as SendIcon,
  Email as EmailIcon, List as ListIcon, Campaign as CampaignIcon,
  BarChart as AnalyticsIcon, PlayArrow as PlayIcon, Stop as StopIcon,
  Visibility as VisibilityIcon, Link as LinkIcon, Mail as MailIcon,
  ContentCopy as CopyIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import api, { fetchCRMStudentContacts } from '../../services/api';

const EmailMarketing = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.results)) return payload.results;
    return [];
  };

  // Templates state
  const [templates, setTemplates] = useState([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body_html: '',
    body_text: '',
    is_active: true
  });

  // Contact Lists state
  const [contactLists, setContactLists] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [listViewDialogOpen, setListViewDialogOpen] = useState(false);
  const [viewingListContacts, setViewingListContacts] = useState([]);
  const [editingList, setEditingList] = useState(null);
  const [listForm, setListForm] = useState({
    name: '',
    description: '',
    contact_ids: []
  });
  const [contactSearch, setContactSearch] = useState('');
  const [listSearch, setListSearch] = useState('');

  // Campaigns state
  const [campaigns, setCampaigns] = useState([]);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    body_html: '',
    body_text: '',
    template: '',
    contact_list: '',
    scheduled_at: '',
    status: 'draft'
  });

  // Activities state
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState({ subject: '', body_html: '', body_text: '', email: '' });

  // Sequences state
  const [sequences, setSequences] = useState([]);
  const [sequenceDialogOpen, setSequenceDialogOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);
  const [sequenceForm, setSequenceForm] = useState({
    name: '',
    description: '',
    trigger_event: 'manual',
    is_active: true
  });
  const [studentContacts, setStudentContacts] = useState([]);
  const [studentContactsLoading, setStudentContactsLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [visitorLeads, setVisitorLeads] = useState([]);
  const [visitorLeadsLoading, setVisitorLeadsLoading] = useState(false);
  const [visitorLeadsError, setVisitorLeadsError] = useState(null);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [leadFilters, setLeadFilters] = useState({ utm_source: '', utm_medium: '' });

  useEffect(() => {
    fetchTemplates();
    fetchContactLists();
    fetchCampaigns();
    fetchActivities();
    fetchSequences();
    fetchContacts();
  }, [tabValue, activityFilter]);

  useEffect(() => {
    if (!copyMessage) return;
    const timer = setTimeout(() => setCopyMessage(''), 2200);
    return () => clearTimeout(timer);
  }, [copyMessage]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/email/templates/');
      setTemplates(normalizeList(response.data));
      setError(null);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactLists = async () => {
    try {
      const response = await api.get('/email/contact-lists/');
      setContactLists(normalizeList(response.data));
    } catch (err) {
      console.error('Error fetching contact lists:', err);
      setContactLists([]);
    }
  };

  const fetchListContacts = async (listId) => {
    try {
      const response = await api.get(`/email/contact-lists/${listId}/contacts/`);
      setViewingListContacts(normalizeList(response.data));
      setListViewDialogOpen(true);
    } catch (err) {
      console.error('Error fetching list contacts:', err);
      setError('Failed to fetch contacts in this list');
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await api.get('/crm/contacts/');
      setContacts(normalizeList(response.data));
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]);
    }
  };

  const fetchEducationStudentContacts = async () => {
    setStudentContactsLoading(true);
    try {
      const data = await fetchCRMStudentContacts();
      setStudentContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching CRM student contacts:', err);
      setStudentContacts([]);
    } finally {
      setStudentContactsLoading(false);
    }
  };

  useEffect(() => {
    fetchEducationStudentContacts();
    fetchVisitorLeads();
  }, []);

  const filteredContactLists = useMemo(() => {
    if (!listSearch.trim()) return contactLists;
    const lower = listSearch.toLowerCase();
    return contactLists.filter((list) => (list.name || '').toLowerCase().includes(lower) || (list.description || '').toLowerCase().includes(lower));
  }, [contactLists, listSearch]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const lower = contactSearch.toLowerCase();
    return contacts.filter((contact) => {
      const name = (contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`).toLowerCase();
      const email = (contact.email || '').toLowerCase();
      const phone = (contact.phone || '').toLowerCase();
      return name.includes(lower) || email.includes(lower) || phone.includes(lower);
    });
  }, [contacts, contactSearch]);

  const unsentCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status && !['sent', 'cancelled'].includes(campaign.status)),
    [campaigns]
  );
  const activeSequencesCount = useMemo(() => sequences.filter((sequence) => sequence.is_active).length, [sequences]);
  const pendingActivities = useMemo(
    () => activities.filter((activity) => activity.status && activity.status !== 'completed').length,
    [activities]
  );

  const crmStats = useMemo(
    () => [
      { title: 'CRM Contacts', value: contacts.length, subtitle: `${contactLists.length} lists` },
      { title: 'Students & Parents', value: studentContacts.length, subtitle: 'Auto-synced from education' },
      { title: 'Live Campaigns', value: campaigns.length, subtitle: `${unsentCampaigns.length} pending` },
      { title: 'Active Sequences', value: activeSequencesCount, subtitle: `${pendingActivities} recent activities` }
    ],
    [contacts.length, studentContacts.length, contactLists.length, campaigns.length, unsentCampaigns.length, activeSequencesCount, pendingActivities]
  );

  const filteredVisitorLeads = useMemo(() => {
    return visitorLeads.filter((lead) => {
      const sourceMatch = leadFilters.utm_source
        ? (lead.utm_source || '').toLowerCase().includes(leadFilters.utm_source.toLowerCase())
        : true;
      const mediumMatch = leadFilters.utm_medium
        ? (lead.utm_medium || '').toLowerCase().includes(leadFilters.utm_medium.toLowerCase())
        : true;
      return sourceMatch && mediumMatch;
    });
  }, [visitorLeads, leadFilters]);

  const visitorLeadStats = useMemo(() => {
    const total = visitorLeads.length;
    const submitted = visitorLeads.filter((lead) => lead.form_submitted).length;
    const anonymous = total - submitted;
    return { total, submitted, anonymous, lastSeen: visitorLeads[0]?.last_seen };
  }, [visitorLeads]);

  const handleCopyStudentEmail = (email) => {
    if (!email) return;
    try {
      navigator.clipboard.writeText(email);
      setCopyMessage('Student email copied to clipboard');
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/email/campaigns/');
      setCampaigns(normalizeList(response.data));
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setCampaigns([]);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = activityFilter ? { status: activityFilter } : {};
      const response = await api.get('/email/activities/', { params });
      setActivities(normalizeList(response.data));
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    }
  };

  const fetchSequences = async () => {
    try {
      const response = await api.get('/email/sequences/');
      setSequences(normalizeList(response.data));
    } catch (err) {
      console.error('Error fetching sequences:', err);
      setSequences([]);
    }
  };

  const fetchVisitorLeads = async () => {
    try {
      setVisitorLeadsLoading(true);
      const response = await api.get('/visitor-leads/');
      setVisitorLeads(normalizeList(response.data));
      setVisitorLeadsError(null);
    } catch (err) {
      console.error('Error fetching visitor leads:', err);
      setVisitorLeadsError('Unable to load visitor leads right now.');
      setVisitorLeads([]);
    } finally {
      setVisitorLeadsLoading(false);
    }
  };

  // Template handlers
  const handleOpenTemplateDialog = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name || '',
        subject: template.subject || '',
        body_html: template.body_html || '',
        body_text: template.body_text || '',
        is_active: template.is_active !== false
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        subject: '',
        body_html: '',
        body_text: '',
        is_active: true
      });
    }
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      if (editingTemplate) {
        await api.put(`/email/templates/${editingTemplate.id}/`, templateForm);
        setSuccess('Template updated successfully');
      } else {
        await api.post('/email/templates/', templateForm);
        setSuccess('Template created successfully');
      }
      await fetchTemplates();
      setTemplateDialogOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to save template');
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      setLoading(true);
      await api.delete(`/email/templates/${id}/`);
      await fetchTemplates();
      setSuccess('Template deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete template');
      console.error('Error deleting template:', err);
    } finally {
      setLoading(false);
    }
  };

  // Contact List handlers
  const handleOpenListDialog = (list = null) => {
    if (list) {
      setEditingList(list);
      setListForm({
        name: list.name || '',
        description: list.description || '',
        contact_ids: list.contacts?.map(c => c.id) || []
      });
    } else {
      setEditingList(null);
      setListForm({
        name: '',
        description: '',
        contact_ids: []
      });
    }
    setListDialogOpen(true);
  };

  const handleSaveList = async () => {
    try {
      setLoading(true);
      const data = { ...listForm };
      if (editingList) {
        await api.put(`/email/contact-lists/${editingList.id}/`, data);
        setSuccess('Contact list updated successfully');
      } else {
        await api.post('/email/contact-lists/', data);
        setSuccess('Contact list created successfully');
      }
      await fetchContactLists();
      setListDialogOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to save contact list');
      console.error('Error saving contact list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact list?')) return;
    try {
      setLoading(true);
      await api.delete(`/email/contact-lists/${id}/`);
      await fetchContactLists();
      setSuccess('Contact list deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete contact list');
      console.error('Error deleting contact list:', err);
    } finally {
      setLoading(false);
    }
  };

  // Campaign handlers
  const handleOpenCampaignDialog = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        name: campaign.name || '',
        subject: campaign.subject || '',
        body_html: campaign.body_html || '',
        body_text: campaign.body_text || '',
        template: campaign.template?.id || '',
        contact_list: campaign.contact_list?.id || '',
        scheduled_at: campaign.scheduled_at || '',
        status: campaign.status || 'draft'
      });
    } else {
      setEditingCampaign(null);
      setCampaignForm({
        name: '',
        subject: '',
        body_html: '',
        body_text: '',
        template: '',
        contact_list: '',
        scheduled_at: '',
        status: 'draft'
      });
    }
    setCampaignDialogOpen(true);
  };

  const handleSaveCampaign = async () => {
    try {
      setLoading(true);
      const data = { ...campaignForm };
      if (!data.template) delete data.template;
      if (!data.contact_list) delete data.contact_list;
      if (!data.scheduled_at) delete data.scheduled_at;

      if (editingCampaign) {
        await api.put(`/email/campaigns/${editingCampaign.id}/`, data);
        setSuccess('Campaign updated successfully');
      } else {
        await api.post('/email/campaigns/', data);
        setSuccess('Campaign created successfully');
      }
      await fetchCampaigns();
      setCampaignDialogOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to save campaign');
      console.error('Error saving campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to send this campaign?')) return;
    try {
      setLoading(true);
      await api.post(`/email/campaigns/${id}/send/`);
      setSuccess('Campaign sent successfully');
      await fetchCampaigns();
      await fetchActivities();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || err.response?.data?.message || 'Failed to send campaign');
      console.error('Error sending campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      setLoading(true);
      await api.delete(`/email/campaigns/${id}/`);
      await fetchCampaigns();
      setSuccess('Campaign deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete campaign');
      console.error('Error deleting campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      scheduled: 'info',
      sending: 'warning',
      sent: 'success',
      failed: 'error',
      paused: 'secondary'
    };
    return colors[status] || 'default';
  };

  const getActivityStatusColor = (status) => {
    const colors = {
      sent: 'info',
      delivered: 'success',
      opened: 'primary',
      clicked: 'primary',
      bounced: 'error',
      failed: 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Email Marketing
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {copyMessage && (
        <Alert severity="info" onClose={() => setCopyMessage('')} sx={{ mb: 2 }}>
          {copyMessage}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<EmailIcon />} label="Templates" />
          <Tab icon={<ListIcon />} label="Contact Lists" />
          <Tab icon={<CampaignIcon />} label="Campaigns" />
          <Tab icon={<AnalyticsIcon />} label="Activities" />
          <Tab icon={<PlayIcon />} label="Sequences" />
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {crmStats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h6">Visitor Leads</Typography>
              <Typography variant="body2" color="textSecondary">
                Tracks anonymous visitors, referrers, UTM data, and whether they submitted a form.
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Chip label={`Total: ${visitorLeadStats.total}`} color="default" size="small" />
              <Chip label={`Forms: ${visitorLeadStats.submitted}`} color="success" size="small" />
              <Chip label={`Anonymous: ${visitorLeadStats.anonymous}`} color="info" size="small" />
            </Box>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
            <TextField
              label="UTM Source"
              size="small"
              value={leadFilters.utm_source}
              onChange={(e) => setLeadFilters((prev) => ({ ...prev, utm_source: e.target.value }))}
            />
            <TextField
              label="UTM Medium"
              size="small"
              value={leadFilters.utm_medium}
              onChange={(e) => setLeadFilters((prev) => ({ ...prev, utm_medium: e.target.value }))}
            />
            {(leadFilters.utm_source || leadFilters.utm_medium) && (
              <Button size="small" onClick={() => setLeadFilters({ utm_source: '', utm_medium: '' })}>
                Clear Filters
              </Button>
            )}
          </Box>
          {visitorLeadsError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {visitorLeadsError}
            </Alert>
          )}
        </CardContent>
        <TableContainer component={Paper} sx={{ maxHeight: 280, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Landing Page</TableCell>
                <TableCell>UTM Source</TableCell>
                <TableCell>UTM Medium</TableCell>
                <TableCell>Form</TableCell>
                <TableCell>Last Seen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visitorLeadsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredVisitorLeads.slice(0, 4).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="textSecondary" sx={{ py: 2 }}>
                      No visitor leads match the filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitorLeads.slice(0, 4).map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.landing_page || 'Unknown'}</TableCell>
                    <TableCell>{lead.utm_source || '-'}</TableCell>
                    <TableCell>{lead.utm_medium || '-'}</TableCell>
                    <TableCell>
                      <Chip label={lead.form_submitted ? 'Submitted' : 'Browsing'} size="small" color={lead.form_submitted ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{lead.last_seen ? new Date(lead.last_seen).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <CardActions>
          <Button size="small" onClick={() => fetchVisitorLeads()} startIcon={<RefreshIcon />} disabled={visitorLeadsLoading}>
            Refresh Leads
          </Button>
          <Button size="small" onClick={() => setLeadDialogOpen(true)}>
            View All Leads
          </Button>
        </CardActions>
      </Card>

      {/* Templates Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Email Templates</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTemplateDialog()}
            >
              New Template
            </Button>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {template.name}
                          </Typography>
                          {template.description && (
                            <Typography variant="caption" color="textSecondary">
                              {template.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{template.subject}</Typography>
                          {template.body_html && (
                            <Typography variant="caption" color="textSecondary">
                              {template.body_html.length > 50 
                                ? `${template.body_html.substring(0, 50)}...` 
                                : template.body_html}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={template.is_active ? 'Active' : 'Inactive'}
                          color={template.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {new Date(template.created_at).toLocaleDateString()}
                          </Typography>
                          {template.updated_at && template.updated_at !== template.created_at && (
                            <Typography variant="caption" color="textSecondary">
                              Updated: {new Date(template.updated_at).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setPreviewContent({
                              subject: template.subject,
                              body_html: template.body_html,
                              body_text: template.body_text,
                              email: ''
                            });
                            setPreviewDialogOpen(true);
                          }}
                          title="Preview Template"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenTemplateDialog(template)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Template Dialog */}
          <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Template Name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="HTML Body"
                value={templateForm.body_html}
                onChange={(e) => setTemplateForm({ ...templateForm, body_html: e.target.value })}
                margin="normal"
                multiline
                rows={6}
                placeholder="Use {{first_name}}, {{last_name}}, {{email}} for variables"
              />
              <TextField
                fullWidth
                label="Text Body"
                value={templateForm.body_text}
                onChange={(e) => setTemplateForm({ ...templateForm, body_text: e.target.value })}
                margin="normal"
                multiline
                rows={4}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={templateForm.is_active}
                    onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTemplate} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Contact Lists Tab */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6">Contact Lists</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenListDialog()}
            >
              New List
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              label="Search lists"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />
              }}
            />
            {listSearch && (
              <Button size="small" onClick={() => setListSearch('')}>
                Clear
              </Button>
            )}
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Contacts</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContactLists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary" sx={{ py: 2 }}>
                        No lists match that search term.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContactLists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell>{list.name}</TableCell>
                      <TableCell>{list.description || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => fetchListContacts(list.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          {list.contact_count || 0} contacts
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(list.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenListDialog(list)}
                          title="Edit List"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteList(list.id)}
                          title="Delete List"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Students & Parents Directory
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              This list pulls directly from your education roster so you can see every student’s email and parent contact without creating a separate CRM contact.
            </Typography>
            <Alert severity="info" icon={<MailIcon />} sx={{ mb: 2 }}>
              Copy a student or parent email to add to a contact list or drop them into your next campaign. Search CRM contacts above or create a list for the student segment you want to target.
            </Alert>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Roll</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Parent</TableCell>
                    <TableCell>Parent Phone</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentContactsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : studentContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="textSecondary" sx={{ py: 2 }}>
                          No student contacts found. Ensure the education module is populated.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentContacts.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {student.full_name}
                          </Typography>
                        </TableCell>
                        <TableCell>{student.roll_number || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2">{student.email || '-'}</Typography>
                            {student.email && (
                              <Tooltip title="Copy email">
                                <IconButton size="small" onClick={() => handleCopyStudentEmail(student.email)}>
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{student.parent_name || '-'}</TableCell>
                        <TableCell>{student.parent_phone || '-'}</TableCell>
                        <TableCell>{student.class_name || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.status || 'active'}
                            size="small"
                            color={student.status === 'active' ? 'success' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Contact List Dialog */}
          <Dialog open={listDialogOpen} onClose={() => setListDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>{editingList ? 'Edit Contact List' : 'New Contact List'}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="List Name"
                value={listForm.name}
                onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={listForm.description}
                onChange={(e) => setListForm({ ...listForm, description: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                size="small"
                label="Search CRM contacts"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Contacts</InputLabel>
                <Select
                  multiple
                  value={listForm.contact_ids}
                  onChange={(e) => setListForm({ ...listForm, contact_ids: e.target.value })}
                  renderValue={(selected) => `${selected.length} contacts selected`}
                >
                  {filteredContacts.map((contact) => (
                    <MenuItem key={contact.id} value={contact.id}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {contact.email || 'No email'} {contact.phone && ` • ${contact.phone}`} {contact.company_name && ` • ${contact.company_name}`}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setListDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveList} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>

          {/* View List Contacts Dialog */}
          <Dialog 
            open={listViewDialogOpen} 
            onClose={() => setListViewDialogOpen(false)} 
            maxWidth="lg" 
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Contacts in List</Typography>
                <Typography variant="body2" color="textSecondary">
                  {viewingListContacts.length} contact{viewingListContacts.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Lifecycle</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewingListContacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="textSecondary" sx={{ py: 2 }}>
                            No contacts in this list
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      viewingListContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {contact.email ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MailIcon fontSize="small" color="action" />
                                <Typography 
                                  component="a" 
                                  href={`mailto:${contact.email}`}
                                  sx={{ 
                                    textDecoration: 'none', 
                                    color: 'primary.main',
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                >
                                  {contact.email}
                                </Typography>
                              </Box>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {contact.phone || contact.mobile || '-'}
                          </TableCell>
                          <TableCell>
                            {contact.company_name || '-'}
                          </TableCell>
                          <TableCell>
                            <Chip label={contact.contact_type} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={contact.lifecycle_stage} size="small" color="secondary" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setListViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={leadDialogOpen} onClose={() => setLeadDialogOpen(false)} maxWidth="lg" fullWidth>
            <DialogTitle>Visitor Leads</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Showing {filteredVisitorLeads.length} lead{filteredVisitorLeads.length !== 1 ? 's' : ''}.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last seen: {visitorLeadStats.lastSeen ? new Date(visitorLeadStats.lastSeen).toLocaleString() : '—'}
                </Typography>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Landing Page</TableCell>
                      <TableCell>Referrer</TableCell>
                      <TableCell>UTM Source</TableCell>
                      <TableCell>UTM Medium</TableCell>
                      <TableCell>Form</TableCell>
                      <TableCell>Last Seen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVisitorLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{lead.landing_page || '—'}</TableCell>
                        <TableCell>{lead.referrer || '—'}</TableCell>
                        <TableCell>{lead.utm_source || '—'}</TableCell>
                        <TableCell>{lead.utm_medium || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={lead.form_submitted ? 'Submitted' : 'Browsing'}
                            size="small"
                            color={lead.form_submitted ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{lead.last_seen ? new Date(lead.last_seen).toLocaleString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLeadDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Campaigns Tab */}
      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Email Campaigns</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCampaignDialog()}
            >
              New Campaign
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Contact List</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {campaign.name}
                        </Typography>
                        {campaign.description && (
                          <Typography variant="caption" color="textSecondary">
                            {campaign.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{campaign.subject}</Typography>
                        {campaign.scheduled_at && (
                          <Typography variant="caption" color="textSecondary">
                            Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{campaign.template_name || '-'}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{campaign.contact_list_name || '-'}</Typography>
                        {campaign.contact_list_name && (
                          <Typography variant="caption" color="textSecondary">
                            {campaign.total_recipients || 0} recipients
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {campaign.total_recipients || 0} / {campaign.sent_count || 0} sent
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setPreviewContent({
                            subject: campaign.subject,
                            body_html: campaign.body_html,
                            body_text: campaign.body_text,
                            email: ''
                          });
                          setPreviewDialogOpen(true);
                        }}
                        title="Preview Campaign"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {campaign.status === 'draft' && (
                        <IconButton
                          size="small"
                          onClick={() => handleSendCampaign(campaign.id)}
                          color="primary"
                        >
                          <SendIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleOpenCampaignDialog(campaign)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Campaign Dialog */}
          <Dialog open={campaignDialogOpen} onClose={() => setCampaignDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Campaign Name"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Template</InputLabel>
                <Select
                  value={campaignForm.template}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    setCampaignForm({
                      ...campaignForm,
                      template: e.target.value,
                      subject: template?.subject || campaignForm.subject,
                      body_html: template?.body_html || campaignForm.body_html,
                      body_text: template?.body_text || campaignForm.body_text
                    });
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {templates.filter(t => t.is_active).map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Subject"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Contact List</InputLabel>
                <Select
                  value={campaignForm.contact_list}
                  onChange={(e) => setCampaignForm({ ...campaignForm, contact_list: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {contactLists.map((list) => (
                    <MenuItem key={list.id} value={list.id}>
                      {list.name} ({list.contact_count || 0} contacts)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="HTML Body"
                value={campaignForm.body_html}
                onChange={(e) => setCampaignForm({ ...campaignForm, body_html: e.target.value })}
                margin="normal"
                multiline
                rows={6}
              />
              <TextField
                fullWidth
                label="Text Body"
                value={campaignForm.body_text}
                onChange={(e) => setCampaignForm({ ...campaignForm, body_text: e.target.value })}
                margin="normal"
                multiline
                rows={4}
              />
              <TextField
                fullWidth
                label="Schedule (Optional)"
                type="datetime-local"
                value={campaignForm.scheduled_at}
                onChange={(e) => setCampaignForm({ ...campaignForm, scheduled_at: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={campaignForm.status}
                  onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCampaignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCampaign} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Activities Tab */}
      {tabValue === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Email Activities</Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="opened">Opened</MenuItem>
                <MenuItem value="clicked">Clicked</MenuItem>
                <MenuItem value="bounced">Bounced</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Opened</TableCell>
                  <TableCell>Clicks</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {activity.contact_name || '-'}
                        </Typography>
                        {activity.contact_phone && (
                          <Typography variant="caption" color="textSecondary">
                            {activity.contact_phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {activity.contact_email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MailIcon fontSize="small" color="action" />
                          <Typography 
                            component="a" 
                            href={`mailto:${activity.contact_email}`}
                            sx={{ 
                              textDecoration: 'none', 
                              color: 'primary.main',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {activity.contact_email}
                          </Typography>
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{activity.campaign || '-'}</Typography>
                        {activity.campaign_name && activity.campaign_name !== activity.campaign && (
                          <Typography variant="caption" color="textSecondary">
                            {activity.campaign_name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={activity.status}
                        color={getActivityStatusColor(activity.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {activity.sent_at ? new Date(activity.sent_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      {activity.open_count || 0} {activity.opened_at && `(${new Date(activity.opened_at).toLocaleDateString()})`}
                    </TableCell>
                    <TableCell>
                      {activity.click_count > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LinkIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{activity.click_count}</Typography>
                        </Box>
                      ) : (
                        activity.click_count || 0
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // Find the campaign to get email content
                          const campaign = campaigns.find(c => c.id === activity.campaign_id || c.name === activity.campaign);
                          setPreviewContent({
                            subject: activity.subject || campaign?.subject || '',
                            body_html: activity.body_html || campaign?.body_html || '',
                            body_text: activity.body_text || campaign?.body_text || '',
                            email: activity.contact_email || ''
                          });
                          setPreviewDialogOpen(true);
                        }}
                        title="View Email"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Sequences Tab */}
      {tabValue === 4 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Email Sequences</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSequenceDialogOpen(true)}
            >
              New Sequence
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Steps</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sequences.map((sequence) => (
                  <TableRow key={sequence.id}>
                    <TableCell>{sequence.name}</TableCell>
                    <TableCell>{sequence.description || '-'}</TableCell>
                    <TableCell>{sequence.trigger_event}</TableCell>
                    <TableCell>
                      <Chip
                        label={sequence.is_active ? 'Active' : 'Inactive'}
                        color={sequence.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{sequence.steps?.length || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Email Preview Dialog */}
      <Dialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MailIcon />
            <Typography variant="h6">Email Preview</Typography>
            {previewContent.email && (
              <Chip 
                label={`To: ${previewContent.email}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Subject:
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {previewContent.subject || '(No subject)'}
            </Typography>
          </Box>
          
          {previewContent.body_html ? (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                HTML Content:
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  maxHeight: '400px',
                  overflow: 'auto',
                  bgcolor: '#f5f5f5'
                }}
              >
                <Box
                  dangerouslySetInnerHTML={{ __html: previewContent.body_html }}
                  sx={{
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                      '&:hover': {
                        textDecoration: 'none'
                      }
                    }
                  }}
                />
              </Paper>
            </Box>
          ) : null}
          
          {previewContent.body_text && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Text Content:
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  maxHeight: '200px',
                  overflow: 'auto',
                  bgcolor: '#fafafa',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {previewContent.body_text}
              </Paper>
            </Box>
          )}
          
          {!previewContent.body_html && !previewContent.body_text && (
            <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
              No email content available
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          {previewContent.email && (
            <Button 
              variant="contained" 
              startIcon={<MailIcon />}
              href={`mailto:${previewContent.email}`}
            >
              Send Email
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailMarketing;

