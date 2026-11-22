// Žaidimo valdiklis: laiko būseną, perjungia ekranus, saugo progresą.

import { TURINYS, type Turinys } from '../content';
import type { Grobis } from '../game/equipment';
import * as E from '../game/engine';
import { sistemosRng, sumaisyti, type Rng } from '../game/rng';
import type { Burtas } from '../game/rules';
import { ikelti, issaugoti, istrinti } from '../game/storage';
import { istatytiVardus } from '../game/text';
import type { Busena, Kosmetika } from '../game/types';
import { isvalyti } from './dom';
import { ekranasKnyga, ekranasIstorija, ekranasLauzas, ekranasPradzia, ekranasSkyrius, ekranasTevai } from './ekranai';
import { ekranasKova, skraidintiRaides } from './kova';
import { langas } from './langai';
import { ekranasSale } from './sale';
import { atsitiktine, ZIEZIRBA } from './tekstai';
import { UZRAKTAS_PO_KLAIDOS_MS } from '../game/rules';

export type Langas =
  | { tipas: 'nugaletas'; zodis: string | null; kardoMana: number; sugautas: boolean; pabeges: boolean }
  | { tipas: 'grobis'; grobis: Grobis }
  | { tipas: 'lobis'; sirdeles: number; mana: number; planuota: { sirdeles: number; mana: number } }
  | { tipas: 'dovana'; dovana: Kosmetika }
  | { tipas: 'durys'; tvarka: number[] }
  | { tipas: 'saleBaigta'; zvaigzdutes: number }
  | { tipas: 'pralaimejimas' }
  | { tipas: 'pergale' }
  | { tipas: 'daiktai' };

export type Ekranas = 'pradzia' | 'istorija' | 'zaidimas' | 'knyga' | 'tevai';

export class Zaidimas {
  readonly t: Turinys = TURINYS;
  busena: Busena | null;
  ekranas: Ekranas = 'pradzia';
  istorijosPsl = 0;
  kova: Kova | null = null;
  /** Kova, kurios tekstas dar skrenda į Knygą (rodoma animacijos metu). */
  animKova: { kova: Kova; teisingas: number; nugaletas: boolean } | null = null;
  langai: Langas[] = [];
  private poLangu: (() => void) | null = null;
  zinute: string | null = null;
  uzraktasIki = 0;
  grizti: Ekranas = 'zaidimas';
  rng: Rng = sistemosRng;
  private laikoPradzia = Date.now();

