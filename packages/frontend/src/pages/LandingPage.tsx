import { Link } from 'react-router-dom';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import SmokeyCursor from '@/components/ui/smokey-cursor-effect';
import {
  Sparkles, Zap, Globe, FileText, Hash, MessageSquare,
  Check, ArrowLeft, Wand2, Link2, Rocket, Star, Video, Mic2, Clapperboard, X,
} from 'lucide-react';

const videoFeatures = [
  {
    icon: Clapperboard,
    title: 'فيديو UGC بمقدّم يتكلم',
    desc: 'مقدّم بالذكاء الاصطناعي ينطق سكريبتك بالعربية بمزامنة شفاه، مع صورة منتجك وكلمات على الشاشة — جاهز للنشر 9:16.',
    tag: 'الأكثر طلباً',
  },
  {
    icon: Video,
    title: 'لقطات منتج سينمائية',
    desc: 'حوّل صورة منتجك الثابتة إلى لقطة فيديو متحركة بكاميرا تدور حوله — بجودة Google Veo أو خيار اقتصادي أسرع.',
    tag: null,
  },
  {
    icon: Mic2,
    title: 'تعليق صوتي عربي طبيعي',
    desc: 'معاينة حيّة بأسلوب TikTok مع صوت عربي حقيقي يقرأ الهوكات — وصدّرها فيديو من متصفحك مجاناً.',
    tag: null,
  },
];

const features = [
  { icon: FileText, title: 'سكربتات فيديو', desc: 'سكربت 20–30 ثانية جاهز للتصوير مع خطاف قوي وتعليمات مشاهد.' },
  { icon: Zap, title: 'خطافات تُوقف التمرير', desc: '10 خطافات (Hooks) تجذب الانتباه في أول 3 ثوانٍ.' },
  { icon: MessageSquare, title: 'كابشن يبيع', desc: 'وصوف جذّابة تنتهي بدعوة واضحة للإجراء (CTA).' },
  { icon: Hash, title: '20 هاشتاق ذكي', desc: 'مزيج من هاشتاقات النيش والترند لزيادة الوصول.' },
  { icon: Link2, title: 'استيراد من رابط المنتج', desc: 'الصق رابط المنتج وتُسحب الصورة والعنوان تلقائياً.' },
  { icon: Globe, title: 'لهجات عربية متعددة', desc: 'فصحى، خليجي، مصري، شامي، مغربي — بنبرة طبيعية لا ترجمة حرفية.' },
];

const steps = [
  { icon: Link2, title: 'الصق رابط المنتج', desc: 'من AliExpress أو Amazon، أو أدخل التفاصيل يدوياً.' },
  { icon: Wand2, title: 'ولّد المحتوى', desc: 'سكريبت وهوكات وهاشتاقات بلهجتك — في ثوانٍ.' },
  { icon: Rocket, title: 'اضغط زر الفيديو', desc: 'فيديو UGC بمقدّم يتكلم أو لقطة سينمائية — خلال دقائق، نزّله وانشره.' },
];

const compare = [
  { label: 'سعر الفيديو الواحد', human: '150 – 815 ريال', us: 'يبدأ من ريالات قليلة', good: true },
  { label: 'مدة التسليم', human: '3 – 7 أيام', us: '2 – 6 دقائق', good: true },
  { label: 'التعديلات', human: 'محدودة وبرسوم إضافية', us: 'أعد التوليد بضغطة زر', good: true },
  { label: 'لهجات عربية', human: 'حسب توفر صانع المحتوى', us: '6 لهجات في أي وقت', good: true },
  { label: 'حقوق الاستخدام الإعلاني', human: '+30% رسوم إضافية', us: 'مشمولة', good: true },
];

const plans = [
  {
    name: 'مجاني',
    price: '0',
    period: 'دائماً',
    features: ['فيديوهان AI/UGC تجربة', '10 توليدات محتوى شهرياً', 'كل أنواع المحتوى النصي', 'معاينة حيّة + تصدير من المتصفح'],
    cta: 'جرّب مجاناً — بدون بطاقة',
    highlight: false,
  },
  {
    name: 'احترافية',
    price: '299',
    period: 'ر.س/شهرياً',
    features: ['40 فيديو AI/UGC شهرياً', 'توليدات محتوى غير محدودة', 'كل اللهجات وكل المنصات', 'فيديو فاخر بجودة Veo', 'دعم ذو أولوية'],
    cta: 'اشترك في الاحترافية',
    highlight: true,
  },
  {
    name: 'متاجر ووكالات',
    price: '799',
    period: 'ر.س/شهرياً',
    features: ['120 فيديو AI/UGC شهرياً', 'كل ميزات الاحترافية', 'استخدام تجاري وإعلاني كامل', 'وصول API', 'دعم مخصّص'],
    cta: 'اشترك للأعمال',
    highlight: false,
  },
];

