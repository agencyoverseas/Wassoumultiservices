// ============================================================
//  WASSOU — DATA BRIDGE (adaptateur)
//  Unifie l'API "Data.xxx" attendue par devis.html / paiements.html
//  avec l'API "WassouDB.xxx" déjà en place dans data.js
//  → Charge ce fichier APRÈS data.js
// ============================================================

(function () {
  if (typeof WassouDB === 'undefined') {
    console.error('[DataBridge] WassouDB introuvable — vérifier ordre des scripts');
    return;
  }

  // Force le seed IMMÉDIATEMENT (au cas où DOMContentLoaded a déjà eu lieu)
  if (typeof WassouDB._seed === 'function') {
    try { WassouDB._seed(); } catch(e) { console.warn('[DataBridge] seed err:', e); }
  }

  // ── Mapping générique : ajoute all/get aux stores existants ─
  function wrap(store) {
    return {
      all: () => store.getAll(),
      get: (id) => store.getById(id),
      add: (item) => store.add(item),
      update: (id, patch) => store.update(id, patch),
      remove: (id) => store.delete(id),
      // Compatibilité descendante
      getAll: () => store.getAll(),
      getById: (id) => store.getById(id),
      delete: (id) => store.delete(id),
      save: (arr) => store.save(arr),
    };
  }

  // ── Store paiements dédié (clé wassou_paiements) ────────────
  function paiementsStore() {
    const key = 'wassou_paiements';
    const base = {
      getAll: () => JSON.parse(localStorage.getItem(key) || '[]'),
      save: (arr) => localStorage.setItem(key, JSON.stringify(arr)),
      getById: (id) => JSON.parse(localStorage.getItem(key) || '[]').find(x => x.id === id),
      add: (item) => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        item.id = item.id || 'p' + Date.now() + Math.random().toString(36).slice(2, 5);
        item.created = item.created || new Date().toISOString();
        arr.push(item);
        localStorage.setItem(key, JSON.stringify(arr));
        return item;
      },
      update: (id, patch) => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = arr.findIndex(x => x.id === id);
        if (idx !== -1) {
          arr[idx] = { ...arr[idx], ...patch };
          localStorage.setItem(key, JSON.stringify(arr));
        }
        return arr[idx];
      },
      delete: (id) => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]').filter(x => x.id !== id);
        localStorage.setItem(key, JSON.stringify(arr));
      },
    };
    return {
      ...wrap(base),
      forDevis: (devisId) => base.getAll().filter(p => p.devis_id === devisId),
      forClient: (clientId) => base.getAll().filter(p => p.client_id === clientId),
    };
  }

  // ── API Data globale ────────────────────────────────────────
  const Data = {
    clients: {
      ...wrap(WassouDB.clients),
    },
    agents: {
      ...wrap(WassouDB.agents),
    },
    interventions: {
      ...wrap(WassouDB.interventions),
      forClient: (cid) => WassouDB.interventions.getAll().filter(i => i.clientId === cid),
      forAgent: (aid) => WassouDB.interventions.getAll().filter(i => i.agentId === aid),
    },
    sms: {
      ...wrap(WassouDB.sms),
      forClient: (cid) => WassouDB.sms.getAll().filter(s => s.clientId === cid),
    },
    devis: {
      ...wrap(WassouDB.devis),
      forClient: (cid) => WassouDB.devis.getAll().filter(d => d.client_id === cid || d.clientId === cid),
      forAgent: (aid) => WassouDB.devis.getAll().filter(d => d.agent_id === aid || d.agentId === aid),
    },
    paiements: paiementsStore(),
  };

  if (typeof window !== 'undefined') window.Data = Data;
  console.log('[DataBridge] ✅ Data ↔ WassouDB unifié');
})();
