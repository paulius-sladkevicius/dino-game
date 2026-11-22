// Žiežirbos ir sąsajos tekstai. Vietos ženklai: [Vardas], [Kreipinys].
// Tekstai be giminės formų, kad tiktų ir berniukams, ir mergaitėms.

export const ISTORIJA = [
  'Rašalo Ragana išliejo rašalą ant Didžiosios Knygos.',
  'Žodžiai išsigando ir pabėgo į požemį. Rašalas pavertė juos Dėmėmis.',
  'Aš – Aitvarėlis Žiežirba. Kai dingo žodis „ugnis“, mano ugnis užgeso.',
  'Požemyje gyvena kaukai. Jie saugo laužus ir lobius.',
  'Padėk man, [Kreipinys]! Perskaityk tekstą – ir Dėmė vėl taps žodžiu.',
];

export const ZIEZIRBA = {
  teisingai: ['Puiku, [Kreipinys]!', 'Teisingai!', 'Taip ir yra!', 'Šaunu!', 'Žodis grįžta!'],
  poKlaidos: ['Radai!', 'Teisingai! Dabar žinai.'],
  klaida1: 'Pažiūrėk į paryškintą žodį.',
  klaida2: 'Atsakymas yra šiame sakinyje.',
  salmas: 'Šalmas apsaugojo širdelę!',
  serija: 'Trys iš eilės! Dar dvi manos!',
  sviesele: 'Švieselė rodo svarbiausią žodį.',
  gydymas: 'Gydymas! Dvi širdelės grįžo.',
  pradzia: {
    mazas: 'Rašalo lašelis! Perskaityk tekstą.',
    vidutinis: 'Rašalo dėmė! Jai reikia dviejų tekstų.',
    bosas: 'Didžioji Dėmė! Skaityk atidžiai.',
    pabeges: 'Žiūrėk! Tas žodis, kuris pabėgo!',
  },
  pralaimejimas: 'Širdelės baigėsi. Nunešiu tave prie laužo. Žodžiai ir mana lieka!',
  zenklas: 'Perskaityk ženklą ir rinkis kelią.',
  durysUzdarytos: 'Durys liko uždarytos. Pabandysi kitą kartą.',
  durysAtidarytos: 'Durys atsivėrė!',
  lauzas: ['Prie laužo šilta. Kaukai saugo ugnį.', 'Pailsėk, [Kreipinys]. Toliau – nauja salė.'],
  bosoLauzas: 'Už šių durų laukia Didžioji Dėmė.',
  saleBaigta: 'Salė įveikta! Rytoj tęsiam?',
  pergale: 'Puslapis grįžo į Knygą! Mano ugnis vėl dega!',
};

export function atsitiktine(sarasas: readonly string[]): string {
  return sarasas[Math.floor(Math.random() * sarasas.length)];
}
