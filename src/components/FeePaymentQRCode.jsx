import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Select, MenuItem, FormControl, InputLabel, Alert,
  Paper, Grid, IconButton
} from '@mui/material';
import { QrCode2 as QrCodeIcon, Download as DownloadIcon, Print as PrintIcon, Close as CloseIcon } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

const FeePaymentQRCode = ({ studentId, studentName, studentRollNumber, tenantId, onClose }) => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(studentId ? { id: studentId, name: studentName, rollNumber: studentRollNumber } : null);

  const API_BASE = process.env.REACT_APP_API_URL || 'https://erp-backend-av9v.onrender.com/api';
  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

  useEffect(() => {
    if (!studentId) {
      fetchStudents();
    } else {
      fetchFeeStructures();
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedStudent && selectedStudent.id) {
      fetchFeeStructures();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/education/students/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const studentIdToUse = selectedStudent?.id || studentId;
      if (!studentIdToUse) return;
      
      const response = await axios.get(`${API_BASE}/education/fees/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { student: studentIdToUse }
      });
      if (response.data) {
        setFeeStructures(response.data);
        if (response.data.length > 0) {
          setSelectedFeeStructure(response.data[0].id);
          setAmount(response.data[0].amount || '');
        }
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      setError('Failed to load fee structures');
    }
  };

  const generateQRCode = () => {
    const studentToUse = selectedStudent || { id: studentId, name: studentName, rollNumber: studentRollNumber };
    
    if (!studentToUse || !studentToUse.id) {
      setError('Please select a student');
      return;
    }

    if (!selectedFeeStructure || !amount) {
      setError('Please select a fee structure and enter amount');
      return;
    }

    const selectedFee = feeStructures.find(fs => fs.id === parseInt(selectedFeeStructure));
    if (!selectedFee) {
      setError('Invalid fee structure selected');
      return;
    }

    // Generate URL for public fee payment page
    const params = new URLSearchParams({
      tenant_id: tenantId || '',
      student_roll_number: studentToUse.rollNumber || '',
      fee_structure_id: selectedFeeStructure,
      amount: amount
    });

    const paymentUrl = `${FRONTEND_URL}/pay-fees?${params.toString()}`;
    setQrUrl(paymentUrl);
    setError('');
  };

  const downloadQRCode = () => {
    // Create a canvas from the SVG
    const svgElement = document.querySelector('svg[data-qr-code]');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `fee-payment-qr-${selectedStudent?.rollNumber || studentRollNumber || selectedStudent?.id || studentId}.png`;
        link.href = pngUrl;
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    const svgElement = document.querySelector('svg[data-qr-code]');
    if (svgElement && printWindow) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const studentToUse = selectedStudent || { name: studentName, rollNumber: studentRollNumber };
      printWindow.document.write(`
        <html>
          <head>
            <title>Fee Payment QR Code - ${studentToUse.name}</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              h2 { margin: 10px 0; }
              .info { margin: 5px 0; }
              svg { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h2>Fee Payment QR Code</h2>
            <div class="info"><strong>Student:</strong> ${studentToUse.name}</div>
            <div class="info"><strong>Roll Number:</strong> ${studentToUse.rollNumber}</div>
            <div class="info"><strong>Fee Type:</strong> ${feeStructures.find(fs => fs.id === parseInt(selectedFeeStructure))?.fee_type || 'N/A'}</div>
            <div class="info"><strong>Amount:</strong> ₹${parseFloat(amount).toFixed(2)}</div>
            ${svgData}
            <p>Scan this QR code to pay fees online</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Generate Fee Payment QR Code</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {!studentId && (
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const student = students.find(s => s.id === parseInt(e.target.value));
                setSelectedStudent(student ? { id: student.id, name: student.name, rollNumber: student.upper_id } : null);
                setSelectedFeeStructure('');
                setAmount('');
                setQrUrl('');
              }}
              label="Select Student"
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name} ({student.upper_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {(selectedStudent || studentId) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Student:</strong> {selectedStudent?.name || studentName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Roll Number:</strong> {selectedStudent?.rollNumber || studentRollNumber}
            </Typography>
          </Box>
        )}

        {(selectedStudent || studentId) && (
          <>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Fee Structure</InputLabel>
              <Select
                value={selectedFeeStructure}
                onChange={(e) => {
                  setSelectedFeeStructure(e.target.value);
                  const selected = feeStructures.find(fs => fs.id === parseInt(e.target.value));
                  if (selected) {
                    setAmount(selected.amount || '');
                  }
                }}
                label="Fee Structure"
                disabled={feeStructures.length === 0}
              >
                {feeStructures.length > 0 ? (
                  feeStructures.map((fs) => (
                    <MenuItem key={fs.id} value={fs.id}>
                      {fs.fee_type} - ₹{parseFloat(fs.amount || 0).toFixed(2)}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No fee structures available</MenuItem>
                )}
              </Select>
            </FormControl>
          </>
        )}

        {(selectedStudent || studentId) && (
          <>
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              margin="normal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              required
              disabled={feeStructures.length === 0}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<QrCodeIcon />}
              onClick={generateQRCode}
              sx={{ mt: 2, mb: 2 }}
              disabled={!selectedFeeStructure || !amount || !(selectedStudent || studentId)}
            >
              Generate QR Code
            </Button>
          </>
        )}

        {qrUrl && (
          <Paper elevation={3} sx={{ p: 3, mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Scan to Pay Fees
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <QRCodeSVG
                value={qrUrl}
                size={256}
                level="H"
                includeMargin={true}
                data-qr-code="true"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {(selectedStudent?.name || studentName)} - {feeStructures.find(fs => fs.id === parseInt(selectedFeeStructure))?.fee_type || 'Fee'}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
              Amount: ₹{parseFloat(amount).toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadQRCode}
              >
                Download
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={printQRCode}
              >
                Print
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Parents can scan this QR code with their phone to pay fees online
            </Typography>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeePaymentQRCode;

