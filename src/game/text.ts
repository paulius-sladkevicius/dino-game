// Teksto pagalbininkai: vardų įstatymas, šauksmininkas, skiemenys, užuominų paieška.

import type { Nustatymai } from './types';

export const NUMATYTI_SAVI = { seimosNarys: 'Mama', draugas: 'Ema', augintinis: 'Murkis' };

export interface Zodynas {
  vardas: string;
  kreipinys: string;
  savi: Nustatymai['savi'];
}

/**
 * Įstato vaiko vardą ir savus žodžius. Vietos ženklai tekstuose:
 * [Vardas], [Kreipinys] (šauksmininkas), [Šeima], [Draugas], [Augintinis].
 */
export function istatytiVardus(tekstas: string, z: Zodynas): string {
  const arba = (v: string, numatytas: string) => (v.trim() ? v.trim() : numatytas);
  return tekstas
    .replaceAll('[Vardas]', z.vardas)
    .replaceAll('[Kreipinys]', z.kreipinys)
    .replaceAll('[Šeima]', arba(z.savi.seimosNarys, NUMATYTI_SAVI.seimosNarys))
    .replaceAll('[Draugas]', arba(z.savi.draugas, NUMATYTI_SAVI.draugas))
    .replaceAll('[Augintinis]', arba(z.savi.augintinis, NUMATYTI_SAVI.augintinis));
}

/** Sutvarko įvestą vardą: be tarpų kraštuose, pirma raidė didžioji. */
export function sutvarkytiVarda(ivestas: string, maxIlgis = 16): string {
  const v = ivestas.replace(/\s+/g, ' ').trim().slice(0, maxIlgis);
  if (!v) return '';
  return v.charAt(0).toLocaleUpperCase('lt') + v.slice(1);
}

/**
 * Lietuviško vardo šauksmininkas („Jonas“ → „Jonai“, „Ugnė“ → „Ugne“).
 * Tėvai gali jį pataisyti tėvų skydelyje.
 */
export function sauksmininkas(vardas: string): string {
  const v = vardas.trim();
  const keisti = (galune: string, nauja: string) => v.slice(0, v.length - galune.length) + nauja;
  const maz = v.toLocaleLowerCase('lt');
  const didz = v.length > 1 && v === v.toLocaleUpperCase('lt');
  const f = (s: string) => (didz ? s.toLocaleUpperCase('lt') : s);
  if (maz.endsWith('ius')) return keisti('ius', f('iau'));
  if (maz.endsWith('jus')) return keisti('jus', f('jau'));
  if (maz.endsWith('us')) return keisti('us', f('au'));
  if (maz.endsWith('as')) return keisti('as', f('ai'));
  if (maz.endsWith('is')) return keisti('is', f('i'));
  if (maz.endsWith('ys')) return keisti('ys', f('y'));
  if (maz.endsWith('ė')) return keisti('ė', f('e'));
  return v;
}

// ---------------------------------------------------------------- Žodžiai

export interface Zetonas {
  tipas: 'zodis' | 'kita';
  tekstas: string;
  pradzia: number;
  pabaiga: number;
}

