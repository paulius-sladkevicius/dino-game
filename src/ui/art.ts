// „Rašalas ant popieriaus“ piešiniai. Spalvos – iš eskizo „Knyga“.

import type { Daiktas, Iranga, Kosmetika, Lygis } from '../game/types';

export const SPALVOS = {
  popierius: '#f3ead8',
  popieriusSviesus: '#fbf6ea',
  linija: '#e6d9bf',
  rasalas: '#24233f',
  deme: '#23223f',
  demesBlizgesys: '#4a4874',
  raudonas: '#c2413a',
  raudonasTamsus: '#8a2f28',
  melynas: '#2f5d9e',
  melynasSviesus: '#dbe7f7',
  rudas: '#5a4a3a',
};

const R = SPALVOS.rasalas;

/** Medžiagų spalvos: medinis rudas … deimantinis mėlynai žėri. */
export const MEDZIAGOS = ['#8b5a2b', '#b87333', '#6e7377', '#a9b4c2', '#d4a017', '#3fa7d6'];

export function sirdele(pilna: boolean, dydis = 30): string {
  const h = Math.round((dydis * 28) / 30);
  return `<svg width="${dydis}" height="${h}" viewBox="0 0 30 28"><path d="M15 25 C6 18 2 13 3 8 C4 3 10 1 15 7 C20 1 27 3 27 9 C27 14 22 19 15 25 Z" fill="${pilna ? SPALVOS.raudonas : 'none'}" stroke="${R}" stroke-width="2" stroke-linejoin="round" ${pilna ? '' : 'stroke-dasharray="3 3"'}/>${pilna ? `<path d="M8 8 C9 6 11 6 12 7" fill="none" stroke="${SPALVOS.popierius}" stroke-width="2" stroke-linecap="round"/>` : ''}</svg>`;
}

export function manosLasas(dydis = 20): string {
  const h = Math.round((dydis * 28) / 20);
  return `<svg width="${dydis}" height="${h}" viewBox="0 0 20 28"><path d="M10 2 C14 10 18 14 18 19 C18 24 14 27 10 27 C6 27 2 24 2 19 C2 14 6 10 10 2 Z" fill="${SPALVOS.melynas}" stroke="${R}" stroke-width="2"/><path d="M6 19 C6 22 8 23 9 23" fill="none" stroke="${SPALVOS.melynasSviesus}" stroke-width="2" stroke-linecap="round"/></svg>`;
}

