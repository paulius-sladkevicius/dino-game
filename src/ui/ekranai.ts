// Pradžios, istorijos, lygių žemėlapio, stovyklos, dienoraščio ir tėvų ekranai.

import { skyrius } from '../content';
import { bosasAtrakintas, bosasNugaletas, pasiektasSkyrius, rastiSale, saleAtrakinta, skyriusAtrakintas, pakeistiVarda } from '../game/engine';
import { VARDO_ILGIS } from '../game/rules';
import { sauksmininkas, sutvarkytiVarda } from '../game/text';
import type { Zaidimas } from './app';
import { dino, herojus, kambarioIkona, vezlys, knygosIkona, lauzas, palapine, uzraktas, zvaigzdute, pteriukas } from './art';
import { TEMA } from './tema';
import { h, svg } from './dom';
import { burtoMygtukas, hud, ziezirbosBurbulas } from './kova';
import { skaitomasTekstas } from './skaitymas';
import { nustatymuMygtukai } from './kambarys';
import { ISTORIJA, ZIEZIRBA, atsitiktine } from './tekstai';

const lauzoSpalva = (z: Zaidimas) => (z.b.kosmetika.includes('lauzoSpalva') ? 'melyna' : 'iprasta');
const zz = (z: Zaidimas, dydis: number) => svg(pteriukas(z.b.puslapiai.length, z.b.kosmetika.includes('kepure'), dydis));

// ------------------------------------------------------------------ Pradžia

export function ekranasPradzia(z: Zaidimas): HTMLElement {
  const b = z.busena;
  const virsus = h(
    'div',
    { class: 'pradzios-virsus' },
    h('h1', { class: 'pavadinimas antraste-ranka' }, TEMA.zaidimas),
    svg(dino('triceratopsas', false), 'pradzios-deme'),
  );
  if (!b) {
    const ivestis = h('input', {
      id: 'vardas',
      type: 'text',
      class: 'vardo-ivestis',
      maxlength: VARDO_ILGIS,
      autocomplete: 'off',
      autocapitalize: 'words',
      spellcheck: 'false',
      enterkeyhint: 'go',
      'data-fokusas': 'vardas',
    }) as HTMLInputElement;
    const mygtukas = h('button', { type: 'submit', class: 'pagrindinis', disabled: true }, 'Pradėti') as HTMLButtonElement;
    ivestis.addEventListener('input', () => {
      mygtukas.disabled = !sutvarkytiVarda(ivestis.value);
    });
    const forma = h(
      'form',
      {
        class: 'vardo-forma',
        onsubmit: (e: Event) => {
          e.preventDefault();
          const v = sutvarkytiVarda(ivestis.value, VARDO_ILGIS);
          if (v) z.pradetiNauja(v);
        },
      },
      h('label', { for: 'vardas', class: 'vardo-klausimas' }, 'Kuo tu vardu?'),
      ivestis,
      mygtukas,
    );
    return h('main', { class: 'ekranas pradzia', 'data-ekranas': 'pradzia' }, virsus, forma);
  }
  return h(
    'main',
    { class: 'ekranas pradzia', 'data-ekranas': 'pradzia' },
    virsus,
    h('div', { class: 'ziezirba-sako didelis' }, zz(z, 64), h('p', { class: 'burbulas skaitymas' }, `Labas, ${b.kreipinys}!`)),
    h('button', { type: 'button', class: 'pagrindinis', 'data-pirmas': '1', onclick: () => z.zaisti() }, 'Žaisti'),
    h(
      'div',
      { class: 'mygtuku-eile' },
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('knyga') }, svg(knygosIkona(28)), TEMA.knyga),
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('tevai') }, svg(uzraktas(24)), 'Tėvams'),
    ),
    h('div', { class: 'mygtuku-eile nustatymai-eile' }, nustatymuMygtukai(z)),
  );
}

// ------------------------------------------------------------------ Istorija

