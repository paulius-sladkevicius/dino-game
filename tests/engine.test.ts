import { describe, expect, it } from 'vitest';
import { TURINYS, uzduotis } from '../src/content';
import {
  atidarytiLobi,
  atsakyti,
  atsakytiMislei,
  baigtiSale,
  bosasAtrakintas,
  bosoKova,
  dabartineUzduotis,
  eitiIKambari,
  eitiPrieLauzo,
  galimaBurta,
  galimiEjimai,
  ieitiISale,
  kambarioVeiksmas,
  kovaKambaryje,
  naudotiBurta,
  naujaBusena,
  pabegusiDeme,
  paimtiDovana,
  parinktiUzduotis,
  pasirinktiKelia,
  pradetiKova,
  pralaimeti,
  priimtiGrobi,
  rastiKambari,
  rastiSale,
  rodomiAtsakymai,
  saleAtrakinta,
  type Kova,
} from '../src/game/engine';
import { seklinisRng, type Rng } from '../src/game/rng';
import type { Busena } from '../src/game/types';

const T = TURINYS;
const rng = (): Rng => seklinisRng(7);
/** Visada „nepasiseka“: jokio grobio (rng grąžina beveik 1). */
const nesekme: Rng = () => 0.999;

function teisingas(k: Kova): number {
  return dabartineUzduotis(T, k).atsakymai.findIndex((a) => a.teisingas);
}
function neteisingas(k: Kova, kelintas = 0): number {
  const u = dabartineUzduotis(T, k);
  return u.atsakymai.map((a, i) => (a.teisingas ? -1 : i)).filter((i) => i >= 0 && !k.pasalinti.includes(i))[kelintas];
}
function kova(rusis: 'mazas' | 'vidutinis' | 'pabeges', ids = ['s1-k01', 's1-k02'], sale: string | null = 's1-sale1'): Kova {
  return pradetiKova(T, { rusis, uzduotys: ids, sale, kambarys: sale ? 'r1' : null }, rng());
}
function busena(p: Partial<Busena> = {}): Busena {
  return { ...naujaBusena('Ugnė', T), ...p };
}

describe('pradžia', () => {
  it('5 širdelės, 3 manos, medinė įranga, vardas ir kreipinys', () => {
    const b = naujaBusena('Ugnė', T);
    expect(b.sirdeles).toBe(5);
    expect(b.mana).toBe(3);
    expect(b.iranga).toEqual({ kardas: 0, salmas: 0, sarvai: 0, batai: 0 });
    expect(b.kreipinys).toBe('Ugne');
    expect(Object.keys(b.sales)).toHaveLength(3);
  });
});

