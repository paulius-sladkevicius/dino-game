// Įranga: kardas, šalmas, šarvai, batai (scenarijaus skyrius „Įranga“).

import {
  AUKSTESNIO_LYGIO_TIKIMYBE,
  GERO_SKAITYMO_DAUGIKLIS,
  IRANGOS_LENTELE,
  ISKRITIMO_TIKIMYBE,
  LYGIU_PAVADINIMAI,
  skyriausLygis,
} from './rules';
import { pasirinkti, tikimybe, type Rng } from './rng';
import type { Daiktas, Iranga, Lygis } from './types';

export const DAIKTAI: readonly Daiktas[] = ['kardas', 'salmas', 'sarvai', 'batai'];

const DAIKTU_VARDAI: Record<Daiktas, { vardas: string; daugiskaita: boolean }> = {
  kardas: { vardas: 'kardas', daugiskaita: false },
  salmas: { vardas: 'šalmas', daugiskaita: false },
  sarvai: { vardas: 'šarvai', daugiskaita: true },
  batai: { vardas: 'batai', daugiskaita: true },
};

export const PRADINE_IRANGA: Iranga = { kardas: 0, salmas: 0, sarvai: 0, batai: 0 };

export function maxSirdeles(iranga: Iranga): number {
  return IRANGOS_LENTELE.sarvai[iranga.sarvai];
}

export function maxMana(iranga: Iranga): number {
  return IRANGOS_LENTELE.batai[iranga.batai];
}

export function kardoMana(iranga: Iranga): number {
  return IRANGOS_LENTELE.kardas[iranga.kardas];
}

export function salmoApsauga(iranga: Iranga): number {
  return IRANGOS_LENTELE.salmas[iranga.salmas];
}

function didziaja(s: string): string {
  return s.charAt(0).toLocaleUpperCase('lt') + s.slice(1);
}

/** „Geležinis šalmas“, „Variniai šarvai“. */
export function daiktoPavadinimas(daiktas: Daiktas, lygis: Lygis): string {
  const { vardas, daugiskaita } = DAIKTU_VARDAI[daiktas];
  const medziaga = LYGIU_PAVADINIMAI[lygis];
  const forma = daugiskaita ? medziaga.replace(/is$/, 'iai') : medziaga;
  return `${didziaja(forma)} ${vardas}`;
}

function manosForma(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'maną';
  if (n % 10 === 0 || (n % 100 >= 11 && n % 100 <= 19)) return 'manų';
  return 'manas';
}

const SKAICIAI_ZODZIAIS = ['', 'Viena', 'Dvi', 'Trys'];

/** Trumpas daikto aprašas kortelėje „Imu / Palieku“. */
export function daiktoAprasas(daiktas: Daiktas, lygis: Lygis): string {
  const n = IRANGOS_LENTELE[daiktas][lygis];
  switch (daiktas) {
    case 'kardas':
      return n === 0
        ? 'Papildomos manos neduoda.'
        : `Už nugalėtą priešą gausi ${n} ${manosForma(n)}.`;
    case 'salmas':
      if (n === 0) return 'Nuo klaidų nesaugo.';
      return `${SKAICIAI_ZODZIAIS[n]} ${n === 1 ? 'klaida' : 'klaidos'} salėje neatima širdelės.`;
    case 'sarvai':
      return `Gali turėti iki ${n} širdelių.`;
    case 'batai':
      return `Gali turėti iki ${n} manų.`;
  }
}

export type Palyginimas = 'aukstyn' | 'zemyn' | 'lygu';

/** Rodyklė kortelėje: ar naujas daiktas geresnis už dabartinį. */
export function palyginti(daiktas: Daiktas, naujas: Lygis, dabartinis: Lygis): Palyginimas {
  const a = IRANGOS_LENTELE[daiktas][naujas];
  const b = IRANGOS_LENTELE[daiktas][dabartinis];
  if (a > b) return 'aukstyn';
  if (a < b) return 'zemyn';
  return 'lygu';
}

export interface Grobis {
  daiktas: Daiktas;
  lygis: Lygis;
}

export type GrobioSaltinis = keyof typeof ISKRITIMO_TIKIMYBE;

export function iskritimoTikimybe(saltinis: GrobioSaltinis, visiIsPirmo: boolean): number {
  const p = ISKRITIMO_TIKIMYBE[saltinis];
  const gerai = visiIsPirmo && saltinis !== 'lobis';
  return Math.min(1, gerai ? p * GERO_SKAITYMO_DAUGIKLIS : p);
}

/**
 * „Kaip gaunama“ ir „Kokio lygio“: ar iškrenta daiktas ir koks.
 * Daiktas dažniausiai to skyriaus lygio, 1 iš 10 – vienu lygiu aukštesnis.
 * Bosas visada palieka naujo lygio daiktą: renkamasi vieta, kurioje herojaus
 * daiktas dar žemesnio lygio (jei tokių nebėra – bet kuri).
 */
export function ridentiGrobi(
  rng: Rng,
  saltinis: GrobioSaltinis,
  visiIsPirmo: boolean,
  skyrius: number,
  iranga: Iranga,
): Grobis | null {
  if (!tikimybe(rng, iskritimoTikimybe(saltinis, visiIsPirmo))) return null;
  const bazinis = skyriausLygis(skyrius);
  let lygis = bazinis;
  if (tikimybe(rng, AUKSTESNIO_LYGIO_TIKIMYBE)) lygis = Math.min(5, bazinis + 1);
  let galimi = DAIKTAI;
  if (saltinis === 'bosas') {
    const zemesni = DAIKTAI.filter((d) => iranga[d] < bazinis);
    if (zemesni.length > 0) galimi = zemesni;
  }
  return { daiktas: pasirinkti(rng, galimi), lygis: lygis as Lygis };
}
