import { describe, expect, it } from 'vitest';
import {
  daiktoAprasas,
  daiktoPavadinimas,
  iskritimoTikimybe,
  maxMana,
  maxSirdeles,
  palyginti,
  PRADINE_IRANGA,
  ridentiGrobi,
} from '../src/game/equipment';
import { seklinisRng, type Rng } from '../src/game/rng';
import type { Iranga } from '../src/game/types';

const seka = (...xs: number[]): Rng => {
  let i = 0;
  return () => xs[i++ % xs.length];
};

describe('įrangos pavadinimai ir aprašai', () => {
  it('derina giminę ir skaičių', () => {
    expect(daiktoPavadinimas('kardas', 0)).toBe('Medinis kardas');
    expect(daiktoPavadinimas('salmas', 2)).toBe('Geležinis šalmas');
    expect(daiktoPavadinimas('sarvai', 1)).toBe('Variniai šarvai');
    expect(daiktoPavadinimas('batai', 5)).toBe('Deimantiniai batai');
  });

  it('aprašas kaip dokumento pavyzdyje', () => {
    expect(`${daiktoPavadinimas('salmas', 2)}. ${daiktoAprasas('salmas', 2)}`).toBe(
      'Geležinis šalmas. Viena klaida salėje neatima širdelės.',
    );
    expect(daiktoAprasas('salmas', 4)).toBe('Dvi klaidos salėje neatima širdelės.');
    expect(daiktoAprasas('kardas', 1)).toBe('Už nugalėtą priešą gausi 1 maną.');
    expect(daiktoAprasas('kardas', 3)).toBe('Už nugalėtą priešą gausi 2 manas.');
    expect(daiktoAprasas('sarvai', 5)).toBe('Gali turėti iki 8 širdelių.');
    expect(daiktoAprasas('batai', 1)).toBe('Gali turėti iki 11 manų.');
  });

  it('rodyklė aukštyn / žemyn / lygu', () => {
    expect(palyginti('kardas', 1, 0)).toBe('aukstyn');
    expect(palyginti('sarvai', 0, 3)).toBe('zemyn');
    expect(palyginti('salmas', 1, 0)).toBe('lygu'); // varinis šalmas = medinis (0)
  });

  it('maksimumai priklauso nuo šarvų ir batų', () => {
    expect(maxSirdeles(PRADINE_IRANGA)).toBe(5);
    expect(maxMana(PRADINE_IRANGA)).toBe(10);
    expect(maxSirdeles({ ...PRADINE_IRANGA, sarvai: 5 })).toBe(8);
    expect(maxMana({ ...PRADINE_IRANGA, batai: 5 })).toBe(15);
  });
});

describe('grobis', () => {
  it('tikimybės ir dvigubinimas už gerą skaitymą', () => {
    expect(iskritimoTikimybe('mazas', false)).toBe(0.1);
    expect(iskritimoTikimybe('mazas', true)).toBe(0.2);
    expect(iskritimoTikimybe('vidutinis', true)).toBe(0.5);
    expect(iskritimoTikimybe('lobis', true)).toBe(0.5); // lobis neturi tekstų
    expect(iskritimoTikimybe('bosas', false)).toBe(1);
  });

  it('1 skyriuje daiktas varinis, 1 iš 10 – geležinis', () => {
    // 1-as skaičius – ar iškrenta, 2-as – ar aukštesnis lygis, 3-ias – vieta.
    expect(ridentiGrobi(seka(0.05, 0.5, 0), 'mazas', false, 1, PRADINE_IRANGA)).toEqual({ daiktas: 'kardas', lygis: 1 });
    expect(ridentiGrobi(seka(0.05, 0.05, 0.99), 'mazas', false, 1, PRADINE_IRANGA)).toEqual({ daiktas: 'batai', lygis: 2 });
    expect(ridentiGrobi(seka(0.15), 'mazas', false, 1, PRADINE_IRANGA)).toBeNull();
    expect(ridentiGrobi(seka(0.15, 0.5, 0), 'mazas', true, 1, PRADINE_IRANGA)).not.toBeNull();
  });

  it('statistiškai: maža Dėmė ~10 %, aukštesnis lygis ~10 % iškritusių', () => {
    const rng = seklinisRng(42);
    let isk = 0;
    let aukst = 0;
    const N = 20000;
    for (let i = 0; i < N; i++) {
      const g = ridentiGrobi(rng, 'mazas', false, 1, PRADINE_IRANGA);
      if (g) {
        isk++;
        if (g.lygis === 2) aukst++;
      }
    }
    expect(isk / N).toBeGreaterThan(0.09);
    expect(isk / N).toBeLessThan(0.11);
    expect(aukst / isk).toBeGreaterThan(0.08);
    expect(aukst / isk).toBeLessThan(0.12);
  });

  it('bosas visada palieka daiktą ir renkasi dar nepatobulintą vietą', () => {
    const iranga: Iranga = { kardas: 1, salmas: 1, sarvai: 0, batai: 1 };
    for (let s = 0; s < 50; s++) {
      const g = ridentiGrobi(seklinisRng(s), 'bosas', false, 1, iranga);
      expect(g).not.toBeNull();
      expect(g!.daiktas).toBe('sarvai');
      expect(g!.lygis).toBeGreaterThanOrEqual(1);
    }
  });
});
