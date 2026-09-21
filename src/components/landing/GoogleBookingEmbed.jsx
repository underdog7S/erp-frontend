import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { expertBookingEmbedUrl, expertBookingUrl, openExpertBooking } from '../../utils/expertBooking';

const GoogleBookingEmbed = ({ height = 640 }) => {
  if (expertBookingEmbedUrl) {
    return (
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <iframe
          title="Select a consultation date and time"
          src={expertBookingEmbedUrl}
          style={{ border: 0, width: '100%', minHeight: height, height, display: 'block' }}
        />
      </Box>
    );
  }

  if (!expertBookingUrl) {
    return (
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
        Our scheduling calendar is being updated. Submit the form and our team will contact you.
      </Typography>
    );
  }

  return (
    <Button variant="contained" onClick={() => openExpertBooking()}>
      Open calendar in a new tab
    </Button>
  );
};

export default GoogleBookingEmbed;
