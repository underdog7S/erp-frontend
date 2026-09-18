import React from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: "How long does it take to deploy a custom ERP?",
    answer: "Most of our core modules (Retail, Pharmacy, Hotel) can be deployed within a few days. For fully custom builds, we typically launch an initial working prototype in just 14 days, with full deployment in 4-6 weeks."
  },
  {
    question: "Do you offer white-label solutions?",
    answer: "Yes! All of our Zen Suite platforms (ERP, CRM, Web, App) can be fully white-labeled with your branding, colors, logos, and custom domain name. Your clients will only see your brand."
  },
  {
    question: "How does the free trial work?",
    answer: "You get full access to a demo environment of the Zen Suite. You can explore the dashboards, test the POS, and see the analytics in real-time. No credit card is required to start your trial."
  },
  {
    question: "Can Zenith integrate with our existing software?",
    answer: "Absolutely. We specialize in seamless API integrations. We can bridge Zenith with your legacy systems, payment gateways (like Razorpay), WhatsApp, Telegram, and any other third-party tools you rely on."
  }
];

const FAQ = () => {
  return (
    <Box sx={{ py: 15, bgcolor: '#000000', position: 'relative' }}>
      <Container maxWidth="md">
        <Box textAlign="center" mb={8}>
          <Typography variant="overline" sx={{ color: '#00f2fe', letterSpacing: 2, fontWeight: 800 }}>
            Got Questions?
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mt: 2, mb: 3 }}>
            Frequently Asked Questions
          </Typography>
        </Box>

        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {faqs.map((faq, index) => (
            <Accordion 
              key={index} 
              sx={{ 
                bgcolor: 'rgba(20, 20, 25, 0.8)', 
                color: 'white',
                mb: 2,
                borderRadius: '8px !important',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#00f2fe' }} />}
                sx={{ p: 3 }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ;
