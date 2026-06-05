import { useState, useEffect } from 'react';
import type { ExtractedProduct } from '../utils/extractors';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  planCode: string;
}

interface Usage {
  current: number;
  limit: number | null;
  isUnlimited: boolean;
}

interface SiteInfo {
  name: string;
  hasProduct: boolean;
}

interface SavedProduct {
  id: string;
  title: string;
  dashboardUrl: string;
}

// Icons
const LoadingIcon = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

// Language options
const LANGUAGES = [
  { value: 'ar', label: 'العربية' },
  { value: 'ar-eg', label: 'المصرية' },
  { value: 'ar-sa', label: 'السعودية' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
];

// Platform options
const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram-reels', label: 'Instagram Reels' },
  { value: 'youtube-shorts', label: 'YouTube Shorts' },
  { value: 'facebook-reels', label: 'Facebook Reels' },
];

// Tone options
const TONES = [
  { value: 'friendly', label: 'ودود / Friendly' },
  { value: 'professional', label: 'احترافي / Professional' },
  { value: 'urgent', label: 'عاجل / Urgent' },
  { value: 'humorous', label: 'مرح / Humorous' },
];

// Site icons
const SITE_ICONS: Record<string, string> = {
  'AliExpress': '🛒',
  'Amazon': '📦',
  'eBay': '🏷️',
  'Etsy': '🎨',
  'Walmart': '🏪',
  'Temu': '🛍️',
  'SHEIN': '👗',
  'Unknown': '🌐',
};

