import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Button } from '@mui/material';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';
import { industryModules } from './industryModulesData';

const EnterpriseModules = () => {
  return (
    <Box sx={{ py: 12, bgcolor: '#0a0a0a', color: 'white', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography variant="overline" sx={{ color: '#b388ff', letterSpacing: 2, fontWeight: 700 }}>
            Pre-built SaaS Products
          </Typography>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
            Ready-to-deploy Enterprise Systems
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Looking for something out of the box? Our multi-tenant cloud ERP platform powers businesses across 6 major industries.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {industryModules.map((module, idx) => (
            <Grid item xs={12} md={6} lg={4} key={idx}>
              <Card 
                sx={{ 
                  height: '100%', 
                  bgcolor: 'rgba(20, 20, 20, 0.8)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: module.primaryColor,
                    bgcolor: 'rgba(30, 30, 30, 0.95)',
                    boxShadow: `0 10px 40px -10px ${module.primaryColor}40`,
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: `${module.primaryColor}15`,
                      color: module.primaryColor 
                    }}>
                      {module.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'white', lineHeight: 1.2 }}>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: module.primaryColor }}>
                        {module.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3, flexGrow: 1 }}>
                    {module.features.map((feat, fidx) => (
                      <Typography key={fidx} variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: module.primaryColor, mr: 1.5 }} />
                        {feat}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 1.5 }}>
                      PERFECT FOR:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {module.useCases.map((uc, ucIdx) => (
                        <Chip 
                          key={ucIdx}
                          label={uc}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box textAlign="center" mt={8}>
          <Button
            variant="outlined"
            href="/register"
            endIcon={<ArrowIcon />}
            sx={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.05)'
              }
            }}
          >
            Start your free ERP trial
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default EnterpriseModules;
