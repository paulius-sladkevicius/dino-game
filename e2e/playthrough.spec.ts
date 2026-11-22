// Visas 1 skyrius telefono naršyklėje: nuo vardo įvedimo iki boso nugalėjimo.
import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

// Visų lygių užduotys (atsakymams surasti).
const uzduotys = readdirSync('src/content')
  .filter((d) => d.startsWith('skyrius-'))
  .flatMap((d) => JSON.parse(readFileSync(`src/content/${d}/uzduotys.json`, 'utf8')));
const PUSLAPIS1 = JSON.parse(readFileSync('src/content/skyrius-1/tema.json', 'utf8')).puslapis.tekstas.split('.')[0];

type U = { id: string; atsakymai: { tekstas: string; teisingas?: boolean }[] };
const UZD = new Map((uzduotys as U[]).map((u) => [u.id, u]));
const teisingas = (id: string) => UZD.get(id)!.atsakymai.find((a) => a.teisingas)!.tekstas;
const neteisingas = (id: string) => UZD.get(id)!.atsakymai.find((a) => !a.teisingas)!.tekstas;

function stebetiKonsole(page: Page): string[] {
  const klaidos: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') klaidos.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => klaidos.push(`pageerror: ${e.message}`));
  return klaidos;
}

async function pradeti(page: Page, vardas = 'Ugnė', kreipinys = 'Ugne') {
  await page.goto('/');
  await page.getByLabel('Kuo tu vardu?').fill(vardas);
  await page.getByRole('button', { name: 'Pradėti' }).click();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Toliau' }).click();
  await expect(page.getByText(`Padėk mums, ${kreipinys}!`)).toBeVisible();
  await page.getByRole('button', { name: 'Pradėkime!' }).click();
  await expect(page.locator('[data-ekranas="skyrius"]')).toBeVisible();
}

const ekranas = (page: Page) => page.locator('[data-ekranas]').first().getAttribute('data-ekranas');

/** Atsako teisingai į dabartinę kovos užduotį ir palaukia, kol baigsis animacija. */
async function atsakytiTeisingai(page: Page) {
  const kortele = page.locator('.teksto-kortele[data-uzduotis]');
  const id = (await kortele.getAttribute('data-uzduotis'))!;
  const mygtukas = page.locator(`button.atsakymas[data-atsakymas="${teisingas(id)}"]`);
  await expect(mygtukas).toBeEnabled({ timeout: 4000 });
  await mygtukas.click();
  await page.waitForFunction(
    (senas) => {
      const k = document.querySelector('.teksto-kortele[data-uzduotis]');
      return !k || k.getAttribute('data-uzduotis') !== senas || document.querySelector('[data-langas]');
    },
    id,
    { timeout: 5000 },
  );
}

/** Kiekviename ekrane: jokio horizontalaus slinkimo, visi mygtukai ne mažesni nei 64 px. */
async function tikrintiIsdestyma(page: Page, kur: string) {
  const r = await page.evaluate(() => {
    const per = document.documentElement.scrollWidth - window.innerWidth;
    const mazi = [...document.querySelectorAll('button')]
      .filter((b) => {
        const s = getComputedStyle(b);
        if (s.visibility === 'hidden' || s.display === 'none') return false;
        const rect = b.getBoundingClientRect();
        return rect.width > 0 && (rect.width < 63.5 || rect.height < 63.5);
      })
      .map((b) => `${b.textContent?.trim() || b.getAttribute('aria-label')} ${Math.round(b.getBoundingClientRect().width)}×${Math.round(b.getBoundingClientRect().height)}`);
    return { per, mazi };
  });
  expect(r.per, `horizontalus slinkimas (${kur})`).toBeLessThanOrEqual(1);
  expect(r.mazi, `per maži mygtukai (${kur})`).toEqual([]);
}