export default function App() {
  // State
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<Usage>({ current: 0, limit: 10, isUnlimited: false });
  const [site, setSite] = useState<SiteInfo>({ name: 'Unknown', hasProduct: false });
  const [product, setProduct] = useState<ExtractedProduct | null>(null);
  const [savedProduct, setSavedProduct] = useState<SavedProduct | null>(null);
  
  // Form state
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState('ar');
  const [platform, setPlatform] = useState('tiktok');
  const [tone, setTone] = useState('friendly');
  
  // Loading states
  const [loggingIn, setLoggingIn] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);
    try {
      // Check auth status
      const authResult = await sendMessage({ type: 'GET_AUTH_STATUS' });
      
      if (authResult.success && authResult.data?.isLoggedIn) {
        setIsLoggedIn(true);
        setUser(authResult.data.user);
        
        // Get usage
        await refreshUsage();
        
        // Check current tab
        await checkCurrentTab();
      } else {
        // Load saved settings
        const settings = await sendMessage({ type: 'GET_SETTINGS' });
        if (settings.success && settings.data) {
          setApiUrl(settings.data.apiUrl || '');
        }
      }
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshUsage() {
    const result = await sendMessage({ type: 'GET_USAGE' });
    if (result.success && result.data) {
      setUsage({
        current: result.data.currentMonthUsage,
        limit: result.data.monthlyLimit,
        isUnlimited: result.data.isUnlimited,
      });
    }
  }

  async function checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id || !tab.url) return;
      
      const siteResult = await chrome.tabs.sendMessage(tab.id, { type: 'GET_SITE_INFO' });
      
      if (siteResult.success) {
        setSite({
          name: siteResult.data.site,
          hasProduct: siteResult.data.hasProduct,
        });
        
        if (siteResult.data.hasProduct) {
          const productResult = await chrome.tabs.sendMessage(tab.id, { type: 'GET_EXTRACTED_PRODUCT' });
          if (productResult.success && productResult.data) {
            setProduct(productResult.data);
          }
        }
      }
    } catch (err) {
      console.log('Could not communicate with content script');
    }
  }

  async function handleLogin() {
    if (!apiUrl || !apiKey) {
      setError('الرجاء إدخال API URL و API Key');
      return;
    }

    setLoggingIn(true);
    setError(null);

    try {
      // Save API URL
      await sendMessage({ type: 'UPDATE_SETTINGS', payload: { apiUrl } });
      
      // Login with API Key
      const result = await sendMessage({ type: 'LOGIN_WITH_API_KEY', payload: { apiKey } });
      
      if (result.success) {
        setIsLoggedIn(true);
        setUser({
          id: result.data.id,
          email: result.data.email,
          name: result.data.name,
          planCode: result.data.planCode,
        });
        
        await refreshUsage();
        await checkCurrentTab();
        
        setSuccess('تم تسجيل الدخول بنجاح!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setError('فشل تسجيل الدخول. تحقق من البيانات.');
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await sendMessage({ type: 'LOGOUT' });
    setIsLoggedIn(false);
    setUser(null);
    setProduct(null);
    setSavedProduct(null);
  }

  // Fetch product from current page and save to backend
  async function handleFetchProduct() {
    if (!product) return;

    setFetchingProduct(true);
    setError(null);
    setSavedProduct(null);

    try {
      const result = await sendMessage({
        type: 'SAVE_PRODUCT',
        payload: { product },
      });

      if (result.success) {
        const settings = await sendMessage({ type: 'GET_SETTINGS' });
        const webAppUrl = settings.data?.webAppUrl || 'http://localhost:5173';
        
        setSavedProduct({
          id: result.data.id,
          title: result.data.title,
          dashboardUrl: `${webAppUrl}/app/product/${result.data.id}`,
        });
        
        setSuccess(`تم حفظ المنتج بنجاح! (ID: ${result.data.id})`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.error || 'فشل حفظ المنتج');
      }
    } catch (err) {
      setError('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setFetchingProduct(false);
    }
  }

  async function handleGenerate() {
    if (!product) return;

    setGenerating(true);
    setError(null);

    try {
      const result = await sendMessage({
        type: 'QUICK_GENERATE',
        payload: {
          product,
          options: { language, platform, tone },
        },
      });

      if (result.success) {
        await refreshUsage();
        
        const settings = await sendMessage({ type: 'GET_SETTINGS' });
        const webAppUrl = settings.data?.webAppUrl || 'http://localhost:5173';
        
        setSavedProduct({
          id: result.data.product.id,
          title: result.data.product.title,
          dashboardUrl: `${webAppUrl}/app/product/${result.data.product.id}`,
        });
        
        setSuccess('تم توليد المحتوى بنجاح!');
        
        // Open web app to view results
        await sendMessage({ type: 'OPEN_WEBAPP', payload: { path: `/app/product/${result.data.product.id}` } });
      } else {
        setError(result.error || 'فشل التوليد');
      }
    } catch (err) {
      setError('حدث خطأ أثناء التوليد');
    } finally {
      setGenerating(false);
    }
  }

  function sendMessage(message: { type: string; payload?: unknown }): Promise<any> {
    return chrome.runtime.sendMessage(message);
  }

  async function openWebApp(path?: string) {
    await sendMessage({ type: 'OPEN_WEBAPP', payload: { path } });
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('تم النسخ!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('فشل النسخ');
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gradient-to-br from-primary-50 to-white">
        <div className="text-center">
          <LoadingIcon />
          <p className="mt-3 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Login state
  if (!isLoggedIn) {
    return (
      <div className="p-6 bg-gradient-to-br from-primary-50 to-white min-h-[500px]">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
            <SparklesIcon />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TikTok Content Generator</h1>
          <p className="text-gray-500 text-sm mt-1">ولّد محتوى فيروسي لمنتجاتك</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fadeIn">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://your-api.railway.app/api/v1"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <KeyIcon /> API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="tcg_xxxxxxxxxxxxxxxxxxxxxxxx"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              يمكنك الحصول على API Key من الإعدادات في التطبيق
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loggingIn || !apiUrl || !apiKey}
            className="btn btn-primary w-full"
          >
            {loggingIn ? (
              <>
                <LoadingIcon />
                جاري تسجيل الدخول...
              </>
            ) : (
              <>
                <KeyIcon />
                تسجيل الدخول
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={() => openWebApp('/register')}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              ليس لديك حساب؟ سجل الآن
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main state
  return (
    <div className="bg-white min-h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
              {(user?.name || user?.email)?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.name || user?.email?.split('@')[0]}</p>
              <p className="text-xs text-white/80 capitalize">{user?.planCode} Plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="تسجيل الخروج"
          >
            <LogoutIcon />
          </button>
        </div>

        {/* Usage bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>الاستخدام الشهري</span>
            <span>
              {usage.current} / {usage.isUnlimited ? '∞' : usage.limit}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{
                width: usage.isUnlimited
                  ? '100%'
                  : `${Math.min((usage.current / (usage.limit || 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Success/Error messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2 animate-fadeIn">
            <CheckIcon />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fadeIn">
            {error}
          </div>
        )}

        {/* Site info */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{SITE_ICONS[site.name] || '🌐'}</span>
            <span className="font-medium">{site.name}</span>
          </div>
          <span className={`badge ${site.hasProduct ? 'badge-success' : 'badge-warning'}`}>
            {site.hasProduct ? 'منتج متاح' : 'لا يوجد منتج'}
          </span>
        </div>

        {/* Product preview */}
        {product && (
          <div className="card p-4 mb-4 animate-fadeIn">
            <div className="flex gap-3">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                  {product.title}
                </h3>
                <p className="text-primary-600 font-bold mt-1">
                  {product.price} {product.currency}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Saved Product Info */}
        {savedProduct && (
          <div className="card p-4 mb-4 bg-green-50 border-green-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">تم حفظ المنتج</span>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                ID: {savedProduct.id}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openWebApp(`/app/product/${savedProduct.id}`)}
                className="btn btn-primary flex-1 text-sm"
              >
                <ExternalLinkIcon />
                فتح في Dashboard
              </button>
              <button
                onClick={() => copyToClipboard(savedProduct.dashboardUrl)}
                className="btn btn-secondary text-sm"
                title="نسخ الرابط"
              >
                <CopyIcon />
              </button>
            </div>
          </div>
        )}

        {/* Generation form */}
        {product ? (
          <div className="space-y-4">
            {/* Fetch Product Button */}
            {!savedProduct && (
              <button
                onClick={handleFetchProduct}
                disabled={fetchingProduct}
                className="btn btn-secondary w-full"
              >
                {fetchingProduct ? (
                  <>
                    <LoadingIcon />
                    جاري حفظ المنتج...
                  </>
                ) : (
                  <>
                    <DownloadIcon />
                    حفظ المنتج في Dashboard
                  </>
                )}
              </button>
            )}

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">توليد المحتوى</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    اللغة
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input text-sm"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    المنصة
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="input text-sm"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  النبرة
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="input text-sm"
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || (!usage.isUnlimited && usage.current >= (usage.limit || 0))}
                className="btn btn-primary w-full mt-4"
              >
                {generating ? (
                  <>
                    <LoadingIcon />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    توليد المحتوى
                  </>
                )}
              </button>

              {!usage.isUnlimited && usage.current >= (usage.limit || 0) && (
                <p className="text-center text-sm text-red-600 mt-2">
                  لقد استنفدت حصتك الشهرية.{' '}
                  <button
                    onClick={() => openWebApp('/app/billing')}
                    className="text-primary-600 hover:underline"
                  >
                    ترقية الخطة
                  </button>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">لا يوجد منتج</h3>
            <p className="text-gray-500 text-sm mb-4">
              افتح صفحة منتج على AliExpress أو Amazon
            </p>
            <button
              onClick={() => openWebApp('/app')}
              className="btn btn-secondary text-sm"
            >
              <ExternalLinkIcon />
              فتح التطبيق
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 flex justify-center gap-4">
        <button
          onClick={() => openWebApp('/app')}
          className="text-gray-500 hover:text-primary-600 text-sm flex items-center gap-1"
        >
          <ExternalLinkIcon />
          فتح التطبيق
        </button>
        <button
          onClick={() => openWebApp('/app/settings')}
          className="text-gray-500 hover:text-primary-600 text-sm"
        >
          الإعدادات
        </button>
      </div>
    </div>
  );
}
