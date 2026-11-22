// Žaidimo variklis: grynos funkcijos, kurios iš senos būsenos sukuria naują.
// Vartotojo sąsaja (src/ui) tik kviečia šias funkcijas ir piešia rezultatą.

import { skyrius as gautiSkyriu, uzduotis as gautiUzduoti, type Turinys } from '../content';
import {
  ridentiGrobi,
  kardoMana,
  maxMana,
  maxSirdeles,
  PRADINE_IRANGA,
  salmoApsauga,
  type Grobis,
} from './equipment';
import { issprestiPabegusi, laukiantisZodis, uzregistruotiKlaida } from './repetition';
import { sumaisyti, sveikasis, type Rng } from './rng';
import {
  ATLYGIAI,
  BURTAI,
  KAUKAI_MOKA_MANOS,
  KLAIDOS_IKI_SAKINIO,
  PRADZIOS_MANA,
  PRADZIOS_SIRDELES,
  PRIESO_GYVYBES,
  SIRDELES_PO_PRALAIMEJIMO,
  zvaigzdutes,
  type Burtas,
} from './rules';
import { sauksmininkas, NUMATYTI_SAVI } from './text';
import type {
  Busena,
  Kambarys,
  Kosmetika,
  PriesoDydis,
  Sale,
  SalesBusena,
  Uzduotis,
} from './types';

export const DABARTINIS_SKYRIUS = 1;

// ------------------------------------------------------------------ Būsena

export function naujaSalesBusena(): SalesBusena {
  return {
    aplankyti: [],
    iveikti: [],
    durysAtidarytos: false,
    lobisPaimtas: false,
    baigta: false,
    zvaigzdutes: 0,
    ejimas: { aktyvus: false, klaidos: 0 },
  };
}

export function naujaBusena(vardas: string, t: Turinys): Busena {
  const sk = gautiSkyriu(t, DABARTINIS_SKYRIUS);
  const sales: Record<string, SalesBusena> = {};
  for (const s of sk.sales) sales[s.id] = naujaSalesBusena();
  return {
    versija: 1,
    vardas,
    kreipinys: sauksmininkas(vardas),
    sirdeles: PRADZIOS_SIRDELES,
    mana: PRADZIOS_MANA,
    serija: 0,
    salmoPanaudota: 0,
    iranga: { ...PRADINE_IRANGA },
    vieta: { kur: 'skyrius' },
    paskutinisLauzas: { kur: 'lauzas', sale: sk.sales[0].id },
    sales,
    bosasNugaletas: false,
    puslapiai: [],
    zodziai: [],
    pabege: [],
    sugauti: 0,
    susitikimai: 0,
    uzduotys: {},
    kosmetika: [],
    nustatymai: { skiemenys: true, didziosios: false, savi: { seimosNarys: '', draugas: '', augintinis: '' } },
    statistika: { laikasMs: 0, teisingi: 0, klaidos: 0 },
    istorijaPerskaityta: false,
  };
}

function apriboti(b: Busena): Busena {
  return {
    ...b,
    sirdeles: Math.max(0, Math.min(maxSirdeles(b.iranga), b.sirdeles)),
    mana: Math.max(0, Math.min(maxMana(b.iranga), b.mana)),
  };
}

function pridetiMana(b: Busena, kiek: number): Busena {
  return apriboti({ ...b, mana: b.mana + kiek });
}

function pridetiSirdeliu(b: Busena, kiek: number): Busena {
  return apriboti({ ...b, sirdeles: b.sirdeles + kiek });
}

function salesBusena(b: Busena, saleId: string): SalesBusena {
  return b.sales[saleId] ?? naujaSalesBusena();
}

function atnaujintiSale(b: Busena, saleId: string, f: (s: SalesBusena) => SalesBusena): Busena {
  return { ...b, sales: { ...b.sales, [saleId]: f(salesBusena(b, saleId)) } };
}

