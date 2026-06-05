# نظام التصميم — محتوىAI (داكن / TikTok-ish / عربي RTL)

نظام موحّد مبني على مهارة UI/UX Pro Max (نمط Vibrant & Block-based + Dark Mode)، مطبّق على كل صفحات الواجهة.

## الهوية
- الاتجاه: داكن جريء بطاقة طاقة عالية لصنّاع المحتوى/الدروبشبرز.
- اللغة: عربي RTL افتراضياً (`<html lang="ar" dir="rtl">`).

## الألوان (tailwind.config.js)
- الأساسي (وردي TikTok): primary-500 #fe2c55 (تدرج 50→900).
- اللكنة (سيان TikTok): accent-400 #25f4ee.
- الأسطح الداكنة: surface #0a0a0f، surface-50 #16161f، surface-100 #1c1c26، surface-200 #26262f.
- النص: أبيض/slate-200 للأساسي، slate-400 للثانوي.
- تدرجات: gradient-brand (وردي→برتقالي)، gradient-brand-cyan (وردي→سيان).
- ظلال نيون: shadow-glow-pink، shadow-glow-cyan.

## الخطوط
- العناوين: Cairo (700–900) — عربي عصري جريء.
- النص: Tajawal (300–700).
- تُحمّل من Google Fonts في index.html.

## أصناف المكوّنات (src/styles/index.css)
متاحة عبر كل الصفحات تلقائياً: `.btn-primary` (تدرج + توهّج)، `.btn-outline`، `.btn-ghost`، `.btn-accent`، `.card`، `.card-hover`، `.glass`، `.input`، `.label`، `.badge-*`، `.gradient-text`، `.container-app`.

## التأثيرات والحركة
- بطاقات زجاجية (glassmorphism) للشريط العلوي والمعاينات.
- حركات: fade-in، slide-up، float، pulse-glow (200–500ms).
- احترام prefers-reduced-motion (مُعطّل تلقائياً عند طلب المستخدم).

## إمكانية الوصول (مطبّقة)
- تباين عالٍ (نص أبيض/فاتح على داكن).
- :focus-visible بحلقة سيان واضحة لتنقّل لوحة المفاتيح.
- أيقونات SVG (lucide-react) لا إيموجي.
- استجابة عند 375/768/1024/1440.

## نطاق التطبيق
- صفحة الهبوط: أُعيد بناؤها بالكامل (Hero، كيف يعمل، الميزات، التسعير، الأسئلة، CTA).
- MainLayout/DashboardLayout: شريط زجاجي داكن RTL.
- Login/Register/Forgot/AuthCallback + Dashboard/Product/Billing/Settings: مُحوّلة للثيم الداكن مع الحفاظ على كل المنطق.

## معاينة فعلية
شغّل: `cd packages/frontend && pnpm install && pnpm dev` ثم افتح http://localhost:5173
