# Deployment Guide

This guide will walk you through deploying the TikTok Content Generator to production.

## Prerequisites

- [Railway](https://railway.app/) account
- [Supabase](https://supabase.com/) account
- [Stripe](https://stripe.com/) account
- [OpenAI](https://openai.com/) API key
- GitHub account (for CI/CD)

---

## 1. Supabase Setup (Authentication)

### 1.1 Create Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be ready

### 1.2 Configure Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Google** provider:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
4. (Optional) Enable **GitHub** provider

### 1.3 Get Credentials
1. Go to **Settings** → **API**
2. Copy:
   - `Project URL`
   - `anon/public` key

---

## 2. Stripe Setup (Payments)

### 2.1 Create Products and Prices
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Products** → **Add Product**
3. Create two products:

**Pro Plan:**
- Name: Pro
- Price: $19/month (or your price)
- Recurring: Monthly
- Copy the **Price ID** (starts with `price_`)

**Business Plan:**
- Name: Business
- Price: $49/month (or your price)
- Recurring: Monthly
- Copy the **Price ID**

### 2.2 Setup Webhook
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://[your-backend-url]/api/v1/billing/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook Secret** (starts with `whsec_`)

### 2.3 Get API Keys
1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

---

## 3. Railway Setup (Database + Hosting)

### 3.1 Create MySQL Database
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project** → **Provision MySQL**
3. Wait for database to be ready
4. Go to **Variables** tab
5. Copy the `DATABASE_URL` (starts with `mysql://`)

### 3.2 Deploy Backend
1. Click **New** → **GitHub Repo**
2. Select your repository
3. Select `packages/backend` as root directory
4. Add environment variables:

```env
# Database
DATABASE_URL=mysql://...

# Supabase
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_JWT_SECRET=[your-jwt-secret]

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_BUSINESS=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# App
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://[your-frontend-url]
```

5. Deploy and wait for build to complete
6. Copy the **Backend URL** (e.g., `https://your-app.up.railway.app`)

### 3.3 Run Database Migrations
1. In Railway, go to your backend service
2. Click **Settings** → **Deploy**
3. Add custom start command:
```bash
pnpm db:push && pnpm db:seed && pnpm start
```
4. Or manually run via Railway CLI:
```bash
railway run pnpm db:push
railway run pnpm db:seed
```

### 3.4 Deploy Frontend
1. Click **New** → **GitHub Repo**
2. Select your repository
3. Select `packages/frontend` as root directory
4. Add environment variables:

```env
VITE_API_URL=https://[your-backend-url]/api/v1
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

5. Deploy and wait for build to complete
6. Copy the **Frontend URL**

---

## 4. Chrome Extension Setup

### 4.1 Build Extension
```bash
cd packages/extension
pnpm install
pnpm build
```

### 4.2 Test Locally
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `packages/extension/dist` folder

### 4.3 Publish to Chrome Web Store
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Click **New Item**
3. Upload `extension.zip` (create from `dist` folder)
4. Fill in store listing details
5. Submit for review

---

## 5. Update Supabase Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add **Site URL**: `https://[your-frontend-url]`
3. Add **Redirect URLs**:
   - `https://[your-frontend-url]/auth/callback`
   - `http://localhost:5173/auth/callback` (for local dev)

---

## 6. Update Stripe Webhook URL

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Edit your webhook endpoint
3. Update URL to: `https://[your-backend-url]/api/v1/billing/webhook`

---

## 7. Testing

### 7.1 Test Authentication
1. Go to your frontend URL
2. Click **Register**
3. Create an account with email
4. Verify email (check Supabase email logs if needed)
5. Login successfully

### 7.2 Test Product Creation
1. Login to your app
2. Go to Dashboard
3. Click **Add Product**
4. Fill in product details
5. Save product

### 7.3 Test Content Generation
1. Select a product
2. Choose language, platform, tone
3. Click **Generate Content**
4. Verify content is generated

### 7.4 Test Stripe Integration
1. Go to **Billing** page
2. Click **Upgrade to Pro**
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify subscription is active

### 7.5 Test Chrome Extension
1. Install extension
2. Go to AliExpress or Amazon product page
3. Click extension icon
4. Enter API URL and API Key
5. Login
6. Click **Fetch Product**
7. Verify product is saved
8. Generate content

---

## 8. Monitoring

### 8.1 Railway Logs
- Go to Railway Dashboard
- Select your service
- Click **Logs** tab
- Monitor for errors

### 8.2 Supabase Logs
- Go to Supabase Dashboard
- Click **Logs** in sidebar
- Monitor authentication logs

### 8.3 Stripe Dashboard
- Monitor subscriptions
- Check for failed payments
- View webhook delivery logs

---

## 9. Scaling

### 9.1 Database
- Railway MySQL starts with 512MB
- Upgrade plan as needed
- Consider connection pooling for high traffic

### 9.2 Backend
- Railway auto-scales based on traffic
- Monitor memory usage
- Add Redis for caching if needed

### 9.3 Frontend
- Railway serves static files efficiently
- Consider CDN for global distribution
- Enable compression

---

## 10. Security Checklist

- [ ] All environment variables are set correctly
- [ ] Supabase RLS policies are enabled (if using database directly)
- [ ] Stripe webhook signature verification is working
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] API keys are never exposed in frontend code
- [ ] HTTPS is enforced everywhere
- [ ] Supabase JWT secret is kept secure

---

## 11. Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify `DATABASE_URL` is correct
- Ensure all required env vars are set
- Try running migrations manually

### Authentication not working
- Check Supabase URL and keys
- Verify redirect URLs are correct
- Check browser console for errors
- Ensure JWT secret matches Supabase

### Stripe webhook failing
- Check webhook URL is correct
- Verify webhook secret matches
- Check Railway logs for errors
- Test webhook with Stripe CLI

### Content generation failing
- Verify OpenAI API key is valid
- Check OpenAI account has credits
- Monitor API rate limits
- Check backend logs for errors

---

## 12. Local Development

### Backend
```bash
cd packages/backend
cp .env.example .env
# Fill in .env with your credentials
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

### Frontend
```bash
cd packages/frontend
cp .env.example .env
# Fill in .env with your credentials
pnpm install
pnpm dev
```

### Extension
```bash
cd packages/extension
pnpm install
pnpm dev
# Load unpacked from dist/ in Chrome
```

---

## 13. CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 22
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      # Railway will auto-deploy on push to main
```

---

## Support

For issues or questions:
- Check Railway logs
- Check Supabase logs
- Check Stripe dashboard
- Review this deployment guide

---

**Congratulations! Your TikTok Content Generator is now live! 🎉**
