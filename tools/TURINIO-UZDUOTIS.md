# Užduotis turinio rašytojui: „Dino ekspedicija“, lygiai N

Rašai lietuvišką skaitymo užduočių turinį vaikui (7 m., pirmokas) naršykliniam žaidimui.
Žaidimo logika jau sukurta; tavo darbas – tik du failai kiekvienam tau paskirtam lygiui:

- `src/content/skyrius-N/tema.json`
- `src/content/skyrius-N/uzduotys.json`

Kitų failų NEKEISK (ypač `src/`, `tests/`, `tools/`). Dirbk aplanke `/home/user/dino-game`.

## Pasaulis (bendras visiems lygiams)

- Žaidimas „Dino ekspedicija“. Herojus – vaikas `[Vardas]`, jaunasis tyrinėtojas, laiko mašina
  atkeliavęs į dinozaurų laikus.
- Ugnikalnis Burbulas išspjovė stebuklingų pelenų debesį. Pelenai užkerėjo dinozaurus: jie pamiršo
  žodžius, susipainiojo ir ėmė pykti. Žodžiai išsibarstė po slėnį. Kai vaikas perskaito tekstą,
  dinozauras prisimena žodį, nurimsta ir draugiškai nueina, o žodis grįžta į Ekspedicijos dienoraštį.
  Kiekvienas lygis – vienas dienoraščio puslapis.
- Palydovas – **Pteriukas**, mažas skraidantis pterozauriukas (vyriška giminė: „jis“). Pelenai
  nudažė jį pilkai; kiekvienas grąžintas puslapis grąžina jam spalvas.
- Pagalbininkas – išmintingas **vėžlys Kiautas** stovyklose prie laužo: moko gudrybių, slaptuose
  urvuose palieka dovanas.
- Gintaras – vietoj manos. Įranga: plaktukas, šalmas, liemenė, batai. Gudrybės: Lupa, Uogos,
  Skiemenys, Skydas, Perskilimas, Riaumojimas.
- Jokio smurto: dinozaurai niekada nesužeidžiami, jie nurimsta, prisimena, susidraugauja.
- Žodynas: dinozaurų pavadinimai, kiaušinis, lizdas, paparčiai, pelkė, ugnikalnis, lava, uola, urvas,
  upelis, ežeras, krioklys, medžiai, lapai, uogos, fosilija, kaulas, pėdsakas, gintaras, laiko
  mašina, palapinė, laužas, žemėlapis, kuprinė, žibintuvėlis, kompasas ir vaiko pasaulis (šeima,
  maistas, mokykla, gyvūnai).
- Vietos ženklai tekste (tik vardininku!): `[Vardas]`, `[Šeima]` (pvz., Mama), `[Draugas]`,
  `[Augintinis]`. Naudok saikingai (2–3 kartus lygyje). Herojaus lytis nežinoma: NIEKADA nerašyk
  giminę rodančių žodžių apie `[Vardas]` („pavargęs“, „atėjusi“, „jis/ji“ apie herojų).

## Lygiai, priešai ir sunkumas

| Lygis | Vieta (`pavadinimas`) | Mažas priešas | Vidutinis priešas | Bosas (`vardas`, `piesinys`) | Tekstas | Klausimų tipas | Atsakymai |
|---|---|---|---|---|---|---|---|
| 1 | Paparčių slėnis | Kompsognatas (`kompsognatas`) | Stegozauras (`stegozauras`) | Triceratopsas Trikampis (`triceratopsas`) | 1–3 sakiniai, 8–22 žodžiai | kas, kur, kokia spalva, kiek, sinonimas | žodis ar 2 žodžiai |
| 2 | Pelkių takas | Pterodaktiliukas (`pterodaktilis`) | Ankilozauras (`ankilozauras`) | Brachiozauras Ilgakaklis (`brachiozauras`) | 2–3 sakiniai, 12–28 žodžiai | du veikėjai ar dvi savybės, panašūs žodžiai (š/s, ė/e) | 1–3 žodžiai |
| 3 | Ežerų kraštas | Kompsognatas (`kompsognatas`) | Triceratopsas (`triceratopsas`) | Stegozauras Dygliauodegis (`stegozauras`) | 2–4 sakiniai, 15–35 žodžiai | kas? kur? kada? kiek? – įkaltis tekste tarp kitų žodžių | 1–3 žodžiai |
| 4 | Kalnų tarpeklis | Pterodaktiliukas (`pterodaktilis`) | Stegozauras (`stegozauras`) | Pterodaktilis Audrasparnis (`pterodaktilis`) | 3–4 sakiniai, 20–40 žodžių | eiliškumas ir priežastis (kas pirma, kodėl), neigimas („ne“, „dar ne“) | trumpas sakinys (iki 5 žodžių) |
| 5 | Ugnikalnio papėdė | Kompsognatas (`kompsognatas`) | Brachiozauras (`brachiozauras`) | Ankilozauras Šarvuotis (`ankilozauras`) | 3–5 sakiniai, 25–50 žodžių | išvada: jausmai, ketinimai, kas sako netiesą | trumpas sakinys (iki 5 žodžių) |
| 6 (finalas) | Ugnikalnio viršūnė | Pterodaktiliukas (`pterodaktilis`) | Triceratopsas (`triceratopsas`) | Tiranozauras Rūstuolis (`tiranozauras`) | 4–6 sakinių istorija, 30–60 žodžių | supratimas visos istorijos | trumpas sakinys (iki 5 žodžių) |

