// Salės žemėlapis (tik peržiūrai): kambariai ir keliai tarp jų.

import { rastiKambari, rastiSale } from '../game/engine';
import type { Kambarys } from '../game/types';
import type { Zaidimas } from './app';
import { herojus, kambarioIkona } from './art';
import { h, svg } from './dom';

/** Šiek tiek banguota „ranka piešta“ linija tarp dviejų taškų. */
function kelioLinija(a: Kambarys, b: Kambarys, slaptas: boolean): string {
  const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.06;
  const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.06;
  return `<path d="M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="#24233f" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke" ${slaptas ? 'stroke-dasharray="2 8" opacity="0.5"' : ''}/>`;
}

/** Salės žemėlapis tik peržiūrai: kur esi ir kur jau buvai. Vaikšto ne per jį. */
export function zemelapioVaizdas(z: Zaidimas): HTMLElement {
  const b = z.b;
  if (b.vieta.kur !== 'sale') return h('p', null, 'Žemėlapis rodomas salėje.');
  const sale = rastiSale(z.t, b.vieta.sale);
  const sb = b.sales[sale.id];
  const dabar = rastiKambari(sale, b.vieta.kambarys);

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
    return h(
      'div',
      {
        class: `kambarys tipas-${k.tipas}${aplankytas ? ' aplankytas' : ''}${iveiktas ? ' iveiktas' : ''}${yraCia ? ' dabar' : ''}${paslaptis ? ' paslaptis' : ''}`,
        style: { '--x': k.x / 100, '--y': k.y / 100 },
        'data-kambarys': k.id,
      },
      yraCia
        ? svg(herojus(b.iranga, b.kosmetika.includes('apsiaustas'), 46), 'herojaus-zyme')
        : paslaptis
          ? h('span', { class: 'klaustukas' }, '?')
          : svg(kambarioIkona(k.tipas)),
    );
  });

  return h(
    'div',
    { class: 'zemelapis', role: 'img', 'aria-label': `Salės „${sale.pavadinimas}“ žemėlapis. Tu esi: ${dabar.pavadinimas}.` },
    svg(`<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="keliai">${linijos.join('')}</svg>`, 'keliu-sluoksnis'),
    kambariai,
  );
}
