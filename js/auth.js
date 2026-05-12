// ============================================================
// WASSOU — AUTH (simple, localStorage) — v2 avec séparation rôles
// ============================================================
const Auth = {
  KEY: 'wm_session',

  // Pages réservées admin uniquement (agents = redirigés vers dashboard-agent.html)
  ADMIN_ONLY: [
    'dashboard.html','dashboard-admin.html',
    'clients.html','client-detail.html',
    'agents.html',
    'devis.html','devis-create.html','facture-view.html',
    'paiements.html',
    'rapports.html',
    'parametres.html',
    'carte-fidelite.html',
    'agent-ia.html',
    'nexus.html','nexus-panel.html',
  ],
  // Pages réservées agent uniquement
  AGENT_ONLY: ['dashboard-agent.html'],

  // SHA-256
  async sha256(txt){
    const buf = new TextEncoder().encode(txt);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  },

  // Comptes par défaut
  ACCOUNTS: {
    admins: [
      // mdp = "wassou2026"  →  SHA-256
      {id:'admin-1', nom:'Obrayan', login:'admin', password_sha256:'8d7d2216a1721c28d6a4b804ecf78ef3e2b2f50cbbb2429a92feebbe7e62d24c', avatar:'👨‍💼'},
    ],
    agents: [
      // PIN = "1234"
      {id:'agent-1', nom:'Démo Agent', pin_sha256:'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', avatar:'🧑‍🌾'},
      // PIN = "5678"
      {id:'agent-2', nom:'Rosine Kevin', pin_sha256:'f8638b979b2f4f793ddb6dbd197e0ee25a7a6ea32b0ae22f5e3c5d119d839e75', avatar:'🧑‍🌾'},
    ],
  },

  getSession(){
    try{
      const s = JSON.parse(localStorage.getItem(this.KEY) || 'null');
      if (!s) return null;
      if (s.expires && Date.now() > s.expires) { this.logout(false); return null; }
      return s;
    }catch(e){ return null; }
  },
  setSession(s){
    s.expires = Date.now() + 8*3600*1000;
    localStorage.setItem(this.KEY, JSON.stringify(s));
  },
  async loginAdmin(login, password){
    const hash = await this.sha256(password);
    const found = this.ACCOUNTS.admins.find(a => a.login===login && a.password_sha256===hash);
    if (!found) return false;
    this.setSession({id:found.id, nom:found.nom, role:'admin', avatar:found.avatar});
    return true;
  },
  async loginAgent(agentId, pin){
    const hash = await this.sha256(pin);
    const found = this.ACCOUNTS.agents.find(a => a.id===agentId && a.pin_sha256===hash);
    if (!found) return false;
    this.setSession({id:found.id, nom:found.nom, role:'agent', avatar:found.avatar});
    return true;
  },
  logout(redirect=true){
    localStorage.removeItem(this.KEY);
    if (redirect) location.href = 'login.html';
  },

  // Page d'accueil selon rôle
  homePage(role){
    return role === 'agent' ? 'dashboard-agent.html' : 'dashboard.html';
  },

  // Vérifie l'accès, sinon redirige (login ou page autorisée selon rôle)
  guard(){
    const s = this.getSession();
    if (!s) { location.replace('login.html'); return false; }

    // Vérif rôle vs page courante
    const page = (location.pathname.split('/').pop() || '').toLowerCase();
    if (s.role === 'agent' && this.ADMIN_ONLY.includes(page)) {
      location.replace('dashboard-agent.html');
      return false;
    }
    if (s.role === 'admin' && this.AGENT_ONLY.includes(page)) {
      location.replace('dashboard.html');
      return false;
    }
    return s;
  },
};

// ============================================================
// POPUP "INSTALLER WASSOU" — fidèle aux captures
// ============================================================
const PWAInstall = {
  KEY: 'wm_pwa_dismissed',
  COOLDOWN_DAYS: 7,
  inited: false,

  init(){
    if (this.inited) return;
    this.inited = true;
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;
    const dismissed = parseInt(localStorage.getItem(this.KEY) || '0');
    if (dismissed && Date.now() - dismissed < this.COOLDOWN_DAYS * 24*3600*1000) return;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferred = e;
    });
    setTimeout(() => this.show(), 3000);
  },

  show(){
    if (document.getElementById('installBanner')) return;
    const div = document.createElement('div');
    div.id = 'installBanner';
    div.className = 'install-banner';
    div.innerHTML = `
      <button class="install-close" aria-label="Fermer">×</button>
      <div class="leaf">${App.icons.leaf}</div>
      <div class="install-content">
        <h3>Installer Wassou</h3>
        <p>Ajoutez l'app sur votre téléphone pour un accès rapide hors-ligne.</p>
        <button class="install-btn" id="installBtn">${App.icons.download} Installer</button>
      </div>
    `;
    document.body.appendChild(div);
    requestAnimationFrame(()=>div.classList.add('show'));
    div.querySelector('.install-close').addEventListener('click', () => this.dismiss());
    div.querySelector('#installBtn').addEventListener('click', () => this.install());
  },

  async install(){
    if (this.deferred){
      this.deferred.prompt();
      const { outcome } = await this.deferred.userChoice;
      if (outcome === 'accepted') this.hide();
      else this.dismiss();
      this.deferred = null;
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS){ App.toast("Sur iPhone : Touche 'Partager' puis 'Sur l'écran d'accueil'"); }
      else { App.toast("Pour installer : menu navigateur → Ajouter à l'écran d'accueil"); }
    }
  },

  dismiss(){
    localStorage.setItem(this.KEY, Date.now().toString());
    this.hide();
  },

  hide(){
    const b = document.getElementById('installBanner');
    if (b){ b.classList.remove('show'); setTimeout(()=>b.remove(), 350); }
  }
};

// ============================================================
// AUTO-LOADER POPUP PWA
// ============================================================
(function loadPwaInstallScript() {
  if (document.querySelector('script[data-pwa-loader]')) return;
  const path = location.pathname;
  const inSubdir = path.split('/').filter(Boolean).length > 1
    && !path.endsWith('.html')
    && !/\.[a-z]+$/.test(path.split('/').pop() || '');
  const base = inSubdir ? '../js/' : 'js/';
  const s = document.createElement('script');
  s.src = base + 'pwa-install.js';
  s.async = true;
  s.setAttribute('data-pwa-loader', '1');
  s.onerror = () => console.warn('[PWA] pwa-install.js introuvable.');
  (document.head || document.documentElement).appendChild(s);
})();
