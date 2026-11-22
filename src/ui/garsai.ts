// Garso efektai, sintezuojami naršyklėje (Web Audio). Failų nereikia, todėl
// veikia ir be interneto. Žaidimas niekada neperskaito teksto balsu.

export type Garsas =
  | 'zingsnis'
  | 'durys'
  | 'teisinga'
  | 'serija'
  | 'klaida'
  | 'pukst'
  | 'raides'
  | 'lobis'
  | 'grobis'
  | 'burtas'
  | 'saleBaigta'
  | 'pralaimejimas';

let ctx: AudioContext | null = null;
let pagrindinis: GainNode | null = null;
let ijungta = true;

type AudioCtor = typeof AudioContext;

/** Garsų kontekstas kuriamas tik po vaiko paspaudimo (kitaip naršyklė jį blokuoja). */
function atrakinti(): void {
  try {
    if (!ctx) {
      const C: AudioCtor | undefined =
        (globalThis as { AudioContext?: AudioCtor }).AudioContext ??
        (globalThis as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (!C) return;
      ctx = new C();
      pagrindinis = ctx.createGain();
      pagrindinis.gain.value = 0.55;
      pagrindinis.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  } catch {
    ctx = null;
  }
}

export function paruostiGarsus(): void {
  const f = () => {
    if (ijungta) atrakinti();
  };
  document.addEventListener('pointerdown', f, { passive: true });
  document.addEventListener('keydown', f);
}

export function nustatytiGarsa(ar: boolean): void {
  ijungta = ar;
}

function tonas(laikas: number, dazn: number, trukme: number, tipas: OscillatorType, garsumas: number, galinis?: number): void {
  if (!ctx || !pagrindinis) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipas;
  o.frequency.setValueAtTime(dazn, laikas);
  if (galinis) o.frequency.exponentialRampToValueAtTime(galinis, laikas + trukme);
  g.gain.setValueAtTime(0.0001, laikas);
  g.gain.exponentialRampToValueAtTime(garsumas, laikas + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, laikas + trukme);
  o.connect(g).connect(pagrindinis);
  o.start(laikas);
  o.stop(laikas + trukme + 0.05);
}

function triuksmas(laikas: number, trukme: number, garsumas: number, filtras: number, filtrasGale?: number, tipas: BiquadFilterType = 'lowpass'): void {
  if (!ctx || !pagrindinis) return;
  const ilgis = Math.max(1, Math.floor(ctx.sampleRate * trukme));
  const buf = ctx.createBuffer(1, ilgis, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < ilgis; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = tipas;
  f.frequency.setValueAtTime(filtras, laikas);
  if (filtrasGale) f.frequency.exponentialRampToValueAtTime(filtrasGale, laikas + trukme);
  const g = ctx.createGain();
  g.gain.setValueAtTime(garsumas, laikas);
  g.gain.exponentialRampToValueAtTime(0.0001, laikas + trukme);
  src.connect(f).connect(g).connect(pagrindinis);
  src.start(laikas);
}

/** Groja garsą (jei garsas įjungtas ir naršyklė jau leido groti). */
export function groti(g: Garsas): void {
  if (!ijungta || !ctx || ctx.state !== 'running') return;
  try {
    const t = ctx.currentTime + 0.01;
    switch (g) {
      case 'zingsnis':
        triuksmas(t, 0.06, 0.25, 500);
        break;
      case 'durys':
        tonas(t, 110, 0.45, 'sawtooth', 0.06, 190);
        triuksmas(t + 0.35, 0.18, 0.35, 300);
        break;
      case 'teisinga':
        tonas(t, 660, 0.14, 'triangle', 0.25);
        tonas(t + 0.12, 990, 0.22, 'triangle', 0.25);
        break;
      case 'serija':
        [660, 830, 990, 1320].forEach((f, i) => tonas(t + 0.3 + i * 0.08, f, 0.16, 'triangle', 0.18));
        break;
      case 'klaida':
        tonas(t, 240, 0.3, 'triangle', 0.25, 150);
        break;
      case 'pukst':
        triuksmas(t, 0.4, 0.5, 1800, 150, 'bandpass');
        tonas(t, 420, 0.35, 'sine', 0.25, 70);
        [1400, 1800, 2200].forEach((f, i) => tonas(t + 0.25 + i * 0.06, f, 0.1, 'sine', 0.08));
        break;
      case 'raides':
        for (let i = 0; i < 7; i++) tonas(t + i * 0.07, 1100 + Math.random() * 900, 0.08, 'sine', 0.06);
        break;
      case 'lobis':
        [1320, 1760, 1320, 2093].forEach((f, i) => tonas(t + i * 0.09, f, 0.12, 'square', 0.05));
        break;
      case 'grobis':
        [523, 659, 784, 1046].forEach((f, i) => tonas(t + i * 0.1, f, 0.22, 'triangle', 0.2));
        break;
      case 'burtas':
        for (let i = 0; i < 6; i++) tonas(t + i * 0.05, 880 * Math.pow(1.12, i), 0.25, 'sine', 0.08);
        break;
      case 'saleBaigta':
        [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tonas(t + i * 0.12, f, 0.28, 'triangle', 0.22));
        break;
      case 'pralaimejimas':
        [392, 330, 262].forEach((f, i) => tonas(t + i * 0.22, f, 0.35, 'triangle', 0.2));
        break;
    }
  } catch {
    /* garsas – tik priedas */
  }
}

// ------------------------------------------------------------------ Visas ekranas

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void; webkitFullscreenEnabled?: boolean };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

export function visasEkranasGalimas(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}

export function visasEkranasIjungtas(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
}

export function perjungtiVisaEkrana(): void {
  const d = document as FsDoc;
  try {
    if (visasEkranasIjungtas()) {
      if (d.exitFullscreen) void d.exitFullscreen().catch(() => undefined);
      else d.webkitExitFullscreen?.();
      return;
    }
    const el = document.documentElement as FsEl;
    if (el.requestFullscreen) {
      void el
        .requestFullscreen({ navigationUI: 'hide' })
        .then(() => {
          const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
          return o?.lock?.('portrait').catch(() => undefined);
        })
        .catch(() => undefined);
    } else el.webkitRequestFullscreen?.();
  } catch {
    /* nepalaikoma */
  }
}