/** Vienas žingsnis pagal tai, kas dabar rodoma. Grąžina false, kai pasiekta Knyga po boso. */
async function zingsnis(page: Page, zurnalas: string[]): Promise<boolean> {
  const langas = page.locator('[data-langas]');
  if (await langas.count()) {
    const tipas = await langas.getAttribute('data-langas');
    await tikrintiIsdestyma(page, `langas ${tipas}`);
    zurnalas.push(`langas:${tipas}`);
    if (tipas === 'grobis') await page.getByRole('button', { name: 'Imu' }).click();
    else if (tipas === 'saleBaigta') await page.getByRole('button', { name: 'Tęsiam dabar' }).click();
    else if (tipas === 'pralaimejimas') await page.getByRole('button', { name: 'Į stovyklą' }).click();
    else if (tipas === 'durys') {
      const id = (await langas.locator('[data-uzduotis]').getAttribute('data-uzduotis'))!;
      await langas.locator(`button[data-atsakymas="${teisingas(id)}"]`).click();
    } else await langas.locator('button.pagrindinis').click();
    return true;
  }
  const e = await ekranas(page);
  zurnalas.push(`ekranas:${e}`);
  await tikrintiIsdestyma(page, `ekranas ${e}`);
  switch (e) {
    case 'knyga':
      return false;
    case 'skyrius': {
      const korta = page.locator('button.sales-korta:not(:disabled):not(.baigta)').first();
      await korta.click();
      return true;
    }
    case 'lauzas':
    case 'bosoLauzas':
      await page.locator('[data-veiksmas]').click();
      return true;
    case 'kova':
      await atsakytiTeisingai(page);
      return true;
    case 'sale': {
      const durys = page.locator('[data-durys]');
      if (await durys.count()) {
        // Sankryža: pirma slaptos durys, paskui lobio kelias, grįžus – trumpas kelias.
        const tekstas = await durys.innerText();
        if (tekstas.includes('Slaptos durys')) {
          await durys.click();
          return true;
        }
        const lobis = page.locator('button[data-kelias="lobis"]');
        const aplankytas = await page.locator('button[data-kelias="lobis"].aplankytas').count();
        await (aplankytas ? page.locator('button[data-kelias="trumpas"]') : lobis).click();
        return true;
      }
      // Vaizdas iš šono: „Eiti ▶“, o aklavietėje (slaptas kambarys) – „◀“ atgal.
      const pirmyn = page.locator('[data-veiksmas="pirmyn"]');
      const atgal = page.locator('[data-veiksmas="atgal"]');
      if ((await pirmyn.count()) && (await pirmyn.isEnabled())) await pirmyn.click();
      else if ((await page.locator('[data-kambarys-dabar="slaptas"]').count()) && (await atgal.isEnabled())) await atgal.click();
      else await page.waitForTimeout(250); // herojus dar eina
      return true;
    }
    default:
      throw new Error(`Netikėtas ekranas ${e}`);
  }
}

test('nuo vardo įvedimo iki 1 lygio didžiojo dinozauro nuraminimo', async ({ page }) => {
  const klaidos = stebetiKonsole(page);
  await pradeti(page);
  const zurnalas: string[] = [];
  let i = 0;
  let nesekmes = 0;
  for (;;) {
    if (++i > 400) throw new Error(`Per daug žingsnių:\n${zurnalas.slice(-30).join('\n')}`);
    try {
      if (!(await zingsnis(page, zurnalas))) break;
      nesekmes = 0;
    } catch (e) {
      // Kartais langas iššoka tarp patikrinimo ir paspaudimo – bandome dar kartą.
      if (++nesekmes > 5) throw e;
      zurnalas.push(`kartojama: ${(e as Error).message.split('\n')[0]}`);
    }
  }
  // Knyga: puslapis grįžo, žodžiai surinkti.
  await expect(page.locator('.knygos-puslapis[data-puslapis="1"]')).not.toHaveClass(/po-rasalu/);
  await expect(page.getByText(PUSLAPIS1, { exact: false })).toBeVisible();
  expect(zurnalas).toContain('langas:pergale');
  expect(zurnalas).toContain('langas:durys');
  expect(zurnalas).toContain('langas:dovana');
  expect(zurnalas).toContain('langas:lobis');
  expect(zurnalas.filter((z) => z === 'langas:saleBaigta')).toHaveLength(3);
  // Progresas išsaugotas: perkrovus – ta pati būsena.
  await page.reload();
  await expect(page.getByText('Labas, Ugne!')).toBeVisible();
  await page.getByRole('button', { name: 'Dienoraštis' }).click();
  await expect(page.getByText(PUSLAPIS1, { exact: false })).toBeVisible();
  expect(klaidos).toEqual([]);
});

