// ============================================================
//  WASSOU — Système d'authentification
//  - Login admin (id + mot de passe SHA-256)
//  - PIN agent (4 chiffres SHA-256)
//  - Sessions avec expiration absolue + inactivité
// ============================================================

const Auth = (() => {

  const SESSION_KEY = (window.CONFIG?.avance?.storage_prefix || 'wassou_') + 'session';

  // --- SHA-256 (Web Crypto API natif, pas de lib externe) ---
  async function sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // --- Session ---
  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      const now = Date.now();
      // Expiration absolue
      if (now > s.expires) { clearSession(); return null; }
      // Expiration inactivité
      const inactivityMs = (CONFIG.auth.session_inactivity_minutes || 30) * 60 * 1000;
      if (now - s.lastActive > inactivityMs) { clearSession(); return null; }
      return s;
    } catch (e) { return null; }
  }

  function saveSession(role, user) {
    const durationMs = (CONFIG.auth.session_duree_heures || 8) * 60 * 60 * 1000;
    const session = {
      role,                        // 'admin' | 'agent'
      user_id: user.id,
      nom: user.nom,
      avatar: user.avatar,
      role_label: user.role || (role === 'admin' ? 'Administrateur' : 'Agent'),
      created: Date.now(),
      lastActive: Date.now(),
      expires: Date.now() + durationMs,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function refreshActivity() {
    const s = getSession();
    if (s) {
      s.lastActive = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // --- Login ---
  async function loginAdmin(loginId, password) {
    const admin = CONFIG.auth.admins.find(a => a.login === loginId);
    if (!admin) return { ok: false, error: "Identifiant inconnu" };
    const hash = await sha256(password);
    if (hash !== admin.password_sha256) return { ok: false, error: "Mot de passe incorrect" };
    const session = saveSession('admin', admin);
    return { ok: true, session };
  }

  async function loginAgent(agentId, pin) {
    const agent = CONFIG.auth.agents.find(a => a.id === agentId && a.actif !== false);
    if (!agent) return { ok: false, error: "Agent introuvable" };
    const hash = await sha256(pin);
    if (hash !== agent.pin_sha256) return { ok: false, error: "PIN incorrect" };
    const session = saveSession('agent', agent);
    return { ok: true, session };
  }

  function logout() {
    clearSession();
    window.location.href = CONFIG.auth.redirect_logout || 'login.html';
  }

  // --- Garde de page : appelle au début de chaque page protégée ---
  function requireAuth(allowedRoles = ['admin', 'agent']) {
    const s = getSession();
    if (!s) {
      window.location.href = CONFIG.auth.redirect_logout || 'login.html';
      return null;
    }
    if (!allowedRoles.includes(s.role)) {
      // Pas le bon rôle → redirige vers son propre dashboard
      const target = CONFIG.auth.redirect_after_login[s.role] || 'login.html';
      window.location.href = target;
      return null;
    }
    refreshActivity();
    return s;
  }

  // Helper rôle
  function isAdmin() { const s = getSession(); return s?.role === 'admin'; }
  function isAgent() { const s = getSession(); return s?.role === 'agent'; }
  function currentUserId() { return getSession()?.user_id || null; }

  // Track activité utilisateur (refresh session)
  if (typeof window !== 'undefined') {
    let lastRefresh = 0;
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(ev => {
      window.addEventListener(ev, () => {
        const now = Date.now();
        if (now - lastRefresh > 60000) { // max 1 fois par minute
          refreshActivity();
          lastRefresh = now;
        }
      }, { passive: true });
    });
  }

  return {
    sha256, getSession, saveSession, clearSession,
    loginAdmin, loginAgent, logout, requireAuth,
    isAdmin, isAgent, currentUserId
  };
})();

if (typeof window !== 'undefined') window.Auth = Auth;
