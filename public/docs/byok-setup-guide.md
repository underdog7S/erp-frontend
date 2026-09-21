# How to Connect Your Existing Email, WhatsApp & SMS to Zenith ERP

This guide is for users on the **Platform Plan** (or higher) who already have their own business communication tools set up and want to connect them to Zenith ERP.

---

## Option A: Connect Your Existing Email (Gmail / Zoho / Outlook)

### Step 1: Generate an App Password
You cannot use your normal Gmail or Zoho password. You must generate a special "App Password":

**For Gmail (Google Workspace):**
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click → **Security** → **2-Step Verification** (enable it if not done)
3. Scroll down → Click **App Passwords**
4. Select "Mail" and your device → Click **Generate**
5. Copy the 16-character password shown

**For Zoho Mail:**
1. Log into [mail.zoho.in](https://mail.zoho.in)
2. Go to **Settings** → **Security** → **App Passwords**
3. Click **Generate New Password**, name it "Zenith ERP"
4. Copy the password

### Step 2: Paste Into Zenith ERP
1. Log into your Zenith ERP dashboard
2. Go to **Settings → Integrations** (BYOK page)
3. Fill in the **Custom Email Server (SMTP)** section:
   - **SMTP Host:** `smtp.gmail.com` (or `smtp.zoho.in` for Zoho)
   - **SMTP Port:** `587`
   - **Email Address:** Your full email (e.g., `billing@yourschool.com`)
   - **App Password:** Paste the password from Step 1
4. Click **Save All Integrations**

✅ From now on, all invoices and alerts sent through Zenith ERP will come FROM your own email address!

---

## Option B: Connect Your Existing WhatsApp Business Number

### Requirements
Your WhatsApp number must be registered as a **WhatsApp Business API** number via Meta. Personal WhatsApp or regular WhatsApp Business app will NOT work.

### Step 1: Register Your Number on Meta for Developers
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **My Apps** → **Create App** → Select **Business**
3. Add the **WhatsApp** product to your app
4. Under **WhatsApp → Getting Started**, click **Add Phone Number**
5. Enter your existing phone number. Meta will send you an OTP to verify you own it.
6. Once verified, your physical number is now a WhatsApp Cloud API number.
7. Copy:
   - **Phone Number ID** (shown on the dashboard)
   - **Permanent Access Token** (generate via System User in Business Manager)

### Step 2: Paste Into Zenith ERP
1. Go to **Settings → Integrations**
2. Fill in the **WhatsApp Business API** section
3. Paste the Phone Number ID and Access Token
4. Click **Save All Integrations**

✅ Customers can now message your own WhatsApp number, and you can reply directly from the Zenith Omnichannel Inbox!

---

## Option C: Connect Your Own SMS Number (via Twilio)

### Option C1: Port Your Existing Physical Number to Twilio
1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Go to **Phone Numbers → Manage → Port & Host**
3. Click **Port a Number**, enter your existing number
4. Twilio will contact your current carrier and transfer the number (takes 3–7 business days)

### Option C2: Buy a New Twilio Number
1. Log into Twilio Console → **Phone Numbers → Buy a Number**
2. Search by country (India: `+91`) and purchase a virtual number (~\$1.15/month)

### Step 2: Get Your Twilio Credentials
1. Go to Twilio Console Home
2. Copy your **Account SID** and **Auth Token**
3. Note the phone number you own (e.g., `+91 98765 00001`)

### Step 3: Paste Into Zenith ERP
1. Go to **Settings → Integrations**
2. Fill in the **SMS Gateway (Twilio)** section
3. Click **Save All Integrations**

✅ SMS messages sent through Zenith will now come from YOUR number, not a shared pool!

---

## Which Plan Do I Need?

| Feature | Free | Platform | Starter | Pro | Enterprise |
|---------|------|----------|---------|-----|------------|
| Connect own Email (SMTP) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Connect own WhatsApp | ❌ | ✅ | ✅ | ✅ | ✅ |
| Connect own SMS (Twilio) | ❌ | ✅ | ✅ | ✅ | ✅ |
| We provision numbers for you | ❌ | ❌ | ✅ | ✅ | ❌ |

> **Platform Plan (₹999/mo):** Best for established businesses that already have their own telecom set up. You get the full ERP platform, and you connect your own accounts.

> **Starter Plan (₹2,499/mo):** We buy you a dedicated phone number, WhatsApp, and email and set everything up within 1-2 hours of your subscription.

---

## Need Help?
Contact us at **support@zenitherp.online** or use the live chat in your dashboard.
