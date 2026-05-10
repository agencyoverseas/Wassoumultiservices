// ============================================================
//  WASSOU — Couche données (localStorage)
//  Modèles : clients, interventions, devis, paiements, sms, rdvs
// ============================================================

const Data = (() => {
  const PRE = (window.CONFIG?.avance?.storage_prefix || 'wassou_');

  // --- Helpers ---
  function uid(prefix = '') { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function read(key) { try { return JSON.parse(localStorage.getItem(PRE + key) || '[]'); } catch { return []; } }
  function write(key, data) { localStorage.setItem(PRE + key, JSON.stringify(data)); }
  function readOne(key) { try { return JSON.parse(localStorage.getItem(PRE + key) || 'null'); } catch { return null; } }
  function writeOne(key, data) { localStorage.setItem(PRE + key, JSON.stringify(data)); }

  // --- CLIENTS ---
  const clients = {
    all() { return read('clients'); },
    get(id) { return this.all().find(c => c.id === id); },
    add(c) {
      const list = this.all();
      const item = { id: uid('cli-'), created: new Date().toISOString(), ...c };
      list.push(item); write('clients', list); return item;
    },
    update(id, patch) {
      const list = this.all();
      const i = list.findIndex(c => c.id === id);
      if (i >= 0) { list[i] = { ...list[i], ...patch, updated: new Date().toISOString() }; write('clients', list); return list[i]; }
      return null;
    },
    remove(id) { write('clients', this.all().filter(c => c.id !== id)); },
  };

  // --- INTERVENTIONS ---
  const interventions = {
    all() { return read('interventions'); },
    forAgent(agentId) { return this.all().filter(i => i.agent_id === agentId); },
    forClient(clientId) { return this.all().filter(i => i.client_id === clientId); },
    get(id) { return this.all().find(i => i.id === id); },
    add(i) {
      const list = this.all();
      const item = { id: uid('int-'), created: new Date().toISOString(), statut: 'planifié', ...i };
      list.push(item); write('interventions', list); return item;
    },
    update(id, patch) {
      const list = this.all();
      const idx = list.findIndex(i => i.id === id);
      if (idx >= 0) { list[idx] = { ...list[idx], ...patch, updated: new Date().toISOString() }; write('interventions', list); return list[idx]; }
      return null;
    },
    remove(id) { write('interventions', this.all().filter(i => i.id !== id)); },
  };

  // --- DEVIS ---
  const devis = {
    all() { return read('devis'); },
    forAgent(agentId) { return this.all().filter(d => d.agent_id === agentId); },
    forClient(clientId) { return this.all().filter(d => d.client_id === clientId); },
    get(id) { return this.all().find(d => d.id === id); },
    nextNumber() {
      const year = new Date().getFullYear();
      const list = this.all().filter(d => d.numero?.startsWith(`${CONFIG.devis.prefixe}-${year}`));
      const n = list.length + 1;
      return `${CONFIG.devis.prefixe}-${year}-${String(n).padStart(4, '0')}`;
    },
    add(d) {
      const list = this.all();
      const item = {
        id: uid('dev-'), numero: this.nextNumber(),
        date: new Date().toISOString().slice(0, 10),
        echeance: new Date(Date.now() + CONFIG.devis.duree_validite_jours * 86400000).toISOString().slice(0, 10),
        statut: 'brouillon', lignes: [], created: new Date().toISOString(),
        ...d
      };
      // Calculs auto
      item.total_ht = item.lignes.reduce((s, l) => s + (l.qte * l.prix), 0);
      item.tva = item.total_ht * (CONFIG.paiement.tva_taux / 100);
      item.total_ttc = item.total_ht + item.tva;
      item.acompte = Math.round(item.total_ttc * CONFIG.paiement.acompte_min_pct / 100 * 100) / 100;
      list.push(item); write('devis', list); return item;
    },
    update(id, patch) {
      const list = this.all();
      const i = list.findIndex(d => d.id === id);
      if (i < 0) return null;
      list[i] = { ...list[i], ...patch, updated: new Date().toISOString() };
      // Recalculs si lignes modifiées
      if (patch.lignes) {
        list[i].total_ht = patch.lignes.reduce((s, l) => s + (l.qte * l.prix), 0);
        list[i].tva = list[i].total_ht * (CONFIG.paiement.tva_taux / 100);
        list[i].total_ttc = list[i].total_ht + list[i].tva;
        list[i].acompte = Math.round(list[i].total_ttc * CONFIG.paiement.acompte_min_pct / 100 * 100) / 100;
      }
      write('devis', list); return list[i];
    },
    remove(id) { write('devis', this.all().filter(d => d.id !== id)); },
  };

  // --- PAIEMENTS ---
  const paiements = {
    all() { return read('paiements'); },
    forDevis(devisId) { return this.all().filter(p => p.devis_id === devisId); },
    forAgent(agentId) { return this.all().filter(p => p.agent_id === agentId); },
    add(p) {
      const list = this.all();
      const item = { id: uid('pay-'), date: new Date().toISOString(), statut: 'reçu', ...p };
      list.push(item); write('paiements', list); return item;
    },
    update(id, patch) {
      const list = this.all();
      const i = list.findIndex(p => p.id === id);
      if (i >= 0) { list[i] = { ...list[i], ...patch }; write('paiements', list); return list[i]; }
      return null;
    },
    remove(id) { write('paiements', this.all().filter(p => p.id !== id)); },
    totalForDevis(devisId) { return this.forDevis(devisId).reduce((s, p) => s + (p.montant || 0), 0); },
  };

  // --- SMS ---
  const sms = {
    all() { return read('sms'); },
    forClient(clientId) { return this.all().filter(s => s.client_id === clientId); },
    add(s) {
      const list = this.all();
      const item = { id: uid('sms-'), date: new Date().toISOString(), statut: 'envoyé', ...s };
      list.push(item); write('sms', list); return item;
    },
    remove(id) { write('sms', this.all().filter(s => s.id !== id)); },
  };

  // --- RDVs (demandes du formulaire public) ---
  const rdvs = {
    all() { return read('rdvs'); },
    add(r) {
      const list = this.all();
      const item = { id: uid('rdv-'), created: new Date().toISOString(), statut: 'à traiter', ...r };
      list.push(item); write('rdvs', list); return item;
    },
    update(id, patch) {
      const list = this.all();
      const i = list.findIndex(r => r.id === id);
      if (i >= 0) { list[i] = { ...list[i], ...patch }; write('rdvs', list); return list[i]; }
      return null;
    },
    remove(id) { write('rdvs', this.all().filter(r => r.id !== id)); },
  };

  // --- DEMO seed (1ère utilisation) ---
  function seedDemoIfEmpty() {
    if (clients.all().length === 0) {
      const c1 = clients.add({ nom: 'Dupont', prenom: 'Jean', tel: '0690 11 22 33', adresse: '12 Rue des Fleurs, Le Lamentin', email: 'jean.d@mail.fr' });
      const c2 = clients.add({ nom: 'Martin', prenom: 'Claire', tel: '0690 44 55 66', adresse: 'Lot. Bel Air, Sainte-Anne', email: 'claire.m@mail.fr' });
      const c3 = clients.add({ nom: 'Léger', prenom: 'Thomas', tel: '0690 77 88 99', adresse: 'Quartier Plaisance, Deshaies' });
      const ag = CONFIG.auth.agents[0]?.id;
      interventions.add({ client_id: c1.id, agent_id: ag, service: 'jardin', date: new Date().toISOString().slice(0,10), heure: '09:00', adresse: c1.adresse, statut: 'planifié' });
      interventions.add({ client_id: c2.id, agent_id: CONFIG.auth.agents[1]?.id || ag, service: 'karcher', date: new Date(Date.now()+86400000).toISOString().slice(0,10), heure: '14:00', adresse: c2.adresse, statut: 'planifié' });
    }
  }

  return { clients, interventions, devis, paiements, sms, rdvs, uid, seedDemoIfEmpty };
})();

if (typeof window !== 'undefined') window.Data = Data;
