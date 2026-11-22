import { describe, expect, it } from 'vitest';
import { TURINYS } from '../src/content';
import { naujaBusena } from '../src/game/engine';
import { atkurtiBusena, ikelti, issaugoti, istrinti, SAUGYKLOS_RAKTAS, type Saugykla } from '../src/game/storage';

function atmintis(): Saugykla & { duom: Map<string, string> } {
  const duom = new Map<string, string>();
  return {
    duom,
    getItem: (k) => duom.get(k) ?? null,
    setItem: (k, v) => void duom.set(k, v),
    removeItem: (k) => void duom.delete(k),
  };
}

describe('saugykla', () => {
  it('išsaugo ir įkelia tą pačią būseną', () => {
    const s = atmintis();
    const b = { ...naujaBusena('Ugnė', TURINYS), mana: 7, zodziai: ['akmuo'] };
    expect(issaugoti(b, s)).toBe(true);
    expect(ikelti(TURINYS, s)).toEqual(b);
    istrinti(s);
    expect(ikelti(TURINYS, s)).toBeNull();
  });

  it('sugadinti duomenys negriauna žaidimo', () => {
    const s = atmintis();
    s.setItem(SAUGYKLOS_RAKTAS, '{ne json');
    expect(ikelti(TURINYS, s)).toBeNull();
    expect(atkurtiBusena({ versija: 2, vardas: 'X' }, TURINYS)).toBeNull();
    expect(atkurtiBusena(null, TURINYS)).toBeNull();
  });

  it('trūkstami laukai užpildomi, netinkami atmetami, kova neatkuriama', () => {
    const b = atkurtiBusena(
      { versija: 1, vardas: 'Jonas', mana: 'daug', sales: { 's1-sale1': { baigta: true } }, vieta: { kur: 'sale', sale: 's1-sale2', kambarys: 'r1' } },
      TURINYS,
    )!;
    expect(b.mana).toBe(3);
    expect(b.kreipinys).toBe('Jonai');
    expect(b.sales['s1-sale1'].baigta).toBe(true);
    expect(b.sales['s1-sale1'].aplankyti).toEqual([]);
    expect(b.sales['s1-sale3']).toBeDefined();
    expect(b.vieta).toEqual({ kur: 'lauzas', sale: 's1-sale2' });
  });

  it('nepasiekiama saugykla – žaidimas tęsiasi be išsaugojimo', () => {
    const blogas: Saugykla = {
      getItem: () => { throw new Error('x'); },
      setItem: () => { throw new Error('x'); },
      removeItem: () => { throw new Error('x'); },
    };
    expect(ikelti(TURINYS, blogas)).toBeNull();
    expect(issaugoti(naujaBusena('A', TURINYS), blogas)).toBe(false);
    expect(() => istrinti(blogas)).not.toThrow();
  });
});
