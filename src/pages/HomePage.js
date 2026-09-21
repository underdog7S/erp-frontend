import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Box, Container, Typography, Button, Grid, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { ArrowForward as ArrowIcon, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

// Import Modular Components
import AgencySolutions from '../components/landing/AgencySolutions';
import TargetAudience from '../components/landing/TargetAudience';
import TechStackMarquee from '../components/landing/TechStackMarquee';
import AgencyProcess from '../components/landing/AgencyProcess';
import CustomServiceFormDialog from '../components/landing/CustomServiceFormDialog';
import IntegrationsDemo from '../components/landing/IntegrationsDemo';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';

// Import 3D Background lazily to avoid blocking initial render
const Hero3DScene = React.lazy(() => import('../components/landing/Hero3DScene'));
import HolographicEcosystem from '../components/landing/HolographicEcosystem';

// Framer Motion Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  const handleBookConsultation = () => {
    setAuditDialogOpen(true);
  };

  const handleMobileNav = (section) => {
    setMobileOpen(false);
    scrollToSection(section);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title="ZenVerse Tech Solutions - Full-Stack, AI & Cloud Agency"
        description="We ship websites, AI agents and custom dashboards for businesses that are tired of losing money to slow tech and manual work."
        keywords="AI Agency, Full-Stack Development, Cloud Migration, Custom ERP, Tech Solutions, Zenith ERP"
        url="https://zenitherp.online"
        type="website"
      />
      <Box sx={{ bgcolor: '#000000', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
        
        {/* Navigation Bar - Clean & Sticky */}
        <Box 
          sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          bgcolor: '#000000', 
          backdropFilter: 'none',
          borderBottom: '1px solid transparent',
          boxShadow: 'none',
          transition: 'all 0.3s ease-in-out',
          p: 2
        }}>
          <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              onClick={() => scrollToTop()}
            >
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h6" fontWeight={900} sx={{
                  lineHeight: 1,
                  letterSpacing: -0.5,
                  background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  ZV | ZenVerse
                </Typography>
              </Box>
            </Box>
            
            {/* Smooth Scroll Links with 3D Hover */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: { md: 2, lg: 3 }, alignItems: 'center', perspective: 1000, mr: 2, flexWrap: 'wrap' }}>
              {[
                { label: 'Zen ERP', path: '/erp' },
                { label: 'Zen CRM', path: '/crm' },
                { label: 'Zen App', path: '/zen-app' },
                { label: 'Zen Web', path: '/zen-web' },
                { label: 'Custom ERP', path: '/contact' },
              ].map((item) => (
                <Box
                  key={item.path}
                  component={motion.div}
                  whileHover={{ scale: 1.06, z: 20, textShadow: '0px 0px 8px rgb(0,242,254)' }}
                  onClick={() => navigate(item.path)}
                  sx={{ cursor: 'pointer', fontWeight: 600, color: 'rgba(255,255,255,0.7)', transition: 'all 0.3s', py: 1, whiteSpace: 'nowrap', fontSize: '0.95rem' }}
                >
                  {item.label}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <IconButton 
                sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </IconButton>
              <Button 
                component={motion.button}
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                color="inherit" 
                onClick={() => navigate('/login')} 
                sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}
              >
                Start Free Trial
              </Button>
              <Button 
                component={motion.button}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 10px 25px rgba(0, 242, 254, 0.6), 0 -5px 15px rgba(79, 172, 254, 0.4)',
                  y: -3
                }}
                whileTap={{ scale: 0.95, y: 0, boxShadow: '0 5px 10px rgba(0, 242, 254, 0.4)' }}
                onClick={handleBookConsultation}
                sx={{ 
                  background: 'linear-gradient(45deg, #00f2fe, #4facfe)', 
                  color: 'black', 
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 800,
                  boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)',
                  transformStyle: 'preserve-3d'
                }}
              >
                Book a free consultation
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Hero Section with 3D Background */}
        <Box id="top" sx={{ 
          pt: { xs: 15, md: 18 }, 
          pb: { xs: 10, md: 15 }, 
          position: 'relative',
          minHeight: { xs: '100vh', md: '90vh' },
          display: 'flex',
          alignItems: 'flex-start' /* Pushes content to the top organically */
        }}>
          
          {/* 3D Holographic Ecosystem Background */}
          <HolographicEcosystem />

          <Container 
            maxWidth="lg" 
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}
                component={motion.div}
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                sx={{ textAlign: { xs: 'center', md: 'left' }, mt: { md: 2 } }}
              >
                <motion.div variants={fadeInUp}>
                  <Typography variant="overline" sx={{ color: '#00f2fe', letterSpacing: 2, fontWeight: 800, display: 'block', mb: 2 }}>
                    Full-Stack · AI · Cloud
                  </Typography>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Typography variant="h1" fontWeight={800} sx={{ 
                    fontSize: { xs: '3.5rem', md: '5.5rem', lg: '6.5rem' },
                    lineHeight: 1.1,
                    letterSpacing: -2,
                    mb: 4,
                    background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(0,242,254,0.2)'
                  }}>
                    Engineering the future.
                  </Typography>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 600, mx: { xs: 'auto', md: 0 }, mb: 6, lineHeight: 1.6, fontWeight: 400 }}>
                    We provide custom apps, web applications, and tailored ERP and CRM systems to transform your business operations into an autonomous powerhouse.
                  </Typography>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Box sx={{ display: 'flex', gap: 3, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={handleBookConsultation}
                  endIcon={<ArrowIcon />}
                  sx={{ 
                    background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
                    color: 'black', 
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 20px rgba(0,242,254,0.4)' },
                    borderRadius: 2,
                    px: 5,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Book a free consultation
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    '&:hover': { borderColor: '#00f2fe', bgcolor: 'rgba(0,242,254,0.05)' },
                    borderRadius: 2,
                    px: 5,
                    py: 1.5,
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  View Live Demo
                </Button>
              </Box>
            </motion.div>
              </Grid>
              <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                {/* 3D Ecosystem occupies the right side naturally because the left text container is only md={7} */}
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Key Metrics Banner */}
        <Box 
          component={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(5,5,5,0.8)', py: 6, position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)' }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} textAlign="center">
              {[
                { metric: '40%', label: 'less manual admin after automation' },
                { metric: '3×', label: 'faster page loads post-migration' },
                { metric: '24/7', label: 'AI coverage on WhatsApp & web' },
                { metric: '2 wks', label: 'from kickoff to first live prototype' },
              ].map((stat, idx) => (
                <Grid item xs={6} md={3} key={idx}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Typography variant="h2" fontWeight={800} sx={{ color: '#00f2fe', mb: 1, textShadow: '0 0 20px rgba(0,242,254,0.3)' }}>{stat.metric}</Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 150, mx: 'auto' }}>{stat.label}</Typography>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Agency Process (Moved to top) */}
        <Box id="process" component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <AgencyProcess />
        </Box>

        {/* Agency Solutions */}
        <Box id="solutions" component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <AgencySolutions />
        </Box>



        {/* Integrations and Demo */}
        <Box id="integrations" component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <IntegrationsDemo />
        </Box>

        {/* Target Audience / Who we work with */}
        <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <TargetAudience />
        </Box>

        {/* Tech Stack */}
        <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <TechStackMarquee />
        </Box>


        {/* Testimonials */}
        <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <Testimonials />
        </Box>

        {/* FAQ Section */}
        <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <FAQ />
        </Box>

        {/* Bottom CTA */}
        <Box sx={{ py: 15, bgcolor: '#000000', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
          <Box sx={{ 
            position: 'absolute', 
            bottom: '0%', 
            left: '50%', 
            transform: 'translate(-50%, 0)', 
            width: '100vw', 
            height: '400px', 
            background: 'radial-gradient(ellipse at bottom, rgba(0,242,254,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.div variants={fadeInUp}>
                <Typography variant="h2" fontWeight={800} gutterBottom sx={{ textShadow: '0 10px 30px rgba(0,242,254,0.2)' }}>
                  Initialize your digital evolution.
                </Typography>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6, fontWeight: 400 }}>
                  We'll send back a technical blueprint showing exactly where you're losing revenue — and how a custom build with us can automate your workflow.
                </Typography>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={handleBookConsultation}
                  sx={{ 
                    background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
                    color: 'black', 
                    '&:hover': { transform: 'scale(1.05)', boxShadow: '0 10px 30px rgba(0,242,254,0.5)' },
                    borderRadius: 2,
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Request Technical Blueprint
                </Button>
              </motion.div>
            </motion.div>
          </Container>
        </Box>

        {/* Mobile Navigation Drawer */}
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{
            sx: {
              width: '100%',
              maxWidth: 300,
              bgcolor: 'rgba(10,10,15,0.95)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(0,242,254,0.2)',
              color: 'white'
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#00f2fe' }}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ p: 0 }}>
            {[
              { name: 'Zen ERP', path: '/erp' },
              { name: 'Zen CRM', path: '/crm' },
              { name: 'Zen App', path: '/zen-app' },
              { name: 'Zen Web', path: '/zen-web' },
              { name: 'Custom ERP', path: '/contact' },
            ].map((item) => (
              <ListItem key={item.path} button sx={{ py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { setMobileOpen(false); navigate(item.path); }}>
                <ListItemText primary={item.name} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
            ))}

            

            <Box sx={{ p: 3 }}>
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mb: 2, color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                onClick={() => { setMobileOpen(false); navigate('/login'); }}
              >
                Start Free Trial
              </Button>
              <Button 
                fullWidth 
                variant="contained" 
                sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'black', fontWeight: 800 }}
                onClick={() => { setMobileOpen(false); handleBookConsultation(); }}
              >
                Book a free consultation
              </Button>
            </Box>
          </List>
        </Drawer>

        {/* Dialog for Custom Services */}
        <CustomServiceFormDialog 
          open={auditDialogOpen} 
          onClose={() => setAuditDialogOpen(false)} 
        />

      </Box>
    </>
  );
};

export default HomePage;
