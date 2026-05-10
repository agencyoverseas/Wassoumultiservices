// ============================================================
//  WASSOU — App.js (helpers UI communs)
// ============================================================

const App = (() => {

  // --- Toast ---
  function toast(msg, type = '', dur = 2800) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.className = 'toast ' + type;
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), dur);
  }

  // --- Modal ---
  function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('show'); }
  function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('show'); }

  // --- Format ---
  const fmtEur = n => {
    const sym = CONFIG.paiement.devise_symbole || '€';
    return (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + sym;
  };
  const fmtDate = d => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const fmtDateTime = d => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Sidebar mobile (back-office) ---
  function initSidebar() {
    const burger = document.getElementById('burger') || document.querySelector('.burger-btn');
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');
    if (burger && sidebar) {
      burger.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        if (overlay) overlay.classList.toggle('show');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar?.classList.remove('show');
        overlay.classList.remove('show');
      });
    }
    // Marquer le lien actif
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link.side').forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href === path || href === path.replace('.html', ''))) a.classList.add('active');
    });
  }

  // --- Pied de header utilisateur (sidebar back-office) ---
  function injectUserPill(session) {
    const slot = document.getElementById('user-pill-slot');
    if (slot && session) {
      slot.innerHTML = `
        <div class="user-pill">
          <span class="av">${session.avatar || '👤'}</span>
          <div class="meta">
            <span class="name">${session.nom || ''}</span>
            <span class="role">${session.role_label || session.role}</span>
          </div>
        </div>`;
    }
  }

  // --- Cacher éléments réservés à l'admin ---
  function applyRoleVisibility(session) {
    if (!session) return;
    document.querySelectorAll('[data-role]').forEach(el => {
      const need = el.dataset.role.split(',').map(s => s.trim());
      if (!need.includes(session.role)) el.style.display = 'none';
    });
  }

  // --- Branding from config ---
  function applyBranding() {
    const c = CONFIG.branding.couleurs;
    const r = document.documentElement;
    if (c.primary) r.style.setProperty('--g', c.primary);
    if (c.gold) r.style.setProperty('--gold', c.gold);
    document.title = (document.title.includes('—') ? document.title : `${document.title} — ${CONFIG.business.nom}`);
  }

  // --- Initialiser une page back-office ---
  function initAdminPage(allowedRoles = ['admin', 'agent']) {
    const session = Auth.requireAuth(allowedRoles);
    if (!session) return null;
    Data.seedDemoIfEmpty();
    document.addEventListener('DOMContentLoaded', () => {
      initSidebar();
      injectUserPill(session);
      applyRoleVisibility(session);
      applyBranding();
    });
    return session;
  }

  // --- Service Worker ---
  function registerSW() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  }

  // --- Confirmation native ---
  function confirmAction(msg) { return confirm(msg); }

  return {
    toast, openModal, closeModal,
    fmtEur, fmtDate, fmtDateTime,
    initSidebar, injectUserPill, applyRoleVisibility, applyBranding,
    initAdminPage, registerSW, confirmAction
  };
})();

if (typeof window !== 'undefined') window.App = App;
