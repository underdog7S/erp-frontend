import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';

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

        
        <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', py: 4, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100%', background: 'linear-gradient(to right, #000000, transparent)', zIndex: 2 }} />
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100%', background: 'linear-gradient(to left, #000000, transparent)', zIndex: 2 }} />
          
          <Box 
            component={motion.div}
            animate={{ x: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {/* First Set */}
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>React</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/nextdotjs/ffffff" alt="Next.js" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Next.js</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/django/092E20" alt="Django" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Django</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/python/3776AB" alt="Python" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Python</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/nodedotjs/339933" alt="Node.js" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Node.js</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/postgresql/4169E1" alt="PostgreSQL" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>PostgreSQL</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/mongodb/47A248" alt="MongoDB" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>MongoDB</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/docker/2496ED" alt="Docker" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Docker</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src={process.env.PUBLIC_URL + "/assets/aws-logo.png"} alt="AWS" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>AWS</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/googlecloud/4285F4" alt="GCP" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Google Cloud</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/stripe/008CDD" alt="Stripe" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Stripe</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src={process.env.PUBLIC_URL + "/assets/openai-logo.png"} alt="OpenAI" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>OpenAI</Typography></Box>
            
            {/* Second Set for seamless looping */}
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>React</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/nextdotjs/ffffff" alt="Next.js" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Next.js</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/django/092E20" alt="Django" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Django</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/python/3776AB" alt="Python" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Python</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/nodedotjs/339933" alt="Node.js" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Node.js</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/postgresql/4169E1" alt="PostgreSQL" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>PostgreSQL</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/mongodb/47A248" alt="MongoDB" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>MongoDB</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/docker/2496ED" alt="Docker" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Docker</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src={process.env.PUBLIC_URL + "/assets/aws-logo.png"} alt="AWS" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>AWS</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/googlecloud/4285F4" alt="GCP" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Google Cloud</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src="https://cdn.simpleicons.org/stripe/008CDD" alt="Stripe" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Stripe</Typography></Box>
            <Box sx={{ mx: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><img src={process.env.PUBLIC_URL + "/assets/openai-logo.png"} alt="OpenAI" style={{ height: "50px", opacity: 0.7 }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>OpenAI</Typography></Box>
          </Box>
        </Box>
        
        <Grid container spacing={4} mt={4}>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TechStackMarquee;