export function zvaigzdute(pilna: boolean, dydis = 34): string {
  return `<svg width="${dydis}" height="${dydis}" viewBox="0 0 34 34"><path d="M17 3 L21 13 L31 13.5 L23 20 L26 30 L17 24.5 L8 30 L11 20 L3 13.5 L13 13 Z" fill="${pilna ? '#d9a42b' : 'none'}" stroke="${R}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

const akys = (x1: number, x2: number, y: number, r = 14) =>
  `<ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r + 2}" fill="${SPALVOS.popieriusSviesus}"/><ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r + 2}" fill="${SPALVOS.popieriusSviesus}"/><circle cx="${x1 + 4}" cy="${y + 5}" r="${r * 0.43}" fill="${SPALVOS.deme}"/><circle cx="${x2 + 4}" cy="${y + 5}" r="${r * 0.43}" fill="${SPALVOS.deme}"/>`;

const purslai = `<circle cx="28" cy="58" r="6" fill="${SPALVOS.deme}"/><circle cx="182" cy="48" r="4" fill="${SPALVOS.deme}"/><circle cx="190" cy="138" r="5" fill="${SPALVOS.deme}"/><circle cx="36" cy="168" r="3" fill="${SPALVOS.deme}"/><circle cx="170" cy="172" r="2.5" fill="${SPALVOS.deme}"/>`;

/** Priešai – tamsios dėmės su purslais ir baltomis akimis. */
export function deme(rusis: 'mazas' | 'vidutinis' | 'bosas' | 'pabeges'): string {
  const d = SPALVOS.deme;
  const sypsena = `<path d="M90 126 Q100 134 108 126 Q114 120 120 128" fill="none" stroke="${SPALVOS.popieriusSviesus}" stroke-width="3" stroke-linecap="round"/>`;
  if (rusis === 'mazas') {
    return `<svg viewBox="0 0 210 200" role="img" aria-label="Rašalo lašelis"><circle cx="50" cy="150" r="5" fill="${d}"/><circle cx="160" cy="70" r="4" fill="${d}"/><circle cx="168" cy="160" r="3" fill="${d}"/><path d="M105 30 C122 70 152 96 152 132 C152 162 130 182 105 182 C80 182 58 162 58 132 C58 96 88 70 105 30 Z" fill="${d}"/><path d="M84 110 C84 96 92 84 100 80" fill="none" stroke="${SPALVOS.demesBlizgesys}" stroke-width="5" stroke-linecap="round"/>${akys(88, 122, 128, 11)}<path d="M96 158 Q105 165 114 158" fill="none" stroke="${SPALVOS.popieriusSviesus}" stroke-width="3" stroke-linecap="round"/></svg>`;
  }
  if (rusis === 'bosas') {
    return `<svg viewBox="0 0 240 220" role="img" aria-label="Didžioji Dėmė"><circle cx="20" cy="70" r="8" fill="${d}"/><circle cx="222" cy="52" r="6" fill="${d}"/><circle cx="228" cy="160" r="7" fill="${d}"/><circle cx="30" cy="190" r="5" fill="${d}"/><circle cx="200" cy="205" r="4" fill="${d}"/><path d="M70 40 L82 14 L96 38 L112 8 L128 38 L144 14 L156 42 C196 40 222 74 210 108 C232 124 222 160 196 166 C200 192 170 206 146 194 C138 208 126 216 118 214 C110 214 100 206 96 196 C74 206 46 194 48 170 C20 164 12 128 34 112 C16 88 34 50 70 40 Z" fill="${d}"/><path d="M60 80 C66 66 80 58 94 56" fill="none" stroke="${SPALVOS.demesBlizgesys}" stroke-width="6" stroke-linecap="round"/>${akys(78, 162, 112, 15)}<ellipse cx="120" cy="88" rx="13" ry="15" fill="${SPALVOS.popieriusSviesus}"/><circle cx="123" cy="93" r="6" fill="${d}"/><path d="M88 160 Q102 172 118 160 Q134 150 150 162" fill="none" stroke="${SPALVOS.popieriusSviesus}" stroke-width="4" stroke-linecap="round"/></svg>`;
  }
  const kunas = `<path d="M100 30 C130 20 160 40 165 70 C185 80 182 110 165 122 C170 140 150 158 128 150 C122 160 118 186 112 190 C106 186 106 160 104 156 C96 152 88 158 84 160 C70 170 50 160 52 140 C30 136 22 110 38 96 C26 76 44 50 66 52 C72 36 86 32 100 30 Z" fill="${d}"/><path d="M72 62 C78 52 90 46 100 46" fill="none" stroke="${SPALVOS.demesBlizgesys}" stroke-width="5" stroke-linecap="round"/>${akys(85, 125, 95)}${sypsena}`;
  if (rusis === 'pabeges') {
    return `<svg viewBox="0 0 210 200" role="img" aria-label="Pabėgusi Dėmė"><path d="M10 80 H34 M4 104 H30 M14 128 H36" stroke="${d}" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 6"/>${kunas}<path d="M76 158 L66 186 M136 150 L150 182" stroke="${d}" stroke-width="7" stroke-linecap="round"/></svg>`;
  }
  return `<svg viewBox="0 0 210 200" role="img" aria-label="Rašalo dėmė">${purslai}${kunas}</svg>`;
}

