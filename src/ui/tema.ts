// Žaidimo tema „Dino ekspedicija“: visi teminiai pavadinimai vienoje vietoje.

import type { Turinys } from '../content';
import { saleSkyrius, type KovosRusis } from '../game/engine';
import type { Burtas } from '../game/rules';
import type { DinoPiesinys } from '../game/types';

export const TEMA = {
  zaidimas: 'Dino ekspedicija',
  mana: 'Gintaras',
  knyga: 'Dienoraštis',
  knygaPilnas: 'Ekspedicijos dienoraštis',
  sale: 'vietovė',
  saleDidziaja: 'Vietovė',
  lauzas: 'Stovykla',
  bosoLauzas: 'Stovykla prieš didįjį dinozaurą',
  lygis: 'lygis',
  palydovas: 'Pteriukas',
};

/** Burtų (gudrybių) pavadinimai ir aprašai žaidime. */
export const BURTU_VARDAI: Record<Burtas, { vardas: string; aprasas: string }> = {
  sviesele: { vardas: 'Lupa', aprasas: 'Padidina svarbiausią teksto žodį.' },
  gydymas: { vardas: 'Uogos', aprasas: 'Suvalgai uogų – grįžta dvi širdelės.' },
  skiemenys: { vardas: 'Skiemenys', aprasas: 'Paliesk vieną žodį – jis suskyla į spalvotus skiemenis.' },
  skydas: { vardas: 'Skydas', aprasas: 'Kita klaida neatims širdelės.' },
  perskilimas: { vardas: 'Perskilimas', aprasas: 'Išnyksta du neteisingi atsakymai.' },
  ugnies: { vardas: 'Riaumojimas', aprasas: 'Perskaityk tekstą garsiai tėvams – dvigubas smūgis didžiajam dinozaurui.' },
};

/** Koks dinozauras piešiamas: pagal salės (arba dabartinį) lygį ir priešo dydį. */
export function priesoPiesinys(t: Turinys, skyrius: number, saleId: string | null, rusis: KovosRusis): DinoPiesinys {
  const n = saleId ? saleSkyrius(t, saleId) : skyrius;
  const sk = t.skyriai.find((x) => x.numeris === n) ?? t.skyriai[0];
  if (rusis === 'bosas') return sk.bosas.piesinys;
  if (rusis === 'pabeges') return 'kompsognatas';
  return sk.priesai[rusis].piesinys;
}