test('klaida: −1 širdelė, atsakymas dingsta, mygtukai užrakinami 2 s, Švieselė paryškina žodį', async ({ page }) => {
  const klaidos = stebetiKonsole(page);
  await pradeti(page, 'Jonas', 'Jonai');
  await page.locator('[data-sale="s1-sale1"]').click();
  await page.locator('[data-veiksmas="i-sale"]').click();
  await page.locator('[data-veiksmas="pirmyn"]').click();
  await expect(page.locator('[data-ekranas="kova"]')).toBeVisible();
  await expect(page.locator('.sirdeles')).toHaveAttribute('data-sirdeles', '5');

  // Švieselė: 1 mana, paryškina svarbiausią žodį.
  await page.getByRole('button', { name: /Lupa/ }).click();
  await expect(page.locator('.mana')).toHaveAttribute('data-mana', '2');
  await expect(page.locator('.tekstas .pazymetas-zodis').first()).toBeVisible();

  const id = (await page.locator('.teksto-kortele').getAttribute('data-uzduotis'))!;
  await page.locator(`button[data-atsakymas="${neteisingas(id)}"]`).click();
  await expect(page.locator('.sirdeles')).toHaveAttribute('data-sirdeles', '4');
  await expect(page.locator(`button[data-atsakymas="${neteisingas(id)}"]`)).toHaveCount(0);
  await expect(page.locator('button.atsakymas')).toHaveCount(3);
  await expect(page.locator('button.atsakymas').first()).toBeDisabled();
  await expect(page.getByText('Pažiūrėk į paryškintą žodį.')).toBeVisible();
  await expect(page.locator('button.atsakymas').first()).toBeEnabled({ timeout: 3000 });

  // Teisingai po klaidos: širdelės ir mana nesikeičia.
  await atsakytiTeisingai(page);
  await expect(page.locator('.sirdeles')).toHaveAttribute('data-sirdeles', '4');
  await expect(page.locator('.mana')).toHaveAttribute('data-mana', '2');
  expect(klaidos).toEqual([]);
});

test('širdelėms pasibaigus – prie laužo, širdelės vėl 5', async ({ page }) => {
  const klaidos = stebetiKonsole(page);
  await pradeti(page);
  await page.locator('[data-sale="s1-sale1"]').click();
  await page.locator('[data-veiksmas="i-sale"]').click();
  await page.locator('[data-veiksmas="pirmyn"]').click();
  for (let n = 0; n < 20; n++) {
    if (await page.locator('[data-langas="pralaimejimas"]').count()) break;
    const kortele = page.locator('.teksto-kortele[data-uzduotis]');
    if (!(await kortele.count())) {
      await page.waitForTimeout(300);
      continue;
    }
    const id = (await kortele.getAttribute('data-uzduotis'))!;
    const blogi = UZD.get(id)!.atsakymai.filter((a) => !a.teisingas).map((a) => a.tekstas);
    let paspausta = false;
    for (const b of blogi) {
      const m = page.locator(`button[data-atsakymas="${b}"]`);
      if (await m.count()) {
        await expect(m).toBeEnabled({ timeout: 3000 });
        if (await page.locator('[data-langas]').count()) break;
        await m.click({ timeout: 2000 }).catch(() => undefined);
        paspausta = true;
        break;
      }
    }
    if (!paspausta && !(await page.locator('[data-langas]').count())) await atsakytiTeisingai(page);
  }
  await expect(page.locator('[data-langas="pralaimejimas"]')).toBeVisible({ timeout: 4000 });
  await page.getByRole('button', { name: 'Į stovyklą' }).click();
  await expect(page.locator('[data-ekranas="lauzas"]')).toBeVisible();
  await expect(page.locator('.sirdeles')).toHaveAttribute('data-sirdeles', '5');
  expect(klaidos).toEqual([]);
});

