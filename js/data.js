// ============================================================
// WASSOU MOBILE — DATA LAYER (localStorage)
// ============================================================
const DB = {
  KEYS:{
    clients:'wm_clients', agents:'wm_agents', interventions:'wm_interventions',
    sms:'wm_sms', devis:'wm_devis', paiements:'wm_paiements',
    rdvs:'wm_rdvs', photos:'wm_photos', notifs:'wm_notifs',
    settings:'wm_settings', seeded:'wm_seeded_v2'
  },
  _get(k){ try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []} },
  _set(k,v){ localStorage.setItem(k,JSON.stringify(v)) },
  _uid(p='x'){ return p+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6) },

  store(key){
    const k = this.KEYS[key];
    return {
      all: () => this._get(k),
      get: (id) => this._get(k).find(x=>x.id===id),
      add: (item) => { const arr=this._get(k); item.id=item.id||DB._uid(key[0]); item.createdAt=item.createdAt||new Date().toISOString(); arr.push(item); DB._set(k,arr); return item; },
      update: (id,patch) => { const arr=this._get(k); const i=arr.findIndex(x=>x.id===id); if(i>-1){arr[i]={...arr[i],...patch};DB._set(k,arr);return arr[i]} },
      remove: (id) => { DB._set(k, this._get(k).filter(x=>x.id!==id)) },
      save: (arr) => DB._set(k,arr),
    };
  },

  get clients(){return this.store('clients')},
  get agents(){return this.store('agents')},
  get interventions(){return this.store('interventions')},
  get sms(){return this.store('sms')},
  get devis(){return this.store('devis')},
  get paiements(){return this.store('paiements')},
  get rdvs(){return this.store('rdvs')},
  get photos(){return this.store('photos')},
  get notifs(){return this.store('notifs')},

  settings: {
    get(){ try{return JSON.parse(localStorage.getItem(DB.KEYS.settings))||{}}catch(e){return {}} },
    set(o){ localStorage.setItem(DB.KEYS.settings, JSON.stringify({...DB.settings.get(),...o})) },
  },

  seed(){
    if(localStorage.getItem(this.KEYS.seeded)) return;
    // CLIENTS (noms des captures)
    this.clients.save([
      {id:'c1', nom:'Dupont', prenom:'Jean', tel:'0690111111', email:'jean.dupont@email.com', adresse:'12 Rue des Fleurs, Baie-Mahault', statut:'actif', notes:'Client fidèle', createdAt:'2024-03-15', tags:['jardin']},
      {id:'c2', nom:'Lebrun', prenom:'Thomas', tel:'0690333333', email:'thomas@email.com', adresse:'3 Résidence Bois Rouge, Le Gosier', statut:'prospect', notes:'Devis envoyé', createdAt:'2025-04-08', tags:['jardin','karcher']},
      {id:'c3', nom:'Martin', prenom:'Claire', tel:'0690222222', email:'claire.m@email.com', adresse:'8 Allée des Manguiers, Pointe-à-Pitre', statut:'actif', notes:'', createdAt:'2024-09-12', tags:['karcher']},
      {id:'c4', nom:'Martin', prenom:'Sophie', tel:'0690111222', email:'sophie@email.com', adresse:'Le Gosier', statut:'actif', notes:'RDV récurrent', createdAt:'2025-02-01', tags:['jardin']},
      {id:'c5', nom:'Rosalie', prenom:'Marie', tel:'0690444555', email:'marie.r@email.com', adresse:'Sainte-Anne', statut:'actif', notes:'', createdAt:'2025-03-22', tags:['karcher']},
    ]);
    // AGENTS (noms des captures)
    this.agents.save([
      {id:'a1', nom:'Démo', prenom:'Agent', tel:'0690000001', adresse:'Pointe-à-Pitre', statut:'disponible', avatar:'🧑‍🌾', specialites:['Entretien jardin','Nettoyage Kärcher'], note:4.9, interventions:48, actif:true},
      {id:'a2', nom:'Rosine', prenom:'Kevin', tel:'0690444444', adresse:'Centre Guadeloupe', statut:'disponible', avatar:'🧑‍🌾', specialites:['Entretien jardin','Nettoyage Kärcher'], note:4.8, interventions:31, actif:true},
      {id:'a3', nom:'Victoire', prenom:'Sonia', tel:'0690555555', adresse:'Nord Grande-Terre', statut:'disponible', avatar:'🧑‍🌾', specialites:['Nettoyage Kärcher'], note:4.7, interventions:22, actif:true},
    ]);
    // INTERVENTIONS
    this.interventions.save([
      {id:'i1', clientId:'c4', agentId:'a1', service:'Entretien jardin', date:'2026-05-10', heure:'03:50', adresse:'Le Gosier', statut:'planifié', montant:80, notes:'', photos:[]},
    ]);
    // SMS / Devis / Paiements vides au début
    this.sms.save([]);
    this.devis.save([]);
    this.paiements.save([]);
    this.rdvs.save([]);
    this.photos.save([]);
    this.notifs.save([]);
    localStorage.setItem(this.KEYS.seeded,'1');
  },

  stats(){
    const today = new Date().toISOString().slice(0,10);
    const month = today.slice(0,7);
    const ints = this.interventions.all();
    const pays = this.paiements.all();
    return {
      clients: this.clients.all().length,
      agents: this.agents.all().filter(a=>a.actif!==false).length,
      agentsDispo: this.agents.all().filter(a=>a.statut==='disponible').length,
      interventionsToday: ints.filter(i=>i.date===today).length,
      interventionsNonAssignees: ints.filter(i=>!i.agentId).length,
      interventionsTotal: ints.length,
      caMonth: pays.filter(p=>p.statut==='reçu' && (p.date||'').startsWith(month)).reduce((s,p)=>s+(p.montant||0),0),
      caTotal: pays.filter(p=>p.statut==='reçu').reduce((s,p)=>s+(p.montant||0),0),
      sms: this.sms.all().length,
      smsEnvoyes: this.sms.all().filter(s=>s.statut==='envoyé').length,
      smsEchoues: this.sms.all().filter(s=>s.statut==='échoué').length,
      devis: this.devis.all().length,
    };
  }
};

DB.seed();

// Helpers
const Fmt = {
  eur(n){ return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n||0) },
  date(d){ if(!d) return '—'; const dt=new Date(d); if(isNaN(dt)) return d; return dt.toLocaleDateString('fr-FR') },
  dateLong(d){ if(!d) return '—'; const dt=new Date(d); if(isNaN(dt)) return d; return dt.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}) },
  dateInput(d){ if(!d) return ''; const dt=new Date(d); return dt.toISOString().slice(0,10) },
  initials(p,n){ return ((p||'').charAt(0)+(n||'').charAt(0)).toUpperCase() },
};