describe('susitikimas su priešu', () => {
  it('priešo gyvybės: maža Dėmė 1, vidutinis 2, bosas 5, pabėgusi 1', () => {
    expect(kova('mazas').gyvybes).toBe(1);
    expect(kova('vidutinis').gyvybes).toBe(2);
    expect(bosoKova(T, rng()).gyvybes).toBe(5);
    expect(kova('pabeges', ['s1-k01'], null).gyvybes).toBe(1);
  });

  it('4 atsakymai sumaišyti atsitiktine tvarka', () => {
    const tvarkos = new Set<string>();
    for (let s = 0; s < 20; s++) {
      const k = pradetiKova(T, { rusis: 'mazas', uzduotys: ['s1-k07'], sale: null, kambarys: null }, seklinisRng(s));
      expect([...k.tvarka].sort()).toEqual([0, 1, 2, 3]);
      tvarkos.add(k.tvarka.join());
    }
    expect(tvarkos.size).toBeGreaterThan(5);
  });

  it('teisingai iš pirmo karto: +1 širdelė, +1 mana', () => {
    const b = busena({ sirdeles: 3, mana: 3 });
    const k = kova('vidutinis');
    const r = atsakyti(b, T, k, teisingas(k), nesekme);
    expect(r.busena.sirdeles).toBe(4);
    expect(r.busena.mana).toBe(4);
    expect(r.kova.gyvybes).toBe(1);
    expect(r.kova.nr).toBe(1);
    expect(r.ivykiai[0]).toMatchObject({ tipas: 'teisinga', isPirmo: true, sirdeles: 1, mana: 1 });
  });

  it('širdelės ir mana neviršija maksimumo (5 ir 10 su medine įranga)', () => {
    const k = kova('vidutinis');
    const r = atsakyti(busena({ sirdeles: 5, mana: 10 }), T, k, teisingas(k), nesekme);
    expect(r.busena.sirdeles).toBe(5);
    expect(r.busena.mana).toBe(10);
  });

  it('klaida: −1 širdelė, 0 manos, neteisingas atsakymas išnyksta, rodoma užuomina', () => {
    const b = busena({ sirdeles: 5, mana: 3 });
    const k = kova('mazas');
    const bloga = neteisingas(k);
    const r = atsakyti(b, T, k, bloga, nesekme);
    expect(r.busena.sirdeles).toBe(4);
    expect(r.busena.mana).toBe(3);
    expect(r.kova.pasalinti).toEqual([bloga]);
    expect(rodomiAtsakymai(r.kova)).toHaveLength(3);
    expect(r.kova.uzuomina).toBe('zodis');
    expect(r.kova.gyvybes).toBe(1); // klaida kovos nenutraukia
  });

  it('po 2 klaidų lieka du atsakymai ir paryškinamas sakinys', () => {
    let b = busena();
    let k = kova('mazas');
    ({ busena: b, kova: k } = atsakyti(b, T, k, neteisingas(k), nesekme));
    ({ busena: b, kova: k } = atsakyti(b, T, k, neteisingas(k), nesekme));
    expect(rodomiAtsakymai(k)).toHaveLength(2);
    expect(rodomiAtsakymai(k)).toContain(teisingas(k));
    expect(k.uzuomina).toBe('sakinys');
  });

  it('pašalinto atsakymo paspausti nebegalima', () => {
    const b = busena();
    const k = kova('mazas');
    const bloga = neteisingas(k);
    const r1 = atsakyti(b, T, k, bloga, nesekme);
    const r2 = atsakyti(r1.busena, T, r1.kova, bloga, nesekme);
    expect(r2.busena).toBe(r1.busena);
    expect(r2.ivykiai).toEqual([]);
  });

  it('teisingai po klaidos: 0 širdelių, 0 manos, žodis pabėga', () => {
    let b = busena({ sirdeles: 4, mana: 3 });
    let k = kova('mazas');
    ({ busena: b, kova: k } = atsakyti(b, T, k, neteisingas(k), nesekme));
    const r = atsakyti(b, T, k, teisingas(k), nesekme);
    expect(r.busena.sirdeles).toBe(3);
    expect(r.busena.mana).toBe(3);
    expect(r.busena.pabege.map((p) => p.uzduotis)).toEqual(['s1-k01']);
  });

  it('serija: 3 teisingi iš eilės – +2 manos papildomai; klaida seriją nutraukia', () => {
    let b = busena({ mana: 0 });
    const ids = ['s1-k01', 's1-k02', 's1-k03', 's1-k04', 's1-k05', 's1-k06'];
    const manos: number[] = [];
    for (const id of ids.slice(0, 3)) {
      const k = kova('mazas', [id], null);
      b = atsakyti(b, T, k, teisingas(k), nesekme).busena;
      manos.push(b.mana);
    }
    expect(manos).toEqual([1, 2, 5]); // 3-ias: +1 ir +2
    let k = kova('mazas', ['s1-k04'], null);
    b = atsakyti(b, T, k, neteisingas(k), nesekme).busena;
    expect(b.serija).toBe(0);
    k = kova('mazas', ['s1-k05'], null);
    const r = atsakyti(b, T, k, teisingas(k), nesekme);
    expect(r.ivykiai.some((i) => i.tipas === 'serija')).toBe(false);
    expect(r.busena.serija).toBe(1);
  });

  it('nugalėtas priešas grąžina žodį į Knygą, kambarys įveiktas', () => {
    const k = kova('mazas', ['s1-k07']);
    const r = atsakyti(busena(), T, k, teisingas(k), nesekme);
    expect(r.kova.gyvybes).toBe(0);
    expect(r.busena.zodziai).toEqual(['varlė']);
    expect(r.busena.susitikimai).toBe(1);
    expect(r.busena.sales['s1-sale1'].iveikti).toContain('r1');
    expect(r.ivykiai.at(-1)).toMatchObject({ tipas: 'nugaletas', zodis: 'varlė', grobis: null });
  });

  it('kardas: papildoma mana už nugalėtą priešą', () => {
    const k = kova('mazas', ['s1-k07']);
    const b = busena({ mana: 0, iranga: { kardas: 3, salmas: 0, sarvai: 0, batai: 0 } });
    const r = atsakyti(b, T, k, teisingas(k), nesekme);
    expect(r.busena.mana).toBe(1 + 2);
    expect(r.ivykiai.at(-1)).toMatchObject({ tipas: 'nugaletas', kardoMana: 2 });
  });

  it('šalmas: tiek klaidų per salę neatima širdelės', () => {
    let b = busena({ iranga: { kardas: 0, salmas: 2, sarvai: 0, batai: 0 } }); // geležinis: 1
    b = ieitiISale(b, T, 's1-sale1');
    let k = kova('mazas');
    let r = atsakyti(b, T, k, neteisingas(k), nesekme);
    expect(r.busena.sirdeles).toBe(5);
    expect(r.ivykiai.some((i) => i.tipas === 'salmas')).toBe(true);
    ({ busena: b, kova: k } = r);
    r = atsakyti(b, T, k, neteisingas(k), nesekme);
    expect(r.busena.sirdeles).toBe(4);
    // Naujoje salėje šalmas vėl saugo.
    b = ieitiISale(r.busena, T, 's1-sale2');
    expect(b.salmoPanaudota).toBe(0);
  });

  it('klaidos skaičiuojamos salės žvaigždutėms', () => {
    let b = ieitiISale(busena(), T, 's1-sale1');
    const k = kova('mazas');
    b = atsakyti(b, T, k, neteisingas(k), nesekme).busena;
    expect(b.sales['s1-sale1'].ejimas.klaidos).toBe(1);
  });
});

