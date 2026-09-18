import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Drawer, List, ListItem, ListItemText, ListItemIcon, IconButton, Collapse, Divider } from '@mui/material';
import { ArrowForward as ArrowIcon, PlayCircleOutline as PlayIcon, Menu as MenuIcon, Close as CloseIcon, ExpandLess, ExpandMore } from '@mui/icons-material';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

// Import Modular Components
import AgencySolutions from '../components/landing/AgencySolutions';
import TargetAudience from '../components/landing/TargetAudience';
import TechStackMarquee from '../components/landing/TechStackMarquee';
import AgencyProcess from '../components/landing/AgencyProcess';
import EnterpriseModules from '../components/landing/EnterpriseModules';
import CustomServiceFormDialog from '../components/landing/CustomServiceFormDialog';
import IntegrationsDemo from '../components/landing/IntegrationsDemo';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const { scrollY } = useScroll();

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
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
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center', perspective: 1000, mr: 4 }}>
              
              {/* Zen Suite Dropdown */}
              <Box sx={{ position: 'relative', '&:hover .suite-menu': { opacity: 1, visibility: 'visible', transform: 'translateY(0)' } }}>
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.1, z: 20, textShadow: '0px 0px 8px rgb(0,242,254)' }}
                  sx={{ cursor: 'pointer', fontWeight: 600, color: 'rgba(255,255,255,0.7)', transition: 'all 0.3s', py: 2 }}
                >
                  Zen Suite ▾
                </Box>
                <Box 
                  className="suite-menu"
                  sx={{ 
                    position: 'absolute', top: '100%', left: '-100px', pt: 1,
                    opacity: 0, visibility: 'hidden', transform: 'translateY(10px)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100 
                  }}
                >
                  <Box sx={{ 
                    bgcolor: 'rgba(15,15,22,0.95)', 
                    border: '1px solid rgba(0,242,254,0.3)', 
                    borderRadius: 3, 
                    p: 2, 
                    width: '380px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,242,254,0.1)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    {[
                      { title: 'Zen ERP', desc: 'Tenant Modules: Retail, Pharmacy, Education, Hotel, Restaurant, Salon', icon: <img src={process.env.PUBLIC_URL + '/assets/erp.png'} alt="Zen ERP" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />, color: '#00f2fe' },
                      { title: 'Zen CRM', desc: 'Leads, Deals, Email Marketing & Pipelines', icon: <img src={process.env.PUBLIC_URL + '/assets/crm.png'} alt="Zen CRM" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />, color: '#ff9a9e' },
                      { title: 'Zen App', desc: 'Custom Mobile Applications (iOS/Android)', icon: <img src={process.env.PUBLIC_URL + '/assets/app.png'} alt="Zen App" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />, color: '#b388ff' },
                      { title: 'Zen Web', desc: 'High-Performance Web Portals & Dashboards', icon: <img src={process.env.PUBLIC_URL + '/assets/web.png'} alt="Zen Web" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />, color: '#00e676' },
                      { title: 'White Labeling', desc: 'Custom branding & domains for your business', icon: <img src={process.env.PUBLIC_URL + '/assets/whitelable.png'} alt="White Labeling" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />, color: '#fbc02d' }
                    ].map(item => (
                      <Box 
                        key={item.title} 
                        onClick={() => scrollToSection('modules')}
                        sx={{ 
                          p: 1.5, 
                          color: 'white', 
                          cursor: 'pointer', 
                          borderRadius: 2, 
                          border: '1px solid transparent',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          '&:hover': { 
                            bgcolor: 'rgba(0,242,254,0.05)', 
                            borderColor: 'rgba(0,242,254,0.2)',
                            transform: 'translateX(4px)'
                          } 
                        }}
                      >
                        <Box sx={{ 
                          width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))`,
                          border: `1px solid ${item.color}50`,
                          fontSize: '1.2rem',
                          color: item.color
                        }}>
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: item.color, fontWeight: 700 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => window.location.href='/login'}
                        sx={{ 
                          color: 'white', 
                          borderColor: 'rgba(255,255,255,0.2)',
                          '&:hover': { borderColor: '#00f2fe', bgcolor: 'rgba(0,242,254,0.05)' }
                        }}
                      >
                        Login / Sign Up
                      </Button>
                      <Button 
                        fullWidth 
                        variant="contained"
                        onClick={() => window.location.href='/pricing'}
                        sx={{ 
                          background: 'linear-gradient(45deg, #00f2fe 0%, #4facfe 100%)',
                          color: '#000',
                          fontWeight: 700
                        }}
                      >
                        Free Trial
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Client Portal Link */}
              
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
                Meet an Expert
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
          
          {/* Render Meaningful Graphic Background */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ position: 'absolute', width: '150%', height: '150%', background: 'radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.05) 0%, rgba(0,0,0,1) 50%)' }} />
            
            {/* Floating Abstract UI Elements */}
            <Box component={motion.div} 
              animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }} 
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
              sx={{ position: 'absolute', right: '10%', top: '20%', width: 300, height: 200, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: 4, backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', p: 3, display: {xs:'none', md:'block'} }}
            >
              <Box sx={{ width: '40%', height: 10, bgcolor: 'rgba(0,242,254,0.5)', borderRadius: 2, mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, height: 60, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                <Box sx={{ flex: 1, height: 60, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
              </Box>
              <Box sx={{ width: '100%', height: 40, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
            </Box>

            <Box component={motion.div} 
              animate={{ y: [0, 25, 0], rotate: [0, -3, 0] }} 
              transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 1 }}
              sx={{ position: 'absolute', left: '10%', bottom: '20%', width: 250, height: 250, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(179,136,255,0.2)', borderRadius: '50%', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', p: 4, display: {xs:'none', md:'flex'}, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}
            >
              <Box sx={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #b388ff, #7c4dff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4">👥</Typography>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Zen CRM</Typography>
            </Box>
          </Box>

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
                We provide Custom Apps, Web Applications, tailored ERPs, CRMs, and full White Labeling services to transform your business operations into an autonomous powerhouse.
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
                  Meet an Expert
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

        {/* Agency Process (Moved to top) */}
        <Box id="process" component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
          <AgencyProcess />
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
            <ListItem button onClick={() => toggleMenu('suite')} sx={{ py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <ListItemText primary="Zen Suite" primaryTypographyProps={{ fontWeight: 600 }} />
              {openMenus.suite ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openMenus.suite} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                {['Zen ERP (Tenant Modules)', 'Zen CRM', 'Zen App', 'Zen Web', 'White Labeling'].map(item => (
                  <ListItem key={item} button sx={{ pl: 4 }} onClick={() => handleMobileNav('modules')}>
                    <ListItemText primary={item} primaryTypographyProps={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }} />
                  </ListItem>
                ))}
              </List>
            </Collapse>

            

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
                onClick={() => { setMobileOpen(false); setAuditDialogOpen(true); }}
              >
                Meet an Expert
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
