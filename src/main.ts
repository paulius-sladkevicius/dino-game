import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-ext-400.css';
import '@fontsource/andika/latin-700.css';
import '@fontsource/andika/latin-ext-700.css';
import '@fontsource/caveat/latin-600.css';
import '@fontsource/caveat/latin-ext-600.css';
import '@fontsource/caveat/latin-700.css';
import '@fontsource/caveat/latin-ext-700.css';
import './ui/styles.css';
import { paleisti } from './ui/app';

const saknis = document.getElementById('zaidimas');
if (saknis) paleisti(saknis);

// PWA: žaidimas veikia ir be interneto. Registracija tik produkcinėje versijoje.
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
  import('virtual:pwa-register')
    .then(({ registerSW }) =>
      registerSW({
        immediate: true,
        // Atnaujinimų tikrinama kiekvieną kartą grįžus į žaidimą ir kas valandą.
        onRegisteredSW(_url, registracija) {
          if (!registracija) return;
          const tikrinti = () => void registracija.update().catch(() => undefined);
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) tikrinti();
          });
          setInterval(tikrinti, 60 * 60 * 1000);
        },
      }),
    )
    .catch(() => {
      /* be service worker žaidimas vis tiek veikia */
    });
}
