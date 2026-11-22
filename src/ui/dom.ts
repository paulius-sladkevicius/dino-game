// Mažas DOM pagalbininkas be karkaso. Vartotojo tekstas visada dedamas per
// textContent (niekada per innerHTML), SVG piešiniai – tik iš mūsų pačių eilučių.

type Vaikas = Node | string | number | false | null | undefined | Vaikas[];
type Atributai = Record<string, unknown>;

export function h<K extends keyof HTMLElementTagNameMap>(
  zyme: K,
  atributai: Atributai | null = null,
  ...vaikai: Vaikas[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(zyme);
  if (atributai) {
    for (const [k, v] of Object.entries(atributai)) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
      } else if (k === 'class') {
        el.className = String(v);
      } else if (k === 'style' && typeof v === 'object') {
        for (const [sk, sv] of Object.entries(v as Record<string, string | number>)) {
          if (sk.startsWith('--')) el.style.setProperty(sk, String(sv));
          else (el.style as unknown as Record<string, string>)[sk] = String(sv);
        }
      } else if (v === true) {
        el.setAttribute(k, '');
      } else {
        el.setAttribute(k, String(v));
      }
    }
  }
  pridetiVaikus(el, vaikai);
  return el;
}

function pridetiVaikus(el: Element, vaikai: Vaikas[]): void {
  for (const v of vaikai) {
    if (v === null || v === undefined || v === false) continue;
    if (Array.isArray(v)) pridetiVaikus(el, v);
    else if (v instanceof Node) el.appendChild(v);
    else el.appendChild(document.createTextNode(String(v)));
  }
}

/** SVG iš mūsų pačių (patikimos) eilutės. */
export function svg(kodas: string, klase = ''): HTMLElement {
  const span = document.createElement('span');
  span.className = `piesinys ${klase}`.trim();
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = kodas;
  return span;
}

export function isvalyti(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export const sumazintasJudesys = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
