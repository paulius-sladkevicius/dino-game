// Salės žemėlapis: kambariai, keliai, sankryžos ženklas ir slaptos durys.

import { uzduotis } from '../content';
import { galimiEjimai, rastiKambari, rastiSale } from '../game/engine';
import type { Kambarys } from '../game/types';
import type { Zaidimas } from './app';
import { herojus, kambarioIkona, knygosIkona } from './art';
import { h, svg } from './dom';
import { burtoMygtukas, hud, ziezirbosBurbulas } from './kova';
import { skaitomasTekstas } from './skaitymas';

/** Šiek tiek banguota „ranka piešta“ linija tarp dviejų taškų. */
function kelioLinija(a: Kambarys, b: Kambarys, slaptas: boolean): string {
  const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.06;
  const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.06;
  return `<path d="M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="#24233f" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke" ${slaptas ? 'stroke-dasharray="2 8" opacity="0.5"' : ''}/>`;
}

export function ekranasSale(z: Zaidimas): HTMLElement {
  const b = z.b;
  if (b.vieta.kur !== 'sale') throw new Error('Ne salėje');
  const sale = rastiSale(z.t, b.vieta.sale);
  const sb = b.sales[sale.id];
  const dabar = rastiKambari(sale, b.vieta.kambarys);
  const galimi = new Set(galimiEjimai(b, z.t));

  const linijos: string[] = [];
  const matyta = new Set<string>();
  for (const k of sale.kambariai) {
    for (const n of k.kaimynai) {
      const raktas = [k.id, n].sort().join('|');
      if (matyta.has(raktas)) continue;
      matyta.add(raktas);
      const kitas = rastiKambari(sale, n);
      const slaptas = (k.tipas === 'slaptas' || kitas.tipas === 'slaptas') && !sb.durysAtidarytos;
      linijos.push(kelioLinija(k, kitas, slaptas));
    }
  }

  const kambariai = sale.kambariai.map((k) => {
    const aplankytas = sb.aplankyti.includes(k.id);
    const iveiktas = sb.iveikti.includes(k.id) || (k.tipas === 'lobis' && sb.lobisPaimtas);
    const paslaptis = k.tipas === 'slaptas' && !sb.durysAtidarytos;
    const yraCia = k.id === dabar.id;
    const galima = galimi.has(k.id);
    const vardas = paslaptis ? 'Paslaptis' : k.pavadinimas;
    return h(
      'button',
      {
        type: 'button',
        class: `kambarys tipas-${k.tipas}${aplankytas ? ' aplankytas' : ''}${iveiktas ? ' iveiktas' : ''}${yraCia ? ' dabar' : ''}${galima ? ' galima' : ''}${paslaptis ? ' paslaptis' : ''}`,
        style: { '--x': k.x / 100, '--y': k.y / 100 },
        disabled: !galima,
        'aria-label': `${vardas}${yraCia ? ' (tu čia)' : ''}${iveiktas ? ' (įveikta)' : ''}`,
        'data-kambarys': k.id,
        onclick: () => z.eitiIKambari(k.id),
      },
      paslaptis ? h('span', { class: 'klaustukas' }, '?') : svg(kambarioIkona(k.tipas)),
      yraCia ? svg(herojus(b.iranga, b.kosmetika.includes('apsiaustas'), 34), 'herojaus-zyme') : null,
    );
  });

  const zemelapis = h(
    'div',
    { class: 'zemelapis', role: 'group', 'aria-label': `Salės „${sale.pavadinimas}“ žemėlapis` },
    svg(`<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="keliai">${linijos.join('')}</svg>`, 'keliu-sluoksnis'),
    kambariai,
  );

  let apacia: HTMLElement;
  if (dabar.tipas === 'sankryza' && dabar.zenklas) {
    const zenklas = uzduotis(z.t, dabar.zenklas);
    const n = { skiemenys: b.nustatymai.skiemenys };
    apacia = h(
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
        zenklas.atsakymai.map((a, i) =>
          h(
            'button',
            { type: 'button', class: `atsakymas skaitymas kampai-${i}`, 'data-kelias': a.kelias, onclick: () => z.pasirinktiKelia(i) },
            a.tekstas,
          ),
        ),
      ),
      dabar.slaptosDurys
        ? h(
            'button',
            { type: 'button', class: 'antrinis durys-mygtukas', 'data-durys': '1', onclick: () => z.atidarytiDuris() },
            svg(kambarioIkona('slaptas', 30)),
            sb.durysAtidarytos ? 'Į slaptą kambarį' : 'Slaptos durys',
          )
        : null,
      ziezirbosBurbulas(z, z.zinute),
    );
  } else {
    apacia = h(
      'div',
      { class: 'sales-apacia' },
      ziezirbosBurbulas(z, z.zinute),
      h(
        'div',
        { class: 'mygtuku-eile' },
        h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('knyga') }, svg(knygosIkona(28)), 'Knyga'),
        burtoMygtukas(z, 'gydymas'),
      ),
    );
  }

  return h(
    'main',
    { class: 'ekranas sale', 'data-ekranas': 'sale' },
    hud(z),
    h('h1', { class: 'antraste-ranka sales-pavadinimas' }, sale.pavadinimas),
    zemelapis,
    apacia,
  );
}