describe('grobis iš priešų', () => {
  it('maža Dėmė, visi tekstai iš pirmo karto: tikimybė dviguba (1/5)', () => {
    const k = kova('mazas', ['s1-k07']);
    // 0.15 < 0.2 → iškrenta; 0.5 → ne aukštesnis lygis; 0 → kardas
    const seka = [0.15, 0.5, 0];
    let i = 0;
    const r = atsakyti(busena(), T, k, teisingas(k), () => seka[i++] ?? 0.5);
    expect(r.ivykiai.at(-1)).toMatchObject({ tipas: 'nugaletas', grobis: { daiktas: 'kardas', lygis: 1 } });
  });

  it('imu: naujas užsidedamas, +2 manos; palieku: lieka senas, +2 manos', () => {
    const b = busena({ mana: 3 });
    const imu = priimtiGrobi(b, { daiktas: 'batai', lygis: 1 }, true);
    expect(imu.iranga.batai).toBe(1);
    expect(imu.mana).toBe(5);
    const palieku = priimtiGrobi(b, { daiktas: 'batai', lygis: 1 }, false);
    expect(palieku.iranga.batai).toBe(0);
    expect(palieku.mana).toBe(5);
  });

  it('paėmus prastesnius šarvus širdelės sumažinamos iki naujo maksimumo', () => {
    const b = busena({ sirdeles: 7, iranga: { kardas: 0, salmas: 0, sarvai: 3, batai: 0 } });
    expect(priimtiGrobi(b, { daiktas: 'sarvai', lygis: 1 }, true).sirdeles).toBe(6);
  });
});

describe('burtai', () => {
  it('Švieselė: 1 mana, paryškina svarbiausią žodį', () => {
    const k = kova('mazas');
    const b = busena({ mana: 1 });
    expect(galimaBurta(b, k, 'sviesele')).toBe(true);
    const r = naudotiBurta(b, k, 'sviesele');
    expect(r.busena.mana).toBe(0);
    expect(r.kova!.sviesele).toBe(true);
    expect(galimaBurta(r.busena, r.kova, 'sviesele')).toBe(false);
  });

  it('Švieselė negalima be manos ar už kovos ribų', () => {
    expect(galimaBurta(busena({ mana: 0 }), kova('mazas'), 'sviesele')).toBe(false);
    expect(galimaBurta(busena({ mana: 5 }), null, 'sviesele')).toBe(false);
  });

  it('Gydymas: 3 manos, +2 širdelės (neviršijant maksimumo)', () => {
    const r = naudotiBurta(busena({ mana: 4, sirdeles: 2 }), null, 'gydymas');
    expect(r.busena.mana).toBe(1);
    expect(r.busena.sirdeles).toBe(4);
    expect(naudotiBurta(busena({ mana: 3, sirdeles: 4 }), null, 'gydymas').busena.sirdeles).toBe(5);
    expect(galimaBurta(busena({ mana: 2, sirdeles: 1 }), null, 'gydymas')).toBe(false);
    expect(galimaBurta(busena({ mana: 9, sirdeles: 5 }), null, 'gydymas')).toBe(false);
  });
});

