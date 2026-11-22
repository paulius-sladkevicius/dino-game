# Dingusios raidės

Naršyklinis skaitymo žaidimas pirmokui. Rašalo Ragana išliejo rašalą ant Didžiosios
Knygos, žodžiai pabėgo į požemį ir virto Dėmėmis. Vaikas perskaito trumpą tekstą,
pasirenka vieną iš 4 atsakymų, ir Dėmė vėl virsta žodžiu.

Žaidimas sukurtas pagal scenarijų „Dingusios raidės — skaitymo žaidimo scenarijus“.
Grafika – „Rašalas ant popieriaus“ pagal eskizą „Knyga“.

- **1 versija:** pilnai žaidžiamas 1 skyrius „Drėgnas urvas“ – 3 salės ir bosas
  Didžioji Dėmė, 41 užduotis.
- Statinis puslapis, serverio nereikia (TypeScript + Vite). Progresas saugomas
  naršyklės `localStorage`.
- Pritaikytas telefonui ir planšetei vertikalioje padėtyje. Visi mygtukai bent 64 px.
  Tai PWA: žaidimą galima pridėti prie pagrindinio ekrano, ir jis veikia be interneto.
- Šriftai Andika (tekstams) ir Caveat (antraštėms) įdėti į patį žaidimą, todėl veikia
  ir be interneto.

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
**https://paulius-sladkevicius.github.io/lost-letters-game/**

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
iPhone SE, iPad): nuo vardo įvedimo iki Didžiosios Dėmės nugalėjimo. Testas nepraeina,
jei naršyklės konsolėje yra klaidų ar įspėjimų, jei ekranas slenka į šoną arba jei
kuris nors mygtukas mažesnis nei 64 px. Taip pat tikrinama klaida ir užuomina,
pralaimėjimas, tėvų skydelis ir darbas be interneto.
Jei Playwright neranda naršyklės, nurodykite ją: `PW_CHROMIUM=/kelias/iki/chromium npm run e2e`.

## Kaip žaisti

1. Pradžios ekrane vaikas įrašo savo vardą. Vardas įrašomas į tekstus („Ką randa Ugnė?“),
   o Žiežirba kreipiasi šauksmininku („Puiku, Ugne!“).
2. Trumpa istorija paaiškina, kas yra Dėmės, kaukai, laužai ir lobiai.
3. Skyriaus žemėlapyje salės atsirakina paeiliui. Kiekviena salė prasideda prie laužo.
4. Salės žemėlapyje vaikas liečia kambarį, į kurį nori eiti. Sankryžoje reikia perskaityti
   ženklą ir pasirinkti kelią. Ten taip pat yra slaptos durys su mįsle.
5. Po trijų salių laukia laužas prieš bosą ir Didžioji Dėmė. Ją nugalėjus, į Knygą grįžta
   puslapis, kurį galima perskaityti.

## Taisyklės ir skaičiai

Visi skaičiai surašyti vienoje vietoje: [`src/game/rules.ts`](src/game/rules.ts). Testas
[`tests/rules.test.ts`](tests/rules.test.ts) tikrina, kad jie sutampa su scenarijumi.

| Įvykis | Širdelės | Mana |
|---|---|---|
| Pradžia | 5 (daugiausia 5, su šarvais iki 8) | 3 (daugiausia 10, su batais iki 15) |
| Teisingai iš pirmo karto | +1 | +1 |
| Teisingai po klaidos | 0 | 0 |
| Klaida | −1 | 0 |
| 3 teisingi iš eilės (serija) | 0 | +2 papildomai |
| Bosas nugalėtas | visos atsistato | +3 |
| Lobis šoniniame kelyje | +1 arba +2 | +3 |

- **Priešų gyvybės:** Rašalo lašelis (maža Dėmė) 1 tekstas, Rašalo dėmė 2, bosas 5.
  Boso tekstai eina iš eilės ir vis sunkėja.
- **Po klaidos** neteisingas atsakymas dingsta, o mygtukai 2 sekundėms užsirakina.
  Tuo metu Žiežirba paryškina užuominos žodį. Po 2 klaidų lieka du atsakymai ir
  paryškinamas visas sakinys su atsakymu.
- **Pralaimėjimas:** kai širdelės baigiasi, Žiežirba nuneša herojų prie paskutinio laužo.
  Žodžiai ir mana lieka, širdelės atsistato iki 5, o priešas atgauna gyvybes.
- **Burtai** (1 skyriuje tik šie du): Švieselė (1 mana) paryškina svarbiausią žodį.
  Gydymas (3 manos) grąžina 2 širdeles.
- **Įranga:** kardas, šalmas, šarvai ir batai turi po 6 lygius (nuo medinio iki deimantinio)
  pagal scenarijaus lentelę. Daiktą gali palikti maža Dėmė (1 iš 10), vidutinis priešas
  (1 iš 4) arba lobis (1 iš 2). Jei visi priešo tekstai atsakyti iš pirmo karto, tikimybė
  dviguba. Bosas daiktą palieka visada. Daiktas būna skyriaus lygio, o 1 kartą iš 10 –
  vienu lygiu aukštesnis. Kortelėje „Imu / Palieku“ abu pasirinkimai duoda 2 manas.
- **Sankryža ir keliai:** lobio kelyje 2 priešai ir lobis, trumpame kelyje 1 priešas.
  Slaptos durys atsidaro įminus mįslę. Klaida ten širdelės neatima, o viduje laukia
  kaukų dovana (kosmetinis atlygis: Žiežirbos kepurė, herojaus apsiaustas, mėlyna laužo
  ugnis). Aplankyti kambariai nuspalvinami. Į praleistą kelią galima grįžti, taip pat ir
  įveiktą salę pasirinkus skyriaus žemėlapyje.
