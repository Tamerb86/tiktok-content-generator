# دليل النشر للإنتاج

تم التحقق: الـ backend والـ frontend والـ extension تُبنى جميعاً بنجاح (0 أخطاء)، والخادم يُقلع ويخدم الطلبات، والمخطط يولّد هجرات صحيحة. تبقّى توصيل الموارد (راجع RESOURCES_AR.md).

## المسار الموصى به: Railway (backend+MySQL) + Vercel (frontend)

### أ) قاعدة البيانات
1. Railway → أنشئ MySQL، انسخ DATABASE_URL.

### ب) الـ Backend على Railway
1. New Project → Deploy from repo → اختر مجلد `packages/backend`.
2. ضع متغيرات البيئة (من RESOURCES_AR.md).
3. أمر البناء: `pnpm install --no-frozen-lockfile && pnpm build`
4. أمر التشغيل: `pnpm start:prod`  ← يطبّق الهجرات + يزرع الخطط ثم يُقلع الخادم.
   - (أو يدوياً مرة واحدة: `pnpm db:migrate && pnpm db:seed`، ثم التشغيل `pnpm start`.)
5. بعد النشر تحقق: `GET https://<backend>/api/v1/health` يجب أن يعيد healthy.

### ج) الـ Frontend على Vercel
1. New Project → Root Directory = `packages/frontend`.
2. Framework: Vite. Build: `pnpm build`. Output: `dist`.
3. متغيرات البيئة: VITE_API_URL=https://<backend>/api/v1، VITE_SUPABASE_URL، VITE_SUPABASE_ANON_KEY، VITE_STRIPE_PUBLISHABLE_KEY.
4. بعد النشر، حدّث `FRONTEND_URL` في الـ backend إلى دومين Vercel (لأجل CORS وroredirect الدفع).

### د) Stripe Webhook
- وجّه Webhook إلى `https://<backend>/api/v1/stripe/webhook`، وضع `STRIPE_WEBHOOK_SECRET`.

### هـ) الإضافة (Chrome Extension)
1. `cd packages/extension && pnpm install && pnpm build` → ينتج مجلد `dist/`.
2. chrome://extensions → Developer mode → Load unpacked → اختر `dist`.
3. من إعدادات الإضافة، اضبط رابط الـ API على backend الإنتاجي.
4. للنشر على متجر Chrome: ارفع محتوى `dist` كملف zip.

## بديل: الكل عبر Docker (خادم واحد)
1. أنشئ ملف `.env` في الجذر بقيم RESOURCES_AR.md (MYSQL_*، SUPABASE_*، OPENAI_*، STRIPE_*، VITE_*).
2. `docker compose up -d --build`
3. أول مرة فقط، طبّق الهجرات والزرع:
   `docker compose exec backend node dist/db/migrate.js && docker compose exec backend node dist/db/seed.js`
4. الواجهة على المنفذ 80، والـ API على 3000.

## تشغيل محلي كامل (للتجربة قبل النشر)
1. `docker compose -f docker-compose.dev.yml up -d`  (MySQL محلية)
2. backend: انسخ `.env.example`→`.env` واملأه، ثم `pnpm db:migrate && pnpm db:seed && pnpm dev`
3. frontend: انسخ `.env.example`→`.env`، ثم `pnpm dev` (http://localhost:5173)

## ملاحظات مهمة
- اللغة: عمود اللغة يدعم لهجات عربية متعددة (ar, ar-eg, ar-sa, ar-ae, ar-ma, ar-lv).
- الخطط الافتراضية تُزرع تلقائياً: free=10، pro=100، business=غير محدود طلباً شهرياً.
- لم تُضمَّن lockfiles؛ النشر يستخدم `--no-frozen-lockfile` (مضبوط في Dockerfiles).
