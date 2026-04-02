// Registro de Service Worker fuera de inline script para cumplir CSP estricta.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('PWA Service Worker registrado con exito.', reg.scope))
      .catch((err) => console.log('PWA SW fallido:', err));
  });
}
