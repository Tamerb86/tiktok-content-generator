import { useState, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music2,
  Plus,
  Search,
} from 'lucide-react';

interface TikTokPreviewProps {
  productTitle: string;
  productImage?: string;
  price?: string | null;
  currency?: string | null;
  hooks?: string[];
  captions?: string[];
  hashtags?: string[];
}

type PlatformId = 'tiktok' | 'reels' | 'shorts';

const PLATFORMS: { id: PlatformId; label: string }[] = [
  { id: 'tiktok', label: 'TikTok' },
  { id: 'reels', label: 'Reels' },
  { id: 'shorts', label: 'Shorts' },
];

// Realistic-looking fake engagement numbers (preview only)
const STATS = {
  likes: '128.4K',
  comments: '2,341',
  saves: '9,102',
  shares: '5,672',
};

export default function TikTokPreview({
  productTitle,
  productImage,
  price,
  currency,
  hooks = [],
  captions = [],
  hashtags = [],
}: TikTokPreviewProps) {
  const [platform, setPlatform] = useState<PlatformId>('tiktok');

  // Build the list of selectable overlay texts (hooks first, then captions)
  const textOptions = useMemo(() => {
    const opts: { label: string; text: string }[] = [];
    hooks.slice(0, 6).forEach((h, i) => opts.push({ label: `خطاف ${i + 1}`, text: h }));
    captions.slice(0, 4).forEach((c, i) => opts.push({ label: `وصف ${i + 1}`, text: c }));
    if (opts.length === 0) opts.push({ label: 'العنوان', text: productTitle });
    return opts;
  }, [hooks, captions, productTitle]);

  const [activeText, setActiveText] = useState(0);
  const safeIndex = Math.min(activeText, textOptions.length - 1);
  const overlayText = textOptions[safeIndex]?.text ?? productTitle;

  const topHashtags = hashtags.slice(0, 3);
  const handle = '@متجرك';

  const accent =
    platform === 'shorts' ? '#ff0033' : platform === 'reels' ? '#d6249f' : '#fe2c55';

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            معاينة حيّة
            <span className="text-xs font-normal text-slate-400">
              (شكل المنشور قبل ما تنزله)
            </span>
          </h2>
        </div>
        {/* Platform switcher */}
        <div className="flex items-center gap-1 bg-surface rounded-full p-1">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                platform === p.id
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ===== Phone mockup ===== */}
        <div className="mx-auto lg:mx-0 shrink-0">
          <div
            className="relative w-[280px] h-[560px] rounded-[2.2rem] overflow-hidden border-4 border-black/80 shadow-2xl bg-black"
            dir="rtl"
          >
            {/* Background media */}
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-fuchsia-700 to-cyan-600" />
            )}
            {/* Legibility gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20" />

            {/* Top bar */}
            <div className="absolute top-3 inset-x-0 z-20 flex items-center justify-center gap-5 text-white text-sm font-semibold">
              {platform === 'tiktok' && (
                <>
                  <span className="opacity-60">متابَعون</span>
                  <span className="border-b-2 border-white pb-0.5">لك</span>
                </>
              )}
              {platform === 'reels' && <span>Reels</span>}
              {platform === 'shorts' && (
                <span className="flex items-center gap-1">
                  <span
                    className="px-1.5 rounded text-[11px] font-bold"
                    style={{ background: accent }}
                  >
                    Shorts
                  </span>
                </span>
              )}
              <Search className="w-4 h-4 absolute right-3 opacity-80" />
            </div>

            {/* Price sticker */}
            {price && (
              <div className="absolute top-12 right-3 z-20 bg-white/95 text-black text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                🛒 {price} {currency || ''}
              </div>
            )}

            {/* Right action rail */}
            <div className="absolute bottom-24 left-2 z-20 flex flex-col items-center gap-4 text-white">
              {/* Avatar + follow */}
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-full border-2 border-white bg-cover bg-center"
                  style={{
                    backgroundImage: productImage
                      ? `url(${productImage})`
                      : 'linear-gradient(135deg,#fe2c55,#25f4ee)',
                  }}
                />
                <span
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: accent }}
                >
                  <Plus className="w-3 h-3 text-white" />
                </span>
              </div>
              <RailIcon icon={<Heart className="w-7 h-7" fill="currentColor" />} label={STATS.likes} color={accent} />
              <RailIcon icon={<MessageCircle className="w-7 h-7" fill="currentColor" />} label={STATS.comments} />
              <RailIcon icon={<Bookmark className="w-7 h-7" fill="currentColor" />} label={STATS.saves} color="#ffd400" />
              <RailIcon icon={<Share2 className="w-7 h-7" />} label={STATS.shares} />
              {/* Spinning disc */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-black border border-white/20 flex items-center justify-center animate-[spin_4s_linear_infinite]">
                <Music2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Bottom caption block */}
            <div className="absolute bottom-3 right-3 left-16 z-20 text-white text-right">
              <p className="font-bold text-[15px] mb-1">{handle}</p>
              <p className="text-[13px] leading-snug mb-1.5 line-clamp-4 drop-shadow">
                {overlayText}
              </p>
              {topHashtags.length > 0 && (
                <p className="text-[13px] font-semibold mb-2" style={{ color: '#25f4ee' }}>
                  {topHashtags.join(' ')}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-[12px] opacity-90">
                <Music2 className="w-3.5 h-3.5" />
                <span className="truncate">الصوت الأصلي - {productTitle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Controls ===== */}
        <div className="flex-1 w-full">
          <p className="text-sm text-slate-300 mb-2 font-medium">
            جرّب النصوص المختلفة فوق صورة المنتج:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {textOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => setActiveText(i)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  safeIndex === i
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="bg-surface rounded-lg p-3 text-slate-200 text-sm leading-relaxed border border-white/10">
            {overlayText}
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            💡 المعاينة تقريبية لمساعدتك على تخيّل المنشور النهائي. بدّل بين
            TikTok و Reels و Shorts لرؤية المحتوى نفسه على كل منصة.
          </p>
        </div>
      </div>
    </div>
  );
}

function RailIcon({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span style={color ? { color } : undefined}>{icon}</span>
      <span className="text-[11px] font-semibold">{label}</span>
    </div>
  );
}
