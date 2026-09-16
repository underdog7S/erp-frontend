import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../../../services/api';

const AdministrationTab = ({ canAccessSettings }) => {
  const [subTab, setSubTab] = useState(0);
  
  // Data states
  const [transferCerts, setTransferCerts] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subTab === 0) fetchTransferCerts();
    if (subTab === 1) fetchAdmissions();
  }, [subTab]);

  const fetchTransferCerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/education/transfer-certificates/');
      setTransferCerts(res.data);
    } catch {
      // Ignore errors for now
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/education/admission-applications/');
      setAdmissions(res.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Administration</Typography>
      <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{ mb: 3 }}>
        <Tab label="Transfer Certificates" />
        <Tab label="Admission Applications" />
        {canAccessSettings && <Tab label="Settings" />}
      </Tabs>

      {loading && <CircularProgress sx={{ display: 'block', mb: 2 }} />}

      {subTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transferCerts.length === 0 && <TableRow><TableCell colSpan={3}>No certificates found.</TableCell></TableRow>}
              {transferCerts.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.student?.name || 'N/A'}</TableCell>
                  <TableCell>{row.issue_date}</TableCell>
                  <TableCell>{row.reason_for_leaving}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {subTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admissions.length === 0 && <TableRow><TableCell colSpan={4}>No applications found.</TableCell></TableRow>}
              {admissions.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.student_name}</TableCell>
                  <TableCell>{row.class_applying_for?.name || 'N/A'}</TableCell>
                  <TableCell>{row.application_date}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {subTab === 2 && canAccessSettings && (
        <Alert severity="info">
          Education Module settings and tenant configurations are handled here. 
          Currently under maintenance for the modular upgrade.
        </Alert>
      )}
    </Box>
  );
};

export default AdministrationTab;
