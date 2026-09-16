
import axios from "axios";

// Auto-detect local development vs production
const getApiUrl = () => {
  // If REACT_APP_API_URL is set, use it (ensure it's HTTPS in production)
  if (process.env.REACT_APP_API_URL) {
    let url = process.env.REACT_APP_API_URL;
    // Force HTTPS for production (not localhost)
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
    return url;
  }
  
  // Auto-detect: if running on localhost, use HTTP; otherwise use HTTPS
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return "http://localhost:8000/api";  // Local development - use HTTP
  }
  
  // Production - ALWAYS use HTTPS (match frontend protocol)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return "https://erp-backend-av9v.onrender.com/api";
  }
  
  // Fallback to HTTPS for production
  return "https://erp-backend-av9v.onrender.com/api";
};

const api = axios.create({
  baseURL: getApiUrl(),
});

// Token storage helpers
const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");
const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};
const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// Attach access token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize DRF list responses (supports paginated and non-paginated)
export const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

// The backend has ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION enabled
// (see erp/settings.py SIMPLE_JWT), so every refresh call both issues a new
// refresh token AND blacklists the one that was used. Two consequences:
//  1. The rotated `refresh` from the response must be stored, or the next
//     refresh attempt sends an already-blacklisted token and force-logs the
//     user out (capping every session at one access-token lifetime instead
//     of the intended 7 days).
//  2. Concurrent 401s must share a single in-flight refresh call, or the
//     second one reuses a token the first already rotated/blacklisted.
let refreshPromise = null;
const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${getApiUrl()}/token/refresh/`, { refresh: getRefreshToken() })
      .then((res) => {
        setTokens(res.data.access, res.data.refresh || getRefreshToken());
        return res.data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Handle token refresh on 401 and feature permission errors on 403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token refresh or logout
    if (error.response && error.response.status === 401) {
      // If no refresh token, immediately logout
      if (!getRefreshToken()) {
        clearTokens();
        localStorage.removeItem('user');
        // Show message if possible
        if (window.location.pathname !== '/login') {
          sessionStorage.setItem('logoutReason', 'Your session has expired. Please login again.');
        }
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Try to refresh token if we haven't already retried
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Use axios directly (not api instance) to avoid interceptor loop.
          // Shared via refreshAccessToken() so simultaneous 401s (common on
          // dashboard mount with parallel requests) don't each rotate/burn
          // a fresh refresh token out from under one another.
          const newAccessToken = await refreshAccessToken();

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or invalid - logout immediately
          clearTokens();
          localStorage.removeItem('user');
          // Show message if possible
          if (window.location.pathname !== '/login') {
            sessionStorage.setItem('logoutReason', 'Your session has expired due to inactivity. Please login again.');
          }
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // Already retried, token refresh failed - logout
        clearTokens();
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          sessionStorage.setItem('logoutReason', 'Your session has expired. Please login again.');
        }
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    
    // Handle 403 Forbidden - Feature permission denied
    if (error.response && error.response.status === 403) {
      const errorDetail = error.response.data?.detail || error.response.data?.error || 'Access denied';
      
      // Check if this is a feature permission error (contains "module is not available" or "plan")
      if (errorDetail.includes('module is not available') || errorDetail.includes('plan')) {
        // Store error in error object for components to access
        error.isFeaturePermissionError = true;
        error.featureErrorMessage = errorDetail;
      }
    }
    
    return Promise.reject(error);
  }
);

// Safely read the cached user profile from localStorage. A bare
// `JSON.parse(localStorage.getItem('user'))` throws on a missing/corrupted
// value (e.g. the literal string "undefined") and crashes whatever
// component render called it - this never throws.
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
};

// Auth helpers
export const login = async (username, password) => {
  const res = await api.post("/login/", { username, password });
  setTokens(res.data.access, res.data.refresh);
  return res;
};

export const register = async (data) => {
  try {
    const res = await api.post("/register/", data);
    // Set tokens if provided (for immediate login)
    if (res.data && res.data.access && res.data.refresh) {
      setTokens(res.data.access, res.data.refresh);
    }
    return res;
  } catch (error) {
    // Ensure error is properly propagated
    throw error;
  }
};

export const logout = () => {
  clearTokens();
  window.location.href = "/login";
};

// Email verification helpers
export const verifyEmail = async (token) => {
  const res = await api.post('/verify-email/', { token });
  if (res.data.access && res.data.refresh) {
    setTokens(res.data.access, res.data.refresh);
  }
  return res;
};

export const resendVerification = async (email) => {
  return await api.post('/resend-verification/', { email });
};

export const fetchClasses = async () => unwrapList((await api.get('/education/classes/')).data);
export const fetchAcademicYears = async () => unwrapList((await api.get('/education/academic-years/')).data);
export const fetchTerms = async (academicYearId = null) => {
  const params = academicYearId ? { academic_year: academicYearId } : {};
  return unwrapList((await api.get('/education/terms/', { params })).data);
};
export const fetchSubjects = async () => unwrapList((await api.get('/education/subjects/')).data);
export const fetchEducationStaff = async () => unwrapList((await api.get('/education/staff/')).data);

// Timetable Management APIs
export const fetchPeriods = async () => unwrapList((await api.get('/education/timetable/periods/')).data);
export const createPeriod = async (data) => (await api.post('/education/timetable/periods/', data)).data;
export const updatePeriod = async (id, data) => (await api.put(`/education/timetable/periods/${id}/`, data)).data;
export const deletePeriod = async (id) => (await api.delete(`/education/timetable/periods/${id}/`)).data;

export const fetchRooms = async () => unwrapList((await api.get('/education/timetable/rooms/')).data);
export const createRoom = async (data) => (await api.post('/education/timetable/rooms/', data)).data;
export const updateRoom = async (id, data) => (await api.put(`/education/timetable/rooms/${id}/`, data)).data;
export const deleteRoom = async (id) => (await api.delete(`/education/timetable/rooms/${id}/`)).data;

export const fetchTimetable = async (params = {}) => unwrapList((await api.get('/education/timetable/', { params })).data);
export const createTimetable = async (data) => (await api.post('/education/timetable/', data)).data;
export const updateTimetable = async (id, data) => (await api.put(`/education/timetable/${id}/`, data)).data;
export const deleteTimetable = async (id) => (await api.delete(`/education/timetable/${id}/`)).data;
export const fetchTimetableByClass = async (classId, academicYearId) => (await api.get(`/education/timetable/class/${classId}/?academic_year=${academicYearId}`)).data;

export const fetchHolidays = async (academicYearId = null) => {
  const params = academicYearId ? { academic_year: academicYearId } : {};
  return unwrapList((await api.get('/education/timetable/holidays/', { params })).data);
};
export const createHoliday = async (data) => (await api.post('/education/timetable/holidays/', data)).data;
export const updateHoliday = async (id, data) => (await api.put(`/education/timetable/holidays/${id}/`, data)).data;
export const deleteHoliday = async (id) => (await api.delete(`/education/timetable/holidays/${id}/`)).data;

export const fetchSubstitutes = async (params = {}) => unwrapList((await api.get('/education/timetable/substitutes/', { params })).data);
export const createSubstitute = async (data) => (await api.post('/education/timetable/substitutes/', data)).data;
export const updateSubstitute = async (id, data) => (await api.put(`/education/timetable/substitutes/${id}/`, data)).data;
export const deleteSubstitute = async (id) => (await api.delete(`/education/timetable/substitutes/${id}/`)).data;

// Advanced Timetable APIs - Availability & Suggestions
export const fetchAvailableTeachers = async (academicYearId, day, periodId, classId = null) => {
  const params = { academic_year: academicYearId, day, period: periodId };
  if (classId) params.class = classId;
  return (await api.get('/education/timetable/available-teachers/', { params })).data;
};

export const fetchAvailableRooms = async (academicYearId, day, periodId, roomType = null) => {
  const params = { academic_year: academicYearId, day, period: periodId };
  if (roomType) params.room_type = roomType;
  return (await api.get('/education/timetable/available-rooms/', { params })).data;
};

export const fetchTimetableSuggestions = async (academicYearId, classId, day, periodId, subjectId = null) => {
  const params = { academic_year: academicYearId, class: classId, day, period: periodId };
  if (subjectId) params.subject = subjectId;
  return (await api.get('/education/timetable/suggestions/', { params })).data;
};

// Advanced Reporting APIs
export const fetchReportFields = async () => unwrapList((await api.get('/education/reports/fields/')).data);
export const createReportField = async (data) => (await api.post('/education/reports/fields/', data)).data;
export const updateReportField = async (id, data) => (await api.put(`/education/reports/fields/${id}/`, data)).data;
export const deleteReportField = async (id) => (await api.delete(`/education/reports/fields/${id}/`)).data;

export const fetchReportTemplates = async () => unwrapList((await api.get('/education/reports/templates/')).data);
export const createReportTemplate = async (data) => (await api.post('/education/reports/templates/', data)).data;
export const updateReportTemplate = async (id, data) => (await api.put(`/education/reports/templates/${id}/`, data)).data;
export const deleteReportTemplate = async (id) => (await api.delete(`/education/reports/templates/${id}/`)).data;

export const buildCustomReport = async (data) => (await api.post('/education/reports/build/', data)).data;
export const getComparativeAnalysis = async (data) => (await api.post('/education/reports/compare/', data)).data;

// Exam Management APIs
export const fetchExams = async () => unwrapList((await api.get('/education/exams/')).data);
export const createExam = async (data) => (await api.post('/education/exams/', data)).data;
export const updateExam = async (id, data) => (await api.put(`/education/exams/${id}/`, data)).data;
export const deleteExam = async (id) => (await api.delete(`/education/exams/${id}/`)).data;

export const fetchExamSchedules = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return unwrapList((await api.get(`/education/exam-schedules/${queryParams ? '?' + queryParams : ''}`)).data);
};
export const createExamSchedule = async (data) => (await api.post('/education/exam-schedules/', data)).data;
export const updateExamSchedule = async (id, data) => (await api.put(`/education/exam-schedules/${id}/`, data)).data;
export const deleteExamSchedule = async (id) => (await api.delete(`/education/exam-schedules/${id}/`)).data;

export const fetchSeatingArrangements = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return unwrapList((await api.get(`/education/seating-arrangements/${queryParams ? '?' + queryParams : ''}`)).data);
};
export const createSeatingArrangement = async (data) => (await api.post('/education/seating-arrangements/', data)).data;
export const updateSeatingArrangement = async (id, data) => (await api.put(`/education/seating-arrangements/${id}/`, data)).data;
export const deleteSeatingArrangement = async (id) => (await api.delete(`/education/seating-arrangements/${id}/`)).data;

export const fetchHallTickets = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return unwrapList((await api.get(`/education/hall-tickets/${queryParams ? '?' + queryParams : ''}`)).data);
};
export const createHallTicket = async (data) => (await api.post('/education/hall-tickets/', data)).data;
export const updateHallTicket = async (id, data) => (await api.put(`/education/hall-tickets/${id}/`, data)).data;
export const generateHallTickets = async (data) => (await api.post('/education/hall-tickets/generate/', data)).data;

export const fetchClassAttendanceStatus = async (classId, date) => {
  const res = await api.get(`/education/class-attendance-status/?class_id=${classId}&date=${date}`);
  return res.data;
};

// Transfer Certificate (TC) APIs
export const fetchTransferCertificates = async (params = {}) => unwrapList((await api.get('/education/tc/', { params })).data);
export const createTransferCertificate = async (payload) => (await api.post('/education/tc/', payload)).data;
export const updateTransferCertificate = async (id, payload) => (await api.patch(`/education/tc/${id}/`, payload)).data;
export const deleteTransferCertificate = async (id) => (await api.delete(`/education/tc/${id}/`)).data;
export const getTransferCertificatePDF = async (id) => {
  const response = await api.get(`/education/tc/${id}/pdf/`, { responseType: 'blob' });
  // Create blob URL from blob data
  const blob = new Blob([response.data], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};
export const fetchCRMStudentContacts = async () => (await api.get('/crm/education-students/')).data;

// Plans
export const fetchPlans = async () => (await api.get('/plans/')).data;
export const changePlan = async (planKey) => (await api.post('/plans/change/', { plan: planKey })).data;

// User profile
export const fetchUserMe = async () => (await api.get('/users/me/')).data;

// Tenant public settings (admin)
export const getTenantPublicSettings = async () => (await api.get('/admin/tenant-public-settings/')).data;
export const updateTenantPublicSettings = async (payload) => (await api.post('/admin/tenant-public-settings/', payload)).data;

export default api;

// Hotel APIs
export const fetchHotelRoomTypes = async () => unwrapList((await api.get('/hotel/room-types/')).data);
export const createHotelRoomType = async (payload) => (await api.post('/hotel/room-types/', payload)).data;
export const updateHotelRoomType = async (id, payload) => (await api.patch(`/hotel/room-types/${id}/`, payload)).data;
export const deleteHotelRoomType = async (id) => (await api.delete(`/hotel/room-types/${id}/`)).data;
export const fetchHotelRooms = async () => unwrapList((await api.get('/hotel/rooms/')).data);
export const createHotelRoom = async (payload) => (await api.post('/hotel/rooms/', payload)).data;
export const updateHotelRoom = async (id, payload) => (await api.patch(`/hotel/rooms/${id}/`, payload)).data;
export const deleteHotelRoom = async (id) => (await api.delete(`/hotel/rooms/${id}/`)).data;
export const fetchHotelGuests = async () => unwrapList((await api.get('/hotel/guests/')).data);
export const createHotelGuest = async (payload) => (await api.post('/hotel/guests/', payload)).data;
export const updateHotelGuest = async (id, payload) => (await api.patch(`/hotel/guests/${id}/`, payload)).data;
export const deleteHotelGuest = async (id) => (await api.delete(`/hotel/guests/${id}/`)).data;
export const fetchHotelBookings = async (params = {}) => unwrapList((await api.get('/hotel/bookings/', { params })).data);
export const createHotelBooking = async (payload) => (await api.post('/hotel/bookings/', payload)).data;
export const updateHotelBooking = async (id, payload) => (await api.patch(`/hotel/bookings/${id}/`, payload)).data;
export const deleteHotelBooking = async (id) => (await api.delete(`/hotel/bookings/${id}/`)).data;
export const checkInHotelBooking = async (id) => (await api.post(`/hotel/bookings/${id}/check-in/`)).data;
export const checkOutHotelBooking = async (id) => (await api.post(`/hotel/bookings/${id}/check-out/`)).data;
export const fetchHotelAnalytics = async () => (await api.get('/hotel/analytics/')).data;

// Restaurant APIs
export const fetchRestaurantCategories = async () => unwrapList((await api.get('/restaurant/menu-categories/')).data);
export const createRestaurantCategory = async (payload) => (await api.post('/restaurant/menu-categories/', payload)).data;
export const updateRestaurantCategory = async (id, payload) => (await api.patch(`/restaurant/menu-categories/${id}/`, payload)).data;
export const deleteRestaurantCategory = async (id) => (await api.delete(`/restaurant/menu-categories/${id}/`)).data;
export const fetchRestaurantItems = async () => unwrapList((await api.get('/restaurant/menu-items/')).data);
export const createRestaurantItem = async (payload) => (await api.post('/restaurant/menu-items/', payload)).data;
export const updateRestaurantItem = async (id, payload) => (await api.patch(`/restaurant/menu-items/${id}/`, payload)).data;
export const deleteRestaurantItem = async (id) => (await api.delete(`/restaurant/menu-items/${id}/`)).data;
export const fetchRestaurantTables = async () => unwrapList((await api.get('/restaurant/tables/')).data);
export const createRestaurantTable = async (payload) => (await api.post('/restaurant/tables/', payload)).data;
export const updateRestaurantTable = async (id, payload) => (await api.patch(`/restaurant/tables/${id}/`, payload)).data;
export const deleteRestaurantTable = async (id) => (await api.delete(`/restaurant/tables/${id}/`)).data;
export const fetchRestaurantOrders = async (params = {}) => unwrapList((await api.get('/restaurant/orders/', { params })).data);
export const createRestaurantOrder = async (payload) => (await api.post('/restaurant/orders/', payload)).data;
export const updateRestaurantOrder = async (id, payload) => (await api.patch(`/restaurant/orders/${id}/`, payload)).data;
export const deleteRestaurantOrder = async (id) => (await api.delete(`/restaurant/orders/${id}/`)).data;
export const serveRestaurantOrder = async (id) => (await api.post(`/restaurant/orders/${id}/serve/`)).data;
export const markPaidRestaurantOrder = async (id) => (await api.post(`/restaurant/orders/${id}/mark-paid/`)).data;
export const fetchRestaurantAnalytics = async () => (await api.get('/restaurant/analytics/')).data;
export const fetchSalonAnalytics = async () => (await api.get('/salon/analytics/')).data;
export const fetchRestaurantOrderItems = async () => unwrapList((await api.get('/restaurant/order-items/')).data);
export const createRestaurantOrderItem = async (payload) => (await api.post('/restaurant/order-items/', payload)).data;
export const updateRestaurantOrderItem = async (id, payload) => (await api.patch(`/restaurant/order-items/${id}/`, payload)).data;
export const deleteRestaurantOrderItem = async (id) => (await api.delete(`/restaurant/order-items/${id}/`)).data;

// Salon APIs
export const fetchSalonServiceCategories = async () => unwrapList((await api.get('/salon/service-categories/')).data);
export const createSalonServiceCategory = async (payload) => (await api.post('/salon/service-categories/', payload)).data;
export const updateSalonServiceCategory = async (id, payload) => (await api.patch(`/salon/service-categories/${id}/`, payload)).data;
export const deleteSalonServiceCategory = async (id) => (await api.delete(`/salon/service-categories/${id}/`)).data;
export const fetchSalonServices = async () => unwrapList((await api.get('/salon/services/')).data);
export const createSalonService = async (payload) => (await api.post('/salon/services/', payload)).data;
export const updateSalonService = async (id, payload) => (await api.patch(`/salon/services/${id}/`, payload)).data;
export const deleteSalonService = async (id) => (await api.delete(`/salon/services/${id}/`)).data;
export const fetchSalonStylists = async () => unwrapList((await api.get('/salon/stylists/')).data);
export const createSalonStylist = async (payload) => (await api.post('/salon/stylists/', payload)).data;
export const updateSalonStylist = async (id, payload) => (await api.patch(`/salon/stylists/${id}/`, payload)).data;
export const deleteSalonStylist = async (id) => (await api.delete(`/salon/stylists/${id}/`)).data;
export const fetchSalonAppointments = async (params = {}) => unwrapList((await api.get('/salon/appointments/', { params })).data);
export const createSalonAppointment = async (payload) => (await api.post('/salon/appointments/', payload)).data;
export const checkInSalonAppointment = async (id) => (await api.post(`/salon/appointments/${id}/check-in/`)).data;
export const completeSalonAppointment = async (id) => (await api.post(`/salon/appointments/${id}/complete/`)).data;
export const cancelSalonAppointment = async (id) => (await api.post(`/salon/appointments/${id}/cancel/`)).data;
export const updateSalonAppointment = async (id, payload) => (await api.patch(`/salon/appointments/${id}/`, payload)).data;
export const deleteSalonAppointment = async (id) => (await api.delete(`/salon/appointments/${id}/`)).data;

// Retail APIs
export const fetchRetailProducts = async (params = {}) => unwrapList((await api.get('/retail/products/', { params })).data);
export const createRetailProduct = async (payload) => (await api.post('/retail/products/', payload)).data;
export const updateRetailProduct = async (id, payload) => (await api.patch(`/retail/products/${id}/`, payload)).data;
export const deleteRetailProduct = async (id) => (await api.delete(`/retail/products/${id}/`)).data;
export const fetchRetailProductCategories = async () => unwrapList((await api.get('/retail/categories/')).data);
export const createRetailProductCategory = async (payload) => (await api.post('/retail/categories/', payload)).data;
export const updateRetailProductCategory = async (id, payload) => (await api.patch(`/retail/categories/${id}/`, payload)).data;
export const deleteRetailProductCategory = async (id) => (await api.delete(`/retail/categories/${id}/`)).data;
export const fetchRetailCustomers = async () => unwrapList((await api.get('/retail/customers/')).data);
export const createRetailCustomer = async (payload) => (await api.post('/retail/customers/', payload)).data;
export const updateRetailCustomer = async (id, payload) => (await api.patch(`/retail/customers/${id}/`, payload)).data;
export const deleteRetailCustomer = async (id) => (await api.delete(`/retail/customers/${id}/`)).data;
export const fetchRetailSales = async (params = {}) => unwrapList((await api.get('/retail/sales/', { params })).data);
export const createRetailSale = async (payload) => (await api.post('/retail/sales/', payload)).data;
export const updateRetailSale = async (id, payload) => (await api.patch(`/retail/sales/${id}/`, payload)).data;
export const deleteRetailSale = async (id) => (await api.delete(`/retail/sales/${id}/`)).data;
export const fetchRetailInventory = async (params = {}) => unwrapList((await api.get('/retail/inventory/', { params })).data);
export const updateRetailInventory = async (id, payload) => (await api.patch(`/retail/inventory/${id}/`, payload)).data;
export const fetchRetailWarehouses = async () => unwrapList((await api.get('/retail/warehouses/')).data);
export const createRetailWarehouse = async (payload) => (await api.post('/retail/warehouses/', payload)).data;
export const updateRetailWarehouse = async (id, payload) => (await api.patch(`/retail/warehouses/${id}/`, payload)).data;
export const deleteRetailWarehouse = async (id) => (await api.delete(`/retail/warehouses/${id}/`)).data;
export const fetchRetailSuppliers = async () => unwrapList((await api.get('/retail/suppliers/')).data);
export const createRetailSupplier = async (payload) => (await api.post('/retail/suppliers/', payload)).data;
export const updateRetailSupplier = async (id, payload) => (await api.patch(`/retail/suppliers/${id}/`, payload)).data;
export const deleteRetailSupplier = async (id) => (await api.delete(`/retail/suppliers/${id}/`)).data;
export const fetchRetailStaffAttendance = async () => unwrapList((await api.get('/retail/staff-attendance/')).data);
export const checkInRetailStaff = async () => (await api.post('/retail/staff-attendance/check-in/')).data;
export const checkOutRetailStaff = async () => (await api.post('/retail/staff-attendance/check-out/')).data;

// Integrations - WhatsApp
export const sendWhatsAppMessage = async (to, message) => (await api.post('/integrations/whatsapp/send/', { to, message })).data;

// Custom Service Request APIs
export const submitCustomServiceRequest = async (data) => 
  (await api.post('/custom-service-requests/', data)).data;

export const getCustomServiceRequests = async () => 
  (await api.get('/custom-service-requests/list/')).data;

export const getCustomServiceRequest = async (id) => 
  (await api.get(`/custom-service-requests/${id}/`)).data;

export const updateCustomServiceRequest = async (id, data) => 
  (await api.patch(`/custom-service-requests/${id}/`, data)).data;

// Alert Management APIs
export const fetchAlerts = async (params = {}) => {
  const response = await api.get('/alerts/list/', { params });
  return response.data;
};

export const createAlert = async (payload) => (await api.post('/alerts/create/', payload)).data;

export const deleteAlert = async (alertId) => (await api.delete(`/alerts/${alertId}/delete/`)).data;

export const markAlertRead = async (alertId, read = true) => (await api.post('/alerts/mark-read/', { alert_id: alertId, read })).data;

export const bulkMarkAlertsRead = async (alertIds, read = true) => (await api.post('/alerts/bulk-mark-read/', { alert_ids: alertIds, read })).data;

export const bulkDeleteAlerts = async (alertIds) => (await api.post('/alerts/bulk-delete/', { alert_ids: alertIds })).data;

export const fetchAlertStats = async () => (await api.get('/alerts/stats/')).data;

export const triggerAutoAlerts = async () => (await api.post('/alerts/auto-create/')).data;

export const cleanupOldAlerts = async (daysOld = 30) => (await api.post('/alerts/cleanup/', { days_old: daysOld })).data;

// Notification Management APIs
export const fetchNotifications = async (params = {}, signal = null) => {
  const config = { params };
  if (signal) {
    config.signal = signal;
  }
  const response = await api.get('/notifications/', config);
  return response.data;
};

export const getNotification = async (notificationId) => (await api.get(`/notifications/${notificationId}/`)).data;

export const updateNotification = async (notificationId, payload) => (await api.patch(`/notifications/${notificationId}/`, payload)).data;

export const deleteNotification = async (notificationId) => (await api.delete(`/notifications/${notificationId}/`)).data;

export const markNotificationsRead = async (notificationIds) => (await api.post('/notifications/mark-read/', { notification_ids: notificationIds })).data;

export const markAllNotificationsRead = async () => (await api.post('/notifications/mark-all-read/')).data;

export const fetchNotificationStats = async (signal = null) => {
  const config = signal ? { signal } : {};
  const response = await api.get('/notifications/stats/', config);
  return response.data;
};

export const getNotificationPreferences = async () => (await api.get('/notifications/preferences/')).data;

export const updateNotificationPreferences = async (payload) => (await api.put('/notifications/preferences/', payload)).data;

export const bulkDeleteNotifications = async (notificationIds) => (await api.post('/notifications/bulk-delete/', { notification_ids: notificationIds })).data;

// Admission Applications
export const fetchAdmissionApplications = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return (await api.get(`/education/admission-applications/${queryString ? '?' + queryString : ''}`)).data;
};

export const createAdmissionApplication = async (data) => (await api.post('/education/admission-applications/', data)).data;

export const updateAdmissionApplication = async (id, data) => (await api.put(`/education/admission-applications/${id}/`, data)).data;

export const deleteAdmissionApplication = async (id) => (await api.delete(`/education/admission-applications/${id}/`)).data;

export const approveAdmissionApplication = async (id, data = {}) => (await api.post(`/education/admission-applications/${id}/approve/`, data)).data;

export const rejectAdmissionApplication = async (id, data = {}) => (await api.post(`/education/admission-applications/${id}/reject/`, data)).data;

// Pharmacy Master Medicine and Barcode APIs
export const searchMasterMedicines = async (query) => (await api.get(`/pharmacy/master-medicines/?q=${query}`)).data;
export const fetchMedicineByBarcode = async (barcode) => (await api.get(`/pharmacy/medicines/barcode/?code=${barcode}`)).data;

// Pharmacy Return APIs
export const fetchPharmacyReturns = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/pharmacy/returns/${queryString ? '?' + queryString : ''}`);
  return unwrapList(response.data);
};

