// „Žodžiai, kurie pabėgo“: suklydus žodis grįžta vėliau kaip „pabėgusi Dėmė“.
// Paprasta dviejų dėžučių (Leitnerio) sistema, intervalai matuojami susitikimais.

import { KARTOJIMO_INTERVALAI } from './rules';
import type { PabegesZodis } from './types';

/** Užregistruoja klaidą: žodis (iš naujo) patenka į 1 dėžutę. */
export function uzregistruotiKlaida(
  pabege: readonly PabegesZodis[],
  uzduotis: string,
  susitikimai: number,
): PabegesZodis[] {
  const kitas: PabegesZodis = {
    uzduotis,
    dezute: 1,
    kada: susitikimai + KARTOJIMO_INTERVALAI[1],
  };
  return [...pabege.filter((p) => p.uzduotis !== uzduotis), kitas];
}

/** Pabėgęs žodis, kuriam atėjo laikas grįžti (anksčiausias), arba null. */
export function laukiantisZodis(
  pabege: readonly PabegesZodis[],
  susitikimai: number,
): PabegesZodis | null {
  const laukiantys = pabege
    .filter((p) => p.kada <= susitikimai)
    .sort((a, b) => a.kada - b.kada);
  return laukiantys[0] ?? null;
}

/**
 * Pabėgusi Dėmė įveikta. Iš pirmo karto: 1 dėžutė → 2 dėžutė, 2 dėžutė → sugautas.
 * Su klaida: atgal į 1 dėžutę.
 */
export function issprestiPabegusi(
  pabege: readonly PabegesZodis[],
  uzduotis: string,
  isPirmo: boolean,
  susitikimai: number,
): { pabege: PabegesZodis[]; sugautas: boolean } {
  const esamas = pabege.find((p) => p.uzduotis === uzduotis);
  if (!esamas) return { pabege: [...pabege], sugautas: false };
  const kiti = pabege.filter((p) => p.uzduotis !== uzduotis);
  if (!isPirmo) {
    return { pabege: uzregistruotiKlaida(pabege, uzduotis, susitikimai), sugautas: false };
  }
  if (esamas.dezute === 1) {
    return {
      pabege: [...kiti, { uzduotis, dezute: 2, kada: susitikimai + KARTOJIMO_INTERVALAI[2] }],
      sugautas: false,
    };
  }
  return { pabege: kiti, sugautas: true };
}
