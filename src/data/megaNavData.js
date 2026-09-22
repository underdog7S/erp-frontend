// Single source of truth for the public navigation's mega-menu content and
// for each product page's card grid (so the nav dropdown and the page it
// links to never drift out of sync). Each product's `items[].key` doubles as
// the `?focus=` query value the product page uses to show just that one card.

export const MEGA_NAV = [
  {
    key: 'zenweb',
    label: 'ZenWeb',
    path: '/zen-web',
    tagline: 'Websites & web portals',
    items: [
      {
        key: 'business-website',
        label: 'Business Websites',
        description: 'Marketing sites and company websites built on React and a Django REST Framework backend — fast, SEO-indexable, and easy for your team to update.'
      },
      {
        key: 'ecommerce',
        label: 'E-commerce',
        description: 'Full online stores with product catalogs, cart, and checkout — Razorpay/Stripe payments, PostgreSQL-backed inventory, and the same admin dashboard used across ZenERP.'
      },
      {
        key: 'web-portal',
        label: 'Custom Web Portals',
        description: 'Internal tools and admin dashboards — React + Material UI on the front end, Django REST APIs, JWT auth, and role-based access control.'
      },
      {
        key: 'client-portal',
        label: 'Client Self-Service Portals',
        description: 'Let clients log in to track invoices, projects, and documents — built on the same multi-tenant, PostgreSQL-isolated architecture that powers ZenERP.'
      }
    ]
  },
  {
    key: 'zenapp',
    label: 'ZenApp',
    path: '/zen-app',
    tagline: 'iOS & Android apps',
    items: [
      {
        key: 'ios-android',
        label: 'iOS & Android Apps',
        description: 'Native-feel, cross-platform apps built with React Native — one codebase for iOS and Android, synced in real time to your ERP over REST APIs.'
      },
      {
        key: 'booking-apps',
        label: 'Customer Booking Apps',
        description: 'Appointment and order booking apps with push notifications (Firebase Cloud Messaging) and live inventory/slot sync from the same Django backend.'
      },
      {
        key: 'erp-sync',
        label: 'ERP-Synced Mobile',
        description: 'Field staff and delivery apps that read and write directly against your ZenERP database — offline-first with local caching and background sync.'
      },
      {
        key: 'push-notifications',
        label: 'Push Notifications',
        description: 'Re-engage customers with automated push notifications for abandoned carts, upcoming appointments, and new offers.'
      }
    ]
  },
  {
    key: 'zenconsult',
    label: 'ZenConsult',
    path: '/zen-consult',
    tagline: 'Strategy & go-to-market',
    items: [
      {
        key: 'business-gtm',
        label: 'Business GTM',
        description: 'Go-to-market strategy for teams launching or repositioning a product — positioning, pricing, channel plan, and a 90-day launch roadmap.'
      },
      {
        key: 'sales-plan',
        label: 'Sales Plan',
        description: "A concrete sales playbook: target segments, outbound cadence, pipeline stages built directly in ZenCRM, and the KPIs that tell you it's working."
      },
      {
        key: 'free-consultation',
        label: 'Book a Free Consultation',
        description: '30 minutes on a call to figure out which of these actually applies to you — no pitch, just a plan.'
      }
    ]
  },
  {
    key: 'zenerp',
    label: 'ZenERP',
    path: '/erp',
    tagline: '6 industry verticals',
    items: [
      {
        key: 'education',
        label: 'Education',
        description: 'Student records, attendance, fee management, exams, and report cards — Django + PostgreSQL, with a React dashboard for staff and a parent-facing portal.'
      },
      {
        key: 'pharmacy',
        label: 'Pharmacy',
        description: 'Batch-tracked medicine inventory, prescriptions, and point-of-sale billing with expiry alerts, on the same multi-tenant Django backend as every ZenERP module.'
      },
      {
        key: 'retail',
        label: 'Retail & Wholesale',
        description: 'Multi-warehouse inventory, purchase orders, and sales with barcode support — REST APIs ready for POS hardware integration.'
      },
      {
        key: 'hotel',
        label: 'Hotel',
        description: 'Room bookings, guest management, and housekeeping — real-time availability backed by PostgreSQL with conflict-safe booking logic.'
      },
      {
        key: 'restaurant',
        label: 'Restaurant',
        description: 'Table orders, kitchen display sync, and menu management — live order status between front-of-house and kitchen.'
      },
      {
        key: 'salon',
        label: 'Salon',
        description: "Appointments, stylist schedules, and service billing — the same booking-conflict engine used across ZenERP's hospitality modules."
      },
      {
        key: 'custom-erp',
        label: 'Custom ERP',
        description: "Bespoke modules built on the ZenERP platform (React + Django REST Framework) for workflows the standard verticals don't cover."
      },
      {
        key: 'white-label',
        label: 'White Label',
        description: 'Resell ZenERP under your own brand and domain — your logo, colors, and custom login screens, on dedicated cloud infrastructure.'
      }
    ]
  },
  {
    key: 'zencrm',
    label: 'ZenCRM',
    path: '/crm',
    tagline: 'Sales & lead management',
    items: [
      {
        key: 'pipelines',
        label: 'Lead Pipelines',
        description: 'Drag-and-drop deal stages with automatic probability and close-date tracking — Django models under a React Kanban board.'
      },
      {
        key: 'inbox',
        label: 'Omnichannel Inbox',
        description: 'WhatsApp Business API, SMS (Twilio), and email in one unified inbox — no more switching between apps to answer a lead.'
      },
      {
        key: 'ai-scoring',
        label: 'AI Lead Scoring',
        description: 'Sentiment analysis on incoming messages flags hot leads automatically, using the same AI pipeline available across ZenVerse.'
      },
      {
        key: 'analytics',
        label: 'Analytics & Broadcast',
        description: 'Revenue forecasting, pipeline velocity, and mass WhatsApp/SMS campaigns — PostgreSQL-backed reporting with exportable dashboards.'
      }
    ]
  }
];

export const ABOUT_NAV = {
  key: 'about',
  label: 'About',
  items: [
    { key: 'about', label: 'About Us', path: '/about' },
    { key: 'careers', label: 'Careers', path: '/careers' },
    { key: 'contact', label: 'Contact', path: '/contact' },
    { key: 'faq', label: 'FAQ', path: '/faq' }
  ]
};
