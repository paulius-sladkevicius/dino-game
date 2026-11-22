// Kovos ekranas (pagal eskizą „Knyga“) ir raidžių skrydis į Knygą.

import { skyrius } from '../content';
import { burtasIsmoktas, dabartineUzduotis, galimaBurta, saleSkyrius } from '../game/engine';
import { maxMana, maxSirdeles } from '../game/equipment';
import { BURTAI, type Burtas } from '../game/rules';
import type { Zaidimas } from './app';
import { knygosIkona, manosLasas, sirdele, SPALVOS, pteriukas } from './art';
import { scena, X } from './scena';
import { h, sumazintasJudesys, svg } from './dom';
import { skaitomasTekstas, uzuominosRibos } from './skaitymas';
import { sakiniuRibos, zodziuSkaicius } from '../game/text';
import { BURTU_VARDAI, priesoPiesinys, TEMA } from './tema';

const BURTU_EILE: Burtas[] = ['sviesele', 'skiemenys', 'skydas', 'perskilimas', 'ugnies', 'gydymas'];

export function hud(z: Zaidimas, papildomai?: HTMLElement): HTMLElement {
  const b = z.b;
  const max = maxSirdeles(b.iranga);
  const sirdeles = h(
    'div',
    { class: 'sirdeles', role: 'img', 'aria-label': `${b.sirdeles} širdelės iš ${max}`, 'data-sirdeles': b.sirdeles },
    Array.from({ length: max }, (_, i) => svg(sirdele(i < b.sirdeles, max > 5 ? 26 : 30))),
  );
  const mana = h(
    'div',
    { class: 'mana', role: 'img', 'aria-label': `${TEMA.mana} ${b.mana} iš ${maxMana(b.iranga)}`, 'data-mana': b.mana },
    svg(manosLasas(20)),
    h('span', { class: 'mana-skaicius' }, `${b.mana} / ${maxMana(b.iranga)}`),
  );
  return h('header', { class: 'hud' }, sirdeles, papildomai ?? svg(knygosIkona(30), 'knygos-tikslas'), mana);
}

export function ziezirbosBurbulas(z: Zaidimas, tekstas: string | null): HTMLElement | null {
  if (!tekstas) return null;
  return h(
    'div',
    { class: 'ziezirba-sako', role: 'status', 'aria-live': 'polite' },
    svg(pteriukas(z.b.puslapiai.length, z.b.kosmetika.includes('kepure'), 46)),
    h('p', { class: 'burbulas skaitymas' }, z.tekstas(tekstas)),
  );
}

export function burtoMygtukas(z: Zaidimas, burtas: Burtas): HTMLElement {
  const galima = galimaBurta(z.b, z.kova, burtas, z.t) && !z.animKova;
  const { vardas, aprasas } = BURTU_VARDAI[burtas];
  return h(
    'button',
    {
      type: 'button',
      class: `burtas burtas-${burtas}`,
      disabled: !galima,
      'data-fokusas': `burtas-${burtas}`,
      'data-burtas': burtas,
      title: aprasas,
      'aria-label': `${vardas}, kainuoja ${BURTAI[burtas].mana} gintaro. ${aprasas}`,
      onclick: () => z.burtas(burtas),
    },
    svg(manosLasas(12)),
    `${vardas} ${BURTAI[burtas].mana}`,
  );
}

/** Ilgas tekstas telefone rodomas dalimis (po kelis sakinius), kad nereikėtų slinkti. */
export function tekstoDalys(tekstas: string, maxZodziu = 22): [number, number][] {
  if (zodziuSkaicius(tekstas) <= 26) return [[0, tekstas.length]];
  const dalys: [number, number][] = [];
  let pradzia = 0;
  let zodziu = 0;
  for (const [a, b] of sakiniuRibos(tekstas)) {
    const n = zodziuSkaicius(tekstas.slice(a, b));
    if (zodziu > 0 && zodziu + n > maxZodziu) {
      dalys.push([pradzia, a]);
      pradzia = a;
      zodziu = 0;
    }
    zodziu += n;
  }
  dalys.push([pradzia, tekstas.length]);
  return dalys;
}