export function ekranasIstorija(z: Zaidimas): HTMLElement {
  const i = z.istorijosPsl;
  const paveikslai = [
    () => h('div', { class: 'paveikslas' }, svg(herojus(z.b.iranga, false, 100)), svg(dino('kompsognatas', false), 'mazas-piesinys')),
    () => h('div', { class: 'paveikslas' }, svg(dino('stegozauras'), 'mazas-piesinys'), svg(dino('triceratopsas'), 'mazas-piesinys')),
    () => h('div', { class: 'paveikslas' }, svg(dino('kompsognatas'), 'mazas-piesinys'), svg(dino('pterodaktilis'), 'mazas-piesinys'), svg(dino('ankilozauras'), 'mazas-piesinys')),
    () => h('div', { class: 'paveikslas' }, svg(pteriukas(0, false, 100)), svg(vezlys(90)), svg(lauzas('iprasta', 80))),
    () => h('div', { class: 'paveikslas' }, svg(herojus(z.b.iranga, false, 100)), svg(pteriukas(0, false, 90))),
  ];
  const paskutinis = i >= ISTORIJA.length - 1;
  return h(
    'main',
    { class: 'ekranas istorija', 'data-ekranas': 'istorija' },
    h('h1', { class: 'antraste-ranka' }, 'Istorija'),
    paveikslai[i](),
    h(
      'section',
      { class: 'teksto-kortele' },
      h('p', { class: 'tekstas skaitymas' }, skaitomasTekstas(z.tekstas(ISTORIJA[i]), { skiemenys: z.b.nustatymai.skiemenys })),
    ),
    h('p', { class: 'puslapio-nr' }, `${i + 1} / ${ISTORIJA.length}`),
    h(
      'button',
      {
        type: 'button',
        class: 'pagrindinis',
        'data-fokusas': 'istorija-toliau',
        onclick: () => {
          if (paskutinis) z.baigtiIstorija();
          else {
            z.istorijosPsl++;
            z.render();
          }
        },
      },
      paskutinis ? 'Pradėkime!' : 'Toliau',
    ),
  );
}

// ------------------------------------------------------------------ Lygių žemėlapis

