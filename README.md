# 🎬 TikTok Content Generator

A comprehensive SaaS platform for generating TikTok, Instagram Reels, and YouTube Shorts content using AI. Built for dropshippers, influencers, and content creators in the Arabic market.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green)](https://nodejs.org/)

---

## ✨ Features

### 🎯 Content Generation
- **Scripts**: 20-30 second video scripts with hooks, problems, solutions, and CTAs
- **Creative Angles**: 5 different approaches to present your product
- **Hooks**: 10 attention-grabbing opening lines
- **Captions**: 5 ready-to-use captions with emojis
- **Hashtags**: 20 targeted hashtags (niche + trending + general)
- **Thumbnail Text**: 3 short, punchy texts for thumbnails

### 🌍 Multi-Language Support
- **Arabic**: Fusha, Egyptian, Saudi, Emirati, Moroccan, Levantine
- **Other Languages**: English, French, Spanish, German, Turkish, Urdu, Hindi, Indonesian, Malay

### 📱 Multi-Platform Support
- TikTok, Instagram (Reels, Stories, Feed)
- YouTube (Shorts, Long-form)
- Facebook (Reels, Ads)
- Snapchat, Twitter/X, LinkedIn, Pinterest
- Google Ads, Meta Ads

### 🎭 24 Tone Options
- **Marketing**: Aggressive, Urgent, Persuasive, Scarcity, FOMO
- **Friendly**: Casual, Conversational, Relatable, Humorous, Playful
- **Professional**: Formal, Authoritative, Educational, Informative
- **Emotional**: Inspirational, Motivational, Empathetic, Storytelling
- **Trust**: Trustworthy, Authentic, Testimonial, Expert

### 🏷️ 21 Niche Categories
Fashion, Beauty, Electronics, Home, Fitness, Health, Food, Pets, Baby, Automotive, Jewelry, Sports, Gaming, Books, Art, Music, Travel, Office, Garden, Toys, General

### 💎 Subscription Plans
| Plan | Monthly Limit | Price |
|------|--------------|-------|
| **Free** | 10 generations | $0 |
| **Pro** | 100 generations | $19/mo |
| **Business** | Unlimited | $49/mo |

---

## 🏗️ Architecture

### Monorepo Structure
```
tiktok-content-generator/
├── packages/
│   ├── backend/          # Node.js + Express + TypeScript
│   ├── frontend/         # React + Vite + TailwindCSS
│   └── extension/        # Chrome Extension (Manifest V3)
├── docker-compose.yml    # Production deployment
├── docker-compose.dev.yml # Local development
└── README.md
```

### Tech Stack

#### Backend
- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: MySQL (Railway)
- **Authentication**: Supabase Auth (JWT)
- **Payments**: Stripe
- **AI**: OpenAI API (GPT-4, GPT-3.5)

#### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

#### Chrome Extension
- **Manifest**: V3
- **UI**: React + TypeScript
- **Styling**: TailwindCSS
- **Build**: Vite
- **Supported Sites**: AliExpress, Amazon, eBay, Etsy, Walmart, Temu, SHEIN

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm 8+
- MySQL database
- Supabase account
- Stripe account
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Tamerb86/Stylora-v2.git
cd tiktok-content-generator
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**

**Backend** (`packages/backend/.env`):
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/tiktok_generator

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_BUSINESS=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`packages/frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Run database migrations**
```bash
cd packages/backend
pnpm db:push
pnpm db:seed
```

5. **Start development servers**

**Terminal 1 - Backend:**
```bash
cd packages/backend
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
pnpm dev
```

**Terminal 3 - Extension (optional):**
```bash
cd packages/extension
pnpm dev
# Then load unpacked extension from dist/ in Chrome
```

6. **Open the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1

---

## 📦 Database Schema

### Tables
- **users**: User accounts (linked to Supabase)
- **plans**: Subscription plans (Free, Pro, Business)
- **subscriptions**: User subscriptions (Stripe)
- **products**: Saved products from AliExpress/Amazon
- **generated_contents**: AI-generated content
- **api_keys**: API keys for Chrome Extension
- **usage_logs**: Usage tracking and analytics

---

## 🔌 API Endpoints

### Authentication
All endpoints (except `/health` and `/billing/webhook`) require authentication via:
- **JWT Token**: `Authorization: Bearer <token>`
- **API Key**: `X-API-Key: tcg_...`

### User
- `GET /api/v1/me` - Get current user
- `PATCH /api/v1/me` - Update profile

### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product details
- `PATCH /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Content Generation
- `POST /api/v1/generate/full-package` - Generate full content package
- `GET /api/v1/generate/usage` - Get usage stats
- `GET /api/v1/generate/history` - Get generation history
- `GET /api/v1/generate/options` - Get available options

### Plans & Billing
- `GET /api/v1/plans` - List subscription plans
- `POST /api/v1/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/v1/billing/webhook` - Stripe webhook handler
- `GET /api/v1/billing/subscription` - Get subscription info
- `POST /api/v1/billing/cancel` - Cancel subscription
- `POST /api/v1/billing/resume` - Resume subscription

### API Keys
- `GET /api/v1/api-keys` - List API keys
- `POST /api/v1/api-keys` - Create API key
- `PATCH /api/v1/api-keys/:id` - Update API key label
- `POST /api/v1/api-keys/:id/deactivate` - Deactivate API key
- `POST /api/v1/api-keys/:id/reactivate` - Reactivate API key
- `DELETE /api/v1/api-keys/:id` - Delete API key

---

## 🐳 Docker Deployment

### Development (MySQL only)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production (Full stack)
```bash
docker-compose up -d
```

---

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to:
- Railway (Database + Backend + Frontend)
- Supabase (Authentication)
- Stripe (Payments)
- Chrome Web Store (Extension)

---

## 🧪 Testing

### Backend
```bash
cd packages/backend
pnpm test
```

### Frontend
```bash
cd packages/frontend
pnpm test
```

### Extension
```bash
cd packages/extension
pnpm build
# Load unpacked in Chrome and test manually
```

---

## 📝 Scripts

### Root
- `pnpm install` - Install all dependencies
- `pnpm dev` - Start all services in dev mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

### Backend
- `pnpm dev` - Start dev server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema to database
- `pnpm db:seed` - Seed database with initial data
- `pnpm db:studio` - Open Drizzle Studio

### Frontend
- `pnpm dev` - Start dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Extension
- `pnpm dev` - Build in watch mode
- `pnpm build` - Build for production

---

## 🎨 Chrome Extension

### Features
- Extract product data from AliExpress, Amazon, eBay, Etsy, Walmart, Temu, SHEIN
- Save products directly to your dashboard
- Generate content on-the-fly
- Floating button on product pages
- Quick access popup

### Installation
1. Build the extension: `cd packages/extension && pnpm build`
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `packages/extension/dist` folder

### Usage
1. Click extension icon
2. Enter API URL and API Key (from Settings page)
3. Navigate to a product page
4. Click "Fetch Product" or use the floating button
5. Generate content instantly

---

## 🔐 Security

- **Authentication**: Supabase JWT with automatic refresh
- **API Keys**: SHA-256 hashed, shown only once
- **Passwords**: Bcrypt hashed (via Supabase)
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for frontend domain only
- **Helmet**: Security headers enabled
- **Stripe Webhook**: Signature verification

---

## 📊 Analytics

### Usage Tracking
- Monthly generation count per user
- Token usage per generation
- Request time monitoring
- Last used timestamps for API keys

### Metrics
- Total users
- Active subscriptions
- Revenue (via Stripe Dashboard)
- Popular niches and platforms
- Average generation time

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT models
- [Supabase](https://supabase.com/) for authentication
- [Stripe](https://stripe.com/) for payment processing
- [Railway](https://railway.app/) for hosting
- [Drizzle ORM](https://orm.drizzle.team/) for database management

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Email: support@yourdomain.com
- Documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Bulk product import
- [ ] Content scheduling
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] White-label solution
- [ ] API for third-party integrations
- [ ] More AI models (Claude, Gemini, Llama)
- [ ] Video generation with AI
- [ ] Voice-over generation

---

**Built with ❤️ for content creators and dropshippers**

🚀 **[Get Started Now](https://github.com/Tamerb86/Stylora-v2)** | 📚 **[Documentation](./DEPLOYMENT.md)**
