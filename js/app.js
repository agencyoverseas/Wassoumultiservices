// ============================================================
// WASSOU MULTISERVICES — APP LOGIC
// ============================================================

const App = {

  // ── Navigation active state ───────────────────────────────
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
    if (burger && sidebar) {
      burger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('show');
      });
      overlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
  },

  // ── Toast notifications ───────────────────────────────────
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
  formatMoney(n) {
    return (n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  },
  timeAgo(d) {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    return `Il y a ${days} jours`;
  },

  // ── Search/filter helper ──────────────────────────────────
  filterList(items, query, fields) {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(item => fields.some(f => (item[f] || '').toLowerCase().includes(q)));
  },

  // ── Render star rating ────────────────────────────────────
  stars(n) {
    return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  },

  // ── SMS template builder ──────────────────────────────────
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

  // ── Generate ID ───────────────────────────────────────────
  genId(prefix = 'x') {
    return prefix + Date.now() + Math.random().toString(36).slice(2, 6);
  },

  // ── Devis total ───────────────────────────────────────────
  devisTotal(services) {
    return services.reduce((s, l) => s + ((l.qty || 1) * (l.pu || 0)), 0);
  },

  // ── Export CSV ────────────────────────────────────────────
  exportCSV(data, filename) {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(';'), ...data.map(row => keys.map(k => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(';'))].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = filename;
    a.click();
  },

  // ── Print helper ─────────────────────────────────────────
  printSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Wassou</title><link rel="stylesheet" href="css/style.css"></head><body style="padding:2rem">${el.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  },

  // ── PWA Install Prompt ────────────────────────────────────
  initInstallPrompt() {
    let deferredPrompt = null;

    // Si déjà installée, ne rien faire
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      console.log('[PWA] App already installed');
      return;
    }

    // Capture l'événement (Chrome/Edge/Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('[PWA] beforeinstallprompt captured ✅');
      App.showInstallButton(deferredPrompt);
    });

    // Confirmation après installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed ✅');
      deferredPrompt = null;
      const banner = document.getElementById('install-banner');
      if (banner) banner.remove();
      App.toast('Application installée 🌿', 'success');
    });

    // iOS : pas de beforeinstallprompt → bannière manuelle
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandalone = window.navigator.standalone;
    if (isIOS && !isInStandalone) {
      setTimeout(() => App.showIOSInstallHint(), 3000);
    }
  },

  // ── Bouton/bannière "Installer l'app" ─────────────────────
  showInstallButton(deferredPrompt) {
    // Évite les doublons
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
      console.log('[PWA] User choice:', outcome);
      if (outcome === 'accepted') {
        App.toast('Merci ! Installation en cours…', 'success');
      }
      setTimeout(() => banner.remove(), 300);
    });

    document.getElementById('install-close').addEventListener('click', () => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
      // Mémoriser le refus pour 7 jours
      localStorage.setItem('wassou-install-dismissed', Date.now());
    });
  },

  // ── Hint d'installation iOS (Safari) ──────────────────────
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

};

// Auto-init nav + PWA install on every page
document.addEventListener('DOMContentLoaded', () => {
  App.initNav();
  App.initInstallPrompt();
});
