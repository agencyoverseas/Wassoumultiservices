// ============================================================
//  🔧 NEXUSAI MAINTENANCE — Système caché du client
//  - Déclencheur secret : 6 clics rapides sur le logo
//  - Alertes silencieuses techniques (push + Telegram + email)
//  - Surveillance crédits Anthropic
//  - Mode dégradé si crédit à 0
// ============================================================

(function() {
  'use strict';

  // Vérifier que CONFIG est chargé
  if (typeof CONFIG === 'undefined' || !CONFIG.nexus_maintenance) return;
  const NEXUS = CONFIG.nexus_maintenance;
  if (!NEXUS.active) return;

  const STORAGE_KEY = 'wassou_nexus_session';
  const LOG_KEY = 'wassou_nexus_alerts_log';

  // ============================================================
  //  DÉCLENCHEUR SECRET — 6 clics rapides sur le logo
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('logo-trigger') ||
                    document.querySelector('.sidebar-logo') ||
                    document.querySelector('.logo-icon');
    if (!trigger) return;

    let clickCount = 0;
    let firstClickTime = 0;
    const NB_REQUIRED = NEXUS.secret_unlock?.nb_clics || 6;
    const DELAI_MAX = NEXUS.secret_unlock?.delai_max_ms || 3000;

    trigger.addEventListener('click', (e) => {
      const now = Date.now();
      if (clickCount === 0 || now - firstClickTime > DELAI_MAX) {
        clickCount = 1;
        firstClickTime = now;
        return;
      }
      clickCount++;
      if (clickCount >= NB_REQUIRED) {
        e.preventDefault();
        e.stopPropagation();
        clickCount = 0;
        promptNexusLogin();
      }
    });
  });

  // ============================================================
  //  PROMPT DE LOGIN SECRET
  // ============================================================
  function promptNexusLogin() {
    // Vérifier si déjà loggé en NexusAI
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
        }
        #nexus-box {
          background: #0f172a;
          color: #fff;
          padding: 32px 28px;
          border-radius: 18px;
          width: 100%; max-width: 380px;
          border: 1px solid #334155;
          box-shadow: 0 30px 80px rgba(0,0,0,.6);
        }
        #nexus-box h2 { font-family: 'Sora',sans-serif; font-size: 1.2rem; margin: 0 0 4px; }
        #nexus-box .sub { color: #94a3b8; font-size: .85rem; margin-bottom: 20px; }
        #nexus-box .fg { margin-bottom: 14px; }
        #nexus-box label { display:block; font-size: .78rem; color: #94a3b8; margin-bottom: 6px; }
        #nexus-box input {
          width: 100%; padding: 12px 14px;
          background: #1e293b; color: #fff; border: 1.5px solid #334155;
          border-radius: 10px; font-size: 16px; box-sizing: border-box;
        }
        #nexus-box input:focus { outline: none; border-color: #06b6d4; }
        #nexus-box .err { color: #f87171; font-size: .82rem; margin-top: 10px; min-height: 18px; }
        #nexus-box .actions { display: flex; gap: 10px; margin-top: 18px; }
        #nexus-box button {
          flex: 1; padding: 12px; border-radius: 10px; border: 0; cursor: pointer;
          font-weight: 600; font-size: .92rem;
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
          <input type="text" id="nx-login" autocomplete="off" autofocus/>
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

      // Session de 1 heure
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
  //  ALERTES TECHNIQUES — Multi-canal silencieux
  // ============================================================
  window.NexusAlerts = {
    /**
     * Envoie une alerte technique vers TOUS les canaux configurés
     * @param {string} level - 'info' | 'warning' | 'urgent' | 'critical'
     * @param {string} title
     * @param {string} message
     * @param {object} [data] - Données supplémentaires
     */
    async send(level, title, message, data = {}) {
      const alert = {
        level, title, message, data,
        timestamp: new Date().toISOString(),
        site: 'wassou-multiservices',
        url: window.location.href,
      };

      // Logger localement
      this.log(alert);

      // Vérifier mode silencieux nuit
      const silentNight = NEXUS.surveillance_credits?.mode_silencieux_nuit;
      if (silentNight?.active && level !== 'critical') {
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes();
        const cur = h * 60 + m;
        const debut = parseInt(silentNight.debut.split(':')[0]) * 60 + parseInt(silentNight.debut.split(':')[1]);
        const fin = parseInt(silentNight.fin.split(':')[0]) * 60 + parseInt(silentNight.fin.split(':')[1]);
        const isNight = (debut > fin) ? (cur >= debut || cur < fin) : (cur >= debut && cur < fin);
        if (isNight) {
          console.log('[NEXUS] Alerte différée (mode silencieux nuit):', alert);
          return;
        }
      }

      // 1. Push notification PWA
      if (NEXUS.alertes_techniques?.push_notifications?.active) {
        this.sendPush(level, title, message);
      }

      // 2. Telegram
      if (NEXUS.alertes_techniques?.telegram?.active && NEXUS.alertes_techniques.telegram.bot_token) {
        this.sendTelegram(level, title, message);
      }

      // 3. Email via webhook
      if (NEXUS.alertes_techniques?.email?.active) {
        this.sendEmail(alert);
      }

      // 4. Webhook Make (relai)
      if (NEXUS.alertes_techniques?.make_webhook) {
        this.sendMakeWebhook(alert);
      }
    },

    log(alert) {
      const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      logs.unshift(alert);
      // Garder max 100 dernières alertes
      if (logs.length > 100) logs.length = 100;
      localStorage.setItem(LOG_KEY, JSON.stringify(logs));
    },

    getLog() {
      return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    },

    clearLog() {
      localStorage.removeItem(LOG_KEY);
    },

    // === PUSH NOTIFICATION ===
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
          silent: level === 'info',
        });
      } catch(e) { console.warn('[NEXUS] Push fail:', e); }
    },

    // === TELEGRAM ===
    async sendTelegram(level, title, message) {
      const tg = NEXUS.alertes_techniques.telegram;
      if (!tg.bot_token || !tg.chat_id) return;
      const icons = { info: 'ℹ️', warning: '⚠️', urgent: '🟠', critical: '🔴' };
      const text = `${icons[level] || ''} *${title}*\n\n${message}\n\n_Site: Wassou Multiservices_`;
      try {
        await fetch(`https://api.telegram.org/bot${tg.bot_token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tg.chat_id,
            text,
            parse_mode: 'Markdown'
          })
        });
      } catch(e) { console.warn('[NEXUS] Telegram fail:', e); }
    },

    // === EMAIL via webhook (Make orchestrera) ===
    async sendEmail(alert) {
      const webhook = NEXUS.alertes_techniques?.make_webhook;
      if (!webhook) return;
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'email', ...alert })
        });
      } catch(e) { console.warn('[NEXUS] Email fail:', e); }
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
  //  SURVEILLANCE CRÉDITS ANTHROPIC
  // ============================================================
  window.NexusCredits = {
    /**
     * Estime le crédit restant en se basant sur la conso locale + budget
     * NB : Pour la VRAIE conso, il faut un appel à l'API Anthropic depuis Make
     * (qui détient l'Admin API key). Cette fonction lit le résultat stocké.
     */
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

      return {
        budget, spent, remaining, pct, level,
        last_update: data.last_update || null,
        details: data,
      };
    },

    /**
     * Vérifie le statut et déclenche les alertes nécessaires
     * (à appeler après chaque mise à jour des données)
     */
    check() {
      const s = this.getStatus();
      const lastAlert = localStorage.getItem('wassou_nexus_last_credit_alert');
      const lastAlertLevel = lastAlert ? JSON.parse(lastAlert).level : null;

      // Ne pas re-spammer si même niveau d'alerte récent (< 6h)
      const cooldown = 6 * 3600 * 1000;
      const lastTime = lastAlert ? JSON.parse(lastAlert).time : 0;
      if (lastAlertLevel === s.level && Date.now() - lastTime < cooldown) return;

      if (s.level === 'critical') {
        NexusAlerts.send('critical',
          '🛑 Crédits IA épuisés',
          `Le solde Anthropic est CRITIQUE (${s.remaining.toFixed(2)}€ / ${s.budget}€). L'agent IA va passer en mode dégradé. Recharge urgente : https://console.anthropic.com/settings/billing`
        );
        this.activateDegradedMode();
      } else if (s.level === 'urgent') {
        NexusAlerts.send('urgent',
          '⚠️ Crédits IA très bas',
          `Solde Anthropic à ${s.pct.toFixed(0)}% (${s.remaining.toFixed(2)}€ restant). Recharger dans les 24h sinon l'agent s'arrêtera. https://console.anthropic.com/settings/billing`
        );
      } else if (s.level === 'warning') {
        NexusAlerts.send('warning',
          '🟡 Crédits IA en baisse',
          `Solde Anthropic à ${s.pct.toFixed(0)}% (${s.remaining.toFixed(2)}€ restant sur ${s.budget}€). Pense à recharger d'ici quelques jours.`
        );
      }

      localStorage.setItem('wassou_nexus_last_credit_alert', JSON.stringify({
        level: s.level,
        time: Date.now()
      }));
    },

    activateDegradedMode() {
      localStorage.setItem('wassou_ia_degraded', '1');
      // Le webhook Make détectera cela et passera en mode "réponse humaine"
    },

    deactivateDegradedMode() {
      localStorage.removeItem('wassou_ia_degraded');
    },

    isDegraded() {
      return localStorage.getItem('wassou_ia_degraded') === '1';
    }
  };

  // ============================================================
  //  AUTO-CHECK PÉRIODIQUE (toutes les 30 min)
  // ============================================================
  if (typeof window !== 'undefined') {
    // Check au chargement
    setTimeout(() => {
      try { NexusCredits.check(); } catch(e) { console.warn(e); }
    }, 5000);

    // Re-check toutes les 30 min
    setInterval(() => {
      try { NexusCredits.check(); } catch(e) { console.warn(e); }
    }, (NEXUS.surveillance_credits?.check_frequency_minutes || 30) * 60 * 1000);
  }

  // Demander permission notifications dès que possible
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 5000);
  }

  console.log('[NEXUS] Maintenance system loaded ✓');
})();