/** Aitvarėlis Žiežirba. Kuo daugiau grąžintų puslapių, tuo ryškesnė ugnis. */
export function ziezirba(ryskumas: number, kepure: boolean, dydis = 64): string {
  const liepsna = ryskumas <= 0 ? ['#a8a3b5', '#d7d2de'] : ['#e8742c', '#f6c344'];
  const kep = kepure
    ? `<path d="M19 37 L17 18 L31 30 Z" fill="${SPALVOS.raudonas}" stroke="${R}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="17" cy="18" r="2.5" fill="${SPALVOS.popieriusSviesus}" stroke="${R}" stroke-width="1"/>`
    : '';
  return `<svg width="${dydis}" height="${dydis}" viewBox="-2 -4 76 80" role="img" aria-label="Žiežirba"><path d="M36 30 C40 22 42 16 37 6 C34 14 30 16 30 24 C30 28 32 30 36 30 Z" fill="${liepsna[0]}" stroke="${R}" stroke-width="1.6"/><path d="M36 28 C38 24 38 20 36 16 C34 20 33 24 36 28 Z" fill="${liepsna[1]}"/>${kep}<path d="M37 26 L56 42 L37 62 L18 42 Z" fill="${SPALVOS.popieriusSviesus}" stroke="${R}" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 42 L4 34 L10 46 Z M56 42 L70 34 L64 46 Z" fill="${SPALVOS.melynasSviesus}" stroke="${R}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="31" cy="40" r="2.6" fill="${R}"/><circle cx="43" cy="40" r="2.6" fill="${R}"/><path d="M32 48 Q37 52 42 48" fill="none" stroke="${R}" stroke-width="1.8" stroke-linecap="round"/><path d="M37 62 C34 68 42 70 38 76" fill="none" stroke="${R}" stroke-width="1.8" stroke-linecap="round"/><path d="M33 68 L37 66 L35 71 Z" fill="${SPALVOS.raudonas}"/></svg>`;
}

/** Herojus su įranga: kiekvienas lygis matomas pagal medžiagos spalvą. */
export function herojus(iranga: Iranga, apsiaustas: boolean, dydis = 120): string {
  const m = (d: Daiktas) => MEDZIAGOS[iranga[d]];
  const zeri = (d: Daiktas) => (iranga[d] === 5 ? `filter="url(#zeri)"` : '');
  const aps = apsiaustas
    ? `<path d="M40 58 C30 80 28 104 26 124 L74 124 C72 104 70 80 60 58 Z" fill="${SPALVOS.raudonas}" stroke="${R}" stroke-width="2" stroke-linejoin="round"/>`
    : '';
  return `<svg width="${dydis}" height="${Math.round(dydis * 1.15)}" viewBox="0 0 110 132" role="img" aria-label="Herojus"><defs><filter id="zeri"><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#7fd3ff"/></filter></defs>${aps}<path d="M86 30 L92 92" stroke="${m('kardas')}" stroke-width="6" stroke-linecap="round" ${zeri('kardas')}/><path d="M86 30 L92 92" stroke="${R}" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M80 78 L98 76" stroke="${R}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="38" r="15" fill="${SPALVOS.popieriusSviesus}" stroke="${R}" stroke-width="2.2"/><path d="M34 34 C34 18 66 18 66 34 L66 30 C62 26 38 26 34 30 Z" fill="${m('salmas')}" stroke="${R}" stroke-width="2.2" stroke-linejoin="round" ${zeri('salmas')}/><circle cx="45" cy="40" r="2" fill="${R}"/><circle cx="55" cy="40" r="2" fill="${R}"/><path d="M45 46 Q50 50 55 46" fill="none" stroke="${R}" stroke-width="1.8" stroke-linecap="round"/><path d="M36 56 L64 56 L68 96 L32 96 Z" fill="${m('sarvai')}" stroke="${R}" stroke-width="2.2" stroke-linejoin="round" ${zeri('sarvai')}/><path d="M50 58 L50 94 M36 74 L64 74" stroke="${R}" stroke-width="1.2" opacity="0.5"/><path d="M36 60 L22 84 M64 60 L84 78" stroke="${R}" stroke-width="5" stroke-linecap="round"/><path d="M40 96 L38 116 M60 96 L62 116" stroke="${R}" stroke-width="5" stroke-linecap="round"/><path d="M30 114 L44 114 L44 124 L28 124 Z M56 114 L70 114 L72 124 L56 124 Z" fill="${m('batai')}" stroke="${R}" stroke-width="2" stroke-linejoin="round" ${zeri('batai')}/></svg>`;
}

