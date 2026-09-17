import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { ArrowForward as ArrowIcon, PlayCircleOutline as PlayIcon } from '@mui/icons-material';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

// Import Modular Components
import AgencySolutions from '../components/landing/AgencySolutions';
import TargetAudience from '../components/landing/TargetAudience';
import TechStackMarquee from '../components/landing/TechStackMarquee';
import AgencyProcess from '../components/landing/AgencyProcess';
import EnterpriseModules from '../components/landing/EnterpriseModules';
import CustomServiceFormDialog from '../components/landing/CustomServiceFormDialog';
import IntegrationsDemo from '../components/landing/IntegrationsDemo';

// Import 3D Background lazily to avoid blocking initial render
const Hero3DScene = React.lazy(() => import('../components/landing/Hero3DScene'));

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
  const { scrollY } = useScroll();

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
        title="Zenith Tech Solutions - Full-Stack, AI & Cloud Agency"
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
              whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
              whileTap={{ scale: 0.95 }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', perspective: 1000 }} 
              onClick={() => scrollToTop()}
            >
              <Typography variant="h5" fontWeight={800} sx={{ 
                letterSpacing: -1, 
                textShadow: '0 0 10px rgba(0, 242, 254, 0.8), 0 0 20px rgba(0, 242, 254, 0.4)',
                transformStyle: 'preserve-3d'
              }}>
                Zenith
              </Typography>
              <Typography variant="h5" fontWeight={300} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Solutions
              </Typography>
            </Box>
            
            {/* Smooth Scroll Links with 3D Hover */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center', perspective: 1000 }}>
              {['solutions', 'modules', 'integrations', 'process'].map((section) => (
                <Box
                  key={section}
                  component={motion.div}
                  whileHover={{ 
                    scale: 1.1, 
                    z: 20,
                    textShadow: '0px 0px 8px rgb(0,242,254)'
                  }}
                  whileTap={{ scale: 0.9 }}
                  sx={{ 
                    cursor: 'pointer', 
                    fontWeight: 600, 
                    color: 'rgba(255,255,255,0.7)', 
                    textTransform: 'capitalize',
                    transformStyle: 'preserve-3d',
                    transition: 'color 0.3s'
                  }} 
                  onClick={() => scrollToSection(section)}
                >
                  {section === 'modules' ? 'ERP Modules' : section}
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                component={motion.button}
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                color="inherit" 
                onClick={() => navigate('/login')} 
                sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}
              >
                Client Portal
              </Button>
              <Button 
                component={motion.button}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 10px 25px rgba(0, 242, 254, 0.6), 0 -5px 15px rgba(79, 172, 254, 0.4)',
                  y: -3
                }}
                whileTap={{ scale: 0.95, y: 0, boxShadow: '0 5px 10px rgba(0, 242, 254, 0.4)' }}
                onClick={() => setAuditDialogOpen(true)}
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
                Start Project
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Hero Section with 3D Background */}
        <Box id="top" sx={{ 
          pt: { xs: 20, md: 25 }, 
          pb: { xs: 10, md: 15 }, 
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}>
          
          {/* Render 3D Scene */}
          <React.Suspense fallback={<Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, bgcolor: '#000000' }} />}>
            <Hero3DScene />
          </React.Suspense>

          <Container 
            maxWidth="lg" 
            sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
            component={motion.div}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Typography variant="overline" sx={{ color: '#00f2fe', letterSpacing: 2, fontWeight: 800, display: 'block', mb: 2 }}>
                Full-Stack · AI · Cloud
              </Typography>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Typography variant="h1" fontWeight={800} sx={{ 
                fontSize: { xs: '3.5rem', md: '5.5rem', lg: '7rem' },
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
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 800, mx: 'auto', mb: 6, lineHeight: 1.6, fontWeight: 400 }}>
                We engineer premium web applications, integrate artificial intelligence, and build custom ERP software that transforms your business operations into an autonomous powerhouse.
              </Typography>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => setAuditDialogOpen(true)}
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
                  Request Consultation
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

        {/* Agency Solutions */}
        <Box id="solutions" component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <AgencySolutions />
        </Box>

        {/* Enterprise SaaS Modules (Zenith ERP) */}
        <Box id="modules" component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <EnterpriseModules />
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

        {/* Agency Process */}
        <Box id="process" component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <AgencyProcess />
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
                  onClick={() => setAuditDialogOpen(true)}
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

        {/* Footer */}
        <Box sx={{ py: 5, bgcolor: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -1, color: '#00f2fe' }}>Zenith</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>ENGINEERING STUDIO</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} Zenith Tech Solutions. Architected with precision.
            </Typography>
          </Container>
        </Box>

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