Finale (6 lygis) boso 5 užduotys – VIENA pasaka Rūstuoliui, pasakojama dalimis (b01…b05 – iš eilės
tęsiasi), po kiekvienos dalies klausimas. Pabaigoje paaiškėja, kad Rūstuolis pyko, nes jam niekas
niekada nesekė pasakų; išklausęs jis nurimsta ir tampa slėnio sargu. Taikus finalas.
Kiekvieno lygio boso tekstai šiek tiek sunkesni už paprastus to lygio tekstus (b01 lengviausias, b05 sunkiausias).

## Kokios užduotys geros (svarbiausia!)

- **Atsakymą reikia suprasti, o ne surasti.** Teisingas atsakymas NEKARTOJA teksto žodžių:
  joks 4+ raidžių teisingo atsakymo žodis negali prasidėti tomis pačiomis 4 raidėmis kaip bet kuris
  teksto žodis (tikrina testas). Klausk apie priežastį, jausmą, laiką, kiekį, sinonimą, apibendrinimą.
  Pvz.: tekste „žibintuvėlis“, atsakymas „šviesa“; tekste „dreba ir slepiasi“, atsakymas „bijo“.
- **Klaidingi atsakymai gundo:** bent trečdalyje užduočių vienas klaidingas atsakymas paimtas iš teksto
  (žodis iš teksto, kuris neatsako į klausimą).
- Klaidingi atsakymai tikėtini, panašaus ilgio. Teisingas atsakymas NEGALI būti vienintelis ilgiausias
  (pagal simbolių skaičių); ilgiausio ir trumpiausio atsakymo santykis ≤ 2,5. Visi 4 atsakymai skirtingi.
- `uzuomina` – žodis ar frazė, KURI YRA TEKSTE (tiksliai taip parašyta), rodanti įkaltį (ne patį atsakymą).
- `zodis` – daiktavardis vardininku iš teksto temos, kuris „grįžta į dienoraštį“ (pvz., „kiaušinis“).
- Tekstų ilgis tiksliai pagal lentelę (žodžiai skaičiuojami kaip raidžių grupės; `[Vardas]` – 1 žodis;
  sakiniai baigiasi `.`, `!`, `?` arba `…`; kabutės „…“ viduje sakinio neskaido).
- Taisyklinga lietuvių kalba, trumpi aiškūs sakiniai, pirmoko žodynas. Patikrink linksnius ir kirčiavimo
  nereikia. Tekstai įdomūs, su nuotaika, susiję su lygio vieta.

## Formatas: `uzduotys.json` (masyvas, 35 užduotys)

ID: `sN-k01` … `sN-k24` (kovos: k01–k08 – 1 vietovė, k09–k16 – 2, k17–k24 – 3), `sN-b01` … `sN-b05`
(bosas), `sN-z01` … `sN-z03` (kryžkelių ženklai 1–3 vietovėms), `sN-d01` … `sN-d03` (slaptų urvų mįslės).

