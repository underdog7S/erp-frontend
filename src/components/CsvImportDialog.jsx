import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Alert, CircularProgress, List, ListItem, ListItemText
} from '@mui/material';
import { CloudUpload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import api from '../services/api';

// Shared by Pharmacy (medicines) and Retail (products) - both backends already
// have a fully working CSV import endpoint, they just had no UI calling them.
const CsvImportDialog = ({ open, onClose, importUrl, templateType, label, onImported, note }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError('');
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get(`/import/template/?type=${templateType}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${templateType}_import_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(importUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      if (res.data.imported_count > 0 && onImported) onImported();
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Import {label}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Upload a CSV file to add multiple {label.toLowerCase()} at once. Rows with
          problems (missing fields, duplicates) are skipped and listed below — everything
          else still imports.
        </Typography>
        {note && <Alert severity="info" sx={{ mb: 2 }}>{note}</Alert>}
        <Button startIcon={<DownloadIcon />} onClick={handleDownloadTemplate} sx={{ mb: 2 }}>
          Download CSV Template
        </Button>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 1, p: 3, textAlign: 'center', mb: 2 }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); setError(''); }}
            style={{ display: 'block', margin: '0 auto' }}
          />
          {file && <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>{file.name}</Typography>}
        </Box>
        {result && (
          <Alert severity={result.imported_count > 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
            {result.message}
          </Alert>
        )}
        {result?.errors?.length > 0 && (
          <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <List dense>
              {result.errors.map((err, i) => (
                <ListItem key={i}>
                  <ListItemText primary={err} primaryTypographyProps={{ variant: 'caption', color: 'error' }} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Importing...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CsvImportDialog;