export function ekranasKova(z: Zaidimas): HTMLElement {
  const anim = z.animKova;
  const k = anim?.kova ?? z.kova!;
  const u = dabartineUzduotis(z.t, k);
  const sk = skyrius(z.t, k.sale ? saleSkyrius(z.t, k.sale) : z.b.skyrius);
  const tekstas = z.tekstas(u.tekstas);
  const ribos = anim ? {} : uzuominosRibos(tekstas, u.uzuomina && z.tekstas(u.uzuomina), k.uzuomina, k.sviesele);
  const nustatymai = { skiemenys: z.b.nustatymai.skiemenys };
  const gyvybes = anim ? k.gyvybes - 1 : k.gyvybes;

  const virsus = h(
    'div',
    { class: 'prieso-vardas' },
    h('span', { class: 'antraste-ranka' }, k.vardas),
    h(
      'span',
      { class: 'gyvybes', role: 'img', 'aria-label': `${gyvybes} gyvybės iš ${k.maxGyvybes}`, 'data-gyvybes': gyvybes },
      Array.from({ length: k.maxGyvybes }, (_, i) =>
        svg(
          `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="${i < gyvybes ? SPALVOS.raudonas : 'none'}" stroke="${SPALVOS.rasalas}" stroke-width="2"/></svg>`,
        ),
      ),
    ),
  );
  // Nugalėtas priešas susigeria ir išsitaško rašalo purslais.
  const purslai = anim?.nugaletas
    ? Array.from({ length: 10 }, (_, i) => {
        const kampas = (i / 10) * Math.PI * 2;
        const el = h('span', { class: 'purslas' });
        el.style.setProperty('--dx', `${Math.cos(kampas) * 70}px`);
        el.style.setProperty('--dy', `${Math.sin(kampas) * 50 - 20}px`);
        return el;
      })
    : [];
  const vaizdas = scena({
    kaireDurys: k.rusis === 'bosas' ? null : 'atidarytos',
    desineDurys: k.rusis === 'bosas' ? null : 'uzdarytos',
    objektas: {
      tipas: 'deme',
      rusis: k.rusis,
      piesinys: priesoPiesinys(z.t, z.b.skyrius, k.sale, k.rusis),
      virsus,
      klases: anim?.nugaletas ? 'susigeria' : anim ? 'smugis' : '',
    },
    iranga: z.b.iranga,
    apsiaustas: z.b.kosmetika.includes('apsiaustas'),
    herojus: { x: X.kova, klases: anim ? 'puola' : '' },
    klase: 'kovos-scena',
  });
  if (purslai.length) vaizdas.querySelector('.scenos-priesas')?.append(...purslai);

  // Ilgi tekstai – dalimis. Kai rodoma užuomina, atsiverčia dalis su ja.
  const dalys = tekstoDalys(tekstas);
  const uzuominosDalis = ribos.zodis ? dalys.findIndex(([a, b]) => ribos.zodis![0] >= a && ribos.zodis![0] < b) : -1;
  const dalis = Math.min(dalys.length - 1, Math.max(0, z.tekstoDalis ?? (uzuominosDalis >= 0 ? uzuominosDalis : 0)));
  const [dA, dB] = dalys[dalis];
  const rodomas = tekstas.slice(dA, dB).trim();
  const tarpas = tekstas.slice(dA, dB).length - tekstas.slice(dA, dB).trimStart().length;
  const poslinkis = (r: { zodis?: [number, number] | null; sakinys?: [number, number] | null }) => {
    const p = (x?: [number, number] | null): [number, number] | null => (x ? [x[0] - dA - tarpas, x[1] - dA - tarpas] : null);
    return { zodis: p(r.zodis), sakinys: p(r.sakinys) };
  };
  const dalysNav =
    dalys.length > 1
      ? h(
          'div',
          { class: 'teksto-dalys' },
          h('button', { type: 'button', class: 'antrinis ikonos-mygtukas', 'aria-label': 'Ankstesnė teksto dalis', 'data-dalis-atgal': '1', disabled: dalis === 0, onclick: () => z.rodytiDali(dalis - 1) }, '◀'),
          h('span', { class: 'dalies-nr' }, `${dalis + 1} / ${dalys.length}`),
          h('button', { type: 'button', class: 'antrinis ikonos-mygtukas', 'aria-label': 'Kita teksto dalis', 'data-dalis-pirmyn': '1', disabled: dalis === dalys.length - 1, onclick: () => z.rodytiDali(dalis + 1) }, '▶'),
        )
      : null;
  // Gudrybė „Skiemenys“: vaikas paliečia vieną žodį.
  const skiemenu = k.skiemenys && !anim ? { skaidomas: z.skiemenuZodis === null ? null : z.skiemenuZodis - dA - tarpas, liesti: (p: number) => z.suskaidytiZodi(p + dA + tarpas) } : undefined;

  const uzrakinta = Date.now() < z.uzraktasIki;
  const likoMs = Math.max(0, z.uzraktasIki - Date.now());
  const atsakymai = h(
    'div',
    {
      class: `atsakymai${uzrakinta ? ' uzrakinta' : ''}`,
      style: uzrakinta ? { '--uzraktas': `${likoMs}ms` } : undefined,
    },
    k.tvarka.map((i, poz) => {
      const a = u.atsakymai[i];
      if (k.pasalinti.includes(i)) return h('div', { class: 'atsakymas pasalintas', 'aria-hidden': 'true' });
      const teisingas = anim && anim.teisingas === i;
      return h(
        'button',
        {
          type: 'button',
          class: `atsakymas skaitymas kampai-${poz}${teisingas ? ' teisingas' : ''}`,
          disabled: z.uzrakinta,
          'data-atsakymas': a.tekstas,
          onclick: () => z.atsakyti(i),
        },
        skaitomasTekstas(z.tekstas(a.tekstas), nustatymai),
      );
    }),
  );

  return h(
    'main',
    { class: `ekranas kova${zodziuSkaicius(tekstas) > 10 ? ' ilgas-tekstas' : ''}`, 'data-ekranas': 'kova' },
    hud(z),
    h('p', { class: 'skyriaus-uzrasas antraste-ranka' }, `${sk.numeris} skyrius · ${sk.pavadinimas}`),
    vaizdas,
    ziezirbosBurbulas(z, z.zinute),
    h(
      'section',
      { class: 'teksto-kortele', 'aria-label': 'Tekstas', 'data-uzduotis': u.id },
      dalysNav,
      h('p', { class: 'tekstas skaitymas', lang: 'lt', 'data-dalis': dalis }, skaitomasTekstas(rodomas, nustatymai, poslinkis(ribos), skiemenu)),
      h('p', { class: 'klausimas skaitymas' }, skaitomasTekstas(z.tekstas(u.klausimas), nustatymai)),
    ),
    atsakymai,
    h('div', { class: 'burtai' }, BURTU_EILE.filter((x) => burtasIsmoktas(z.b, z.t, x)).map((x) => burtoMygtukas(z, x))),
  );
}

