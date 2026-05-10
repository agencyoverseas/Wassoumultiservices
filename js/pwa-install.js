// ============================================================
//  WASSOU — Popup PWA install
//  iOS / Android / Desktop
// ============================================================

(function () {
  const KEY = (window.CONFIG?.avance?.storage_prefix || 'wassou_') + 'pwa_dismissed';
  const cfg = window.CONFIG?.pwa || {};
  if (!cfg.popup_active) return;

  // Si déjà installée, on s'arrête
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;

  // Si refusée récemment
  const dismissedAt = parseInt(localStorage.getItem(KEY) || '0');
  const cooldownMs = (cfg.refus_cooldown_jours || 7) * 24 * 60 * 60 * 1000;
  if (dismissedAt && Date.now() - dismissedAt < cooldownMs) return;

  let deferredPrompt = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Capture le prompt natif Android/Desktop
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  function buildPopup() {
    if (document.getElementById('pwa-popup')) return;
    const div = document.createElement('div');
    div.className = 'pwa-popup' + (isIOS ? ' ios-mode' : '');
    div.id = 'pwa-popup';
    div.innerHTML = `
      <button class="pwa-close" aria-label="Fermer" id="pwa-close-btn">×</button>
      <div class="pwa-head">
        <div class="pwa-icon">${CONFIG.business.logo_text || '🌿'}</div>
        <div>
          <h4>${cfg.titre || '📲 Installer l\'application'}</h4>
          <p>${cfg.sous_titre || 'Accède à Wassou en plein écran'}</p>
        </div>
      </div>
      <div class="pwa-actions">
        <button class="btn btn-ghost" id="pwa-later">${cfg.bouton_plus_tard || 'Plus tard'}</button>
        <button class="btn btn-primary" id="pwa-install">${cfg.bouton_installer || 'Installer'}</button>
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
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') { hide(); }
      else { dismiss(); }
      deferredPrompt = null;
    } else if (isIOS) {
      // Sur iOS, on ne peut pas auto-installer : on garde la popup ouverte avec les instructions visibles
      const help = document.querySelector('.pwa-ios-help');
      if (help) help.style.background = '#d1fae5';
    } else {
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
      setTimeout(() => p.remove(), 400);
    }
  }

  // Affiche après le délai configuré
  const delay = cfg.delai_avant_popup_ms || 3000;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(buildPopup, delay));
  } else {
    setTimeout(buildPopup, delay);
  }
})();
