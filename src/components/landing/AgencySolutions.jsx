import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { 
  SmartToy as BotIcon, 
  Business as EnterpriseIcon, 
  BarChart as AnalyticsIcon, 
  Web as WebIcon, 
  Chat as CommsIcon, 
  CloudQueue as CloudIcon,
  ShoppingCart as ShopIcon,
  Link as ApiIcon
} from '@mui/icons-material';

const solutions = [
  {
    title: 'AI Automation & Bots',
    subtitle: 'AI Agents that answer 80% of customer queries',
    description: 'Custom agents on WhatsApp, web chat and voice — built with LangChain, OpenAI, Gemini or Claude, grounded in your own docs via RAG.',
    icon: <BotIcon sx={{ fontSize: 40 }} />,
    color: '#00e5ff',
    tags: ['LangChain', 'OpenAI', 'Pinecone', 'WhatsApp API']
  },
  {
    title: 'Custom ERP & CRM',
    subtitle: 'Enterprise systems tailored to your operations',
    description: 'Scalable dashboards that unify sales, inventory and finance — replacing the spreadsheet chaos your team is drowning in.',
    icon: <EnterpriseIcon sx={{ fontSize: 40 }} />,
    color: '#b388ff',
    tags: ['Next.js', 'PostgreSQL', 'FastAPI', 'Supabase']
  },
  {
    title: 'Web, SEO & AEO',
    subtitle: 'Built for Google, optimized for Answer Engines (AI)',
    description: 'Blazing-fast sites tuned for both traditional SEO and modern AEO (Answer Engine Optimization) so ChatGPT and Gemini recommend your products.',
    icon: <WebIcon sx={{ fontSize: 40 }} />,
    color: '#ff4081',
    tags: ['Next.js', 'AEO', 'SEO', 'Vercel']
  },
  {
    title: 'E-Commerce & Delivery',
    subtitle: 'End-to-end commerce and delivery platforms',
    description: 'Custom e-commerce platforms and on-demand delivery apps with real-time tracking, razor-sharp UI, and Stripe/Razorpay integrations.',
    icon: <ShopIcon sx={{ fontSize: 40 }} />,
    color: '#ff9100',
    tags: ['React Native', 'Stripe', 'WebSockets', 'Logistics']
  },
  {
    title: 'API Integrations',
    subtitle: 'Connect your entire software ecosystem',
    description: 'Custom middleware and delivery APIs that link your disjointed systems. We integrate SaaS, CRMs, and payment gateways into a single unified flow.',
    icon: <ApiIcon sx={{ fontSize: 40 }} />,
    color: '#18ffff',
    tags: ['REST', 'GraphQL', 'Webhooks', 'Microservices']
  },
  {
    title: 'Data & Analytics',
    subtitle: 'Automated data pipelines, real answers instead of gut-feel',
    description: 'From messy CSVs to cloud-hosted analytics on AWS or GCP, with Power BI dashboards leaders actually read on Monday morning.',
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    color: '#69f0ae',
    tags: ['Python', 'Pandas', 'AWS', 'Power BI']
  },
  {
    title: 'Comms & Booking',
    subtitle: 'WhatsApp, SMS and voice flows that don\'t miss a lead',
    description: 'Twilio, WhatsApp Business API and calendar integrations that book, remind and follow up — 24/7, in your customer\'s language.',
    icon: <CommsIcon sx={{ fontSize: 40 }} />,
    color: '#ffd740',
    tags: ['Twilio', 'WhatsApp', 'Google Calendar', 'Whisper']
  },
  {
    title: 'Cloud & DevOps',
    subtitle: 'Cloud migration and infra that stops surprising you',
    description: 'Dockerised deployments across AWS, Azure, GCP or Oracle Cloud, with CI/CD, monitoring and cost guardrails built in from day one.',
    icon: <CloudIcon sx={{ fontSize: 40 }} />,
    color: '#7c4dff',
    tags: ['Docker', 'Kubernetes', 'GitHub Actions', 'Cloudflare']
  }
];

const AgencySolutions = () => {
  return (
    <Box sx={{ py: 10, bgcolor: '#0a0a0a', color: 'white', position: 'relative' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography variant="overline" sx={{ color: '#00e5ff', letterSpacing: 2, fontWeight: 700 }}>
            Solutions
          </Typography>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
            Not a stack. A shortlist of business outcomes.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            We productise our full-stack, AI and cloud toolkit into six things we're happy to be judged on.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {solutions.map((sol, idx) => (
            <Grid item xs={12} md={6} lg={4} key={idx}>
              <Card 
                sx={{ 
                  height: '100%', 
                  bgcolor: 'rgba(20, 20, 20, 0.8)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    borderColor: sol.color,
                    bgcolor: 'rgba(30, 30, 30, 0.95)',
                    boxShadow: `0 10px 40px -10px ${sol.color}40`,
                  }
                }}
              >
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ color: sol.color, mb: 2 }}>
                    {sol.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {sol.title}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: sol.color, mb: 2, fontWeight: 600 }}>
                    {sol.subtitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, flexGrow: 1, lineHeight: 1.7 }}>
                    {sol.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {sol.tags.map((tag, tidx) => (
                      <Chip 
                        key={tidx} 
                        label={tag} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.05)', 
                          color: 'rgba(255,255,255,0.8)',
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }} 
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AgencySolutions;
