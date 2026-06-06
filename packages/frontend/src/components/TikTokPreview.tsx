import { useState, useMemo, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { exportReel, downloadBlob } from '../lib/exportReel';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music2,
  Plus,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
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

const SCENE_MS = 3500; // duration per scene

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

  // Selectable overlay texts (static mode)
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

  // ===== Video (animated reel) mode =====
  const scenes = useMemo(() => {
    let arr: string[] = [];
    if (hooks.length > 0) arr = hooks.slice(0, 6);
    else if (captions.length > 0) arr = captions.slice(0, 5);
    if (arr.length === 0) arr = [productTitle];
    return arr;
  }, [hooks, captions, productTitle]);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [scene, setScene] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [aiVideoUrl, setAiVideoUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sceneMs, setSceneMs] = useState(SCENE_MS);

  const speak = (text: string) => {
    if (muted) return;
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar';
      u.rate = 1;
      const arVoice = synth.getVoices().find((v) => v.lang && v.lang.startsWith('ar'));
      if (arVoice) u.voice = arVoice;
      synth.speak(u);
    } catch {
      /* ignore */
    }
  };

  const stopSpeak = () => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  };

  // Drive playback
  useEffect(() => {
    if (!playing) return;
    setZoom(false);
    const z = setTimeout(() => setZoom(true), 50); // trigger ken-burns
    if ((window as any).__noTTS) speak(scenes[scene] ?? '');
    timerRef.current = setTimeout(() => {
      if (scene < scenes.length - 1) {
        setScene((s) => s + 1);
      } else {
        const a = (window as any).__pa as HTMLAudioElement | null;
        if (a && !a.paused && !a.ended) {
          setScene(0); // keep looping visuals until the audio finishes
        } else {
          setPlaying(false);
          setScene(0);
          stopSpeak();
          try { (window as any).__pa?.pause?.(); (window as any).__pa = null; } catch { /* ignore */ }
        }
      }
    }, sceneMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(z);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, scene, sceneMs]);

  useEffect(() => () => stopSpeak(), []);

  const startPlay = () => {
    setScene(0);
    setSceneMs(SCENE_MS);
    setPlaying(true);
    try { (window as any).__pa?.pause?.(); } catch { /* ignore */ }
    api
      .generateAudio(scenes.join('\u060c '))
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = new Audio(url);
        (window as any).__pa = a;
        a.onloadedmetadata = () => {
          if (isFinite(a.duration) && a.duration > 1) {
            // spread the scenes evenly across the full narration
            setSceneMs(Math.max(2200, Math.ceil((a.duration * 1000) / Math.max(1, scenes.length))));
          }
        };
        a.onended = () => stopPlay();
        a.play().catch(() => {});
      })
      .catch(() => {});
  };
  const stopPlay = () => {
    setPlaying(false);
    setScene(0);
    stopSpeak();
    try { (window as any).__pa?.pause?.(); (window as any).__pa = null; } catch { /* ignore */ }
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleAiVideo = async () => {
    if (aiBusy) return;
    if (!productImage) {
      setAiStatus('أضف صورة للمنتج أولاً ليُولَّد منها الفيديو');
      return;
    }
    setAiBusy(true);
    setAiVideoUrl(null);
    setAiStatus('جارٍ إرسال الطلب…');
    try {
      const created = await api.createAiVideo({
        image_url: productImage,
        prompt: 'Cinematic product showcase video of ' + productTitle + ', slow elegant camera orbit, studio lighting, high detail',
      });
      const vid = created.data?.id;
      if (!vid) throw new Error('تعذّر بدء التوليد');
      setAiStatus('جارٍ توليد الفيديو بالذكاء الاصطناعي… (قد يستغرق 1-5 دقائق)');
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 6000));
        const st = await api.getAiVideo(vid);
        const status = st.data?.status;
        if (status === 'succeeded' && st.data?.output) {
          setAiVideoUrl(st.data.output);
          setAiStatus(null);
          break;
        }
        if (status === 'failed' || status === 'canceled') {
          setAiStatus('فشل التوليد: ' + (st.data?.error || 'خطأ غير معروف'));
          break;
        }
        setAiStatus('جارٍ توليد الفيديو… (' + (status || '...') + ')');
      }
    } catch (err) {
      setAiStatus(err instanceof Error ? err.message : 'فشل توليد الفيديو');
    } finally {
      setAiBusy(false);
    }
  };

  const displayText = playing ? scenes[scene] ?? productTitle : overlayText;

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            معاينة حيّة
            <span className="text-xs font-normal text-slate-400">
              (شغّل لمشاهدة المنشور كفيديو)
            </span>
          </h2>
        </div>
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
            className="relative w-[280px] h-[560px] rounded-[2.2rem] overflow-hidden border-4 border-black/80 shadow-2xl bg-black select-none"
            dir="rtl"
            onClick={() => (playing ? stopPlay() : undefined)}
          >
            {/* Background media (with ken-burns while playing) */}
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="absolute inset-0 w-full h-full object-cover transition-transform ease-linear"
                style={{
                  transform: playing && zoom ? 'scale(1.18)' : 'scale(1)',
                  transitionDuration: playing ? `${sceneMs}ms` : '0ms',
                }}
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary-600 via-fuchsia-700 to-cyan-600 transition-transform ease-linear"
                style={{
                  transform: playing && zoom ? 'scale(1.18)' : 'scale(1)',
                  transitionDuration: playing ? `${sceneMs}ms` : '0ms',
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20" />

            {/* Story-style progress bars while playing */}
            {playing && (
              <div className="absolute top-2 inset-x-3 z-30 flex gap-1">
                {scenes.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: i < scene ? '100%' : i === scene ? '100%' : '0%',
                        transition: i === scene ? `width ${sceneMs}ms linear` : 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Top bar */}
            <div className="absolute top-4 inset-x-0 z-20 flex items-center justify-center gap-5 text-white text-sm font-semibold">
              {platform === 'tiktok' && (
                <>
                  <span className="opacity-60">متابَعون</span>
                  <span className="border-b-2 border-white pb-0.5">لك</span>
                </>
              )}
              {platform === 'reels' && <span>Reels</span>}
              {platform === 'shorts' && (
                <span
                  className="px-1.5 rounded text-[11px] font-bold"
                  style={{ background: accent }}
                >
                  Shorts
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

            {/* Center play button (idle) */}
            {!playing && (
              <button
                onClick={startPlay}
                className="absolute inset-0 z-30 flex items-center justify-center group"
                aria-label="تشغيل المعاينة"
              >
                <span className="w-16 h-16 rounded-full bg-black/45 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white" fill="white" />
                </span>
              </button>
            )}

            {/* Animated caption while playing (big, centered-bottom) */}
            {playing && (
              <div
                key={scene}
                className="absolute bottom-28 right-4 left-4 z-20 text-center animate-slide-up"
              >
                <p className="text-white font-extrabold text-xl leading-snug drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  {displayText}
                </p>
              </div>
            )}

            {/* Right action rail */}
            <div className="absolute bottom-24 left-2 z-20 flex flex-col items-center gap-4 text-white">
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
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-black border border-white/20 flex items-center justify-center ${playing ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                <Music2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Bottom caption block (static info) */}
            <div className="absolute bottom-3 right-3 left-16 z-20 text-white text-right">
              <p className="font-bold text-[15px] mb-1">{handle}</p>
              {!playing && (
                <p className="text-[13px] leading-snug mb-1.5 line-clamp-3 drop-shadow">
                  {overlayText}
                </p>
              )}
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

            {/* Playback controls (while playing) */}
            {playing && (
              <div className="absolute top-12 left-3 z-30 flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setMuted((m) => { const nm = !m; if (nm) stopSpeak(); return nm; }); }}
                  className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                  aria-label="الصوت"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); stopPlay(); }}
                  className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                  aria-label="إيقاف"
                >
                  <Pause className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Play / replay button below phone */}
          <button
            onClick={playing ? stopPlay : startPlay}
            className="btn-primary w-full mt-3 justify-center"
          >
            {playing ? (
              <>
                <Pause className="w-4 h-4 ml-2" /> إيقاف
              </>
            ) : (
              <>
                <Play className="w-4 h-4 ml-2" fill="currentColor" /> تشغيل كفيديو
              </>
            )}
          </button>
          <button
            onClick={async () => {
              if (exporting) return;
              setExporting(true);
              try {
                const blob = await api.generateAudio(scenes.join('\u060c '));
                let exportImage = productImage;
                if (productImage) {
                  try {
                    const imgBlob = await api.fetchImageBlob(productImage);
                    exportImage = URL.createObjectURL(imgBlob);
                  } catch { /* fall back to direct URL */ }
                }
                const video = await exportReel({ productTitle, productImage: exportImage, scenes, hashtags, audioBlob: blob });
                downloadBlob(video, 'reel.webm');
                setExportedUrl((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return URL.createObjectURL(video);
                });
              } catch { /* ignore */ } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="btn-outline w-full mt-2 justify-center disabled:opacity-60"
          >
            {exporting ? '\u062c\u0627\u0631\u064d \u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u2026' : '\u2b07 \u062a\u0646\u0632\u064a\u0644 \u0627\u0644\u0641\u064a\u062f\u064a\u0648 (MP4/WebM)'}
          </button>
          <button
            onClick={handleAiVideo}
            disabled={aiBusy}
            className="btn-outline w-full mt-2 justify-center disabled:opacity-60"
          >
            {aiBusy ? '🎬 جارٍ توليد فيديو AI…' : '🎬 فيديو AI حقيقي من صورة المنتج (Pro)'}
          </button>
          {aiStatus && (
            <p className="text-xs text-slate-400 mt-2 text-center leading-relaxed">{aiStatus}</p>
          )}
          {aiVideoUrl && (
            <div className="mt-3">
              <p className="text-sm text-green-400 mb-2 text-center">✓ فيديو AI جاهز</p>
              <video
                src={aiVideoUrl}
                controls
                playsInline
                className="w-full rounded-xl border border-white/10"
              />
              <a
                href={aiVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full mt-2 justify-center"
              >
                ⬇ تنزيل MP4
              </a>
            </div>
          )}
          {exportedUrl && (
            <div className="mt-3">
              <p className="text-sm text-green-400 mb-2 text-center">
                ✓ تم إنشاء الفيديو وتنزيله (reel.webm في مجلد التنزيلات)
              </p>
              <video
                src={exportedUrl}
                controls
                playsInline
                className="w-full rounded-xl border border-white/10"
              />
            </div>
          )}
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
                onClick={() => { setActiveText(i); if (playing) stopPlay(); }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  safeIndex === i && !playing
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
            🎬 زر "تشغيل كفيديو" يحوّل الهوكات إلى ريّل متحرك مع تعليق صوتي (عبر متصفحك).
            بدّل بين TikTok و Reels و Shorts لرؤية الشكل على كل منصة. (تصدير ملف MP4
            قابل للتنزيل ميزة قادمة في الخطة المدفوعة.)
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
