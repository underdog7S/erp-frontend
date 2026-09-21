import React from 'react';
import { Card } from '@mui/material';
import { landingCardSx } from '../../theme/landingSurfaces';

/** Dark landing Card that always wins over the app theme's Card background. */
const LandingCard = ({ children, sx, ...props }) => (
  <Card {...props} sx={{ ...landingCardSx, ...sx }}>
    {children}
  </Card>
);

export default LandingCard;
