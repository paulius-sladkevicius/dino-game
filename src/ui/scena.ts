// Kambarys iš šono: urvo fonas, durys, objektai ir herojus, kuris gali eiti.

import type { KovosRusis } from '../game/engine';
import type { Iranga } from '../game/types';
import { deme, durys, herojusSonu, kaukas, lauzas, rodykliuStulpas, skrynia, slaptosDurys, urvoFonas } from './art';
import { h, sumazintasJudesys, svg } from './dom';

/** Vietos scenoje (procentais nuo kairės). */
export const X = {
  kaireDurys: 3,
  iejimas: 10,
  priesObjekta: 40,
  objektas: 66,
  desineDurys: 92,
  stulpas: 22,
  slaptos: 38,
  durysA: 60,
  durysB: 84,
  kova: 26,
};

export type ScenosObjektas =
  | { tipas: 'deme'; rusis: KovosRusis; virsus?: HTMLElement; klases?: string }
  | { tipas: 'skrynia'; atidaryta: boolean }
  | { tipas: 'kaukas' }
  | { tipas: 'lauzas'; melynas: boolean };

export interface ScenosParametrai {
  kaireDurys: 'uzdarytos' | 'atidarytos' | null;
  desineDurys: 'uzdarytos' | 'atidarytos' | 'isejimas' | null;
  sankryza?: { stulpas: boolean; slaptos: boolean | null };
  objektas: ScenosObjektas | null;
  iranga: Iranga;
  apsiaustas: boolean;
  herojus: { x: number; iki?: number; trukme?: number; klases?: string };
  virsuje?: HTMLElement | null;
  klase?: string;
}

const padeti = (el: HTMLElement, x: number, klase: string) => {
  el.classList.add('scenos-daiktas', klase);
  el.style.left = `${x}%`;
  return el;
};

export function scena(p: ScenosParametrai): HTMLElement {
  const vaikai: HTMLElement[] = [svg(urvoFonas(), 'scenos-fonas')];
  if (p.kaireDurys) vaikai.push(padeti(svg(durys(p.kaireDurys)), X.kaireDurys + 2, 'durys-sonines'));
  if (p.desineDurys) vaikai.push(padeti(svg(durys(p.desineDurys)), X.desineDurys + 2, 'durys-sonines'));
  if (p.sankryza) {
    if (p.sankryza.stulpas) vaikai.push(padeti(svg(rodykliuStulpas()), X.stulpas, 'stulpas'));
    if (p.sankryza.slaptos !== null) vaikai.push(padeti(svg(slaptosDurys(p.sankryza.slaptos)), X.slaptos, 'slaptos-durys'));
    vaikai.push(padeti(svg(durys('atidarytos')), X.durysA, 'durys-galines'));
    vaikai.push(padeti(svg(durys('atidarytos')), X.durysB, 'durys-galines'));
  }
  const o = p.objektas;
  if (o) {
    let el: HTMLElement;
    if (o.tipas === 'deme') {
      el = h('div', { class: `scenos-priesas priesas-${o.rusis} ${o.klases ?? ''}` }, o.virsus ?? null, svg(deme(o.rusis), 'demes-piesinys'));
    } else if (o.tipas === 'skrynia') el = svg(skrynia(o.atidaryta), 'skrynia');
    else if (o.tipas === 'kaukas') el = svg(kaukas(80), 'scenos-kaukas');
    else el = svg(lauzas(o.melynas ? 'melyna' : 'iprasta', 100), 'scenos-lauzas');
    vaikai.push(padeti(el, X.objektas, 'objektas'));
  }

  const herojus = h(
    'div',
    { class: `scenos-herojus ${p.herojus.klases ?? ''}`, 'data-herojus': '1' },
    svg(herojusSonu(p.iranga, p.apsiaustas)),
  );
  herojus.style.left = `${p.herojus.x}%`;
  vaikai.push(herojus);
  if (p.herojus.iki !== undefined && p.herojus.iki !== p.herojus.x) {
    const trukme = sumazintasJudesys() ? 1 : (p.herojus.trukme ?? 600);
    herojus.style.transitionDuration = `${trukme}ms`;
    herojus.classList.add('eina');
    if (p.herojus.iki < p.herojus.x) herojus.classList.add('atgal');
    const iki = p.herojus.iki;
    // Paleidžiama po to, kai elementas atsiranda puslapyje.
    requestAnimationFrame(() => requestAnimationFrame(() => (herojus.style.left = `${iki}%`)));
  }

  return h('div', { class: `scena ${p.klase ?? ''}` }, vaikai, p.virsuje ?? null);
}