function irasytiStatistika(b: Busena, uzduotisId: string, klaida: boolean, baigta: boolean): Busena {
  const s = b.uzduotys[uzduotisId] ?? { rodyta: 0, klaidos: 0, paskutinis: -1 };
  return {
    ...b,
    uzduotys: {
      ...b.uzduotys,
      [uzduotisId]: {
        rodyta: s.rodyta + (baigta ? 1 : 0),
        klaidos: s.klaidos + (klaida ? 1 : 0),
        paskutinis: baigta ? b.susitikimai : s.paskutinis,
      },
    },
    statistika: {
      ...b.statistika,
      klaidos: b.statistika.klaidos + (klaida ? 1 : 0),
      teisingi: b.statistika.teisingi + (baigta ? 1 : 0),
    },
  };
}

// ------------------------------------------------------------------ Kova

export type KovosRusis = PriesoDydis | 'pabeges';

export interface Kova {
  rusis: KovosRusis;
  vardas: string;
  sale: string | null;
  kambarys: string | null;
  gyvybes: number;
  maxGyvybes: number;
  uzduotys: string[];
  nr: number;
  /** Atsakymų rodymo tvarka (indeksai į uzduotis.atsakymai). */
  tvarka: number[];
  pasalinti: number[];
  klaidos: number;
  visiIsPirmo: boolean;
  sviesele: boolean;
  uzuomina: 'nera' | 'zodis' | 'sakinys';
}

export const PRIESU_VARDAI: Record<KovosRusis, string> = {
  mazas: 'Rašalo lašelis',
  vidutinis: 'Rašalo dėmė',
  bosas: 'Didžioji Dėmė',
  pabeges: 'Pabėgusi Dėmė',
};

/** Parenka salės užduotis: pirmiausia dar nematytas, paskui seniausiai matytas. */
export function parinktiUzduotis(b: Busena, sarasas: readonly string[], kiek: number, rng: Rng): string[] {
  const pabege = new Set(b.pabege.map((p) => p.uzduotis));
  const kandidatai = sumaisyti(rng, sarasas.filter((id) => !pabege.has(id)));
  kandidatai.sort((x, y) => {
    const a = b.uzduotys[x] ?? { rodyta: 0, paskutinis: -1 };
    const c = b.uzduotys[y] ?? { rodyta: 0, paskutinis: -1 };
    return a.rodyta - c.rodyta || a.paskutinis - c.paskutinis;
  });
  const rez = kandidatai.slice(0, kiek);
  // Jei sąrašas per trumpas, kartojame (geriau nei nieko).
  let i = 0;
  while (rez.length < kiek && sarasas.length > 0) rez.push(sarasas[i++ % sarasas.length]);
  return rez;
}

export function pradetiKova(
  t: Turinys,
  opts: { rusis: KovosRusis; uzduotys: string[]; sale: string | null; kambarys: string | null },
  rng: Rng,
): Kova {
  const gyv = opts.rusis === 'pabeges' ? 1 : PRIESO_GYVYBES[opts.rusis];
  const pirma = gautiUzduoti(t, opts.uzduotys[0]);
  return {
    rusis: opts.rusis,
    vardas: PRIESU_VARDAI[opts.rusis],
    sale: opts.sale,
    kambarys: opts.kambarys,
    gyvybes: gyv,
    maxGyvybes: gyv,
    uzduotys: opts.uzduotys.slice(0, gyv),
    nr: 0,
    tvarka: sumaisyti(rng, pirma.atsakymai.map((_, i) => i)),
    pasalinti: [],
    klaidos: 0,
    visiIsPirmo: true,
    sviesele: false,
    uzuomina: 'nera',
  };
}

/** Kova su salės kambario priešu. */
export function kovaKambaryje(b: Busena, t: Turinys, sale: Sale, kambarys: Kambarys, rng: Rng): Kova {
  const dydis = (kambarys.tipas === 'lobis' ? kambarys.sargas : kambarys.priesas) ?? 'mazas';
  const uzd = parinktiUzduotis(b, sale.uzduotys, PRIESO_GYVYBES[dydis], rng);
  return pradetiKova(t, { rusis: dydis, uzduotys: uzd, sale: sale.id, kambarys: kambarys.id }, rng);
}

