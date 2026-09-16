import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';

const stackCategories = [
  {
    title: 'Frontend',
    items: ['React', 'Next.js', 'Tailwind', 'Shadcn UI']
  },
  {
    title: 'Backend',
    items: ['FastAPI', 'Node.js', 'NestJS', 'Django']
  },
  {
    title: 'Databases',
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase']
  },
  {
    title: 'AI & LLM',
    items: ['OpenAI', 'Gemini', 'Claude', 'LangChain', 'RAG', 'Pinecone']
  },
  {
    title: 'Cloud',
    items: ['AWS', 'GCP', 'Azure', 'Oracle Cloud', 'Cloudflare']
  },
  {
    title: 'Payments',
    items: ['Stripe', 'Razorpay', 'PayPal']
  },
  {
    title: 'Comms',
    items: ['WhatsApp API', 'Twilio', 'Gmail', 'Google Calendar']
  },
  {
    title: 'DevOps',
    items: ['Docker', 'Kubernetes', 'GitHub Actions', 'Nginx']
  }
];

const TechStackMarquee = () => {
  return (
    <Box sx={{ py: 10, bgcolor: '#000000', color: 'white', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography variant="overline" sx={{ color: '#ff4081', letterSpacing: 2, fontWeight: 700 }}>
            Toolkit
          </Typography>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
            A serious full-stack + AI + cloud toolkit.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            We don't lead with tools — but when you want to check, here's the shortlist we build on.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {stackCategories.map((cat, idx) => (
            <Grid item xs={6} sm={4} md={3} key={idx}>
              <Box sx={{ 
                p: 3, 
                height: '100%', 
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)'
                }
              }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2 }}>
                  {cat.title}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {cat.items.map((item, itemIdx) => (
                    <Typography key={itemIdx} variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TechStackMarquee;
