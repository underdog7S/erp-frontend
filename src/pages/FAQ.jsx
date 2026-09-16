import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Button,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  HelpOutline as HelpIcon,
  ContactMail as ContactIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const categories = {
    'general': 'General',
    'pricing': 'Pricing & Plans',
    'features': 'Features',
    'technical': 'Technical',
    'billing': 'Billing & Payments',
    'support': 'Support & Help'
  };

  // Total FAQs count: 24 questions
  // General: 4, Pricing: 5, Features: 5, Technical: 5, Billing: 6, Support: 4

const faqs = [
    // General
    { 
      id: 'gen1',
      category: 'general',
      q: 'What is Zenith ERP?', 
      a: 'Zenith ERP is a comprehensive, cloud-based Enterprise Resource Planning solution designed for businesses across six industries: Education, Pharmacy, Retail, Hotel, Restaurant, and Salon. It helps streamline operations, manage resources, and drive business growth with industry-specific modules and real-time analytics.' 
    },
    { 
      id: 'gen2',
      category: 'general',
      q: 'Is Zenith ERP suitable for my business?', 
      a: 'Yes! Zenith ERP is designed for small to large businesses across multiple industries. Whether you run a school, pharmacy, retail store, hotel, restaurant, or salon, we have specialized modules tailored to your industry needs. Our flexible plans scale with your business growth.' 
    },
    { 
      id: 'gen3',
      category: 'general',
      q: 'How many industries does Zenith ERP support?', 
      a: 'Zenith ERP currently supports six industries: Education (25+ schools), Pharmacy (30+ pharmacies), Retail (50+ stores), Hotel (15+ hotels), Restaurant (40+ restaurants), and Salon (35+ salons). We continue to add more industry-specific modules based on customer needs.' 
    },
    { 
      id: 'gen4',
      category: 'general',
      q: 'Do I need technical knowledge to use Zenith ERP?', 
      a: 'No! Zenith ERP is designed to be user-friendly and intuitive. Our interface is simple enough for non-technical users, while still offering powerful features for advanced users. We provide comprehensive documentation, video tutorials, and support to help you get started.' 
    },

    // Pricing
    { 
      id: 'price1',
      category: 'pricing',
      q: 'Is the Free plan really free forever?', 
      a: 'Yes! Our Free plan is completely free with no credit card required. It includes 2 users, 500MB storage, access to one industry module, and email support. You can use it as long as you need without any hidden charges.' 
    },
    { 
      id: 'price2',
      category: 'pricing',
      q: 'Can I upgrade or downgrade my plan anytime?', 
      a: 'Absolutely! You can upgrade your plan at any time from your dashboard. Your new plan will be prorated. Downgrades take effect at the next billing cycle. All plan changes are instant and hassle-free.' 
    },
    { 
      id: 'price3',
      category: 'pricing',
      q: 'What happens if I exceed my plan limits?', 
      a: 'If you exceed user or storage limits, we will notify you and provide options to upgrade. Your data remains safe, and you will have a grace period to upgrade. We never delete your data due to plan limits.' 
    },
    { 
      id: 'price4',
      category: 'pricing',
      q: 'Are there any setup fees or hidden costs?', 
      a: 'No! There are no setup fees, hidden costs, or surprise charges. All plans are transparent with clear pricing. The only exception is custom development services, which are clearly quoted before work begins.' 
    },
    { 
      id: 'price5',
      category: 'pricing',
      q: 'Do you offer enterprise/custom pricing?', 
      a: 'Yes! For large organizations or custom requirements, we offer enterprise plans with dedicated account managers, custom development, SLA guarantees, and on-premise options. Contact our sales team for a custom quote.' 
    },

    // Features
    { 
      id: 'feat1',
      category: 'features',
      q: 'What features are included in all plans?', 
      a: 'All plans include: Core ERP features, Multi-tenant architecture, Role-based access control, Real-time analytics dashboards, Mobile access, Email support, Data security & encryption, Automatic backups, and Industry-specific modules (quantity depends on plan).' 
    },
    { 
      id: 'feat2',
      category: 'features',
      q: 'Can I access Zenith ERP on mobile devices?', 
      a: 'Yes! Zenith ERP is fully responsive and works seamlessly on smartphones and tablets. You can access all features, view dashboards, manage inventory, process transactions, and more from any device with a web browser.' 
    },
    { 
      id: 'feat3',
      category: 'features',
      q: 'Does Zenith ERP support API access?', 
      a: 'API access is available on Starter, Pro, and Business plans. Our RESTful API allows you to integrate Zenith ERP with other systems, automate workflows, and build custom applications. API documentation is available for all API-enabled plans.' 
    },
    { 
      id: 'feat4',
      category: 'features',
      q: 'Can I customize the ERP for my specific needs?', 
      a: 'Yes! We offer customization services for all plans. Basic customizations can be done through admin settings. For advanced customizations, custom development services, or white-label options, contact our team for a consultation.' 
    },
    { 
      id: 'feat5',
      category: 'features',
      q: 'What kind of reports and analytics are available?', 
      a: 'Zenith ERP provides comprehensive real-time analytics including: Revenue reports, Inventory reports, Sales trends, Customer analytics, Staff performance, Attendance reports, Financial summaries, and Custom report generation. Advanced analytics are available on Pro and Business plans.' 
    },

    // Technical
    { 
      id: 'tech1',
      category: 'technical',
      q: 'Where is my data stored?', 
      a: 'Your data is stored securely on enterprise-grade cloud infrastructure with automatic backups. We use industry-standard encryption for data at rest and in transit. Data centers are located in secure, redundant facilities ensuring 99.9% uptime.' 
    },
    { 
      id: 'tech2',
      category: 'technical',
      q: 'Is my data secure and backed up?', 
      a: 'Absolutely! We implement bank-level security with SSL encryption, regular security audits, and compliance with industry standards. Automatic daily backups ensure your data is always protected. Business plans include additional backup options.' 
    },
    { 
      id: 'tech3',
      category: 'technical',
      q: 'Can I export my data?', 
      a: 'Yes! You can export your data at any time in various formats (CSV, Excel, PDF). There are no restrictions on data export. Your data belongs to you, and you can export it whenever needed.' 
    },
    { 
      id: 'tech4',
      category: 'technical',
      q: 'What browsers are supported?', 
      a: 'Zenith ERP works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We recommend using the latest version of your preferred browser for the best experience. Mobile browsers are fully supported.' 
    },
    { 
      id: 'tech5',
      category: 'technical',
      q: 'Do you offer on-premise deployment?', 
      a: 'On-premise deployment is available for Business and Enterprise plans. This option provides maximum control and customization. Contact our sales team to discuss on-premise deployment options and requirements.' 
    },

    // Billing
    { 
      id: 'bill1',
      category: 'billing',
      q: 'What payment methods do you accept?', 
      a: 'We accept all major payment methods through Razorpay, India\'s leading payment gateway: Credit Cards (Visa, Mastercard, RuPay, American Express), Debit Cards (all major banks), UPI (Google Pay, PhonePe, Paytm, BHIM, and all UPI apps), Net Banking (all major banks), Wallets (Paytm, Mobikwik, Freecharge), and EMI options. Annual plans can also be paid via invoice for Business customers. All payments are processed securely through Razorpay with PCI-DSS compliant encryption.' 
    },
    { 
      id: 'bill2',
      category: 'billing',
      q: 'What is your refund policy?', 
      a: 'We offer a 30-day money-back guarantee for all paid plans. If you are not satisfied within the first 30 days, contact us at support@zenitherp.online for a full refund. Approved refunds are processed through Razorpay within 5-10 business days to your original payment method. No questions asked for refunds within the guarantee period. Free plans can be canceled anytime.' 
    },
    { 
      id: 'bill3',
      category: 'billing',
      q: 'How does billing work for annual plans?', 
      a: 'Annual plans are billed once per year in INR (Indian Rupees) and offer significant savings compared to monthly billing. You can choose annual or monthly billing when upgrading. Annual plans include additional features and priority support. Payments are processed securely through Razorpay with automatic receipt generation.' 
    },
    { 
      id: 'bill4',
      category: 'billing',
      q: 'Will I be notified before my plan renews?', 
      a: 'Yes! We send renewal reminders via email 30 days, 7 days, and 1 day before your plan expires. You can also see your renewal date in your dashboard and set up automatic renewal if preferred. Renewal payments are processed through Razorpay.' 
    },
    { 
      id: 'bill5',
      category: 'billing',
      q: 'Is my payment information secure?', 
      a: 'Absolutely! We use Razorpay, which is PCI-DSS Level 1 certified (the highest level of security certification). Your card details are never stored on our servers - they are securely processed by Razorpay. We only store transaction records (amount, date, plan) for accounting purposes. All payment data is encrypted in transit using SSL/TLS encryption.' 
    },
    { 
      id: 'bill6',
      category: 'billing',
      q: 'What currency do you accept?', 
      a: 'Currently, we accept payments in Indian Rupees (INR) only. All prices are displayed in ₹ (INR). Razorpay supports payments from Indian bank accounts and cards issued by Indian banks.' 
    },

    // Support
    { 
      id: 'sup1',
      category: 'support',
      q: 'What support options are available?', 
      a: 'Free and Starter plans include Email Support (response within 24-48 hours). Pro and Business plans include Priority Support with chat, phone, and email (response within 4-8 hours). Business plans also include a dedicated account manager.' 
    },
    { 
      id: 'sup2',
      category: 'support',
      q: 'Do you provide training for my team?', 
      a: 'Yes! We provide comprehensive documentation, video tutorials, and onboarding assistance. Pro and Business plan customers receive dedicated training sessions. Custom training can be arranged for all plans.' 
    },
    { 
      id: 'sup3',
      category: 'support',
      q: 'What are your support hours?', 
      a: 'Email Support: Monday to Saturday, 9 AM - 6 PM IST. Priority Support (Pro/Business): Available 24/7 via email, with extended hours for chat and phone support. Business plan customers have dedicated account manager availability.' 
    },
    { 
      id: 'sup4',
      category: 'support',
      q: 'How quickly do you respond to support requests?', 
      a: 'Response times vary by plan: Free/Starter: 24-48 hours, Pro: 4-8 hours, Business: 2-4 hours with dedicated account manager. Critical issues are prioritized across all plans.' 
    }
  ];

  const filteredFAQs = searchQuery.trim() === '' 
    ? faqs 
    : faqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getCategoryFAQs = (category) => {
    return filteredFAQs.filter(faq => faq.category === category);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', py: 4 }}>
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Find answers to common questions about Zenith ERP. Can't find what you're looking for? Contact our support team.
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 600,
              mx: 'auto',
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* FAQ Categories */}
        {Object.entries(categories).map(([key, label]) => {
          const categoryFAQs = getCategoryFAQs(key);

          return (
            <Box key={key} sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpIcon color="primary" />
                {label}
              </Typography>
              {categoryFAQs.length === 0 ? (
                <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery ? `No FAQs found in ${label.toLowerCase()} matching your search.` : `No FAQs in ${label.toLowerCase()} category.`}
                  </Typography>
                </Card>
              ) : (
                categoryFAQs.map((faq) => (
                <Accordion
                  key={faq.id}
                  expanded={expanded === faq.id}
                  onChange={handleChange(faq.id)}
                  sx={{
                    mb: 2,
                    '&:before': { display: 'none' },
                    boxShadow: 2,
                    borderRadius: 2,
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: expanded === faq.id ? '8px 8px 0 0' : '8px'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {faq.q}
                    </Typography>
        </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: '#f9f9f9', borderRadius: '0 0 8px 8px' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                      {faq.a}
                    </Typography>
        </AccordionDetails>
      </Accordion>
                ))
              )}
            </Box>
          );
        })}

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <HelpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No FAQs found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try searching with different keywords or contact our support team.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ContactIcon />}
              onClick={() => navigate('/contact')}
            >
              Contact Support
            </Button>
          </Card>
        )}

        {/* Contact CTA */}
        <Card sx={{ mt: 8, p: 6, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Still Have Questions?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Our support team is here to help you 24/7
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowIcon />}
              onClick={() => navigate('/contact')}
              sx={{
                bgcolor: '#ffa726',
                color: 'white',
                '&:hover': { bgcolor: '#ff9800', transform: 'scale(1.05)' }
              }}
            >
              Contact Support
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Start Free Trial
            </Button>
          </Stack>
        </Card>
      </Container>
  </Box>
);
};

export default FAQ; 
