import { Link } from 'react-router-dom';
import {
  Sparkles, Zap, Globe, FileText, Hash, MessageSquare,
  Image as ImageIcon, Check, ArrowLeft, Wand2, Link2, Rocket, Star,
} from 'lucide-react';

const features = [
  { icon: FileText, title: 'سكربتات فيديو', desc: 'سكربت 20–30 ثانية جاهز للتصوير مع خطاف قوي وتعليمات مشاهد.' },
  { icon: Zap, title: 'خطافات تُوقف التمرير', desc: '10 خطافات (Hooks) تجذب الانتباه في أول 3 ثوانٍ.' },
  { icon: MessageSquare, title: 'كابشن يبيع', desc: 'وصوف جذّابة تنتهي بدعوة واضحة للإجراء (CTA).' },
  { icon: Hash, title: '20 هاشتاق ذكي', desc: 'مزيج من هاشتاقات النيش والترند لزيادة الوصول.' },
  { icon: ImageIcon, title: 'نص الصورة المصغّرة', desc: 'كلمات قوية للـ thumbnail تُثير الفضول للنقر.' },
  { icon: Globe, title: 'لهجات عربية متعددة', desc: 'فصحى، خليجي، مصري، شامي، مغربي — بنبرة طبيعية لا ترجمة حرفية.' },
];

const steps = [
  { icon: Link2, title: 'الصق رابط المنتج', desc: 'من AliExpress أو Amazon، أو أدخل التفاصيل يدوياً.' },
  { icon: Wand2, title: 'اختر النبرة والمنصة', desc: 'حدّد اللهجة والمنصة والنيش، ودع الذكاء الاصطناعي يعمل.' },
  { icon: Rocket, title: 'انشر وانطلق', desc: 'احصل على حزمة محتوى كاملة جاهزة للنشر في ثوانٍ.' },
];

const plans = [
  { name: 'مجاني', price: '0', period: 'دائماً', features: ['10 توليدات شهرياً', 'كل أنواع المحتوى', 'لهجة عربية واحدة', 'دعم بالبريد'], cta: 'ابدأ مجاناً', highlight: false },
  { name: 'Pro', price: '19', period: '/شهرياً', features: ['100 توليد شهرياً', 'كل اللهجات العربية', 'كل المنصات', 'سجل المحتوى', 'دعم ذو أولوية'], cta: 'اشترك في Pro', highlight: true },
  { name: 'Business', price: '49', period: '/شهرياً', features: ['توليد غير محدود', 'كل ميزات Pro', 'وصول API', 'إضافة المتصفح', 'دعم مخصّص'], cta: 'اشترك في Business', highlight: false },
];

const faqs = [
  { q: 'هل المحتوى بالعربية طبيعي فعلاً؟', a: 'نعم — النظام يكتب بلهجات عربية أصيلة (خليجي، مصري، شامي، مغربي، فصحى) دون ترجمة حرفية من الإنجليزية.' },
  { q: 'ما المنصات المدعومة؟', a: 'TikTok، Instagram Reels وStories، YouTube Shorts، Facebook Reels، Snapchat، X، LinkedIn، Pinterest ومنصات الإعلانات.' },
  { q: 'هل أحتاج بطاقة للبدء؟', a: 'لا. الخطة المجانية تمنحك 10 توليدات شهرياً بدون أي بطاقة.' },
  { q: 'كيف أستخرج منتجاً من المتجر؟', a: 'الصق الرابط مباشرة، أو استخدم إضافة المتصفح لاستخراج بيانات المنتج بنقرة واحدة.' },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid-dark [background-size:32px_32px] opacity-40" aria-hidden="true" />
        <div className="container-app relative pt-10 pb-20 text-center">
          <span className="badge-primary mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 ml-1" /> مدعوم بالذكاء الاصطناعي
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.15] text-white animate-slide-up">
            حوّل أي منتج إلى
            <br />
            <span className="gradient-text">محتوى TikTok فيروسي</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            سكربتات، خطافات، كابشن، وهاشتاقات احترافية بالعربية — في ثوانٍ.
            صُمّم خصيصاً لصنّاع المحتوى والدروبشبرز في العالم العربي.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up">
            <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto">
              ابدأ مجاناً الآن <ArrowLeft className="w-5 h-5" />
            </Link>
            <a href="#how" className="btn-outline btn-lg w-full sm:w-auto">كيف يعمل؟</a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
            <span>يثق به أكثر من 3,000 صانع محتوى</span>
          </div>

          {/* Preview card */}
          <div className="mt-14 max-w-3xl mx-auto glass p-5 sm:p-6 text-right animate-float">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-accent-400" />
              <span className="text-xs text-slate-400 mr-auto">معاينة الإخراج</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-primary-400 font-bold mb-1"><FileText className="w-4 h-4" /> الخطاف</div>
                <p className="text-slate-300">"توقّف! هذا المنتج غيّر روتيني تماماً خلال أسبوع…"</p>
              </div>
              <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-accent-400 font-bold mb-1"><Hash className="w-4 h-4" /> الهاشتاقات</div>
                <p className="text-slate-300">#تيك_توك #ترند #منتجات #دروبشيبينغ #فايرال</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container-app py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">ثلاث خطوات فقط</h2>
          <p className="mt-3 text-slate-400">من رابط المنتج إلى محتوى جاهز للنشر.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="card p-7 relative">
              <span className="absolute top-5 left-5 font-display font-black text-5xl text-white/5">{i + 1}</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-pink mb-4">
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container-app py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">كل ما تحتاجه لمحتوى ناجح</h2>
          <p className="mt-3 text-slate-400">حزمة محتوى متكاملة من إدخال واحد.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card-hover p-6">
              <div className="w-11 h-11 rounded-xl bg-accent-400/15 border border-accent-400/30 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent-300" />
              </div>
              <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container-app py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">أسعار بسيطة وشفافة</h2>
          <p className="mt-3 text-slate-400">ابدأ مجاناً، وارتقِ عندما تكبر.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <div key={i} className={`card p-7 flex flex-col ${p.highlight ? 'ring-2 ring-primary-500 shadow-glow-pink relative' : ''}`}>
              {p.highlight && (
                <span className="absolute -top-3 right-6 badge-primary !bg-primary-500 !text-white">الأكثر شيوعاً</span>
              )}
              <h3 className="font-display font-bold text-xl text-white">{p.name}</h3>
              <div className="mt-4 mb-6">
                <span className="font-display font-black text-4xl text-white">${p.price}</span>
                <span className="text-slate-400 text-sm"> {p.period}</span>
              </div>
              <ul className="space-y-3 mb-7 flex-1">
                {p.features.map((ft, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-accent-300 shrink-0" /> {ft}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={p.highlight ? 'btn-primary w-full' : 'btn-outline w-full'}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-app py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">أسئلة شائعة</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="card p-5 group">
              <summary className="flex items-center justify-between cursor-pointer list-none font-display font-bold text-white">
                {f.q}
                <span className="text-accent-300 transition-transform group-open:rotate-45 text-2xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-app pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-grid-dark [background-size:28px_28px] opacity-20" aria-hidden="true" />
          <h2 className="relative font-display font-black text-3xl sm:text-4xl text-white">جاهز لصناعة محتوى يتصدّر؟</h2>
          <p className="relative mt-3 text-white/90 max-w-xl mx-auto">انضم لآلاف صنّاع المحتوى وابدأ مجاناً اليوم — بدون بطاقة.</p>
          <Link to="/register" className="relative inline-flex mt-7 btn bg-white text-primary-600 hover:bg-white/90 btn-lg">
            ابدأ مجاناً الآن <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
