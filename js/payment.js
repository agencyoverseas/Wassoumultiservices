// ============================================================
//  WASSOU — Module paiement
//  Stripe / Virement / Espèces (les autres sont dans config)
// ============================================================

const Payment = (() => {

  function methodesActives() {
    const m = CONFIG.paiement.methodes;
    return Object.entries(m)
      .filter(([_, v]) => v.active)
      .map(([k, v]) => ({ key: k, ...v }));
  }

  // Lance un paiement (selon méthode)
  async function pay(devisId, montant, methode, type = 'acompte') {
    const devis = Data.devis.get(devisId);
    if (!devis) return { ok: false, error: "Devis introuvable" };

    switch (methode) {
      case 'stripe': return payStripe(devis, montant, type);
      case 'virement': return payVirement(devis, montant, type);
      case 'especes': return payEspeces(devis, montant, type);
      case 'paypal': return payPaypal(devis, montant, type);
      default: return { ok: false, error: "Méthode inconnue" };
    }
  }

  // STRIPE — Lien de paiement
  function payStripe(devis, montant, type) {
    const cfg = CONFIG.paiement.methodes.stripe;
    if (!cfg.public_key) {
      App.toast("⚠️ Stripe non configuré. Ajoute ta clé dans config.js", 'warn');
      return { ok: false, error: "Stripe non configuré" };
    }
    // Mode lien fixe (créé sur Stripe Dashboard) : on ouvre le lien
    if (cfg.lien_paiement_template) {
      const link = cfg.lien_paiement_template
        .replace('{numero}', devis.numero)
        .replace('{montant}', montant);
      window.open(link, '_blank');
      // Marque comme "en attente"
      Data.paiements.add({
        devis_id: devis.id, agent_id: devis.agent_id, client_id: devis.client_id,
        montant, methode: 'stripe', type, statut: 'en_attente',
        ref: devis.numero
      });
      return { ok: true, async: true };
    }
    // Sinon : on instruit l'utilisateur de créer un lien manuel
    App.toast("ℹ️ Crée un lien de paiement Stripe puis renseigne-le dans config.js", 'warn', 4000);
    return { ok: false, error: "Aucun lien Stripe configuré" };
  }

  // VIREMENT — Affiche les coordonnées + crée une trace
  function payVirement(devis, montant, type) {
    const cfg = CONFIG.paiement.methodes.virement;
    const ref = (cfg.reference_template || 'DEVIS-{numero}').replace('{numero}', devis.numero);
    const html = `
      <div style="background:var(--pale);padding:16px;border-radius:12px;margin-top:8px">
        <p><strong>Titulaire :</strong> ${cfg.titulaire}</p>
        <p><strong>IBAN :</strong> ${cfg.iban}</p>
        <p><strong>BIC :</strong> ${cfg.bic}</p>
        <p><strong>Banque :</strong> ${cfg.banque}</p>
        <p style="margin-top:8px;color:var(--g);font-weight:700">Référence à indiquer : ${ref}</p>
        <p style="margin-top:8px"><strong>Montant :</strong> ${App.fmtEur(montant)}</p>
      </div>`;
    Data.paiements.add({
      devis_id: devis.id, agent_id: devis.agent_id, client_id: devis.client_id,
      montant, methode: 'virement', type, statut: 'en_attente', ref
    });
    return { ok: true, info: html };
  }

  // ESPÈCES — Marque comme à encaisser sur place
  function payEspeces(devis, montant, type) {
    Data.paiements.add({
      devis_id: devis.id, agent_id: devis.agent_id, client_id: devis.client_id,
      montant, methode: 'especes', type, statut: 'à_encaisser'
    });
    App.toast(`💵 ${App.fmtEur(montant)} à encaisser sur place`, 'success');
    return { ok: true };
  }

  function payPaypal(devis, montant, type) {
    const cfg = CONFIG.paiement.methodes.paypal;
    if (!cfg.email) {
      App.toast("⚠️ PayPal non configuré", 'warn');
      return { ok: false };
    }
    const url = `https://www.paypal.com/paypalme/${cfg.email}/${montant}EUR`;
    window.open(url, '_blank');
    Data.paiements.add({ devis_id: devis.id, agent_id: devis.agent_id, client_id: devis.client_id, montant, methode: 'paypal', type, statut: 'en_attente' });
    return { ok: true, async: true };
  }

  // Confirme manuellement un paiement reçu (admin)
  function confirmer(paiementId) {
    return Data.paiements.update(paiementId, { statut: 'reçu', date_confirmation: new Date().toISOString() });
  }

  // Calcule le solde restant d'un devis
  function solde(devisId) {
    const d = Data.devis.get(devisId);
    if (!d) return 0;
    const recu = Data.paiements.forDevis(devisId)
      .filter(p => p.statut === 'reçu')
      .reduce((s, p) => s + p.montant, 0);
    return Math.max(0, (d.total_ttc || 0) - recu);
  }

  return { methodesActives, pay, confirmer, solde };
})();

if (typeof window !== 'undefined') window.Payment = Payment;
