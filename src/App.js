import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, useTheme, useMediaQuery, CircularProgress, Typography } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Navigation from "./components/Navigation";
import { PublicERP, PublicCRM, PublicApp, PublicWeb, PublicConsult, PublicWhiteLabel } from './pages/PublicPages';

// HomePage is lazy loaded below
import About from './pages/About';
import Careers from './pages/Careers';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import ServiceDeliveryPolicy from './pages/ServiceDeliveryPolicy';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import Pricing from "./pages/Pricing";
import TawkToChat from "./components/TawkToChat";
import RegistrationForm from "./components/RegistrationForm";
import EmailVerification from "./pages/EmailVerification";
import theme from './theme/theme';
import adminTheme from './theme/adminTheme';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import AuthCheck from './components/AuthCheck';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Error404 from './pages/Error404';
import Error500 from './pages/Error500';
import Error403 from './pages/Error403';
import NetworkError from './pages/NetworkError';
import Maintenance from './pages/Maintenance';
import ErrorGeneric from './pages/ErrorGeneric';
import ErrorBoundary from './ErrorBoundary';
import PublicFeePayment from './pages/PublicFeePayment';

// Lazy load authenticated modules
const HomePage = lazy(() => import("./pages/HomePage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminEnhanced = lazy(() => import("./pages/AdminEnhanced"));
const AdminPublicSettings = lazy(() => import("./pages/AdminPublicSettings"));
const RazorpaySettings = lazy(() => import("./pages/RazorpaySettings"));
const Payment = lazy(() => import("./pages/Payment"));
const Education = lazy(() => import('./pages/Education'));
const TimetableManagement = lazy(() => import('./pages/Education/TimetableManagement'));
const AdvancedReporting = lazy(() => import('./pages/Education/AdvancedReporting'));
const ExamManagement = lazy(() => import('./pages/Education/ExamManagement'));
const PharmacyDashboard = lazy(() => import('./pages/Pharmacy/PharmacyDashboard'));
const RetailDashboard = lazy(() => import('./pages/Retail/RetailDashboard'));
const HotelDashboard = lazy(() => import('./pages/Hotel/HotelDashboard'));
const RestaurantDashboard = lazy(() => import('./pages/Restaurant/RestaurantDashboard'));
const SalonDashboard = lazy(() => import('./pages/Salon/SalonDashboard'));
const SalonCRM = lazy(() => import('./pages/Salon/SalonCRM'));
const SalonBilling = lazy(() => import('./pages/Salon/SalonBilling'));
const AddonStore = lazy(() => import('./pages/Billing/AddonStore'));
const Integrations = lazy(() => import('./pages/Settings/Integrations'));
const SettingsHub = lazy(() => import('./pages/Settings/Settings'));
const AdminUserManagement = lazy(() => import('./components/AdminUserManagement'));
const ContactManagement = lazy(() => import('./pages/CRM/ContactManagement'));
const EmailMarketing = lazy(() => import('./pages/CRM/EmailMarketing'));
const OmnichannelInbox = lazy(() => import('./pages/CRM/OmnichannelInbox'));
const DealsPipeline = lazy(() => import('./pages/CRM/DealsPipeline'));
const TeamChat = lazy(() => import('./pages/CRM/TeamChat'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <CircularProgress size={60} thickness={4} />
    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Loading ZenVerse Workspace...</Typography>
  </Box>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('user'));
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('userChanged', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('userChanged', checkAuth);
    };
  }, []);

  return (
    <ThemeContextProvider>
      {(currentTheme) => (
    <HelmetProvider>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <SidebarProvider>
          <Router>
            <ErrorBoundary>
              <Navigation />
              <MainContent>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/refund" element={<RefundPolicy />} />
                    <Route path="/delivery" element={<ServiceDeliveryPolicy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/dashboard" element={<AuthCheck><Dashboard /></AuthCheck>} />
                    <Route path="/education" element={<AuthCheck><Education /></AuthCheck>} />
                    <Route path="/education/timetable" element={<AuthCheck><TimetableManagement /></AuthCheck>} />
                    <Route path="/education/reports" element={<AuthCheck><AdvancedReporting /></AuthCheck>} />
                    <Route path="/education/exams" element={<AuthCheck><ExamManagement /></AuthCheck>} />
                    <Route path="/pharmacy" element={<AuthCheck><PharmacyDashboard /></AuthCheck>} />
                    <Route path="/retail" element={<AuthCheck><RetailDashboard /></AuthCheck>} />
                    <Route path="/hotel" element={<AuthCheck><HotelDashboard /></AuthCheck>} />
                    <Route path="/restaurant" element={<AuthCheck><RestaurantDashboard /></AuthCheck>} />
                    <Route path="/salon" element={<AuthCheck><SalonDashboard /></AuthCheck>} />
                    <Route path="/salon/crm" element={<AuthCheck><SalonCRM /></AuthCheck>} />
                    <Route path="/salon/billing" element={<AuthCheck><SalonBilling /></AuthCheck>} />
                    <Route path="/crm/contacts" element={<AuthCheck><ContactManagement /></AuthCheck>} />
                    <Route path="/crm/email-marketing" element={<AuthCheck><EmailMarketing /></AuthCheck>} />
                    <Route path="/crm/inbox" element={<AuthCheck><OmnichannelInbox /></AuthCheck>} />
                    <Route path="/team-chat" element={<AuthCheck><TeamChat /></AuthCheck>} />
                    <Route path="/crm/deals" element={<AuthCheck><DealsPipeline /></AuthCheck>} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register/google" element={<RegistrationForm googleUser={JSON.parse(localStorage.getItem('googleUser') || '{}')} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                    <Route path="/admin" element={<ProtectedAdminRoute><AdminEnhanced /></ProtectedAdminRoute>} />
                    <Route path="/admin/public-settings" element={<ProtectedAdminRoute><AdminPublicSettings /></ProtectedAdminRoute>} />
                    <Route path="/admin/razorpay-settings" element={<ProtectedAdminRoute><RazorpaySettings /></ProtectedAdminRoute>} />
                    <Route path="/payment" element={<AuthCheck><Payment /></AuthCheck>} />
                    <Route path="/settings" element={<AuthCheck><SettingsHub /></AuthCheck>} />
                    <Route path="/settings/billing" element={<AuthCheck><AddonStore /></AuthCheck>} />
                    <Route path="/settings/integrations" element={<AuthCheck><Integrations /></AuthCheck>} />
                    <Route path="/settings/users" element={<AuthCheck><AdminUserManagement /></AuthCheck>} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/erp" element={<PublicERP />} />
                    <Route path="/crm" element={<PublicCRM />} />
                    <Route path="/zen-app" element={<PublicApp />} />
                    <Route path="/zen-web" element={<PublicWeb />} />
                    <Route path="/zen-consult" element={<PublicConsult />} />
                    <Route path="/white-label" element={<PublicWhiteLabel />} />
                    <Route path="/verify-email" element={<EmailVerification />} />
                    <Route path="/pay-fees" element={<PublicFeePayment />} />
                    
                    {/* Error Pages */}
                    <Route path="/error/500" element={<Error500 />} />
                    <Route path="/error/403" element={<Error403 />} />
                    <Route path="/error/network" element={<NetworkError />} />
                    <Route path="/error/:statusCode" element={<ErrorGeneric />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    
                    {/* Catch-all 404 route - must be last */}
                    <Route path="*" element={<Error404 />} />
                  </Routes>
                </Suspense>
              </MainContent>
              <AppContent isAuthenticated={isAuthenticated} />
              <TawkToChat />
            </ErrorBoundary>
          </Router>
        </SidebarProvider>
      </ThemeProvider>
    </HelmetProvider>
      )}
    </ThemeContextProvider>
  );
}

function MainContent({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isOpen: sidebarOpen } = useSidebar();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const drawerWidth = 280;

  useEffect(() => {
    const handleUserUpdate = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem('user') || 'null');
        setCurrentUser(parsed);
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('userChanged', handleUserUpdate);
    return () => {
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('userChanged', handleUserUpdate);
    };
  }, []);

  // Check if sidebar should be visible (user logged in, not mobile, and sidebar is open)
  const showSidebar = !isMobile && currentUser && sidebarOpen;
  
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        mt: '64px', // AppBar height
        ml: showSidebar ? `${drawerWidth}px` : 0,
        width: showSidebar ? `calc(100% - ${drawerWidth}px)` : '100%',
        minHeight: 'calc(100vh - 64px)',
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {children}
    </Box>
  );
}

function AppContent({ isAuthenticated }) {
  const location = useLocation();

  // Define routes where footer should be hidden (authenticated / app routes)
  const authenticatedRoutes = [
    '/dashboard', '/education', '/pharmacy', '/retail',
    '/hotel', '/restaurant', '/salon', '/payment', '/admin',
    '/crm', '/settings', '/error'
  ];
  
  const shouldShowFooter = !isAuthenticated && !authenticatedRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return shouldShowFooter ? <Footer /> : null;
}

export default App;
