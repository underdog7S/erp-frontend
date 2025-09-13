import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  { q: 'Is the Free plan really free?', a: 'Yes. The Free plan includes up to 15 users, 500MB storage, and access to one industry-specific module.' },
  { q: 'Can I upgrade later?', a: 'Absolutely. You can switch to Starter, Pro, or Enterprise anytime from your dashboard.' },
  { q: 'What industries do you support?', a: 'We currently support Education, Manufacturing, and more being added soon.' },
  { q: 'Where is my data stored?', a: 'Your data is stored securely on Oracle Cloud with encrypted backups.' },
  { q: 'Can I invite my team?', a: 'Yes. Depending on your plan, you can invite users with roles (admin, staff, etc.).' },
  { q: 'Is support included?', a: 'Yes. Free and Starter plans have Email Support. Pro and Enterprise plans include Priority Support (with chat/call).' },
];

const FAQ = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
    <Typography variant="h3" color="primary" gutterBottom>Frequently Asked Questions</Typography>
    {faqs.map((item, idx) => (
      <Accordion key={idx} sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1"><b>❓ {item.q}</b></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">{item.a}</Typography>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
);

export default FAQ; 