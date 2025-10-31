import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/api";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FactoryIcon from '@mui/icons-material/Factory';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import api from '../services/api';
import { hasPermission, PERMISSIONS } from '../permissions';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { useTheme, useMediaQuery } from '@mui/material';

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> },
  { to: "/manufacturing", label: "Manufacturing", icon: <FactoryIcon fontSize="small" /> },
  { to: "/education", label: "Education", icon: <SchoolIcon fontSize="small" /> },
  { to: "/healthcare", label: "Healthcare", icon: <LocalHospitalIcon fontSize="small" /> },
  { to: "/admin", label: "Admin", icon: <AdminPanelSettingsIcon fontSize="small" /> },
  { to: "/pricing", label: "Pricing", icon: <MonetizationOnIcon fontSize="small" /> },
];

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [industry, setIndustry] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch today's attendance function
  const fetchTodayAttendance = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Navigation: fetchTodayAttendance - user:', user);
    if (!user || !user.id) return;
    
    try {
      let endpoint = '';
      if (user.industry && user.industry.toLowerCase() === 'education') {
        endpoint = '/education/staff-attendance/';
      } else if (user.industry && user.industry.toLowerCase() === 'pharmacy') {
        endpoint = '/pharmacy/staff-attendance/';
      } else if (user.industry && user.industry.toLowerCase() === 'retail') {
        endpoint = '/retail/staff-attendance/';
      } else {
        console.log('Navigation: No attendance for industry:', user.industry);
        return; // No attendance for other industries
      }
      
      console.log('Navigation: Fetching attendance from endpoint:', endpoint);
      const res = await api.get(endpoint);
      console.log('Navigation: Attendance response:', res.data);
      const today = new Date().toISOString().slice(0, 10);
      
      // Handle different response structures
      let attendanceData = [];
      if (Array.isArray(res.data)) {
        attendanceData = res.data;
      } else if (res.data && Array.isArray(res.data.results)) {
        attendanceData = res.data.results;
      }
      
      const record = attendanceData.find(r => r.date === today) || null;
      console.log('Navigation: Today\'s attendance record:', record);
      console.log('Navigation: Today\'s date:', today);
      console.log('Navigation: Available dates:', attendanceData.map(r => r.date));
      console.log('Navigation: Full attendance data:', attendanceData);
      setTodayAttendance(record);
    } catch (error) {
      console.error('Navigation: Error fetching attendance:', error);
      setTodayAttendance(null);
    }
  };

  useEffect(() => {
    // Function to update user state from localStorage
    const updateUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          setUser(userObj);
          setIndustry(userObj.industry);
          setRole(userObj.role || null);
        } catch {
          setUser(null);
          setIndustry(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setIndustry(null);
        setRole(null);
      }
    };

    updateUser();

    // Listen for localStorage changes (cross-tab)
    window.addEventListener('storage', updateUser);

    // Listen for custom event (same tab, after login)
    window.addEventListener('userChanged', updateUser);

    // Fetch today's attendance if user is staff/teacher/admin (for all industries)
    fetchTodayAttendance();
    window.addEventListener('userChanged', fetchTodayAttendance);
    return () => window.removeEventListener('userChanged', fetchTodayAttendance);
  }, []);

  // Check-in/out handlers (implement as needed)
  const handleCheckIn = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Navigation: handleCheckIn - user:', user);
    if (!user.id) {
      setSnackbar({ open: true, message: 'Your profile is missing staff info. Please contact admin.', severity: 'error' });
      return;
    }
    
    let endpoint = '';
    if (user.industry && user.industry.toLowerCase() === 'education') {
      endpoint = '/education/staff-attendance/';
    } else if (user.industry && user.industry.toLowerCase() === 'pharmacy') {
      endpoint = '/pharmacy/staff-attendance/check-in/';
    } else if (user.industry && user.industry.toLowerCase() === 'retail') {
      endpoint = '/retail/staff-attendance/check-in/';
    } else {
      setSnackbar({ open: true, message: 'Check-in is not available for this industry.', severity: 'info' });
      return;
    }
    
    console.log('Navigation: Check-in endpoint:', endpoint);
    setAttendanceLoading(true);
    try {
      if (user.industry && user.industry.toLowerCase() === 'education') {
        // Education uses different API structure
        console.log('Navigation: Making education check-in request');
        await api.post(endpoint, {
          staff_id: user.id,
          date: new Date().toISOString().slice(0, 10),
          check_in_time: new Date().toISOString(),
        });
      } else {
        // Pharmacy and Retail use direct check-in endpoints
        console.log('Navigation: Making pharmacy/retail check-in request');
        await api.post(endpoint);
      }
      
      console.log('Navigation: Check-in successful');
      setSnackbar({ open: true, message: 'Check-in successful!', severity: 'success' });
      // Refresh today's attendance
      await fetchTodayAttendance();
    } catch (err) {
      console.error('Navigation: Check-in error:', err);
      let msg = 'Staff check-in failed.';
      if (err?.response?.data) {
        msg += ' ' + JSON.stringify(err.response.data);
      } else if (err?.message) {
        msg += ' ' + err.message;
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setAttendanceLoading(false);
    }
  };
  const handleCheckOut = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Navigation: handleCheckOut - user:', user);
    if (!user.id) {
      setSnackbar({ open: true, message: 'Your profile is missing staff info. Please contact admin.', severity: 'error' });
      return;
    }
    
    let endpoint = '';
    if (user.industry && user.industry.toLowerCase() === 'education') {
      endpoint = '/education/staff-attendance/';
    } else if (user.industry && user.industry.toLowerCase() === 'pharmacy') {
      endpoint = '/pharmacy/staff-attendance/check-out/';
    } else if (user.industry && user.industry.toLowerCase() === 'retail') {
      endpoint = '/retail/staff-attendance/check-out/';
    } else {
      setSnackbar({ open: true, message: 'Check-out is not available for this industry.', severity: 'info' });
      return;
    }
    
    console.log('Navigation: Check-out endpoint:', endpoint);
    setAttendanceLoading(true);
    try {
      if (user.industry && user.industry.toLowerCase() === 'education') {
        // Education uses different API structure
        console.log('Navigation: Making education check-out request');
        const staff_id = user.id || user.user_id;
        const today = new Date().toISOString().slice(0, 10);
        const res = await api.get('/education/staff-attendance/');
        const record = Array.isArray(res.data) ? res.data.find(r => r.date === today) : null;
        if (!record) throw new Error('No check-in record found for today.');
        await api.patch(`/education/staff-attendance/${record.id}/`, {
          staff: staff_id,
          check_out_time: new Date().toISOString(),
        });
      } else {
        // Pharmacy and Retail use direct check-out endpoints
        console.log('Navigation: Making pharmacy/retail check-out request');
        await api.post(endpoint);
      }
      
      console.log('Navigation: Check-out successful');
      setSnackbar({ open: true, message: 'Check-out successful!', severity: 'success' });
      // Refresh today's attendance
      await fetchTodayAttendance();
    } catch (err) {
      console.error('Navigation: Check-out error:', err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Check-out failed!';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    setMobileOpen(false);
    navigate("/login");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Only show Dashboard, the user's industry module, and Admin if allowed
  const filteredLinks = [];
  if (industry && typeof industry === 'string') {
    filteredLinks.push({ to: "/dashboard", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> });
    if (industry.toLowerCase() === 'education') filteredLinks.push({ to: "/education", label: "Education", icon: <SchoolIcon fontSize="small" /> });
    if (industry.toLowerCase() === 'pharmacy') filteredLinks.push({ to: "/pharmacy", label: "Pharmacy", icon: <LocalHospitalIcon fontSize="small" /> });
    if (industry.toLowerCase() === 'retail') filteredLinks.push({ to: "/retail", label: "Retail", icon: <ShoppingCartIcon fontSize="small" /> });
    if (industry.toLowerCase() === 'salon') filteredLinks.push({ to: "/salon", label: "Salon", icon: <ContentCutIcon fontSize="small" /> });
    // Show additional modules if enabled in user.modules (provided by /users/me/)
    if (user && user.modules) {
      if (user.modules.hotel) filteredLinks.push({ to: "/hotel", label: "Hotel", icon: <HotelIcon fontSize="small" /> });
      if (user.modules.restaurant) filteredLinks.push({ to: "/restaurant", label: "Restaurant", icon: <RestaurantIcon fontSize="small" /> });
      if (user.modules.salon) filteredLinks.push({ to: "/salon", label: "Salon", icon: <ContentCutIcon fontSize="small" /> });
    }
    // Use permission utility for Admin links
    if (user && hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
      filteredLinks.push({ to: "/admin", label: "Admin", icon: <AdminPanelSettingsIcon fontSize="small" /> });
      filteredLinks.push({ to: "/admin/public-settings", label: "Public Settings", icon: <AdminPanelSettingsIcon fontSize="small" /> });
    }
    // Don't add Pricing to navigation; upgrades handled inside Dashboard
  }

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <img 
          src={process.env.PUBLIC_URL + '/_2173c7d8-8cb1-4996-b9b2-b289c17397fa.jpeg'} 
          alt="Zenith ERP Logo" 
          style={{ height: 40, borderRadius: 8 }} 
        />
        <Typography variant="h6" fontWeight={700} color="primary">
          Zenith ERP
        </Typography>
      </Box>
      
      {user && (
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
              {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap fontWeight={600}>
                {user.name || user.username || user.email || 'User'}
              </Typography>
              {user.role && (
                <Chip 
                  label={user.role} 
                  size="small" 
                  sx={{ 
                    mt: 0.5, 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    height: 20,
                    fontSize: '0.7rem'
                  }} 
                />
              )}
            </Box>
          </Box>
          {(!todayAttendance || !todayAttendance.check_in_time) && (
            <Button 
              fullWidth 
              variant="contained" 
              color="secondary" 
              size="small" 
              onClick={() => { handleCheckIn(); handleNavClick(); }} 
              disabled={attendanceLoading}
              sx={{ mb: 1, textTransform: 'none' }}
            >
              {attendanceLoading ? 'Loading...' : 'Check In'}
            </Button>
          )}
          {todayAttendance && todayAttendance.check_in_time && !todayAttendance.check_out_time && (
            <Button 
              fullWidth 
              variant="contained" 
              color="secondary" 
              size="small" 
              onClick={() => { handleCheckOut(); handleNavClick(); }} 
              disabled={attendanceLoading}
              sx={{ mb: 1, textTransform: 'none' }}
            >
              {attendanceLoading ? 'Loading...' : 'Check Out'}
            </Button>
          )}
        </Box>
      )}
      
      <List sx={{ pt: user ? 1 : 2 }}>
        {filteredLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <ListItem key={link.to} disablePadding>
              <ListItemButton
                component={NavLink}
                to={link.to}
                onClick={handleNavClick}
                selected={isActive}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.main' : 'action.hover',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={link.label} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {industry ? (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            component={NavLink}
            to="/login"
            onClick={handleNavClick}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            component={NavLink}
            to="/register"
            onClick={handleNavClick}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Get Started
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      color="primary" 
      elevation={3}
      sx={{ 
        bgcolor: 'primary.main',
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Box 
          component={NavLink}
          to="/"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: { xs: 1, md: 3 },
            textDecoration: 'none',
            '&:hover': { opacity: 0.8 }
          }}
        >
          <img 
            src={process.env.PUBLIC_URL + '/_2173c7d8-8cb1-4996-b9b2-b289c17397fa.jpeg'} 
            alt="Zenith ERP Logo" 
            style={{ 
              height: isMobile ? 35 : 42, 
              borderRadius: 8,
              marginRight: 8
            }} 
          />
          {!isMobile && (
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Zenith ERP
            </Typography>
          )}
        </Box>

        {/* Desktop Navigation Links */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 2 }}>
            {filteredLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Button
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  startIcon={link.icon}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: isActive ? 600 : 500,
                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                    },
                    '&.active': {
                      bgcolor: 'rgba(255, 255, 255, 0.25)',
                    },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: { xs: 1, md: isMobile ? 1 : 0 } }} />

        {/* User Info & Actions - Desktop */}
        {!isMobile && (
          <>
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'secondary.main', 
                    width: 36, 
                    height: 36,
                    fontSize: '0.9rem'
                  }}
                >
                  {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column' }}>
                  <Typography variant="body2" color="inherit" fontWeight={500} noWrap>
                    {user.name || user.username || user.email || 'User'}
                  </Typography>
                  {user.role && (
                    <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                      {user.role}
                    </Typography>
                  )}
                </Box>
                {/* Check In/Out Buttons */}
                {(!todayAttendance || !todayAttendance.check_in_time) && (
                  <Button 
                    color="inherit" 
                    variant="outlined" 
                    size="small" 
                    onClick={handleCheckIn} 
                    disabled={attendanceLoading}
                    sx={{ 
                      textTransform: 'none',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {attendanceLoading ? 'Loading...' : 'Check In'}
                  </Button>
                )}
                {todayAttendance && todayAttendance.check_in_time && !todayAttendance.check_out_time && (
                  <Button 
                    color="inherit" 
                    variant="outlined" 
                    size="small" 
                    onClick={handleCheckOut} 
                    disabled={attendanceLoading}
                    sx={{ 
                      textTransform: 'none',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {attendanceLoading ? 'Loading...' : 'Check Out'}
                  </Button>
                )}
              </Box>
            )}
            {industry ? (
              <Button
                color="secondary"
                variant="contained"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 600,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  }
                }}
              >
                Logout
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  variant="outlined"
                  component={NavLink}
                  to="/login"
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 500,
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  color="secondary"
                  variant="contained"
                  component={NavLink}
                  to="/register"
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    }
                  }}
                >
                  Get Started
                </Button>
              </Box>
            )}
          </>
        )}

        {/* Mobile User Info - Simple */}
        {isMobile && user && (
          <Avatar 
            sx={{ 
              bgcolor: 'secondary.main', 
              width: 32, 
              height: 32,
              fontSize: '0.85rem',
              mr: 1
            }}
          >
            {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
          </Avatar>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppBar>
  );
};

export default Navigation; 