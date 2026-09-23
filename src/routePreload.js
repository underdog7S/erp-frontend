// Lets the sidebar start fetching a route's code-split chunk on hover/focus,
// before the user actually clicks it - by the time React Router mounts the
// route, the chunk is often already resolved, so App.js's Suspense fallback
// doesn't need to show at all. Purely additive: it doesn't change how any
// route renders, only when its JS starts downloading. Paths here must match
// App.js's lazy() import paths exactly (this file lives in src/ for that).
const loaders = {
  '/dashboard': () => import('./pages/Dashboard'),
  '/education': () => import('./pages/Education'),
  '/education/timetable': () => import('./pages/Education/TimetableManagement'),
  '/education/reports': () => import('./pages/Education/AdvancedReporting'),
  '/education/exams': () => import('./pages/Education/ExamManagement'),
  '/pharmacy': () => import('./pages/Pharmacy/PharmacyDashboard'),
  '/retail': () => import('./pages/Retail/RetailDashboard'),
  '/manufacturing': () => import('./pages/Manufacturing/ManufacturingDashboard'),
  '/hotel': () => import('./pages/Hotel/HotelDashboard'),
  '/restaurant': () => import('./pages/Restaurant/RestaurantDashboard'),
  '/salon': () => import('./pages/Salon/SalonDashboard'),
  '/salon/crm': () => import('./pages/Salon/SalonCRM'),
  '/salon/billing': () => import('./pages/Salon/SalonBilling'),
  '/crm/contacts': () => import('./pages/CRM/ContactManagement'),
  '/crm/email-marketing': () => import('./pages/CRM/EmailMarketing'),
  '/crm/inbox': () => import('./pages/CRM/OmnichannelInbox'),
  '/team-chat': () => import('./pages/CRM/TeamChat'),
  '/crm/deals': () => import('./pages/CRM/DealsPipeline'),
  '/admin': () => import('./pages/AdminEnhanced'),
  '/admin/public-settings': () => import('./pages/AdminPublicSettings'),
  '/admin/razorpay-settings': () => import('./pages/RazorpaySettings'),
  '/payment': () => import('./pages/Payment'),
  '/settings': () => import('./pages/Settings/Settings'),
  '/settings/billing': () => import('./pages/Billing/AddonStore'),
  '/settings/integrations': () => import('./pages/Settings/Integrations'),
  '/settings/users': () => import('./components/AdminUserManagement'),
};

const preloaded = new Set();

export function preloadRoute(path) {
  if (!path) return;
  const pathname = path.split('?')[0];
  if (preloaded.has(pathname)) return;
  const loader = loaders[pathname];
  if (!loader) return;
  preloaded.add(pathname);
  loader().catch(() => {
    // A hover-triggered prefetch failing (offline blip, etc.) isn't worth
    // surfacing - the real navigation's own lazy() import will just retry.
    preloaded.delete(pathname);
  });
}

export function preloadRoutes(paths) {
  paths.forEach(preloadRoute);
}
