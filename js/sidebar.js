// ============================================================
//  WASSOU — Sidebar partagée (injectée dans toutes les pages)
//  Évite de dupliquer le HTML sur chaque page back-office.
// ============================================================

const Sidebar = (() => {

  function build(currentPage = '') {
    const session = Auth.getSession();
    if (!session) return '';
    const isAdmin = session.role === 'admin';
    const userPill = `
      <div class="user-pill">
        <span class="av">${session.avatar || '👤'}</span>
        <div class="meta">
          <span class="name">${session.nom || ''}</span>
          <span class="role">${session.role_label || session.role}</span>
        </div>
      </div>`;

    const adminLinks = `
      <div class="nav-section-title">Principal</div>
      <a href="dashboard-admin.html" class="nav-link side ${currentPage==='dashboard'?'active':''}"><span class="nav-icon">📊</span> Tableau de bord</a>
      <a href="clients.html" class="nav-link side ${currentPage==='clients'?'active':''}"><span class="nav-icon">👥</span> Clients</a>
      <a href="agents.html" class="nav-link side ${currentPage==='agents'?'active':''}"><span class="nav-icon">🧑‍🌾</span> Agents</a>
      <a href="interventions.html" class="nav-link side ${currentPage==='interventions'?'active':''}"><span class="nav-icon">📅</span> Interventions</a>
      <div class="nav-section-title">Outils</div>
      <a href="sms.html" class="nav-link side ${currentPage==='sms'?'active':''}"><span class="nav-icon">💬</span> SMS</a>
      <a href="devis.html" class="nav-link side ${currentPage==='devis'?'active':''}"><span class="nav-icon">📄</span> Devis & Factures</a>
      <a href="paiements.html" class="nav-link side ${currentPage==='paiements'?'active':''}"><span class="nav-icon">💳</span> Paiements</a>
      <a href="rapports.html" class="nav-link side ${currentPage==='rapports'?'active':''}"><span class="nav-icon">📈</span> Rapports</a>
      <div class="nav-section-title">Configuration</div>
      <a href="parametres.html" class="nav-link side ${currentPage==='parametres'?'active':''}"><span class="nav-icon">⚙️</span> Paramètres</a>`;

    const agentLinks = `
      <div class="nav-section-title">Mon espace</div>
      <a href="dashboard-agent.html" class="nav-link side ${currentPage==='dashboard'?'active':''}"><span class="nav-icon">🏠</span> Accueil</a>
      <a href="interventions.html" class="nav-link side ${currentPage==='interventions'?'active':''}"><span class="nav-icon">📅</span> Mes interventions</a>
      <a href="clients.html" class="nav-link side ${currentPage==='clients'?'active':''}"><span class="nav-icon">👥</span> Mes clients</a>
      <a href="devis.html" class="nav-link side ${currentPage==='devis'?'active':''}"><span class="nav-icon">📄</span> Mes devis</a>
      <a href="paiements.html" class="nav-link side ${currentPage==='paiements'?'active':''}"><span class="nav-icon">💳</span> Encaissements</a>
      <a href="sms.html" class="nav-link side ${currentPage==='sms'?'active':''}"><span class="nav-icon">💬</span> SMS</a>`;

    return `
      <div class="sidebar-logo">
        <div class="logo-row">
          <span class="logo-icon">${CONFIG.business.logo_text || '🌿'}</span>
          <span class="logo-name">${CONFIG.business.nom.split(' ')[0]}</span>
        </div>
        <span class="logo-sub">${isAdmin ? 'Admin' : 'Agent'} — ${CONFIG.business.zone}</span>
      </div>
      ${userPill}
      <div class="nav-section">
        ${isAdmin ? adminLinks : agentLinks}
      </div>
      <div class="sidebar-footer">
        <a href="index.html" target="_blank">🌐 Site public</a>
        <a href="#" class="logout-btn" onclick="Auth.logout();return false">🚪 Déconnexion</a>
      </div>`;
  }

  function inject(currentPage) {
    const sb = document.getElementById('sidebar');
    if (sb) sb.innerHTML = build(currentPage);
  }

  return { build, inject };
})();

if (typeof window !== 'undefined') window.Sidebar = Sidebar;
