import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { CheckCircle as CheckIcon, Storefront as RetailIcon, LaptopMac as WebIcon, Business as AgencyIcon } from '@mui/icons-material';

const TargetAudience = () => {
  return (
    <Box sx={{ py: 10, bgcolor: '#050505', color: 'white' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography variant="overline" sx={{ color: '#b388ff', letterSpacing: 2, fontWeight: 700 }}>
            Who we work with
          </Typography>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
            Two very different starting points. One playbook.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Whether you've never had a website, or your team is buckling under the one you already have — the goal is the same: more revenue, less friction.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: 'rgba(25, 118, 210, 0.05)', 
              border: '1px solid rgba(25, 118, 210, 0.2)',
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                borderColor: 'rgba(25, 118, 210, 0.4)'
              }
            }}>
              <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                <RetailIcon sx={{ fontSize: 48, color: '#42a5f5', mb: 2 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                  For businesses without a website yet
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#42a5f5', mb: 4, fontWeight: 600 }}>
                  Your shop, school or clinic — finally on the map
                </Typography>
                <List sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {[
                    "A fast, mobile-first website you're proud to hand out on a card.",
                    "Google Business Profile tuned to capture every 'near me' search.",
                    "Simple booking, enquiry or menu flows — no more DMs and phone tag.",
                    "One editor you can update yourself, without calling a developer."
                  ].map((item, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                        <CheckIcon sx={{ color: '#42a5f5', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={item} primaryTypographyProps={{ variant: 'body1', lineHeight: 1.6 }} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  Retail · Schools · Clinics · Restaurants · Local services
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: 'rgba(0, 229, 255, 0.05)', 
              border: '1px solid rgba(0, 229, 255, 0.2)',
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(0, 229, 255, 0.1)',
                borderColor: 'rgba(0, 229, 255, 0.4)'
              }
            }}>
              <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                <WebIcon sx={{ fontSize: 48, color: '#00e5ff', mb: 2 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                  For businesses with an existing website
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#00e5ff', mb: 4, fontWeight: 600 }}>
                  Stop leaking revenue to slow pages and manual work
                </Typography>
                <List sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {[
                    "Free 3-minute video audit of your current site's speed, SEO and UX.",
                    "Migration to modern Next.js — faster load, better rankings, cleaner CMS.",
                    "AI chatbots and internal dashboards to automate the boring 40%.",
                    "Analytics you actually understand, not another vanity metric."
                  ].map((item, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                        <CheckIcon sx={{ color: '#00e5ff', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={item} primaryTypographyProps={{ variant: 'body1', lineHeight: 1.6 }} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  SaaS · D2C · Real estate · Agencies · Growing SMBs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ 
          bgcolor: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          p: { xs: 4, md: 5 },
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4
        }}>
          <Box sx={{ flexShrink: 0, p: 2, bgcolor: '#1a1a1a', borderRadius: 3 }}>
            <AgencyIcon sx={{ fontSize: 40, color: '#b388ff' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
              Also: white-label for agencies
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Design, marketing and SEO agencies partner with us as their technical build team — so they can say yes to custom apps, AI integrations and complex backends without hiring full-time developers.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TargetAudience;