describe('pralaimėjimas – ne „Game over“', () => {
  it('širdelėms pasibaigus – įvykis pralaimėjimas', () => {
    const k = kova('mazas');
    const r = atsakyti(busena({ sirdeles: 1 }), T, k, neteisingas(k), nesekme);
    expect(r.busena.sirdeles).toBe(0);
    expect(r.ivykiai.at(-1)).toEqual({ tipas: 'pralaimejimas' });
  });

  it('prie paskutinio laužo: širdelės iki 5, žodžiai ir mana lieka', () => {
    let b = busena({ sirdeles: 0, mana: 7, zodziai: ['akmuo'], serija: 2 });
    b = eitiPrieLauzo(b, 's1-sale2');
    b = ieitiISale(b, T, 's1-sale2');
    const po = pralaimeti(b);
    expect(po.sirdeles).toBe(5);
    expect(po.mana).toBe(7);
    expect(po.zodziai).toEqual(['akmuo']);
    expect(po.serija).toBe(0);
    expect(po.vieta).toEqual({ kur: 'lauzas', sale: 's1-sale2' });
  });

  it('prieš bosą pralaimėjus – grįžtama prie laužo prieš bosą', () => {
    const b = busena({ paskutinisLauzas: { kur: 'bosoLauzas' }, sirdeles: 0 });
    expect(pralaimeti(b).vieta).toEqual({ kur: 'bosoLauzas' });
  });

  it('su geresniais šarvais vis tiek atsistato iki 5', () => {
    const b = busena({ sirdeles: 0, iranga: { kardas: 0, salmas: 0, sarvai: 5, batai: 0 } });
    expect(pralaimeti(b).sirdeles).toBe(5);
  });

  it('priešas atgauna gyvybes – nauja kova vėl turi visas gyvybes', () => {
    const sale = rastiSale(T, 's1-sale1');
    const k = kovaKambaryje(busena(), T, sale, rastiKambari(sale, 'r1'), rng());
    expect(k.gyvybes).toBe(k.maxGyvybes);
  });
});

describe('bosas', () => {
  it('5 tekstai iš eilės, nugalėjus: visos širdelės, +3 manos, visada daiktas, puslapis Knygai', () => {
    let b = busena({ sirdeles: 2, mana: 0, iranga: { kardas: 0, salmas: 0, sarvai: 1, batai: 0 } });
    let k = bosoKova(T, rng());
    expect(k.vardas).toBe('Didžioji Dėmė');
    expect(k.uzduotys).toEqual(['s1-b01', 's1-b02', 's1-b03', 's1-b04', 's1-b05']);
    // Pirmame tekste klysta, kad serijos premija nesutaptų su 5 teisingais.
    let r = atsakyti(b, T, k, neteisingas(k), nesekme);
    ({ busena: b, kova: k } = r);
    for (let i = 0; i < 5; i++) {
      r = atsakyti(b, T, k, teisingas(k), nesekme);
      ({ busena: b, kova: k } = r);
    }
    const ivykis = r.ivykiai.find((i) => i.tipas === 'bosasNugaletas');
    expect(ivykis).toBeDefined();
    expect(b.sirdeles).toBe(6); // visos atsistato (variniai šarvai – 6)
    expect(b.bosasNugaletas).toBe(true);
    expect(b.puslapiai).toEqual([1]);
    expect(ivykis && ivykis.tipas === 'bosasNugaletas' && ivykis.grobis).toBeTruthy();
    expect(ivykis && ivykis.tipas === 'bosasNugaletas' && ivykis.mana).toBe(3);
  });

  it('bosas atrakinamas tik įveikus visas sales', () => {
    let b = busena();
    expect(bosasAtrakintas(b, T)).toBe(false);
    for (const id of ['s1-sale1', 's1-sale2', 's1-sale3']) b = { ...b, sales: { ...b.sales, [id]: { ...b.sales[id], baigta: true } } };
    expect(bosasAtrakintas(b, T)).toBe(true);
  });
});

