import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/api";
import { useSidebar } from "../contexts/SidebarContext";
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
import { useEffect, useState, useMemo, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import api, { getStoredUser } from '../services/api';
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
import ListSubheader from '@mui/material/ListSubheader';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import { useTheme, useMediaQuery } from '@mui/material';
import NotificationBell from './NotificationBell';
import NotificationCenter from './NotificationCenter';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PaymentIcon from '@mui/icons-material/Payment';
import ContactsIcon from '@mui/icons-material/Contacts';
import EmailIcon from '@mui/icons-material/Email';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GradeIcon from '@mui/icons-material/Grade';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import BrushIcon from '@mui/icons-material/Brush';
import SpaIcon from '@mui/icons-material/Spa';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const MODULE_DEFINITIONS = {
  education: [
    {
      key: 'education-students',
      label: 'Student & Class Ops',
      icon: <PersonIcon fontSize="small" />,
      items: [
        { label: 'Education Home', to: '/education', icon: <SchoolIcon fontSize="small" /> },
        { label: 'Student Directory', to: '/education?tab=1', icon: <PersonIcon fontSize="small" />, badgeKey: 'studentDirectory' },
        { label: 'Classes', to: '/education?tab=0', icon: <ClassIcon fontSize="small" /> },
        { label: 'Timetable', to: '/education/timetable', icon: <ScheduleIcon fontSize="small" /> },
        { label: 'Academic Terms', to: '/education?tab=5', icon: <CalendarTodayIcon fontSize="small" /> },
        { label: 'Subjects & Units', to: '/education?tab=6', icon: <LibraryBooksIcon fontSize="small" /> },
      ],
    },
    {
      key: 'education-exams',
      label: 'Assessments & Reports',
      icon: <AssessmentIcon fontSize="small" />,
      items: [
        { label: 'Assessments', to: '/education?tab=8', icon: <AssessmentIcon fontSize="small" /> },
        { label: 'Marks Entry', to: '/education?tab=9', icon: <GradeIcon fontSize="small" /> },
        { label: 'Report Cards', to: '/education?tab=10', icon: <AssessmentIcon fontSize="small" /> },
        { label: 'Exam Management', to: '/education/exams', icon: <AssignmentIcon fontSize="small" /> },
      ],
    },
    {
      key: 'education-finance',
      label: 'Finance & Dues',
      icon: <AttachMoneyIcon fontSize="small" />,
      items: [
        { label: 'Fee Structures', to: '/education?tab=0', icon: <AttachMoneyIcon fontSize="small" /> },
        { label: 'Fee Collections', to: '/education?tab=2', icon: <AttachMoneyIcon fontSize="small" />, badgeKey: 'feeCollections' },
        { label: 'Attendance', to: '/education?tab=3', icon: <EventAvailableIcon fontSize="small" />, badgeKey: 'attendance' },
        { label: 'Public Fee Portal', to: '/pay-fees', icon: <PaymentIcon fontSize="small" /> },
      ],
    },
    {
      key: 'education-analytics',
      label: 'Analytics & Certificates',
      icon: <BarChartIcon fontSize="small" />,
      items: [
        { label: 'Education Analytics', to: '/education?tab=11', icon: <BarChartIcon fontSize="small" /> },
        { label: 'Transfer Certificates', to: '/education?tab=12', icon: <DescriptionIcon fontSize="small" /> },
        { label: 'Admission Applications', to: '/education?tab=13', icon: <PersonAddAlt1Icon fontSize="small" /> },
      ],
    },
    {
      key: 'education-settings',
      label: 'Settings & Admin',
      icon: <SettingsIcon fontSize="small" />,
      items: [
        { label: 'Education Settings', to: '/education?tab=14', icon: <SettingsIcon fontSize="small" />, roles: ['admin', 'principal'] },
      ],
    },
  ],
  pharmacy: [
    {
      key: 'pharmacy-operations',
      label: 'Pharmacy Operations',
      icon: <LocalPharmacyIcon fontSize="small" />,
      items: [
        { label: 'Pharmacy Home', to: '/pharmacy', icon: <LocalPharmacyIcon fontSize="small" /> },
        { label: 'Inventory & Stock', to: '/pharmacy?section=inventory', icon: <Inventory2Icon fontSize="small" /> },
        { label: 'Sales & Prescriptions', to: '/pharmacy?section=sales', icon: <ReceiptLongIcon fontSize="small" /> },
      ],
    },
    {
      key: 'pharmacy-finance',
      label: 'Pharmacy Finance',
      icon: <AttachMoneyIcon fontSize="small" />,
      items: [
        { label: 'Payments', to: '/payment?industry=pharmacy', icon: <AttachMoneyIcon fontSize="small" /> },
      ],
    },
  ],
  retail: [
    {
      key: 'retail-ops',
      label: 'Retail Operations',
      icon: <StorefrontIcon fontSize="small" />,
      items: [
        { label: 'Retail Home', to: '/retail', icon: <StorefrontIcon fontSize="small" /> },
        { label: 'Catalog & Inventory', to: '/retail?section=inventory', icon: <Inventory2Icon fontSize="small" /> },
        { label: 'POS & Orders', to: '/retail?section=orders', icon: <PointOfSaleIcon fontSize="small" /> },
        { label: 'Promotions', to: '/retail?section=promotions', icon: <LocalOfferIcon fontSize="small" /> },
        { label: 'Payments', to: '/payment?industry=retail', icon: <AttachMoneyIcon fontSize="small" /> },
      ],
    },
  ],
  hotel: [
    {
      key: 'hotel-ops',
      label: 'Hotel Operations',
      icon: <HotelIcon fontSize="small" />,
      items: [
        { label: 'Hotel Home', to: '/hotel', icon: <HotelIcon fontSize="small" /> },
        { label: 'Rooms & Services', to: '/hotel?section=rooms', icon: <RoomServiceIcon fontSize="small" /> },
        { label: 'Bookings & Reservations', to: '/hotel?section=bookings', icon: <CalendarTodayIcon fontSize="small" /> },
        { label: 'Guest Payments', to: '/payment?industry=hotel', icon: <AttachMoneyIcon fontSize="small" /> },
      ],
    },
  ],
  restaurant: [
    {
      key: 'restaurant-ops',
      label: 'Restaurant Operations',
      icon: <RestaurantIcon fontSize="small" />,
      items: [
        { label: 'Restaurant Home', to: '/restaurant', icon: <RestaurantMenuIcon fontSize="small" /> },
        { label: 'Menu & Orders', to: '/restaurant?section=menu', icon: <FastfoodIcon fontSize="small" /> },
        { label: 'Reservations & Tables', to: '/restaurant?section=reservations', icon: <LocalDiningIcon fontSize="small" /> },
        { label: 'Payments', to: '/payment?industry=restaurant', icon: <AttachMoneyIcon fontSize="small" /> },
      ],
    },
  ],
  salon: [
    {
      key: 'salon-appointments',
      label: 'Appointments',
      icon: <SpaIcon fontSize="small" />,
      items: [
        { label: 'Salon Home', to: '/salon', icon: <ContentCutIcon fontSize="small" /> },
        { label: 'Appointments', to: '/salon?section=appointments', icon: <SpaIcon fontSize="small" /> },
      ],
    },
    {
      key: 'salon-services',
      label: 'Services & Stylists',
      icon: <BrushIcon fontSize="small" />,
      items: [
        { label: 'Services & Stylists', to: '/salon?section=services', icon: <BrushIcon fontSize="small" /> },
        { label: 'Salon CRM', to: '/salon/crm', icon: <ContactsIcon fontSize="small" /> },
      ],
    },
    {
      key: 'salon-finance',
      label: 'Finance & Billing',
      icon: <ReceiptLongIcon fontSize="small" />,
      items: [
        { label: 'Salon Billing', to: '/salon/billing', icon: <ReceiptLongIcon fontSize="small" /> },
        { label: 'Payments', to: '/payment?industry=salon', icon: <AttachMoneyIcon fontSize="small" /> },
      ],
    },
  ],
};

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
  const { isOpen: desktopOpen, toggleSidebar, openSidebar } = useSidebar();
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const hideNavigationPaths = ['/login', '/register', '/auth/google/callback'];

  // Fetch today's attendance function
  const fetchTodayAttendance = async () => {
    const user = getStoredUser();
    if (!user || !user.id) {
      return; // User not logged in or invalid
    }
    
    try {
      let endpoint = '';
      if (user.industry && user.industry.toLowerCase() === 'education') {
        endpoint = '/education/staff-attendance/';
      } else if (user.industry && user.industry.toLowerCase() === 'pharmacy') {
        endpoint = '/pharmacy/staff-attendance/';
      } else if (user.industry && user.industry.toLowerCase() === 'retail') {
        endpoint = '/retail/staff-attendance/';
      } else {
        // No attendance tracking for this industry
        return; // No attendance for other industries
      }
      
      const res = await api.get(endpoint);
      const today = new Date().toISOString().slice(0, 10);
      
      // Handle different response structures
      let attendanceData = [];
      if (Array.isArray(res.data)) {
        attendanceData = res.data;
      } else if (res.data && Array.isArray(res.data.results)) {
        attendanceData = res.data.results;
      }
      
      const record = attendanceData.find(r => r.date === today) || null;
      // Attendance data processed
      setTodayAttendance(record);
    } catch (error) {
      console.error('Navigation: Error fetching attendance:', error);
      setTodayAttendance(null);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('user');

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

  // Auto-open the sidebar once when the user logs in on desktop - must not
  // depend on desktopOpen, or closing the sidebar (desktopOpen -> false)
  // would re-trigger this effect and immediately reopen it, making manual
  // close a no-op.
  const hasAutoOpenedRef = useRef(false);
  useEffect(() => {
    if (user && !isMobile && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      openSidebar();
    }
    if (!user) {
      hasAutoOpenedRef.current = false;
    }
  }, [user, isMobile, openSidebar]);

  // Check-in/out handlers (implement as needed)
  const handleCheckIn = async () => {
    const user = getStoredUser();
    if (!user.id) {
      setSnackbar({ open: true, message: 'Your profile is missing staff info. Please contact admin.', severity: 'error' });
      return;
    }
    
    let endpoint = '';
    if (user.industry && user.industry.toLowerCase() === 'education') {
      endpoint = '/education/staff-attendance/check-in/';
    } else if (user.industry && user.industry.toLowerCase() === 'pharmacy') {
      endpoint = '/pharmacy/staff-attendance/check-in/';
    } else if (user.industry && user.industry.toLowerCase() === 'retail') {
      endpoint = '/retail/staff-attendance/check-in/';
    } else {
      setSnackbar({ open: true, message: 'Check-in is not available for this industry.', severity: 'info' });
      return;
    }
    
    setAttendanceLoading(true);
    try {
      await api.post(endpoint);
      setSnackbar({ open: true, message: 'Check-in successful!', severity: 'success' });
      await fetchTodayAttendance();
    } catch (err) {
      console.error('Navigation: Check-in error:', err);
      let msg = 'Staff check-in failed.';
      if (err?.response?.data) {
        msg += ' ' + (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data));
      } else if (err?.message) {
        msg += ' ' + err.message;
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    const user = getStoredUser();
    if (!user.id) {
      setSnackbar({ open: true, message: 'Your profile is missing staff info. Please contact admin.', severity: 'error' });
      return;
    }
    
    let endpoint = '';
    if (user.industry && user.industry.toLowerCase() === 'education') {
      endpoint = '/education/staff-attendance/check-out/';
    } else if (user.industry && user.industry.toLowerCase() === 'pharmacy') {
      endpoint = '/pharmacy/staff-attendance/check-out/';
    } else if (user.industry && user.industry.toLowerCase() === 'retail') {
      endpoint = '/retail/staff-attendance/check-out/';
    } else {
      setSnackbar({ open: true, message: 'Check-out is not available for this industry.', severity: 'info' });
      return;
    }
    
    setAttendanceLoading(true);
    try {
      await api.post(endpoint);
      setSnackbar({ open: true, message: 'Check-out successful!', severity: 'success' });
      await fetchTodayAttendance();
    } catch (err) {
      console.error('Navigation: Check-out error:', err);
      const msg = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : 'Check-out failed!';
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

  const industryKey = industry?.toLowerCase();
  const userRole = (user?.role || '').toLowerCase();

  const activeModules = useMemo(() => {
    if (!industryKey) return [];
    const moduleDefinition = MODULE_DEFINITIONS[industryKey];
    if (Array.isArray(moduleDefinition)) return moduleDefinition;
    return moduleDefinition ? [moduleDefinition] : [];
  }, [industryKey]);

  const [expandedModule, setExpandedModule] = useState(null);
  useEffect(() => {
    if (!activeModules.length) {
      setExpandedModule(null);
      return;
    }
    if (!expandedModule || !activeModules.some(mod => mod.key === expandedModule)) {
      setExpandedModule(activeModules[0].key);
    }
  }, [activeModules, expandedModule]);

  const [searchTerm, setSearchTerm] = useState('');

  const DEFAULT_EDUCATION_STATS = {
    totalStudents: 0,
    classesWithDues: 0,
    feesRemaining: 0,
    attendanceRate: 0,
  };

  const [educationStats, setEducationStats] = useState(DEFAULT_EDUCATION_STATS);

  const badgeConfig = {
    feeCollections: { statKey: 'feesRemaining', color: 'error', format: (value) => Math.round(value) || 0 },
    attendance: { statKey: 'attendanceRate', color: 'secondary', format: (value) => `${Math.round(value || 0)}%` },
    studentDirectory: { statKey: 'totalStudents', color: 'primary', format: (value) => value || 0 },
  };

  const industryDisplayNames = {
    education: 'Education',
    pharmacy: 'Pharmacy',
    retail: 'Retail',
    hotel: 'Hospitality',
    restaurant: 'Restaurant',
    salon: 'Salon',
  };

  const showPublicFeePortal = industryKey === 'education';
  const generalItems = [
    { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { label: "Payment Center", to: "/payment", icon: <PaymentIcon fontSize="small" /> },
    ...(showPublicFeePortal
      ? [{ label: "Public Fee Portal", to: "/pay-fees", icon: <AttachMoneyIcon fontSize="small" /> }]
      : []),
  ];

  const crmItems = user ? [
    { label: "Contact Management", to: "/crm/contacts", icon: <ContactsIcon fontSize="small" /> },
    { label: "Email Marketing", to: "/crm/email-marketing", icon: <EmailIcon fontSize="small" /> },
  ] : [];

  const adminItems = (user && hasPermission(user, PERMISSIONS.MANAGE_USERS)) ? [
    { label: "Admin Console", to: "/admin", icon: <AdminPanelSettingsIcon fontSize="small" /> },
    { label: "Public Settings", to: "/admin/public-settings", icon: <AdminPanelSettingsIcon fontSize="small" /> },
    { label: "Razorpay Settings", to: "/admin/razorpay-settings", icon: <PaymentIcon fontSize="small" /> },
  ] : [];

  const sections = [
    { title: "General", items: generalItems },
    activeModules.length ? { title: "Industry Modules", modules: activeModules } : null,
    crmItems.length ? { title: "CRM & Marketing", items: crmItems } : null,
    adminItems.length ? { title: "Admin & Settings", items: adminItems } : null,
  ].filter(Boolean);

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const normalizedTerm = searchTerm.toLowerCase();
    return sections.map((section) => {
      const matchedItems = (section.items || []).filter((item) =>
        item.label.toLowerCase().includes(normalizedTerm)
      );
      const matchedModules = (section.modules || [])
        .map((module) => ({
          ...module,
          items: module.items.filter((item) =>
            item.label.toLowerCase().includes(normalizedTerm)
          ),
        }))
        .filter((module) => module.items.length);
      if (matchedItems.length || matchedModules.length) {
        return {
          ...section,
          items: matchedItems,
          modules: matchedModules,
        };
      }
      return null;
    }).filter(Boolean);
  }, [sections, searchTerm]);

  useEffect(() => {
    let isMounted = true;
    if (industryKey !== 'education') {
      setEducationStats(DEFAULT_EDUCATION_STATS);
      return;
    }

    const fetchEducationStats = async () => {
      try {
        const { data } = await api.get('/education/analytics/');
        if (!isMounted) return;
        const students = Number(data.total_students) || 0;
        const attendanceRate = Number(data.attendance_percentage || data.attendance_rate || 0);
        const feesRemaining = Array.isArray(data.fees_remaining_by_class)
          ? data.fees_remaining_by_class.reduce((sum, row) => sum + (Number(row.total_due) || 0), 0)
          : 0;
        const classesWithDues = Array.isArray(data.fees_remaining_by_class)
          ? data.fees_remaining_by_class.reduce((sum, row) => sum + (Number(row.students_with_dues) || 0), 0)
          : 0;
        setEducationStats({
          totalStudents: students,
          attendanceRate,
          feesRemaining,
          classesWithDues,
        });
      } catch (err) {
        if (isMounted) {
          setEducationStats(DEFAULT_EDUCATION_STATS);
        }
      }
    };

    fetchEducationStats();
    return () => {
      isMounted = false;
    };
  }, [industryKey]);

  const getBadgeValue = (config) => {
    if (!config) return null;
    const rawValue = educationStats[config.statKey];
    if (rawValue === null || rawValue === undefined) return null;
    const formatted = config.format ? config.format(rawValue) : rawValue;
    if ((typeof formatted === 'number' && formatted <= 0) || formatted === 0) {
      return config.statKey === 'totalStudents' ? 0 : null;
    }
    return formatted;
  };

  const renderIconWithBadge = (item) => {
    const config = item.badgeKey ? badgeConfig[item.badgeKey] : null;
    const badgeValue = getBadgeValue(config);
    if (!config || badgeValue === null || badgeValue === undefined) return item.icon;
    return (
      <Badge badgeContent={badgeValue} color={config.color || 'primary'}>
        {item.icon}
      </Badge>
    );
  };

  const isRouteActive = (to) => {
    if (!to) return false;
    try {
      const url = new URL(to, window.location.origin);
      if (url.pathname !== location.pathname) {
        return false;
      }
      if (url.search) {
        return location.search === url.search;
      }
      return true;
    } catch {
      return location.pathname === to;
    }
  };

  const renderNavItem = (item, indent = false) => {
    const isActive = isRouteActive(item.to);
    return (
      <ListItem key={`${item.to}-${item.label}`} disablePadding>
        <ListItemButton
          component={NavLink}
          to={item.to}
          onClick={handleNavClick}
          selected={isActive}
          sx={{
            mx: 1,
            mb: 0.5,
            borderRadius: 1,
            pl: indent ? 4 : 2,
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
          {renderIconWithBadge(item)}
        </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.95rem',
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const handleModuleToggle = (moduleKey) => {
    setExpandedModule(prev => (prev === moduleKey ? null : moduleKey));
  };

  const renderModule = (module) => {
    const visibleItems = module.items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    });
    if (!visibleItems.length) return null;
    const isExpanded = expandedModule === module.key;
    return (
      <React.Fragment key={`module-${module.key}`}>
        <ListItem disablePadding>
          <Tooltip title={`Toggle ${module.label}`} placement="right">
            <ListItemButton
              onClick={() => handleModuleToggle(module.key)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                bgcolor: isExpanded ? 'primary.light' : 'transparent',
                color: isExpanded ? 'primary.contrastText' : 'text.primary',
                transition: 'background 0.25s ease',
                '&:hover': {
                  bgcolor: isExpanded ? 'primary.main' : 'action.hover',
                },
              }}
              selected={isExpanded}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {module.icon}
              </ListItemIcon>
              <ListItemText
                primary={module.label}
                primaryTypographyProps={{
                  fontWeight: isExpanded ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              />
              {isExpanded ? (
                <ExpandLess sx={{ transition: 'transform 0.2s ease' }} />
              ) : (
                <ExpandMore sx={{ transition: 'transform 0.2s ease' }} />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {visibleItems.map((item) => renderNavItem(item, true))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  const renderSection = (section) => {
    if (!section) return null;
    const hasItems = !!section.items?.length;
    const hasModules = !!section.modules?.length;
    if (!hasItems && !hasModules) return null;
    return (
      <React.Fragment key={`section-${section.title}`}>
        <ListSubheader
          sx={{
            px: 2,
            py: 1,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          {section.title}
        </ListSubheader>
        {hasItems && section.items.map((item) => renderNavItem(item))}
        {hasModules && section.modules.map((module) => renderModule(module))}
      </React.Fragment>
    );
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <img 
          src={process.env.PUBLIC_URL + '/_2173c7d8-8cb1-4996-b9b2-b289c17397fa.png'} 
          alt="Zenith ERP Logo" 
          style={{ height: 40, borderRadius: 8 }} 
        />
        <Typography variant="h6" fontWeight={700} color="primary">
          Zenith
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
      {industry && (
        <Box sx={{ px: 2, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Industry Focus
          </Typography>
          <Chip
            label={industryDisplayNames[industryKey] || industry}
            color="primary"
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}
      
      <Box sx={{ px: 2, pt: 2 }}>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search menu..."
          size="small"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <List sx={{ pt: user ? 1 : 2 }}>
        {/* Show public links when user is NOT logged in */}
        {!user && !industry && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={NavLink}
                to="/about"
                onClick={handleNavClick}
                selected={location.pathname === '/about'}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor: location.pathname === '/about' ? 'primary.main' : 'transparent',
                  color: location.pathname === '/about' ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: location.pathname === '/about' ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="About" 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === '/about' ? 600 : 400,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
            {isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton
                  component={NavLink}
                  to="/pricing"
                  onClick={handleNavClick}
                  selected={location.pathname === '/pricing'}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    bgcolor: location.pathname === '/pricing' ? 'primary.main' : 'transparent',
                    color: location.pathname === '/pricing' ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: location.pathname === '/pricing' ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <MonetizationOnIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Pricing" 
                    primaryTypographyProps={{ 
                      fontWeight: location.pathname === '/pricing' ? 600 : 400,
                      fontSize: '0.95rem'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton
                component={NavLink}
                to="/faq"
                onClick={handleNavClick}
                selected={location.pathname === '/faq'}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor: location.pathname === '/faq' ? 'primary.main' : 'transparent',
                  color: location.pathname === '/faq' ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: location.pathname === '/faq' ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <HelpOutlineIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="FAQ" 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === '/faq' ? 600 : 400,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={NavLink}
                to="/contact"
                onClick={handleNavClick}
                selected={location.pathname === '/contact'}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor: location.pathname === '/contact' ? 'primary.main' : 'transparent',
                  color: location.pathname === '/contact' ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: location.pathname === '/contact' ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <ContactMailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Contact" 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === '/contact' ? 600 : 400,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
        {/* Show dashboard/module links when user IS logged in */}
        {user && filteredSections.map((section) => renderSection(section))}
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

  const drawerWidth = 280;

  const shouldHideNavigation = hideNavigationPaths.some(path => location.pathname.startsWith(path)) || location.pathname === '/';

  if (shouldHideNavigation) {
    return null;
  }

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      {!isMobile && user && (
        <Drawer
          variant="persistent"
          open={desktopOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              position: 'fixed',
              top: 64, // Below AppBar
              height: 'calc(100vh - 64px)',
              overflowY: 'auto',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

    <AppBar 
        position={location.pathname === '/' ? "absolute" : "fixed"} 
      color="primary" 
      elevation={3}
      sx={{ 
        bgcolor: 'primary.main',
          zIndex: theme.zIndex.drawer + 1,
          ml: !isMobile && user && desktopOpen ? `${drawerWidth}px` : 0,
          width: !isMobile && user && desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          left: 0, // Ensure AppBar starts from left edge
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

        {/* Logo - Gradient Shine + Sparkle Animation */}
        <Box 
          component={NavLink}
          to="/"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: { xs: 1, md: 3 },
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              backgroundSize: '200% 100%',
              animation: 'gradientShine 3s ease-in-out infinite',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
              borderRadius: 1
            },
            '&:hover::before': {
              opacity: 1
            },
            '&:hover': { 
              opacity: 0.95,
              transform: 'translateY(-2px)',
              '& .logo-image': {
                transform: 'scale(1.05) rotate(2deg)',
                boxShadow: '0 4px 12px rgba(255,255,255,0.4)'
              },
              '& .logo-text': {
                transform: 'translateX(2px)',
                color: '#ffa726',
                '&::after': {
                  width: '100%'
                }
              },
              '& .sparkle': {
                opacity: 1,
                transform: 'scale(1)'
              }
            },
            '@keyframes gradientShine': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }}
        >
          {/* Sparkle Dots */}
          <Box
            className="sparkle"
            sx={{
              position: 'absolute',
              top: -5,
              right: -5,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
              opacity: 0,
              transform: 'scale(0)',
              transition: 'all 0.5s ease',
              animation: 'sparkleTwinkle 2s ease-in-out infinite',
              '@keyframes sparkleTwinkle': {
                '0%, 100%': { opacity: 0, transform: 'scale(0) rotate(0deg)' },
                '50%': { opacity: 1, transform: 'scale(1) rotate(180deg)' }
              }
            }}
          />
          <Box
            className="sparkle"
            sx={{
              position: 'absolute',
              bottom: -3,
              left: -3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,167,38,0.9) 0%, transparent 70%)',
              opacity: 0,
              transform: 'scale(0)',
              transition: 'all 0.5s ease 0.2s',
              animation: 'sparkleTwinkle 2.5s ease-in-out infinite 0.5s'
            }}
          />
          <Box
            className="sparkle"
            sx={{
              position: 'absolute',
              top: '50%',
              right: -8,
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(33,150,243,0.9) 0%, transparent 70%)',
              opacity: 0,
              transform: 'scale(0)',
              transition: 'all 0.5s ease 0.4s',
              animation: 'sparkleTwinkle 2.2s ease-in-out infinite 1s'
            }}
          />
          
          <img 
            className="logo-image"
            src={process.env.PUBLIC_URL + '/_2173c7d8-8cb1-4996-b9b2-b289c17397fa.png'} 
            alt="Zenith Logo" 
            style={{ 
              height: isMobile ? 35 : 42, 
              borderRadius: 8,
              marginRight: 8,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1
            }} 
          />
          {!isMobile && (
            <Typography 
              className="logo-text"
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                display: { xs: 'none', sm: 'block' },
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  width: 0,
                  height: 2,
                  bgcolor: '#ffa726',
                  transition: 'width 0.3s ease'
                }
              }}
            >
              Zenith
            </Typography>
          )}
        </Box>

        {/* Desktop Navigation Links - Animated - Only show for public pages */}
        {!isMobile && !user && !industry && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, ml: 2 }}>
            {/* Show public links when user is NOT logged in */}
            {(
              <>
                <Button
                  component={NavLink}
                  to="/about"
                  className="nav-link-animated"
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: location.pathname === '/about' ? 600 : 500,
                    bgcolor: location.pathname === '/about' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      width: 0,
                      height: 2,
                      bgcolor: 'white',
                      transition: 'all 0.3s ease',
                      transform: 'translateX(-50%)'
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      '&::before': {
                        width: '80%'
                      },
                      '& .nav-icon': {
                        transform: 'rotate(360deg) scale(1.2)'
                      }
                    },
                    '&.active::before': {
                      width: '80%'
                    }
                  }}
                >
                  <InfoIcon className="nav-icon" fontSize="small" sx={{ mr: 0.5, transition: 'transform 0.5s ease' }} />
                  About
                </Button>
                {isAuthenticated && (
                  <Button
                    component={NavLink}
                    to="/pricing"
                    className="nav-link-animated"
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: location.pathname === '/pricing' ? 600 : 500,
                      bgcolor: location.pathname === '/pricing' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        width: 0,
                        height: 2,
                        bgcolor: 'white',
                        transition: 'all 0.3s ease',
                        transform: 'translateX(-50%)'
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'translateY(-2px)',
                        '&::before': {
                          width: '80%'
                        },
                        '& .nav-icon': {
                          transform: 'scale(1.3)'
                        }
                      },
                      '&.active::before': {
                        width: '80%'
                      }
                    }}
                  >
                    <MonetizationOnIcon className="nav-icon" fontSize="small" sx={{ mr: 0.5, transition: 'transform 0.3s ease' }} />
                    Pricing
                  </Button>
                )}
                <Button
                  component={NavLink}
                  to="/faq"
                  className="nav-link-animated"
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: location.pathname === '/faq' ? 600 : 500,
                    bgcolor: location.pathname === '/faq' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      width: 0,
                      height: 2,
                      bgcolor: 'white',
                      transition: 'all 0.3s ease',
                      transform: 'translateX(-50%)'
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      '&::before': {
                        width: '80%'
                      },
                      '& .nav-icon': {
                        transform: 'rotate(-15deg) scale(1.2)'
                      }
                    },
                    '&.active::before': {
                      width: '80%'
                    }
                  }}
                >
                  <HelpOutlineIcon className="nav-icon" fontSize="small" sx={{ mr: 0.5, transition: 'transform 0.3s ease' }} />
                  FAQ
                </Button>
                <Button
                  component={NavLink}
                  to="/contact"
                  className="nav-link-animated"
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: location.pathname === '/contact' ? 600 : 500,
                    bgcolor: location.pathname === '/contact' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      width: 0,
                      height: 2,
                      bgcolor: 'white',
                      transition: 'all 0.3s ease',
                      transform: 'translateX(-50%)'
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      '&::before': {
                        width: '80%'
                      },
                      '& .nav-icon': {
                        transform: 'translateY(-2px) scale(1.2)'
                      }
                    },
                    '&.active::before': {
                      width: '80%'
                    }
                  }}
                >
                  <ContactMailIcon className="nav-icon" fontSize="small" sx={{ mr: 0.5, transition: 'transform 0.3s ease' }} />
                  Contact
                </Button>
              </>
            )}
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
                    {user.name || user.username || 'User'}
                  </Typography>
                  {user.email && (
                    <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }} noWrap>
                      {user.email}
                    </Typography>
                  )}
                  {!user.email && user.role && (
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
            {industry && (
              <NotificationBell 
                onClick={() => setNotificationCenterOpen(true)} 
              />
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

        {/* Desktop Sidebar Toggle Button */}
        {!isMobile && user && (
          <IconButton
            edge="end"
            color="inherit"
            aria-label="toggle sidebar"
            onClick={toggleSidebar}
            sx={{ ml: 2 }}
          >
            <MenuIcon />
          </IconButton>
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
            width: drawerWidth,
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

      {/* Notification Center */}
      {industry && (
        <NotificationCenter
          open={notificationCenterOpen}
          onClose={() => setNotificationCenterOpen(false)}
        />
      )}
    </AppBar>
    </>
  );
};

export default Navigation; 