export function kaukas(dydis = 70): string {
  return `<svg width="${dydis}" height="${dydis}" viewBox="0 0 70 80" role="img" aria-label="Kaukas"><path d="M20 34 L35 2 L50 34 Z" fill="${SPALVOS.raudonasTamsus}" stroke="${R}" stroke-width="2" stroke-linejoin="round"/><circle cx="35" cy="40" r="11" fill="${SPALVOS.popieriusSviesus}" stroke="${R}" stroke-width="2"/><circle cx="31" cy="39" r="1.8" fill="${R}"/><circle cx="39" cy="39" r="1.8" fill="${R}"/><path d="M24 44 C24 62 46 62 46 44 C42 50 28 50 24 44 Z" fill="#e9e1cf" stroke="${R}" stroke-width="2"/><path d="M24 58 L20 78 L50 78 L46 58 Z" fill="#6b7d4a" stroke="${R}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

export function lauzas(spalva: 'iprasta' | 'melyna', dydis = 110): string {
  const [a, b] = spalva === 'melyna' ? ['#3b7fd1', '#9fe0ff'] : ['#e8742c', '#f6c344'];
  return `<svg width="${dydis}" height="${dydis}" viewBox="0 0 110 110" role="img" aria-label="Laužas"><path d="M55 14 C70 36 80 48 76 66 C74 80 64 86 55 86 C44 86 34 80 33 66 C31 52 44 44 46 30 C52 40 54 44 55 14 Z" fill="${a}" stroke="${R}" stroke-width="2.2" stroke-linejoin="round" class="liepsna"/><path d="M55 44 C62 56 66 62 64 72 C62 80 48 80 46 72 C45 64 52 58 55 44 Z" fill="${b}"/><path d="M18 96 L92 80 M18 80 L92 96" stroke="#7a4b28" stroke-width="9" stroke-linecap="round"/><path d="M18 96 L92 80 M18 80 L92 96" stroke="${R}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.7"/></svg>`;
}

export function knygosIkona(dydis = 34): string {
  return `<svg width="${dydis}" height="${dydis}" viewBox="0 0 34 34"><path d="M17 8 C12 5 7 5 3 6 L3 28 C7 27 12 27 17 30 C22 27 27 27 31 28 L31 6 C27 5 22 5 17 8 Z" fill="${SPALVOS.popieriusSviesus}" stroke="${R}" stroke-width="2" stroke-linejoin="round"/><path d="M17 8 L17 30" stroke="${R}" stroke-width="2"/><path d="M7 12 H13 M7 17 H13 M21 12 H27 M21 17 H27" stroke="${SPALVOS.melynas}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
}

export function uzraktas(dydis = 26): string {
  return `<svg width="${dydis}" height="${dydis}" viewBox="0 0 26 26"><rect x="5" y="11" width="16" height="12" rx="2" fill="none" stroke="${R}" stroke-width="2"/><path d="M8 11 V8 C8 2 18 2 18 8 V11" fill="none" stroke="${R}" stroke-width="2"/></svg>`;
}

export function daiktoIkona(daiktas: Daiktas, lygis: Lygis, dydis = 44): string {
  const c = MEDZIAGOS[lygis];
  const f = lygis === 5 ? `filter="url(#zeri-${daiktas})"` : '';
  const defs = `<defs><filter id="zeri-${daiktas}"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#7fd3ff"/></filter></defs>`;
  const kunas: Record<Daiktas, string> = {
    kardas: `<path d="M30 6 L36 10 L16 32 L12 28 Z" fill="${c}" stroke="${R}" stroke-width="2" stroke-linejoin="round" ${f}/><path d="M8 26 L18 36 M12 32 L6 38" stroke="${R}" stroke-width="3" stroke-linecap="round"/>`,
    salmas: `<path d="M8 28 C8 12 36 12 36 28 L36 32 L8 32 Z" fill="${c}" stroke="${R}" stroke-width="2" stroke-linejoin="round" ${f}/><path d="M22 14 L22 32" stroke="${R}" stroke-width="1.5" opacity="0.6"/>`,
    sarvai: `<path d="M10 10 L34 10 L38 36 L6 36 Z" fill="${c}" stroke="${R}" stroke-width="2" stroke-linejoin="round" ${f}/><path d="M16 10 C16 16 28 16 28 10" fill="none" stroke="${R}" stroke-width="2"/>`,
    batai: `<path d="M8 8 L18 8 L18 28 L30 30 C36 31 38 34 38 38 L8 38 Z" fill="${c}" stroke="${R}" stroke-width="2" stroke-linejoin="round" ${f}/>`,
  };
  return `<svg width="${dydis}" height="${dydis}" viewBox="0 0 44 44">${defs}${kunas[daiktas]}</svg>`;
}

