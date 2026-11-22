// Žaidimo valdiklis: laiko būseną, perjungia ekranus, saugo progresą.

import { TURINYS, type Turinys } from '../content';
import type { Grobis } from '../game/equipment';
import * as E from '../game/engine';
import { sistemosRng, sumaisyti, type Rng } from '../game/rng';
import type { Burtas } from '../game/rules';
import { ikelti, issaugoti, istrinti } from '../game/storage';
import { istatytiVardus } from '../game/text';
import type { Busena, Kosmetika } from '../game/types';
import { isvalyti, sumazintasJudesys } from './dom';
import { ekranasKnyga, ekranasIstorija, ekranasLauzas, ekranasPradzia, ekranasSkyrius, ekranasTevai } from './ekranai';
import { ekranasKova, skraidintiRaides } from './kova';
import { langas } from './langai';
import { ekranasKambarys } from './kambarys';
import { X } from './scena';
import { groti, nustatytiGarsa, paruostiGarsus, perjungtiVisaEkrana, type Garsas } from './garsai';
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
  | { tipas: 'daiktai' }
  | { tipas: 'zemelapis' };

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
    nustatytiGarsa(this.busena?.nustatymai.garsas ?? true);
    paruostiGarsus();
    document.addEventListener('fullscreenchange', () => this.render());
    document.addEventListener('keydown', (e) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') this.pirmyn();
      else if (e.key === 'ArrowLeft') this.atgal();
    });
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
    else if (b.vieta.kur === 'sale') el = ekranasKambarys(this);
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

  private langoGarsas(l: Langas | undefined): void {
    const g: Partial<Record<Langas['tipas'], Garsas>> = {
      lobis: 'lobis',
      grobis: 'grobis',
      dovana: 'grobis',
      saleBaigta: 'saleBaigta',
      pergale: 'saleBaigta',
      pralaimejimas: 'pralaimejimas',
    };
    const garsas = l && g[l.tipas];
    if (garsas) groti(garsas);
  }

  rodytiLangus(langai: Langas[], poTo: (() => void) | null = null): void {
    if (this.langai.length === 0) this.langoGarsas(langai[0]);
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
    this.langoGarsas(this.langai[0]);
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

  // ---------------------------------------------------------------- ėjimas (vaizdas iš šono)

  /** Herojaus vieta kambaryje (procentais) ir vykstantis ėjimas. */
  herojusX = X.iejimas;
  ejimas: { nuo: number; iki: number; trukme: number } | null = null;
  naujasKambarys = false;

  /** Ar dabar galima valdyti ėjimą (neina, nėra lango ar kovos). */
  private get laisvas(): boolean {
    return !this.ejimas && this.langai.length === 0 && !this.kova && !this.animKova && this.ekranas === 'zaidimas';
  }

  private eiti(iki: number, poTo: () => void): void {
    if (this.ejimas) return;
    const nuo = this.herojusX;
    const trukme = sumazintasJudesys() ? 1 : Math.max(350, Math.abs(iki - nuo) * 13);
    this.ejimas = { nuo, iki, trukme };
    this.render();
    groti('zingsnis');
    const zingsniai = setInterval(() => groti('zingsnis'), 280);
    setTimeout(() => {
      clearInterval(zingsniai);
      this.ejimas = null;
      this.herojusX = iki;
      poTo();
    }, trukme + 40);
  }

  /** Įeinama pro duris į kitą kambarį. */
  private ieiti(b: Busena, x: number): void {
    groti('durys');
    this.busena = b;
    this.saugoti();
    this.herojusX = x;
    this.naujasKambarys = true;
    const veiksmas = E.kambarioVeiksmas(b, this.t);
    this.zinute =
      veiksmas.tipas === 'sankryza'
        ? ZIEZIRBA.zenklas
        : veiksmas.tipas === 'kova'
          ? ZIEZIRBA.priekyjeDeme
          : veiksmas.tipas === 'galas'
            ? ZIEZIRBA.isejimas
            : null;
    this.render();
  }

  /** Nuo laužo į salę: herojus įeina į pirmą kambarį. */
  ieitiISale(): void {
    const v = this.b.vieta;
    if (v.kur !== 'lauzas') return;
    const sale = E.rastiSale(this.t, v.sale);
    const pirmas = E.kryptys(sale, sale.pradzia).pirmyn[0];
    this.ieiti(E.eitiIKambari(E.ieitiISale(this.b, this.t, v.sale), v.sale, pirmas), X.iejimas);
  }

  /** „Eiti ▶“: prie priešo, skrynios, kauko arba pro duris į kitą kambarį. */
  pirmyn(): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale' || !this.laisvas) return;
    const sale = E.rastiSale(this.t, v.sale);
    const kamb = E.rastiKambari(sale, v.kambarys);
    const veiksmas = E.kambarioVeiksmas(this.b, this.t);
    switch (veiksmas.tipas) {
      case 'kova':
        this.eiti(X.priesObjekta, () => this.pradetiKova(E.kovaKambaryje(this.b, this.t, sale, kamb, this.rng)));
        return;
      case 'lobis':
        this.eiti(X.priesObjekta, () => this.atidarytiLobi());
        return;
      case 'dovana':
        this.eiti(X.priesObjekta, () => {
          this.busena = E.paimtiDovana(this.b, veiksmas.dovana);
          this.saugoti();
          this.rodytiLangus([{ tipas: 'dovana', dovana: veiksmas.dovana }]);
        });
        return;
      case 'galas':
        this.eiti(X.desineDurys, () => {
          const r = E.baigtiSale(this.b, this.t, sale.id);
          this.busena = r.busena;
          this.saugoti();
          this.zinute = null;
          this.herojusX = X.iejimas;
          this.rodytiLangus([{ tipas: 'saleBaigta', zvaigzdutes: r.zvaigzdutes }]);
        });
        return;
      case 'sankryza':
        return;
      default: {
        const kr = E.kryptys(sale, kamb.id);
        if (kr.pirmyn.length !== 1) return;
        this.eiti(X.desineDurys, () => this.ieiti(E.eitiIKambari(this.b, sale.id, kr.pirmyn[0]), X.iejimas));
      }
    }
  }

  /** „◀“: atgal į ankstesnį kambarį (iš pirmo kambario – prie laužo). */
  atgal(): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale' || !this.laisvas) return;
    const sale = E.rastiSale(this.t, v.sale);
    const atgal = E.kryptys(sale, v.kambarys).atgal;
    if (!atgal) return;
    this.eiti(X.kaireDurys, () => {
      if (atgal === sale.pradzia) {
        groti('durys');
        this.zinute = null;
        this.herojusX = X.iejimas;
        this.atnaujinti(E.eitiPrieLauzo(this.b, sale.id));
        return;
      }
      this.ieiti(E.eitiIKambari(this.b, sale.id, atgal), X.desineDurys - 8);
    });
  }

  /** Sankryža: herojus nueina prie pasirinktų durų ir pro jas įeina. */
  pasirinktiKelia(atsakymas: number): void {
    if (!this.laisvas) return;
    this.eiti(atsakymas === 0 ? X.durysA : X.durysB, () => this.ieiti(E.pasirinktiKelia(this.b, this.t, atsakymas), X.iejimas));
  }

  private atidarytiLobi(poTo: (() => void) | null = () => this.autoPirmyn()): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale') return;
    const r = E.atidarytiLobi(this.b, v.sale, this.rng);
    this.busena = r.busena;
    this.saugoti();
    const langai: Langas[] = [{ tipas: 'lobis', sirdeles: r.sirdeles, mana: r.mana, planuota: r.planuota }];
    if (r.grobis) langai.push({ tipas: 'grobis', grobis: r.grobis });
    this.rodytiLangus(langai, poTo);
  }

  /** Po įveikto kambario herojus pats nueina pro atsidariusias duris. */
  private autoPirmyn(): void {
    this.render();
    setTimeout(() => {
      if (!this.laisvas || this.b.vieta.kur !== 'sale') return;
      if (E.kambarioVeiksmas(this.b, this.t).tipas !== 'nieko') return;
      this.pirmyn();
    }, 700);
  }

  atidarytiDuris(): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale' || this.ejimas) return;
    const sale = E.rastiSale(this.t, v.sale);
    const kamb = E.rastiKambari(sale, v.kambarys);
    if (!kamb.slaptosDurys) return;
    if (this.b.sales[sale.id]?.durysAtidarytos) {
      const tikslas = kamb.slaptosDurys.kambarys;
      this.eiti(X.slaptos, () => this.ieiti(E.eitiIKambari(this.b, sale.id, tikslas), X.iejimas));
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
      groti('klaida');
      this.zinute = ZIEZIRBA.durysUzdarytos;
      this.render();
      return;
    }
    groti('burtas');
    this.zinute = ZIEZIRBA.durysAtidarytos;
    this.atidarytiDuris();
  }

  rytojTesiam(tesiam: boolean): void {
    this.langai.shift();
    if (!tesiam) this.ekranas = 'pradzia';
    this.render();
  }

  // ---------------------------------------------------------------- garsas ir ekranas

  perjungtiGarsa(): void {
    const b = this.busena;
    const naujas = !(b?.nustatymai.garsas ?? true);
    nustatytiGarsa(naujas);
    if (b) this.busena = { ...b, nustatymai: { ...b.nustatymai, garsas: naujas } };
    this.saugoti();
    if (naujas) setTimeout(() => groti('teisinga'), 50);
    this.render();
  }

  perjungtiVisaEkrana(): void {
    perjungtiVisaEkrana();
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
      groti('klaida');
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
    groti('teisinga');
    if (tipai.has('serija')) groti('serija');
    setTimeout(() => groti(nugaletas ? 'pukst' : 'raides'), 350);
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

  /** Po kovos: priešas išnyko, durys atsidaro, herojus eina toliau. Jei tai lobio sargas – atidaroma skrynia. */
  private atvykusPoKovos(): void {
    const v = this.b.vieta;
    if (v.kur !== 'sale') return;
    this.herojusX = X.priesObjekta;
    const veiksmas = E.kambarioVeiksmas(this.b, this.t);
    if (veiksmas.tipas === 'lobis') {
      this.atidarytiLobi();
      return;
    }
    this.zinute = ZIEZIRBA.durysAtsidaro;
    groti('durys');
    this.autoPirmyn();
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
    groti('burtas');
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

