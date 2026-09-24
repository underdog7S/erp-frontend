// Single source of truth for the public navigation's mega-menu content and
// for each product page's card grid (so the nav dropdown and the page it
// links to never drift out of sync). Each product's `items[].key` doubles as
// the `?focus=` query value the product page uses to show just that one card.
//
// Every item also carries `deliverables` / `techStack` / `timeline` / an
// optional `example` (linking to a real, live project in the portfolio) -
// these render only in the expanded `?focus=` view, not in the compact
// dropdown or grid, so the dropdown stays scannable.

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
        description: 'Marketing sites and company websites built on React and a Django REST Framework backend — fast, SEO-indexable, and easy for your team to update.',
        deliverables: [
          'Up to 8 pages, fully mobile-responsive',
          'Contact form wired to email/CRM',
          'Google Analytics and basic on-page SEO',
          'One round of revisions included'
        ],
        techStack: ['React', 'Django REST Framework', 'AWS', 'Cloudflare'],
        timeline: '2–4 weeks',
        example: { name: 'Kerala Cafe', url: 'https://keralacafe.co' }
      },
      {
        key: 'ecommerce',
        label: 'E-commerce',
        description: 'Full online stores with product catalogs, cart, and checkout — Razorpay/Stripe payments, PostgreSQL-backed inventory, and the same admin dashboard used across ZenERP.',
        deliverables: [
          'Full product catalog with categories and variants',
          'Cart, checkout, and Razorpay/Stripe payments',
          'Order tracking and an admin dashboard',
          'Referral/loyalty program support'
        ],
        techStack: ['React', 'Django REST Framework', 'PostgreSQL', 'Razorpay'],
        timeline: '4–8 weeks',
        example: { name: 'Indian Heritage Spices', url: 'https://indianheritagespices.com' }
      },
      {
        key: 'web-portal',
        label: 'Custom Web Portals',
        description: 'Internal tools and admin dashboards — React + Material UI on the front end, Django REST APIs, JWT auth, and role-based access control.',
        deliverables: [
          'Role-based login for staff, admin, and client users',
          'Custom dashboards and reports',
          'A REST API ready for future integrations',
          'Deployed on your own domain'
        ],
        techStack: ['React', 'Material UI', 'Django REST Framework', 'JWT auth'],
        timeline: '4–6 weeks'
      },
      {
        key: 'client-portal',
        label: 'Client Self-Service Portals',
        description: 'Let clients log in to track invoices, projects, and documents — built on the same multi-tenant, PostgreSQL-isolated architecture that powers ZenERP.',
        deliverables: [
          'Client login with invoice and document access',
          'Project or order status tracking',
          'Secure file uploads',
          'Email notifications on updates'
        ],
        techStack: ['React', 'Django REST Framework', 'PostgreSQL (multi-tenant)'],
        timeline: '3–6 weeks'
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
        description: 'Native-feel, cross-platform apps built with React Native — one codebase for iOS and Android, synced in real time to your ERP over REST APIs.',
        deliverables: [
          'One React Native codebase for iOS and Android',
          'Native navigation and offline support',
          'App Store and Play Store submission',
          'Push notification setup'
        ],
        techStack: ['React Native', 'Firebase Cloud Messaging', 'REST APIs'],
        timeline: '6–10 weeks'
      },
      {
        key: 'booking-apps',
        label: 'Customer Booking Apps',
        description: 'Appointment and order booking apps with push notifications (Firebase Cloud Messaging) and live inventory/slot sync from the same Django backend.',
        deliverables: [
          'Real-time slot/appointment booking',
          'In-app payments',
          'Push reminders for upcoming bookings',
          'Synced with your ZenERP inventory or calendar'
        ],
        techStack: ['React Native', 'Firebase', 'Django REST Framework'],
        timeline: '6–8 weeks'
      },
      {
        key: 'erp-sync',
        label: 'ERP-Synced Mobile',
        description: 'Field staff and delivery apps that read and write directly against your ZenERP database — offline-first with local caching and background sync.',
        deliverables: [
          'Offline-first data capture for field staff',
          'Background sync when back online',
          'Role-based access matching your ERP',
          'Barcode/QR scanning support'
        ],
        techStack: ['React Native', 'SQLite (local cache)', 'REST APIs'],
        timeline: '5–8 weeks'
      },
      {
        key: 'push-notifications',
        label: 'Push Notifications',
        description: 'Re-engage customers with automated push notifications for abandoned carts, upcoming appointments, and new offers.',
        deliverables: [
          'Abandoned-cart and booking reminders',
          'Segmented campaigns by user behavior',
          'Delivery and open-rate tracking',
          'A/B testing support'
        ],
        techStack: ['Firebase Cloud Messaging', 'Django REST Framework'],
        timeline: '1–2 weeks (add-on to an existing app)'
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
        description: 'Go-to-market strategy for teams launching or repositioning a product — positioning, pricing, channel plan, and a 90-day launch roadmap.',
        deliverables: [
          'Market and competitor positioning',
          'Pricing strategy',
          'Channel plan — where you sell and market',
          'A 90-day launch roadmap'
        ],
        techStack: [],
        timeline: '1–2 weeks turnaround after the call'
      },
      {
        key: 'sales-plan',
        label: 'Sales Plan',
        description: "A concrete sales playbook: target segments, outbound cadence, pipeline stages built directly in ZenCRM, and the KPIs that tell you it's working.",
        deliverables: [
          'Target segment definition',
          'Outbound cadence and call/message scripts',
          'Pipeline stages set up in ZenCRM',
          'A KPI dashboard to track progress'
        ],
        techStack: ['ZenCRM'],
        timeline: '1–2 weeks turnaround after the call'
      },
      {
        key: 'free-consultation',
        label: 'Book a Free Consultation',
        description: '30 minutes on a call to figure out which of these actually applies to you — no pitch, just a plan.',
        deliverables: [
          '30-minute call, no pitch',
          'A written summary of recommendations',
          "An honest answer if we're not the right fit"
        ],
        techStack: [],
        timeline: 'Booked live via Google Calendar'
      }
    ]
  },
  {
    key: 'zenerp',
    label: 'ZenERP',
    path: '/erp',
    tagline: '7 industry verticals',
    items: [
      {
        key: 'education',
        label: 'Education',
        description: 'Student records, attendance, fee management, exams, and report cards — Django + PostgreSQL, with a React dashboard for staff and a parent-facing portal.',
        deliverables: [
          'Student records, attendance, and fee management',
          'Exam and report card generation',
          'Parent-facing portal',
          'Staff attendance tracking'
        ],
        techStack: ['Django REST Framework', 'PostgreSQL', 'React'],
        timeline: '2–4 weeks to go live'
      },
      {
        key: 'pharmacy',
        label: 'Pharmacy',
        description: 'Batch-tracked medicine inventory, prescriptions, and point-of-sale billing with expiry alerts, on the same multi-tenant Django backend as every ZenERP module.',
        deliverables: [
          'Batch-tracked medicine inventory',
          'Prescription management',
          'Point-of-sale billing',
          'Expiry alerts'
        ],
        techStack: ['Django REST Framework', 'PostgreSQL'],
        timeline: '2–3 weeks to go live'
      },
      {
        key: 'retail',
        label: 'Retail & Wholesale',
        description: 'Multi-warehouse inventory, purchase orders, and sales with barcode support — REST APIs ready for POS hardware integration.',
        deliverables: [
          'Multi-warehouse inventory',
          'Purchase orders and supplier management',
          'Barcode-ready POS',
          'Sales reporting'
        ],
        techStack: ['Django REST Framework', 'PostgreSQL'],
        timeline: '2–3 weeks to go live'
      },
      {
        key: 'manufacturing',
        label: 'Manufacturing',
        description: 'Raw material and finished goods inventory, versioned Bills of Materials, production orders, and quality control — the same multi-tenant Django backend as every ZenERP module.',
        deliverables: [
          'Raw material & finished goods inventory',
          'Bill of Materials (BOM) with versioning',
          'Production order tracking',
          'Supplier purchase orders & quality checks'
        ],
        techStack: ['Django REST Framework', 'PostgreSQL', 'React'],
        timeline: '3–5 weeks to go live'
      },
      {
        key: 'hotel',
        label: 'Hotel',
        description: 'Room bookings, guest management, and housekeeping — real-time availability backed by PostgreSQL with conflict-safe booking logic.',
        deliverables: [
          'Room and rate management',
          'Guest booking with conflict-safe availability',
          'Housekeeping task tracking',
          'Check-in / check-out flow'
        ],
        techStack: ['Django REST Framework', 'PostgreSQL'],
        timeline: '2–4 weeks to go live'
      },
      {
        key: 'restaurant',
        label: 'Restaurant',
        description: 'Table orders, kitchen display sync, and menu management — live order status between front-of-house and kitchen.',
        deliverables: [
          'Table and order management',
          'Kitchen display sync',
          'Menu management',
          'Billing with GST-ready invoices'
        ],
        techStack: ['Django REST Framework', 'PostgreSQL', 'WebSockets'],
        timeline: '2–3 weeks to go live'
      },
      {
        key: 'salon',
        label: 'Salon',
        description: "Appointments, stylist schedules, and service billing — the same booking-conflict engine used across ZenERP's hospitality modules.",
        deliverables: [
          'Appointment scheduling with conflict checks',
          'Stylist calendars',
          'Service billing',
          'Customer history'
        ],
        techStack: ['Django REST Framework', 'PostgreSQL'],
        timeline: '2–3 weeks to go live'
      },
      {
        key: 'custom-erp',
        label: 'Custom ERP',
        description: "Bespoke modules built on the ZenERP platform (React + Django REST Framework) for workflows the standard verticals don't cover.",
        deliverables: [
          'Requirements workshop',
          'Custom modules built on the ZenERP platform',
          'Integration with your existing tools',
          'Staff training and handover'
        ],
        techStack: ['React', 'Django REST Framework', 'PostgreSQL'],
        timeline: '6–12 weeks depending on scope'
      },
      {
        key: 'white-label',
        label: 'White Label',
        description: 'Resell ZenERP under your own brand and domain — your logo, colors, and custom login screens, on dedicated cloud infrastructure.',
        deliverables: [
          'Your logo, colors, and domain',
          'Custom login and onboarding emails',
          'Dedicated cloud instance',
          'Reseller pricing support'
        ],
        techStack: ['React', 'Django REST Framework', 'AWS (dedicated instance)'],
        timeline: '3–5 weeks setup'
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
        description: 'Drag-and-drop deal stages with automatic probability and close-date tracking — Django models under a React Kanban board.',
        deliverables: [
          'Drag-and-drop deal stages',
          'Automatic probability and close-date tracking',
          'Custom pipeline stages per team',
          'Win/loss reporting'
        ],
        techStack: ['React (Kanban UI)', 'Django REST Framework'],
        timeline: '1–2 weeks to configure'
      },
      {
        key: 'inbox',
        label: 'Omnichannel Inbox',
        description: 'WhatsApp Business API, SMS (Twilio), and email in one unified inbox — no more switching between apps to answer a lead.',
        deliverables: [
          'WhatsApp Business API integration',
          'SMS via Twilio',
          'Email in the same inbox',
          'Team assignment and internal notes'
        ],
        techStack: ['WhatsApp Business API', 'Twilio', 'Django REST Framework'],
        timeline: '1–3 weeks, depending on WhatsApp approval'
      },
      {
        key: 'ai-scoring',
        label: 'AI Lead Replies',
        description: 'AI answers customer messages in your inbox, can check live inventory, and logs a CRM lead when someone shows interest - using the same AI pipeline available across ZenVerse.',
        deliverables: [
          'AI replies inside the omnichannel inbox',
          'Live inventory lookup from chat',
          'Automatic CRM lead creation on request',
          'Usage tracking per plan'
        ],
        techStack: ['OpenAI', 'Django REST Framework'],
        timeline: '1–2 weeks'
      },
      {
        key: 'lead-capture',
        label: 'Lead Capture & Service Area',
        description: 'A website enquiry widget or shareable link with a consent tick. Every lead is flagged in or out of your service radius, so you know who is worth a visit.',
        deliverables: [
          'Embeddable enquiry button and hosted form',
          'Consent recorded with every lead',
          'Distance from your service centre',
          'In-area / out-of-area lead filter'
        ],
        techStack: ['OpenStreetMap', 'Django REST Framework'],
        timeline: '1 week'
      },
      {
        key: 'analytics',
        label: 'Analytics & Email Campaigns',
        description: 'Revenue forecasting, pipeline velocity, and email campaigns to consented contacts — PostgreSQL-backed reporting with exportable dashboards. WhatsApp and SMS are opt-in, one-to-one conversations.',
        deliverables: [
          'Revenue forecasting',
          'Pipeline velocity reports',
          'Email campaigns to consented contacts',
          'Exportable dashboards'
        ],
        techStack: ['PostgreSQL', 'React charts'],
        timeline: '1–2 weeks'
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
