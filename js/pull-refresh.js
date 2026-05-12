// ============================================================
// WASSOU — Pull to Refresh natif
// Tire vers le bas en haut de la page → rafraîchit l'app
// ============================================================
(function(){
  // Désactivé en mode iOS PWA standalone si rebond natif (let's still try)
  const THRESHOLD = 75;        // px à tirer avant déclenchement
  const MAX_PULL  = 120;       // distance maximale visible

  let startY = 0;
  let curY   = 0;
  let pulling = false;
  let refreshing = false;

  // ─── DOM indicateur ───
  const indicator = document.createElement('div');
  indicator.id = 'ptr-indicator';
  indicator.innerHTML = `
    <div class="ptr-circle">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15A9 9 0 1 1 18.36 5.64L23 10"/>
      </svg>
    </div>
  `;
  indicator.style.cssText = `
    position:fixed; top:0; left:50%; transform:translate(-50%,-100%);
    z-index:9999; padding:10px; pointer-events:none;
    transition:transform .25s cubic-bezier(.2,.8,.2,1), opacity .2s;
    opacity:0;
  `;

  // Style de la pastille
  const style = document.createElement('style');
  style.textContent = `
    #ptr-indicator .ptr-circle{
      width:44px; height:44px; border-radius:50%;
      background:#fff; color:#1b4332;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 4px 14px rgba(0,0,0,.18);
      transition:transform .15s linear;
    }
    #ptr-indicator.spin .ptr-circle{ animation:ptrSpin .9s linear infinite; }
    @keyframes ptrSpin{ to { transform:rotate(360deg); } }
  `;
  document.head.appendChild(style);

  function ensureMounted(){
    if (!indicator.isConnected) document.body.appendChild(indicator);
  }

  function setPosition(distance){
    const clamped = Math.min(distance, MAX_PULL);
    const opacity = Math.min(clamped / THRESHOLD, 1);
    const rotation = (clamped / THRESHOLD) * 270;
    indicator.style.opacity = opacity;
    indicator.style.transform = `translate(-50%, ${clamped - 50}px)`;
    const circle = indicator.querySelector('.ptr-circle');
    if (circle) circle.style.transform = `rotate(${rotation}deg)`;
  }

  function reset(){
    indicator.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1), opacity .2s';
    indicator.style.transform = 'translate(-50%, -100%)';
    indicator.style.opacity = '0';
    indicator.classList.remove('spin');
  }

  function triggerRefresh(){
    refreshing = true;
    indicator.classList.add('spin');
    indicator.style.transform = 'translate(-50%, 20px)';
    indicator.style.opacity = '1';
    // Petit délai pour que l'utilisateur voie l'animation
    setTimeout(() => {
      window.location.reload();
    }, 450);
  }

  // ─── Touch events ───
  document.addEventListener('touchstart', e => {
    if (refreshing) return;
    // On n'active le pull-to-refresh QUE si la page est tout en haut
    if ((window.scrollY || document.documentElement.scrollTop) > 2) return;
    // Pas dans un input, modal, drawer
    const tgt = e.target.closest('input,textarea,select,.modal,.drawer,.chat-input-bar');
    if (tgt) return;
    startY  = e.touches[0].clientY;
    pulling = true;
    ensureMounted();
    indicator.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!pulling || refreshing) return;
    curY = e.touches[0].clientY;
    const dy = curY - startY;
    if (dy <= 0) {
      reset();
      pulling = false;
      return;
    }
    // Résistance progressive (effet caoutchouc)
    const distance = Math.pow(dy, 0.85);
    setPosition(distance);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!pulling || refreshing) return;
    pulling = false;
    const dy = curY - startY;
    const distance = dy > 0 ? Math.pow(dy, 0.85) : 0;
    if (distance >= THRESHOLD) {
      triggerRefresh();
    } else {
      reset();
    }
  }, { passive: true });

  // Annule si l'onglet change ou si l'orientation tourne
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
})();
