import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, TextField, Button, Switch, FormControlLabel,
  Alert, Chip, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Snackbar, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import api from '../../services/api';

const CATEGORIES = [
  ['shops', 'Shops'], ['restaurants', 'Restaurants & cafes'], ['schools_colleges', 'Schools & colleges'],
  ['clinics_pharmacies', 'Clinics & pharmacies'], ['hotels', 'Hotels & guest houses'],
  ['salons', 'Salons & beauty'], ['offices', 'Offices'], ['manufacturers', 'Workshops & factories'],
];

const LeadCapture = () => {
  const [tab, setTab] = useState(0);
  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [leads, setLeads] = useState([]);
  const [within, setWithin] = useState('');
  const [prospects, setProspects] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [search, setSearch] = useState({ category: 'shops', q: '', radius_km: 3 });
  const [error, setError] = useState('');

  const loadConfig = useCallback(() => {
    api.get('/lead-capture/config/').then(r => setCfg(r.data)).catch(() => setError('Could not load settings.'));
  }, []);
  const loadLeads = useCallback(() => {
    api.get('/lead-capture/leads/', { params: within ? { within } : {} })
      .then(r => setLeads(Array.isArray(r.data) ? r.data : (r.data.results || [])))
      .catch(() => setLeads([]));
  }, [within]);

  useEffect(() => { loadConfig(); }, [loadConfig]);
  useEffect(() => { if (tab === 1) loadLeads(); }, [tab, loadLeads]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/lead-capture/config/', {
        business_name: cfg.business_name, intro_message: cfg.intro_message, success_message: cfg.success_message,
        center_query: cfg.center_query, service_radius_km: cfg.service_radius_km || '', is_active: cfg.is_active,
      });
      setCfg(res.data);
      setToast(res.data.warning || 'Saved');
    } catch (e) {
      setToast(e.response?.data?.error || e.response?.data?.detail || 'Could not save (admin access needed).');
    } finally { setSaving(false); }
  };

  const copy = (text) => {
    try { navigator.clipboard.writeText(text); setToast('Copied'); } catch (e) { setToast('Copy failed'); }
  };

  const runSearch = async () => {
    setSearching(true); setSearchErr(''); setProspects(null);
    try {
      const res = await api.get('/lead-capture/prospects/', { params: search, timeout: 40000 });
      setProspects(res.data.results.map(p => ({ ...p, saved: false })));
    } catch (e) {
      setSearchErr(e.response?.data?.error || 'Search failed. Try a smaller radius.');
    } finally { setSearching(false); }
  };

  const saveProspect = async (p) => {
    try {
      const res = await api.post('/lead-capture/prospects/save/', p);
      setProspects(list => list.map(x => x.osm_id === p.osm_id ? { ...x, saved: true } : x));
      setToast(res.data.duplicate ? 'Already in your CRM' : 'Saved to CRM contacts');
    } catch (e) { setToast(e.response?.data?.error || 'Could not save'); }
  };

  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;
  if (!cfg) return <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>;

  const field = (k) => ({ value: cfg[k] ?? '', onChange: (e) => setCfg({ ...cfg, [k]: e.target.value }) });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700}>Lead Capture</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Collect enquiries from your website or a shareable link, and see how far each lead is from your service area.
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label="Setup" /><Tab label="Captured leads" /><Tab label="Prospect finder" />
      </Tabs>

      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <FormControlLabel control={<Switch checked={!!cfg.is_active} onChange={(e) => setCfg({ ...cfg, is_active: e.target.checked })} />}
            label={cfg.is_active ? 'Form is live' : 'Form is switched off'} />
          <TextField fullWidth margin="dense" label="Business name shown on form" {...field('business_name')} />
          <TextField fullWidth margin="dense" label="Intro message" {...field('intro_message')} />
          <TextField fullWidth margin="dense" label="Thank-you message" {...field('success_message')} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField sx={{ flex: 2, minWidth: 220 }} margin="dense" label="Service-area centre (pincode or place)" {...field('center_query')}
              helperText={cfg.center_lat != null ? `Located: ${cfg.center_lat.toFixed(3)}, ${cfg.center_lng.toFixed(3)}` : 'Used to measure lead distance'} />
            <TextField sx={{ flex: 1, minWidth: 140 }} margin="dense" type="number" label="Service radius"
              InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }} {...field('service_radius_km')} />
          </Box>
          <Button variant="contained" sx={{ mt: 2 }} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4 }}>1. Share this link (or make a QR code)</Typography>
          <TextField fullWidth margin="dense" value={cfg.form_url} InputProps={{ readOnly: true, endAdornment:
            <Tooltip title="Copy"><IconButton onClick={() => copy(cfg.form_url)}><CopyIcon /></IconButton></Tooltip> }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>2. Or paste on your website (before &lt;/body&gt;)</Typography>
          <TextField fullWidth margin="dense" multiline value={cfg.embed_snippet || ''} InputProps={{ readOnly: true, endAdornment:
            <Tooltip title="Copy"><IconButton onClick={() => copy(cfg.embed_snippet)}><CopyIcon /></IconButton></Tooltip> }} />
          <Typography variant="body2" color="text.secondary">Adds an "Enquire now" button. Leads land in Contacts as source "website_form".</Typography>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <TextField select size="small" label="Area" value={within} onChange={(e) => setWithin(e.target.value)} sx={{ minWidth: 180, mb: 2 }}>
            <MenuItem value="">All leads</MenuItem>
            <MenuItem value="in">Inside service area</MenuItem>
            <MenuItem value="out">Outside service area</MenuItem>
            <MenuItem value="unknown">Location unknown</MenuItem>
          </TextField>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead><TableRow>
                <TableCell>Name</TableCell><TableCell>Phone</TableCell><TableCell>Email</TableCell>
                <TableCell>Distance</TableCell><TableCell>Area</TableCell><TableCell>Received</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {leads.length === 0 && <TableRow><TableCell colSpan={6} align="center">No leads yet</TableCell></TableRow>}
                {leads.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{l.name}</TableCell><TableCell>{l.phone}</TableCell><TableCell>{l.email}</TableCell>
                    <TableCell>{l.distance_km != null ? `${l.distance_km} km` : '-'}</TableCell>
                    <TableCell>
                      {l.within_service_area === true && <Chip size="small" color="success" label="In area" />}
                      {l.within_service_area === false && <Chip size="small" color="warning" label="Out of area" />}
                      {l.within_service_area == null && <Chip size="small" label="Unknown" />}
                    </TableCell>
                    <TableCell>{l.created_at ? new Date(l.created_at).toLocaleDateString() : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>For B2B outreach only.</strong> These are publicly listed business phone numbers/emails from OpenStreetMap.
            Do <strong>not</strong> send bulk WhatsApp, SMS or marketing email to them: it breaks WhatsApp/TRAI/DPDP rules and can get your
            number banned. Contact one business at a time, with a personal call or a one-to-one message. Saved prospects are not opted in to any messaging.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select size="small" label="Category" value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })} sx={{ minWidth: 200 }}>
              {CATEGORIES.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Pincode or place" value={search.q} onChange={(e) => setSearch({ ...search, q: e.target.value })}
              helperText="Blank = your service-area centre" />
            <TextField size="small" type="number" label="Radius (km)" value={search.radius_km} sx={{ width: 120 }}
              onChange={(e) => setSearch({ ...search, radius_km: e.target.value })} helperText="2-5 works best" />
            <Button variant="contained" onClick={runSearch} disabled={searching}>{searching ? 'Searching...' : 'Find businesses'}</Button>
          </Box>
          {searchErr && <Alert severity="error" sx={{ mt: 2 }}>{searchErr}</Alert>}
          {searching && <Box sx={{ mt: 2, textAlign: 'center' }}><CircularProgress size={28} /></Box>}
          {prospects && (
            <Box sx={{ mt: 2, overflowX: 'auto' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>{prospects.length} businesses with public contact details</Typography>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Business</TableCell><TableCell>Phone</TableCell><TableCell>Email / website</TableCell>
                  <TableCell>Distance</TableCell><TableCell />
                </TableRow></TableHead>
                <TableBody>
                  {prospects.map(p => (
                    <TableRow key={p.osm_id}>
                      <TableCell>{p.name}<Typography variant="caption" display="block" color="text.secondary">{p.address}</Typography></TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>{p.email || p.website}</TableCell>
                      <TableCell>{p.distance_km != null ? `${p.distance_km} km` : '-'}</TableCell>
                      <TableCell><Button size="small" disabled={p.saved} onClick={() => saveProspect(p)}>{p.saved ? 'Saved' : 'Save to CRM'}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      )}
      <Snackbar open={!!toast} autoHideDuration={3500} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default LeadCapture;