const ZODZIO_RE = /[\p{L}\p{M}]+(?:[-'’][\p{L}\p{M}]+)*/gu;

/** Suskaido tekstą į žodžius ir tarpus/skyrybos ženklus (išlaikant visus simbolius). */
export function zetonai(tekstas: string): Zetonas[] {
  const rez: Zetonas[] = [];
  let pask = 0;
  for (const m of tekstas.matchAll(ZODZIO_RE)) {
    const i = m.index ?? 0;
    if (i > pask) rez.push({ tipas: 'kita', tekstas: tekstas.slice(pask, i), pradzia: pask, pabaiga: i });
    rez.push({ tipas: 'zodis', tekstas: m[0], pradzia: i, pabaiga: i + m[0].length });
    pask = i + m[0].length;
  }
  if (pask < tekstas.length)
    rez.push({ tipas: 'kita', tekstas: tekstas.slice(pask), pradzia: pask, pabaiga: tekstas.length });
  return rez;
}

export function zodziuSkaicius(tekstas: string): number {
  return tekstas.replace(/\[[^\]]+\]/g, 'X').match(ZODZIO_RE)?.length ?? 0;
}

export function sakiniuSkaicius(tekstas: string): number {
  return sakiniuRibos(tekstas).length;
}

// ---------------------------------------------------------------- Skiemenys

const BALSES = new Set('aąeęėiįyouųū');
const DVIBALSIAI = new Set(['ai', 'au', 'ei', 'ie', 'ui', 'uo']);
const DVIRAIDES = ['dž', 'dz', 'ch'];

function balse(r: string): boolean {
  return BALSES.has(r.toLocaleLowerCase('lt'));
}

/**
 * Suskaido balsių grupę į skiemenų branduolius. Dvibalsiai (ai, au, ei, ie, ui, uo)
 * yra vienas branduolys; „i“ po priebalsio prieš kitą balsę yra minkštumo ženklas
 * (kiau-lė, švie-čia, šu-niui).
 */
function branduoliai(grupe: string, poPriebalsio: boolean): string[] {
  const maz = grupe.toLocaleLowerCase('lt');
  const rez: string[] = [];
  let i = 0;
  while (i < grupe.length) {
    const pradzia = i;
    if (i === 0 && poPriebalsio && maz[0] === 'i' && maz.length >= 2 && !DVIBALSIAI.has(maz.slice(0, 2))) {
      i += 1;
    }
    i += i + 1 < grupe.length && DVIBALSIAI.has(maz.slice(i, i + 2)) ? 2 : 1;
    rez.push(grupe.slice(pradzia, i));
  }
  return rez;
}

/** Priebalsių samplaikos vienetai (dž, dz, ch – vienas garsas). */
function priebalsiai(s: string): string[] {
  const rez: string[] = [];
  let i = 0;
  while (i < s.length) {
    const du = s.slice(i, i + 2).toLocaleLowerCase('lt');
    if (DVIRAIDES.includes(du)) {
      rez.push(s.slice(i, i + 2));
      i += 2;
    } else {
      rez.push(s[i]);
      i += 1;
    }
  }
  return rez;
}

/**
 * Lietuviško žodžio skiemenys (va-ri-nis, šik-šnos-par-nis).
 * Taisyklė: vienas priebalsis tarp balsių eina į kitą skiemenį, iš kelių
 * pirmasis lieka ankstesniame skiemenyje.
 */
export function skiemenys(zodis: string): string[] {
  // Dalys: priebalsių ir balsių grupės paeiliui.
  const dalys: { balses: boolean; s: string }[] = [];
  for (const r of zodis) {
    const b = balse(r);
    const pask = dalys[dalys.length - 1];
    if (pask && pask.balses === b) pask.s += r;
    else dalys.push({ balses: b, s: r });
  }
  // Branduoliai su tarp jų esančiais priebalsiais.
  const elementai: { branduolys: boolean; s: string }[] = [];
  dalys.forEach((d, idx) => {
    if (!d.balses) {
      elementai.push({ branduolys: false, s: d.s });
      return;
    }
    const br = branduoliai(d.s, idx > 0);
    br.forEach((b, j) => {
      if (j > 0) elementai.push({ branduolys: false, s: '' });
      elementai.push({ branduolys: true, s: b });
    });
  });
  const branduoliuSk = elementai.filter((e) => e.branduolys).length;
  if (branduoliuSk <= 1) return [zodis];

  const rez: string[] = [];
  let dabartinis = '';
  let matytasBranduolys = false;
  elementai.forEach((e, idx) => {
    if (e.branduolys) {
      dabartinis += e.s;
      matytasBranduolys = true;
      return;
    }
    const yraToliau = elementai.slice(idx + 1).some((x) => x.branduolys);
    if (!matytasBranduolys || !yraToliau) {
      dabartinis += e.s;
      return;
    }
    const vienetai = priebalsiai(e.s);
    const kairen = vienetai.length >= 2 ? vienetai[0] : '';
    const desinen = vienetai.length >= 2 ? vienetai.slice(1).join('') : vienetai.join('');
    rez.push(dabartinis + kairen);
    dabartinis = desinen;
  });
  rez.push(dabartinis);
  return rez.filter(Boolean);
}

/** Ar žodis „ilgas“ ir spalvinamas skiemenimis (3 ir daugiau skiemenų). */
export function spalvintiSkiemenimis(zodis: string): boolean {
  return skiemenys(zodis).length >= 3;
}

// ---------------------------------------------------------------- Užuominos

function normalizuoti(s: string): string {
  return s.toLocaleLowerCase('lt');
}

/** Užuominos vieta tekste [pradžia, pabaiga) arba null. Pirmenybė – visam žodžiui. */
export function rastiUzuomina(tekstas: string, uzuomina: string | undefined): [number, number] | null {
  if (!uzuomina) return null;
  const t = normalizuoti(tekstas);
  const u = normalizuoti(uzuomina.trim());
  if (!u) return null;
  const re = new RegExp(`(?<![\\p{L}\\p{M}])${u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{M}])`, 'u');
  const m = re.exec(t);
  if (m) return [m.index, m.index + u.length];
  const i = t.indexOf(u);
  return i >= 0 ? [i, i + u.length] : null;
}

/** Sakinių ribos [pradžia, pabaiga). */
export function sakiniuRibos(tekstas: string): [number, number][] {
  const rez: [number, number][] = [];
  const re = /[^.!?…]+(?:[.!?…]+["“”»]?)?/g;
  for (const m of tekstas.matchAll(re)) {
    const s = m[0];
    const pr = (m.index ?? 0) + (s.length - s.trimStart().length);
    const pb = (m.index ?? 0) + s.trimEnd().length;
    if (pb > pr && /[\p{L}\p{N}]/u.test(s)) rez.push([pr, pb]);
  }
  return rez;
}

/** Sakinys, kuriame yra užuomina (po 2 klaidų paryškinamas visas sakinys). */
export function sakinysSuUzuomina(tekstas: string, uzuomina: string | undefined): [number, number] | null {
  const vieta = rastiUzuomina(tekstas, uzuomina);
  if (!vieta) return null;
  return sakiniuRibos(tekstas).find(([a, b]) => vieta[0] >= a && vieta[0] < b) ?? null;
}
