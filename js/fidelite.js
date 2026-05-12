// ============================================================
// WASSOU MOBILE — CARTE FIDÉLITÉ
// Programme 10 prestations + parrainage 3 prospects
// ============================================================

// Étendre DB avec stores fidélité et parrainage (sans modifier data.js)
(function extendDB(){
  DB.KEYS.fidelite = 'wm_fidelite';
  DB.KEYS.parrainages = 'wm_parrainages';
  Object.defineProperty(DB, 'fidelite', { get(){ return DB.store('fidelite'); } });
  Object.defineProperty(DB, 'parrainages', { get(){ return DB.store('parrainages'); } });
})();

const Fid = {
  // ─── Config programme ───
  CFG: {
    STAMPS_NEEDED: 10,         // 10 prestations = 1 offerte
    REWARD_LABEL: '1 prestation offerte',
    REF_PROSPECTS: 3,           // 3 filleuls
    REF_REMISE: 10,             // 10% de remise
    VALIDITY_MONTHS: 12,
  },

  // ─── Récupère ou crée une carte pour un client ───
  getOrCreateCard(clientId){
    let card = DB.fidelite.all().find(c => c.clientId === clientId);
    if (!card){
      card = DB.fidelite.add({
        clientId,
        stamps: 0,
        rewardsClaimed: 0,
        startDate: new Date().toISOString(),
        history: [],
      });
    }
    return card;
  },

  // ─── Compte les prestations validées d'un filleul ───
  prospectPrestationsCount(prospectClientId){
    return DB.interventions.all()
      .filter(i => i.clientId === prospectClientId && (i.statut === 'terminé' || i.statut === 'validé' || i.statut === 'fait'))
      .length;
  },

  // ─── Run principal ───
  run(){
    document.getElementById('addBtn').innerHTML = App.icons.plus + ' Ajouter';
    document.getElementById('addBtn').addEventListener('click', () => Fid.onAddClick());

    // Tabs
    document.querySelectorAll('.fid-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.fid-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        ['cards','ref','info'].forEach(t => {
          document.getElementById('tab-' + t).style.display = (t === tab) ? '' : 'none';
        });
        Fid.currentTab = tab;
        Fid.updateAddBtn();
      });
    });

    Fid.currentTab = 'cards';
    Fid.renderCards();
    Fid.renderReferrals();
    Fid.renderInfo();
  },

  updateAddBtn(){
    const btn = document.getElementById('addBtn');
    if (Fid.currentTab === 'cards') {
      btn.style.display = '';
      btn.innerHTML = App.icons.plus + ' Nouvelle carte';
    } else if (Fid.currentTab === 'ref') {
      btn.style.display = '';
      btn.innerHTML = App.icons.plus + ' Nouveau parrainage';
    } else {
      btn.style.display = 'none';
    }
  },

  onAddClick(){
    if (Fid.currentTab === 'cards') return Fid.modalNewCard();
    if (Fid.currentTab === 'ref') return Fid.modalNewReferral();
  },

  // ────────────────────────────────────────────────
  // TAB 1 — CARTES FIDÉLITÉ
  // ────────────────────────────────────────────────
  renderCards(){
    const cards = DB.fidelite.all();
    const cont = document.getElementById('tab-cards');
    if (!cards.length){
      cont.innerHTML = `
        <div class="fid-empty">
          <div class="ic">🎫</div>
          <p>Aucune carte de fidélité.<br>Créez-en une pour vos clients réguliers !</p>
          <button class="btn btn-primary btn-sm" onclick="Fid.modalNewCard()">+ Nouvelle carte</button>
        </div>`;
      return;
    }

    cont.innerHTML = cards.map(card => {
      const client = DB.clients.get(card.clientId);
      if (!client) return '';
      const filled = card.stamps;
      const total = Fid.CFG.STAMPS_NEEDED;
      const complete = filled >= total;
      const stampsHtml = Array.from({length: total}, (_, i) => {
        const n = i + 1;
        const isFilled = n <= filled;
        if (n === total) {
          return `<div class="stamp gift ${isFilled ? '' : 'locked'}" data-stamp="${n}" data-card="${card.id}">🎁</div>`;
        }
        return `<div class="stamp ${isFilled ? 'filled' : ''}" data-stamp="${n}" data-card="${card.id}"><span>${n}</span></div>`;
      }).join('');

      return `
        <div class="fid-card ${complete ? 'complete' : ''}">
          <div class="fid-card-head">
            <div>
              <div class="fid-card-name">${client.prenom} ${client.nom}</div>
              <div class="fid-card-sub">${client.tel || '—'}</div>
            </div>
            <span class="fid-card-badge ${complete ? 'gold' : ''}">${complete ? '🎁 Récompense !' : filled+'/'+total}</span>
          </div>
          <div class="fid-progress">
            <span>Progression</span>
            <strong>${filled}/${total} prestations</strong>
          </div>
          <div class="stamps">${stampsHtml}</div>
          <div class="fid-actions">
            <button class="btn-add" onclick="Fid.addStamp('${card.id}')">+ Tampon</button>
            ${complete
              ? `<button class="btn-claim" onclick="Fid.claimReward('${card.id}')">✓ Réclamer</button>`
              : `<button onclick="Fid.removeStamp('${card.id}')">– Retirer</button>`}
            <button onclick="Fid.deleteCard('${card.id}')">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // tap direct sur tampon pour ajouter/retirer
    cont.querySelectorAll('.stamp').forEach(el => {
      el.addEventListener('click', () => {
        const cardId = el.dataset.card;
        const n = parseInt(el.dataset.stamp);
        const card = DB.fidelite.get(cardId);
        if (!card) return;
        if (n <= card.stamps) {
          // retirer jusqu'à ce tampon
          DB.fidelite.update(cardId, { stamps: n - 1 });
        } else {
          DB.fidelite.update(cardId, { stamps: Math.min(Fid.CFG.STAMPS_NEEDED, n) });
        }
        Fid.renderCards();
      });
    });
  },

  modalNewCard(){
    const clients = DB.clients.all();
    const existing = new Set(DB.fidelite.all().map(f => f.clientId));
    const available = clients.filter(c => !existing.has(c.id));

    if (!available.length){
      App.toast('Tous les clients ont déjà une carte','');
      return;
    }

    App.modal('Nouvelle carte fidélité', `
      <form id="newCard">
        <div class="form-group">
          <label>Client</label>
          <select class="form-control" name="clientId" required>
            <option value="">— Choisir un client —</option>
            ${available.map(c => `<option value="${c.id}">${c.prenom} ${c.nom}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Tampons initiaux (0–10)</label>
          <input class="form-control" name="stamps" type="number" min="0" max="10" value="0"/>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" data-close>Annuler</button>
          <button type="submit" class="btn btn-primary">Créer</button>
        </div>
      </form>
    `, (form) => {
      const fd = new FormData(form);
      const clientId = fd.get('clientId');
      const stamps = Math.min(Fid.CFG.STAMPS_NEEDED, parseInt(fd.get('stamps')||0));
      if (!clientId) return false;
      const card = Fid.getOrCreateCard(clientId);
      DB.fidelite.update(card.id, { stamps });
      App.toast('Carte créée','success');
      Fid.renderCards();
    });
  },

  addStamp(cardId){
    const card = DB.fidelite.get(cardId);
    if (!card) return;
    if (card.stamps >= Fid.CFG.STAMPS_NEEDED){
      App.toast('Carte complète — réclamez la récompense','');
      return;
    }
    DB.fidelite.update(cardId, {
      stamps: card.stamps + 1,
      history: [...(card.history||[]), { type:'stamp', date: new Date().toISOString() }]
    });
    App.toast('Tampon ajouté','success');
    Fid.renderCards();
  },

  removeStamp(cardId){
    const card = DB.fidelite.get(cardId);
    if (!card || card.stamps <= 0) return;
    DB.fidelite.update(cardId, { stamps: card.stamps - 1 });
    Fid.renderCards();
  },

  async claimReward(cardId){
    const ok = await App.confirm('Confirmer l\'utilisation de la récompense (1 prestation offerte) ?');
    if (!ok) return;
    const card = DB.fidelite.get(cardId);
    DB.fidelite.update(cardId, {
      stamps: 0,
      rewardsClaimed: (card.rewardsClaimed||0) + 1,
      history: [...(card.history||[]), { type:'reward', date: new Date().toISOString() }]
    });
    App.toast('🎁 Récompense réclamée !','success');
    Fid.renderCards();
  },

  async deleteCard(cardId){
    const ok = await App.confirm('Supprimer définitivement cette carte fidélité ?');
    if (!ok) return;
    DB.fidelite.remove(cardId);
    App.toast('Carte supprimée','');
    Fid.renderCards();
  },

  // ────────────────────────────────────────────────
  // TAB 2 — PARRAINAGES
  // ────────────────────────────────────────────────
  renderReferrals(){
    const refs = DB.parrainages.all();
    const cont = document.getElementById('tab-ref');

    const hero = `
      <div class="ref-hero">
        <div class="ref-hero-pct">${Fid.CFG.REF_REMISE}%</div>
        <div class="ref-hero-title">de remise sur la prochaine prestation</div>
        <div class="ref-hero-sub">Recommandez Wassou à ${Fid.CFG.REF_PROSPECTS} proches qui réalisent une prestation, et profitez de votre remise.</div>
      </div>`;

    if (!refs.length){
      cont.innerHTML = hero + `
        <div class="fid-empty">
          <div class="ic">🤝</div>
          <p>Aucun parrainage en cours.</p>
          <button class="btn btn-primary btn-sm" onclick="Fid.modalNewReferral()">+ Nouveau parrainage</button>
        </div>`;
      return;
    }

    cont.innerHTML = hero + refs.map(r => {
      const parrain = DB.clients.get(r.parrainId);
      if (!parrain) return '';
      const filleuls = (r.filleulIds || []).map(id => DB.clients.get(id)).filter(Boolean);
      const validated = filleuls.filter(f => Fid.prospectPrestationsCount(f.id) > 0).length;
      const done = validated >= Fid.CFG.REF_PROSPECTS;
      const pct = Math.min(100, (validated / Fid.CFG.REF_PROSPECTS) * 100);

      const filleulsHtml = filleuls.map(f => {
        const ok = Fid.prospectPrestationsCount(f.id) > 0;
        return `<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text-soft);margin-bottom:4px">
          <span style="width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;background:${ok?'var(--green-soft)':'#eef3ee'};color:${ok?'var(--green-dark)':'var(--text-soft)'};font-weight:700">${ok?'✓':'•'}</span>
          <span>${f.prenom} ${f.nom}</span>
        </div>`;
      }).join('');

      return `
        <div class="ref-card">
          <div class="ref-card-head">
            <div class="ref-card-name">👤 ${parrain.prenom} ${parrain.nom}</div>
            <span class="ref-card-status ${done?'done':'wait'}">${done?'✓ Remise acquise':'En cours'}</span>
          </div>
          <div class="ref-progress-track"><div class="ref-progress-fill" style="width:${pct}%"></div></div>
          <div class="ref-progress-label">${validated}/${Fid.CFG.REF_PROSPECTS} prestations validées</div>
          <div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--border-soft)">
            <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-soft);text-transform:uppercase;margin-bottom:6px">Filleuls</div>
            ${filleulsHtml || '<div style="font-size:12px;color:var(--text-soft)">Aucun</div>'}
          </div>
          <div class="fid-actions" style="margin-top:10px">
            <button onclick="Fid.editReferral('${r.id}')">✏️ Modifier</button>
            ${done && !r.remiseAppliquee ? `<button class="btn-claim" onclick="Fid.applyReferralReward('${r.id}')">🎁 Appliquer remise</button>` : ''}
            <button onclick="Fid.deleteReferral('${r.id}')">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  },

  modalNewReferral(){
    const clients = DB.clients.all();
    if (clients.length < 2){
      App.toast('Il faut au moins 2 clients pour un parrainage','');
      return;
    }
    const optsAll = clients.map(c => `<option value="${c.id}">${c.prenom} ${c.nom}</option>`).join('');

    App.modal('Nouveau parrainage', `
      <form id="newRef">
        <div class="form-group">
          <label>Parrain (client existant)</label>
          <select class="form-control" name="parrainId" required>
            <option value="">— Choisir le parrain —</option>${optsAll}
          </select>
        </div>
        <div class="form-group">
          <label>Filleul 1 (prospect/client)</label>
          <select class="form-control" name="f1" required>
            <option value="">— Choisir —</option>${optsAll}
          </select>
        </div>
        <div class="form-group">
          <label>Filleul 2</label>
          <select class="form-control" name="f2" required>
            <option value="">— Choisir —</option>${optsAll}
          </select>
        </div>
        <div class="form-group">
          <label>Filleul 3</label>
          <select class="form-control" name="f3" required>
            <option value="">— Choisir —</option>${optsAll}
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" data-close>Annuler</button>
          <button type="submit" class="btn btn-primary">Créer</button>
        </div>
      </form>
    `, (form) => {
      const fd = new FormData(form);
      const parrainId = fd.get('parrainId');
      const filleulIds = [fd.get('f1'), fd.get('f2'), fd.get('f3')];
      if (filleulIds.includes(parrainId)){
        App.toast('Le parrain ne peut pas être son propre filleul','');
        return false;
      }
      if (new Set(filleulIds).size !== 3){
        App.toast('Les 3 filleuls doivent être différents','');
        return false;
      }
      DB.parrainages.add({ parrainId, filleulIds, remiseAppliquee: false, dateCreation: new Date().toISOString() });
      App.toast('Parrainage créé','success');
      Fid.renderReferrals();
    });
  },

  editReferral(id){
    const r = DB.parrainages.get(id);
    if (!r) return;
    const clients = DB.clients.all();
    const opts = (sel) => clients.map(c => `<option value="${c.id}" ${c.id===sel?'selected':''}>${c.prenom} ${c.nom}</option>`).join('');

    App.modal('Modifier le parrainage', `
      <form id="editRef">
        <div class="form-group">
          <label>Parrain</label>
          <select class="form-control" name="parrainId" required>${opts(r.parrainId)}</select>
        </div>
        <div class="form-group"><label>Filleul 1</label><select class="form-control" name="f1" required>${opts(r.filleulIds[0])}</select></div>
        <div class="form-group"><label>Filleul 2</label><select class="form-control" name="f2" required>${opts(r.filleulIds[1])}</select></div>
        <div class="form-group"><label>Filleul 3</label><select class="form-control" name="f3" required>${opts(r.filleulIds[2])}</select></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" data-close>Annuler</button>
          <button type="submit" class="btn btn-primary">Enregistrer</button>
        </div>
      </form>
    `, (form) => {
      const fd = new FormData(form);
      DB.parrainages.update(id, {
        parrainId: fd.get('parrainId'),
        filleulIds: [fd.get('f1'), fd.get('f2'), fd.get('f3')],
      });
      App.toast('Parrainage modifié','success');
      Fid.renderReferrals();
    });
  },

  async applyReferralReward(id){
    const ok = await App.confirm(`Appliquer la remise de ${Fid.CFG.REF_REMISE}% au parrain ? Cette action sera marquée comme effectuée.`);
    if (!ok) return;
    DB.parrainages.update(id, { remiseAppliquee: true, dateRemise: new Date().toISOString() });
    App.toast('🎁 Remise appliquée','success');
    Fid.renderReferrals();
  },

  async deleteReferral(id){
    const ok = await App.confirm('Supprimer ce parrainage ?');
    if (!ok) return;
    DB.parrainages.remove(id);
    App.toast('Parrainage supprimé','');
    Fid.renderReferrals();
  },

  // ────────────────────────────────────────────────
  // TAB 3 — INFOS PROGRAMME
  // ────────────────────────────────────────────────
  renderInfo(){
    document.getElementById('tab-info').innerHTML = `
      <div class="ref-hero" style="margin-bottom:18px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:28px">🎫</span><div style="font-size:18px;font-weight:800">Programme Fidélité Wassou</div></div>
        <div class="ref-hero-sub" style="max-width:90%">Deux façons de récompenser nos clients : la carte de fidélité 10 prestations et le parrainage.</div>
      </div>

      <div style="font-size:13px;font-weight:800;letter-spacing:2px;color:var(--text-soft);text-transform:uppercase;margin-bottom:10px">🎁 Carte fidélité</div>
      <div class="ref-steps">
        <div class="ref-step"><div class="ref-step-num">1</div><div class="ref-step-title">Chaque prestation = 1 tampon</div><div class="ref-step-text">Tap sur un tampon pour valider après une prestation effectuée.</div></div>
        <div class="ref-step last"><div class="ref-step-num">🎁</div><div class="ref-step-title">10 prestations = 1 offerte</div><div class="ref-step-text">À la 10ᵉ prestation, la 11ᵉ est offerte. Réclamez la récompense en un clic.</div></div>
      </div>

      <div style="font-size:13px;font-weight:800;letter-spacing:2px;color:var(--text-soft);text-transform:uppercase;margin:18px 0 10px">🤝 Parrainage</div>
      <div class="ref-steps">
        <div class="ref-step"><div class="ref-step-num">1</div><div class="ref-step-title">Le parrain recommande Wassou</div><div class="ref-step-text">À 3 prospects différents (ajoutés comme filleuls).</div></div>
        <div class="ref-step"><div class="ref-step-num">2</div><div class="ref-step-title">Les 3 filleuls réalisent une prestation</div><div class="ref-step-text">Le suivi se fait automatiquement via les interventions terminées.</div></div>
        <div class="ref-step last"><div class="ref-step-num">🎁</div><div class="ref-step-title">Le parrain reçoit ${Fid.CFG.REF_REMISE}%</div><div class="ref-step-text">De remise sur sa prochaine prestation, applicable depuis cette interface.</div></div>
      </div>

      <div class="cond-box">
        <div class="cond-title">Conditions</div>
        <div class="cond-line">Remise valable une fois les ${Fid.CFG.REF_PROSPECTS} prestations réalisées</div>
        <div class="cond-line">Applicable uniquement sur le passage suivant</div>
        <div class="cond-line">Carte nominative et non cessible</div>
        <div class="cond-line">Valable ${Fid.CFG.VALIDITY_MONTHS} mois à compter de l'émission</div>
      </div>
    `;
  },
};
