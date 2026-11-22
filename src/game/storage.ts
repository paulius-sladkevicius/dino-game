// Progreso saugojimas naršyklės localStorage. Jei saugykla nepasiekiama
// (privatus langas, užblokuota), žaidimas veikia, tik nieko neišsaugo.

import type { Turinys } from '../content';
import { naujaBusena, naujaSalesBusena } from './engine';
import type { Busena } from './types';

export const SAUGYKLOS_RAKTAS = 'dino-ekspedicija/v1';

export interface Saugykla {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

function narsyklesSaugykla(): Saugykla | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/**
 * Sujungia įrašytą būseną su numatytąja: trūkstami laukai užpildomi, netinkami
 * atmetami. Taip senesnis įrašas nesugadina žaidimo po atnaujinimo.
 */
export function atkurtiBusena(duomenys: unknown, t: Turinys): Busena | null {
  if (!isObj(duomenys) || duomenys.versija !== 1 || typeof duomenys.vardas !== 'string' || !duomenys.vardas)
    return null;
  const pagr = naujaBusena(duomenys.vardas, t);
  const rez: Busena = { ...pagr };
  for (const raktas of Object.keys(pagr) as (keyof Busena)[]) {
    const v = duomenys[raktas];
    const numat = pagr[raktas];
    if (v === undefined || v === null) continue;
    if (Array.isArray(numat) ? Array.isArray(v) : typeof v === typeof numat) {
      (rez as unknown as Record<string, unknown>)[raktas] = isObj(numat) && isObj(v) ? { ...numat, ...v } : v;
    }
  }
  // Salės: kiekvienai skyriaus salei – pilna būsena.
  const sales: Busena['sales'] = {};
  for (const id of Object.keys(pagr.sales)) {
    const v = isObj(duomenys.sales) ? duomenys.sales[id] : undefined;
    sales[id] = isObj(v) ? { ...naujaSalesBusena(), ...(v as object) } : naujaSalesBusena();
  }
  rez.sales = sales;
  rez.nustatymai = {
    ...pagr.nustatymai,
    ...(isObj(duomenys.nustatymai) ? duomenys.nustatymai : {}),
    savi: { ...pagr.nustatymai.savi, ...(isObj(duomenys.nustatymai) && isObj(duomenys.nustatymai.savi) ? duomenys.nustatymai.savi : {}) },
  } as Busena['nustatymai'];
  // Vieta turi rodyti į egzistuojančią salę.
  const vieta = rez.vieta as { kur?: string; sale?: string };
  if (!vieta || (vieta.sale && !sales[vieta.sale])) rez.vieta = { kur: 'skyrius' };
  if (rez.vieta.kur === 'sale') rez.vieta = { kur: 'lauzas', sale: rez.vieta.sale };
  if (!t.skyriai.some((s) => s.numeris === rez.skyrius)) rez.skyrius = t.skyriai[0].numeris;
  const pl = rez.paskutinisLauzas as { kur?: string; sale?: string };
  if (!pl || (pl.kur === 'lauzas' && (!pl.sale || !sales[pl.sale]))) rez.paskutinisLauzas = pagr.paskutinisLauzas;
  return rez;
}

export function ikelti(t: Turinys, s: Saugykla | null = narsyklesSaugykla()): Busena | null {
  if (!s) return null;
  try {
    const tekstas = s.getItem(SAUGYKLOS_RAKTAS);
    return tekstas ? atkurtiBusena(JSON.parse(tekstas), t) : null;
  } catch {
    return null;
  }
}

export function issaugoti(b: Busena, s: Saugykla | null = narsyklesSaugykla()): boolean {
  if (!s) return false;
  try {
    s.setItem(SAUGYKLOS_RAKTAS, JSON.stringify(b));
    return true;
  } catch {
    return false;
  }
}

export function istrinti(s: Saugykla | null = narsyklesSaugykla()): void {
  try {
    s?.removeItem(SAUGYKLOS_RAKTAS);
  } catch {
    /* nieko */
  }
}
