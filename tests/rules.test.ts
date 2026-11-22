// Tikrina, kad rules.ts skaičiai sutampa su scenarijaus dokumentu.
// Žemiau esančios lentelės perrašytos tiesiai iš dokumento.
import { describe, expect, it } from 'vitest';
import * as R from '../src/game/rules';

describe('scenarijaus skaičiai', () => {
  it('pradžia: 5 širdelės (iki 5, su šarvais iki 8), 3 manos (iki 10, su batais iki 15)', () => {
    expect(R.PRADZIOS_SIRDELES).toBe(5);
    expect(R.PRADZIOS_MANA).toBe(3);
    expect(R.IRANGOS_LENTELE.sarvai[0]).toBe(5);
    expect(Math.max(...R.IRANGOS_LENTELE.sarvai)).toBe(8);
    expect(R.IRANGOS_LENTELE.batai[0]).toBe(10);
    expect(Math.max(...R.IRANGOS_LENTELE.batai)).toBe(15);
  });

  it('lentelė „Įvykis / Širdelės / Mana“', () => {
    expect(R.ATLYGIAI.teisingaiIsPirmo).toEqual({ sirdeles: 1, mana: 1 });
    expect(R.ATLYGIAI.teisingaiPoKlaidos).toEqual({ sirdeles: 0, mana: 0 });
    expect(R.ATLYGIAI.klaida).toEqual({ sirdeles: -1, mana: 0 });
    expect(R.ATLYGIAI.serija).toEqual({ ilgis: 3, mana: 2 });
    expect(R.ATLYGIAI.bosas.mana).toBe(3);
    expect(R.ATLYGIAI.lobis).toEqual({ sirdelesMin: 1, sirdelesMax: 2, mana: 3 });
  });

  it('priešų gyvybės: maža Dėmė 1, vidutinis 2, bosas 5', () => {
    expect(R.PRIESO_GYVYBES).toEqual({ mazas: 1, vidutinis: 2, bosas: 5 });
  });

  it('po klaidos mygtukai užsirakina 2 s, po 2 klaidų – sakinys; pralaimėjus širdelės iki 5', () => {
    expect(R.UZRAKTAS_PO_KLAIDOS_MS).toBe(2000);
    expect(R.KLAIDOS_IKI_SAKINIO).toBe(2);
    expect(R.SIRDELES_PO_PRALAIMEJIMO).toBe(5);
  });

  it('burtai: Švieselė 1 mana, Gydymas 3 manos ir +2 širdelės; 1 skyriuje tik šie du', () => {
    expect(R.BURTAI.sviesele.mana).toBe(1);
    expect(R.BURTAI.gydymas.mana).toBe(3);
    expect(R.BURTAI.gydymas.sirdeles).toBe(2);
    expect(Object.keys(R.BURTAI)).toEqual(['sviesele', 'gydymas']);
  });

  it('įrangos lentelė (Lygis / Kardas / Šalmas / Šarvai / Batai / Kada pasirodo)', () => {
    const dokumentas = [
      ['medinis', 0, 0, 5, 10, 0],
      ['varinis', 1, 0, 6, 11, 1],
      ['geležinis', 1, 1, 6, 12, 2],
      ['sidabrinis', 2, 1, 7, 13, 3],
      ['auksinis', 2, 2, 7, 14, 4],
      ['deimantinis', 3, 2, 8, 15, 5],
    ] as const;
    dokumentas.forEach(([pav, kardas, salmas, sarvai, batai, skyrius], lygis) => {
      expect(R.LYGIU_PAVADINIMAI[lygis]).toBe(pav);
      expect(R.IRANGOS_LENTELE.kardas[lygis]).toBe(kardas);
      expect(R.IRANGOS_LENTELE.salmas[lygis]).toBe(salmas);
      expect(R.IRANGOS_LENTELE.sarvai[lygis]).toBe(sarvai);
      expect(R.IRANGOS_LENTELE.batai[lygis]).toBe(batai);
      if (skyrius > 0) expect(R.skyriausLygis(skyrius)).toBe(lygis);
    });
  });

  it('grobis: maža Dėmė 1/10, vidutinis 1/4, lobis 1/2, bosas visada; geras skaitymas – dviguba', () => {
    expect(R.ISKRITIMO_TIKIMYBE).toEqual({ mazas: 0.1, vidutinis: 0.25, lobis: 0.5, bosas: 1 });
    expect(R.GERO_SKAITYMO_DAUGIKLIS).toBe(2);
    expect(R.AUKSTESNIO_LYGIO_TIKIMYBE).toBe(0.1);
    expect(R.KAUKAI_MOKA_MANOS).toBe(2);
  });

  it('žvaigždutės 1–3 pagal klaidų skaičių', () => {
    expect(R.zvaigzdutes(0)).toBe(3);
    expect(R.zvaigzdutes(1)).toBe(2);
    expect(R.zvaigzdutes(2)).toBe(2);
    expect(R.zvaigzdutes(3)).toBe(1);
    expect(R.zvaigzdutes(20)).toBe(1);
  });
});