export function bosoKova(t: Turinys, rng: Rng): Kova {
  const sk = gautiSkyriu(t, DABARTINIS_SKYRIUS);
  const k = pradetiKova(t, { rusis: 'bosas', uzduotys: sk.bosas.uzduotys, sale: null, kambarys: null }, rng);
  return { ...k, vardas: sk.bosas.vardas };
}

/** Jei atėjo laikas, po kovos iššoka pabėgusi Dėmė. */
export function pabegusiDeme(b: Busena, t: Turinys, rng: Rng): Kova | null {
  const p = laukiantisZodis(b.pabege, b.susitikimai);
  if (!p || !t.uzduotys.has(p.uzduotis)) return null;
  return pradetiKova(t, { rusis: 'pabeges', uzduotys: [p.uzduotis], sale: null, kambarys: null }, rng);
}

export function dabartineUzduotis(t: Turinys, k: Kova): Uzduotis {
  return gautiUzduoti(t, k.uzduotys[k.nr]);
}

export type Ivykis =
  | { tipas: 'teisinga'; isPirmo: boolean; sirdeles: number; mana: number }
  | { tipas: 'serija'; mana: number }
  | { tipas: 'klaida'; atimtaSirdele: boolean }
  | { tipas: 'salmas' }
  | { tipas: 'smugis'; liko: number }
  | {
      tipas: 'nugaletas';
      zodis: string | null;
      kardoMana: number;
      grobis: Grobis | null;
      sugautas: boolean;
    }
  | { tipas: 'bosasNugaletas'; grobis: Grobis | null; mana: number }
  | { tipas: 'pralaimejimas' };

export interface Rezultatas {
  busena: Busena;
  kova: Kova;
  ivykiai: Ivykis[];
}

