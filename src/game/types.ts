// Bendri žaidimo tipai. Užduočių formatas atitinka scenarijaus JSON pavyzdį
// (laukai lietuviškai: tekstas, klausimas, atsakymai, uzuomina).

export type UzduotiesTipas = 'kova' | 'bosas' | 'sankryza' | 'durys';

export interface Atsakymas {
  tekstas: string;
  /** kova, bosas, durys: lygiai vienas atsakymas teisingas. */
  teisingas?: boolean;
  /** sankryza: į kurį kelią veda šis pasirinkimas. */
  kelias?: KelioTipas;
}

export interface Uzduotis {
  id: string;
  skyrius: number;
  tipas: UzduotiesTipas;
  tekstas: string;
  klausimas: string;
  atsakymai: Atsakymas[];
  /** Svarbiausias teksto žodis – jį paryškina Švieselė ir Žiežirba po klaidos. */
  uzuomina?: string;
  /** Žodis (vardininku), kuris grįžta į Didžiąją Knygą. Jei nėra – naudojama uzuomina. */
  zodis?: string;
}

export type KelioTipas = 'lobis' | 'trumpas';

export type PriesoDydis = 'mazas' | 'vidutinis' | 'bosas';

export type KambarioTipas =
  | 'lauzas'
  | 'priesas'
  | 'sankryza'
  | 'lobis'
  | 'slaptas'
  | 'galas';

export interface Kambarys {
  id: string;
  tipas: KambarioTipas;
  pavadinimas: string;
  /** Kaimyniniai kambariai (judėti galima tik į juos). */
  kaimynai: string[];
  /** Priešų kambariams. */
  priesas?: PriesoDydis;
  /** Lobio kambarys gali turėti sargą – priešą, kurį reikia įveikti pirma. */
  sargas?: PriesoDydis;
  /** sankryza: ženklo užduoties id ir kur veda kiekvienas kelias. */
  zenklas?: string;
  keliai?: Partial<Record<KelioTipas, string>>;
  /** sankryza: slaptų durų kambario id ir mįslės užduoties id. */
  slaptosDurys?: { kambarys: string; misle: string };
  /** slaptas: kaukų dovana (kosmetinis atlygis). */
  dovana?: Kosmetika;
  /** Vieta žemėlapyje (0–100 procentais). */
  x: number;
  y: number;
}

export interface Sale {
  id: string;
  pavadinimas: string;
  /** Užduočių, iš kurių renkasi šios salės priešai, id. */
  uzduotys: string[];
  kambariai: Kambarys[];
  pradzia: string;
}

/** Dinozauro piešinys (žr. src/ui/art.ts). */
export type DinoPiesinys =
  | 'kompsognatas'
  | 'stegozauras'
  | 'triceratopsas'
  | 'pterodaktilis'
  | 'brachiozauras'
  | 'ankilozauras'
  | 'tiranozauras';

export interface Skyrius {
  numeris: number;
  pavadinimas: string;
  priesai: { mazas: { vardas: string; piesinys: DinoPiesinys }; vidutinis: { vardas: string; piesinys: DinoPiesinys } };
  bosas: { vardas: string; piesinys: DinoPiesinys; uzduotys: string[] };
  sales: Sale[];
  puslapis: { pavadinimas: string; tekstas: string };
}

export type Daiktas = 'kardas' | 'salmas' | 'sarvai' | 'batai';
export type Lygis = 0 | 1 | 2 | 3 | 4 | 5;
export type Kosmetika = 'kepure' | 'apsiaustas' | 'lauzoSpalva';

export interface Iranga {
  kardas: Lygis;
  salmas: Lygis;
  sarvai: Lygis;
  batai: Lygis;
}

export interface PabegesZodis {
  uzduotis: string;
  dezute: 1 | 2;
  /** Kelintą susitikimą (encounterCount) žodis vėl pasirodys. */
  kada: number;
}

export interface SalesBusena {
  aplankyti: string[];
  iveikti: string[];
  durysAtidarytos: boolean;
  lobisPaimtas: boolean;
  /** Slapto urvo dovana jau paimta. */
  dovanaPaimta: boolean;
  baigta: boolean;
  zvaigzdutes: 0 | 1 | 2 | 3;
  /** Šio ėjimo per salę duomenys. */
  ejimas: { aktyvus: boolean; klaidos: number };
}

export interface UzduotiesStatistika {
  rodyta: number;
  klaidos: number;
  paskutinis: number;
}

export interface Nustatymai {
  skiemenys: boolean;
  didziosios: boolean;
  /** Garso efektai (galima išjungti). */
  garsas: boolean;
  savi: { seimosNarys: string; draugas: string; augintinis: string };
}

export type Vieta =
  | { kur: 'skyrius' }
  | { kur: 'lauzas'; sale: string }
  | { kur: 'sale'; sale: string; kambarys: string }
  | { kur: 'bosoLauzas' };

export interface Busena {
  versija: 1;
  /** Dabartinis lygis (skyrius), 1–6. */
  skyrius: number;
  vardas: string;
  kreipinys: string;
  sirdeles: number;
  mana: number;
  serija: number;
  /** Kiek klaidų šioje salėje jau „sugėrė“ šalmas. */
  salmoPanaudota: number;
  iranga: Iranga;
  vieta: Vieta;
  paskutinisLauzas: { kur: 'lauzas'; sale: string } | { kur: 'bosoLauzas' };
  sales: Record<string, SalesBusena>;
  puslapiai: number[];
  zodziai: string[];
  pabege: PabegesZodis[];
  sugauti: number;
  susitikimai: number;
  uzduotys: Record<string, UzduotiesStatistika>;
  kosmetika: Kosmetika[];
  nustatymai: Nustatymai;
  statistika: { laikasMs: number; teisingi: number; klaidos: number };
  istorijaPerskaityta: boolean;
}
