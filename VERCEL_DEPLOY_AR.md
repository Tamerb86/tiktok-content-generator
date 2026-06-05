# نشر الواجهة على Vercel — خطوات سريعة

المشروع جاهز (vercel.json مضبوط: إطار Vite + توجيه SPA). اختر إحدى الطريقتين.

## الطريقة الأسهل: استيراد عبر لوحة Vercel
1. ارفع الكود إلى مستودع GitHub (أو استخدم الطريقة الثانية بالـ CLI).
2. في Vercel: Add New… → Project → استورد المستودع.
3. مهم جداً — اضبط **Root Directory** = `packages/frontend`
   (Vercel سيكتشف Vite تلقائياً: Build = `npm run build`، Output = `dist`).
4. أضف متغيرات البيئة (Settings → Environment Variables):
   - `VITE_API_URL` = `https://<backend-domain>/api/v1`  (مؤقتاً اتركه فارغاً أو ضع `/api/v1` لحين نشر الـ backend)
   - `VITE_SUPABASE_URL` = رابط مشروع Supabase
   - `VITE_SUPABASE_ANON_KEY` = مفتاح anon من Supabase
   - `VITE_STRIPE_PUBLISHABLE_KEY` = مفتاح Stripe العام (اختياري الآن)
5. Deploy. ستظهر صفحة الهبوط مباشرةً (تعمل حتى قبل ضبط المفاتيح؛ تسجيل الدخول يحتاج Supabase).

## الطريقة الثانية: عبر Vercel CLI من جهازك
```bash
npm i -g vercel
cd packages/frontend
vercel            # أول مرة: ينشئ المشروع ويربطه (أجب: Root = . لأنك داخل المجلد)
vercel --prod     # نشر للإنتاج
```
ثم أضف متغيرات البيئة من لوحة Vercel وأعد النشر.

## ملاحظات
- الـ backend لا يُنشر على Vercel (يحتاج MySQL واتصالاً دائماً) — انشره على Railway (راجع DEPLOY_AR.md) ثم ضع رابطه في `VITE_API_URL` وأعد نشر الواجهة.
- بعد النشر، أرسل لي رابط مشروع Vercel أو اسمه — أستطيع عبر الاتصال المتصل قراءة حالة النشر وسجلات البناء وتشخيص أي خطأ.
