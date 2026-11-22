// Žaidimo turinys: užduotys ir skyrių planai. Naujas skyrius pridedamas čia.

import type { Skyrius, Uzduotis } from '../game/types';
import { sakiniuSkaicius, zodziuSkaicius, rastiUzuomina, zetonai } from '../game/text';

// Visi skyriai įkeliami automatiškai iš aplankų src/content/skyrius-N/.
const uzduotysFailai = import.meta.glob<Uzduotis[]>('./skyrius-*/uzduotys.json', { eager: true, import: 'default' });
const skyriaiFailai = import.meta.glob<Skyrius>('./skyrius-*/skyrius.json', { eager: true, import: 'default' });

export interface Turinys {
  uzduotys: Map<string, Uzduotis>;
  skyriai: Skyrius[];
}

export function sukurtiTurini(uzduotys: Uzduotis[], skyriai: Skyrius[]): Turinys {
  return { uzduotys: new Map(uzduotys.map((u) => [u.id, u])), skyriai };
}

export const TURINYS: Turinys = sukurtiTurini(
  Object.values(uzduotysFailai).flat(),
  Object.values(skyriaiFailai).sort((a, b) => a.numeris - b.numeris),
);

export function uzduotis(t: Turinys, id: string): Uzduotis {
  const u = t.uzduotys.get(id);
  if (!u) throw new Error(`Nerasta užduotis ${id}`);
  return u;
}

export function skyrius(t: Turinys, numeris: number): Skyrius {
  const s = t.skyriai.find((x) => x.numeris === numeris);
  if (!s) throw new Error(`Nerastas skyrius ${numeris}`);
  return s;
}

/**
 * Teksto apimtis pagal lygį (skyrių). Sunkėja kaip scenarijaus lentelėje
 * „Skyriai ir sunkumo progresija“, bet nuo 1 lygio tekstai ilgesni (tėvų pageidavimu).
 */
export const TEKSTO_RIBOS: Record<number, { sakiniai: [number, number]; zodziai: [number, number] }> = {
  1: { sakiniai: [1, 3], zodziai: [8, 22] },
  2: { sakiniai: [2, 3], zodziai: [12, 28] },
  3: { sakiniai: [2, 4], zodziai: [15, 35] },
  4: { sakiniai: [3, 4], zodziai: [20, 40] },
  5: { sakiniai: [3, 5], zodziai: [25, 50] },
  6: { sakiniai: [4, 6], zodziai: [30, 60] },
};

const kamienas = (zodis: string) => zodis.toLocaleLowerCase('lt').slice(0, 4);

/**
 * Teisingo atsakymo žodžiai (4+ raidžių), kurių kamienas (pirmos 4 raidės) yra
 * tekste. Kova ir bosas turi būti tokie, kad atsakymo nerastum tiesiog ieškodamas
 * to paties žodžio tekste.
 */
export function atsakymasTekste(u: Uzduotis): string[] {
  const teksto = new Set(zetonai(u.tekstas).filter((z) => z.tipas === 'zodis').map((z) => kamienas(z.tekstas)));
  const teisingas = u.atsakymai.find((a) => a.teisingas)?.tekstas ?? '';
  return zetonai(teisingas)
    .filter((z) => z.tipas === 'zodis' && z.tekstas.length >= 4 && teksto.has(kamienas(z.tekstas)))
    .map((z) => z.tekstas);
}

/**
 * Patikrina turinį ir grąžina klaidų sąrašą (tuščias – viskas gerai).
 * Naudojama testuose ir README aprašytame užduočių pridėjimo procese.
 */