  constructor(private readonly saknis: HTMLElement) {
    this.busena = ikelti(this.t);
    setInterval(() => this.skaiciuotiLaika(), 15000);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.skaiciuotiLaika();
      else this.laikoPradzia = Date.now();
    });
  }

  // ---------------------------------------------------------------- pagalbinės

  /** Įstato vaiko vardą ir savus žodžius į tekstą. */
  tekstas(s: string): string {
    const b = this.busena;
    if (!b) return s;
    return istatytiVardus(s, { vardas: b.vardas, kreipinys: b.kreipinys, savi: b.nustatymai.savi });
  }

  get b(): Busena {
    if (!this.busena) throw new Error('Nėra žaidėjo');
    return this.busena;
  }

  saugoti(): void {
    if (this.busena) issaugoti(this.busena);
  }

  private skaiciuotiLaika(): void {
    const dabar = Date.now();
    if (this.busena && !document.hidden && this.ekranas !== 'pradzia' && this.ekranas !== 'tevai') {
      const s = this.busena.statistika;
      this.busena = { ...this.busena, statistika: { ...s, laikasMs: s.laikasMs + Math.min(dabar - this.laikoPradzia, 60000) } };
      this.saugoti();
    }
    this.laikoPradzia = dabar;
  }

  atnaujinti(b: Busena): void {
    this.busena = b;
    this.saugoti();
    this.render();
  }

  // ---------------------------------------------------------------- piešimas

  render(): void {
    const aktyvus = document.activeElement as HTMLElement | null;
    const fokusoId = aktyvus?.dataset?.fokusas;
    isvalyti(this.saknis);
    const b = this.busena;
    this.saknis.classList.toggle('didziosios', !!b?.nustatymai.didziosios);
    let el: HTMLElement;
    if (!b || this.ekranas === 'pradzia') el = ekranasPradzia(this);
    else if (this.ekranas === 'istorija') el = ekranasIstorija(this);
    else if (this.ekranas === 'knyga') el = ekranasKnyga(this);
    else if (this.ekranas === 'tevai') el = ekranasTevai(this);
    else if (this.kova || this.animKova) el = ekranasKova(this);
    else if (b.vieta.kur === 'skyrius') el = ekranasSkyrius(this);
    else if (b.vieta.kur === 'sale') el = ekranasSale(this);
    else el = ekranasLauzas(this);
    this.saknis.appendChild(el);
    const pirmas = this.langai[0];
    if (pirmas && this.busena && this.ekranas === 'zaidimas') {
      const l = langas(this, pirmas);
      this.saknis.appendChild(l);
      (l.querySelector('[data-pirmas]') as HTMLElement | null)?.focus();
    } else if (fokusoId) {
      (this.saknis.querySelector(`[data-fokusas="${fokusoId}"]`) as HTMLElement | null)?.focus();
    }
  }

  // ---------------------------------------------------------------- langai

  rodytiLangus(langai: Langas[], poTo: (() => void) | null = null): void {
    this.langai.push(...langai);
    if (poTo) this.poLangu = poTo;
    if (this.langai.length === 0 && this.poLangu) {
      const f = this.poLangu;
      this.poLangu = null;
      f();
      return;
    }
    this.render();
  }

  uzdarytiLanga(): void {
    this.langai.shift();
    if (this.langai.length === 0 && this.poLangu) {
      const f = this.poLangu;
      this.poLangu = null;
      f();
    }
    this.render();
  }

  // ---------------------------------------------------------------- pradžia

  pradetiNauja(vardas: string): void {
    this.busena = E.naujaBusena(vardas, this.t);
    this.saugoti();
    this.ekranas = 'istorija';
    this.istorijosPsl = 0;
    this.render();
  }

  zaisti(): void {
    this.ekranas = this.b.istorijaPerskaityta ? 'zaidimas' : 'istorija';
    this.laikoPradzia = Date.now();
    this.render();
  }

  baigtiIstorija(): void {
    this.busena = { ...this.b, istorijaPerskaityta: true };
    this.saugoti();
    this.ekranas = 'zaidimas';
    this.render();
  }

  atidaryti(ekranas: 'knyga' | 'tevai'): void {
    this.grizti = this.ekranas === 'knyga' || this.ekranas === 'tevai' ? this.grizti : this.ekranas;
    this.ekranas = ekranas;
    this.render();
  }

  uzdaryti(): void {
    this.ekranas = this.busena ? this.grizti : 'pradzia';
    this.render();
  }

  istrintiZaideja(): void {
    istrinti();
    this.busena = null;
    this.kova = null;
    this.langai = [];
    this.ekranas = 'pradzia';
    this.render();
  }

  // ---------------------------------------------------------------- žemėlapiai

  eitiPrieSales(saleId: string): void {
    if (!E.saleAtrakinta(this.b, this.t, saleId)) return;
    this.zinute = null;
    this.atnaujinti(E.eitiPrieLauzo(this.b, saleId));
  }

  eitiPrieBoso(): void {
    if (!E.bosasAtrakintas(this.b, this.t)) return;
    this.atnaujinti(E.eitiPrieBosoLauzo(this.b));
  }

  iSkyriausZemelapi(): void {
    this.zinute = null;
    this.atnaujinti({ ...this.b, vieta: { kur: 'skyrius' } });
  }

  ieitiISale(): void {
    const v = this.b.vieta;
    if (v.kur !== 'lauzas') return;
    this.zinute = 'Paliesk kambarį, į kurį nori eiti.';
    this.atnaujinti(E.ieitiISale(this.b, this.t, v.sale));
  }

  eitiIKambari(kambarys: string): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale' || !E.galimiEjimai(this.b, this.t).includes(kambarys)) return;
    this.busena = E.eitiIKambari(this.b, v.sale, kambarys);
    this.saugoti();
    this.atvykus();
  }

  pasirinktiKelia(atsakymas: number): void {
    this.busena = E.pasirinktiKelia(this.b, this.t, atsakymas);
    this.saugoti();
    this.atvykus();
  }

  /** Kas nutinka atėjus į kambarį. */
  atvykus(): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale') return this.render();
    const veiksmas = E.kambarioVeiksmas(this.b, this.t);
    const sale = E.rastiSale(this.t, v.sale);
    switch (veiksmas.tipas) {
      case 'kova': {
        const kamb = E.rastiKambari(sale, v.kambarys);
        this.pradetiKova(E.kovaKambaryje(this.b, this.t, sale, kamb, this.rng));
        return;
      }
      case 'lobis': {
        const r = E.atidarytiLobi(this.b, sale.id, this.rng);
        this.busena = r.busena;
        this.saugoti();
        const langai: Langas[] = [{ tipas: 'lobis', sirdeles: r.sirdeles, mana: r.mana, planuota: r.planuota }];
        if (r.grobis) langai.push({ tipas: 'grobis', grobis: r.grobis });
        this.rodytiLangus(langai);
        return;
      }
      case 'dovana':
        this.busena = E.paimtiDovana(this.b, veiksmas.dovana);
        this.saugoti();
        this.rodytiLangus([{ tipas: 'dovana', dovana: veiksmas.dovana }]);
        return;
      case 'sankryza':
        this.zinute = ZIEZIRBA.zenklas;
        this.render();
        return;
      case 'galas': {
        const r = E.baigtiSale(this.b, this.t, sale.id);
        this.busena = r.busena;
        this.saugoti();
        this.zinute = null;
        this.rodytiLangus([{ tipas: 'saleBaigta', zvaigzdutes: r.zvaigzdutes }]);
        return;
      }
      default:
        this.zinute = 'Paliesk kambarį, į kurį nori eiti.';
        this.render();
    }
  }

  atidarytiDuris(): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale') return;
    const sale = E.rastiSale(this.t, v.sale);
    const kamb = E.rastiKambari(sale, v.kambarys);
    if (!kamb.slaptosDurys) return;
    if (this.b.sales[sale.id]?.durysAtidarytos) {
      this.busena = E.eitiIKambari(this.b, sale.id, kamb.slaptosDurys.kambarys);
      this.saugoti();
      this.atvykus();
      return;
    }
    const misle = this.t.uzduotys.get(kamb.slaptosDurys.misle);
    this.rodytiLangus([{ tipas: 'durys', tvarka: sumaisyti(this.rng, misle ? misle.atsakymai.map((_, i) => i) : []) }]);
  }

  atsakytiMislei(indeksas: number): void {
    const r = E.atsakytiMislei(this.b, this.t, indeksas);
    this.busena = r.busena;
    this.saugoti();
    this.langai.shift();
    if (!r.atidaryta) {
      this.zinute = ZIEZIRBA.durysUzdarytos;
      this.render();
      return;
    }
    this.zinute = ZIEZIRBA.durysAtidarytos;
    this.atidarytiDuris();
  }

  rytojTesiam(tesiam: boolean): void {
    this.langai.shift();
    if (!tesiam) this.ekranas = 'pradzia';
    this.render();
  }

  // ---------------------------------------------------------------- kova

  pradetiKova(kova: Kova): void {
    this.kova = kova;
    this.zinute = ZIEZIRBA.pradzia[kova.rusis];
    this.uzraktasIki = 0;
    this.render();
  }

  pradetiBosoKova(): void {
    this.busena = E.pradetiBosoKova(this.b);
    this.pradetiKova(E.bosoKova(this.t, this.rng));
  }

  get uzrakinta(): boolean {
    return Date.now() < this.uzraktasIki || this.animKova !== null;
  }

  atsakyti(indeksas: number): void {
    const k = this.kova;
    if (!k || this.uzrakinta) return;
    const r = E.atsakyti(this.b, this.t, k, indeksas, this.rng);
    if (r.ivykiai.length === 0) return;
    this.busena = r.busena;
    this.saugoti();
    const tipai = new Set(r.ivykiai.map((i) => i.tipas));

    if (tipai.has('klaida')) {
      this.kova = r.kova;
      const pradzia = tipai.has('salmas') ? `${ZIEZIRBA.salmas} ` : '';
      this.zinute = pradzia + (r.kova.uzuomina === 'sakinys' ? ZIEZIRBA.klaida2 : ZIEZIRBA.klaida1);
      this.uzraktasIki = Date.now() + UZRAKTAS_PO_KLAIDOS_MS;
      setTimeout(() => this.render(), UZRAKTAS_PO_KLAIDOS_MS + 20);
      if (tipai.has('pralaimejimas')) {
        this.zinute = ZIEZIRBA.pralaimejimas;
        setTimeout(() => this.rodytiLangus([{ tipas: 'pralaimejimas' }]), 900);
      }
      this.render();
      return;
    }

    const teisinga = r.ivykiai.find((i) => i.tipas === 'teisinga');
    const isPirmo = teisinga?.tipas === 'teisinga' && teisinga.isPirmo;
    this.zinute = this.tekstas(atsitiktine(isPirmo ? ZIEZIRBA.teisingai : ZIEZIRBA.poKlaidos));
    if (tipai.has('serija')) this.zinute += ` ${ZIEZIRBA.serija}`;
    const nugaletas = tipai.has('nugaletas') || tipai.has('bosasNugaletas');
    this.animKova = { kova: k, teisingas: indeksas, nugaletas };
    this.kova = r.kova;
    this.render();
    skraidintiRaides(this.saknis, nugaletas).then(() => {
      this.animKova = null;
      if (!nugaletas) return this.render();
      this.poPergales(r.ivykiai, k);
    });
  }

  private poPergales(ivykiai: E.Ivykis[], k: Kova): void {
    this.kova = null;
    this.zinute = null;
    const boso = ivykiai.find((i) => i.tipas === 'bosasNugaletas');
    if (boso && boso.tipas === 'bosasNugaletas') {
      const langai: Langas[] = [{ tipas: 'pergale' }];
      if (boso.grobis) langai.push({ tipas: 'grobis', grobis: boso.grobis });
      this.rodytiLangus(langai, () => {
        this.busena = { ...this.b, vieta: { kur: 'skyrius' } };
        this.saugoti();
        this.grizti = 'zaidimas';
        this.ekranas = 'knyga';
      });
      return;
    }
    const n = ivykiai.find((i) => i.tipas === 'nugaletas');
    const langai: Langas[] = [];
    if (n && n.tipas === 'nugaletas') {
      langai.push({ tipas: 'nugaletas', zodis: n.zodis, kardoMana: n.kardoMana, sugautas: n.sugautas, pabeges: k.rusis === 'pabeges' });
      if (n.grobis) langai.push({ tipas: 'grobis', grobis: n.grobis });
    }
    this.rodytiLangus(langai, () => {
      // Po įprastos kovos gali iššokti pabėgusi Dėmė.
      const pab = k.rusis !== 'pabeges' ? E.pabegusiDeme(this.b, this.t, this.rng) : null;
      if (pab) {
        this.kova = pab;
        this.zinute = ZIEZIRBA.pradzia.pabeges;
        return;
      }
      this.atvykusPoKovos();
    });
  }

  /** Grįžus į žemėlapį: jei tai lobio kambarys su sargu – atidaromas lobis. */
  private atvykusPoKovos(): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale') return;
    const veiksmas = E.kambarioVeiksmas(this.b, this.t);
    if (veiksmas.tipas === 'lobis') {
      this.atvykus();
      return;
    }
    this.zinute = 'Paliesk kambarį, į kurį nori eiti.';
  }

  priimtiGrobi(imu: boolean): void {
    const l = this.langai[0];
    if (!l || l.tipas !== 'grobis') return;
    this.busena = E.priimtiGrobi(this.b, l.grobis, imu);
    this.saugoti();
    this.uzdarytiLanga();
  }

  pralaimeti(): void {
    this.kova = null;
    this.animKova = null;
    this.uzraktasIki = 0;
    this.langai = this.langai.filter((l) => l.tipas !== 'pralaimejimas');
    this.zinute = null;
    this.atnaujinti(E.pralaimeti(this.b));
  }

  burtas(burtas: Burtas): void {
    if (this.animKova) return;
    if (!E.galimaBurta(this.b, this.kova, burtas)) return;
    const r = E.naudotiBurta(this.b, this.kova, burtas);
    this.kova = r.kova;
    this.zinute = burtas === 'gydymas' ? ZIEZIRBA.gydymas : ZIEZIRBA.sviesele;
    this.atnaujinti(r.busena);
  }

  // ---------------------------------------------------------------- tėvai

  keistiNustatymus(f: (b: Busena) => Busena): void {
    this.busena = f(this.b);
    this.saugoti();
  }
}

type Kova = E.Kova;

export function paleisti(saknis: HTMLElement): Zaidimas {
  const z = new Zaidimas(saknis);
  z.render();
  return z;
}

