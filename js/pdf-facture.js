// ============================================================
// WASSOU — Générateur PDF (Facture / Devis) + Envoi mail
// ============================================================
// Pas de dépendance externe : on ouvre une fenêtre imprimable
// stylée → l'utilisateur fait "Imprimer → Enregistrer en PDF".
// ============================================================

const PdfFacture = {

  // ─── Récupère les infos de l'entreprise ───
  bizInfo() {
    const s = DB.settings.get();
    return {
      nom:    s.bizNom   || 'Wassou Multiservices',
      tel:    s.bizTel   || '0690 67 30 85',
      email:  s.bizEmail || 'contact@wassou-services.fr',
      zone:   s.bizZone  || 'Martinique',
      siret:  s.bizSiret || '—',
    };
  },

  // ─── Génère le HTML imprimable ───
  buildHTML(doc, type = 'facture') {
    const biz   = this.bizInfo();
    const c     = DB.clients.get(doc.clientId) || {};
    const lines = doc.lines || [];
    const total = doc.total || lines.reduce((s, l) => s + (l.qty * l.pu), 0);
    const numero  = doc.numero || doc.id;
    const titre   = type === 'facture' ? 'FACTURE' : 'DEVIS';
    const couleur = type === 'facture' ? '#1b4332' : '#2d5a3f';
    const dateDoc = doc.date || new Date().toISOString().slice(0, 10);
    const dateLong = new Date(dateDoc).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"/>
<title>${titre} ${numero} — ${biz.nom}</title>
<style>
  @page { size: A4; margin: 18mm 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
         font-size: 13px; color: #1a1a1a; background: #fff; padding: 20px; line-height: 1.5; }
  .head { display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 4px solid ${couleur}; padding-bottom: 16px; margin-bottom: 24px; }
  .logo-box { display: flex; align-items: center; gap: 12px; }
  .leaf { font-size: 48px; color: ${couleur}; }
  .biz-name { font-size: 22px; font-weight: 700; color: ${couleur}; }
  .biz-line { font-size: 12px; color: #555; margin-top: 2px; }
  .title-box { text-align: right; }
  .title { font-size: 32px; font-weight: 800; color: ${couleur}; letter-spacing: 1px; }
  .num   { font-size: 14px; color: #666; margin-top: 6px; }
  .meta-grid { display: flex; gap: 30px; margin-bottom: 28px; }
  .meta-block { flex: 1; }
  .meta-label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600; margin-bottom: 6px; letter-spacing: 0.5px; }
  .meta-val { font-size: 14px; color: #1a1a1a; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: ${couleur}; color: #fff; padding: 12px 10px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 13px; }
  td.qty, td.pu, td.tot, th.qty, th.pu, th.tot { text-align: right; }
  tr:last-child td { border-bottom: none; }
  .totaux { margin-top: 18px; margin-left: auto; width: 50%; }
  .totaux .row { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 14px; }
  .totaux .row.grand { background: ${couleur}; color: #fff; font-weight: 700; font-size: 16px; border-radius: 6px; margin-top: 4px; }
  .notes { margin-top: 30px; padding: 14px; background: #f8f8f8; border-left: 4px solid ${couleur}; font-size: 12.5px; color: #444; border-radius: 4px; }
  .notes strong { display: block; margin-bottom: 4px; color: ${couleur}; }
  .foot { margin-top: 40px; padding-top: 18px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #888; line-height: 1.6; }
  .actions-noprint { position: fixed; bottom: 14px; right: 14px; display: flex; gap: 8px; z-index: 999; }
  .actions-noprint button { padding: 12px 20px; border: none; border-radius: 100px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.2); }
  .btn-print { background: ${couleur}; color: #fff; }
  .btn-close { background: #fff; color: #333; border: 1px solid #ddd; }
  @media print { .actions-noprint { display: none !important; } body { padding: 0; } }
</style>
</head><body>

<div class="actions-noprint">
  <button class="btn-print" onclick="window.print()">📄 Enregistrer en PDF / Imprimer</button>
  <button class="btn-close" onclick="window.close()">✕ Fermer</button>
</div>

<div class="head">
  <div class="logo-box">
    <div class="leaf">🌿</div>
    <div>
      <div class="biz-name">${biz.nom}</div>
      <div class="biz-line">${biz.tel} · ${biz.email}</div>
      <div class="biz-line">${biz.zone}${biz.siret !== '—' ? ' · SIRET ' + biz.siret : ''}</div>
    </div>
  </div>
  <div class="title-box">
    <div class="title">${titre}</div>
    <div class="num">N° ${numero}</div>
    <div class="num">${dateLong}</div>
  </div>
</div>

<div class="meta-grid">
  <div class="meta-block">
    <div class="meta-label">${type === 'facture' ? 'Facturé à' : 'Devis pour'}</div>
    <div class="meta-val">
      <strong>${(c.prenom || '') + ' ' + (c.nom || '—')}</strong><br>
      ${c.adresse || ''}<br>
      ${c.tel || ''}${c.email ? ' · ' + c.email : ''}
    </div>
  </div>
  <div class="meta-block" style="text-align:right">
    <div class="meta-label">Statut</div>
    <div class="meta-val" style="font-weight:600;text-transform:capitalize">${doc.statut || 'brouillon'}</div>
    <div class="meta-label" style="margin-top:12px">Date</div>
    <div class="meta-val">${new Date(dateDoc).toLocaleDateString('fr-FR')}</div>
  </div>
</div>

<table>
  <thead><tr>
    <th>Description</th>
    <th class="qty">Qté</th>
    <th class="pu">P.U. HT</th>
    <th class="tot">Total HT</th>
  </tr></thead>
  <tbody>
    ${lines.map(l => `<tr>
      <td>${l.label || ''}</td>
      <td class="qty">${l.qty || 0}</td>
      <td class="pu">${Number(l.pu || 0).toFixed(2)} €</td>
      <td class="tot">${(Number(l.qty || 0) * Number(l.pu || 0)).toFixed(2)} €</td>
    </tr>`).join('')}
    ${!lines.length ? '<tr><td colspan="4" style="text-align:center;color:#888;padding:30px">Aucune ligne</td></tr>' : ''}
  </tbody>
</table>

<div class="totaux">
  <div class="row"><span>Total HT</span><span>${total.toFixed(2)} €</span></div>
  <div class="row"><span>TVA (0%)</span><span>0,00 €</span></div>
  <div class="row grand"><span>TOTAL ${type === 'facture' ? 'À PAYER' : 'TTC'}</span><span>${total.toFixed(2)} €</span></div>
</div>

${doc.notes ? `<div class="notes"><strong>Notes</strong>${doc.notes}</div>` : ''}

<div class="foot">
  ${biz.nom} — ${biz.zone}<br>
  ${biz.tel} · ${biz.email}<br>
  ${type === 'facture' ? 'Merci pour votre confiance.' : 'Devis valable 30 jours à compter de la date d\'émission.'}
</div>

</body></html>`;
  },

  // ─── Ouvre le PDF dans une nouvelle fenêtre/onglet ───
  open(doc, type = 'facture') {
    const html = this.buildHTML(doc, type);
    const win  = window.open('', '_blank');
    if (!win) {
      // Fallback : si bloqué par popup blocker → blob URL
      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      window.location.href = url;
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
  },

  // ─── Envoi par mail (mailto:) ───
  sendByMail(doc, type = 'facture') {
    const biz    = this.bizInfo();
    const c      = DB.clients.get(doc.clientId) || {};
    const total  = doc.total || (doc.lines || []).reduce((s, l) => s + l.qty * l.pu, 0);
    const numero = doc.numero || doc.id;
    const sujet  = `${type === 'facture' ? 'Facture' : 'Devis'} ${numero} — ${biz.nom}`;

    const corps = `Bonjour ${c.prenom || ''} ${c.nom || ''},

Veuillez trouver ci-joint votre ${type === 'facture' ? 'facture' : 'devis'} N° ${numero}.

Détail :
${(doc.lines || []).map(l => `- ${l.label} : ${l.qty} × ${l.pu}€ = ${(l.qty * l.pu).toFixed(2)} €`).join('\n')}

Total ${type === 'facture' ? 'à payer' : 'TTC'} : ${total.toFixed(2)} €

${type === 'facture'
  ? 'Merci de procéder au règlement sous 30 jours.'
  : 'Ce devis est valable 30 jours. N\'hésitez pas à me contacter pour toute question.'}

Cordialement,
${biz.nom}
${biz.tel}
${biz.email}`;

    const mailto = `mailto:${encodeURIComponent(c.email || '')}` +
                   `?subject=${encodeURIComponent(sujet)}` +
                   `&body=${encodeURIComponent(corps)}`;
    window.location.href = mailto;
  },
};

window.PdfFacture = PdfFacture;