export function ekranasSkyrius(z: Zaidimas): HTMLElement {
  const b = z.b;
  const sk = skyrius(z.t, b.skyrius);
  const lygiai = h(
    'div',
    { class: 'lygiu-pasirinkimas', role: 'group', 'aria-label': 'Lygiai' },
    z.t.skyriai.map((x) => {
      const atrakintas = skyriusAtrakintas(b, z.t, x.numeris);
      return h(
        'button',
        {
          type: 'button',
          class: `lygio-mygtukas${x.numeris === b.skyrius ? ' dabar' : ''}${bosasNugaletas(b, x.numeris) ? ' baigta' : ''}`,
          disabled: !atrakintas,
          'aria-label': `${x.numeris} lygis: ${x.pavadinimas}${atrakintas ? '' : ' (užrakinta)'}`,
          'aria-pressed': x.numeris === b.skyrius ? 'true' : 'false',
          'data-lygis': x.numeris,
          onclick: () => z.pasirinktiSkyriu(x.numeris),
        },
        h('span', { class: 'antraste-ranka lygio-nr' }, `${x.numeris}`),
        atrakintas ? (bosasNugaletas(b, x.numeris) ? svg(zvaigzdute(true, 18)) : null) : svg(uzraktas(18)),
      );
    }),
  );
  const korteles = sk.sales.map((s, i) => {
    const sb = b.sales[s.id];
    const atrakinta = saleAtrakinta(b, z.t, s.id);
    return h(
      'button',
      {
        type: 'button',
        class: `sales-korta kampai-${i % 4}${sb.baigta ? ' baigta' : ''}`,
        disabled: !atrakinta,
        'data-sale': s.id,
        onclick: () => z.eitiPrieSales(s.id),
      },
      h('span', { class: 'sales-nr antraste-ranka' }, `${i + 1}`),
      h('span', { class: 'sales-vardas' }, s.pavadinimas),
      atrakinta
        ? h('span', { class: 'mini-zvaigzdutes', 'aria-label': `${sb.zvaigzdutes} žvaigždutės` }, [1, 2, 3].map((n) => svg(zvaigzdute(n <= sb.zvaigzdutes, 22))))
        : svg(uzraktas(24)),
    );
  });
  const bosoAtrakintas = bosasAtrakintas(b, z.t);
  const nugaletas = bosasNugaletas(b);
  const bosas = h(
    'button',
    { type: 'button', class: `sales-korta boso-korta${nugaletas ? ' baigta' : ''}`, disabled: !bosoAtrakintas, 'data-sale': 'bosas', onclick: () => z.eitiPrieBoso() },
    svg(dino(sk.bosas.piesinys, !nugaletas), 'boso-ikona'),
    h('span', { class: 'sales-vardas' }, sk.bosas.vardas),
    bosoAtrakintas ? h('span', { class: 'mazas-tekstas' }, nugaletas ? 'Nurimo' : 'Didysis') : svg(uzraktas(24)),
  );
  const visiBaigti = z.t.skyriai.every((x) => bosasNugaletas(b, x.numeris));
  return h(
    'main',
    { class: 'ekranas skyrius', 'data-ekranas': 'skyrius' },
    hud(z),
    lygiai,
    h('h1', { class: 'antraste-ranka' }, `${sk.numeris} lygis · ${sk.pavadinimas}`),
    h('div', { class: 'saliu-sarasas' }, korteles, bosas),
    ziezirbosBurbulas(z, visiBaigti ? 'Visi dienoraščio puslapiai grįžo! Slėnyje vėl taika.' : z.zinute),
    h(
      'div',
      { class: 'mygtuku-eile apacioje' },
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('knyga') }, svg(knygosIkona(28)), TEMA.knyga),
      h('button', { type: 'button', class: 'antrinis', onclick: () => { z.ekranas = 'pradzia'; z.render(); } }, 'Pradžia'),
    ),
  );
}

// ------------------------------------------------------------------ Stovykla

export function ekranasLauzas(z: Zaidimas): HTMLElement {
  const b = z.b;
  const boso = b.vieta.kur === 'bosoLauzas';
  const sale = b.vieta.kur === 'lauzas' ? rastiSale(z.t, b.vieta.sale) : null;
  const pavadinimas = boso ? TEMA.bosoLauzas : `${TEMA.lauzas} · ${sale?.pavadinimas ?? ''}`;
  const zinute = z.zinute ?? (boso ? ZIEZIRBA.bosoLauzas : atsitiktine(ZIEZIRBA.lauzas));
  return h(
    'main',
    { class: 'ekranas lauzas', 'data-ekranas': boso ? 'bosoLauzas' : 'lauzas' },
    hud(z),
    h('h1', { class: 'antraste-ranka' }, pavadinimas),
    h(
      'div',
      { class: 'lauzo-scena' },
      h('button', { type: 'button', class: 'herojaus-mygtukas', 'aria-label': 'Mano daiktai', onclick: () => z.rodytiLangus([{ tipas: 'daiktai' }]) }, svg(herojus(b.iranga, b.kosmetika.includes('apsiaustas'), 92))),
      svg(lauzas(lauzoSpalva(z), 90), 'lauzo-ugnis'),
      h('div', { class: 'kaukas-ir-ziezirba' }, zz(z, 56), svg(vezlys(70))),
      svg(palapine(84), 'palapine'),
    ),
    ziezirbosBurbulas(z, zinute),
    h(
      'button',
      {
        type: 'button',
        class: 'pagrindinis',
        'data-pirmas': '1',
        'data-veiksmas': boso ? 'i-kova' : 'i-sale',
        onclick: () => (boso ? z.pradetiBosoKova() : z.ieitiISale()),
      },
      boso ? 'Pas didįjį dinozaurą!' : 'Į kelionę',
    ),
    h(
      'div',
      { class: 'mygtuku-eile' },
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.rodytiLangus([{ tipas: 'daiktai' }]) }, svg(kambarioIkona('lobis', 28)), 'Daiktai'),
      burtoMygtukas(z, 'gydymas'),
    ),
    h(
      'div',
      { class: 'mygtuku-eile' },
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.atidaryti('knyga') }, svg(knygosIkona(28)), TEMA.knyga),
      h('button', { type: 'button', class: 'antrinis', onclick: () => z.iSkyriausZemelapi() }, 'Lygiai'),
    ),
    h('div', { class: 'mygtuku-eile nustatymai-eile' }, nustatymuMygtukai(z)),
  );
}

