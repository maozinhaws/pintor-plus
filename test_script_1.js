
(function() {
  const THRESHOLD = 0.75; 
  let baseH = window.innerHeight;
  function onResize() {
    const vv = window.visualViewport;
    const curH = vv ? vv.height : window.innerHeight;
    const ratio = curH / baseH;
    document.body.classList.toggle('kb-open', ratio < THRESHOLD);
  }
  if (window.visualViewport) { window.visualViewport.addEventListener('resize', onResize); } 
  else { window.addEventListener('resize', onResize); }
  window.addEventListener('load', () => { baseH = window.visualViewport ? window.visualViewport.height : window.innerHeight; });
})();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      // Periodic Background Sync — notificações mesmo com app fechado (Chrome/Android)
      if ('periodicSync' in reg) {
        reg.periodicSync.register('pp-check-alarms', { minInterval: 15 * 60 * 1000 }).catch(() => {});
      }
    }).catch(() => {});
  });
}
