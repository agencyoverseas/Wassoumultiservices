// ============================================================
// WASSOU MULTISERVICES — DATA LAYER (localStorage)
// ============================================================

const WassouDB = {

  // ── Seed data ────────────────────────────────────────────
  _seed() {
    if (!localStorage.getItem('wassou_seeded')) {
      this.clients.save([
        { id: 'c1', nom: 'Jean', prenom: 'Dupont', tel: '0690123456', email: 'jean@email.com', adresse: '12 rue des Fleurs, Le Gosier', notes: 'Client fidèle depuis 2024', createdAt: '2024-03-15', tags: ['jardin','karcher'] },
        { id: 'c2', nom: 'Claire', prenom: 'Martin', tel: '0690654321', email: 'claire@email.com', adresse: '5 Allée des Manguiers, Pointe-à-Pitre', notes: '', createdAt: '2024-05-20', tags: ['karcher'] },
        { id: 'c3', nom: 'Thomas', prenom: 'Leblanc', tel: '0690987654', email: 'thomas@email.com', adresse: '88 Route de la Côte, Sainte-Anne', notes: 'Jardin grand + terrasse', createdAt: '2025-01-10', tags: ['jardin'] },
        { id: 'c4', nom: 'Marie', prenom: 'Rosalie', tel: '0690111222', email: 'marie@email.com', adresse: '3 Impasse Beausoleil, Baie-Mahault', notes: '', createdAt: '2025-02-28', tags: ['karcher','autre'] },
        { id: 'c5', nom: 'Paul', prenom: 'Victoire', tel: '0690333444', email: 'paul@email.com', adresse: '21 Rue des Cocotiers, Le Moule', notes: 'RDV le matin uniquement', createdAt: '2025-04-01', tags: ['jardin'] },
      ]);
      this.agents.save([
        { id: 'a1', nom: 'Kevin', prenom: 'Rosine', tel: '0690000001', specialites: ['jardin','karcher'], statut: 'actif', avatar: '🧑‍🌾', note: 4.9, interventions: 48 },
        { id: 'a2', nom: 'Sonia', prenom: 'Victoire', tel: '0690000002', specialites: ['karcher'], statut: 'actif', avatar: '👩‍🌾', note: 4.8, interventions: 31 },
        { id: 'a3', nom: 'Marc', prenom: 'Balthazar', tel: '0690000003', specialites: ['jardin','autre'], statut: 'conge', avatar: '🌱', note: 4.7, interventions: 22 },
      ]);
      this.interventions.save([
        { id: 'i1', clientId: 'c1', agentId: 'a1', service: 'jardin', date: '2025-05-10', heure: '08:00', adresse: '12 rue des Fleurs, Le Gosier', statut: 'terminé', montant: 120, notes: 'Tonte + taille haies', photos: [] },
        { id: 'i2', clientId: 'c2', agentId: 'a2', service: 'karcher', date: '2025-05-12', heure: '09:00', adresse: '5 Allée des Manguiers, PAP', statut: 'confirmé', montant: 80, notes: 'Terrasse + façade', photos: [] },
        { id: 'i3', clientId: 'c3', agentId: 'a1', service: 'jardin', date: '2025-05-15', heure: '07:30', adresse: '88 Route de la Côte, Sainte-Anne', statut: 'en_attente', montant: 150, notes: '', photos: [] },
        { id: 'i4', clientId: 'c4', agentId: 'a2', service: 'karcher', date: '2025-05-08', heure: '10:00', adresse: '3 Impasse Beausoleil, Baie-Mahault', statut: 'terminé', montant: 90, notes: 'Cours + clôtures', photos: [] },
        { id: 'i5', clientId: 'c5', agentId: 'a1', service: 'jardin', date: '2025-05-20', heure: '07:00', adresse: '21 Rue des Cocotiers, Le Moule', statut: 'confirmé', montant: 100, notes: '', photos: [] },
        { id: 'i6', clientId: 'c1', agentId: 'a2', service: 'karcher', date: '2025-04-20', heure: '09:00', adresse: '12 rue des Fleurs, Le Gosier', statut: 'terminé', montant: 60, notes: '', photos: [] },
      ]);
      this.sms.save([
        { id: 's1', clientId: 'c1', tel: '0690123456', message: 'Bonjour Jean, votre RDV Wassou est confirmé le 10/05 à 8h. À bientôt ! 🌿', date: '2025-05-08', statut: 'envoyé', type: 'confirmation' },
        { id: 's2', clientId: 'c2', tel: '0690654321', message: 'Rappel Wassou : votre intervention Kärcher est demain 12/05 à 9h. Bonne journée !', date: '2025-05-11', statut: 'envoyé', type: 'rappel' },
        { id: 's3', clientId: 'c3', tel: '0690987654', message: 'Bonjour Thomas, votre demande de RDV a bien été reçue. Confirmation sous 2h. 🌱', date: '2025-05-13', statut: 'envoyé', type: 'confirmation' },
      ]);
      this.devis.save([
        { id: 'd1', clientId: 'c1', numero: 'DEV-2025-001', date: '2025-05-01', echeance: '2025-05-15', services: [{label:'Entretien jardin',qty:1,pu:80},{label:'Taille haies',qty:1,pu:40}], statut: 'accepté', notes: 'RDV confirmé le 10/05' },
        { id: 'd2', clientId: 'c3', numero: 'DEV-2025-002', date: '2025-05-10', echeance: '2025-05-25', services: [{label:'Entretien jardin complet',qty:1,pu:150}], statut: 'envoyé', notes: '' },
        { id: 'd3', clientId: 'c5', numero: 'DEV-2025-003', date: '2025-05-14', echeance: '2025-05-28', services: [{label:'Débroussaillage',qty:1,pu:60},{label:'Désherbage',qty:2,pu:20}], statut: 'brouillon', notes: '' },
      ]);
      localStorage.setItem('wassou_seeded', 'true');
    }
  },

  // ── Generic CRUD ─────────────────────────────────────────
  _store(key) {
    return {
      getAll: () => JSON.parse(localStorage.getItem(key) || '[]'),
      save: (arr) => localStorage.setItem(key, JSON.stringify(arr)),
      getById: (id) => JSON.parse(localStorage.getItem(key) || '[]').find(x => x.id === id),
      add: (item) => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        item.id = item.id || key[0] + Date.now();
        arr.push(item);
        localStorage.setItem(key, JSON.stringify(arr));
        return item;
      },
      update: (id, patch) => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = arr.findIndex(x => x.id === id);
        if (idx !== -1) { arr[idx] = { ...arr[idx], ...patch }; localStorage.setItem(key, JSON.stringify(arr)); }
        return arr[idx];
      },
      delete: (id) => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]').filter(x => x.id !== id);
        localStorage.setItem(key, JSON.stringify(arr));
      }
    };
  },

  get clients()       { return this._store('wassou_clients'); },
  get agents()        { return this._store('wassou_agents'); },
  get interventions() { return this._store('wassou_interventions'); },
  get sms()           { return this._store('wassou_sms'); },
  get devis()         { return this._store('wassou_devis'); },

  // ── Stats ─────────────────────────────────────────────────
  stats() {
    const interventions = this.interventions.getAll();
    const terminées = interventions.filter(i => i.statut === 'terminé');
    const ca = terminées.reduce((s, i) => s + (i.montant || 0), 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const caMonth = terminées.filter(i => i.date && i.date.startsWith(thisMonth)).reduce((s, i) => s + (i.montant || 0), 0);
    return {
      totalClients: this.clients.getAll().length,
      totalAgents: this.agents.getAll().filter(a => a.statut === 'actif').length,
      totalInterventions: interventions.length,
      interventionsTerminees: terminées.length,
      interventionsConfirmees: interventions.filter(i => i.statut === 'confirmé').length,
      interventionsAttente: interventions.filter(i => i.statut === 'en_attente').length,
      caTotal: ca,
      caMonth,
      smsSent: this.sms.getAll().length,
      devisTotal: this.devis.getAll().length,
    };
  },

  // ── Labels helpers ────────────────────────────────────────
  serviceLabel(s) {
    return { jardin: '🌱 Jardin', karcher: '💦 Kärcher', autre: '🔧 Autre' }[s] || s;
  },
  statutLabel(s) {
    return { terminé:'✅ Terminé', confirmé:'📅 Confirmé', en_attente:'⏳ En attente', annulé:'❌ Annulé' }[s] || s;
  },
  statutClass(s) {
    return { terminé:'badge-success', confirmé:'badge-info', en_attente:'badge-warning', annulé:'badge-danger' }[s] || '';
  },
};

// Auto-seed on first load
document.addEventListener('DOMContentLoaded', () => WassouDB._seed());
