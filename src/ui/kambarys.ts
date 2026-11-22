// Kambario ekranas: vaizdas iš šono ir ėjimo valdymas („◀ Atgal“, „Eiti ▶“).

import { uzduotis } from '../content';
import { kambarioVeiksmas, kryptys, rastiKambari, rastiSale } from '../game/engine';
import type { Zaidimas } from './app';
import { kambarioIkona, knygosIkona } from './art';
import { h, svg } from './dom';
import { visasEkranasGalimas, visasEkranasIjungtas } from './garsai';
import { burtoMygtukas, hud, ziezirbosBurbulas } from './kova';
import { scena, type ScenosObjektas } from './scena';
import { skaitomasTekstas } from './skaitymas';

const R = '#24233f';

export function garsoIkona(ijungtas: boolean): string {
  const bangos = ijungtas
    ? `<path d="M20 11 C23 14 23 20 20 23 M23 7 C28 12 28 22 23 27" fill="none" stroke="${R}" stroke-width="2.2" stroke-linecap="round"/>`
    : `<path d="M20 12 L28 22 M28 12 L20 22" stroke="${R}" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<svg width="30" height="30" viewBox="0 0 32 34"><path d="M4 13 H10 L17 6 V28 L10 21 H4 Z" fill="#fbf6ea" stroke="${R}" stroke-width="2.2" stroke-linejoin="round"/>${bangos}</svg>`;
}