export const createPharmacyReturn = async (data) => (await api.post('/pharmacy/returns/', data)).data;

export const updatePharmacyReturn = async (id, data) => (await api.patch(`/pharmacy/returns/${id}/`, data)).data;

export const deletePharmacyReturn = async (id) => (await api.delete(`/pharmacy/returns/${id}/`)).data;

export const processPharmacyReturn = async (id) => (await api.post(`/pharmacy/returns/${id}/process/`)).data;

// Pharmacy Loyalty Program APIs
export const fetchPharmacyLoyaltyRewards = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/pharmacy/loyalty/rewards/${queryString ? '?' + queryString : ''}`);
  return unwrapList(response.data);
};

export const createPharmacyLoyaltyReward = async (data) => (await api.post('/pharmacy/loyalty/rewards/', data)).data;

export const updatePharmacyLoyaltyReward = async (id, data) => (await api.patch(`/pharmacy/loyalty/rewards/${id}/`, data)).data;

export const deletePharmacyLoyaltyReward = async (id) => (await api.delete(`/pharmacy/loyalty/rewards/${id}/`)).data;

export const fetchPharmacyLoyaltyTransactions = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/pharmacy/loyalty/transactions/${queryString ? '?' + queryString : ''}`);
  return unwrapList(response.data);
};

