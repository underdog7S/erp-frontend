
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
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
const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;
      try {
        const res = await api.post("/token/refresh/", {
          refresh: getRefreshToken(),
        });
        setTokens(res.data.access, getRefreshToken());
        originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

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

export const fetchClassAttendanceStatus = async (classId, date) => {
  const res = await api.get(`/education/class-attendance-status/?class_id=${classId}&date=${date}`);
  return res.data;
};

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

// Restaurant APIs
export const fetchRestaurantCategories = async () => unwrapList((await api.get('/restaurant/menu-categories/')).data);
export const createRestaurantCategory = async (payload) => (await api.post('/restaurant/menu-categories/', payload)).data;
export const updateRestaurantCategory = async (id, payload) => (await api.patch(`/restaurant/menu-categories/${id}/`, payload)).data;
export const deleteRestaurantCategory = async (id) => (await api.delete(`/restaurant/menu-categories/${id}/`)).data;
export const fetchRestaurantItems = async () => unwrapList((await api.get('/restaurant/menu-items/')).data);
export const createRestaurantItem = async (payload) => (await api.post('/restaurant/menu-items/', payload)).data;
export const updateRestaurantItem = async (id, payload) => (await api.patch(`/restaurant/menu-items/${id}/`, payload)).data;
export const deleteRestaurantItem = async (id) => (await api.delete(`/restaurant/menu-items/${id}/`)).data;

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
