import { describe, expect, it } from 'vitest';
import { atsakymasTekste, patikrintiTurini, skyrius, TURINYS } from '../src/content';

describe('1 skyriaus turinys', () => {
  it('praeina visus turinio patikrinimus', () => {
    expect(patikrintiTurini(TURINYS)).toEqual([]);
  });

  it('apie 40 užduočių: 3–4 salės ir bosas su 5 tekstais', () => {
    const visos = [...TURINYS.uzduotys.values()].filter((u) => u.skyrius === 1);
    expect(visos.length).toBeGreaterThanOrEqual(36);
    expect(visos.length).toBeLessThanOrEqual(44);
    const sk = skyrius(TURINYS, 1);
    expect(sk.pavadinimas).toBe('Drėgnas urvas');
    expect(sk.bosas.vardas).toBe('Didžioji Dėmė');
    expect(sk.sales.length).toBeGreaterThanOrEqual(3);
    expect(sk.sales.length).toBeLessThanOrEqual(4);
    expect(sk.bosas.uzduotys).toHaveLength(5);
  });

  it('užduotys reikalauja suprasti: teisingas atsakymas nekartoja teksto žodžių', () => {
    for (const u of TURINYS.uzduotys.values()) {
      if (u.tipas !== 'kova' && u.tipas !== 'bosas') continue;
      expect(atsakymasTekste(u), u.id).toEqual([]);
    }
  });

  it('dalis klaidingų atsakymų paimta iš teksto (kad neužtektų ieškoti to paties žodžio)', () => {
    const kovos = [...TURINYS.uzduotys.values()].filter((u) => u.tipas === 'kova' || u.tipas === 'bosas');
    const suGundymu = kovos.filter((u) => {
      const tekstas = u.tekstas.toLocaleLowerCase('lt');
      return u.atsakymai.some((a) => !a.teisingas && a.tekstas.toLocaleLowerCase('lt').split(/\s+/).some((w) => w.length >= 4 && tekstas.includes(w.slice(0, 4))));
    });
    expect(suGundymu.length).toBeGreaterThanOrEqual(kovos.length / 3);
  });

  it('atsakymasTekste atpažįsta atsakymą, paimtą iš teksto', () => {
    expect(atsakymasTekste({ id: 'x', skyrius: 1, tipas: 'kova', tekstas: 'Ant akmens sėdi varlė.', klausimas: 'Kur?', atsakymai: [{ tekstas: 'ant akmens', teisingas: true }] })).toEqual(['akmens']);
  });

  it('kiekvienoje salėje: sankryža, lobio kelias (2–3 priešai), trumpas kelias (1 priešas), slaptos durys', () => {
    for (const sale of skyrius(TURINYS, 1).sales) {
      const sankryza = sale.kambariai.find((k) => k.tipas === 'sankryza')!;
      expect(sankryza.slaptosDurys).toBeDefined();
      const priesuKelyje = (pradzia: string) => {
        let kiek = 0;
        let dabar = sale.kambariai.find((k) => k.id === pradzia)!;
        const matyti = new Set<string>([sankryza.id]);
        while (dabar.tipas !== 'galas') {
          if (dabar.tipas === 'priesas' || dabar.sargas) kiek++;
          matyti.add(dabar.id);
          dabar = sale.kambariai.find((k) => dabar.kaimynai.includes(k.id) && !matyti.has(k.id))!;
        }
        return kiek;
      };
      const lobio = priesuKelyje(sankryza.keliai!.lobis!);
      expect(lobio).toBeGreaterThanOrEqual(2);
      expect(lobio).toBeLessThanOrEqual(3);
      expect(priesuKelyje(sankryza.keliai!.trumpas!)).toBe(1);
    }
  });

  it('sankryžos ženklas sako tiesą apie kelius (kairė/dešinė sutampa su žemėlapiu)', () => {
    for (const sale of skyrius(TURINYS, 1).sales) {
      const s = sale.kambariai.find((k) => k.tipas === 'sankryza')!;
      const zenklas = TURINYS.uzduotys.get(s.zenklas!)!;
      for (const a of zenklas.atsakymai) {
        const tikslas = sale.kambariai.find((k) => k.id === s.keliai![a.kelias!])!;
        if (a.tekstas.includes('kairėn')) expect(tikslas.x).toBeLessThan(s.x);
        if (a.tekstas.includes('dešinėn')) expect(tikslas.x).toBeGreaterThan(s.x);
      }
      const kairesKelias = zenklas.atsakymai.find((a) => a.tekstas.includes('kairėn'))!.kelias;
      const kairesSakinys = zenklas.tekstas.split('.')[0];
      expect(kairesSakinys.includes('lob') || kairesSakinys.includes('skryn')).toBe(kairesKelias === 'lobis');
    }
  });
});
