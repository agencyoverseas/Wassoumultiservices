// ============================================================
// WASSOU MULTISERVICES — LANDING PAGE JS
// Lit CONFIG (config.js) + CONFIG.LANDING pour tout personnaliser
// ============================================================

(function(){

  // ---------- FALLBACK CONFIG si absent ----------
  const CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};
  const B   = CFG.business || {};
  const L   = CFG.LANDING || {};

  // ---------- LISTE DES SERVICES POUR LES MENUS ----------
  // Priorité : CONFIG.LANDING.services_menu > CONFIG.services > liste par défaut
  const servicesMenu = L.services_menu || (CFG.services ? CFG.services.map(s => ({
    id: s.id,
    nom: s.nom,
    icone: s.icone || '🔧',
    description: s.description || '',
    inclus: s.inclus || [],
    featured: !!s.featured,
  })) : [
    { id:'menage-maison', nom:'Nettoyage maison', icone:'🧽',
      description:'Ménage complet de votre domicile, en profondeur.',
      inclus:['Sols, vitres, sanitaires','Cuisine dégraissée','Poussière & surfaces'], featured:false },
    { id:'menage-pro', nom:'Nettoyage bureau / local pro', icone:'🏢',
      description:'Entretien régulier ou ponctuel de vos locaux.',
      inclus:['Bureaux & open-space','Sanitaires & accueil','Vitrerie'], featured:false },
    { id:'jardin', nom:'Entretien jardin', icone:'🌱',
      description:'Remise en état et entretien régulier de vos espaces verts.',
      inclus:['Tonte & débroussaillage','Taille de haies','Évacuation déchets verts'], featured:false },
    { id:'debroussaillage', nom:'Débroussaillage', icone:'🪓',
      description:'Nettoyage de terrains, friches et zones envahies.',
      inclus:['Coupe végétation dense','Élagage','Évacuation'], featured:false },
    { id:'karcher-terrasse', nom:'Karcher terrasse / façade', icone:'💦',
      description:'Nettoyage haute pression de vos surfaces extérieures.',
      inclus:['Terrasses & dalles','Façades & murs','Allées & clôtures'], featured:true },
    { id:'karcher-voiture', nom:'Karcher voiture', icone:'🚗',
      description:'Nettoyage extérieur soigné de votre véhicule à domicile.',
      inclus:['Carrosserie','Jantes','Pas de portes'], featured:false },
    { id:'vitres', nom:'Lavage vitres', icone:'🪟',
      description:'Vitres impeccables, sans traces, intérieur et extérieur.',
      inclus:['Vitres & baies','Encadrements','Miroirs'], featured:false },
    { id:'autre', nom:'Autre prestation', icone:'🔧',
      description:'Une demande particulière ? Parlons-en.',
      inclus:['Devis gratuit 24h','Intervention sur mesure'], featured:false },
  ]);

  // ---------- COORDONNÉES ----------
  const TEL       = B.telephone || '0690 67 30 85';
  const TEL_CLEAN = (B.telephone_clean || '+590690673085').replace(/[^\d+]/g,'');
  const WHATSAPP  = L.whatsapp || TEL_CLEAN.replace('+','');
  const EMAIL     = B.email || 'contact@wassou-services.fr';
  const ADRESSE   = B.adresse || 'Toute la Guadeloupe';
  const HORAIRES  = B.horaires || 'Lun – Sam : 7h – 18h';
  const BIZ_NAME  = B.nom || 'Wassou Multiservices';
  const SLOGAN    = B.slogan || 'Services à domicile en Guadeloupe';

  // ---------- TEXTES LANDING (surchargeables via CONFIG.LANDING.textes) ----------
  const T = Object.assign({
    nav_logo: 'Wassou',
    hero_title_html: 'Vos services à domicile,<br/><span class="hl">simples</span> et <span class="hl-gold">soignés</span>.',
    hero_sub: 'Jardinage, kärcher, nettoyage, débroussaillage… une équipe locale de confiance pour particuliers et professionnels.',
    about_title: 'Une entreprise locale, des prestations soignées.',
    about_text: BIZ_NAME + ' intervient partout en Guadeloupe pour le nettoyage et l\'entretien de vos espaces, qu\'ils soient privés ou professionnels. Notre équipe vous garantit ponctualité, qualité de finition et matériel professionnel.',
    footer_desc: SLOGAN + '.',
  }, L.textes || {});

  // ---------- INIT ----------
  document.addEventListener('DOMContentLoaded', () => {
    injectStatic();
    renderServices();
    fillServiceSelects();
    bindNav();
    bindForms();
    bindCta();
    bindPageTransitions();
    bindScrollReveal();
    setMinDate();
  });

  // ---------- TEXTES STATIQUES ----------
  function injectStatic(){
    setText('navLogoText', T.nav_logo);
    setHTML('heroTitle', T.hero_title_html);
    setText('heroSub', T.hero_sub);
    setText('aboutTitle', T.about_title);
    setText('aboutText', T.about_text);
    setText('footerName', BIZ_NAME);
    setText('footerDesc', T.footer_desc);
    setText('footerTel', '📞 ' + TEL);
    setText('footerMail', '✉️ ' + EMAIL);
    setText('footerAdresse', '📍 ' + ADRESSE);
    setText('footerHoraires', '🕒 ' + HORAIRES);
    setText('footerYear', new Date().getFullYear());

    // Footer : liste services
    const fs = document.getElementById('footerServices');
    if (fs){
      fs.innerHTML = servicesMenu.slice(0,5).map(s => `<li>${s.icone || '•'} ${s.nom}</li>`).join('');
    }

    // CTA contact
    const phoneBtn = document.getElementById('ctaPhone');
    const waBtn    = document.getElementById('ctaWhatsapp');
    if (phoneBtn) phoneBtn.href = 'tel:' + TEL_CLEAN;
    if (waBtn)    waBtn.href    = waLink('Bonjour, je souhaite plus d\'informations sur vos services.');

    // Titre dynamique
    document.title = BIZ_NAME + ' — ' + SLOGAN;
  }

  // ---------- SERVICES GRID ----------
  function renderServices(){
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = servicesMenu
      .filter(s => s.id !== 'autre')
      .map(s => `
        <article class="service-card reveal ${s.featured ? 'featured' : ''}">
          ${s.featured ? '<span class="service-badge">Populaire</span>' : ''}
          <div class="service-icon">${s.icone || '🔧'}</div>
          <h3>${s.nom}</h3>
          <p>${s.description || ''}</p>
          <ul>${(s.inclus || []).map(i => `<li>${i}</li>`).join('')}</ul>
        </article>
      `).join('');
  }

  // ---------- SELECTS SERVICES (RDV + Devis) ----------
  function fillServiceSelects(){
    const opts = servicesMenu
      .map(s => `<option value="${escapeAttr(s.nom)}">${s.icone || ''} ${s.nom}</option>`)
      .join('');
    ['rdv-service','devis-service'].forEach(id => {
      const sel = document.getElementById(id);
      if (sel){
        // Conserve la première option "Choisir"
        const first = sel.querySelector('option');
        sel.innerHTML = '';
        if (first) sel.appendChild(first);
        sel.insertAdjacentHTML('beforeend', opts);
      }
    });
  }

  // ---------- NAV ----------
  function bindNav(){
    const nav = document.getElementById('nav');
    const burger = document.getElementById('navBurger');
    const mobile = document.getElementById('navMobile');

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive:true });

    if (burger && mobile){
      burger.addEventListener('click', () => {
        const open = mobile.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      mobile.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobile.classList.remove('open');
          burger.setAttribute('aria-expanded','false');
        });
      });
    }
  }

  // ---------- DATE MINIMALE = aujourd'hui ----------
  function setMinDate(){
    const d = new Date(); d.setHours(0,0,0,0);
    const iso = d.toISOString().split('T')[0];
    const dateInput = document.getElementById('rdv-date');
    if (dateInput) dateInput.min = iso;
  }

  // ---------- FORMULAIRES ----------
  function bindForms(){
    const formRdv   = document.getElementById('formRdv');
    const formDevis = document.getElementById('formDevis');

    if (formRdv){
      formRdv.addEventListener('submit', e => {
        e.preventDefault();
        if (!validate(formRdv)) return toast('Merci de remplir les champs requis.', 'error');

        const f = new FormData(formRdv);
        const msg = buildRdvMessage(f);
        openWhatsapp(msg);
        toast('Votre demande s\'ouvre sur WhatsApp…', 'success');
        formRdv.reset();
      });
    }

    if (formDevis){
      formDevis.addEventListener('submit', e => {
        e.preventDefault();
        if (!validate(formDevis)) return toast('Merci de remplir les champs requis.', 'error');

        const f = new FormData(formDevis);
        const msg = buildDevisMessage(f);
        openWhatsapp(msg);
        toast('Votre demande de devis s\'ouvre sur WhatsApp…', 'success');
        formDevis.reset();
      });
    }
  }

  function validate(form){
    let ok = true;
    form.querySelectorAll('[required]').forEach(el => {
      const empty = !String(el.value || '').trim();
      el.classList.toggle('error', empty);
      if (empty) ok = false;
    });
    return ok;
  }

  function buildRdvMessage(f){
    const lines = [
      '🌿 *Nouvelle demande de RENDEZ-VOUS*',
      '',
      '👤 *Nom :* ' + (f.get('nom')||''),
      '📞 *Téléphone :* ' + (f.get('tel')||''),
      f.get('email') ? '✉️ *Email :* ' + f.get('email') : null,
      '🔧 *Service :* ' + (f.get('service')||''),
      '📅 *Date souhaitée :* ' + formatDateFR(f.get('date')),
      '📍 *Adresse :* ' + (f.get('adresse')||''),
      f.get('message') ? '\n💬 *Message :*\n' + f.get('message') : null,
      '',
      '— Envoyé depuis le site ' + BIZ_NAME,
    ].filter(Boolean);
    return lines.join('\n');
  }

  function buildDevisMessage(f){
    const lines = [
      '💰 *Nouvelle demande de DEVIS*',
      '',
      '👤 *Nom :* ' + (f.get('nom')||''),
      '📞 *Téléphone :* ' + (f.get('tel')||''),
      '🏷️ *Type :* ' + (f.get('type')||''),
      '🔧 *Service :* ' + (f.get('service')||''),
      '',
      '📝 *Description du projet :*',
      f.get('description') || '',
      '',
      '— Envoyé depuis le site ' + BIZ_NAME,
    ].filter(Boolean);
    return lines.join('\n');
  }

  function openWhatsapp(message){
    const url = waLink(message);
    window.open(url, '_blank', 'noopener');
  }

  function waLink(message){
    const num = String(WHATSAPP).replace(/[^\d]/g,'');
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(message);
  }

  // ---------- BOUTONS NAV-CTA ----------
  function bindCta(){
    // (rien de plus, le bouton "Connexion" déclenche déjà la transition via .js-nav)
  }

  // ---------- TRANSITION ENTRE PAGES ----------
  function bindPageTransitions(){
    const overlay = document.getElementById('pageTransition');
    if (!overlay) return;

    // Tous les liens vers une autre page interne avec class .js-nav
    document.querySelectorAll('.js-nav').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('data-href') || a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http')) return;
        e.preventDefault();
        overlay.classList.add('active');
        setTimeout(() => { window.location.href = href; }, 550);
      });
    });
  }

  // ---------- SCROLL REVEAL (services + sections) ----------
  function bindScrollReveal(){
    // Ajoute .reveal aux éléments cibles
    document.querySelectorAll('.section-head, .form-card, .about-content, .about-visual, .hero-stats')
      .forEach(el => el.classList.add('reveal'));

    if (!('IntersectionObserver' in window)){
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting){
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold:.12, rootMargin:'0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // ---------- UTILS ----------
  function setText(id, v){ const el = document.getElementById(id); if (el) el.textContent = v; }
  function setHTML(id, v){ const el = document.getElementById(id); if (el) el.innerHTML = v; }
  function escapeAttr(s){ return String(s).replace(/"/g,'&quot;'); }
  function formatDateFR(iso){
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
  }

  function toast(msg, type){
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show ' + (type || '');
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.classList.remove('show'); }, 3200);
  }

})();
