import React from 'react';
import { Button, Tooltip, Box, Typography } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';

const EnhancedButton = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  sx = {}
}) => (
  <Tooltip
    title={
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {description}
        </Typography>
      </Box>
    }
    arrow
    placement="top"
    enterDelay={500}
    disabled={disabled}
  >
    <span> {/* Wrapper for disabled buttons */}
      <Button
        variant={variant}
        color={color}
        size={size}
        startIcon={icon}
        onClick={onClick}
        disabled={disabled}
        fullWidth={fullWidth}
        sx={{
          minWidth: { xs: 150, sm: 120 },
          height: { xs: 56, sm: 40 }, // Larger touch targets on mobile
          fontWeight: 'bold',
          position: 'relative',
          fontSize: { xs: '1rem', sm: '0.875rem' },
          padding: { xs: '12px 24px', sm: '8px 16px' },
          borderRadius: { xs: 2, sm: 1 },
          // Add haptic feedback for mobile
          '&:active': {
            transform: 'scale(0.98)',
            transition: 'transform 0.1s'
          },
          ...sx
        }}
      >
        {title}
        <HelpIcon 
          sx={{ 
            position: 'absolute', 
            top: -5, 
            right: -5, 
            fontSize: 16,
            color: 'primary.main',
            opacity: 0.7
          }} 
        />
      </Button>
    </span>
  </Tooltip>
);

export default EnhancedButton; 