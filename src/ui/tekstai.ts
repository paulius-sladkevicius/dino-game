// Pteriuko ir sąsajos tekstai. Vietos ženklai: [Vardas], [Kreipinys].
// Tekstai be giminės formų, kad tiktų ir berniukams, ir mergaitėms.

export const ISTORIJA = [
  'Laiko mašina sudūzgė ir nukėlė tave į dinozaurų laikus.',
  'Čia ugnikalnis Burbulas išspjovė stebuklingų pelenų debesį. Pelenai užkerėjo dinozaurus.',
  'Dinozaurai pamiršo žodžius, susipainiojo ir ėmė pykti. Žodžiai išsibarstė po slėnį.',
  'Aš – Pteriukas. Pelenai nudažė mane pilkai. Stovyklose prie laužo gyvena išmintingas vėžlys Kiautas.',
  'Padėk mums, [Kreipinys]! Perskaityk tekstą – ir dinozauras prisimins žodį ir nurims.',
];

export const ZIEZIRBA = {
  teisingai: ['Puiku, [Kreipinys]!', 'Teisingai!', 'Taip ir yra!', 'Šaunu!', 'Žodis grįžta!'],
  poKlaidos: ['Radai!', 'Teisingai! Dabar žinai.'],
  klaida1: 'Pažiūrėk į paryškintą žodį.',
  klaida2: 'Atsakymas slepiasi šiame sakinyje.',
  salmas: 'Šalmas apsaugojo širdelę!',
  skydas: 'Skydas apsaugojo širdelę!',
  serija: 'Trys iš eilės! Dar du gintaro lašai!',
  sviesele: 'Lupa rodo svarbiausią žodį.',
  gydymas: 'Skanios uogos! Dvi širdelės grįžo.',
  skiemenys: 'Paliesk sunkų žodį – jis suskils į skiemenis.',
  skydasIjungtas: 'Skydas paruoštas. Kita klaida neatims širdelės.',
  perskilimas: 'Du neteisingi atsakymai dingo!',
  ugnies: 'RRRAAAU! Kitas teisingas atsakymas – dvigubas smūgis!',
  pradzia: {
    mazas: 'Mažas dinozauras! Perskaityk tekstą.',
    vidutinis: 'Didelis dinozauras! Jam reikia dviejų tekstų.',
    bosas: 'Didysis dinozauras! Skaityk atidžiai.',
    pabeges: 'Žiūrėk! Tas žodis, kuris pabėgo!',
  },
  pralaimejimas: 'Širdelės baigėsi. Nunešiu tave į stovyklą. Žodžiai ir gintaras lieka!',
  zenklas: 'Perskaityk ženklą ir rinkis kelią.',
  priekyjeDeme: 'Priekyje – užkerėtas dinozauras! Spausk „Eiti“.',
  isejimas: 'Štai vietovės išėjimas!',
  durysAtsidaro: 'Dinozauras nurimo ir nuėjo! Kelias laisvas.',
  durysUzdarytos: 'Urvas liko uždarytas. Pabandysi kitą kartą.',
  durysAtidarytos: 'Slaptas urvas atsivėrė!',
  lauzas: ['Prie laužo šilta. Kiautas kepa bulves.', 'Pailsėk, [Kreipinys]. Toliau – nauja vietovė.'],
  bosoLauzas: 'Už šios uolos laukia didysis dinozauras.',
  saleBaigta: 'Vietovė įveikta! Rytoj tęsiam?',
  pergale: 'Puslapis grįžo į dienoraštį! Žiūrėk – man grįžo spalvos!',
  naujasLygis: 'Atrakintas naujas lygis! Kiautas išmokė naujos gudrybės.',
};

export function atsitiktine(sarasas: readonly string[]): string {
  return sarasas[Math.floor(Math.random() * sarasas.length)];
}
