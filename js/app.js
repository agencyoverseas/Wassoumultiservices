// ============================================================
// WASSOU MOBILE — APP CORE — v2 (séparation Admin/Agent)
// ============================================================

const App = {
  // ─── Icons SVG (reusable) ───
  icons: {
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    agent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3 11 0 14-15 14-15-2 2-7.5 2-11 4z"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    euro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12M4 14h9"/><path d="M19 6.41a8 8 0 1 0 0 11.18"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  },

  // ─── Header ───
  renderHeader(title, subtitle){
    const h = document.getElementById('header');
    if (!h) return;
    h.innerHTML = `
      <button class="burger" id="openDrawer" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <div class="header-titles">
        <h1 id="appLogo">${title}</h1>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
      </div>
      <button class="bell-btn" id="bellBtn" aria-label="Notifications">${this.icons.bell}<span class="dot"></span></button>
    `;
    document.getElementById('openDrawer')?.addEventListener('click', ()=>Drawer.open());
    document.getElementById('bellBtn')?.addEventListener('click', ()=>App.toast('Aucune nouvelle notification'));

    // NOTE: la redirection Nexus est maintenant gérée par nexus-secret.js
    // (qui binde sur #appLogo via #logo-trigger). On ne fait plus de redirect direct ici.
    document.getElementById('appLogo')?.setAttribute('id','appLogo');
    // Marquer le titre comme trigger Nexus (sans rediriger)
    const logoEl = document.getElementById('appLogo');
    if (logoEl) logoEl.id = 'logo-trigger';
  },

  // ─── Bottom nav (role-aware) ───
  renderNav(active){
    const session = Auth.getSession() || {};
    const role = session.role || 'admin';

    let items;
    if (role === 'agent') {
      // L'agent voit UNIQUEMENT son espace
      items = [
        {key:'agent-home', label:'Mon espace', href:'dashboard-agent.html', ic:this.icons.dashboard},
        {key:'interventions', label:'Interventions', href:'interventions.html', ic:this.icons.calendar},
        {key:'sms', label:'SMS', href:'sms.html', ic:this.icons.sms},
      ];
    } else {
      items = [
        {key:'dashboard', label:'Tableau de bord', href:'dashboard.html', ic:this.icons.dashboard},
        {key:'clients', label:'Clients', href:'clients.html', ic:this.icons.users},
        {key:'agents', label:'Agents', href:'agents.html', ic:this.icons.agent},
        {key:'interventions', label:'Interventions', href:'interventions.html', ic:this.icons.calendar},
        {key:'sms', label:'SMS', href:'sms.html', ic:this.icons.sms},
      ];
    }

    const html = `<nav class="bottom-nav">${items.map(it=>`
      <a href="${it.href}" class="bn-item ${active===it.key?'active':''}">
        ${it.ic}
        <div class="bn-label">${it.label}</div>
      </a>`).join('')}</nav>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  // ─── Toast ───
  toast(msg, type=''){
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{t.classList.remove('show'); setTimeout(()=>t.remove(),300)}, 2500);
  },

  // ─── Confirm ───
  confirm(msg){
    return new Promise(resolve => {
      const ov = document.createElement('div');
      ov.className = 'modal-overlay show';
      ov.innerHTML = `<div class="modal" style="max-width:340px;border-radius:18px;margin:auto">
        <div style="text-align:center;padding:8px 0 16px">
          <div style="font-size:38px;margin-bottom:8px">⚠️</div>
          <div style="font-size:15px;color:var(--text);line-height:1.4">${msg}</div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" data-r="0">Annuler</button>
          <button class="btn btn-danger" data-r="1">Confirmer</button>
        </div>
      </div>`;
      document.body.appendChild(ov);
      ov.addEventListener('click', e => {
        if (e.target.dataset.r !== undefined || e.target===ov){
          const r = e.target.dataset.r === '1';
          ov.remove();
          resolve(r);
        }
      });
    });
  },

  // ─── Modal ───
  modal(title, html, onSubmit){
    const ov = document.createElement('div');
    ov.className = 'modal-overlay show';
    ov.innerHTML = `<div class="modal">
      <div class="modal-head">
        <div class="modal-title">${title}</div>
        <button class="modal-close" data-close>×</button>
      </div>
      <div class="modal-body">${html}</div>
    </div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov.addEventListener('click', e => { if (e.target===ov || e.target.dataset.close!==undefined) close(); });
    if (onSubmit) {
      const form = ov.querySelector('form');
      if (form) form.addEventListener('submit', e => { e.preventDefault(); const ok = onSubmit(form, close); if (ok!==false) close(); });
    }
    return { close, el: ov };
  },

  // ─── Init page ───
  init(navKey, title, subtitle){
    if (!Auth.guard()) return false;
    this.renderHeader(title, subtitle);
    this.renderNav(navKey);
    PWAInstall.init();
    if (!document.querySelector('script[data-ptr]')) {
      const s = document.createElement('script');
      s.src = 'js/pull-refresh.js';
      s.dataset.ptr = '1';
      document.head.appendChild(s);
    }
    return true;
  }
};