export const createPharmacyLoyaltyTransaction = async (data) => (await api.post('/pharmacy/loyalty/transactions/', data)).data;

export const redeemPharmacyLoyaltyPoints = async (customerId, rewardId) => 
  (await api.post('/pharmacy/loyalty/redeem/', { customer_id: customerId, reward_id: rewardId })).data;

// Retail Product Barcode API
export const fetchRetailProductByBarcode = async (barcode) => (await api.get(`/retail/products/barcode/?code=${barcode}`)).data;

// Retail Return APIs
export const fetchRetailReturns = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/retail/returns/${queryString ? '?' + queryString : ''}`);
  return unwrapList(response.data);
};

export const createRetailReturn = async (data) => (await api.post('/retail/returns/', data)).data;

export const updateRetailReturn = async (id, data) => (await api.patch(`/retail/returns/${id}/`, data)).data;

export const deleteRetailReturn = async (id) => (await api.delete(`/retail/returns/${id}/`)).data;

export const processRetailReturn = async (id) => (await api.post(`/retail/returns/${id}/process/`)).data;

// Retail Price List APIs
export const fetchRetailPriceLists = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/retail/price-lists/${queryString ? '?' + queryString : ''}`);
  return unwrapList(response.data);
};

export const createRetailPriceList = async (data) => (await api.post('/retail/price-lists/', data)).data;