export function visoEkranoIkona(ijungtas: boolean): string {
  const d = ijungtas ? 'M12 4 V12 H4 M22 4 V12 H30 M12 30 V22 H4 M22 30 V22 H30' : 'M4 12 V4 H12 M30 12 V4 H22 M4 22 V30 H12 M30 22 V30 H22';
  return `<svg width="30" height="30" viewBox="0 0 34 34"><path d="${d}" fill="none" stroke="${R}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** Garso ir viso ekrano mygtukai (visas ekranas – tik jei naršyklė palaiko). */
export function nustatymuMygtukai(z: Zaidimas): HTMLElement[] {
  const garsas = z.busena?.nustatymai.garsas ?? true;
  const rez = [
    h(
      'button',
      {
        type: 'button',
        class: 'antrinis ikonos-mygtukas',
        'aria-label': garsas ? 'Išjungti garsą' : 'Įjungti garsą',
        'aria-pressed': garsas ? 'true' : 'false',
        'data-garsas': garsas ? 'ijungtas' : 'isjungtas',
        onclick: () => z.perjungtiGarsa(),
      },
      svg(garsoIkona(garsas)),
    ),
  ];
  if (visasEkranasGalimas()) {
    const ijungtas = visasEkranasIjungtas();
    rez.push(
      h(
        'button',
        {
          type: 'button',
          class: 'antrinis ikonos-mygtukas',
          'aria-label': ijungtas ? 'Išeiti iš viso ekrano' : 'Visas ekranas',
          'data-visas-ekranas': '1',
          onclick: () => z.perjungtiVisaEkrana(),
        },
        svg(visoEkranoIkona(ijungtas)),
      ),
    );
  }
  return rez;
}

export function ekranasKambarys(z: Zaidimas): HTMLElement {
  const b = z.b;
  if (b.vieta.kur !== 'sale') throw new Error('Ne salėje');
  const sale = rastiSale(z.t, b.vieta.sale);
  const sb = b.sales[sale.id];
  const kamb = rastiKambari(sale, b.vieta.kambarys);
  const veiksmas = kambarioVeiksmas(b, z.t);
  const kr = kryptys(sale, kamb.id);
  const juda = z.ejimas !== null;

  let objektas: ScenosObjektas | null = null;
  if (veiksmas.tipas === 'kova') objektas = { tipas: 'deme', rusis: (kamb.tipas === 'lobis' ? kamb.sargas : kamb.priesas) ?? 'mazas' };
  else if (kamb.tipas === 'lobis') objektas = { tipas: 'skrynia', atidaryta: sb.lobisPaimtas };
  else if (kamb.tipas === 'slaptas') objektas = { tipas: 'kaukas' };

  const desineDurys =
    kamb.tipas === 'galas'
      ? 'isejimas'
      : kamb.tipas === 'sankryza' || kamb.tipas === 'slaptas'
        ? null
        : veiksmas.tipas === 'nieko'
          ? 'atidarytos'
          : 'uzdarytos';

  const vaizdas = scena({
    kaireDurys: 'atidarytos',
    desineDurys,
    sankryza: kamb.tipas === 'sankryza' ? { stulpas: true, slaptos: kamb.slaptosDurys ? sb.durysAtidarytos : null } : undefined,
    objektas,
    iranga: b.iranga,
    apsiaustas: b.kosmetika.includes('apsiaustas'),
    herojus: z.ejimas ? { x: z.ejimas.nuo, iki: z.ejimas.iki, trukme: z.ejimas.trukme } : { x: z.herojusX },
    klase: z.naujasKambarys ? 'ieina' : '',
  });
  z.naujasKambarys = false;

  let sankryzosPanele: HTMLElement | null = null;
  if (kamb.tipas === 'sankryza' && kamb.zenklas) {
    const zenklas = uzduotis(z.t, kamb.zenklas);
    const n = { skiemenys: b.nustatymai.skiemenys };
    sankryzosPanele = h(
      'section',
      { class: 'zenklas', 'aria-label': 'Sankryžos ženklas' },
      h(
        'div',
        { class: 'zenklo-lenta' },
        h('p', { class: 'tekstas skaitymas' }, skaitomasTekstas(z.tekstas(zenklas.tekstas), n)),
        h('p', { class: 'klausimas skaitymas' }, skaitomasTekstas(z.tekstas(zenklas.klausimas), n)),
      ),
      h(
        'div',
        { class: 'keliai-mygtukai' },
        zenklas.atsakymai.map((a, i) => {
          const tikslas = a.kelias ? kamb.keliai?.[a.kelias] : undefined;
          const buvo = !!tikslas && sb.aplankyti.includes(tikslas);
          return h(
            'button',
            {
              type: 'button',
              class: `atsakymas skaitymas kampai-${i}${buvo ? ' aplankytas' : ''}`,
              'data-kelias': a.kelias,
              'aria-label': `${a.tekstas}${buvo ? ' (jau buvai)' : ''}`,
              disabled: juda,
              onclick: () => z.pasirinktiKelia(i),
            },
            a.tekstas,
          );
        }),
      ),
      kamb.slaptosDurys
        ? h(
            'button',
            { type: 'button', class: 'antrinis durys-mygtukas', 'data-durys': '1', disabled: juda, onclick: () => z.atidarytiDuris() },
            svg(kambarioIkona('slaptas', 30)),
            sb.durysAtidarytos ? 'Į slaptą kambarį' : 'Slaptos durys',
          )
        : null,
    );
  }

  const galimaPirmyn = veiksmas.tipas !== 'sankryza' && (veiksmas.tipas !== 'nieko' || kr.pirmyn.length === 1);
  const pirmynTekstas =
    veiksmas.tipas === 'galas' ? 'Išeiti' : veiksmas.tipas === 'kova' ? 'Eiti prie Dėmės' : veiksmas.tipas === 'lobis' ? 'Prie skrynios' : veiksmas.tipas === 'dovana' ? 'Prie kauko' : 'Eiti';
  const valdymas = h(
    'div',
    { class: 'ejimo-valdymas' },
    h(
      'button',
      { type: 'button', class: 'antrinis atgal-mygtukas', 'data-veiksmas': 'atgal', 'aria-label': 'Eiti atgal', disabled: juda || !kr.atgal, onclick: () => z.atgal() },
      '◀',
    ),
    sankryzosPanele
      ? null
      : h(
          'button',
          { type: 'button', class: 'pagrindinis pirmyn-mygtukas', 'data-veiksmas': 'pirmyn', disabled: juda || !galimaPirmyn, onclick: () => z.pirmyn() },
          `${pirmynTekstas} ▶`,
        ),
  );

  return h(
    'main',
    { class: `ekranas kambarys-ekranas${sankryzosPanele ? ' sankryzoje' : ''}`, 'data-ekranas': 'sale', 'data-kambarys-dabar': kamb.id },
    hud(z),
    h('h1', { class: 'antraste-ranka sales-pavadinimas' }, `${sale.pavadinimas} · ${kamb.pavadinimas}`),
    vaizdas,
    sankryzosPanele ? null : ziezirbosBurbulas(z, z.zinute),
    sankryzosPanele,
    valdymas,
    h(
      'div',
      { class: 'mygtuku-eile irankiai' },
      h('button', { type: 'button', class: 'antrinis ikonos-mygtukas', 'aria-label': 'Knyga', onclick: () => z.atidaryti('knyga') }, svg(knygosIkona(30))),
      h(
        'button',
        { type: 'button', class: 'antrinis ikonos-mygtukas', 'aria-label': 'Žemėlapis', 'data-zemelapis': '1', onclick: () => z.rodytiLangus([{ tipas: 'zemelapis' }]) },
        svg(kambarioIkona('sankryza', 30)),
      ),
      burtoMygtukas(z, 'gydymas'),
      nustatymuMygtukai(z),
    ),
  );
}
