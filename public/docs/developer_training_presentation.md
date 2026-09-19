# Developer Training & Architecture Guide
*Format: Presentation Slides (Copy each block to a separate PowerPoint slide)*

---

### Slide 1: Welcome to ZenVerse Engineering
**Title:** ZenVerse Platform Architecture & Onboarding
**Speaker Notes:** Welcome developers! This presentation will give you a bird's-eye view of how our multi-tenant SaaS ERP operates, from the database up to the UI.

---

### Slide 2: High-Level Architecture
**Title:** The Tech Stack
* **Frontend:** React.js, Material-UI (MUI), React Router, Axios. Hosted on **Vercel**.
* **Backend:** Django, Django REST Framework (DRF), SimpleJWT (Authentication). Hosted on **Render**.
* **Database:** PostgreSQL (Hosted on Render).
* **Payment Gateway:** Razorpay (B2B SaaS subscriptions & B2C Fee Collections).

---

### Slide 3: Multi-Tenancy (The Core of the SaaS)
**Title:** How Multi-Tenancy Works
* **What it is:** Multiple companies (schools, salons, hospitals) use our single codebase, but their data is securely separated.
* **The Model (`Tenant`):** Every `User`, `Invoice`, and `Contact` has a Foreign Key pointing to a `Tenant`.
* **Data Isolation:** Every API request looks at the `request.user.tenant` and filters the database so a user *never* sees another company's data.

---

### Slide 4: Authentication & Roles
**Title:** JWT & User Roles
* **Auth System:** We use JSON Web Tokens (JWT). When a user logs in, they get an `access` and `refresh` token.
* **Roles Model:** The `Role` model defines permissions (Admin, Manager, Staff, Teacher, Doctor).
* **Middlewares:** All API routes are protected by `@permission_classes([IsAuthenticated])`.

---

### Slide 5: The "Modules" System
**Title:** Industry-Specific Modules
* We offer different ERP modules: `Education`, `Pharmacy`, `Retail`, `Hotel`, `Restaurant`, `Salon`.
* **Frontend Routing:** If a Tenant's industry is "Education", the UI routes them to `/education`. If "Salon", they go to `/salon`.
* **Backend Apps:** We separate views into different files (`education_views.py`, `salon_views.py`) for clean code organization.

---

### Slide 6: Third-Party API Integrations (BYOK)
**Title:** Bring-Your-Own-Key (BYOK) Architecture
* **The Problem:** We need to send SMS/WhatsApp, but we don't want to pay for client usage.
* **The Solution (`TenantFeatureConfig`):** This database model stores individual API keys for each tenant (AWS SNS, Twilio, Meta Developer API).
* **The Logic:** When a user sends a message, the system checks if they have their own keys. If yes, it uses theirs. If no, it uses the global platform fallback.

---

### Slide 7: Razorpay Payment Flows
**Title:** B2B vs B2C Payments
* **B2B (SaaS Plans):** The Tenant pays US (ZenVerse) for their monthly subscription or add-ons (`payments_views.py` -> `RazorpayPaymentVerifyView`).
* **B2C (Client Collections):** A student pays the School. We use the *School's* Razorpay keys to process it directly to them (`razorpay_views.py` -> `RazorpayVerifyPaymentView`).

---

### Slide 8: Best Practices & Git Workflow
**Title:** Development Standards
* **Never commit secrets:** Passwords and API keys stay in `.env` files.
* **Always filter by Tenant:** When writing a new `ViewSet`, always override `get_queryset` to filter by `self.request.user.tenant`.
* **Error Handling:** Use `try/except` blocks and return proper DRF `Response` objects with standard HTTP status codes.
