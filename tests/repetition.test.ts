import { describe, expect, it } from 'vitest';
import { issprestiPabegusi, laukiantisZodis, uzregistruotiKlaida } from '../src/game/repetition';

describe('pabėgę žodžiai (kartojimas su intervalais)', () => {
  it('klaida → grįžta po 2 susitikimų', () => {
    const p = uzregistruotiKlaida([], 's1-k01', 5);
    expect(p).toEqual([{ uzduotis: 's1-k01', dezute: 1, kada: 7 }]);
    expect(laukiantisZodis(p, 6)).toBeNull();
    expect(laukiantisZodis(p, 7)?.uzduotis).toBe('s1-k01');
  });

  it('iš pirmo karto: 1 → 2 dėžutė (po 4), paskui sugautas', () => {
    let p = uzregistruotiKlaida([], 'a', 0);
    let r = issprestiPabegusi(p, 'a', true, 2);
    expect(r.sugautas).toBe(false);
    expect(r.pabege).toEqual([{ uzduotis: 'a', dezute: 2, kada: 6 }]);
    p = r.pabege;
    r = issprestiPabegusi(p, 'a', true, 6);
    expect(r.sugautas).toBe(true);
    expect(r.pabege).toEqual([]);
  });

  it('vėl suklydus – atgal į 1 dėžutę', () => {
    const p = [{ uzduotis: 'a', dezute: 2 as const, kada: 6 }];
    const r = issprestiPabegusi(p, 'a', false, 6);
    expect(r.pabege).toEqual([{ uzduotis: 'a', dezute: 1, kada: 8 }]);
  });

  it('pirmas grįžta anksčiausiai laukiantis', () => {
    const p = [
      { uzduotis: 'b', dezute: 1 as const, kada: 4 },
      { uzduotis: 'a', dezute: 1 as const, kada: 3 },
    ];
    expect(laukiantisZodis(p, 10)?.uzduotis).toBe('a');
  });

  it('ta pati užduotis nekartojama eilėje', () => {
    const p = uzregistruotiKlaida(uzregistruotiKlaida([], 'a', 0), 'a', 3);
    expect(p).toHaveLength(1);
    expect(p[0].kada).toBe(5);
  });
});
