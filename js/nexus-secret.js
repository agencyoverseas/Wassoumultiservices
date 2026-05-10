// ============================================================
//  🔧 NEXUSAI MAINTENANCE — Système caché du client v2
//  - Déclencheur : 6 clics/taps rapides sur le logo (mobile + desktop)
//  - Réinjectable après chargement dynamique de la sidebar
//  - Alertes silencieuses (push + Telegram + email)
//  - Surveillance crédits Anthropic
// ============================================================

(function() {
  'use strict';
  if (typeof CONFIG === 'undefined' || !CONFIG.nexus_maintenance) return;
  const NEXUS = CONFIG.nexus_maintenance;
  if (!NEXUS.active) return;

  const STORAGE_KEY = 'wassou_nexus_session';
  const LOG_KEY = 'wassou_nexus_alerts_log';

  // ============================================================
  //  DÉCLENCHEUR SECRET — 6 taps rapides (compatible mobile)
  // ============================================================
  let clickCount = 0;
  let firstClickTime = 0;
  const NB_REQUIRED = NEXUS.secret_unlock?.nb_clics || 6;
  const DELAI_MAX = NEXUS.secret_unlock?.delai_max_ms || 3000;

  function handleTap(e) {
    // Empêche le doublage click+touchend sur mobile
    if (e.type === 'touchend') {
      e.preventDefault();
    }
    const now = Date.now();
    if (clickCount === 0 || now - firstClickTime > DELAI_MAX) {
      clickCount = 1;
      firstClickTime = now;
    } else {
      clickCount++;
    }
    
    // Petit feedback visuel (vibration sur mobile)
    if (navigator.vibrate) navigator.vibrate(30);
    
    // Indicateur visuel discret après 3 clics
    const trigger = e.currentTarget;
    if (clickCount === 3) {
      trigger.style.transition = 'transform .15s';
      trigger.style.transform = 'scale(.96)';
      setTimeout(() => trigger.style.transform = '', 150);
    }
    if (clickCount === 5) {
      trigger.style.transform = 'scale(.92)';
      setTimeout(() => trigger.style.transform = '', 150);
    }
    
    if (clickCount >= NB_REQUIRED) {
      e.stopPropagation();
      clickCount = 0;
      if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
      promptNexusLogin();
    }
  }

  // Fonction (ré)appelable après injection dynamique de la sidebar
  function initNexusTrigger() {
    const triggers = document.querySelectorAll('#logo-trigger, .sidebar-logo');
    triggers.forEach(trigger => {
      if (trigger._nexusTriggerBound) return;
      trigger._nexusTriggerBound = true;
      
      // Click pour desktop
      trigger.addEventListener('click', handleTap);
      // touchend pour mobile (touch correctement détecté)
      trigger.addEventListener('touchend', handleTap, { passive: false });
      
      trigger.style.cursor = 'pointer';
      trigger.style.userSelect = 'none';
      trigger.style.webkitUserSelect = 'none';
      trigger.style.webkitTapHighlightColor = 'transparent';
    });
  }

  // Initial : DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNexusTrigger);
  } else {
    initNexusTrigger();
  }
  // Re-init après 1s (au cas où la sidebar est injectée plus tard)
  setTimeout(initNexusTrigger, 1000);
  setTimeout(initNexusTrigger, 2500);
  
  // Exposer pour appel après injection dynamique
  window.initNexusTrigger = initNexusTrigger;

  // ============================================================
  //  PROMPT DE LOGIN SECRET
  // ============================================================
  function promptNexusLogin() {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) {
      window.location.href = 'nexus-panel.html';
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'nexus-login-overlay';
    overlay.innerHTML = `
      <style>
        #nexus-login-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.85);
          z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          backdrop-filter: blur(8px);
          animation: nxFadeIn .25s ease;
        }
        @keyframes nxFadeIn { from { opacity: 0; } to { opacity: 1; } }
        #nexus-box {
          background: #0f172a;
          color: #fff;
          padding: 32px 28px;
          border-radius: 18px;
          width: 100%; max-width: 380px;
          border: 1px solid #334155;
          box-shadow: 0 30px 80px rgba(0,0,0,.6);
          animation: nxSlideUp .3s ease;
        }
        @keyframes nxSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        #nexus-box h2 { font-family: 'Sora',sans-serif; font-size: 1.2rem; margin: 0 0 4px; }
        #nexus-box .sub { color: #94a3b8; font-size: .85rem; margin-bottom: 20px; }
        #nexus-box .fg { margin-bottom: 14px; }
        #nexus-box label { display:block; font-size: .78rem; color: #94a3b8; margin-bottom: 6px; }
        #nexus-box input {
          width: 100%; padding: 12px 14px;
          background: #1e293b; color: #fff; border: 1.5px solid #334155;
          border-radius: 10px; font-size: 16px; box-sizing: border-box;
          font-family: inherit;
        }
        #nexus-box input:focus { outline: none; border-color: #06b6d4; }
        #nexus-box .err { color: #f87171; font-size: .82rem; margin-top: 10px; min-height: 18px; }
        #nexus-box .actions { display: flex; gap: 10px; margin-top: 18px; }
        #nexus-box button {
          flex: 1; padding: 12px; border-radius: 10px; border: 0; cursor: pointer;
          font-weight: 600; font-size: .92rem; font-family: inherit;
        }
        #nexus-box .btn-cancel { background: #334155; color: #cbd5e1; }
        #nexus-box .btn-go { background: #06b6d4; color: #0f172a; }
        #nexus-box .badge {
          display: inline-block; background: #06b6d4; color: #0f172a;
          font-size: .7rem; padding: 2px 8px; border-radius: 6px; font-weight: 700;
          margin-bottom: 8px;
        }
      </style>
      <div id="nexus-box">
        <span class="badge">🔧 ZONE TECHNIQUE</span>
        <h2>${NEXUS.agency_name}</h2>
        <p class="sub">Accès maintenance restreint</p>
        <div class="fg">
          <label>Identifiant</label>
          <input type="text" id="nx-login" autocomplete="off" autocapitalize="off" autofocus/>
        </div>
        <div class="fg">
          <label>Mot de passe</label>
          <input type="password" id="nx-pass" autocomplete="off"/>
        </div>
        <div class="err" id="nx-err"></div>
        <div class="actions">
          <button class="btn-cancel" onclick="document.getElementById('nexus-login-overlay').remove()">Annuler</button>
          <button class="btn-go" id="nx-submit">Connexion</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const submit = async () => {
      const login = document.getElementById('nx-login').value.trim();
      const pass = document.getElementById('nx-pass').value;
      const err = document.getElementById('nx-err');

      if (login !== NEXUS.secret_admin.login) {
        err.textContent = 'Identifiants invalides';
        return;
      }
      const hash = await Auth.sha256(pass);
      if (hash !== NEXUS.secret_admin.password_sha256) {
        err.textContent = 'Identifiants invalides';
        return;
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        login: NEXUS.secret_admin.login,
        connected_at: Date.now(),
        expires: Date.now() + 3600000
      }));
      overlay.remove();
      window.location.href = 'nexus-panel.html';
    };

    document.getElementById('nx-submit').addEventListener('click', submit);
    document.getElementById('nx-pass').addEventListener('keydown', e => {
      if (e.key === 'Enter') submit();
    });
  }

  // ============================================================
  //  GARDE DE PAGE — Pour nexus-panel.html
  // ============================================================
  window.NexusGuard = {
    require() {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) { window.location.href = 'dashboard-admin.html'; return null; }
      const s = JSON.parse(raw);
      if (Date.now() > s.expires) {
        sessionStorage.removeItem(STORAGE_KEY);
        window.location.href = 'dashboard-admin.html';
        return null;
      }
      return s;
    },
    logout() {
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = 'dashboard-admin.html';
    }
  };

  // ============================================================
  //  ALERTES TECHNIQUES
  // ============================================================
  window.NexusAlerts = {
    async send(level, title, message, data = {}) {
      const alert = {
        level, title, message, data,
        timestamp: new Date().toISOString(),
        site: 'wassou-multiservices',
        url: window.location.href,
      };
      this.log(alert);

      const silentNight = NEXUS.surveillance_credits?.mode_silencieux_nuit;
      if (silentNight?.active && level !== 'critical') {
        const now = new Date();
        const cur = now.getHours() * 60 + now.getMinutes();
        const debut = parseInt(silentNight.debut.split(':')[0]) * 60 + parseInt(silentNight.debut.split(':')[1]);
        const fin = parseInt(silentNight.fin.split(':')[0]) * 60 + parseInt(silentNight.fin.split(':')[1]);
        const isNight = (debut > fin) ? (cur >= debut || cur < fin) : (cur >= debut && cur < fin);
        if (isNight) {
          console.log('[NEXUS] Alerte différée (mode silencieux nuit):', alert);
          return;
        }
      }

      if (NEXUS.alertes_techniques?.push_notifications?.active) this.sendPush(level, title, message);
      if (NEXUS.alertes_techniques?.telegram?.active && NEXUS.alertes_techniques.telegram.bot_token) this.sendTelegram(level, title, message);
      if (NEXUS.alertes_techniques?.make_webhook) this.sendMakeWebhook(alert);
    },

    log(alert) {
      const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      logs.unshift(alert);
      if (logs.length > 100) logs.length = 100;
      localStorage.setItem(LOG_KEY, JSON.stringify(logs));
    },

    getLog() { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); },
    clearLog() { localStorage.removeItem(LOG_KEY); },

    async sendPush(level, title, message) {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;
      }
      const icons = { info: 'ℹ️', warning: '⚠️', urgent: '🟠', critical: '🔴' };
      try {
        new Notification(`${icons[level] || ''} ${title}`, {
          body: message,
          icon: 'icons/icon-192.png',
          badge: 'icons/icon-192.png',
          tag: 'nexus-' + level,
        });
      } catch(e) { console.warn('[NEXUS] Push fail:', e); }
    },

    async sendTelegram(level, title, message) {
      const tg = NEXUS.alertes_techniques.telegram;
      if (!tg.bot_token || !tg.chat_id) return;
      const icons = { info: 'ℹ️', warning: '⚠️', urgent: '🟠', critical: '🔴' };
      const text = `${icons[level] || ''} *${title}*\n\n${message}\n\n_Site: Wassou Multiservices_`;
      try {
        await fetch(`https://api.telegram.org/bot${tg.bot_token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: tg.chat_id, text, parse_mode: 'Markdown' })
        });
      } catch(e) { console.warn('[NEXUS] Telegram fail:', e); }
    },

    async sendMakeWebhook(alert) {
      const webhook = NEXUS.alertes_techniques?.make_webhook;
      if (!webhook) return;
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
      } catch(e) { console.warn('[NEXUS] Webhook fail:', e); }
    },
  };

  // ============================================================
  //  SURVEILLANCE CRÉDITS
  // ============================================================
  window.NexusCredits = {
    getStatus() {
      const data = JSON.parse(localStorage.getItem('wassou_anthropic_usage') || '{}');
      const budget = NEXUS.surveillance_credits.budget_mensuel_eur;
      const spent = data.month_spent_eur || 0;
      const remaining = Math.max(0, budget - spent);
      const pct = budget > 0 ? (remaining / budget) * 100 : 0;
      const seuils = NEXUS.surveillance_credits.seuils_alerte;
      let level = 'ok';
      if (pct < seuils.critique) level = 'critical';
      else if (pct < seuils.urgent) level = 'urgent';
      else if (pct < seuils.attention) level = 'warning';
      return { budget, spent, remaining, pct, level, last_update: data.last_update || null, details: data };
    },

    check() {
      const s = this.getStatus();
      const lastAlert = localStorage.getItem('wassou_nexus_last_credit_alert');
      const lastAlertLevel = lastAlert ? JSON.parse(lastAlert).level : null;
      const cooldown = 6 * 3600 * 1000;
      const lastTime = lastAlert ? JSON.parse(lastAlert).time : 0;
      if (lastAlertLevel === s.level && Date.now() - lastTime < cooldown) return;

      if (s.level === 'critical') {
        NexusAlerts.send('critical', '🛑 Crédits IA épuisés',
          `Solde Anthropic CRITIQUE (${s.remaining.toFixed(2)}€/${s.budget}€). Mode dégradé activé. Recharge: https://console.anthropic.com/settings/billing`);
        this.activateDegradedMode();
      } else if (s.level === 'urgent') {
        NexusAlerts.send('urgent', '⚠️ Crédits IA très bas',
          `Solde à ${s.pct.toFixed(0)}% (${s.remaining.toFixed(2)}€). Recharger sous 24h.`);
      } else if (s.level === 'warning') {
        NexusAlerts.send('warning', '🟡 Crédits IA en baisse',
          `Solde à ${s.pct.toFixed(0)}% (${s.remaining.toFixed(2)}€/${s.budget}€).`);
      }
      localStorage.setItem('wassou_nexus_last_credit_alert', JSON.stringify({ level: s.level, time: Date.now() }));
    },

    activateDegradedMode() { localStorage.setItem('wassou_ia_degraded', '1'); },
    deactivateDegradedMode() { localStorage.removeItem('wassou_ia_degraded'); },
    isDegraded() { return localStorage.getItem('wassou_ia_degraded') === '1'; }
  };

  // Auto-check
  setTimeout(() => { try { NexusCredits.check(); } catch(e) { console.warn(e); } }, 5000);
  setInterval(() => { try { NexusCredits.check(); } catch(e) { console.warn(e); } },
    (NEXUS.surveillance_credits?.check_frequency_minutes || 30) * 60 * 1000);

  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 5000);
  }

  console.log('[NEXUS] Maintenance system loaded ✓ (mobile-ready)');
})();