/** Perskaitytas sakinys virsta raidėmis ir skrenda į Knygą. */
export function skraidintiRaides(saknis: HTMLElement, nugaletas: boolean): Promise<void> {
  const tekstas = saknis.querySelector<HTMLElement>('.teksto-kortele .tekstas');
  const tikslas = saknis.querySelector<HTMLElement>('.knygos-tikslas');
  const trukme = nugaletas ? 1300 : 1000;
  if (!tekstas || !tikslas || sumazintasJudesys() || typeof Element.prototype.animate !== 'function') {
    return new Promise((r) => setTimeout(r, sumazintasJudesys() ? 500 : trukme));
  }
  const t = tikslas.getBoundingClientRect();
  const tx = t.left + t.width / 2;
  const ty = t.top + t.height / 2;
  const sluoksnis = h('div', { class: 'raidziu-sluoksnis', 'aria-hidden': 'true' });
  document.body.appendChild(sluoksnis);
  const stilius = getComputedStyle(tekstas);
  const raides: { r: string; x: number; y: number }[] = [];
  const walker = document.createTreeWalker(tekstas, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const s = n.textContent ?? '';
    for (let i = 0; i < s.length; i++) {
      if (!s[i].trim()) continue;
      range.setStart(n, i);
      range.setEnd(n, i + 1);
      const rect = range.getBoundingClientRect();
      raides.push({ r: s[i], x: rect.left, y: rect.top });
    }
  }
  tekstas.style.visibility = 'hidden';
  raides.forEach(({ r, x, y }, i) => {
    const el = h('span', { class: 'skrendanti-raide' }, r);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.fontSize = stilius.fontSize;
    sluoksnis.appendChild(el);
    const dx = tx - x;
    const dy = ty - y;
    const sukimas = (Math.random() - 0.5) * 120;
    el.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.3 + (Math.random() - 0.5) * 60}px, ${dy * 0.25 - 30}px) scale(1.1) rotate(${sukimas / 2}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.25) rotate(${sukimas}deg)`, opacity: 0.1 },
      ],
      { duration: trukme - 300, delay: Math.min(i * 12, 300), easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' },
    );
  });
  return new Promise((r) =>
    setTimeout(() => {
      sluoksnis.remove();
      r();
    }, trukme),
  );
}
