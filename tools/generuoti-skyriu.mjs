// Sugeneruoja src/content/skyrius-N/skyrius.json iš skyrius-N/tema.json.
// Naudojimas: node tools/generuoti-skyriu.mjs 2   (arba be numerio – visiems skyriams)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const KAMBARIU_VARDAI = {
  lauzas: 'Stovykla', r1: 'Proskyna', sankryza: 'Kryžkelė', t1: 'Lobio takas',
  t2: 'Lobis', s1: 'Trumpas takas', slaptas: 'Slaptas urvas', galas: 'Vietovės pabaiga',
};
// Kiekvienos vietovės priešų dydžiai ir kurioje pusėje lobis (kaip 1 skyriuje).
const VIETOVES = [
  { lobisKaireje: true, r1: 'vidutinis', t1: 'mazas', sargas: 'vidutinis', s1: 'mazas', dovana: 'kepure' },
  { lobisKaireje: false, r1: 'mazas', t1: 'vidutinis', sargas: 'mazas', s1: 'vidutinis', dovana: 'apsiaustas' },
  { lobisKaireje: true, r1: 'vidutinis', t1: 'vidutinis', sargas: 'mazas', s1: 'mazas', dovana: 'lauzoSpalva' },
];
const id = (n, raide, nr) => `s${n}-${raide}${String(nr).padStart(2, '0')}`;

function generuoti(n) {
  const dir = `src/content/skyrius-${n}`;
  const tema = JSON.parse(readFileSync(`${dir}/tema.json`, 'utf8'));
  const sales = tema.sales.map((pavadinimas, i) => {
    const v = VIETOVES[i];
    const [lx, sx] = v.lobisKaireje ? [16, 84] : [84, 16];
    const k = (kid, extra, x, y, kaimynai) => ({ id: kid, pavadinimas: KAMBARIU_VARDAI[kid], kaimynai, x, y, ...extra });
    return {
      id: `s${n}-sale${i + 1}`,
      pavadinimas,
      uzduotys: Array.from({ length: 8 }, (_, j) => id(n, 'k', i * 8 + j + 1)),
      pradzia: 'lauzas',
      kambariai: [
        k('lauzas', { tipas: 'lauzas' }, lx, 88, ['r1']),
        k('r1', { tipas: 'priesas', priesas: v.r1 }, 50, 88, ['lauzas', 'sankryza']),
        k('sankryza', {
          tipas: 'sankryza', zenklas: id(n, 'z', i + 1), keliai: { lobis: 't1', trumpas: 's1' },
          slaptosDurys: { kambarys: 'slaptas', misle: id(n, 'd', i + 1) },
        }, 50, 62, ['r1', 't1', 's1', 'slaptas']),
        k('t1', { tipas: 'priesas', priesas: v.t1 }, lx, 62, ['sankryza', 't2']),
        k('t2', { tipas: 'lobis', sargas: v.sargas }, lx, 36, ['t1', 'galas']),
        k('s1', { tipas: 'priesas', priesas: v.s1 }, sx, 36, ['sankryza', 'galas']),
        k('slaptas', { tipas: 'slaptas', dovana: v.dovana }, 50, 36, ['sankryza']),
        k('galas', { tipas: 'galas' }, 50, 10, ['t2', 's1']),
      ],
    };
  });
  const skyrius = {
    numeris: n,
    pavadinimas: tema.pavadinimas,
    priesai: tema.priesai,
    bosas: { ...tema.bosas, uzduotys: Array.from({ length: 5 }, (_, j) => id(n, 'b', j + 1)) },
    puslapis: tema.puslapis,
    sales,
  };
  writeFileSync(`${dir}/skyrius.json`, JSON.stringify(skyrius, null, 2) + '\n');
  console.log(`${dir}/skyrius.json sugeneruotas`);
}

const n = process.argv[2];
if (n) generuoti(Number(n));
else for (const d of readdirSync('src/content')) {
  const m = d.match(/^skyrius-(\d+)$/);
  if (m && existsSync(`src/content/${d}/tema.json`)) generuoti(Number(m[1]));
}
