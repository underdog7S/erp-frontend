# API Registration & Key Extraction Guide

This document outlines the exact steps to register for your chosen APIs (focusing on Postpaid/Pay-As-You-Go models) and exactly which "Keys" you need to copy from them to paste into ZenVerse.

---

## 1. OpenAI (For AI Assistant Features)
*OpenAI requires a minimum $5 initial balance, but then strictly deducts per usage.*

**How to Register:**
1. Go to [platform.openai.com](https://platform.openai.com/) and sign up.
2. On the left sidebar, click on **Settings** -> **Billing**.
3. Click **Add Payment Details** and add your credit card. Add the minimum $5 (approx ₹400) balance.
4. On the left sidebar, hover over the padlock icon and click **API Keys**.
5. Click **Create new secret key**. Name it "ZenVerse ERP".

**The Key you need to copy:**
* `OPENAI_API_KEY` (It will look like `sk-proj-xxxxxxxx...`)

---

## 2. Amazon Web Services (AWS SNS for True Postpaid SMS)
*AWS is purely postpaid. You send SMS all month, and they charge your card on the 1st of the next month.*

**How to Register:**
1. Go to [aws.amazon.com](https://aws.amazon.com/) and click **Create an AWS Account**.
2. Complete the signup (they will ask for a credit card but will only charge ₹2 temporarily to verify it).
3. Once logged into the AWS Console, search for **IAM** in the top search bar and click it.
4. On the left, click **Users** -> **Create User**. Name it "zenverse-sms".
5. On the permissions page, select **"Attach policies directly"** and search for `AmazonSNSFullAccess`. Check the box next to it and create the user.
6. Click on your new "zenverse-sms" user, go to the **Security credentials** tab, and click **Create access key**.

**The Keys you need to copy:**
* `AWS_ACCESS_KEY_ID` (Looks like `AKIAIOSFODNN7EXAMPLE`)
* `AWS_SECRET_ACCESS_KEY` (Looks like a long random password)
* `AWS_REGION` (The region you are operating in, usually `ap-south-1` for Mumbai).

---

## 3. Meta Developer API (For True Postpaid WhatsApp)
*Meta is purely postpaid. You attach a card, and they bill you at the end of the month based on conversations.*

**How to Register:**
1. Go to [developers.facebook.com](https://developers.facebook.com/) and log in with your Facebook account.
2. Click **My Apps** -> **Create App**.
3. Select **Other** -> **Business**. Name it "ZenVerse ERP".
4. Once the app is created, scroll down to **WhatsApp** and click **Set Up**.
5. It will prompt you to link or create a **Meta Business Account**. Follow the prompts to verify your business.
6. In the left sidebar under WhatsApp, click **API Setup**.
7. To get a *Permanent* Access Token (instead of a 24-hour temporary one), go to your Meta Business Settings -> **System Users**, create a System User, and generate a token granting it `whatsapp_business_messaging` and `whatsapp_business_management` permissions.

**The Keys you need to copy:**
* `WHATSAPP_PHONE_NUMBER_ID` (Found on the API Setup page)
* `WHATSAPP_ACCESS_TOKEN` (The permanent token you generated via System Users)

---

## 4. Where to put these Keys

**For the Platform (Shared Usage):**
You will place these keys directly into your **Render.com** Dashboard -> `erp-backend` -> Environment Variables. This allows all your Free/Starter clients to use your APIs (and you charge them for it).

**For Clients (Bring-Your-Own-Key):**
If an Enterprise client wants to use their own AWS or Meta account, they will paste these exact same keys into the **Settings -> Integrations** page inside their Zenith ERP dashboard.
