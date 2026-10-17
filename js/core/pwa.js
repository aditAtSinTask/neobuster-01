'use strict';
// The game as an installable app (PWA, see manifest.webmanifest): installed, it opens full screen in landscape and
// plays offline. This registers the service worker (sw.js) and keeps the browser's install prompt, which the title
// menu offers as INSTALL APP where the browser supports it (Chrome, Edge, Android). On an iPhone the game is installed
// from Safari's Share menu (Add to Home Screen). A PWA needs the game served over https (or localhost), not opened as
// a file.

const pwa = {
  prompt: null, // the browser's install prompt, kept until the player asks for it
  app: matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true,
};
if ('serviceWorker' in navigator && location.protocol.startsWith('http'))
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  pwa.prompt = e;
});
addEventListener('appinstalled', () => {
  pwa.prompt = null;
});
// INSTALL APP on the title menu: only while the browser can install the game and it is not running as the app
const pwaCanInstall = () => !!pwa.prompt && !pwa.app;
async function pwaInstall() {
  const p = pwa.prompt;
  if (!p) return;
  pwa.prompt = null;
  try {
    await p.prompt();
  } catch (e) {
    /* the browser refused (no user gesture, already shown) */
  }
}