export const updateRetailPriceList = async (id, data) => (await api.patch(`/retail/price-lists/${id}/`, data)).data;

export const deleteRetailPriceList = async (id) => (await api.delete(`/retail/price-lists/${id}/`)).data;

export const fetchRetailPriceListItems = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/retail/price-list-items/${queryString ? '?' + queryString : ''}`);
  return unwrapList(response.data);
};

export const createRetailPriceListItem = async (data) => (await api.post('/retail/price-list-items/', data)).data;

export const updateRetailPriceListItem = async (id, data) => (await api.patch(`/retail/price-list-items/${id}/`, data)).data;

export const deleteRetailPriceListItem = async (id) => (await api.delete(`/retail/price-list-items/${id}/`)).data;

export const getRetailProductPrice = async (customerId, productId, quantity = 1) => {
  const response = await api.get('/retail/get-product-price/', {
    params: { customer: customerId, product: productId, quantity }
  });
  return response.data;
};

// Retail Quotation APIs
export const fetchRetailQuotations = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/retail/quotations/${queryString ? '?' + queryString : ''}`);
  return unwrapList(response.data);
};

export const createRetailQuotation = async (data) => (await api.post('/retail/quotations/', data)).data;

export const updateRetailQuotation = async (id, data) => (await api.patch(`/retail/quotations/${id}/`, data)).data;