describe('salė, sankryža, lobis, slaptos durys', () => {
  it('salės atrakinamos paeiliui', () => {
    const b = busena();
    expect(saleAtrakinta(b, T, 's1-sale1')).toBe(true);
    expect(saleAtrakinta(b, T, 's1-sale2')).toBe(false);
  });

  it('judėjimas: į kelius – tik per sankryžos ženklą, į slaptą kambarį – tik įminus mįslę', () => {
    let b = ieitiISale(busena(), T, 's1-sale1');
    expect(b.vieta).toEqual({ kur: 'sale', sale: 's1-sale1', kambarys: 'lauzas' });
    expect(galimiEjimai(b, T)).toEqual(['r1']);
    b = eitiIKambari(b, 's1-sale1', 'r1');
    expect(kambarioVeiksmas(b, T)).toEqual({ tipas: 'kova' });
    b = { ...b, sales: { ...b.sales, 's1-sale1': { ...b.sales['s1-sale1'], iveikti: ['r1'] } } };
    expect(kambarioVeiksmas(b, T)).toEqual({ tipas: 'nieko' });
    b = eitiIKambari(b, 's1-sale1', 'sankryza');
    expect(kambarioVeiksmas(b, T)).toEqual({ tipas: 'sankryza' });
    expect(galimiEjimai(b, T)).toEqual(['r1']);
  });

  it('sankryžos ženklas: pasirinkimas turi pasekmę (kairėn – lobis 1 salėje)', () => {
    let b = eitiIKambari(ieitiISale(busena(), T, 's1-sale1'), 's1-sale1', 'sankryza');
    const zenklas = uzduotis(T, 's1-z01');
    const kaire = zenklas.atsakymai.findIndex((a) => a.tekstas.includes('kairėn'));
    b = pasirinktiKelia(b, T, kaire);
    expect(b.vieta).toEqual({ kur: 'sale', sale: 's1-sale1', kambarys: 't1' });
    expect(b.sales['s1-sale1'].aplankyti).toContain('t1');
  });

  it('lobis: +1 arba +2 širdelės, +3 manos, kartais įranga; antrą kartą – nieko', () => {
    const b = busena({ sirdeles: 1, mana: 0 });
    const r = atidarytiLobi(b, 's1-sale1', () => 0.1);
    expect(r.sirdeles).toBe(1);
    expect(r.mana).toBe(3);
    expect(r.grobis).not.toBeNull();
    expect(atidarytiLobi(b, 's1-sale1', () => 0.9).sirdeles).toBe(2);
    expect(atidarytiLobi(b, 's1-sale1', () => 0.9).grobis).toBeNull();
    const vel = atidarytiLobi(r.busena, 's1-sale1', () => 0.1);
    expect(vel.mana).toBe(0);
  });

  it('lobis, kai širdelių ir manos jau pilna: rodomas planuotas atlygis, gautas – 0', () => {
    const r = atidarytiLobi(busena({ sirdeles: 5, mana: 10 }), 's1-sale1', () => 0.9);
    expect(r.planuota).toEqual({ sirdeles: 2, mana: 3 });
    expect(r.sirdeles).toBe(0);
    expect(r.mana).toBe(0);
  });

  it('lobio kambarys su sargu: pirma kova, paskui lobis', () => {
    let b = eitiIKambari(ieitiISale(busena(), T, 's1-sale1'), 's1-sale1', 't2');
    expect(kambarioVeiksmas(b, T)).toEqual({ tipas: 'kova' });
    b = { ...b, sales: { ...b.sales, 's1-sale1': { ...b.sales['s1-sale1'], iveikti: ['t2'] } } };
    expect(kambarioVeiksmas(b, T)).toEqual({ tipas: 'lobis' });
  });

  it('slaptos durys: klaida širdelės neatima, durys lieka uždarytos; teisingai – atsidaro', () => {
    let b = eitiIKambari(ieitiISale(busena(), T, 's1-sale1'), 's1-sale1', 'sankryza');
    const misle = uzduotis(T, 's1-d01');
    const bloga = misle.atsakymai.findIndex((a) => !a.teisingas);
    const gera = misle.atsakymai.findIndex((a) => a.teisingas);
    let r = atsakytiMislei(b, T, bloga);
    expect(r.atidaryta).toBe(false);
    expect(r.busena.sirdeles).toBe(5);
    expect(r.busena.sales['s1-sale1'].durysAtidarytos).toBe(false);
    r = atsakytiMislei(r.busena, T, gera);
    expect(r.atidaryta).toBe(true);
    b = eitiIKambari(r.busena, 's1-sale1', 'slaptas');
    expect(kambarioVeiksmas(b, T)).toEqual({ tipas: 'dovana', dovana: 'kepure' });
    b = paimtiDovana(b, 'kepure');
    expect(kambarioVeiksmas(b, T)).toEqual({ tipas: 'nieko' });
  });

  it('salės galas: žvaigždutės pagal klaidas, toliau – kitos salės laužas', () => {
    let b = ieitiISale(busena(), T, 's1-sale1');
    b = { ...b, sales: { ...b.sales, 's1-sale1': { ...b.sales['s1-sale1'], ejimas: { aktyvus: true, klaidos: 1 } } } };
    const r = baigtiSale(b, T, 's1-sale1');
    expect(r.zvaigzdutes).toBe(2);
    expect(r.kita).toBe('s1-sale2');
    expect(r.busena.sales['s1-sale1'].baigta).toBe(true);
    expect(r.busena.vieta).toEqual({ kur: 'lauzas', sale: 's1-sale2' });
    expect(r.busena.paskutinisLauzas).toEqual({ kur: 'lauzas', sale: 's1-sale2' });
  });

  it('po paskutinės salės – laužas prieš bosą', () => {
    const r = baigtiSale(ieitiISale(busena(), T, 's1-sale3'), T, 's1-sale3');
    expect(r.kita).toBe('bosas');
    expect(r.busena.vieta).toEqual({ kur: 'bosoLauzas' });
  });

  it('pakartojus salę išlieka geriausios žvaigždutės', () => {
    let b = ieitiISale(busena(), T, 's1-sale1');
    b = baigtiSale(b, T, 's1-sale1').busena;
    b = ieitiISale(b, T, 's1-sale1');
    b = { ...b, sales: { ...b.sales, 's1-sale1': { ...b.sales['s1-sale1'], ejimas: { aktyvus: true, klaidos: 5 } } } };
    expect(baigtiSale(b, T, 's1-sale1').busena.sales['s1-sale1'].zvaigzdutes).toBe(3);
  });
});