// ------------------------------------------------------------------ Ekspedicijos dienoraštis

export function ekranasKnyga(z: Zaidimas): HTMLElement {
  const b = z.b;
  const n = { skiemenys: b.nustatymai.skiemenys };
  const puslapiai = z.t.skyriai.map((sk) => {
    const turi = b.puslapiai.includes(sk.numeris);
    return h(
      'article',
      { class: `knygos-puslapis${turi ? '' : ' po-rasalu'}`, 'data-puslapis': sk.numeris },
      h('h2', { class: 'antraste-ranka' }, `${sk.numeris} puslapis · ${sk.puslapis.pavadinimas}`),
      turi
        ? h('p', { class: 'tekstas skaitymas' }, skaitomasTekstas(z.tekstas(sk.puslapis.tekstas), n))
        : h('p', { class: 'mazas-tekstas' }, `Puslapis dar pelenuose. Nuramink ${sk.bosas.vardas}!`),
    );
  });
  // Pirmiausia – grąžinti puslapiai, po jų – dar pelenuose esantys.
  puslapiai.sort((x, y) => Number(x.classList.contains('po-rasalu')) - Number(y.classList.contains('po-rasalu')));
  return h(
    'main',
    { class: 'ekranas knyga', 'data-ekranas': 'knyga' },
    h('h1', { class: 'antraste-ranka' }, TEMA.knygaPilnas),
    z.zinute && z.ekranas === 'knyga' ? ziezirbosBurbulas(z, z.zinute) : null,
    h(
      'section',
      { class: 'zodziai' },
      h('h2', { class: 'antraste-ranka' }, `Grįžę žodžiai: ${b.zodziai.length}`),
      b.zodziai.length
        ? h('ul', { class: 'zodziu-sarasas' }, b.zodziai.map((w) => h('li', { class: 'zodzio-lapelis skaitymas' }, skaitomasTekstas(w, n))))
        : h('p', { class: 'skaitymas' }, 'Kol kas tuščia. Nuramink dinozaurą – ir žodis sugrįš!'),
      h('p', { class: 'mazas-tekstas' }, `Pabėgę žodžiai: ${b.pabege.length} · Sugauti: ${b.sugauti}`),
    ),
    puslapiai,
    h('button', { type: 'button', class: 'pagrindinis', 'data-pirmas': '1', onclick: () => { z.zinute = null; z.uzdaryti(); } }, 'Užverti dienoraštį'),
  );
}

// ------------------------------------------------------------------ Tėvų skydelis

let vartai: { a: number; b: number; atrakinta: boolean; trinti: boolean } | null = null;

function laikas(ms: number): string {
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'mažiau nei minutė';
  const val = Math.floor(min / 60);
  return val > 0 ? `${val} val. ${min % 60} min.` : `${min} min.`;
}

