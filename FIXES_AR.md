# سجل الإصلاحات — Backend

تاريخ المراجعة: 2026-06-05. النتيجة: الـ backend يُترجم الآن بنجاح عبر tsc (0 أخطاء)، بعد أن كان لا يُترجم إطلاقاً.

## الأخطاء الحرجة التي أُصلحت

1. انشقاق نوع المعرّفات (number ↔ UUID): المخطط يستخدم UUID نصي بينما كانت الخدمات والمصادقة تستخدم number. وُحِّدت على string في auth/user/apikey/usage/content/stripe services.
2. لا مولّد UUID افتراضي: أُضيف $defaultFn(() => randomUUID()) لكل مفتاح أساسي في schema.ts.
3. $returningId() غير موجود في drizzle 0.29.3: استُبدل بتوليد UUID صريح (uuidv4) قبل الإدراج في user/apikey/content.
4. استدعاء دالة غير موجودة: productService.getById → getProductByIdForUser في content.service.
5. AuthenticatedRequest غير مُصدَّر: أُضيف تصديره في auth.ts.
6. 'full_package' خارج enum: أُضيف في schema.ts وdb/types.ts.
7. التحقق يرفض المعرّفات: generate.routes وapikey.routes من z.number()/parseInt إلى تحقق UUID.
8. ترميز JSON مزدوج: عمود inputParams (json) يُخزَّن ككائن مباشرة، والقراءة لا تُحلِّله مجدداً.
9. دوال الاستجابة المفقودة: أُضيفت success/error/validationError/successResponse/errorResponse إلى utils/response.ts.
10. rowsAffected خاطئ: mysql2 يستخدم result[0].affectedRows؛ صُحِّح في apikey.service وcontent.service (كان deleteContent يُرجع false دائماً).
11. stripe.webhook يستخدم parseInt(userId) على UUID — أُزيل، مع تحويل planCode لنوع enum.

## إصلاحات بناء أخرى

- إضافة امتداد .js لكل الاستيرادات النسبية (مطلوب مع NodeNext).
- DATABASE_URL المحتمَل أن يكون undefined.
- إزالة استيرادات/معاملات غير مستخدمة (bigint, Platform, users, and, req/next).
- توافق null في CreateProductInput مع مخطط zod.
- اسم حزمة الـ backend: backend → @tiktok-generator/backend.
- تخفيف علَمين مفرطَي الصرامة في tsconfig: exactOptionalPropertyTypes وnoUncheckedIndexedAccess.

## ملاحظات بعد الإصلاح

- بعد تغيير المخطط أعد توليد الهجرات: pnpm db:generate ثم pnpm db:migrate.
- لم تُفحَص frontend وextension بعمق؛ التركيز كان على منطق الـ backend الذي كان يمنع التشغيل.
- التوجّه: السوق العربي — عمود اللغة أصبح varchar يدعم لهجات عربية متعددة بدل enum محدود بـ ar/en.

---

# جولة 2 — مطابقة عقد الـ API (الواجهة ↔ الخادم ↔ الإضافة)

أخطاء تشغيلية كانت ستظهر فقط بعد التشغيل (الترجمة تنجح لكن البيانات لا تتطابق). أُصلحت بتوحيد الخادم على camelCase:

- قائمة المنتجات: الخادم كان يرسل `items` والواجهة تقرأ `products` → وُحّد إلى `products`.
- الخطط (`/plans`): كانت snake_case (`monthly_limit_requests`, `is_unlimited`) → camelCase لتطابق نوع Plan.
- الاشتراك (`/billing/subscription`): `has_subscription`, `current_period_*`, `usage` → camelCase (`hasSubscription`, `currentPeriodStart/End`, `currentMonthUsage`...).
- الاستخدام (`/generate/usage`): snake → camelCase + إضافة `isUnlimited` (تحتاجها الإضافة).
- `/me`: يُرجع الآن الحقول المسطّحة (`planCode`, `planName`, `monthlyLimit`) للواجهة + الكائن المتداخل `plan{}` للإضافة معاً.
- معرّفات UUID في الواجهة/الإضافة: حُوّلت من `number` إلى `string` (User, Product, GeneratedContent, Subscription, ApiKey، وحالات SettingsPage).
- `ProductPage` كان يستخدم `parseInt(id)` على UUID (يحوّله NaN ويكسر الصفحة) → يُمرَّر الآن كنص.
- `getProductContents` كان يعيد `{items}` لا مصفوفة → طُبِّع في طبقة الـ api.
- حقول إنشاء المنتج في الواجهة والإضافة: من snake_case إلى camelCase لتطابق مخطط zod في الخادم.

النتيجة النهائية: الحزم الثلاث تُبنى بنجاح (0 أخطاء)، الخادم يُقلع ويردّ، والبيانات متّسقة بين الأطراف.
