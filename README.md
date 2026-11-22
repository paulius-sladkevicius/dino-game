# Dino ekspedicija

Naršyklinis skaitymo žaidimas 6–8 metų vaikui. Tai žaidimo „Dingusios raidės“ atšaka su ta
pačia logika, bet su dinozaurų tema ir 6 lygiais.

Laiko mašina nukelia vaiką į dinozaurų laikus. Ugnikalnis Burbulas išspjovė stebuklingų
pelenų debesį: dinozaurai pamiršo žodžius, susipainiojo ir ėmė pykti. Vaikas perskaito
tekstą, pasirenka atsakymą, ir dinozauras prisimena žodį, nurimsta ir draugiškai nueina,
o žodis grįžta į Ekspedicijos dienoraštį. Jokio smurto – dinozaurai tik nuraminami.

- **6 lygiai:** Paparčių slėnis, Pelkių takas, Ežerų kraštas, Kalnų tarpeklis, Ugnikalnio
  papėdė ir finalas Ugnikalnio viršūnėje. Kiekviename lygyje 3 vietovės ir didysis dinozauras,
  iš viso 210 užduočių.
- **Sunkumas auga:** nuo 1–3 sakinių („kas, kur, kiek“) iki 4–6 sakinių istorijų, kur reikia
  suprasti jausmus, ketinimus ir priežastis. Teisingas atsakymas niekada nekartoja teksto
  žodžių – jį reikia suprasti, o ne surasti.
- **Palydovas Pteriukas** – mažas pterozauriukas. Pelenai nudažė jį pilkai, ir kiekvienas
  grąžintas dienoraščio puslapis grąžina jam spalvas. Stovyklose laukia vėžlys Kiautas.
- Vaizdas iš šono, ėjimas mygtukais „◀“ ir „Eiti ▶“, garso efektai (išjungiami), visas
  ekranas, veikia be interneto (PWA). Progresas saugomas naršyklėje.

## Kaip paleisti

