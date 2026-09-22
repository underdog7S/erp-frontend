import React from 'react';
import { Box, Typography } from '@mui/material';

// Single source of truth for the ZenVerse brand mark - used in both navbars,
// the footer, and anywhere else the logo needs to appear. Swapping the image
// or wordmark only needs to happen here.
const Logo = ({ height = 32, showText = true, textColor = 'white', textVariant = 'h6' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      component="img"
      src="/assets/logo/zenverse-logo.png"
      alt="ZenVerse"
      sx={{ height, width: 'auto', display: 'block' }}
    />
    {showText && (
      <Typography
        variant={textVariant}
        fontWeight={800}
        sx={{ color: textColor, letterSpacing: -0.5, lineHeight: 1 }}
      >
        ZenVerse
      </Typography>
    )}
  </Box>
);

export default Logo;