const faqs = [
  { q: 'كيف يبدو فيديو UGC الذي تولّدونه؟', a: 'فيديو عمودي 9:16 بمقدّم واقعي بالذكاء الاصطناعي يتحدث العربية بمزامنة شفاه، مع لقطات قريبة لمنتجك وترجمة نصية على الشاشة — بنفس أسلوب فيديوهات UGC التي تتصدر TikTok.' },
  { q: 'كم يوفّر مقارنة بصانع محتوى بشري؟', a: 'فيديو UGC البشري في السوق العربي يكلّف 150–815 ريالاً ويستغرق أياماً. هنا تحصل عليه خلال دقائق وبجزء بسيط من التكلفة، مع تعديلات غير محدودة.' },
  { q: 'هل أحتاج بطاقة للبدء؟', a: 'لا. الخطة المجانية تمنحك فيديوهين تجريبيين و10 توليدات محتوى شهرياً بدون أي بطاقة.' },
  { q: 'هل المحتوى بالعربية طبيعي فعلاً؟', a: 'نعم — النظام يكتب وينطق بلهجات عربية أصيلة (خليجي، مصري، شامي، مغربي، فصحى) دون ترجمة حرفية.' },
  { q: 'ما المنصات المدعومة؟', a: 'TikTok، Instagram Reels، YouTube Shorts، Snapchat، Facebook Reels ومنصات الإعلانات — الفيديو يخرج 9:16 جاهزاً لها جميعاً.' },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <SmokeyCursor />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <WebGLShader className="absolute inset-0 w-full h-full block opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0b12]" />
        </div>
        <div className="absolute inset-0 bg-grid-dark [background-size:32px_32px] opacity-40" aria-hidden="true" />
        <div className="aurora-blob w-[440px] h-[440px] bg-primary-500 -top-24 -right-28" aria-hidden="true" />
        <div className="aurora-blob w-[400px] h-[400px] bg-purple-600 top-44 -left-28" style={{ animationDelay: '-5s' }} aria-hidden="true" />
        <div className="aurora-blob w-[320px] h-[320px] bg-accent-400 bottom-0 right-1/3" style={{ animationDelay: '-10s' }} aria-hidden="true" />
        <div className="container-app relative pt-10 pb-20 text-center">
          <span className="badge-primary mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 ml-1" /> جديد: فيديو UGC بمقدّم AI يتكلم العربية
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.15] text-white animate-slide-up">
            فيديو <span className="gradient-text">UGC جاهز للنشر</span>
            <br />
            خلال دقائق، لا أيام
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            الصق رابط منتجك واحصل على فيديو بمقدّم يتكلم العربية + سكريبت وهوكات وهاشتاقات —
            بدل <span className="text-white font-bold">815 ريالاً وأسبوع انتظار</span> لصانع محتوى بشري.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up">
            <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto">
              ولّد أول فيديو مجاناً <ArrowLeft className="w-5 h-5" />
            </Link>
            <LiquidButton
              size="xl"
              className="rounded-full w-full sm:w-auto font-semibold"
              onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}
            >
              قارن بالسعر البشري
            </LiquidButton>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
            <span>فيديوهان مجانيان عند التسجيل — بدون بطاقة</span>
          </div>

          {/* Stats glass bar */}
          <div className="mt-10 grid grid-cols-3 max-w-xl mx-auto glass overflow-hidden animate-slide-up">
            {[
              ['دقائق', 'زمن التسليم'],
              ['10×', 'أوفر من البشري'],
              ['6', 'لهجات عربية'],
            ].map(([num, label], i) => (
              <div key={i} className={`py-4 px-2 text-center ${i > 0 ? 'border-r border-white/10' : ''}`}>
                <div className="font-display font-black text-2xl gradient-text">{num}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* UGC mock preview */}
          <div className="mt-14 max-w-3xl mx-auto glass p-5 sm:p-6 text-right animate-float">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-accent-400" />
              <span className="text-xs text-slate-400 mr-auto">ما الذي ستحصل عليه</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-primary-400 font-bold mb-1"><Clapperboard className="w-4 h-4" /> فيديو UGC</div>
                <p className="text-slate-300">مقدّم يتكلم العربية + منتجك + كلمات على الشاشة، 9:16</p>
              </div>
              <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-accent-400 font-bold mb-1"><FileText className="w-4 h-4" /> الخطاف</div>
                <p className="text-slate-300">"توقّف! هذا المنتج غيّر روتيني تماماً…"</p>
              </div>
              <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-1.5 text-accent-400 font-bold mb-1"><Hash className="w-4 h-4" /> الهاشتاقات</div>
                <p className="text-slate-300">#تيك_توك #ترند #دروبشيبينغ #فايرال</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="relative border-y border-white/10 bg-white/[0.02] py-3.5 overflow-hidden" dir="ltr">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm text-slate-300">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10" aria-hidden={k === 1}>
              {[
                '🎤 مقدّم يتكلم العربية',
                '⚡ تسليم خلال دقائق',
                '💸 أوفر 10× من UGC البشري',
                '📱 9:16 جاهز للنشر',
                '🗣 6 لهجات عربية',
                '🎬 بجودة Google Veo',
                '✍️ كلمات على الشاشة',
              ].map((x, i) => (
                <span key={i} className="flex items-center gap-2.5">
                  <span className="text-primary-500 text-[10px]">◆</span>
                  {x}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* VIDEO FEATURES */}
      <section className="container-app py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">ثلاثة أنواع فيديو من إدخال واحد</h2>
          <p className="mt-3 text-slate-400">لا تحتاج كاميرا ولا مونتاج ولا صانع محتوى.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {videoFeatures.map((f, i) => (
            <div
              key={i}
              className={`rounded-2xl p-px transition-transform duration-200 hover:-translate-y-1 ${
                i === 0
                  ? 'bg-gradient-to-br from-primary-500 via-purple-500/70 to-accent-400/60 shadow-glow-pink'
                  : 'bg-gradient-to-br from-white/15 via-white/5 to-white/10'
              }`}
            >
              <div className="relative h-full rounded-2xl bg-[#0d0d14] p-7">
                {f.tag && (
                  <span className="absolute -top-3 right-6 badge-primary !bg-primary-500 !text-white">{f.tag}</span>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-pink mb-4">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARE vs HUMAN UGC */}
      <section id="compare" className="container-app py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            مقابل صانع محتوى بشري؟ <span className="gradient-text">لا مقارنة</span>
          </h2>
          <p className="mt-3 text-slate-400">أسعار السوق السعودي الفعلية لفيديو UGC واحد.</p>
        </div>
        <div className="max-w-3xl mx-auto card overflow-hidden">
          <div className="grid grid-cols-3 text-sm font-bold text-white bg-surface-100 border-b border-white/10">
            <div className="p-4"></div>
            <div className="p-4 text-center text-slate-400">صانع محتوى بشري</div>
            <div className="p-4 text-center text-primary-400">منصتنا</div>
          </div>
          {compare.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 text-sm items-center ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
              <div className="p-4 text-slate-300 font-medium">{row.label}</div>
              <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-1.5">
                <X className="w-3.5 h-3.5 text-red-400 shrink-0" /> {row.human}
              </div>
              <div className="p-4 text-center text-white flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-accent-300 shrink-0" /> {row.us}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container-app py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">ثلاث خطوات فقط</h2>
          <p className="mt-3 text-slate-400">من رابط المنتج إلى فيديو جاهز للنشر.</p>
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

      {/* CONTENT FEATURES */}
      <section id="features" className="container-app py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">ومعها حزمة محتوى متكاملة</h2>
          <p className="mt-3 text-slate-400">كل ما يحتاجه المنشور الناجح، من إدخال واحد.</p>
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
          <p className="mt-3 text-slate-400">فيديو UGC واحد من صانع محتوى يساوي اشتراك شهر كامل هنا.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <div key={i} className={`card p-7 flex flex-col ${p.highlight ? 'ring-2 ring-primary-500 shadow-glow-pink relative' : ''}`}>
              {p.highlight && (
                <span className="absolute -top-3 right-6 badge-primary !bg-primary-500 !text-white">الأكثر شيوعاً</span>
              )}
              <h3 className="font-display font-bold text-xl text-white">{p.name}</h3>
              <div className="mt-4 mb-6">
                <span className="font-display font-black text-4xl text-white">{p.price}</span>
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
          <h2 className="relative font-display font-black text-3xl sm:text-4xl text-white">أول فيديو UGC لك مجاني</h2>
          <p className="relative mt-3 text-white/90 max-w-xl mx-auto">
            سجّل الآن وولّد فيديو بمقدّم يتكلم العربية خلال دقائق — بدون بطاقة وبدون التزام.
          </p>
          <Link to="/register" className="relative inline-flex mt-7 btn bg-white text-primary-600 hover:bg-white/90 btn-lg">
            ولّد فيديوك المجاني الآن <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