test('tėvų skydelis: suaugusiojo klausimas, jungikliai, savi žodžiai', async ({ page }) => {
  const klaidos = stebetiKonsole(page);
  await pradeti(page);
  await page.getByRole('button', { name: 'Pradžia' }).click();
  await page.getByRole('button', { name: 'Tėvams' }).click();
  const klausimas = await page.locator('label[for="vartai"]').innerText();
  const [, a, b] = klausimas.match(/(\d+) × (\d+)/)!;
  await page.locator('#vartai').fill('1');
  await page.getByRole('button', { name: 'Atrakinti' }).click();
  await expect(page.getByText('Neteisingai')).toBeVisible();
  await page.locator('#vartai').fill(String(Number(a) * Number(b)));
  await page.getByRole('button', { name: 'Atrakinti' }).click();
  await expect(page.getByRole('heading', { name: 'Tėvų skydelis' })).toBeVisible();
  await page.getByLabel('Rodyti DIDŽIOSIOMIS raidėmis').check();
  await page.getByLabel('Augintinis').fill('Pūkas');
  await page.getByLabel('Augintinis').blur();
  await page.getByRole('button', { name: 'Uždaryti' }).click();
  await expect(page.locator('#zaidimas')).toHaveClass(/didziosios/);
  await page.reload();
  await expect(page.locator('#zaidimas')).toHaveClass(/didziosios/);
  expect(klaidos).toEqual([]);
});

test('vaizdas iš šono: einama mygtukais, nugalėtas priešas išnyksta, herojus pereina pro duris', async ({ page }) => {
  const klaidos = stebetiKonsole(page);
  await pradeti(page);
  await page.locator('[data-sale="s1-sale1"]').click();
  await page.locator('[data-veiksmas="i-sale"]').click();
  await expect(page.locator('[data-kambarys-dabar="r1"]')).toBeVisible();
  await expect(page.locator('.scena .scenos-priesas')).toHaveCount(1);
  // Atgal iš pirmo kambario – prie laužo, ir vėl pirmyn.
  await page.locator('[data-veiksmas="atgal"]').click();
  await expect(page.locator('[data-ekranas="lauzas"]')).toBeVisible();
  await page.locator('[data-veiksmas="i-sale"]').click();
  await page.locator('[data-veiksmas="pirmyn"]').click();
  await expect(page.locator('[data-ekranas="kova"]')).toBeVisible();
  await expect(page.locator('.kovos-scena .scenos-herojus')).toHaveCount(1);
  while (await page.locator('[data-ekranas="kova"]').count()) {
    if (await page.locator('[data-langas]').count()) break;
    await atsakytiTeisingai(page);
  }
  await expect(page.locator('[data-langas="nugaletas"]')).toBeVisible();
  while (await page.locator('[data-langas]').count()) {
    const t = await page.locator('[data-langas]').getAttribute('data-langas');
    await page.locator(t === 'grobis' ? 'text=Imu' : '[data-langas] button.pagrindinis').click();
  }
  // Priešas dingo, herojus pats nueina pro duris į sankryžą.
  await expect(page.locator('.scena .scenos-priesas')).toHaveCount(0);
  await expect(page.locator('[data-kambarys-dabar="sankryza"]')).toBeVisible({ timeout: 5000 });
  // Žemėlapis – tik peržiūrai.
  await page.locator('[data-zemelapis]').click();
  await expect(page.locator('[data-langas="zemelapis"] .kambarys.dabar')).toHaveCount(1);
  await page.locator('[data-langas] button.pagrindinis').click();
  expect(klaidos).toEqual([]);
});

