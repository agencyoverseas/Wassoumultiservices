// ============================================================
// WASSOU — Module WhatsApp (rappels via wa.me)
// ============================================================
// Ouvre WhatsApp avec un message pré-rempli pour le client.
// L'utilisateur tape juste "Envoyer".
// ============================================================

const Wa = {

  // ─── Templates par défaut ───
  defaultTemplates: {
    rappelFacture:
`Bonjour {prenom},

Ceci est un rappel concernant la facture {numero} d'un montant de {montant}.

Merci de procéder au règlement à votre meilleure convenance.

Cordialement,
{bizNom}
{bizTel}`,

    confirmRdv:
`Bonjour {prenom},

Je vous confirme votre rendez-vous le {date} à {heure} pour : {service}.

À très bientôt,
{bizNom}
{bizTel}`,

    rappelRdv:
`Bonjour {prenom},

Petit rappel : nous avons rendez-vous demain à {heure} pour : {service}.

À demain,
{bizNom}`,

    devisEnvoye:
`Bonjour {prenom},

Veuillez trouver le devis {numero} d'un montant de {montant} pour : {service}.

Je reste à votre disposition pour toute question.

Cordialement,
{bizNom}
{bizTel}`,

    factureEnvoyee:
`Bonjour {prenom},

Veuillez trouver la facture {numero} d'un montant de {montant}.

Merci de procéder au règlement.

Cordialement,
{bizNom}
{bizTel}`,

    remerciement:
`Bonjour {prenom},

Merci pour votre confiance ! L'intervention du {date} s'est très bien déroulée.

N'hésitez pas à me recontacter pour vos prochains besoins.

Cordialement,
{bizNom}`,
  },

  // ─── Charge les templates personnalisés depuis localStorage ───
  getTemplates() {
    try {
      const custom = JSON.parse(localStorage.getItem('wm_wa_templates') || '{}');
      return { ...this.defaultTemplates, ...custom };
    } catch { return this.defaultTemplates; }
  },

  saveTemplates(templates) {
    localStorage.setItem('wm_wa_templates', JSON.stringify(templates));
  },

  // ─── Infos entreprise ───
  bizInfo() {
    const s = DB.settings.get();
    return {
      nom:    s.bizNom   || 'Wassou Multiservices',
      tel:    s.bizTel   || '0690 67 30 85',
      email:  s.bizEmail || 'contact@wassou-services.fr',
      zone:   s.bizZone  || 'Guadeloupe',
    };
  },

  // ─── Formate un numéro de téléphone en format WhatsApp (international, sans +) ───
  formatPhone(tel) {
    if (!tel) return '';
    let n = tel.replace(/\D/g, '');           // que des chiffres
    if (n.startsWith('0') && n.length === 10) n = '33' + n.slice(1);  // FR métropole
    // Guadeloupe : 0590 = fixe, 0690 / 0691 = mobile → préfixe +590
    else if (n.startsWith('0590') || n.startsWith('590')) n = '590' + n.replace(/^0?590/, ''); // Fixe Guadeloupe
    else if (n.startsWith('0690') || n.startsWith('690')) n = '590' + n.replace(/^0?(690)/, '$1'); // Mobile Guadeloupe
    else if (n.startsWith('0691') || n.startsWith('691')) n = '590' + n.replace(/^0?(691)/, '$1'); // Mobile Guadeloupe
    else if (n.startsWith('0694') || n.startsWith('694')) n = '594' + n.replace(/^0?(694)/, '$1'); // Guyane
    return n;
  },

  // ─── Remplace les variables {xxx} dans un template ───
  fillTemplate(template, vars) {
    let out = template;
    Object.entries(vars).forEach(([k, v]) => {
      out = out.replace(new RegExp('\\{' + k + '\\}', 'g'), v || '');
    });
    return out;
  },

  // ─── Ouvre WhatsApp avec message pré-rempli ───
  send(tel, message) {
    const num = this.formatPhone(tel);
    if (!num) {
      if (typeof App !== 'undefined') App.toast('Numéro de téléphone manquant','error');
      return false;
    }
    const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    return true;
  },

  // ─── Envoie un rappel pré-typé ───
  sendTemplate(templateKey, client, extraVars = {}) {
    if (!client?.tel) {
      if (typeof App !== 'undefined') App.toast("Ce client n'a pas de téléphone",'error');
      return false;
    }
    const biz = this.bizInfo();
    const templates = this.getTemplates();
    const tpl = templates[templateKey];
    if (!tpl) {
      if (typeof App !== 'undefined') App.toast('Template introuvable','error');
      return false;
    }
    const message = this.fillTemplate(tpl, {
      prenom: client.prenom || '',
      nom: client.nom || '',
      bizNom: biz.nom,
      bizTel: biz.tel,
      bizEmail: biz.email,
      ...extraVars,
    });
    return this.send(client.tel, message);
  },

  // ─── Modal "Choisir un rappel" pour un client ───
  pickAndSend(client, options = {}) {
    if (typeof App === 'undefined') return;
    const templates = this.getTemplates();

    // Si on est dans un contexte spécifique (devis, facture, intervention), on propose les bons
    const choices = options.choices || [
      { key:'rappelFacture',    label:'💰 Rappel paiement facture' },
      { key:'confirmRdv',       label:'📅 Confirmer un RDV' },
      { key:'rappelRdv',        label:'⏰ Rappel RDV demain' },
      { key:'devisEnvoye',      label:'📄 Envoi devis' },
      { key:'factureEnvoyee',   label:'🧾 Envoi facture' },
      { key:'remerciement',     label:'🙏 Remerciement post-intervention' },
      { key:'custom',           label:'✏️ Message personnalisé' },
    ];

    App.modal(`📲 Rappel WhatsApp — ${client.prenom} ${client.nom}`, `
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:14px;line-height:1.5">
        Choisissez un modèle. WhatsApp s'ouvrira avec le message pré-rempli, vous n'aurez plus qu'à appuyer sur Envoyer.
      </div>
      ${choices.map(c => `
        <button class="wa-choice" data-key="${c.key}" style="
          width:100%;padding:14px;text-align:left;
          background:var(--surface);border:1px solid var(--border-soft);
          border-radius:12px;margin-bottom:8px;font-size:14.5px;
          color:var(--text);font-weight:500;transition:all .15s;
        ">${c.label}</button>
      `).join('')}
      <div class="modal-actions" style="margin-top:10px">
        <button type="button" class="btn btn-outline btn-block" data-close>Annuler</button>
      </div>
    `);

    setTimeout(() => {
      document.querySelectorAll('.wa-choice').forEach(b => b.addEventListener('click', () => {
        const key = b.dataset.key;
        document.querySelector('.modal-overlay').remove();
        if (key === 'custom') {
          this.openCustomEditor(client, options.prefilledVars || {});
        } else {
          this.openEditor(key, client, options.prefilledVars || {});
        }
      }));
    }, 50);
  },

  // ─── Modal d'édition avant envoi (l'utilisateur peut peaufiner) ───
  openEditor(templateKey, client, prefilledVars = {}) {
    const biz = this.bizInfo();
    const templates = this.getTemplates();
    const tpl = templates[templateKey];

    // Champs supplémentaires demandés selon le template
    const needsAmount = /\{montant\}/.test(tpl);
    const needsNumero = /\{numero\}/.test(tpl);
    const needsDate   = /\{date\}/.test(tpl);
    const needsHeure  = /\{heure\}/.test(tpl);
    const needsService= /\{service\}/.test(tpl);

    App.modal('Personnaliser le message', `
      <form id="waForm">
        ${needsMissing()}
        <div class="form-group">
          <label>Message à envoyer (modifiable)</label>
          <textarea class="form-control" name="message" id="waMsg" rows="9" style="font-size:13.5px;line-height:1.5"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" data-close>Annuler</button>
          <button type="submit" class="btn btn-primary">📲 Ouvrir WhatsApp</button>
        </div>
      </form>
    `, form => {
      const msg = form.querySelector('#waMsg').value;
      this.send(client.tel, msg);
      App.toast('WhatsApp ouvert','success');
    });

    function needsMissing() {
      let html = '';
      if (needsNumero && !prefilledVars.numero)  html += `<div class="form-group"><label>Numéro</label><input class="form-control" name="numero" id="vNumero" placeholder="ex: FAC-2026-001"/></div>`;
      if (needsAmount && !prefilledVars.montant) html += `<div class="form-group"><label>Montant</label><input class="form-control" name="montant" id="vMontant" placeholder="ex: 320,00 €"/></div>`;
      if (needsDate && !prefilledVars.date)      html += `<div class="form-group"><label>Date</label><input class="form-control" name="date" type="date" id="vDate"/></div>`;
      if (needsHeure && !prefilledVars.heure)    html += `<div class="form-group"><label>Heure</label><input class="form-control" name="heure" type="time" id="vHeure"/></div>`;
      if (needsService && !prefilledVars.service)html += `<div class="form-group"><label>Service</label><input class="form-control" name="service" id="vService" placeholder="ex: Entretien jardin"/></div>`;
      return html;
    }

    // Génère le message initial avec les valeurs déjà connues
    const self = this;
    setTimeout(() => {
      function updateMsg() {
        const vars = {
          prenom: client.prenom || '',
          nom: client.nom || '',
          bizNom: biz.nom,
          bizTel: biz.tel,
          numero:  (document.getElementById('vNumero')?.value)  || prefilledVars.numero  || '',
          montant: (document.getElementById('vMontant')?.value) || prefilledVars.montant || '',
          date:    (document.getElementById('vDate')?.value ? new Date(document.getElementById('vDate').value).toLocaleDateString('fr-FR') : prefilledVars.date) || '',
          heure:   (document.getElementById('vHeure')?.value)   || prefilledVars.heure   || '',
          service: (document.getElementById('vService')?.value) || prefilledVars.service || '',
        };
        document.getElementById('waMsg').value = self.fillTemplate(tpl, vars);
      }
      updateMsg();
      ['vNumero','vMontant','vDate','vHeure','vService'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateMsg);
      });
    }, 60);
  },

  // ─── Editeur de message libre ───
  openCustomEditor(client, prefilledVars = {}) {
    const biz = this.bizInfo();
    App.modal('Message personnalisé', `
      <form id="waCustom">
        <div class="form-group">
          <label>Message à envoyer</label>
          <textarea class="form-control" name="message" id="waMsgC" rows="8" placeholder="Tapez votre message..."
            style="font-size:13.5px;line-height:1.5">Bonjour ${client.prenom || ''},

</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" data-close>Annuler</button>
          <button type="submit" class="btn btn-primary">📲 Ouvrir WhatsApp</button>
        </div>
      </form>
    `, form => {
      const msg = form.querySelector('#waMsgC').value.trim();
      if (!msg) { App.toast('Message vide','error'); return; }
      this.send(client.tel, msg);
      App.toast('WhatsApp ouvert','success');
    });
  },
};

window.Wa = Wa;
