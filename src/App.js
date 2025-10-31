import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, UNSAFE_future } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navigation from "./components/Navigation";
import AdminEnhanced from "./pages/AdminEnhanced";
import AdminPublicSettings from "./pages/AdminPublicSettings";
import HomePage from './pages/HomePage';
import About from './pages/About';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import Payment from "./pages/Payment";
import Pricing from "./pages/Pricing";
import TawkToChat from "./components/TawkToChat";
import RegistrationForm from "./components/RegistrationForm";
import EmailVerification from "./pages/EmailVerification";
import theme from './theme/theme';
import adminTheme from './theme/adminTheme';
import Education from './pages/Education';
import PharmacyDashboard from './pages/Pharmacy/PharmacyDashboard';
import RetailDashboard from './pages/Retail/RetailDashboard';
import EducationDashboard from './pages/Education/EducationDashboard';
import HotelDashboard from './pages/Hotel/HotelDashboard';
import RestaurantDashboard from './pages/Restaurant/RestaurantDashboard';
import SalonDashboard from './pages/Salon/SalonDashboard';
import AuthCheck from './components/AuthCheck';
// Removed AlwaysVisibleFileInput from global layout to prevent stray file input

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    // Listen for changes to localStorage (login/logout)
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('user'));
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Function to switch theme based on route
  const switchTheme = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {/* File input removed from global layout */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<AuthCheck><Dashboard /></AuthCheck>} />
          <Route path="/education" element={<AuthCheck><Education /></AuthCheck>} />
          <Route path="/pharmacy" element={<AuthCheck><PharmacyDashboard /></AuthCheck>} />
          <Route path="/retail" element={<AuthCheck><RetailDashboard /></AuthCheck>} />
          <Route path="/hotel" element={<AuthCheck><HotelDashboard /></AuthCheck>} />
          <Route path="/restaurant" element={<AuthCheck><RestaurantDashboard /></AuthCheck>} />
          <Route path="/salon" element={<AuthCheck><SalonDashboard /></AuthCheck>} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/google" element={<RegistrationForm googleUser={JSON.parse(localStorage.getItem('googleUser') || '{}')} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminEnhanced />} />
          <Route path="/admin/public-settings" element={<AuthCheck><AdminPublicSettings /></AuthCheck>} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          
          {/* Removed test routes for deleted files */}
        </Routes>
        {!isAuthenticated && <Footer />}
        <TawkToChat />
      </Router>
    </ThemeProvider>
  );
}

export default App;