/** Vaikas paspaudė atsakymą (indeksas į uzduotis.atsakymai). */
export function atsakyti(b: Busena, t: Turinys, k: Kova, indeksas: number, rng: Rng): Rezultatas {
  const u = dabartineUzduotis(t, k);
  const ats = u.atsakymai[indeksas];
  if (!ats || k.pasalinti.includes(indeksas) || k.gyvybes <= 0) return { busena: b, kova: k, ivykiai: [] };

  if (!ats.teisingas) return klaida(b, k, u.id, indeksas);

  const ivykiai: Ivykis[] = [];
  const isPirmo = k.klaidos === 0;
  let nb = b;
  if (isPirmo) {
    const pr = { s: nb.sirdeles, m: nb.mana };
    nb = pridetiMana(pridetiSirdeliu(nb, ATLYGIAI.teisingaiIsPirmo.sirdeles), ATLYGIAI.teisingaiIsPirmo.mana);
    nb = { ...nb, serija: nb.serija + 1 };
    ivykiai.push({ tipas: 'teisinga', isPirmo, sirdeles: nb.sirdeles - pr.s, mana: nb.mana - pr.m });
    if (nb.serija % ATLYGIAI.serija.ilgis === 0) {
      const m0 = nb.mana;
      nb = pridetiMana(nb, ATLYGIAI.serija.mana);
      ivykiai.push({ tipas: 'serija', mana: nb.mana - m0 });
    }
  } else {
    ivykiai.push({ tipas: 'teisinga', isPirmo, sirdeles: 0, mana: 0 });
  }
  nb = irasytiStatistika(nb, u.id, false, true);

  // Intervalai skaičiuojami nuo šio susitikimo pabaigos.
  let sugautas = false;
  if (k.rusis === 'pabeges') {
    const r = issprestiPabegusi(nb.pabege, u.id, isPirmo, nb.susitikimai + 1);
    nb = { ...nb, pabege: r.pabege, sugauti: nb.sugauti + (r.sugautas ? 1 : 0) };
    sugautas = r.sugautas;
  } else if (!isPirmo) {
    nb = { ...nb, pabege: uzregistruotiKlaida(nb.pabege, u.id, nb.susitikimai + 1) };
  }

  const gyvybes = k.gyvybes - 1;
  const visiIsPirmo = k.visiIsPirmo && isPirmo;
  if (gyvybes > 0) {
    ivykiai.push({ tipas: 'smugis', liko: gyvybes });
    const kitas = gautiUzduoti(t, k.uzduotys[k.nr + 1]);
    return {
      busena: nb,
      kova: {
        ...k,
        gyvybes,
        nr: k.nr + 1,
        tvarka: sumaisyti(rng, kitas.atsakymai.map((_, i) => i)),
        pasalinti: [],
        klaidos: 0,
        visiIsPirmo,
        sviesele: false,
        uzuomina: 'nera',
      },
      ivykiai,
    };
  }

  // Priešas virsta raidėmis.
  const baigtaKova: Kova = { ...k, gyvybes: 0, visiIsPirmo };
  nb = { ...nb, susitikimai: nb.susitikimai + 1 };
  if (k.rusis === 'bosas') {
    const m0 = nb.mana;
    nb = apriboti({ ...nb, sirdeles: maxSirdeles(nb.iranga) });
    nb = pridetiMana(nb, ATLYGIAI.bosas.mana);
    const grobis = ridentiGrobi(rng, 'bosas', visiIsPirmo, DABARTINIS_SKYRIUS, nb.iranga);
    nb = {
      ...nb,
      bosasNugaletas: true,
      puslapiai: nb.puslapiai.includes(DABARTINIS_SKYRIUS) ? nb.puslapiai : [...nb.puslapiai, DABARTINIS_SKYRIUS],
    };
    ivykiai.push({ tipas: 'bosasNugaletas', grobis, mana: nb.mana - m0 });
    return { busena: nb, kova: baigtaKova, ivykiai };
  }
  const zodis = u.zodis ?? u.uzuomina ?? null;
  const kardas = kardoMana(nb.iranga);
  const m0 = nb.mana;
  nb = pridetiMana(nb, kardas);
  if (zodis && (k.rusis !== 'pabeges' || sugautas) && !nb.zodziai.includes(zodis))
    nb = { ...nb, zodziai: [...nb.zodziai, zodis] };
  const saltinis = k.rusis === 'vidutinis' ? 'vidutinis' : 'mazas';
  const grobis = ridentiGrobi(rng, saltinis, visiIsPirmo, DABARTINIS_SKYRIUS, nb.iranga);
  if (k.sale && k.kambarys) {
    const kamb = k.kambarys;
    nb = atnaujintiSale(nb, k.sale, (s) => ({
      ...s,
      iveikti: s.iveikti.includes(kamb) ? s.iveikti : [...s.iveikti, kamb],
    }));
  }
  ivykiai.push({ tipas: 'nugaletas', zodis, kardoMana: nb.mana - m0, grobis, sugautas });
  return { busena: nb, kova: baigtaKova, ivykiai };
}

function klaida(b: Busena, k: Kova, uzduotisId: string, indeksas: number): Rezultatas {
  const ivykiai: Ivykis[] = [];
  let nb = irasytiStatistika({ ...b, serija: 0 }, uzduotisId, true, false);
  if (k.sale) nb = atnaujintiSale(nb, k.sale, (s) => ({ ...s, ejimas: { ...s.ejimas, klaidos: s.ejimas.klaidos + 1 } }));
  if (nb.salmoPanaudota < salmoApsauga(nb.iranga)) {
    nb = { ...nb, salmoPanaudota: nb.salmoPanaudota + 1 };
    ivykiai.push({ tipas: 'salmas' }, { tipas: 'klaida', atimtaSirdele: false });
  } else {
    nb = { ...nb, sirdeles: Math.max(0, nb.sirdeles + ATLYGIAI.klaida.sirdeles) };
    ivykiai.push({ tipas: 'klaida', atimtaSirdele: true });
  }
  const klaidos = k.klaidos + 1;
  const nk: Kova = {
    ...k,
    klaidos,
    pasalinti: [...k.pasalinti, indeksas],
    visiIsPirmo: false,
    uzuomina: klaidos >= KLAIDOS_IKI_SAKINIO ? 'sakinys' : 'zodis',
  };
  if (nb.sirdeles <= 0) ivykiai.push({ tipas: 'pralaimejimas' });
  return { busena: nb, kova: nk, ivykiai };
}