export function rodykle(kryptis: 'aukstyn' | 'zemyn' | 'lygu', dydis = 40): string {
  const spalva = kryptis === 'aukstyn' ? '#3d7a3a' : kryptis === 'zemyn' ? SPALVOS.raudonas : SPALVOS.rudas;
  const kelias =
    kryptis === 'aukstyn'
      ? 'M20 6 L32 20 L24 20 L24 34 L16 34 L16 20 L8 20 Z'
      : kryptis === 'zemyn'
        ? 'M20 34 L32 20 L24 20 L24 6 L16 6 L16 20 L8 20 Z'
        : 'M6 14 H34 M6 26 H34';
  return kryptis === 'lygu'
    ? `<svg width="${dydis}" height="${dydis}" viewBox="0 0 40 40"><path d="${kelias}" stroke="${spalva}" stroke-width="4" stroke-linecap="round"/></svg>`
    : `<svg width="${dydis}" height="${dydis}" viewBox="0 0 40 40"><path d="${kelias}" fill="${spalva}" stroke="${R}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

/** Kambarių ženkliukai žemėlapyje. */
export function kambarioIkona(tipas: string, dydis = 34): string {
  const s = `width="${dydis}" height="${dydis}" viewBox="0 0 34 34"`;
  switch (tipas) {
    case 'lauzas':
      return `<svg ${s}><path d="M17 4 C24 14 26 18 24 24 C22 28 12 28 10 24 C8 18 14 16 15 10 C16 14 17 14 17 4 Z" fill="#e8742c" stroke="${R}" stroke-width="1.8"/><path d="M6 30 L28 26 M6 26 L28 30" stroke="#7a4b28" stroke-width="3.5" stroke-linecap="round"/></svg>`;
    case 'priesas':
      return `<svg ${s}><path d="M17 4 C22 3 27 7 28 12 C32 14 31 19 28 21 C29 25 25 28 21 26 C19 30 15 30 13 27 C8 29 4 25 6 21 C2 18 3 12 7 11 C7 6 12 4 17 4 Z" fill="${SPALVOS.deme}"/><circle cx="13" cy="15" r="3" fill="${SPALVOS.popieriusSviesus}"/><circle cx="21" cy="15" r="3" fill="${SPALVOS.popieriusSviesus}"/></svg>`;
    case 'sankryza':
      return `<svg ${s}><path d="M17 6 V31" stroke="${R}" stroke-width="2.5"/><path d="M17 8 H28 L31 11 L28 14 H17 Z M17 17 H6 L3 20 L6 23 H17 Z" fill="${SPALVOS.popieriusSviesus}" stroke="${R}" stroke-width="2" stroke-linejoin="round"/></svg>`;
    case 'lobis':
      return `<svg ${s}><path d="M5 14 H29 V28 H5 Z" fill="#b8742c" stroke="${R}" stroke-width="2"/><path d="M5 14 C5 6 29 6 29 14" fill="#d79a3c" stroke="${R}" stroke-width="2"/><rect x="14" y="16" width="6" height="6" fill="#f6c344" stroke="${R}" stroke-width="1.5"/></svg>`;
    case 'slaptas':
      return `<svg ${s}><path d="M8 30 V10 C8 2 26 2 26 10 V30 Z" fill="#7a5a3a" stroke="${R}" stroke-width="2"/><circle cx="22" cy="19" r="1.8" fill="#f6c344"/><path d="M17 9 L18.5 12.5 L22 13 L19.5 15 L20.5 18.5 L17 16.5 L13.5 18.5 L14.5 15 L12 13 L15.5 12.5 Z" fill="#f6c344"/></svg>`;
    case 'galas':
      return `<svg ${s}><path d="M6 30 V14 C6 4 28 4 28 14 V30" fill="none" stroke="${R}" stroke-width="2.5"/><path d="M12 30 H22 M14 25 H24 M16 20 H26" stroke="${R}" stroke-width="2" stroke-linecap="round"/></svg>`;
    default:
      return '';
  }
}

export function banga(plotis = 240): string {
  return `<svg width="${plotis}" height="14" viewBox="0 0 240 14" preserveAspectRatio="none"><path d="M4 8 C40 4 70 11 110 7 C150 3 190 10 236 6" fill="none" stroke="${R}" stroke-width="2" stroke-linecap="round"/></svg>`;
}

export const KOSMETIKOS_VARDAI: Record<Kosmetika, string> = {
  kepure: 'Žiežirbos kepurė',
  apsiaustas: 'herojaus apsiaustas',
  lauzoSpalva: 'mėlyna laužo ugnis',
};

// ------------------------------------------------------------------ Vaizdas iš šono

/** Herojus iš šono (žiūri į dešinę). Kojos turi klases, kad galėtų „eiti“. */
export function herojusSonu(iranga: Iranga, apsiaustas: boolean): string {
  const m = (d: Daiktas) => MEDZIAGOS[iranga[d]];
  const zeri = (d: Daiktas) => (iranga[d] === 5 ? `filter="url(#zeri-sonu)"` : '');
  const aps = apsiaustas
    ? `<path d="M30 44 C18 60 14 84 12 98 L34 96 L38 46 Z" fill="${SPALVOS.raudonas}" stroke="${R}" stroke-width="2" stroke-linejoin="round"/>`
    : '';
  const koja = (klase: string, x: number) =>
    `<g class="koja ${klase}"><path d="M${x} 82 L${x} 104" stroke="${R}" stroke-width="5" stroke-linecap="round"/><path d="M${x - 5} 102 L${x + 9} 102 L${x + 11} 110 L${x - 5} 110 Z" fill="${m('batai')}" stroke="${R}" stroke-width="2" stroke-linejoin="round" ${zeri('batai')}/></g>`;
  return `<svg viewBox="0 0 90 114" role="img" aria-label="Herojus"><defs><filter id="zeri-sonu"><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#7fd3ff"/></filter></defs>${aps}${koja('koja-2', 36)}<path d="M28 46 L52 46 L54 84 L26 84 Z" fill="${m('sarvai')}" stroke="${R}" stroke-width="2.2" stroke-linejoin="round" ${zeri('sarvai')}/>${koja('koja-1', 44)}<circle cx="42" cy="28" r="14" fill="${SPALVOS.popieriusSviesus}" stroke="${R}" stroke-width="2.2"/><path d="M55 28 L60 31 L55 33" fill="${SPALVOS.popieriusSviesus}" stroke="${R}" stroke-width="2" stroke-linejoin="round"/><circle cx="49" cy="26" r="2" fill="${R}"/><path d="M47 35 Q51 37 54 35" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round"/><path d="M27 26 C27 10 57 10 57 24 L57 22 C50 18 34 18 27 22 Z" fill="${m('salmas')}" stroke="${R}" stroke-width="2.2" stroke-linejoin="round" ${zeri('salmas')}/><g class="ranka"><path d="M44 52 L62 62" stroke="${R}" stroke-width="5" stroke-linecap="round"/><path d="M60 64 L86 30" stroke="${m('kardas')}" stroke-width="6" stroke-linecap="round" ${zeri('kardas')}/><path d="M60 64 L86 30" stroke="${R}" stroke-width="1.4" stroke-linecap="round"/><path d="M56 56 L68 66" stroke="${R}" stroke-width="4" stroke-linecap="round"/></g></svg>`;
}

