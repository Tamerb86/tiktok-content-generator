import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { ProductWithContent, GeneratedContent } from '../types';
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Trash2,
  Edit,
  Package,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Lightbulb,
  MessageSquare,
  Hash,
  Image,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Language options
const LANGUAGES = [
  { value: 'ar', label: 'العربية الفصحى' },
  { value: 'ar-eg', label: 'المصرية' },
  { value: 'ar-sa', label: 'السعودية' },
  { value: 'ar-ae', label: 'الإماراتية' },
  { value: 'ar-ma', label: 'المغربية' },
  { value: 'ar-lv', label: 'الشامية' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'tr', label: 'Türkçe' },
];

// Platform options
const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram-reels', label: 'Instagram Reels' },
  { value: 'instagram-stories', label: 'Instagram Stories' },
  { value: 'youtube-shorts', label: 'YouTube Shorts' },
  { value: 'facebook-reels', label: 'Facebook Reels' },
  { value: 'snapchat', label: 'Snapchat' },
];

// Tone options
const TONES = [
  { value: 'friendly', label: 'ودود' },
  { value: 'professional', label: 'احترافي' },
  { value: 'urgent', label: 'عاجل' },
  { value: 'humorous', label: 'مرح' },
  { value: 'persuasive', label: 'مقنع' },
  { value: 'emotional', label: 'عاطفي' },
  { value: 'casual', label: 'عفوي' },
  { value: 'inspirational', label: 'ملهم' },
];

// Niche options
const NICHES = [
  { value: 'fashion', label: 'أزياء' },
  { value: 'beauty', label: 'تجميل' },
  { value: 'electronics', label: 'إلكترونيات' },
  { value: 'home', label: 'منزل' },
  { value: 'fitness', label: 'لياقة' },
  { value: 'health', label: 'صحة' },
  { value: 'food', label: 'طعام' },
  { value: 'general', label: 'عام' },
];

// Copy button component
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label ? `تم نسخ ${label}` : 'تم النسخ');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('فشل النسخ');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-sm text-slate-300 hover:text-primary-400 hover:bg-primary-50 rounded transition-colors"
      title="نسخ"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-green-500">تم</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>نسخ</span>
        </>
      )}
    </button>
  );
}