/** Atsakymai, kurie dar rodomi (neteisingi išnyksta). */
export function rodomiAtsakymai(k: Kova): number[] {
  return k.tvarka.filter((i) => !k.pasalinti.includes(i));
}

// ------------------------------------------------------------------ Burtai

export function galimaBurta(b: Busena, k: Kova | null, burtas: Burtas): boolean {
  if (b.mana < BURTAI[burtas].mana) return false;
  if (burtas === 'gydymas') return b.sirdeles < maxSirdeles(b.iranga);
  return k !== null && k.gyvybes > 0 && !k.sviesele && k.uzuomina === 'nera';
}

export function naudotiBurta(b: Busena, k: Kova | null, burtas: Burtas): { busena: Busena; kova: Kova | null } {
  if (!galimaBurta(b, k, burtas)) return { busena: b, kova: k };
  const nb = { ...b, mana: b.mana - BURTAI[burtas].mana };
  if (burtas === 'gydymas') return { busena: pridetiSirdeliu(nb, BURTAI.gydymas.sirdeles), kova: k };
  return { busena: nb, kova: k ? { ...k, sviesele: true } : k };
}

// ------------------------------------------------------------------ Pralaimėjimas

/** Širdelės baigėsi: Žiežirba nuneša herojų prie paskutinio laužo. */
export function pralaimeti(b: Busena): Busena {
  return apriboti({
    ...b,
    sirdeles: SIRDELES_PO_PRALAIMEJIMO,
    serija: 0,
    vieta: b.paskutinisLauzas.kur === 'bosoLauzas' ? { kur: 'bosoLauzas' } : { ...b.paskutinisLauzas },
  });
}

// ------------------------------------------------------------------ Įranga

/** „Imu“ – naujas užsidedamas, senas kaukams; „Palieku“ – naujas kaukams. Abu: +2 manos. */
export function priimtiGrobi(b: Busena, g: Grobis, imu: boolean): Busena {
  const iranga = imu ? { ...b.iranga, [g.daiktas]: g.lygis } : b.iranga;
  return pridetiMana(apriboti({ ...b, iranga }), KAUKAI_MOKA_MANOS);
}

// ------------------------------------------------------------------ Salės

export function rastiSale(t: Turinys, saleId: string): Sale {
  const s = gautiSkyriu(t, DABARTINIS_SKYRIUS).sales.find((x) => x.id === saleId);
  if (!s) throw new Error(`Nerasta salė ${saleId}`);
  return s;
}

export function rastiKambari(sale: Sale, id: string): Kambarys {
  const k = sale.kambariai.find((x) => x.id === id);
  if (!k) throw new Error(`Nerastas kambarys ${id}`);
  return k;
}

export function saleAtrakinta(b: Busena, t: Turinys, saleId: string): boolean {
  const sales = gautiSkyriu(t, DABARTINIS_SKYRIUS).sales;
  const i = sales.findIndex((s) => s.id === saleId);
  return i === 0 || (i > 0 && salesBusena(b, sales[i - 1].id).baigta);
}

export function bosasAtrakintas(b: Busena, t: Turinys): boolean {
  return gautiSkyriu(t, DABARTINIS_SKYRIUS).sales.every((s) => salesBusena(b, s.id).baigta);
}

/** Iš skyriaus žemėlapio – prie salės laužo. */
export function eitiPrieLauzo(b: Busena, saleId: string): Busena {
  return { ...b, vieta: { kur: 'lauzas', sale: saleId }, paskutinisLauzas: { kur: 'lauzas', sale: saleId } };
}

export function eitiPrieBosoLauzo(b: Busena): Busena {
  return { ...b, vieta: { kur: 'bosoLauzas' }, paskutinisLauzas: { kur: 'bosoLauzas' } };
}