export function ekranasTevai(z: Zaidimas): HTMLElement {
  if (!vartai) vartai = { a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4), atrakinta: false, trinti: false };
  const v = vartai;
  const uzdaryti = () => {
    vartai = null;
    z.uzdaryti();
  };
  if (!v.atrakinta) {
    const ivestis = h('input', { id: 'vartai', type: 'text', inputmode: 'numeric', class: 'vardo-ivestis', autocomplete: 'off', 'data-fokusas': 'vartai' }) as HTMLInputElement;
    const klaida = h('p', { class: 'klaidos-tekstas', role: 'alert' });
    return h(
      'main',
      { class: 'ekranas tevai', 'data-ekranas': 'tevai' },
      h('h1', { class: 'antraste-ranka' }, 'Tėvams'),
      h(
        'form',
        {
          class: 'vardo-forma',
          onsubmit: (e: Event) => {
            e.preventDefault();
            if (Number(ivestis.value.trim()) === v.a * v.b) {
              v.atrakinta = true;
              z.render();
            } else {
              klaida.textContent = 'Neteisingai. Pabandykite dar kartą.';
              ivestis.value = '';
            }
          },
        },
        h('label', { for: 'vartai', class: 'tevu-klausimas' }, `Suaugusiojo klausimas: kiek bus ${v.a} × ${v.b}?`),
        ivestis,
        klaida,
        h('button', { type: 'submit', class: 'pagrindinis' }, 'Atrakinti'),
      ),
      h('button', { type: 'button', class: 'antrinis', onclick: uzdaryti }, 'Atgal'),
    );
  }

  const b = z.b;
  const sk = skyrius(z.t, pasiektasSkyrius(b, z.t));
  const isveiktos = sk.sales.filter((s) => b.sales[s.id]?.baigta).length;
  const klaidingos = Object.entries(b.uzduotys)
    .filter(([, s]) => s.klaidos > 0)
    .sort((x, y) => y[1].klaidos - x[1].klaidos)
    .slice(0, 30);
  const pabege = new Set(b.pabege.map((p) => p.uzduotis));

  const laukas = (id: string, zyme: string, reiksme: string, keisti: (v: string) => void, vieta = '') => {
    const ivestis = h('input', { id, type: 'text', value: reiksme, placeholder: vieta, autocomplete: 'off', maxlength: VARDO_ILGIS }) as HTMLInputElement;
    ivestis.addEventListener('change', () => keisti(ivestis.value));
    return h('div', { class: 'laukas' }, h('label', { for: id }, zyme), ivestis);
  };
  const jungiklis = (id: string, zyme: string, ijungta: boolean, keisti: (v: boolean) => void) => {
    const box = h('input', { id, type: 'checkbox', checked: ijungta }) as HTMLInputElement;
    box.addEventListener('change', () => {
      keisti(box.checked);
      z.render();
    });
    return h('label', { class: 'jungiklis', for: id }, box, h('span', null, zyme));
  };

  return h(
    'main',
    { class: 'ekranas tevai atrakinta', 'data-ekranas': 'tevai' },
    h('h1', { class: 'antraste-ranka' }, 'Tėvų skydelis'),
    h(
      'section',
      { class: 'tevu-blokas' },
      h('h2', null, 'Pažanga'),
      h(
        'dl',
        { class: 'statistika' },
        h('dt', null, 'Pasiektas lygis'),
        h('dd', null, `${sk.numeris} iš ${z.t.skyriai.length} – ${sk.pavadinimas}: vietovės ${isveiktos} iš ${sk.sales.length}, ${sk.bosas.vardas} ${bosasNugaletas(b, sk.numeris) ? 'nurimo' : 'dar užkerėtas'}`),
        h('dt', null, 'Žaidimo laikas'),
        h('dd', { 'data-laikas': '1' }, laikas(b.statistika.laikasMs)),
        h('dt', null, 'Atsakymai'),
        h('dd', null, `teisingi ${b.statistika.teisingi}, klaidos ${b.statistika.klaidos}`),
        h('dt', null, 'Dienoraštyje žodžių'),
        h('dd', null, `${b.zodziai.length}, pabėgusių ${b.pabege.length}, sugautų ${b.sugauti}`),
      ),
      h('h3', null, 'Klaidingi žodžiai'),
      klaidingos.length
        ? h(
            'ul',
            { class: 'klaidingi' },
            klaidingos.map(([id, s]) => {
              const u = z.t.uzduotys.get(id);
              const zodis = u?.zodis ?? u?.uzuomina ?? id;
              return h(
                'li',
                null,
                h('strong', null, z.tekstas(zodis)),
                ` – klaidų: ${s.klaidos}${pabege.has(id) ? ' (dar kartojama)' : ''}`,
                u ? h('div', { class: 'mazas-tekstas' }, z.tekstas(`${u.tekstas} ${u.klausimas}`)) : null,
              );
            }),
          )
        : h('p', null, 'Klaidų dar nėra.'),
    ),
    h(
      'section',
      { class: 'tevu-blokas' },
      h('h2', null, 'Vardas ir savi žodžiai'),
      laukas('t-vardas', 'Vaiko vardas', b.vardas, (val) => {
        const v2 = sutvarkytiVarda(val);
        if (v2) z.keistiNustatymus((x) => pakeistiVarda(x, v2));
        z.render();
      }),
      laukas('t-kreipinys', 'Kaip Pteriukas kreipiasi (šauksmininkas)', b.kreipinys, (val) =>
        z.keistiNustatymus((x) => ({ ...x, kreipinys: sutvarkytiVarda(val) || sauksmininkas(x.vardas) })),
      ),
      laukas('t-seima', 'Šeimos narys', b.nustatymai.savi.seimosNarys, (val) =>
        z.keistiNustatymus((x) => ({ ...x, nustatymai: { ...x.nustatymai, savi: { ...x.nustatymai.savi, seimosNarys: val.trim() } } })), 'Mama'),
      laukas('t-draugas', 'Draugas', b.nustatymai.savi.draugas, (val) =>
        z.keistiNustatymus((x) => ({ ...x, nustatymai: { ...x.nustatymai, savi: { ...x.nustatymai.savi, draugas: val.trim() } } })), 'Ema'),
      laukas('t-augintinis', 'Augintinis', b.nustatymai.savi.augintinis, (val) =>
        z.keistiNustatymus((x) => ({ ...x, nustatymai: { ...x.nustatymai, savi: { ...x.nustatymai.savi, augintinis: val.trim() } } })), 'Murkis'),
      h('p', { class: 'mazas-tekstas' }, 'Šie vardai įrašomi į kai kuriuos tekstus (vardininko linksniu).'),
    ),
    h(
      'section',
      { class: 'tevu-blokas' },
      h('h2', null, 'Jungikliai'),
      jungiklis('t-skiemenys', 'Ilgus žodžius spalvinti skiemenimis (va-ri-nis)', b.nustatymai.skiemenys, (x) =>
        z.keistiNustatymus((y) => ({ ...y, nustatymai: { ...y.nustatymai, skiemenys: x } }))),
      jungiklis('t-didziosios', 'Rodyti DIDŽIOSIOMIS raidėmis', b.nustatymai.didziosios, (x) =>
        z.keistiNustatymus((y) => ({ ...y, nustatymai: { ...y.nustatymai, didziosios: x } }))),
      jungiklis('t-garsas', 'Garso efektai', b.nustatymai.garsas, (x) => {
        if (x !== b.nustatymai.garsas) z.perjungtiGarsa();
      }),
    ),
    h(
      'section',
      { class: 'tevu-blokas' },
      h('h2', null, 'Pradėti iš naujo'),
      h(
        'button',
        {
          type: 'button',
          class: 'pavojingas',
          onclick: () => {
            if (!v.trinti) {
              v.trinti = true;
              z.render();
              return;
            }
            vartai = null;
            z.istrintiZaideja();
          },
        },
        v.trinti ? 'Tikrai ištrinti visą progresą?' : 'Ištrinti progresą',
      ),
    ),
    h('button', { type: 'button', class: 'pagrindinis', onclick: uzdaryti }, 'Uždaryti'),
  );
}