// Content section component
function ContentSection({
  title,
  icon: Icon,
  children,
  copyText,
  defaultExpanded = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  copyText?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-surface cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-400" />
          <h3 className="font-medium text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {copyText && (
            <div onClick={(e) => e.stopPropagation()}>
              <CopyButton text={copyText} label={title} />
            </div>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </div>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}

// Regenerate Modal
function RegenerateModal({
  isOpen,
  onClose,
  onGenerate,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: {
    language: string;
    platform: string;
    tone: string;
    niche: string;
  }) => void;
  loading: boolean;
}) {
  const [language, setLanguage] = useState('ar');
  const [platform, setPlatform] = useState('tiktok');
  const [tone, setTone] = useState('friendly');
  const [niche, setNiche] = useState('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface-50 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          إعادة توليد المحتوى
        </h2>

        <div className="space-y-4">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              اللغة
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              المنصة
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="input"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              النبرة
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Niche */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              المجال
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="input"
            >
              {NICHES.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">
            إلغاء
          </button>
          <button
            onClick={() => onGenerate({ language, platform, tone, niche })}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                جاري التوليد...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                توليد
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Parse content from JSON string
function parseContent(output: string): {
  script?: string;
  angles?: string[];
  hooks?: string[];
  captions?: string[];
  hashtags?: string[];
  thumbnailText?: string[];
} | null {
  try {
    return JSON.parse(output);
  } catch {
    return null;
  }
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [contentHistory, setContentHistory] = useState<GeneratedContent[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        const response = await api.getProduct(id);
        if (response.success && response.data) {
          setProduct(response.data);
        }
      } catch (error) {
        toast.error('فشل تحميل المنتج');
        navigate('/app');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, navigate]);

  // Fetch content history
  useEffect(() => {
    async function fetchContentHistory() {
      if (!id) return;

      try {
        const response = await api.getProductContents(id);
        if (response.success && response.data) {
          setContentHistory(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch content history:', error);
      }
    }

    fetchContentHistory();
  }, [id]);

  const handleDelete = async () => {
    if (!product) return;

    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    setDeleting(true);
    try {
      await api.deleteProduct(product.id);
      toast.success('تم حذف المنتج');
      navigate('/app');
    } catch (error) {
      toast.error('فشل حذف المنتج');
    } finally {
      setDeleting(false);
    }
  };

  const handleRegenerate = async (options: {
    language: string;
    platform: string;
    tone: string;
    niche: string;
  }) => {
    if (!product) return;

    setRegenerating(true);
    try {
      const response = await api.generateContent({
        product_id: product.id,
        language: options.language,
        platform: options.platform,
        tone: options.tone,
        niche: options.niche,
      });

      if (response.success && response.data) {
        toast.success('تم توليد المحتوى بنجاح!');
        setShowRegenerateModal(false);

        // Refresh product data
        const productResponse = await api.getProduct(product.id);
        if (productResponse.success && productResponse.data) {
          setProduct(productResponse.data);
        }

        // Refresh content history
        const historyResponse = await api.getProductContents(product.id);
        if (historyResponse.success && historyResponse.data) {
          setContentHistory(historyResponse.data);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل توليد المحتوى');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          المنتج غير موجود
        </h2>
        <button onClick={() => navigate('/app')} className="btn-primary">
          العودة للوحة التحكم
        </button>
      </div>
    );
  }

  // Parse latest content
  const latestContent = product.latestContent
    ? parseContent(product.latestContent.output)
    : null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/app')}
          className="p-2 text-slate-500 hover:text-slate-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{product.title}</h1>
          <p className="text-slate-400 text-sm">
            أُضيف في {new Date(product.createdAt).toLocaleDateString('ar')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRegenerateModal(true)}
            className="btn-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة التوليد
          </button>
          <button className="btn-outline">
            <Edit className="w-4 h-4 mr-1" />
            تعديل
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1" />
                حذف
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details Card */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">معلومات المنتج</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-sm text-slate-400">العنوان</label>
            <p className="text-white font-medium">{product.title}</p>
          </div>

          {product.priceRaw && (
            <div>
              <label className="text-sm text-slate-400">السعر</label>
              <p className="text-white font-medium">
                {product.priceRaw} {product.currency}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm text-slate-400">المصدر</label>
            <p className="text-white capitalize">{product.source}</p>
          </div>

          {product.sourceUrl && (
            <div>
              <label className="text-sm text-slate-400">رابط المصدر</label>
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                فتح الرابط <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {product.rawDescription && (
          <div className="mt-6">
            <label className="text-sm text-slate-400">الوصف</label>
            <p className="text-slate-200 mt-1 whitespace-pre-wrap line-clamp-4">
              {product.rawDescription}
            </p>
          </div>
        )}
      </div>

      {/* Generated Content */}
      {latestContent ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              المحتوى المُولَّد
            </h2>
            {product.latestContent && (
              <span className="text-sm text-slate-400">
                آخر توليد:{' '}
                {new Date(product.latestContent.createdAt).toLocaleString('ar')}
              </span>
            )}
          </div>

          {/* Script */}
          {latestContent.script && (
            <ContentSection
              title="السكربت"
              icon={FileText}
              copyText={latestContent.script}
            >
              <div className="bg-surface rounded-lg p-4 whitespace-pre-wrap text-slate-200 leading-relaxed">
                {latestContent.script}
              </div>
            </ContentSection>
          )}

          {/* Hooks */}
          {latestContent.hooks && latestContent.hooks.length > 0 && (
            <ContentSection
              title={`الخطافات (${latestContent.hooks.length})`}
              icon={Lightbulb}
              copyText={latestContent.hooks.join('\n')}
            >
              <div className="space-y-2">
                {latestContent.hooks.map((hook, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-surface rounded-lg group"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-slate-200">{hook}</p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={hook} />
                    </div>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Creative Angles */}
          {latestContent.angles && latestContent.angles.length > 0 && (
            <ContentSection
              title={`الزوايا الإبداعية (${latestContent.angles.length})`}
              icon={Sparkles}
              copyText={latestContent.angles.join('\n')}
            >
              <div className="space-y-2">
                {latestContent.angles.map((angle, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-surface rounded-lg group"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-slate-200">{angle}</p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={angle} />
                    </div>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Captions */}
          {latestContent.captions && latestContent.captions.length > 0 && (
            <ContentSection
              title={`النصوص الوصفية (${latestContent.captions.length})`}
              icon={MessageSquare}
              copyText={latestContent.captions.join('\n\n')}
            >
              <div className="space-y-3">
                {latestContent.captions.map((caption, index) => (
                  <div
                    key={index}
                    className="p-4 bg-surface rounded-lg group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex-1 text-slate-200 whitespace-pre-wrap">
                        {caption}
                      </p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={caption} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Hashtags */}
          {latestContent.hashtags && latestContent.hashtags.length > 0 && (
            <ContentSection
              title={`الهاشتاقات (${latestContent.hashtags.length})`}
              icon={Hash}
              copyText={latestContent.hashtags.join(' ')}
            >
              <div className="flex flex-wrap gap-2">
                {latestContent.hashtags.map((hashtag, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigator.clipboard.writeText(hashtag);
                      toast.success(`تم نسخ ${hashtag}`);
                    }}
                    className="px-3 py-1.5 bg-primary-50 text-primary-300 rounded-full text-sm hover:bg-primary-100 transition-colors cursor-pointer"
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Thumbnail Text */}
          {latestContent.thumbnailText &&
            latestContent.thumbnailText.length > 0 && (
              <ContentSection
                title={`نصوص الصور المصغرة (${latestContent.thumbnailText.length})`}
                icon={Image}
                copyText={latestContent.thumbnailText.join('\n')}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {latestContent.thumbnailText.map((text, index) => (
                    <div
                      key={index}
                      className="relative p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg text-center group"
                    >
                      <p className="text-white font-bold text-lg">{text}</p>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(text);
                            toast.success('تم النسخ');
                          }}
                          className="p-1.5 bg-surface-50/20 hover:bg-surface-50/30 rounded text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ContentSection>
            )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            لم يتم توليد محتوى بعد
          </h3>
          <p className="text-slate-400 mb-6">
            اضغط على زر "إعادة التوليد" لإنشاء محتوى لهذا المنتج
          </p>
          <button
            onClick={() => setShowRegenerateModal(true)}
            className="btn-primary"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            توليد المحتوى
          </button>
        </div>
      )}

      {/* Content History */}
      {contentHistory.length > 1 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            سجل التوليد ({contentHistory.length})
          </h2>
          <div className="space-y-2">
            {contentHistory.slice(1).map((content) => (
              <div
                key={content.id}
                className="flex items-center justify-between p-4 bg-surface rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">
                    {new Date(content.createdAt).toLocaleString('ar')}
                  </span>
                  <span className="px-2 py-1 bg-surface-200 text-slate-200 rounded text-xs">
                    {content.language}
                  </span>
                </div>
                <button
                  onClick={() => {
                    // Could implement viewing old content
                    toast('قريباً: عرض المحتوى السابق');
                  }}
                  className="text-primary-400 hover:text-primary-300 text-sm"
                >
                  عرض
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regenerate Modal */}
      <RegenerateModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onGenerate={handleRegenerate}
        loading={regenerating}
      />
    </div>
  );
}