// ============================================================
// DRAWER (menu latéral) — role-aware
// ============================================================
const Drawer = {
  ensureDOM(){
    if (document.getElementById('drawer')) return;
    const session = Auth.getSession() || {};
    const role = session.role || 'admin';

    // Liens selon rôle
    let linksHtml;
    if (role === 'agent') {
      linksHtml = `
        <a href="dashboard-agent.html" class="drawer-link"><span class="ic">🏠</span>Mon espace</a>
        <a href="interventions.html" class="drawer-link"><span class="ic">📅</span>Mes interventions</a>
        <a href="sms.html" class="drawer-link"><span class="ic">💬</span>SMS</a>
        <a href="parametres.html" class="drawer-link" style="display:none"></a>
      `;
    } else {
      linksHtml = `
        <a href="dashboard.html" class="drawer-link"><span class="ic">📊</span>Tableau de bord</a>
        <a href="clients.html" class="drawer-link"><span class="ic">👥</span>Clients</a>
        <a href="agents.html" class="drawer-link"><span class="ic">🧑‍🌾</span>Agents</a>
        <a href="interventions.html" class="drawer-link"><span class="ic">📅</span>Interventions</a>
        <a href="sms.html" class="drawer-link"><span class="ic">💬</span>SMS</a>
        <a href="devis.html" class="drawer-link"><span class="ic">📄</span>Devis</a>
        <a href="paiements.html" class="drawer-link"><span class="ic">💳</span>Paiements</a>
        <a href="carte-fidelite.html" class="drawer-link"><span class="ic">🎫</span>Carte Fidélité</a>
        <a href="rapports.html" class="drawer-link"><span class="ic">📈</span>Rapports</a>
        <a href="agent-ia.html" class="drawer-link"><span class="ic">🤖</span>Agent IA</a>
        <a href="parametres.html" class="drawer-link"><span class="ic">⚙️</span>Paramètres</a>
      `;
    }

    const subtitle = role === 'admin'
      ? 'Administrateur'
      : (session.nom || 'Agent');

    document.body.insertAdjacentHTML('beforeend', `
      <div class="overlay" id="drawerOverlay"></div>
      <aside class="drawer" id="drawer">
        <div class="drawer-head">
          <div class="drawer-logo">🌿</div>
          <div class="drawer-info">
            <h3>Wassou Multiservices</h3>
            <p>${subtitle}</p>
          </div>
        </div>
        <nav class="drawer-nav">
          ${linksHtml}
        </nav>
        <div class="drawer-foot">
          <button class="btn btn-outline btn-block" id="logoutBtn">↩ Déconnexion</button>
        </div>
      </aside>
    `);
    document.getElementById('drawerOverlay').addEventListener('click', ()=>this.close());
    document.getElementById('logoutBtn').addEventListener('click', ()=>{ Auth.logout(); });
    const cur = location.pathname.split('/').pop() || (role==='agent'?'dashboard-agent.html':'dashboard.html');
    document.querySelectorAll('.drawer-link').forEach(a => {
      if (a.getAttribute('href') === cur) a.classList.add('active');
    });
  },
  open(){ this.ensureDOM(); document.getElementById('drawer').classList.add('show'); document.getElementById('drawerOverlay').classList.add('show'); },
  close(){ document.getElementById('drawer')?.classList.remove('show'); document.getElementById('drawerOverlay')?.classList.remove('show'); }
};