Reikia [Node.js](https://nodejs.org) 20 ar naujesnės versijos.

```bash
npm install
npm run dev        # kūrimo serveris: http://localhost:5173
```

Norint išbandyti telefone tame pačiame Wi‑Fi tinkle: `npm run dev -- --host` ir
telefone atsidaryti rodomą `http://192.168.x.x:5173` adresą.

### Paruošti talpinimui

```bash
npm run build      # tipų patikra ir statiniai failai į dist/
npm run preview    # peržiūrėti dist/ adresu http://localhost:4173
```

`dist/` aplanką galima įkelti į bet kurį statinių failų talpinimą (GitHub Pages,
Netlify, savo serverį). Keliai santykiniai, todėl tinka ir poaplankis.
Service worker (darbui be interneto) veikia tik per HTTPS arba `localhost`.

### GitHub Pages

Kiekvienas įkėlimas į `main` šaką automatiškai sukuria ir paskelbia žaidimą
(`.github/workflows/pages.yml`). Žaidimo adresas:
**https://paulius-sladkevicius.github.io/dino-game/**

Vieną kartą reikia įjungti: repozitorijos **Settings → Pages → Build and deployment →
Source: GitHub Actions**. Tada **Actions** skiltyje paleiskite „GitHub Pages“ iš naujo
(arba įkelkite naują pakeitimą į `main`).

Telefone atsidarius adresą, naršyklės meniu „Pridėti prie pagrindinio ekrano“ įdiegia
žaidimą kaip programėlę. Ji veikia ir be interneto.

### Testai

```bash
npm test           # žaidimo logikos ir turinio testai (Vitest)
npm run e2e        # sukuria dist/ ir paleidžia naršyklės testus (Playwright)
```

Naršyklės testai suvaidina visą skyrių keturiuose įrenginiuose (Pixel 7, iPhone 13,
iPhone SE, iPad): nuo vardo įvedimo iki 1 lygio didžiojo dinozauro, o telefone – ir visus 6 lygius. Testas nepraeina,
jei naršyklės konsolėje yra klaidų ar įspėjimų, jei ekranas slenka į šoną arba jei
kuris nors mygtukas mažesnis nei 64 px. Taip pat tikrinama klaida ir užuomina,
pralaimėjimas, tėvų skydelis ir darbas be interneto.
Jei Playwright neranda naršyklės, nurodykite ją: `PW_CHROMIUM=/kelias/iki/chromium npm run e2e`.

## Kaip žaisti

1. Pradžios ekrane vaikas įrašo savo vardą. Vardas įrašomas į tekstus („Ką randa Ugnė?“),
   o Pteriukas kreipiasi šauksmininku („Puiku, Ugne!“).
2. Trumpa istorija paaiškina, kas nutiko dinozaurams, kas yra Pteriukas ir vėžlys Kiautas.
3. Lygių žemėlapyje vietovės atsirakina paeiliui, o nuraminus didįjį dinozaurą atsirakina
   kitas lygis (lygio mygtukai 1–6 viršuje). Kiekviena vietovė prasideda stovykloje prie laužo.
4. Vietovė rodoma **iš šono**: herojus stovi slėnyje, priekyje – dinozauras, skrynia ar perėja.
   Vaikas pats valdo ėjimą mygtukais **„Eiti ▶“** ir **„◀“** (kompiuteryje – rodyklių
   klavišais). Priėjus prie dinozauro reikia skaityti. Nuramintas dinozauras dingsta, perėja
   atsidaro, ir herojus pats pereina į kitą vietą.
5. Sankryžoje reikia perskaityti ženklą ir pasirinkti kelią – herojus nueina prie
   pasirinktų durų. Ten pat yra slaptos durys su mįsle. Žemėlapis (mygtukas su kelio
   ženklu) rodo, kur esi ir kur jau buvai, bet vaikštoma ne per jį.
6. Po trijų vietovių laukia didysis dinozauras. Jį nuraminus, į dienoraštį grįžta puslapis,
   kurį galima perskaityti, ir atsirakina kitas lygis.
7. Ilgi 4–6 lygio tekstai telefone rodomi dalimis (mygtukai „◀ 1 / 2 ▶“), kad nereikėtų slinkti.

**Garsai.** Žingsniai, durys, teisingas atsakymas, klaida, išnykstantis priešas, skrendančios
raidės, lobis, daiktas, burtai, salės pabaiga. Garsai sintezuojami naršyklėje (Web Audio),
todėl veikia ir be interneto. Juos galima išjungti garsiakalbio mygtuku arba tėvų skydelyje,
o pasirinkimas išsaugomas. Žaidimas niekada neperskaito teksto balsu – skaito vaikas.

**Visas ekranas.** Mygtukas su keturiais kampais įjungia viso ekrano režimą (Android,
planšetės, kompiuteris). „iPhone“ Safari šios galimybės neturi – ten žaidimą reikia pridėti
prie pagrindinio ekrano („Bendrinti → Pridėti prie pradžios ekrano“), tada jis atsidaro per
visą ekraną.

## Taisyklės ir skaičiai

Visi skaičiai surašyti vienoje vietoje: [`src/game/rules.ts`](src/game/rules.ts). Testas
[`tests/rules.test.ts`](tests/rules.test.ts) tikrina, kad jie sutampa su scenarijumi.

| Įvykis | Širdelės | Gintaras (mana) |
|---|---|---|
| Pradžia | 5 (daugiausia 5, su šarvais iki 8) | 3 (daugiausia 10, su batais iki 15) |
| Teisingai iš pirmo karto | +1 | +1 |
| Teisingai po klaidos | 0 | 0 |
| Klaida | −1 | 0 |
| 3 teisingi iš eilės (serija) | 0 | +2 papildomai |
| Bosas nugalėtas | visos atsistato | +3 |
| Lobis šoniniame kelyje | +1 arba +2 | +3 |

- **Dinozaurų „gyvybės“** (kiek tekstų reikia perskaityti): mažas dinozauras 1, didelis 2,
  didysis (lygio bosas) 5.
  Boso tekstai eina iš eilės ir vis sunkėja.
- **Po klaidos** neteisingas atsakymas dingsta, o mygtukai 2 sekundėms užsirakina.
  Tuo metu Pteriukas paryškina užuominos žodį. Po 2 klaidų lieka du atsakymai ir
  paryškinamas visas sakinys su atsakymu.
- **Pralaimėjimas:** kai širdelės baigiasi, Pteriukas nuneša herojų į paskutinę stovyklą.
  Žodžiai ir gintaras lieka, širdelės atsistato iki 5, o dinozauras vėl užkerėtas.
- **Gudrybės** (burtai), kas lygį – po naują, jas išmoko vėžlys Kiautas:
  1 lygis – **Lupa** (1 gintaras, paryškina svarbiausią žodį) ir **Uogos** (3 gintarai, +2 širdelės);
  2 – **Skiemenys** (1, paliesk žodį – jis suskyla į skiemenis); 3 – **Skydas** (2, kita klaida
  neatima širdelės); 4 – **Perskilimas** (3, išnyksta du neteisingi atsakymai); 5 – **Riaumojimas**
  (5, tik prieš didįjį dinozaurą: perskaityk tekstą garsiai tėvams, jie patvirtina – dvigubas smūgis).
  Tai scenarijaus burtai Švieselė, Gydymas, Skiemenys, Skydas, Perskilimas ir Ugnies žodis.
- **Įranga:** plaktukas (scenarijaus kardas), šalmas, liemenė (šarvai) ir batai turi po 6 lygius (nuo medinio iki deimantinio)
  pagal scenarijaus lentelę. Daiktą gali palikti mažas dinozauras (1 iš 10), vidutinis priešas
  (1 iš 4) arba lobis (1 iš 2). Jei visi priešo tekstai atsakyti iš pirmo karto, tikimybė
  dviguba. Bosas daiktą palieka visada. Daiktas būna skyriaus lygio, o 1 kartą iš 10 –
  vienu lygiu aukštesnis. Kortelėje „Imu / Palieku“ abu pasirinkimai duoda 2 gintaro lašus.
- **Sankryža ir keliai:** lobio kelyje 2 priešai ir lobis, trumpame kelyje 1 priešas.
  Slaptos durys atsidaro įminus mįslę. Klaida ten širdelės neatima, o viduje laukia
  Kiauto dovana (kosmetinis atlygis: Pteriuko kepurė, raudona skara, mėlyna laužo ugnis; kai
  jie jau turimi – 3 gintaro lašai). Žemėlapyje aplankyti kambariai nuspalvinami. Į praleistą kelią galima grįžti, taip pat ir
  įveiktą salę pasirinkus skyriaus žemėlapyje.
- **Ekspedicijos dienoraštis:** kiekvienas nuramintas dinozauras grąžina žodį, didysis – puslapį su
  trumpa istorija.
- **Pabėgę žodžiai:** jei vaikas suklydo, užduotis vėliau grįžta kaip „Pabėgęs žodis“.
  Pirmą kartą ji grįžta po 2 susitikimų. Atsakius iš pirmo karto, grįžta dar kartą po 4.
  Antrą kartą atsakius iš pirmo karto, žodis sugautas. Vėl suklydus, skaičiavimas
  prasideda iš naujo.

Kai kurių dalykų scenarijus nenurodo tiksliai, todėl jie nuspręsti taip:

- **Žvaigždutės už salę:** 0 klaidų – 3, 1–2 klaidos – 2, daugiau – 1.
- **„Naujo lygio“ daiktas iš boso:** skyriaus lygio daiktas (1 skyriuje – varinis) tai
  vietai, kurioje herojus dar turi žemesnio lygio daiktą.
- **Šalmo skaičiavimas:** klaidos skaičiuojamos nuo įėjimo į salę (arba į kovą su bosu)
  nuo laužo.
- **Šrifto dydis:** užduoties tekstas, klausimas, ženklai, mįslės ir Knygos puslapis rodomi
  32 px šriftu (planšetėje 36 px, labai siauruose, iki 360 px, ekranuose 28 px).
  Atsakymai prisitaiko prie ekrano pločio (22–32 px), kad tilptų 2 × 2 tinklelyje.
  Pteriuko replikos ir sąsajos užrašai mažesni.
- **1 skyriaus sunkumas:** pagal tėvų pageidavimą tekstai ilgesni nei scenarijuje
  (1–3 sakiniai, 8–22 žodžiai vietoj 1 sakinio, 3–5 žodžių). Teisingas atsakymas
  nekartoja teksto žodžių.

Nedaroma: pradinis 5 užduočių patikrinimas ir pasiūlymas eiti sunkesniu keliu.

## Tėvų skydelis

Pradžios ekrane mygtukas „Tėvams“ atsidaro tik atsakius į suaugusiojo klausimą
(daugybą). Skydelyje matyti:

- pažanga: pasiektas skyrius, žaidimo laikas, teisingi atsakymai ir klaidos, klaidingi
  žodžiai su tekstais;
- vaiko vardas ir kreipinys (šauksmininką galima pataisyti);
- savi žodžiai tekstams: šeimos narys, draugas, augintinis;
- jungikliai: ilgų žodžių spalvinimas skiemenimis (va-ri-nis) ir DIDŽIOSIOS raidės;
- progreso ištrynimas (reikia patvirtinti du kartus).

## Kaip pridėti naujų užduočių

Kiekvieno lygio užduotys saugomos JSON faile `src/content/skyrius-N/uzduotys.json` (N = 1–6),
tokiu pačiu formatu kaip scenarijuje:

```json
{
  "id": "s1-k31",
  "skyrius": 1,
  "tipas": "kova",
  "tekstas": "Ant akmens sėdi žalia varlė.",
  "klausimas": "Kur sėdi varlė?",
  "atsakymai": [
    { "tekstas": "ant akmens", "teisingas": true },
    { "tekstas": "ant lapo", "teisingas": false },
    { "tekstas": "vandenyje", "teisingas": false },
    { "tekstas": "ant medžio", "teisingas": false }
  ],
  "uzuomina": "akmens",
  "zodis": "akmuo"
}
```

| Laukas | Reikšmė |
|---|---|
| `id` | `s<skyrius>-<raidė><nr>`, raidė pagal tipą: `k` kova, `b` bosas, `z` sankryžos ženklas, `d` slaptos durys |
| `tipas` | `kova`, `bosas`, `sankryza` arba `durys` |
| `tekstas` | ką vaikas skaito. Ilgis pagal lygį: 1 – 8–22 žodžiai, 2 – 12–28, 3 – 15–35, 4 – 20–40, 5 – 25–50, 6 – 30–60 |
| `klausimas` | klausimas apie tekstą (duryse gali būti tuščias, jei klausimas yra mįslėje) |
| `atsakymai` | lygiai 4, vienas su `"teisingas": true`. Atsakymų tvarka žaidime kaskart sumaišoma |
| `uzuomina` | tekste esantis žodis ar frazė, kurią paryškina Lupa ir Pteriukas po klaidos |
| `zodis` | (nebūtina) žodis vardininku, kuris grįžta į Didžiąją Knygą. Jei nėra – `uzuomina` |

Sankryžos ženklo atsakymai vietoj `teisingas` turi `kelias`: `"lobis"` arba `"trumpas"`:

```json
{ "id": "s1-z01", "skyrius": 1, "tipas": "sankryza",
  "tekstas": "Kairėje – lobis, bet jį saugo du dinozaurai. Dešinėje tik vienas.",
  "klausimas": "Kur eisi?",
  "atsakymai": [ { "tekstas": "← kairėn", "kelias": "lobis" },
                 { "tekstas": "dešinėn →", "kelias": "trumpas" } ] }
```

Tekstuose galima naudoti vietos ženklus (tik vardininko linksniu):
`[Vardas]` – vaiko vardas, `[Šeima]`, `[Draugas]`, `[Augintinis]` – tėvų skydelyje
įrašyti savi žodžiai (jei neįrašyti: Mama, Ema, Murkis).

### Žingsniai

1. Įrašykite užduotį į `uzduotys.json` su nauju, nepasikartojančiu `id`.
2. Kad užduotis pasirodytų žaidime, ji turi būti vietovės sąraše: kiekvienoje vietovėje po 8
   kovų (`sN-k01`–`k08` – 1 vietovė, `k09`–`k16` – 2, `k17`–`k24` – 3). Sąrašą
   `skyrius.json` sugeneruoja `node tools/generuoti-skyriu.mjs N`.
   Salės priešai užduotis renkasi iš šio sąrašo: pirmiausia dar nematytas, paskui
   seniausiai matytas. Boso užduotys surašytos `bosas.uzduotys` (lygiai 5, iš eilės).
   Sankryžos ženklas ir mįslė priskiriami kambariui `sankryza` (`zenklas`, `slaptosDurys.misle`).
3. Paleiskite `npm test`. Turinio testas patikrins, ar yra 4 atsakymai ir vienas
   teisingas, ar užuomina tikrai yra tekste, ar teksto ilgis atitinka skyrių ir ar
   teisingas atsakymas nėra vienintelis ilgiausias. Jei kas nors negerai, testas
   parodys užduoties `id` ir priežastį. Testas taip pat neleidžia, kad teisingas atsakymas
   kartotų teksto žodį: joks 4+ raidžių atsakymo žodis negali turėti tos pačios pradžios
   (pirmų 4 raidžių) kaip kuris nors teksto žodis.

Kaip rašyti gerą užduotį (1 skyrius pasunkintas):

- **Atsakymą reikia suprasti, o ne surasti.** Klausiama apie priežastį, jausmą, laiką,
  kiekį ar sinonimą. Pavyzdžiui, tekste „žibintas“, o teisingas atsakymas „lempa“; tekste
  „dreba ir neišlenda“, o atsakymas „bijo“.
- **Klaidingi atsakymai gundo.** Bent vienas klaidingas atsakymas paimtas iš teksto (pvz.,
  „iš lubų“, kai klausiama, iš ko atsirado bala), kad neužtektų ieškoti to paties žodžio.
- **`uzuomina`** rodo įkaltį tekste („lašai“, „dreba“), o ne patį atsakymą.
- **Atsakymai panašaus ilgio**, kad teisingo nebūtų galima atspėti iš pirmos raidės ar
  ilgio. Teisingas atsakymas negali būti vienintelis ilgiausias.
- Atsakymai trumpi (1–2 žodžiai), kad tilptų 2 × 2 tinklelyje telefone.

### Naujas lygis arba lygio vietovių pakeitimas

1. Lygio aplanke `src/content/skyrius-N/` yra `tema.json` (lygio pavadinimas, dinozaurai,
   vietovių pavadinimai, dienoraščio puslapis) ir `uzduotys.json`.
2. `node tools/generuoti-skyriu.mjs N` iš `tema.json` sukuria `skyrius.json` (vietovių planą:
   kambariai, kryžkelės, slapti urvai, kurie priešai kur). Lygiai įkeliami automatiškai.
3. Naujam lygiui pridėkite teksto ribas `TEKSTO_RIBOS` faile `src/content/index.ts`.
4. Išsamus užduočių rašymo aprašas (tema, sunkumas, taisyklės) – `tools/TURINIO-UZDUOTIS.md`.
5. `npm test` – turinio testas patikrins visus lygius.

Dinozaurų piešiniai (`kompsognatas`, `stegozauras`, `triceratopsas`, `pterodaktilis`,
`brachiozauras`, `ankilozauras`, `tiranozauras`) – `src/ui/art.ts`, teminiai pavadinimai –
`src/ui/tema.ts` ir `src/ui/tekstai.ts`.

## Projekto sandara

```
src/
  content/            užduotys (JSON), skyriaus planas, turinio patikra
  game/               žaidimo logika be naršyklės: taisyklės, kova, įranga,
                      kartojimas, tekstai (skiemenys, šauksmininkas), saugojimas
  ui/                 ekranai, piešiniai (SVG), stiliai
tests/                Vitest: taisyklės, variklis, įranga, tekstas, turinys, saugykla
e2e/                  Playwright: visas skyrius telefone ir planšetėje
public/ikonos/        PWA ikonos
```

Žaidimo logika (`src/game`) – grynos funkcijos: iš senos būsenos ir veiksmo grąžina
naują būseną. Todėl ją lengva testuoti, o sąsaja (`src/ui`) tik piešia būseną ir
perduoda vaiko veiksmus.

## Licencija

MIT – žr. [LICENSE](LICENSE). Šriftai Andika ir Caveat – SIL Open Font License.
