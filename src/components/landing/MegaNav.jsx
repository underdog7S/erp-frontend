import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemText, Collapse, Grow, Paper
} from '@mui/material';
import {
  Menu as MenuIcon, Close as CloseIcon, ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon, ArrowForward as ArrowIcon
} from '@mui/icons-material';
import Logo from '../Logo';
import CustomServiceFormDialog from './CustomServiceFormDialog';
import { MEGA_NAV, ABOUT_NAV } from '../../data/megaNavData';

const ACCENT = '#00f2fe';

// The public/marketing navigation bar - ZenWeb / ZenApp / ZenConsult /
// ZenERP / ZenCRM dropdowns plus an About dropdown (Careers/Contact/FAQ).
// Used on the homepage and on every other logged-out marketing page so the
// menu doesn't change depending which page a visitor lands on. Logged-in
// dashboard users get Navigation.js's separate app nav instead - this
// component is never rendered for them.
//
// `onBookConsultation` is optional: pass it when the parent page already
// owns a CustomServiceFormDialog instance (so its other CTAs share the same
// dialog state); omit it and this component manages its own dialog.
const MegaNav = ({ onBookConsultation, transparent = true }) => {
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [selfBookOpen, setSelfBookOpen] = useState(false);
  const closeTimer = useRef(null);

  const handleBook = onBookConsultation || (() => setSelfBookOpen(true));

  const allSections = [...MEGA_NAV, ABOUT_NAV];

  const handleEnter = (key) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpenKey(null), 150);
  };

  const goToItem = (section, item) => {
    setOpenKey(null);
    setMobileOpen(false);
    if (section.key === 'about') {
      navigate(item.path);
    } else {
      navigate(`${section.path}?focus=${item.key}`);
    }
  };

  const goToSection = (section) => {
    setOpenKey(null);
    setMobileOpen(false);
    navigate(section.path || '/');
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        bgcolor: transparent ? 'transparent' : '#000000',
        p: 2
      }}
    >
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Logo height={32} />
        </Box>

        {/* Desktop menu */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          {allSections.map((section) => (
            <Box
              key={section.key}
              onMouseEnter={() => handleEnter(section.key)}
              onMouseLeave={handleLeave}
              sx={{ position: 'relative' }}
            >
              <Button
                onClick={() => goToSection(section)}
                endIcon={<ExpandMoreIcon sx={{ transition: 'transform 0.2s', transform: openKey === section.key ? 'rotate(180deg)' : 'none' }} />}
                sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, textTransform: 'none', px: 1.5 }}
              >
                {section.label}
              </Button>
              <Grow in={openKey === section.key} style={{ transformOrigin: 'top left' }}>
                <Paper
                  elevation={0}
                  onMouseEnter={() => handleEnter(section.key)}
                  onMouseLeave={handleLeave}
                  sx={{
                    display: openKey === section.key ? 'block' : 'none',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    mt: 1,
                    width: 340,
                    bgcolor: '#0d1018',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    p: 1.5
                  }}
                >
                  {section.tagline && (
                    <Typography variant="caption" sx={{ color: ACCENT, letterSpacing: 1, px: 1, textTransform: 'uppercase' }}>
                      {section.tagline}
                    </Typography>
                  )}
                  {section.items.map((item) => (
                    <Box
                      key={item.key}
                      role="button"
                      tabIndex={0}
                      onClick={() => goToItem(section, item)}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: 'rgba(0,242,254,0.08)' }
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                        {item.label}
                      </Typography>
                      {item.description && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block', mt: 0.25 }}>
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Paper>
              </Grow>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
          <Button
            onClick={() => navigate('/login')}
            sx={{ display: { xs: 'none', sm: 'flex' }, color: 'white', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 2, textTransform: 'none' }}
          >
            Start Free Trial
          </Button>
          <Button
            onClick={handleBook}
            sx={{
              background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
              color: 'black', borderRadius: 2, fontWeight: 700, textTransform: 'none', px: { xs: 2, sm: 3 }
            }}
          >
            Book a call
          </Button>
        </Box>
      </Container>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: '85%', maxWidth: 360, bgcolor: '#0a0a0f', color: 'white' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Logo height={28} />
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'white' }} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 1 }}>
          {allSections.map((section) => (
            <React.Fragment key={section.key}>
              <ListItemButton
                onClick={() => setMobileExpanded(mobileExpanded === section.key ? null : section.key)}
              >
                <ListItemText primary={section.label} primaryTypographyProps={{ fontWeight: 700 }} />
                {mobileExpanded === section.key ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
              <Collapse in={mobileExpanded === section.key} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.items.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ pl: 2 }}>
                      <ListItemButton onClick={() => goToItem(section, item)}>
                        <ListItemText
                          primary={item.label}
                          secondary={item.description}
                          secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button fullWidth variant="outlined" onClick={() => { setMobileOpen(false); navigate('/login'); }}
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none' }}>
            Start Free Trial
          </Button>
          <Button fullWidth variant="contained" endIcon={<ArrowIcon />}
            onClick={() => { setMobileOpen(false); handleBook(); }}
            sx={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', color: 'black', fontWeight: 700, textTransform: 'none' }}>
            Book a call
          </Button>
        </Box>
      </Drawer>

      {/* Self-managed dialog - only used when the parent didn't pass its own
          onBookConsultation (e.g. Navigation.js's public pages, which don't
          otherwise need a CustomServiceFormDialog instance). */}
      {!onBookConsultation && (
        <CustomServiceFormDialog open={selfBookOpen} onClose={() => setSelfBookOpen(false)} />
      )}
    </Box>
  );
};

export default MegaNav;