```json
{
  "id": "s1-k01", "skyrius": 1, "tipas": "kova",
  "tekstas": "Mažas kompsognatas slepiasi paparčiuose. Jis dreba ir neišlenda, nes netoliese vaikšto didelis dinozauras.",
  "klausimas": "Kaip jaučiasi kompsognatas?",
  "atsakymai": [
    {"tekstas": "bijo", "teisingas": true},
    {"tekstas": "džiaugiasi", "teisingas": false},
    {"tekstas": "slepiasi", "teisingas": false},
    {"tekstas": "pyksta", "teisingas": false}
  ],
  "uzuomina": "dreba", "zodis": "papartis"
}
```

Bosas: `"tipas": "bosas"`, tas pats formatas. Durys (mįslė, klaida širdelės neatima):

```json
{ "id": "s1-d01", "skyrius": 1, "tipas": "durys",
  "tekstas": "Ant akmens iškalta: „Dieną manęs nematyti, o naktį šviečiu danguje. Kas aš?“",
  "klausimas": "",
  "atsakymai": [{"tekstas":"mėnulis","teisingas":true},{"tekstas":"saulė","teisingas":false},{"tekstas":"debesis","teisingas":false},{"tekstas":"lempa","teisingas":false}],
  "uzuomina": "naktį" }
```

Mįslės – lietuviškos (liaudies arba sukurtos apie gamtą/dinozaurus), sunkėjančios su lygiu.
Durims ilgio ir „nekartoja teksto“ taisyklės netaikomos, bet 4 atsakymai, 1 teisingas ir užuomina tekste – privaloma.

Kryžkelės ženklas (be `uzuomina`, be `teisingas`, atsakymų tvarka būtent tokia):

```json
{ "id": "s1-z01", "skyrius": 1, "tipas": "sankryza",
  "tekstas": "Kairėje – lobis, bet jį saugo du dinozaurai. Dešinėje tik vienas kompsognatas.",
  "klausimas": "Kur eisi?",
  "atsakymai": [{"tekstas":"← kairėn","kelias":"lobis"},{"tekstas":"dešinėn →","kelias":"trumpas"}] }
```

SVARBU apie ženklus: 1 ir 3 vietovėje lobis yra KAIRĖJE (`← kairėn` → `"lobis"`, `dešinėn →` → `"trumpas"`),
2 vietovėje lobis DEŠINĖJE (`← kairėn` → `"trumpas"`, `dešinėn →` → `"lobis"`). Lobio kelyje laukia 2
dinozaurai, trumpame – 1. Sakinyje apie kairę žodis su šaknimi „lob“ (lobis, lobį, lobio) turi būti TIK
tada, kai lobis kairėje; ženklo tekstas tik apie kairę ir dešinę, 2–3 trumpi sakiniai.

## Formatas: `tema.json`

```json
{
  "numeris": 1,
  "pavadinimas": "Paparčių slėnis",
  "priesai": {
    "mazas": {"vardas": "Kompsognatas", "piesinys": "kompsognatas"},
    "vidutinis": {"vardas": "Stegozauras", "piesinys": "stegozauras"}
  },
  "bosas": {"vardas": "Triceratopsas Trikampis", "piesinys": "triceratopsas"},
  "sales": ["Paparčių pieva", "Upelio brasta", "Senųjų medžių giraitė"],
  "puslapis": {"pavadinimas": "Paparčių slėnis", "tekstas": "4–6 sakinių trumpa istorija apie tai, kas nutiko šiame lygyje, vaikui skaityti dienoraštyje."}
}
```

`sales` – trijų vietovių pavadinimai (trumpi, 2–3 žodžiai, susiję su lygio vieta).

## Kaip patikrinti

```bash
cd /home/user/dino-game
node tools/generuoti-skyriu.mjs N          # iš tema.json sukuria skyrius.json
npx vitest run tests/content.test.ts 2>&1 | grep -E "sN-|skyrius N" | head -50
```

Žiūrėk tik į klaidas su savo lygio ID (`sN-…`). Kiti lygiai gali būti dar nebaigti – kitų klaidų nepaisyk.
Taisyk, kol savo ID klaidų neliks. Tada dar kartą perskaityk savo tekstus ir patikrink kalbą bei logiką:
ar klausimas tikrai turi vieną teisingą atsakymą pagal tekstą, ar klaidingi atsakymai tikrai neteisingi.