test('garsą galima išjungti ir tai išsaugoma; visas ekranas be klaidų', async ({ page }) => {
  const klaidos = stebetiKonsole(page);
  await pradeti(page);
  await page.locator('[data-sale="s1-sale1"]').click();
  const garsas = page.locator('[data-garsas]');
  await expect(garsas).toHaveAttribute('data-garsas', 'ijungtas');
  await garsas.click();
  await expect(page.locator('[data-garsas]')).toHaveAttribute('data-garsas', 'isjungtas');
  await page.reload();
  await page.getByRole('button', { name: 'Žaisti' }).click();
  await expect(page.locator('[data-garsas]')).toHaveAttribute('data-garsas', 'isjungtas');
  await page.locator('[data-garsas]').click();
  await expect(page.locator('[data-garsas]')).toHaveAttribute('data-garsas', 'ijungtas');
  const visas = page.locator('[data-visas-ekranas]');
  if (await visas.count()) {
    await visas.click();
    await page.waitForTimeout(300);
  }
  expect(klaidos).toEqual([]);
});

test('visi 6 lygiai iki galo (sutrumpintos animacijos)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'telefonas', 'Ilgas testas – užtenka vieno įrenginio');
  test.setTimeout(900_000);
  const context = await browser.newContext({ ...info.project.use, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const klaidos = stebetiKonsole(page);
  await pradeti(page);
  const zurnalas: string[] = [];
  let nesekmes = 0;
  for (let i = 0; i < 3000; i++) {
    try {
      if (!(await zingsnis(page, zurnalas))) {
        const grize = await page.locator('.knygos-puslapis:not(.po-rasalu)').count();
        if (grize >= 6) break;
        await page.getByRole('button', { name: 'Užverti dienoraštį' }).click();
      }
      nesekmes = 0;
    } catch (e) {
      if (++nesekmes > 5) throw e;
    }
  }
  await expect(page.locator('.knygos-puslapis:not(.po-rasalu)')).toHaveCount(6);
  expect(zurnalas.filter((z) => z === 'langas:pergale')).toHaveLength(6);
  await page.getByRole('button', { name: 'Užverti dienoraštį' }).click();
  await expect(page.getByText('Visi dienoraščio puslapiai grįžo!')).toBeVisible();
  expect(klaidos).toEqual([]);
  await context.close();
});

test('PWA: antrą kartą atsidaro ir be interneto', async ({ page, context }) => {
  const klaidos = stebetiKonsole(page);
  await page.goto('/');
  await page.waitForFunction(
    async () => (await navigator.serviceWorker?.getRegistration())?.active?.state === 'activated',
    null,
    { timeout: 15000 },
  );
  await expect(async () => {
    await page.reload();
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  }).toPass({ timeout: 15000 });
  // Nauja versija turi perimti valdymą iš karto (kitaip telefone liktų sena versija).
  const sw = await (await page.request.get('/sw.js')).text();
  expect(sw).toContain('skipWaiting()');
  expect(sw).toContain('clientsClaim()');
  // Nuo šiol visas tinklas „nutrūksta“: atsakyti gali tik service worker iš talpyklos.
  await context.route('**/*', (route) => route.abort('internetdisconnected'));
  await page.reload();
  await expect(page.getByLabel('Kuo tu vardu?')).toBeVisible();
  await expect(page.locator('.vardo-klausimas')).toHaveCSS('font-family', /Andika/);
  const sriftas = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('32px Andika', 'ėųž');
  });
  expect(sriftas).toBe(true);
  expect(klaidos.filter((k) => !k.includes('internetdisconnected'))).toEqual([]);
});
