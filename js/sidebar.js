// ============================================================
//  WASSOU — SIDEBAR INJECTABLE (partagée par toutes les pages)
// ============================================================
const Sidebar = {
  inject(active = '') {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const session = window.Auth?.getSession?.();
    const role = session?.role || 'admin';

    // Liens selon le rôle
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

    let lastSep = false;
    links.forEach(l => {
      if (l.sep) {
        html += `<div class="nav-section-title">${l.sep}</div>`;
        lastSep = true;
      } else {
        const isActive = (active === l.id) ? ' active' : '';
        html += `<a href="${l.href}" class="nav-link${isActive}"><span class="nav-icon">${l.icon}</span> ${l.label}</a>`;
        lastSep = false;
      }
    });

    html += `
      </div>
      <div class="sidebar-footer">
        <a href="#" class="logout-btn" onclick="Auth.logout();return false">🚪 Déconnexion</a>
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

    // Réactiver le toggle burger après injection
    const burger = document.getElementById('burger');
    const overlay = document.getElementById('overlay');
    if (burger && !burger._sidebarBound) {
      burger._sidebarBound = true;
      burger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('show');
      });
      overlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay?.classList.remove('show');
      });
      sidebar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 900) {
            sidebar.classList.remove('open');
            overlay?.classList.remove('show');
          }
        });
      });
    }

    // Réinitialiser le déclencheur des 6 clics NexusAI après injection
    if (typeof window.initNexusTrigger === 'function') {
      window.initNexusTrigger();
    }
  }
};

if (typeof window !== 'undefined') window.Sidebar = Sidebar;
