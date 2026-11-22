// Visi žaidimo skaičiai vienoje vietoje. Kiekviena reikšmė paimta iš scenarijaus
// „Dingusios raidės — skaitymo žaidimo scenarijus“ (skyrius nurodytas komentare).
// Testai (tests/rules.test.ts) tikrina, kad šios reikšmės sutampa su dokumentu.

import type { Daiktas, PriesoDydis } from './types';

/** „Širdelės, mana…“: Pradžia: 5 širdelės, 3 manos. */
export const PRADZIOS_SIRDELES = 5;
export const PRADZIOS_MANA = 3;

/** Atlygiai pagal įvykį (lentelė „Įvykis / Širdelės / Mana“). */
export const ATLYGIAI = {
  teisingaiIsPirmo: { sirdeles: 1, mana: 1 },
  teisingaiPoKlaidos: { sirdeles: 0, mana: 0 },
  klaida: { sirdeles: -1, mana: 0 },
  /** 3 teisingi iš eilės (serija): +2 manos papildomai. */
  serija: { ilgis: 3, mana: 2 },
  /** Bosas nugalėtas: visos širdelės atsistato, +3 manos. */
  bosas: { mana: 3 },
  /** Lobis šoniniame kelyje: +1 arba +2 širdelės, +3 manos. */
  lobis: { sirdelesMin: 1, sirdelesMax: 2, mana: 3 },
} as const;

/** „Priešų gyvybės“: maža Dėmė – 1 tekstas, vidutinis – 2, bosas – 5. */
export const PRIESO_GYVYBES: Record<PriesoDydis, number> = {
  mazas: 1,
  vidutinis: 2,
  bosas: 5,
};

/** „Kad nespaudytų iš eilės“: mygtukai užsirakina 2 sekundėms. */
export const UZRAKTAS_PO_KLAIDOS_MS = 2000;
/** Po 2 klaidų lieka du atsakymai, paryškinamas sakinys. */
export const KLAIDOS_IKI_SAKINIO = 2;

/** „Pralaimėjimas – ne Game over“: širdelės atsistato iki 5. */
export const SIRDELES_PO_PRALAIMEJIMO = 5;

/**
 * „Burtai“ (žaidime – „gudrybės“): pirmame skyriuje atrakinti tik Švieselė ir Gydymas,
 * toliau kas skyrių išmokstama po vieną naują. `nuo` – nuo kurio skyriaus galima naudoti.
 * Pavadinimai sąsajoje – src/ui/tema.ts.
 */
export const BURTAI = {
  sviesele: { pavadinimas: 'Švieselė', mana: 1, nuo: 1 },
  gydymas: { pavadinimas: 'Gydymas', mana: 3, sirdeles: 2, nuo: 1 },
  skiemenys: { pavadinimas: 'Skiemenys', mana: 1, nuo: 2 },
  skydas: { pavadinimas: 'Skydas', mana: 2, nuo: 3 },
  perskilimas: { pavadinimas: 'Perskilimas', mana: 3, nuo: 4 },
  ugnies: { pavadinimas: 'Ugnies žodis', mana: 5, nuo: 5 },
} as const;
export type Burtas = keyof typeof BURTAI;

/** Skyrių (lygių) skaičius: 5 skyriai ir finalas. */
export const SKYRIU_SKAICIUS = 6;

/** „Įranga“: 6 lygiai nuo medinio iki deimantinio. */
export const LYGIU_PAVADINIMAI = [
  'medinis',
  'varinis',
  'geležinis',
  'sidabrinis',
  'auksinis',
  'deimantinis',
] as const;

/** Įrangos lentelė: indeksas = lygis (0 medinis … 5 deimantinis). */
export const IRANGOS_LENTELE: Record<Daiktas, readonly number[]> = {
  /** Kardas: mana už nugalėtą priešą. */
  kardas: [0, 1, 1, 2, 2, 3],
  /** Šalmas: klaidų be širdelės per salę. */
  salmas: [0, 0, 1, 1, 2, 2],
  /** Šarvai: daugiausia širdelių. */
  sarvai: [5, 6, 6, 7, 7, 8],
  /** Batai: daugiausia manos. */
  batai: [10, 11, 12, 13, 14, 15],
};

/** „Kada pasirodo“: skyriaus numeris → to skyriaus įrangos lygis. */
export function skyriausLygis(skyrius: number): number {
  return Math.max(0, Math.min(5, skyrius));
}

/** „Kaip gaunama“: tikimybė, kad iškris daiktas. */
export const ISKRITIMO_TIKIMYBE = {
  mazas: 1 / 10,
  vidutinis: 1 / 4,
  lobis: 1 / 2,
  bosas: 1,
} as const;
/** Jei visi priešo tekstai įveikti iš pirmo karto, tikimybė dviguba. */
export const GERO_SKAITYMO_DAUGIKLIS = 2;
/** „Kokio lygio“: 1 kartą iš 10 – vienu lygiu aukštesnis. */
export const AUKSTESNIO_LYGIO_TIKIMYBE = 1 / 10;
/** „Imti ar palikti“: atiduotas daiktas kaukams – už 2 manas. */
export const KAUKAI_MOKA_MANOS = 2;

/**
 * Žvaigždutės už salę (1–3 pagal klaidų skaičių). Dokumentas ribų nenurodo,
 * todėl pasirinkta: 0 klaidų – 3, 1–2 klaidos – 2, daugiau – 1.
 */
export function zvaigzdutes(klaidos: number): 1 | 2 | 3 {
  if (klaidos <= 0) return 3;
  if (klaidos <= 2) return 2;
  return 1;
}

/**
 * „Žodžiai, kurie pabėgo“: kartojimas su intervalais. Intervalai skaičiuojami
 * susitikimais: pirmą kartą žodis grįžta po 2 susitikimų, antrą – po 4.
 * Du kartus iš eilės atsakius iš pirmo karto, žodis sugautas.
 */
export const KARTOJIMO_INTERVALAI = { 1: 2, 2: 4 } as const;

/** Pradžios ekranas: vardo ilgis. */
export const VARDO_ILGIS = 16;
