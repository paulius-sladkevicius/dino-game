// Skaitomo teksto atvaizdavimas: skiemenų spalvinimas ir užuominų paryškinimas.
// Žaidimas niekada neperskaito teksto už vaiką – tik parodo, kur žiūrėti.

import { rastiUzuomina, sakinysSuUzuomina, skiemenys, spalvintiSkiemenimis, zetonai } from '../game/text';
import { h } from './dom';

export interface SkaitymoNustatymai {
  skiemenys: boolean;
}

/** Žodžio elementas: ilgi žodžiai suskaidyti skiemenimis dviem spalvomis. */
function zodis(tekstas: string, n: SkaitymoNustatymai): HTMLElement {
  if (!n.skiemenys || !spalvintiSkiemenimis(tekstas)) return h('span', { class: 'zodis' }, tekstas);
  return h(
    'span',
    { class: 'zodis skiemenuotas' },
    skiemenys(tekstas).map((s, i) => h('span', { class: i % 2 ? 'sk sk2' : 'sk sk1' }, s)),
  );
}

/**
 * Tekstas su žodžiais kaip atskirais elementais. `paryskinti` – užuominos arba
 * sakinio ribos [pradžia, pabaiga).
 */
export function skaitomasTekstas(
  tekstas: string,
  n: SkaitymoNustatymai,
  paryskinti: { zodis?: [number, number] | null; sakinys?: [number, number] | null } = {},
  /** Gudrybė „Skiemenys“: `skaidomas` – žodžio pradžia (simbolis), `liesti` – paspaudus žodį. */
  skiemenu?: { skaidomas: number | null; liesti?: (pradzia: number) => void },
): HTMLElement[] {
  return zetonai(tekstas).map((z) => {
    let el: HTMLElement;
    if (z.tipas !== 'zodis') el = h('span', null, z.tekstas);
    else if (skiemenu?.skaidomas === z.pradzia)
      el = h('span', { class: 'zodis suskaidytas' }, skiemenys(z.tekstas).map((sk, i) => h('span', { class: i % 2 ? 'sk sk2' : 'sk sk1' }, (i ? '-' : '') + sk)));
    else el = zodis(z.tekstas, n);
    if (z.tipas === 'zodis' && skiemenu?.liesti && skiemenu.skaidomas === null) {
      const liesti = skiemenu.liesti;
      el.classList.add('lieciamas');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => liesti(z.pradzia));
    }
    const kerta = (r?: [number, number] | null) => !!r && z.pradzia < r[1] && z.pabaiga > r[0];
    if (kerta(paryskinti.sakinys)) el.classList.add('pazymetas-sakinys');
    if (z.tipas === 'zodis' && kerta(paryskinti.zodis)) el.classList.add('pazymetas-zodis');
    return el;
  });
}

export function uzuominosRibos(
  tekstas: string,
  uzuomina: string | undefined,
  lygis: 'nera' | 'zodis' | 'sakinys',
  sviesele: boolean,
): { zodis?: [number, number] | null; sakinys?: [number, number] | null } {
  const zod = sviesele || lygis !== 'nera' ? rastiUzuomina(tekstas, uzuomina) : null;
  const sak = lygis === 'sakinys' ? sakinysSuUzuomina(tekstas, uzuomina) : null;
  return { zodis: zod, sakinys: sak };
}
