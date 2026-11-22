import { describe, expect, it } from 'vitest';
import {
  istatytiVardus,
  rastiUzuomina,
  sakiniuRibos,
  sakinysSuUzuomina,
  sauksmininkas,
  skiemenys,
  spalvintiSkiemenimis,
  sutvarkytiVarda,
  zetonai,
  zodziuSkaicius,
} from '../src/game/text';

describe('vardas', () => {
  it('šauksmininkas', () => {
    const atvejai: [string, string][] = [
      ['Jonas', 'Jonai'],
      ['Ugnė', 'Ugne'],
      ['Paulius', 'Pauliau'],
      ['Kajus', 'Kajau'],
      ['Herkus', 'Herkau'],
      ['Joris', 'Jori'],
      ['Austėja', 'Austėja'],
      ['Gytis', 'Gyti'],
      ['Benediktas', 'Benediktai'],
      ['JONAS', 'JONAI'],
    ];
    for (const [v, s] of atvejai) expect(sauksmininkas(v)).toBe(s);
  });

  it('sutvarko įvestą vardą', () => {
    expect(sutvarkytiVarda('  ugnė  ')).toBe('Ugnė');
    expect(sutvarkytiVarda('ąžuolas')).toBe('Ąžuolas');
    expect(sutvarkytiVarda('a'.repeat(30))).toHaveLength(16);
    expect(sutvarkytiVarda('   ')).toBe('');
  });

  it('įstato vardą ir savus žodžius (arba numatytuosius)', () => {
    const z = { vardas: 'Ugnė', kreipinys: 'Ugne', savi: { seimosNarys: 'Senelė', draugas: '', augintinis: 'Pūkas' } };
    expect(istatytiVardus('[Vardas] randa raktą.', z)).toBe('Ugnė randa raktą.');
    expect(istatytiVardus('Puiku, [Kreipinys]!', z)).toBe('Puiku, Ugne!');
    expect(istatytiVardus('[Šeima] ir [Augintinis]', z)).toBe('Senelė ir Pūkas');
    expect(istatytiVardus('[Draugas]', z)).toBe('Ema');
  });
});

describe('skiemenys', () => {
  const atvejai: [string, string][] = [
    ['varinis', 'va-ri-nis'],
    ['kardas', 'kar-das'],
    ['geltonas', 'gel-to-nas'],
    ['šikšnosparnis', 'šik-šnos-par-nis'],
    ['Žiežirba', 'Žie-žir-ba'],
    ['šviečia', 'švie-čia'],
    ['sriubos', 'sriu-bos'],
    ['kiaulė', 'kiau-lė'],
    ['ąžuolas', 'ą-žuo-las'],
    ['samanų', 'sa-ma-nų'],
    ['drėgnas', 'drėg-nas'],
    ['džiaugsmas', 'džiaug-smas'],
    ['voratinklis', 'vo-ra-tin-klis'],
    ['akmens', 'ak-mens'],
    ['sraigė', 'srai-gė'],
    ['laukia', 'lau-kia'],
    ['ir', 'ir'],
  ];
  for (const [z, laukta] of atvejai) {
    it(`${z} → ${laukta}`, () => expect(skiemenys(z).join('-')).toBe(laukta));
  }
  it('spalvinami tik ilgi (3+ skiemenų) žodžiai', () => {
    expect(spalvintiSkiemenimis('varinis')).toBe(true);
    expect(spalvintiSkiemenimis('kardas')).toBe(false);
  });
});

describe('žodžiai, sakiniai, užuominos', () => {
  it('žetonai išlaiko visą tekstą', () => {
    const t = 'Ant akmens sėdi žalia varlė.';
    expect(zetonai(t).map((z) => z.tekstas).join('')).toBe(t);
    expect(zetonai(t).filter((z) => z.tipas === 'zodis')).toHaveLength(5);
  });

  it('žodžių skaičius ([Vardas] – vienas žodis)', () => {
    expect(zodziuSkaicius('[Vardas] randa blizgantį raktą.')).toBe(4);
    expect(zodziuSkaicius('[Vardas] sugauna žodį „ugnis“.')).toBe(4);
  });

  it('randa užuominą kaip visą žodį, nepaisant raidžių dydžio', () => {
    const t = 'Po grybu slepiasi pelė.';
    expect(rastiUzuomina(t, 'pelė')).toEqual([18, 22]);
    expect(rastiUzuomina('Mėlynas voras mezga tinklą.', 'mėlynas')).toEqual([0, 7]);
    expect(rastiUzuomina(t, 'katė')).toBeNull();
  });

  it('sakinys su užuomina', () => {
    const t = 'Kairėje blizga skrynia. Ją saugo dvi Dėmės. Dešinėje – trumpas kelias.';
    expect(sakiniuRibos(t)).toHaveLength(3);
    const [a, b] = sakinysSuUzuomina(t, 'saugo')!;
    expect(t.slice(a, b)).toBe('Ją saugo dvi Dėmės.');
  });
});