describe('pabėgusios Dėmės', () => {
  it('suklydus žodis grįžta po 2 susitikimų kaip pabėgusi Dėmė, atsakius du kartus – sugautas', () => {
    let b = busena();
    let k = kova('mazas', ['s1-k01'], null);
    ({ busena: b, kova: k } = atsakyti(b, T, k, neteisingas(k), nesekme));
    b = atsakyti(b, T, k, teisingas(k), nesekme).busena; // susitikimai = 1
    expect(pabegusiDeme(b, T, rng())).toBeNull();
    k = kova('mazas', ['s1-k02'], null);
    b = atsakyti(b, T, k, teisingas(k), nesekme).busena; // 2
    expect(pabegusiDeme(b, T, rng())).toBeNull();
    k = kova('mazas', ['s1-k03'], null);
    b = atsakyti(b, T, k, teisingas(k), nesekme).busena; // 3
    const p = pabegusiDeme(b, T, rng())!;
    expect(p.rusis).toBe('pabeges');
    expect(p.vardas).toBe('Pabėgusi Dėmė');
    expect(p.uzduotys).toEqual(['s1-k01']);
    b = atsakyti(b, T, p, teisingas(p), nesekme).busena;
    expect(b.pabege).toEqual([{ uzduotis: 's1-k01', dezute: 2, kada: 8 }]);
    b = { ...b, susitikimai: 8 };
    const p2 = pabegusiDeme(b, T, rng())!;
    b = atsakyti(b, T, p2, teisingas(p2), nesekme).busena;
    expect(b.pabege).toEqual([]);
    expect(b.sugauti).toBe(1);
  });

  it('pabėgę žodžiai neparenkami kaip įprastos salės užduotys', () => {
    const b = busena({ pabege: [{ uzduotis: 's1-k01', dezute: 1, kada: 99 }] });
    for (let s = 0; s < 20; s++) {
      expect(parinktiUzduotis(b, rastiSale(T, 's1-sale1').uzduotys, 3, seklinisRng(s))).not.toContain('s1-k01');
    }
  });

  it('pirmiausia parenkamos dar nematytos užduotys', () => {
    const matyta = { rodyta: 3, klaidos: 0, paskutinis: 1 };
    const b = busena({ uzduotys: Object.fromEntries(['s1-k01', 's1-k02', 's1-k03', 's1-k04', 's1-k05', 's1-k06', 's1-k07', 's1-k08'].map((id) => [id, matyta])) });
    expect(parinktiUzduotis(b, rastiSale(T, 's1-sale1').uzduotys, 2, rng()).sort()).toEqual(['s1-k09', 's1-k10']);
  });
});
