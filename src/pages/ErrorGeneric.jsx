import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';

/**
 * Generic Error Page Handler
 * Handles various HTTP status codes or redirects invalid ones
 */
const ErrorGeneric = () => {
  const { statusCode } = useParams();
  const navigate = useNavigate();

  // Parse status code
  const code = parseInt(statusCode, 10);

  // HTTP 200 is success, not an error
  if (code === 200) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 120, color: '#4caf50', mb: 2 }} />
          <Typography variant="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 'bold', color: '#4caf50', mb: 2 }}>
            200
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, color: '#666' }}>
            Success!
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#888' }}>
            HTTP 200 is a success status code, not an error. Everything is working correctly!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              startIcon={<DashboardIcon />}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              sx={{ borderColor: '#4caf50', color: '#4caf50' }}
            >
              Go Home
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  // Handle other valid error codes (400-599)
  if (code >= 400 && code <= 599) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 'bold', color: '#666', mb: 2 }}>
            {code}
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, color: '#666' }}>
            Error {code}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#888' }}>
            {code === 400 && 'Bad Request - The request was invalid.'}
            {code === 401 && 'Unauthorized - Please log in to access this resource.'}
            {code === 403 && 'Forbidden - You don\'t have permission to access this resource.'}
            {code === 404 && 'Not Found - The requested resource was not found.'}
            {code === 500 && 'Internal Server Error - Something went wrong on our end.'}
            {code >= 400 && code < 500 && 'Client Error - Please check your request.'}
            {code >= 500 && 'Server Error - Our team has been notified.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
            >
              Go Home
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  // Invalid status code - show 404
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 'bold', color: '#666', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, color: '#666' }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#888' }}>
          The error code "{statusCode}" is not valid. HTTP status codes are between 200-599.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ErrorGeneric;