/** Nuo laužo į salę. Šalmo skaitiklis prasideda iš naujo. */
export function ieitiISale(b: Busena, t: Turinys, saleId: string): Busena {
  const sale = rastiSale(t, saleId);
  let nb = atnaujintiSale(b, saleId, (s) => ({
    ...s,
    aplankyti: s.aplankyti.includes(sale.pradzia) ? s.aplankyti : [...s.aplankyti, sale.pradzia],
    ejimas: s.ejimas.aktyvus ? s.ejimas : { aktyvus: true, klaidos: 0 },
  }));
  nb = { ...nb, salmoPanaudota: 0, vieta: { kur: 'sale', sale: saleId, kambarys: sale.pradzia } };
  return nb;
}

/** Prie boso kovos šalmo skaitiklis taip pat prasideda iš naujo. */
export function pradetiBosoKova(b: Busena): Busena {
  return { ...b, salmoPanaudota: 0 };
}

/**
 * Į kuriuos kambarius galima eiti paliečiant žemėlapį. Iš sankryžos į kelius
 * einama tik perskaičius ženklą, į slaptą kambarį – tik įminus mįslę.
 */
export function galimiEjimai(b: Busena, t: Turinys): string[] {
  if (b.vieta.kur !== 'sale') return [];
  const sale = rastiSale(t, b.vieta.sale);
  const dabar = rastiKambari(sale, b.vieta.kambarys);
  const sb = salesBusena(b, sale.id);
  return dabar.kaimynai.filter((id) => {
    const kitas = rastiKambari(sale, id);
    if (dabar.tipas === 'sankryza') return kitas.tipas !== 'slaptas' && !Object.values(dabar.keliai ?? {}).includes(id);
    if (kitas.tipas === 'slaptas') return sb.durysAtidarytos;
    return true;
  });
}

export function eitiIKambari(b: Busena, saleId: string, kambarys: string): Busena {
  const nb = atnaujintiSale(b, saleId, (s) => ({
    ...s,
    aplankyti: s.aplankyti.includes(kambarys) ? s.aplankyti : [...s.aplankyti, kambarys],
  }));
  return { ...nb, vieta: { kur: 'sale', sale: saleId, kambarys } };
}

/** Sankryžos ženklas: kelias, kurį pasirinko vaikas. */
export function pasirinktiKelia(b: Busena, t: Turinys, atsakymoIndeksas: number): Busena {
  if (b.vieta.kur !== 'sale') return b;
  const sale = rastiSale(t, b.vieta.sale);
  const kamb = rastiKambari(sale, b.vieta.kambarys);
  if (!kamb.zenklas || !kamb.keliai) return b;
  const ats = gautiUzduoti(t, kamb.zenklas).atsakymai[atsakymoIndeksas];
  const tikslas = ats?.kelias ? kamb.keliai[ats.kelias] : undefined;
  if (!tikslas) return b;
  return eitiIKambari(b, sale.id, tikslas);
}

export type KambarioVeiksmas =
  | { tipas: 'kova' }
  | { tipas: 'lobis' }
  | { tipas: 'sankryza' }
  | { tipas: 'dovana'; dovana: Kosmetika }
  | { tipas: 'galas' }
  | { tipas: 'nieko' };

/** Kas nutinka įėjus į dabartinį kambarį. */
export function kambarioVeiksmas(b: Busena, t: Turinys): KambarioVeiksmas {
  if (b.vieta.kur !== 'sale') return { tipas: 'nieko' };
  const sale = rastiSale(t, b.vieta.sale);
  const k = rastiKambari(sale, b.vieta.kambarys);
  const sb = salesBusena(b, sale.id);
  switch (k.tipas) {
    case 'priesas':
      return sb.iveikti.includes(k.id) ? { tipas: 'nieko' } : { tipas: 'kova' };
    case 'lobis':
      if (k.sargas && !sb.iveikti.includes(k.id)) return { tipas: 'kova' };
      return sb.lobisPaimtas ? { tipas: 'nieko' } : { tipas: 'lobis' };
    case 'sankryza':
      return { tipas: 'sankryza' };
    case 'slaptas':
      return k.dovana && !b.kosmetika.includes(k.dovana) ? { tipas: 'dovana', dovana: k.dovana } : { tipas: 'nieko' };
    case 'galas':
      return { tipas: 'galas' };
    default:
      return { tipas: 'nieko' };
  }
}

