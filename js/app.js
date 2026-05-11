// ============================================================
//  WASSOU MULTISERVICES — APP LOGIC v2.1
//  - Navigation
//  - Toasts + Confirms
//  - Helpers (date, money, etc.)
//  - PWA install (Android + iOS)
//  - Anti-zoom (pinch-zoom désactivé)
//  - Auth helpers pour pages protégées
// ============================================================

const App = {

  // ── Navigation : highlight de la page active ──────────────
  initNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });

    // Mobile sidebar toggle
    const burger = document.getElementById('burger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (burger && sidebar && !burger._appNavBound) {
      burger._appNavBound = true;
      burger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('show');
      });
      overlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
      // Fermer la sidebar quand on clique un lien (mobile)
      sidebar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 900) {
            sidebar.classList.remove('open');
            overlay?.classList.remove('show');
          }
        });
      });
    }

    // Filtrer liens selon le rôle (data-role="admin")
    const session = window.Auth?.getSession?.();
    if (session) {
      document.querySelectorAll('[data-role]').forEach(el => {
        const required = el.dataset.role;
        if (required && session.role !== required) {
          el.style.display = 'none';
        }
      });
      // Afficher le pill utilisateur connecté
      const slot = document.getElementById('user-pill-slot');
      if (slot && !slot.innerHTML.trim()) {
        slot.innerHTML = `
          <div class="user-pill">
            <div class="av">${session.avatar || '👤'}</div>
            <div class="info">
              <strong>${session.nom || 'Utilisateur'}</strong>
              <small>${session.role_label || session.role}</small>
            </div>
          </div>
        `;
      }
    }
  },

  // ── Page protégée : initialisation auth ──────────────────
  initAdminPage(allowedRoles = ['admin', 'agent']) {
    if (typeof Auth === 'undefined') return null;
    const session = Auth.requireAuth(allowedRoles);
    if (!session) return null;
    return session;
  },

  // ── Toast notifications ──────────────────────────────────
  toast(msg, type = 'success') {
    const container = document.getElementById('toasts') || (() => {
      const d = document.createElement('div');
      d.id = 'toasts';
      document.body.appendChild(d);
      return d;
    })();
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
  },

  // ── Confirm modal ─────────────────────────────────────────
  confirm(msg, cb) {
    const modal = document.getElementById('confirmModal');
    if (!modal) { if (window.confirm(msg)) cb(); return; }
    modal.querySelector('.confirm-msg').textContent = msg;
    modal.style.display = 'flex';
    modal.querySelector('.btn-confirm').onclick = () => { modal.style.display = 'none'; cb(); };
    modal.querySelector('.btn-cancel').onclick = () => { modal.style.display = 'none'; };
  },

  // ── Format helpers ────────────────────────────────────────
  formatDate(d) {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },
  fmtDate(d) { return App.formatDate(d); },
  formatMoney(n) {
    return (n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  },
  fmtEur(n) { return App.formatMoney(n); },
  timeAgo(d) {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    return `Il y a ${days} jours`;
  },

  filterList(items, query, fields) {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(item => fields.some(f => (item[f] || '').toLowerCase().includes(q)));
  },

  stars(n) {
    return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  },

  smsTemplate(type, data = {}) {
    const templates = {
      confirmation: `Bonjour ${data.prenom || ''}, votre RDV Wassou est confirmé le ${data.date || ''} à ${data.heure || ''}. À bientôt ! 🌿`,
      rappel: `Rappel Wassou : votre intervention est demain ${data.date || ''} à ${data.heure || ''}. Notre équipe sera à l'heure ! 📅`,
      devis: `Bonjour ${data.prenom || ''}, votre devis Wassou N°${data.numero || ''} est disponible. Montant : ${data.montant || ''}€. Valide 15j. 📄`,
      remerciement: `Merci ${data.prenom || ''} pour votre confiance ! Votre satisfaction est notre priorité. N'hésitez pas à nous recommander 🌱`,
      custom: '',
    };
    return templates[type] || '';
  },

  genId(prefix = 'x') {
    return prefix + Date.now() + Math.random().toString(36).slice(2, 6);
  },

  devisTotal(services) {
    return services.reduce((s, l) => s + ((l.qty || 1) * (l.pu || 0)), 0);
  },

  exportCSV(data, filename) {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(';'), ...data.map(row => keys.map(k => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(';'))].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = filename;
    a.click();
  },

  printSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Wassou</title><link rel="stylesheet" href="css/style.css"></head><body style="padding:2rem">${el.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  },

  // ============================================================
  //  📲 PWA INSTALL — Android + iOS
  // ============================================================
  initInstallPrompt() {
    let deferredPrompt = null;

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      console.log('[PWA] App already installed');
      return;
    }

    const dismissed = localStorage.getItem('wassou-install-dismissed');
    if (dismissed) {
      const days = (Date.now() - parseInt(dismissed)) / 86400000;
      if (days < 7) return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('[PWA] beforeinstallprompt captured ✅');
      setTimeout(() => App.showInstallButton(deferredPrompt), 2000);
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      const banner = document.getElementById('install-banner');
      if (banner) banner.remove();
      App.toast('Application installée 🌿', 'success');
    });

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !window.navigator.standalone) {
      setTimeout(() => App.showIOSInstallHint(), 3000);
    }
  },

  showInstallButton(deferredPrompt) {
    if (document.getElementById('install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML = `
      <div class="install-banner-inner">
        <span class="install-icon">📲</span>
        <div class="install-text">
          <strong>Installer Wassou</strong>
          <small>Accès rapide depuis votre écran d'accueil</small>
        </div>
        <button id="install-btn" class="btn btn-primary btn-sm">Installer</button>
        <button id="install-close" aria-label="Fermer">×</button>
      </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('show'), 100);

    document.getElementById('install-btn').addEventListener('click', async () => {
      banner.classList.remove('show');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        App.toast('Merci ! Installation en cours…', 'success');
      }
      setTimeout(() => banner.remove(), 300);
    });

    document.getElementById('install-close').addEventListener('click', () => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
      localStorage.setItem('wassou-install-dismissed', Date.now());
    });
  },

  showIOSInstallHint() {
    if (localStorage.getItem('wassou-ios-hint-dismissed')) return;
    if (document.getElementById('install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML = `
      <div class="install-banner-inner">
        <span class="install-icon">📲</span>
        <div class="install-text">
          <strong>Installer Wassou sur iPhone</strong>
          <small>Appuyez sur <b>Partager</b> ⬆️ puis <b>Sur l'écran d'accueil</b></small>
        </div>
        <button id="install-close" aria-label="Fermer">×</button>
      </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('show'), 100);

    document.getElementById('install-close').addEventListener('click', () => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
      localStorage.setItem('wassou-ios-hint-dismissed', '1');
    });
  },

  // ============================================================
  //  🚫 Anti-zoom : pinch-zoom + double-tap zoom désactivés
  // ============================================================
  initAntiZoom() {
    document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  },

};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  App.initNav();
  App.initInstallPrompt();
  App.initAntiZoom();
});

if (typeof window !== 'undefined') window.App = App;
