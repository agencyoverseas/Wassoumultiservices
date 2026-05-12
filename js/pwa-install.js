// ============================================================
//  WASSOU — Popup PWA install v3 (BLOQUANTE)
//  - Modal centrée en haut avec overlay
//  - Fige TOUT le scroll quand affichée
//  - Si "Plus tard" → réapparaît toutes les 45 secondes
//  - Si "Installer" accepté ou app installée → ne réapparaît plus
//  - iOS / Android / Desktop
// ============================================================

(function () {
  'use strict';

  function whenReady(cb) {
    if (typeof CONFIG !== 'undefined') return cb();
    let tries = 0;
    const it = setInterval(() => {
      tries++;
      if (typeof CONFIG !== 'undefined') { clearInterval(it); cb(); }
      else if (tries > 30) clearInterval(it);
    }, 100);
  }

  whenReady(function () {
    const cfg = (window.CONFIG && window.CONFIG.pwa) || {};
    if (cfg.popup_active === false) return;

    const PREFIX = (window.CONFIG?.avance?.storage_prefix || 'wassou_');
    const KEY_INSTALLED = PREFIX + 'pwa_installed';    // Marqueur "installé"
    const KEY_DISMISSED_PERMANENT = PREFIX + 'pwa_dismissed_permanent';  // Si on veut un opt-out total

    // ─── Si déjà installée → stop définitivement ───
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (standalone) {
      localStorage.setItem(KEY_INSTALLED, '1');
      console.log('[PWA] App déjà installée, popup désactivée');
      return;
    }
    if (localStorage.getItem(KEY_INSTALLED) === '1') {
      console.log('[PWA] App marquée comme installée, popup désactivée');
      return;
    }

    let deferredPrompt = null;
    let popupTimer = null;
    let isShown = false;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

    // Délais
    const DELAI_INITIAL = cfg.delai_avant_popup_ms || 3000;  // 3s au démarrage
    const DELAI_REAPPARITION = cfg.delai_reapparition_ms || 45000;  // 45s entre relances

    // ─── Capture le prompt natif ───
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('[PWA] beforeinstallprompt capturé ✓');
    });

    // ─── Détecte l'installation réussie ───
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(KEY_INSTALLED, '1');
      hide();
      clearTimeout(popupTimer);
      console.log('[PWA] App installée ! Popup désactivée définitivement');
    });

    // ─── Styles auto-injectés ───
    function injectStyles() {
      if (document.getElementById('pwa-popup-styles')) return;
      const st = document.createElement('style');
      st.id = 'pwa-popup-styles';
      st.textContent = `
        .pwa-overlay{
          position:fixed;inset:0;
          background:rgba(10,20,15,.75);
          backdrop-filter:blur(6px);
          -webkit-backdrop-filter:blur(6px);
          z-index:99998;
          opacity:0;
          transition:opacity .35s ease;
          pointer-events:auto;
        }
        .pwa-overlay.show{opacity:1}
        .pwa-popup{
          position:fixed;
          top:max(20px, env(safe-area-inset-top, 0px) + 20px);
          left:50%;
          transform:translateX(-50%) translateY(-30px);
          width:calc(100% - 32px);
          max-width:440px;
          background:#fff;
          color:#1a1a1a;
          border-radius:20px;
          padding:24px 22px;
          box-shadow:0 20px 60px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.1);
          z-index:99999;
          opacity:0;
          transition:transform .45s cubic-bezier(.34,1.3,.64,1), opacity .3s;
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
        }
        .pwa-popup.show{
          transform:translateX(-50%) translateY(0);
          opacity:1;
        }
        .pwa-head{
          display:flex;align-items:center;gap:14px;
          margin-bottom:16px;
        }
        .pwa-icon{
          width:58px;height:58px;flex-shrink:0;
          background:linear-gradient(135deg,#1b4332,#2d6a4f);
          border-radius:16px;
          display:flex;align-items:center;justify-content:center;
          font-size:32px;
          box-shadow:0 4px 14px rgba(27,67,50,.3);
        }
        .pwa-head-text{flex:1;min-width:0}
        .pwa-head h4{
          font-size:17px;font-weight:700;
          color:#1a1a1a;margin:0 0 3px;line-height:1.25;
        }
        .pwa-head p{
          font-size:13.5px;color:#666;margin:0;line-height:1.4;
        }
        .pwa-benefits{
          background:#f5faf7;
          border-radius:12px;
          padding:12px 14px;
          margin-bottom:18px;
          border-left:3px solid #d4a017;
        }
        .pwa-benefits ul{
          margin:0;padding:0;list-style:none;
          display:flex;flex-direction:column;gap:6px;
        }
        .pwa-benefits li{
          font-size:13px;color:#163126;
          display:flex;align-items:center;gap:8px;
        }
        .pwa-benefits li::before{
          content:'✓';color:#1b4332;font-weight:700;
        }
        .pwa-actions{
          display:flex;gap:10px;
        }
        .pwa-actions button{
          flex:1;padding:13px 14px;
          border-radius:12px;border:none;
          font-size:14.5px;font-weight:600;cursor:pointer;
          font-family:inherit;
          transition:transform .15s, box-shadow .2s, background .2s;
        }
        .pwa-actions button:active{transform:scale(.97)}
        .pwa-later{
          background:#f1f3f5;color:#666;
        }
        .pwa-later:hover{background:#e8eaed}
        .pwa-install-btn{
          background:linear-gradient(135deg,#1b4332,#2d6a4f);
          color:#fff;
          box-shadow:0 4px 14px rgba(27,67,50,.25);
        }
        .pwa-install-btn:hover{
          box-shadow:0 6px 18px rgba(27,67,50,.35);
        }
        .pwa-ios-help{
          margin-top:14px;padding:12px 14px;
          background:#fff8e1;color:#7a5d00;
          border-radius:10px;font-size:12.5px;line-height:1.5;
          display:none;
        }
        .pwa-popup.ios-mode .pwa-ios-help{display:block}
        .pwa-countdown{
          text-align:center;font-size:11.5px;color:#999;
          margin-top:12px;
        }
        /* Quand la popup est visible, on bloque le scroll de la page */
        body.pwa-popup-open{
          overflow:hidden !important;
          position:fixed;
          width:100%;
          top:var(--pwa-scroll-y, 0);
        }
      `;
      document.head.appendChild(st);
    }

    // ─── Construit la popup ───
    function buildPopup() {
      if (isShown) return;
      injectStyles();

      const logo = (window.CONFIG?.business?.logo_text) || '🌿';
      const titre = cfg.titre || '📲 Installer Wassou';
      const sousTitre = cfg.sous_titre || 'Accès rapide depuis votre écran d\'accueil';
      const btnInstall = cfg.bouton_installer || 'Installer';
      const btnLater = cfg.bouton_plus_tard || 'Plus tard';

      // Mémoriser la position de scroll AVANT le freeze
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      document.body.style.setProperty('--pwa-scroll-y', `-${scrollY}px`);

      // ─── Overlay sombre bloquant ───
      const overlay = document.createElement('div');
      overlay.className = 'pwa-overlay';
      overlay.id = 'pwa-overlay';
      document.body.appendChild(overlay);

      // ─── Popup ───
      const div = document.createElement('div');
      div.className = 'pwa-popup' + (isIOS ? ' ios-mode' : '');
      div.id = 'pwa-popup';
      div.setAttribute('role', 'dialog');
      div.setAttribute('aria-modal', 'true');
      div.innerHTML = `
        <div class="pwa-head">
          <div class="pwa-icon">${logo}</div>
          <div class="pwa-head-text">
            <h4>${titre}</h4>
            <p>${sousTitre}</p>
          </div>
        </div>
        <div class="pwa-benefits">
          <ul>
            <li>Accès direct depuis l'écran d'accueil</li>
            <li>Fonctionne hors-ligne</li>
            <li>Notifications de rendez-vous</li>
          </ul>
        </div>
        <div class="pwa-actions">
          <button class="pwa-later" id="pwa-later">${btnLater}</button>
          <button class="pwa-install-btn" id="pwa-install">${btnInstall}</button>
        </div>
        <div class="pwa-ios-help">
          <strong>📱 Sur iPhone :</strong> ${cfg.instructions_ios || "Touche le bouton Partager puis 'Sur l'écran d'accueil'"}
        </div>
        <div class="pwa-countdown" id="pwa-countdown"></div>
      `;
      document.body.appendChild(div);

      // Fige la page
      document.body.classList.add('pwa-popup-open');

      // Animation
      requestAnimationFrame(() => {
        overlay.classList.add('show');
        div.classList.add('show');
      });

      // Listeners
      div.querySelector('#pwa-later').addEventListener('click', dismiss);
      div.querySelector('#pwa-install').addEventListener('click', install);

      // Bloquer la fermeture en cliquant sur l'overlay (forcer choix)
      overlay.addEventListener('click', () => {
        // Petit shake pour signaler "fais un choix"
        div.style.animation = 'none';
        requestAnimationFrame(() => {
          div.style.animation = 'pwaShake .35s';
        });
      });

      // Animation shake
      if (!document.getElementById('pwa-shake-anim')) {
        const sa = document.createElement('style');
        sa.id = 'pwa-shake-anim';
        sa.textContent = `@keyframes pwaShake{0%,100%{transform:translateX(-50%) translateY(0)}25%{transform:translateX(calc(-50% - 8px)) translateY(0)}75%{transform:translateX(calc(-50% + 8px)) translateY(0)}}`;
        document.head.appendChild(sa);
      }

      isShown = true;
      console.log('[PWA] Popup affichée (bloquante)');
    }

    async function install() {
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('[PWA] Choix utilisateur:', outcome);
          if (outcome === 'accepted') {
            localStorage.setItem(KEY_INSTALLED, '1');
            hide();
            clearTimeout(popupTimer);
          } else {
            dismiss();
          }
          deferredPrompt = null;
        } catch (e) {
          console.warn('[PWA] Erreur prompt:', e);
          dismiss();
        }
      } else if (isIOS) {
        // iOS : ne peut pas auto-installer, on met en évidence les instructions
        const help = document.querySelector('.pwa-ios-help');
        if (help) {
          help.style.background = '#d1fae5';
          help.style.color = '#065f46';
          help.style.borderLeft = '4px solid #10b981';
        }
        // Démarre un countdown : ferme dans 8s pour que l'utilisateur lise les instructions
        let s = 8;
        const cd = document.getElementById('pwa-countdown');
        if (cd) {
          cd.textContent = `Fermeture automatique dans ${s}s…`;
          const itv = setInterval(() => {
            s--;
            if (cd) cd.textContent = `Fermeture automatique dans ${s}s…`;
            if (s <= 0) {
              clearInterval(itv);
              dismiss();
            }
          }, 1000);
        } else {
          setTimeout(dismiss, 8000);
        }
      } else {
        // Fallback (Firefox, vieux navigateur)
        alert("Pour installer :\n\n• Chrome : menu ⋮ → 'Installer l'application'\n• Safari iOS : Partager → 'Sur l'écran d'accueil'");
        dismiss();
      }
    }

    function dismiss() {
      hide();
      // Reprogramme dans 45s
      scheduleNext();
    }

    function hide() {
      const p = document.getElementById('pwa-popup');
      const o = document.getElementById('pwa-overlay');

      // Restaure le scroll
      const scrollY = document.body.style.getPropertyValue('--pwa-scroll-y') || '0';
      document.body.classList.remove('pwa-popup-open');
      document.body.style.removeProperty('--pwa-scroll-y');
      const y = parseInt(scrollY.replace('px', '').replace('-', ''), 10) || 0;
      window.scrollTo(0, y);

      if (p) { p.classList.remove('show'); setTimeout(() => p.remove(), 400); }
      if (o) { o.classList.remove('show'); setTimeout(() => o.remove(), 400); }

      isShown = false;
    }

    function scheduleNext() {
      clearTimeout(popupTimer);
      popupTimer = setTimeout(() => {
        // Re-check au cas où l'app a été installée entre-temps
        if (localStorage.getItem(KEY_INSTALLED) === '1') return;
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
          localStorage.setItem(KEY_INSTALLED, '1');
          return;
        }
        buildPopup();
      }, DELAI_REAPPARITION);
      console.log(`[PWA] Prochaine popup dans ${DELAI_REAPPARITION / 1000}s`);
    }

    // ─── Premier affichage après 3s ───
    function scheduleInitial() {
      popupTimer = setTimeout(() => {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
          localStorage.setItem(KEY_INSTALLED, '1');
          return;
        }
        buildPopup();
      }, DELAI_INITIAL);
      console.log(`[PWA] Popup initiale programmée dans ${DELAI_INITIAL / 1000}s`);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scheduleInitial);
    } else {
      scheduleInitial();
    }

    // ─── Helpers debug ───
    window.PWAPopup = {
      show: buildPopup,
      hide: hide,
      forceInstalled: () => { localStorage.setItem(KEY_INSTALLED, '1'); console.log('[PWA] Marqué comme installé'); },
      reset: () => {
        localStorage.removeItem(KEY_INSTALLED);
        clearTimeout(popupTimer);
        console.log('[PWA] Réinitialisé. Popup réapparaîtra dans 3s.');
        scheduleInitial();
      },
      status: () => ({
        installed: localStorage.getItem(KEY_INSTALLED) === '1',
        standalone: standalone,
        isShown: isShown,
        ios: isIOS,
        delai_initial: DELAI_INITIAL,
        delai_reapparition: DELAI_REAPPARITION,
        has_native_prompt: !!deferredPrompt,
      }),
    };
  });
})();