/** Lobis šoniniame kelyje: +1 arba +2 širdelės, +3 manos, kartais įranga (1 iš 2). */
export function atidarytiLobi(
  b: Busena,
  saleId: string,
  rng: Rng,
): { busena: Busena; sirdeles: number; mana: number; planuota: { sirdeles: number; mana: number }; grobis: Grobis | null } {
  if (salesBusena(b, saleId).lobisPaimtas)
    return { busena: b, sirdeles: 0, mana: 0, planuota: { sirdeles: 0, mana: 0 }, grobis: null };
  const kiek = sveikasis(rng, ATLYGIAI.lobis.sirdelesMin, ATLYGIAI.lobis.sirdelesMax);
  const pr = { s: b.sirdeles, m: b.mana };
  let nb = pridetiMana(pridetiSirdeliu(b, kiek), ATLYGIAI.lobis.mana);
  nb = atnaujintiSale(nb, saleId, (s) => ({ ...s, lobisPaimtas: true }));
  const grobis = ridentiGrobi(rng, 'lobis', false, DABARTINIS_SKYRIUS, nb.iranga);
  return {
    busena: nb,
    sirdeles: nb.sirdeles - pr.s,
    mana: nb.mana - pr.m,
    planuota: { sirdeles: kiek, mana: ATLYGIAI.lobis.mana },
    grobis,
  };
}

/** Slaptos durys: teisingai įminus – atsidaro; klaida širdelės neatima. */
export function atsakytiMislei(b: Busena, t: Turinys, atsakymoIndeksas: number): { busena: Busena; atidaryta: boolean } {
  if (b.vieta.kur !== 'sale') return { busena: b, atidaryta: false };
  const sale = rastiSale(t, b.vieta.sale);
  const kamb = rastiKambari(sale, b.vieta.kambarys);
  if (!kamb.slaptosDurys) return { busena: b, atidaryta: false };
  const u = gautiUzduoti(t, kamb.slaptosDurys.misle);
  const teisingas = u.atsakymai[atsakymoIndeksas]?.teisingas === true;
  let nb = irasytiStatistika(b, u.id, !teisingas, teisingas);
  if (teisingas) nb = atnaujintiSale(nb, sale.id, (s) => ({ ...s, durysAtidarytos: true }));
  return { busena: nb, atidaryta: teisingas };
}

export function paimtiDovana(b: Busena, dovana: Kosmetika): Busena {
  return b.kosmetika.includes(dovana) ? b : { ...b, kosmetika: [...b.kosmetika, dovana] };
}

/** Salės galas: salė įveikta, žvaigždutės pagal klaidas, toliau – kitos salės laužas. */
export function baigtiSale(
  b: Busena,
  t: Turinys,
  saleId: string,
): { busena: Busena; zvaigzdutes: 1 | 2 | 3; kita: string | 'bosas' } {
  const sales = gautiSkyriu(t, DABARTINIS_SKYRIUS).sales;
  const i = sales.findIndex((s) => s.id === saleId);
  const sb = salesBusena(b, saleId);
  const z = zvaigzdutes(sb.ejimas.klaidos);
  let nb = atnaujintiSale(b, saleId, (s) => ({
    ...s,
    baigta: true,
    zvaigzdutes: Math.max(s.zvaigzdutes, z) as 0 | 1 | 2 | 3,
    ejimas: { aktyvus: false, klaidos: 0 },
  }));
  const kita = i + 1 < sales.length ? sales[i + 1].id : 'bosas';
  nb = kita === 'bosas' ? eitiPrieBosoLauzo(nb) : eitiPrieLauzo(nb, kita);
  return { busena: nb, zvaigzdutes: z, kita };
}

// ------------------------------------------------------------------ Kita

export function pakeistiVarda(b: Busena, vardas: string): Busena {
  return { ...b, vardas, kreipinys: sauksmininkas(vardas) };
}

export { NUMATYTI_SAVI };
