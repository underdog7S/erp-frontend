# ZenVerse API: Developer Documentation

Welcome to the ZenVerse Developer API. This guide is for developers and IT teams who want to connect their external websites, mobile apps, or third-party software directly to their Zenith ERP/CRM workspace.

---

## 🔒 Security & Authentication

ZenVerse uses secure, tenant-isolated API Keys. Your API key guarantees that your external website can only access *your* company's data, keeping everything strictly separated and secure.

**How to get your API Key:**
1. Log into your ZenVerse Dashboard.
2. Ensure your account is on the **Starter, Pro, or Enterprise** plan (The Free plan does not include API access).
3. Navigate to **Settings -> Integrations & API**.
4. Click **Generate API Key**. Keep this key secret! Do not expose it in public frontend code (like React/Angular); only use it from your backend server.

**Authentication Header:**
All API requests must include your API key in the headers:
```http
Authorization: Bearer YOUR_SECRET_API_KEY
```

---

## 🚀 Common API Endpoints

### 1. CRM & Marketing (Lead Generation)
*Perfect for connecting your website's "Contact Us" form directly into your ZenVerse Sales Pipeline.*

**Create a New Lead:**
`POST https://api.zenitherp.online/api/crm/leads/`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "source": "Website Contact Form",
  "message": "I am interested in your services."
}
```

### 2. Education Engine
*Connect your school/college website to display live fee structures or accept online admission forms.*

**Submit Admission Application:**
`POST https://api.zenitherp.online/api/education/admissions/`
```json
{
  "student_name": "Alice Smith",
  "grade_applied": "10th Grade",
  "parent_email": "parent@example.com",
  "previous_school": "Springfield High"
}
```

### 3. Retail & E-Commerce
*Connect your Shopify or WooCommerce store to ZenVerse to sync live inventory.*

**Fetch Live Inventory:**
`GET https://api.zenitherp.online/api/retail/inventory/`
*Response:*
```json
[
  {
    "product_id": "PRD-001",
    "name": "Wireless Mouse",
    "stock_available": 142,
    "price": 999.00
  }
]
```

**Create a Sales Order:**
`POST https://api.zenitherp.online/api/retail/orders/`
```json
{
  "customer_email": "buyer@example.com",
  "items": [
    {"product_id": "PRD-001", "quantity": 2}
  ],
  "total_amount": 1998.00,
  "payment_status": "Paid"
}
```

---

## 🛑 Rate Limits & Errors
To protect the ecosystem, API requests are rate-limited based on your SaaS plan:
* **Starter:** 1,000 requests / day
* **Pro:** 10,000 requests / day
* **Enterprise:** Unlimited

**Error Codes:**
* `401 Unauthorized`: Your API key is missing or invalid.
* `402 Payment Required`: Your SaaS plan does not support API access, or you exceeded your quota.
* `403 Forbidden`: You are trying to access a module (e.g., Pharmacy) that is not enabled for your industry.
* `429 Too Many Requests`: You hit your daily rate limit.

## 🤝 Need Support?
If your developers need help integrating your website with ZenVerse, contact our engineering team via the **Contact Us** page in your dashboard.