export function patikrintiTurini(t: Turinys): string[] {
  const klaidos: string[] = [];
  const ids = new Set<string>();
  for (const u of t.uzduotys.values()) {
    const k = (z: string) => klaidos.push(`${u.id}: ${z}`);
    if (ids.has(u.id)) k('pasikartojantis id');
    ids.add(u.id);
    if (!/^s\d+-[kbzd]\d{2}$/.test(u.id)) k('id turi būti formos s1-k07');
    const raide = { kova: 'k', bosas: 'b', sankryza: 'z', durys: 'd' }[u.tipas];
    if (!raide) k(`nežinomas tipas ${u.tipas}`);
    else if (!u.id.includes(`-${raide}`)) k(`id raidė turi atitikti tipą (${raide})`);
    if (!u.id.startsWith(`s${u.skyrius}-`)) k('id pradžia turi atitikti skyrių');
    if (!u.tekstas.trim()) k('tuščias tekstas');
    if (u.tipas === 'sankryza') {
      if (u.atsakymai.length < 2) k('sankryžoje turi būti bent 2 keliai');
      if (u.atsakymai.some((a) => a.kelias !== 'lobis' && a.kelias !== 'trumpas'))
        k('kiekvienas sankryžos atsakymas turi „kelias“: lobis arba trumpas');
      continue;
    }
    if (u.atsakymai.length !== 4) k('turi būti lygiai 4 atsakymai');
    if (u.atsakymai.filter((a) => a.teisingas === true).length !== 1) k('turi būti lygiai 1 teisingas atsakymas');
    const tekstai = u.atsakymai.map((a) => a.tekstas.trim().toLocaleLowerCase('lt'));
    if (new Set(tekstai).size !== tekstai.length) k('atsakymai kartojasi');
    if (!u.uzuomina) k('trūksta uzuomina');
    else if (!rastiUzuomina(u.tekstas, u.uzuomina)) k(`užuomina „${u.uzuomina}“ nerasta tekste`);
    if (u.tipas === 'kova' || u.tipas === 'bosas') {
      if (!u.klausimas.trim()) k('trūksta klausimo');
      const ribos = TEKSTO_RIBOS[u.skyrius];
      if (ribos) {
        const z = zodziuSkaicius(u.tekstas);
        const s = sakiniuSkaicius(u.tekstas);
        if (z < ribos.zodziai[0] || z > ribos.zodziai[1]) k(`žodžių ${z}, turi būti ${ribos.zodziai.join('–')}`);
        if (s < ribos.sakiniai[0] || s > ribos.sakiniai[1]) k(`sakinių ${s}, turi būti ${ribos.sakiniai.join('–')}`);
      }
      const tekste = atsakymasTekste(u);
      if (tekste.length) k(`teisingas atsakymas kartoja teksto žodį: ${tekste.join(', ')}`);
      // „Atsakymai panašaus ilgio, teisingas neišsiskiria“.
      const ilgiai = u.atsakymai.map((a) => a.tekstas.length);
      const teisingoIlgis = u.atsakymai.find((a) => a.teisingas)?.tekstas.length ?? 0;
      const max = Math.max(...ilgiai);
      if (teisingoIlgis === max && ilgiai.filter((x) => x === max).length === 1)
        k('teisingas atsakymas negali būti vienintelis ilgiausias');
      if (max / Math.min(...ilgiai) > 2.5) k('atsakymų ilgiai per daug skiriasi');
    }
  }
  for (const s of t.skyriai) {
    const k = (z: string) => klaidos.push(`skyrius ${s.numeris}: ${z}`);
    if (s.sales.length < 3 || s.sales.length > 4) k('skyriuje turi būti 3–4 salės');
    if (s.bosas.uzduotys.length !== 5) k('bosas turi turėti 5 tekstus');
    for (const id of s.bosas.uzduotys) {
      const u = t.uzduotys.get(id);
      if (!u) k(`boso užduotis ${id} nerasta`);
      else if (u.tipas !== 'bosas') k(`${id} turi būti tipo „bosas“`);
    }
    for (const sale of s.sales) {
      const ks = (z: string) => klaidos.push(`${sale.id}: ${z}`);
      if (sale.kambariai.length < 6 || sale.kambariai.length > 8) ks('salėje turi būti 6–8 kambariai');
      const kid = new Set(sale.kambariai.map((x) => x.id));
      if (!kid.has(sale.pradzia)) ks('nerastas pradžios kambarys');
      if (!sale.kambariai.some((x) => x.tipas === 'galas')) ks('trūksta salės galo');
      for (const id of sale.uzduotys) {
        const u = t.uzduotys.get(id);
        if (!u) ks(`užduotis ${id} nerasta`);
        else if (u.tipas !== 'kova') ks(`${id} salės sąraše turi būti tipo „kova“`);
      }
      for (const kamb of sale.kambariai) {
        for (const n of kamb.kaimynai) {
          const kitas = sale.kambariai.find((x) => x.id === n);
          if (!kitas) ks(`${kamb.id}: nežinomas kaimynas ${n}`);
          else if (!kitas.kaimynai.includes(kamb.id)) ks(`${kamb.id}–${n}: ryšys turi būti abipusis`);
        }
        if (kamb.tipas === 'priesas' && !kamb.priesas) ks(`${kamb.id}: trūksta priešo dydžio`);
        if (kamb.tipas === 'sankryza') {
          const z = kamb.zenklas ? t.uzduotys.get(kamb.zenklas) : undefined;
          if (!z || z.tipas !== 'sankryza') ks(`${kamb.id}: trūksta ženklo užduoties`);
          for (const kel of Object.values(kamb.keliai ?? {}))
            if (!kid.has(kel)) ks(`${kamb.id}: kelias į nežinomą kambarį ${kel}`);
          if (kamb.slaptosDurys) {
            const m = t.uzduotys.get(kamb.slaptosDurys.misle);
            if (!m || m.tipas !== 'durys') ks(`${kamb.id}: trūksta mįslės užduoties`);
            if (!kid.has(kamb.slaptosDurys.kambarys)) ks(`${kamb.id}: nežinomas slaptas kambarys`);
          }
        }
      }
    }
  }
  return klaidos;
}
