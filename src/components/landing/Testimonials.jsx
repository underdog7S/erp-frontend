import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const testimonials = [
  {
    quote: "Zenith's custom ERP completely transformed our multi-store inventory. We cut manual data entry by 40% in the first month alone.",
    name: "Sarah Jenkins",
    role: "Operations Director, Retail Group",
    initial: "S",
    color: "#00f2fe"
  },
  {
    quote: "The automated CRM and Telegram bots brought our customer support response time down to zero. Truly an autonomous powerhouse.",
    name: "Michael Chen",
    role: "CEO, Tech Services",
    initial: "M",
    color: "#ff9a9e"
  },
  {
    quote: "The fastest deployment we've ever seen. They had our custom Education portal prototype live in just 14 days. Brilliant team.",
    name: "Dr. Robert Vance",
    role: "Dean of Administration",
    initial: "R",
    color: "#b388ff"
  }
];

const Testimonials = () => {
  return (
    <Box sx={{ py: 15, bgcolor: '#050505', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography variant="overline" sx={{ color: '#00f2fe', letterSpacing: 2, fontWeight: 800 }}>
            Client Success
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mt: 2, mb: 3 }}>
            Trusted by innovators.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ height: '100%' }}
              >
                <Card sx={{ 
                  height: '100%',
                  bgcolor: 'rgba(20, 20, 25, 0.6)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <FormatQuoteIcon sx={{ color: 'rgba(0, 242, 254, 0.3)', fontSize: 40, mb: 2, transform: 'scaleX(-1)' }} />
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontStyle: 'italic', flexGrow: 1 }}>
                      "{testimonial.quote}"
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: testimonial.color, color: 'black', fontWeight: 800 }}>
                        {testimonial.initial}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
