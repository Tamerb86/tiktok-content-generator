// Client-side reel video exporter: draws the product + Arabic captions on a
// canvas, plays the OpenAI TTS audio through it, and records both into a
// downloadable video file (no server / FFmpeg needed).

export interface ExportReelOpts {
  productTitle: string;
  productImage?: string;
  scenes: string[];
  hashtags?: string[];
  audioBlob: Blob;
}

export function isExportSupported(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof (HTMLCanvasElement.prototype as unknown as { captureStream?: unknown }).captureStream !==
      'undefined'
  );
}

function loadImage(src?: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

export async function exportReel(opts: ExportReelOpts): Promise<Blob> {
  const { productTitle, productImage, scenes, hashtags = [], audioBlob } = opts;
  const W = 540;
  const H = 960;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas not supported');

  const img = await loadImage(productImage);

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  await new Promise<void>((res) => {
    audio.onloadedmetadata = () => res();
    audio.onerror = () => res();
    setTimeout(res, 8000);
  });
  const duration =
    isFinite(audio.duration) && audio.duration > 0 ? audio.duration : scenes.length * 3;
  const perScene = duration / Math.max(1, scenes.length);

  const AC: typeof AudioContext =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ac = new AC();
  const srcNode = ac.createMediaElementSource(audio);
  const dest = ac.createMediaStreamDestination();
  srcNode.connect(dest);

  const stream = (canvas as unknown as { captureStream: (fps: number) => MediaStream }).captureStream(30);
  dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));

  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : 'video/webm';
  const rec = new MediaRecorder(stream, { mimeType: mime });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
  });

  function wrap(text: string, maxW: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx!.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  let raf = 0;
  function frame() {
    const t = audio.currentTime;
    const idx = Math.min(scenes.length - 1, Math.floor(t / perScene));
    const within = Math.min(1, (t - idx * perScene) / perScene);

    ctx!.clearRect(0, 0, W, H);
    if (img) {
      const scale = 1 + 0.12 * within;
      const r = Math.max(W / img.width, H / img.height) * scale;
      const dw = img.width * r;
      const dh = img.height * r;
      ctx!.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      const g = ctx!.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#fe2c55');
      g.addColorStop(0.5, '#a21caf');
      g.addColorStop(1, '#06b6d4');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);
    }

    const ov = ctx!.createLinearGradient(0, 0, 0, H);
    ov.addColorStop(0, 'rgba(0,0,0,0.4)');
    ov.addColorStop(0.5, 'rgba(0,0,0,0.05)');
    ov.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx!.fillStyle = ov;
    ctx!.fillRect(0, 0, W, H);

    const segW = (W - 40) / scenes.length;
    for (let i = 0; i < scenes.length; i++) {
      ctx!.fillStyle = 'rgba(255,255,255,0.3)';
      ctx!.fillRect(20 + i * segW + 2, 24, segW - 4, 4);
      const fill = i < idx ? 1 : i === idx ? within : 0;
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(20 + i * segW + 2, 24, (segW - 4) * fill, 4);
    }

    ctx!.direction = 'rtl';
    ctx!.textAlign = 'center';
    ctx!.fillStyle = '#ffffff';
    ctx!.font = '700 42px Tajawal, Cairo, system-ui, sans-serif';
    ctx!.shadowColor = 'rgba(0,0,0,0.9)';
    ctx!.shadowBlur = 10;
    const lines = wrap(scenes[idx] || productTitle, W - 80);
    let y = H - 380 - (lines.length - 1) * 26;
    for (const ln of lines) {
      ctx!.fillText(ln, W / 2, y);
      y += 54;
    }
    ctx!.shadowBlur = 0;

    ctx!.textAlign = 'right';
    ctx!.fillStyle = '#ffffff';
    ctx!.font = '700 28px Tajawal, system-ui, sans-serif';
    ctx!.fillText('@متجرك', W - 30, H - 130);
    if (hashtags.length) {
      ctx!.fillStyle = '#25f4ee';
      ctx!.font = '600 25px Tajawal, system-ui, sans-serif';
      ctx!.fillText(hashtags.slice(0, 3).join(' '), W - 30, H - 90);
    }

    raf = requestAnimationFrame(frame);
  }

  try {
    await (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
  } catch {
    /* ignore */
  }

  rec.start();
  await ac.resume().catch(() => {});
  await audio.play().catch(() => {});
  frame();

  await new Promise<void>((resolve) => {
    audio.onended = () => resolve();
    setTimeout(resolve, (duration + 2) * 1000);
  });

  cancelAnimationFrame(raf);
  if (rec.state !== 'inactive') rec.stop();
  const blob = await done;
  URL.revokeObjectURL(audioUrl);
  try {
    ac.close();
  } catch {
    /* ignore */
  }
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1500);
}