- **Didžioji Knyga:** kiekvienas nugalėtas priešas grąžina žodį, bosas – puslapį su
  trumpa istorija.
- **Pabėgę žodžiai:** jei vaikas suklydo, užduotis vėliau grįžta kaip „Pabėgusi Dėmė“.
  Pirmą kartą ji grįžta po 2 susitikimų. Atsakius iš pirmo karto, grįžta dar kartą po 4.
  Antrą kartą atsakius iš pirmo karto, žodis sugautas. Vėl suklydus, skaičiavimas
  prasideda iš naujo.

Kai kurių dalykų scenarijus nenurodo tiksliai, todėl jie nuspręsti taip:

- **Žvaigždutės už salę:** 0 klaidų – 3, 1–2 klaidos – 2, daugiau – 1.
- **„Naujo lygio“ daiktas iš boso:** skyriaus lygio daiktas (1 skyriuje – varinis) tai
  vietai, kurioje herojus dar turi žemesnio lygio daiktą.
- **Šalmo skaičiavimas:** klaidos skaičiuojamos nuo įėjimo į salę (arba į kovą su bosu)
  nuo laužo.
- **Šrifto dydis:** užduoties tekstas, klausimas, atsakymai, ženklai, mįslės ir Knygos
  puslapis rodomi ne mažesniu nei 32 px šriftu (planšetėje 36 px). Žiežirbos repliką
  ir sąsajos užrašai mažesni.

Nedaroma 1 versijoje (reikės, kai bus daugiau skyrių): pradinis 5 užduočių patikrinimas,
Žiežirbos pasiūlymas eiti sunkesniu keliu ir kitų skyrių burtai (Skiemenys, Skydas,
Perskilimas, Ugnies žodis).

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

Užduotys saugomos JSON faile [`src/content/skyrius-1/uzduotys.json`](src/content/skyrius-1/uzduotys.json),
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
| `tekstas` | ką vaikas skaito. 1 skyriuje kovai ir bosui – 1 sakinys, 3–5 žodžiai |
| `klausimas` | klausimas apie tekstą (duryse gali būti tuščias, jei klausimas yra mįslėje) |
| `atsakymai` | lygiai 4, vienas su `"teisingas": true`. Atsakymų tvarka žaidime kaskart sumaišoma |
| `uzuomina` | tekste esantis žodis ar frazė, kurią paryškina Švieselė ir Žiežirba po klaidos |
| `zodis` | (nebūtina) žodis vardininku, kuris grįžta į Didžiąją Knygą. Jei nėra – `uzuomina` |

Sankryžos ženklo atsakymai vietoj `teisingas` turi `kelias`: `"lobis"` arba `"trumpas"`:

```json
{ "id": "s1-z01", "skyrius": 1, "tipas": "sankryza",
  "tekstas": "Kairėje lobis ir dvi Dėmės. Dešinėje tik viena Dėmė.",
  "klausimas": "Kur eisi?",
  "atsakymai": [ { "tekstas": "← kairėn", "kelias": "lobis" },
                 { "tekstas": "dešinėn →", "kelias": "trumpas" } ] }
```

Tekstuose galima naudoti vietos ženklus (tik vardininko linksniu):
`[Vardas]` – vaiko vardas, `[Šeima]`, `[Draugas]`, `[Augintinis]` – tėvų skydelyje
įrašyti savi žodžiai (jei neįrašyti: Mama, Ema, Murkis).

### Žingsniai

1. Įrašykite užduotį į `uzduotys.json` su nauju, nepasikartojančiu `id`.
2. Kad užduotis pasirodytų žaidime, pridėkite jos `id` į salės sąrašą `uzduotys` faile
   [`src/content/skyrius-1/skyrius.json`](src/content/skyrius-1/skyrius.json).
   Salės priešai užduotis renkasi iš šio sąrašo: pirmiausia dar nematytas, paskui
   seniausiai matytas. Boso užduotys surašytos `bosas.uzduotys` (lygiai 5, iš eilės).
   Sankryžos ženklas ir mįslė priskiriami kambariui `sankryza` (`zenklas`, `slaptosDurys.misle`).
3. Paleiskite `npm test`. Turinio testas patikrins, ar yra 4 atsakymai ir vienas
   teisingas, ar užuomina tikrai yra tekste, ar teksto ilgis atitinka skyrių ir ar
   teisingas atsakymas nėra vienintelis ilgiausias. Jei kas nors negerai, testas
   parodys užduoties `id` ir priežastį.

Geros užduoties taisyklės iš scenarijaus: klaidingi atsakymai skiriasi viena detale,
kurią galima sužinoti tik iš teksto. Kai įmanoma, vienas atsakymas skiriasi viena raide
(šaka – šakė). Atsakymai panašaus ilgio, kad atsakymo nebūtų galima atspėti iš pirmos
raidės ar ilgio.

### Naujas skyrius

1. Sukurkite aplanką `src/content/skyrius-2/` su `uzduotys.json` ir `skyrius.json`.
   Patogiausia nukopijuoti 1 skyriaus failus kaip pavyzdį. Salėje turi būti 6–8 kambariai.
2. Užregistruokite juos [`src/content/index.ts`](src/content/index.ts) (`TURINYS`) ir,
   jei reikia, pridėkite teksto ribas `TEKSTO_RIBOS`.
3. Žaidimo eiga dabar vienam skyriui (`DABARTINIS_SKYRIUS` faile `src/game/engine.ts`).
   Perėjimas tarp skyrių – kito etapo darbas.

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
