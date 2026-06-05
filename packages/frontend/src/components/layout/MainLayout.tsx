import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { href: '#features', label: 'الميزات' },
  { href: '#how', label: 'كيف يعمل' },
  { href: '#pricing', label: 'الأسعار' },
  { href: '#faq', label: 'الأسئلة' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow-pink">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className="font-display font-extrabold text-xl text-white">
        محتوى<span className="gradient-text">AI</span>
      </span>
    </Link>
  );
}

export default function MainLayout() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-3 inset-x-3 z-50">
        <nav className="container-app glass !rounded-2xl">
          <div className="flex justify-between items-center h-14 px-2">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="text-sm text-slate-300 hover:text-white transition-colors">
                  {n.label}
                </a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link to="/app" className="btn-primary">لوحة التحكم</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">تسجيل الدخول</Link>
                  <Link to="/register" className="btn-primary">ابدأ مجاناً</Link>
                </>
              )}
            </div>
            <button
              className="md:hidden p-2 text-slate-200 cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label="القائمة"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {open && (
            <div className="md:hidden border-t border-white/10 px-2 py-4 space-y-3 animate-slide-up">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white">
                  {n.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10 grid gap-2">
                {user ? (
                  <Link to="/app" className="btn-primary w-full" onClick={() => setOpen(false)}>لوحة التحكم</Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-outline w-full" onClick={() => setOpen(false)}>تسجيل الدخول</Link>
                    <Link to="/register" className="btn-primary w-full" onClick={() => setOpen(false)}>ابدأ مجاناً</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="pt-24">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 mt-24 py-12">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo />
              <p className="text-sm text-slate-400 max-w-md mt-4 leading-relaxed">
                توليد محتوى فيروسي بالذكاء الاصطناعي لـ TikTok وReels وأكثر — سكربتات وخطافات وكابشن وهاشتاقات بالعربية في ثوانٍ.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-white mb-4">المنتج</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">الميزات</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">الأسعار</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-white mb-4">قانوني</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">شروط الاستخدام</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-center text-slate-500">
            © {new Date().getFullYear()} محتوىAI — جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