/** Durys šoninėje sienoje: uždarytos, atidarytos arba šviečiantis išėjimas. */
export function durys(busena: 'uzdarytos' | 'atidarytos' | 'isejimas'): string {
  const remas = `<path d="M6 120 V30 C6 4 54 4 54 30 V120" fill="none" stroke="${R}" stroke-width="3"/>`;
  if (busena === 'isejimas') {
    return `<svg viewBox="0 0 60 122" role="img" aria-label="Išėjimas"><defs><radialGradient id="sviesa" cx="50%" cy="40%"><stop offset="0" stop-color="#fff6c8"/><stop offset="1" stop-color="#f6c344"/></radialGradient></defs><path d="M6 120 V30 C6 4 54 4 54 30 V120 Z" fill="url(#sviesa)"/>${remas}<path d="M14 120 H46 M18 108 H50 M22 96 H52" stroke="${R}" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  }
  if (busena === 'atidarytos') {
    return `<svg viewBox="0 0 60 122" role="img" aria-label="Atidarytos durys"><path d="M6 120 V30 C6 4 54 4 54 30 V120 Z" fill="#2c2a40"/>${remas}<path d="M6 120 V30 L18 36 V116 Z" fill="#8b5a2b" stroke="${R}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }
  return `<svg viewBox="0 0 60 122" role="img" aria-label="Uždarytos durys"><path d="M6 120 V30 C6 4 54 4 54 30 V120 Z" fill="#9a6a3a" stroke="${R}" stroke-width="3"/><path d="M22 14 V120 M38 14 V120" stroke="${R}" stroke-width="1.5" opacity="0.5"/><circle cx="44" cy="70" r="3" fill="#f6c344" stroke="${R}" stroke-width="1.2"/></svg>`;
}

/** Slaptos durys sienoje: plyšys su klaustuku arba atsivėrusios durys su žvaigžde. */
export function slaptosDurys(atidarytos: boolean): string {
  return atidarytos
    ? `<svg viewBox="0 0 50 90" role="img" aria-label="Slaptos durys atidarytos"><path d="M5 88 V24 C5 4 45 4 45 24 V88 Z" fill="#2c2a40" stroke="${R}" stroke-width="2.5"/><path d="M25 30 L28 38 L36 38 L30 43 L32 51 L25 46 L18 51 L20 43 L14 38 L22 38 Z" fill="#f6c344"/></svg>`
    : `<svg viewBox="0 0 50 90" role="img" aria-label="Plyšys sienoje"><path d="M5 88 V24 C5 4 45 4 45 24 V88" fill="none" stroke="${R}" stroke-width="2" stroke-dasharray="4 5" opacity="0.6"/><text x="25" y="58" text-anchor="middle" font-family="Caveat, cursive" font-size="34" font-weight="700" fill="${R}" opacity="0.7">?</text></svg>`;
}

export function rodykliuStulpas(): string {
  return `<svg viewBox="0 0 70 110" role="img" aria-label="Kelio ženklas"><path d="M35 20 V108" stroke="#7a4b28" stroke-width="6" stroke-linecap="round"/><path d="M35 22 H62 L68 30 L62 38 H35 Z" fill="#efe0c2" stroke="${R}" stroke-width="2" stroke-linejoin="round"/><path d="M35 46 H8 L2 54 L8 62 H35 Z" fill="#efe0c2" stroke="${R}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

export function skrynia(atidaryta: boolean): string {
  return atidaryta
    ? `<svg viewBox="0 0 70 56" role="img" aria-label="Atidaryta skrynia"><path d="M5 26 H65 V54 H5 Z" fill="#b8742c" stroke="${R}" stroke-width="2"/><path d="M5 26 L12 4 H58 L65 26" fill="#d79a3c" stroke="${R}" stroke-width="2" stroke-linejoin="round"/><path d="M10 26 H60" stroke="#f6c344" stroke-width="4"/></svg>`
    : `<svg viewBox="0 0 70 56" role="img" aria-label="Skrynia"><path d="M5 24 H65 V54 H5 Z" fill="#b8742c" stroke="${R}" stroke-width="2"/><path d="M5 24 C5 6 65 6 65 24" fill="#d79a3c" stroke="${R}" stroke-width="2"/><rect x="30" y="26" width="10" height="10" fill="#f6c344" stroke="${R}" stroke-width="1.5"/></svg>`;
}

/** Urvo fonas iš šono: lubos su varvekliais, siena, grindys. */
export function urvoFonas(): string {
  const varvekliai = [8, 22, 37, 55, 70, 86]
    .map((x, i) => `<path d="M${x - 3} 0 L${x} ${10 + (i % 3) * 6} L${x + 3} 0 Z" fill="${SPALVOS.rasalas}" opacity="0.75"/>`)
    .join('');
  const akmenukai = [12, 31, 47, 66, 83]
    .map((x, i) => `<ellipse cx="${x}" cy="${93 + (i % 2)}" rx="${1.4 + (i % 3) * 0.5}" ry="0.9" fill="${SPALVOS.rasalas}" opacity="0.5"/>`)
    .join('');
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="urvo-fonas"><path d="M0 0 H100 V6 C88 9 78 4 66 7 C52 10 40 5 26 8 C14 10 6 6 0 8 Z" fill="#d9ccb0"/>${varvekliai}<path d="M0 86 C20 84 40 88 60 85 C76 83 90 87 100 85 V100 H0 Z" fill="#e3d6ba"/><path d="M0 86 C20 84 40 88 60 85 C76 83 90 87 100 85" fill="none" stroke="${SPALVOS.rasalas}" stroke-width="2" vector-effect="non-scaling-stroke"/>${akmenukai}</svg>`;
}