export const deleteRetailQuotation = async (id) => (await api.delete(`/retail/quotations/${id}/`)).data;

export const convertQuotationToSale = async (quotationId) => (await api.post(`/retail/quotations/${quotationId}/convert-to-sale/`)).data;

// ==================== Razorpay Integration APIs ====================

// Razorpay Setup & Configuration
export const getRazorpaySetupStatus = async () => (await api.get('/razorpay/setup/status/')).data;
export const getRazorpaySetupGuide = async () => (await api.get('/razorpay/setup/guide/')).data;
export const configureRazorpay = async (data) => (await api.post('/razorpay/setup/', data)).data;

// Razorpay Payment Processing
export const createRazorpayOrder = async (data) => (await api.post('/razorpay/create-order/', data)).data;
export const verifyRazorpayPayment = async (data) => (await api.post('/razorpay/verify-payment/', data)).data;
export const getPaymentOptions = async () => (await api.get('/payments/options/')).data;
export const getUpiSettings = async () => (await api.get('/payments/upi-settings/')).data;
export const updateUpiSettings = async (payload) => (await api.post('/payments/upi-settings/', payload)).data;

// Sector-Specific Razorpay Payment Endpoints
export const createEducationFeePayment = async (paymentId) => (await api.post(`/education/fee-payments/${paymentId}/razorpay/`)).data;
export const createRestaurantOrderPayment = async (orderId) => (await api.post(`/restaurant/orders/${orderId}/razorpay/`)).data;
export const createSalonAppointmentPayment = async (appointmentId) => (await api.post(`/salon/appointments/${appointmentId}/razorpay/`)).data;
export const createPharmacySalePayment = async (saleId) => (await api.post(`/pharmacy/sales/${saleId}/razorpay/`)).data;
export const createRetailSalePayment = async (saleId) => (await api.post(`/retail/sales/${saleId}/razorpay/`)).data;
export const createHotelBookingPayment = async (bookingId) => (await api.post(`/hotel/bookings/${bookingId}/razorpay/`)).data;
