import { describe, expect, it } from 'vitest';
import { atsakymasTekste, patikrintiTurini, TEKSTO_RIBOS, TURINYS } from '../src/content';

const kovos = (n: number) => [...TURINYS.uzduotys.values()].filter((u) => u.skyrius === n && (u.tipas === 'kova' || u.tipas === 'bosas'));

describe('turinys', () => {
  it('praeina visus turinio patikrinimus', () => {
    expect(patikrintiTurini(TURINYS)).toEqual([]);
  });

  it('6 lygiai, kiekviename 3 vietovės, bosas su 5 tekstais ir apie 35 užduotys', () => {
    expect(TURINYS.skyriai.map((s) => s.numeris)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const sk of TURINYS.skyriai) {
      const visos = [...TURINYS.uzduotys.values()].filter((u) => u.skyrius === sk.numeris);
      expect(visos.length, `lygis ${sk.numeris}`).toBeGreaterThanOrEqual(33);
      expect(visos.length, `lygis ${sk.numeris}`).toBeLessThanOrEqual(45);
      expect(sk.sales).toHaveLength(3);
      expect(sk.bosas.uzduotys).toHaveLength(5);
      expect(TEKSTO_RIBOS[sk.numeris]).toBeDefined();
    }
  });

  it('tekstai ilgėja iš lygio į lygį', () => {
    const vidurkis = (n: number) => {
      const k = kovos(n);
      return k.reduce((s, u) => s + u.tekstas.split(/\s+/).length, 0) / k.length;
    };
    for (let n = 2; n <= 6; n++) expect(vidurkis(n), `lygis ${n}`).toBeGreaterThan(vidurkis(n - 1));
  });

  it('teisingas atsakymas nekartoja teksto žodžių', () => {
    for (const u of TURINYS.uzduotys.values()) {
      if (u.tipas !== 'kova' && u.tipas !== 'bosas') continue;
      expect(atsakymasTekste(u), u.id).toEqual([]);
    }
  });

  it('kiekviename lygyje bent trečdalyje užduočių klaidingas atsakymas gundo žodžiu iš teksto', () => {
    for (const sk of TURINYS.skyriai) {
      const k = kovos(sk.numeris);
      const suGundymu = k.filter((u) => {
        const tekstas = u.tekstas.toLocaleLowerCase('lt');
        return u.atsakymai.some((a) => !a.teisingas && a.tekstas.toLocaleLowerCase('lt').split(/[\s.,!?]+/).some((w) => w.length >= 4 && tekstas.includes(w.slice(0, 4))));
      });
      expect(suGundymu.length, `lygis ${sk.numeris}`).toBeGreaterThanOrEqual(k.length / 3);
    }
  });

  it('atsakymasTekste atpažįsta atsakymą, paimtą iš teksto', () => {
    expect(atsakymasTekste({ id: 'x', skyrius: 1, tipas: 'kova', tekstas: 'Ant akmens sėdi varlė.', klausimas: 'Kur?', atsakymai: [{ tekstas: 'ant akmens', teisingas: true }] })).toEqual(['akmens']);
  });

  it('kryžkelės ženklas sako tiesą: kelias su lobiu – ten, kur parašyta', () => {
    for (const sk of TURINYS.skyriai) {
      for (const sale of sk.sales) {
        const s = sale.kambariai.find((k) => k.tipas === 'sankryza')!;
        const zenklas = TURINYS.uzduotys.get(s.zenklas!)!;
        for (const a of zenklas.atsakymai) {
          const tikslas = sale.kambariai.find((k) => k.id === s.keliai![a.kelias!])!;
          if (a.tekstas.includes('kairėn')) expect(tikslas.x, zenklas.id).toBeLessThan(s.x);
          if (a.tekstas.includes('dešinėn')) expect(tikslas.x, zenklas.id).toBeGreaterThan(s.x);
        }
        const kairesKelias = zenklas.atsakymai.find((a) => a.tekstas.includes('kairėn'))!.kelias;
        const sakiniai = zenklas.tekstas.split(/(?<=[.!?])\s+/);
        const kairesSakinys = sakiniai.find((x) => /kair/i.test(x)) ?? '';
        expect(/lob/i.test(kairesSakinys), `${zenklas.id}: „${kairesSakinys}“`).toBe(kairesKelias === 'lobis');
      }
    }
  });
});
