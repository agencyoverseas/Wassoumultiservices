// ============================================================
//  WASSOU — SIDEBAR v3.0
//  - Mode menu hamburger desktop (sidebar cachée par défaut)
//  - Bouton déconnexion FAB sur toutes les pages
//  - Auto-fermeture au clic sur un lien
// ============================================================
const Sidebar = {
  inject(active = '') {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // FORCER le mode menu (sidebar cachée même sur desktop)
    document.body.classList.add('menu-mode');

    const session = window.Auth?.getSession?.();
    const role = session?.role || 'admin';

    const linksAdmin = [
      { id: 'dashboard', href: 'dashboard-admin.html', icon: '📊', label: 'Tableau de bord' },
      { id: 'clients', href: 'clients.html', icon: '👥', label: 'Clients' },
      { id: 'agents', href: 'agents.html', icon: '🧑‍🌾', label: 'Agents' },
      { id: 'interventions', href: 'interventions.html', icon: '📅', label: 'Interventions' },
      { sep: 'Outils' },
      { id: 'agent-ia', href: 'agent-ia.html', icon: '🤖', label: 'Agent IA' },
      { id: 'sms', href: 'sms.html', icon: '💬', label: 'SMS' },
      { id: 'devis', href: 'devis.html', icon: '📄', label: 'Devis & Factures' },
      { id: 'paiements', href: 'paiements.html', icon: '💳', label: 'Paiements' },
      { id: 'rapports', href: 'rapports.html', icon: '📈', label: 'Rapports' },
      { sep: 'Configuration' },
      { id: 'parametres', href: 'parametres.html', icon: '⚙️', label: 'Paramètres' },
    ];

    const linksAgent = [
      { id: 'dashboard-agent', href: 'dashboard-agent.html', icon: '🏠', label: 'Accueil' },
    ];

    const links = role === 'agent' ? linksAgent : linksAdmin;

    let html = `
      <div class="sidebar-logo" id="logo-trigger" style="cursor:pointer">
        <span class="logo-icon">🌿</span>
        <span class="logo-name">Wassou</span>
        <span class="logo-sub">${role === 'admin' ? 'Admin' : 'Agent'} — Guadeloupe</span>
      </div>
      <div id="user-pill-slot"></div>
      <div class="nav-section">
    `;

    links.forEach(l => {
      if (l.sep) {
        html += `<div class="nav-section-title">${l.sep}</div>`;
      } else {
        const isActive = (active === l.id) ? ' active' : '';
        html += `<a href="${l.href}" class="nav-link${isActive}"><span class="nav-icon">${l.icon}</span> ${l.label}</a>`;
      }
    });

    html += `
      </div>
      <div class="sidebar-footer">
        <a href="#" class="logout-btn" onclick="if(window.Auth&&Auth.logout){Auth.logout()}else{localStorage.removeItem('wassou_session');location.href='login.html'}return false">🚪 Déconnexion</a>
      </div>
    `;

    sidebar.innerHTML = html;

    // Pill utilisateur
    if (session) {
      const slot = document.getElementById('user-pill-slot');
      if (slot) {
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

    // Active le toggle burger
    Sidebar._bindBurger();

    // Injecte le FAB déconnexion sur toutes les pages
    Sidebar._injectLogoutFab();

    // Trigger Nexus (6 clics)
    if (typeof window.initNexusTrigger === 'function') {
      window.initNexusTrigger();
    }
  },

  _bindBurger() {
    const burger = document.getElementById('burger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (!burger || !sidebar) return;
    if (burger._appNavBound) return; // app.js l'a déjà fait
    burger._appNavBound = true;

    burger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('show');
    });
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay?.classList.remove('show');
    });
    // Fermer la sidebar après un clic sur un lien
    sidebar.querySelectorAll('.nav-link, .logout-btn').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay?.classList.remove('show');
      });
    });

    // ESC pour fermer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        sidebar.classList.remove('open');
        overlay?.classList.remove('show');
      }
    });
  },

  _injectLogoutFab() {
    if (document.querySelector('.logout-fab')) return;
    const btn = document.createElement('button');
    btn.className = 'logout-fab';
    btn.title = 'Déconnexion';
    btn.innerHTML = '🚪';
    btn.onclick = () => {
      if (confirm('Se déconnecter ?')) {
        if (window.Auth && Auth.logout) {
          Auth.logout();
        } else {
          localStorage.removeItem('wassou_session');
          location.href = 'login.html';
        }
      }
    };
    document.body.appendChild(btn);
  }
};

if (typeof window !== 'undefined') window.Sidebar = Sidebar;

// Auto-inject sur les pages qui n'appellent pas Sidebar.inject() explicitement
document.addEventListener('DOMContentLoaded', () => {
  // Mode menu forcé (FAB visible + hamburger desktop)
  document.body.classList.add('menu-mode');
  // FAB déconnexion injecté même si Sidebar.inject() pas appelé
  setTimeout(() => Sidebar._injectLogoutFab(), 100);
});
