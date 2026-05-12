// ============================================================
//  WASSOU — Popup PWA install v2 (AUTONOME)
//  - iOS / Android / Desktop
//  - Délai 3s configurable (CONFIG.pwa.delai_avant_popup_ms)
//  - Cooldown 7j si refusé
//  - Styles auto-injectés (pas besoin de modifier le CSS)
//  - Compatible landing publique + app connectée
// ============================================================

(function () {
  'use strict';

  // ─── Attente CONFIG (au cas où le script charge avant config.js) ───
  function whenReady(cb) {
    if (typeof CONFIG !== 'undefined') return cb();
    let tries = 0;
    const it = setInterval(() => {
      tries++;
      if (typeof CONFIG !== 'undefined') { clearInterval(it); cb(); }
      else if (tries > 30) clearInterval(it); // 3s max
    }, 100);
  }

  whenReady(function () {
    const cfg = (window.CONFIG && window.CONFIG.pwa) || {};
    if (!cfg.popup_active) {
      console.log('[PWA] Popup désactivée (CONFIG.pwa.popup_active = false)');
      return;
    }

    const KEY = (window.CONFIG?.avance?.storage_prefix || 'wassou_') + 'pwa_dismissed';

    // ─── Si déjà installée → stop ───
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (standalone) {
      console.log('[PWA] App déjà installée, popup non affichée');
      return;
    }

    // ─── Si refusée récemment → stop ───
    const dismissedAt = parseInt(localStorage.getItem(KEY) || '0');
    const cooldownMs = (cfg.refus_cooldown_jours || 7) * 24 * 60 * 60 * 1000;
    if (dismissedAt && Date.now() - dismissedAt < cooldownMs) {
      const restantH = Math.round((cooldownMs - (Date.now() - dismissedAt)) / 3600000);
      console.log(`[PWA] Popup refusée récemment (re-affichage dans ~${restantH}h)`);
      return;
    }

    let deferredPrompt = null;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/i.test(ua);

    // ─── Capture le prompt natif (Android/Chrome desktop) ───
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('[PWA] beforeinstallprompt capturé ✓');
    });

    // ─── Styles auto-injectés (pas besoin de toucher app.css) ───
    function injectStyles() {
      if (document.getElementById('pwa-popup-styles')) return;
      const st = document.createElement('style');
      st.id = 'pwa-popup-styles';
      st.textContent = `
        .pwa-popup{
          position:fixed;
          left:16px;right:16px;
          bottom:calc(16px + env(safe-area-inset-bottom,0px));
          background:#fff;
          color:#1a1a1a;
          border-radius:16px;
          padding:18px;
          box-shadow:0 12px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
          z-index:9998;
          max-width:440px;
          margin:0 auto;
          transform:translateY(calc(100% + 30px));
          opacity:0;
          transition:transform .45s cubic-bezier(.34,1.3,.64,1), opacity .3s;
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
        }
        .pwa-popup.show{transform:translateY(0);opacity:1}
        .pwa-close{
          position:absolute;top:8px;right:10px;
          width:32px;height:32px;
          border:none;background:transparent;
          font-size:22px;line-height:1;cursor:pointer;
          color:#888;border-radius:50%;
          transition:background .15s;
        }
        .pwa-close:hover{background:#f0f0f0;color:#333}
        .pwa-head{display:flex;align-items:center;gap:14px;margin-bottom:14px;padding-right:24px}
        .pwa-icon{
          width:52px;height:52px;flex-shrink:0;
          background:linear-gradient(135deg,#1b4332,#2d6a4f);
          border-radius:14px;
          display:flex;align-items:center;justify-content:center;
          font-size:28px;
          box-shadow:0 4px 12px rgba(27,67,50,.25);
        }
        .pwa-head h4{font-size:15.5px;font-weight:700;color:#1a1a1a;margin:0 0 2px;line-height:1.25}
        .pwa-head p{font-size:13px;color:#666;margin:0;line-height:1.35}
        .pwa-actions{display:flex;gap:10px}
        .pwa-actions button{
          flex:1;padding:11px 14px;
          border-radius:10px;border:none;
          font-size:14px;font-weight:600;cursor:pointer;
          font-family:inherit;
          transition:transform .15s, background .2s;
        }
        .pwa-actions button:active{transform:scale(.97)}
        .pwa-later{background:#f1f3f5;color:#555}
        .pwa-later:hover{background:#e8eaed}
        .pwa-install-btn{
          background:linear-gradient(135deg,#1b4332,#2d6a4f);
          color:#fff;
          box-shadow:0 4px 12px rgba(27,67,50,.2);
        }
        .pwa-install-btn:hover{box-shadow:0 6px 16px rgba(27,67,50,.3)}
        .pwa-ios-help{
          margin-top:12px;padding:10px 12px;
          background:#fff8e1;color:#7a5d00;
          border-radius:10px;font-size:12.5px;line-height:1.4;
          display:none;
        }
        .pwa-popup.ios-mode .pwa-ios-help{display:block}
        @media (prefers-color-scheme: dark) {
          .pwa-popup{background:#1a1a1a;color:#fff}
          .pwa-head h4{color:#fff}
          .pwa-head p{color:#aaa}
          .pwa-later{background:#2a2a2a;color:#ccc}
          .pwa-later:hover{background:#333}
        }
      `;
      document.head.appendChild(st);
    }

    // ─── Construction de la popup ───
    function buildPopup() {
      if (document.getElementById('pwa-popup')) return;
      injectStyles();

      const logo = (window.CONFIG?.business?.logo_text) || '🌿';
      const div = document.createElement('div');
      div.className = 'pwa-popup' + (isIOS ? ' ios-mode' : '');
      div.id = 'pwa-popup';
      div.innerHTML = `
        <button class="pwa-close" aria-label="Fermer" id="pwa-close-btn">×</button>
        <div class="pwa-head">
          <div class="pwa-icon">${logo}</div>
          <div>
            <h4>${cfg.titre || '📲 Installer l\'application'}</h4>
            <p>${cfg.sous_titre || 'Accède à Wassou en plein écran depuis ton téléphone'}</p>
          </div>
        </div>
        <div class="pwa-actions">
          <button class="pwa-later" id="pwa-later">${cfg.bouton_plus_tard || 'Plus tard'}</button>
          <button class="pwa-install-btn" id="pwa-install">${cfg.bouton_installer || 'Installer'}</button>
        </div>
        <div class="pwa-ios-help">
          <strong>📱 Sur iPhone :</strong> ${cfg.instructions_ios || "Touche 'Partager' puis 'Sur l'écran d'accueil'"}
        </div>
      `;
      document.body.appendChild(div);

      div.querySelector('#pwa-close-btn').addEventListener('click', dismiss);
      div.querySelector('#pwa-later').addEventListener('click', dismiss);
      div.querySelector('#pwa-install').addEventListener('click', install);

      requestAnimationFrame(() => div.classList.add('show'));
      console.log('[PWA] Popup affichée ✓');
    }

    async function install() {
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('[PWA] User choice:', outcome);
          if (outcome === 'accepted') hide();
          else dismiss();
          deferredPrompt = null;
        } catch (e) {
          console.warn('[PWA] Prompt error', e);
          dismiss();
        }
      } else if (isIOS) {
        // iOS ne supporte pas l'installation auto : on met en évidence les instructions
        const help = document.querySelector('.pwa-ios-help');
        if (help) {
          help.style.background = '#d1fae5';
          help.style.color = '#065f46';
          help.style.borderLeft = '4px solid #10b981';
        }
      } else {
        // Pas de deferredPrompt et pas iOS : fallback instructions générales
        alert("Pour installer l'application :\n\n• Sur Chrome : menu ⋮ → 'Installer l'application'\n• Sur Safari iOS : Partager → 'Sur l'écran d'accueil'");
        dismiss();
      }
    }

    function dismiss() {
      localStorage.setItem(KEY, Date.now().toString());
      hide();
    }

    function hide() {
      const p = document.getElementById('pwa-popup');
      if (p) {
        p.classList.remove('show');
        setTimeout(() => p.remove(), 450);
      }
    }

    // ─── Affichage après le délai configuré (3s par défaut) ───
    const delay = cfg.delai_avant_popup_ms || 3000;
    console.log(`[PWA] Popup programmée dans ${delay}ms`);

    function schedule() {
      setTimeout(() => {
        // Re-check standalone au cas où l'utilisateur installerait pendant l'attente
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;
        buildPopup();
      }, delay);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', schedule);
    } else {
      schedule();
    }

    // ─── Helper debug exposé : tester depuis la console ───
    window.PWAPopup = {
      show: buildPopup,
      hide: hide,
      reset: () => { localStorage.removeItem(KEY); console.log('[PWA] Cooldown réinitialisé. Recharge la page.'); },
      status: () => ({
        installed: standalone,
        dismissed_at: dismissedAt ? new Date(dismissedAt).toLocaleString() : 'jamais',
        ios: isIOS,
        android: isAndroid,
        has_native_prompt: !!deferredPrompt,
      }),
    };
  });
})();
