import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { IntegrationInstructions, ViewInAr, Api, Storage } from '@mui/icons-material';

const IntegrationsDemo = () => {
  const integrations = [
    { name: 'Odoo ERP', icon: <img src="https://cdn.simpleicons.org/odoo/714B67" alt="Odoo" width="50" height="50" />, color: '#714B67' },
    { name: 'Zoho CRM', icon: <img src="https://cdn.simpleicons.org/zoho/F0483E" alt="Zoho" width="50" height="50" />, color: '#F0483E' },
    { name: 'Salesforce', icon: <img src={process.env.PUBLIC_URL + "/assets/salesforce-logo.svg"} alt="Salesforce" width="50" height="50" />, color: '#00A1E0' },
    { name: 'SAP', icon: <img src="https://cdn.simpleicons.org/sap/0FAAFF" alt="SAP" width="50" height="50" />, color: '#0FAAFF' },
  ];

  return (
    <Box id="integrations" sx={{ py: 12, position: 'relative', bgcolor: '#0a0a0c' }}>
      {/* Background glow */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        right: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 242, 254, 0.05) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(60px)',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" mb={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Typography variant="overline" sx={{ color: '#00f2fe', letterSpacing: 2, fontWeight: 800 }}>
              Seamless Ecosystems
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 3 }}>
              Integrate Everything. Or <span style={{ color: '#00f2fe' }}>Demo Ours</span>.
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 800, mx: 'auto', fontWeight: 400 }}>
              Whether you want to seamlessly connect your existing tools like Zoho and Odoo, or you want to migrate to Zenith's proprietary autonomous ERP, we build the bridges that make your data flow instantly.
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4} alignItems="center">
          
          {/* Integrations Grid */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {integrations.map((item, index) => (
                <Grid item xs={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card sx={{ 
                      bgcolor: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: item.color,
                        boxShadow: `0 10px 30px ${item.color}20`,
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ color: item.color, mb: 2 }}>{item.icon}</Box>
                        <Typography variant="h6" fontWeight={700} color="white">{item.name}</Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Demo Call to Action */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Box sx={{ 
                p: 5, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(26, 26, 36, 0.8) 100%)',
                border: '1px solid rgba(0,242,254,0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: '-20%',
                  right: '-20%',
                  width: '60%',
                  height: '60%',
                  background: 'radial-gradient(circle, rgba(0, 242, 254, 0.2) 0%, transparent 70%)',
                  filter: 'blur(30px)'
                }} />
                
                <Typography variant="h4" fontWeight={800} color="white" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
                  See Zenith ERP in Action
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, position: 'relative', zIndex: 1 }}>
                  Tired of clunky software? Request a live demo of our proprietary CRM and ERP modules. We'll show you exactly how our AI-powered dashboards can automate your specific industry workflows.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, position: 'relative', zIndex: 1 }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    href="/login"
                    sx={{ 
                      background: '#00f2fe',
                      color: 'black',
                      fontWeight: 800,
                      '&:hover': { background: 'white', transform: 'scale(1.05)' }
                    }}
                  >
                    View Live Demo
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default IntegrationsDemo;
