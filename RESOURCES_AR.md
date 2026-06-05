# قائمة الموارد المطلوبة منك للنشر

كل بند أدناه يوضّح: ما هو، كيف تحصل عليه، وأين يُوضَع. هذه هي الأسرار/الحسابات الوحيدة التي يحتاجها المشروع للعمل في الإنتاج.

## 1) OpenAI (إلزامي — قلب التوليد)
- أنشئ مفتاحاً من https://platform.openai.com/api-keys
- يوضع في الـ backend: `OPENAI_API_KEY=sk-...`
- اختياري: لو استخدمت OpenRouter/Together بدّل: `OPENAI_BASE_URL=https://openrouter.ai/api/v1`
- النموذج الافتراضي gpt-4o-mini (رخيص ومناسب للعربية).

## 2) Supabase (إلزامي — تسجيل الدخول/المصادقة)
- أنشئ مشروعاً مجانياً من https://supabase.com
- من Project Settings → API احصل على:
  - `Project URL` → backend: `SUPABASE_URL` و frontend: `VITE_SUPABASE_URL`
  - `anon public key` → frontend: `VITE_SUPABASE_ANON_KEY`
  - `JWT Secret` (Settings → API → JWT) → backend: `SUPABASE_JWT_SECRET`
- فعّل Email/Password (وأي مزوّد تريده) من Authentication → Providers.

## 3) قاعدة بيانات MySQL (إلزامي)
- الأسهل: Railway → New → Database → MySQL (مجاني للبدء). انسخ `DATABASE_URL`.
- بدائل: PlanetScale، Aiven، أو أي MySQL 8.
- يوضع في الـ backend: `DATABASE_URL=mysql://user:pass@host:3306/dbname`
- محلياً للتجربة: `docker compose -f docker-compose.dev.yml up -d` يشغّل MySQL جاهزة.

## 4) Stripe (للدفع/الاشتراكات)
- حساب من https://stripe.com
- المفاتيح: `STRIPE_SECRET_KEY` (sk_...) و frontend `VITE_STRIPE_PUBLISHABLE_KEY` (pk_...)
- أنشئ منتجين بسعر شهري (Pro و Business) وانسخ معرّفات الأسعar:
  - `STRIPE_PRICE_ID_PRO` و `STRIPE_PRICE_ID_BUSINESS`
- أنشئ Webhook يشير إلى: `https://<backend-domain>/api/v1/stripe/webhook` وانسخ `STRIPE_WEBHOOK_SECRET` (whsec_...)
- ملاحظة: يمكن إطلاق المنتج بدون Stripe أولاً (الخطة المجانية تعمل)، وتفعيله لاحقاً.

## 5) استضافة (نوصي)
- Backend + MySQL: Railway (أبسط خيار، يدعم Node و MySQL معاً).
- Frontend: Vercel أو Netlify (مجاني، مثالي لـ Vite/React).
- بديل الكل-في-واحد: أي خادم فيه Docker عبر `docker-compose.yml`.

## أين تضع المتغيرات (ملخص)
- backend (Railway Variables): DATABASE_URL، SUPABASE_URL، SUPABASE_JWT_SECRET، OPENAI_API_KEY، STRIPE_SECRET_KEY، STRIPE_WEBHOOK_SECRET، STRIPE_PRICE_ID_PRO، STRIPE_PRICE_ID_BUSINESS، FRONTEND_URL، NODE_ENV=production، PORT.
- frontend (Vercel Env): VITE_API_URL=https://<backend-domain>/api/v1، VITE_SUPABASE_URL، VITE_SUPABASE_ANON_KEY، VITE_STRIPE_PUBLISHABLE_KEY.
- extension: بعد النشر، حدّث رابط الـ API الافتراضي في إعدادات الإضافة إلى backend الإنتاجي.

## الحد الأدنى لإطلاق MVP بسرعة
يكفيك أولاً: OpenAI + Supabase + MySQL. (Stripe يُضاف لاحقاً.)
