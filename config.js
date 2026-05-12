// ============================================================
//  WASSOU MULTISERVICES — CONFIG CENTRALE v2.0
//  Fichier UNIQUE pour personnaliser tout le site & l'app.
//  Modifie ici, le reste du code n'a pas à être touché.
//  Powered by NexusAI Agency
// ============================================================

const CONFIG = {

  // -----------------------------------------------------------
  // 1. ENTREPRISE — Informations principales
  // -----------------------------------------------------------
  business: {
    nom: "Wassou Multiservices",
    slogan: "Services à domicile en Guadeloupe",
    description: "Jardinage, Kärcher et entretien extérieur. Réservez en ligne, confirmation par SMS.",
    logo_url: "assets/logo.svg",          // Remplace par ton logo (PNG ou SVG)
    logo_text: "🌿",                       // Fallback emoji si logo_url indispo
    favicon: "assets/favicon.ico",
    telephone: "0690 67 30 85",
    telephone_clean: "+590690673085",      // Format international (pour wa.me)
    email: "contact@wassou-services.fr",
    adresse: "Toute la Guadeloupe",
    siret: "",                             // Ton SIRET ici (apparaît sur les devis)
    tva_intracom: "",                      // Optionnel
    horaires: "Lun – Sam : 7h – 18h",
    zone: "Guadeloupe",
  },

  // -----------------------------------------------------------
  // 2. BRANDING — Charte graphique (vert forêt + or)
  // -----------------------------------------------------------
  branding: {
    couleurs: {
      primary: "#1b4332",        // Vert forêt principal
      primary_light: "#2d6a4f",
      primary_lighter: "#40916c",
      primary_pale: "#52b788",
      gold: "#d4a017",           // Or — accents premium
      gold_light: "#f0c040",
      bg: "#f5faf7",
      bg_pale: "#e8f5e9",
      text: "#163126",
      text_soft: "#555",
      danger: "#dc2626",
      success: "#16a34a",
      warning: "#f59e0b",
    },
    polices: {
      titres: "'Sora', system-ui, sans-serif",
      corps: "'DM Sans', system-ui, sans-serif",
    },
  },

  // -----------------------------------------------------------
  // 3. LIENS — Réseaux sociaux & externes (modifiables à volonté)
  // -----------------------------------------------------------
  liens: {
    site_public: "https://drayk973.github.io/Wassou-services-/",
    facebook: "",                          // ex: "https://facebook.com/wassou"
    instagram: "",                         // ex: "https://instagram.com/wassou"
    tiktok: "",
    youtube: "",
    linkedin: "",
    google_maps: "",                       // Lien Google Business
    google_reviews: "",                    // Lien pour laisser un avis
    whatsapp: "https://wa.me/c/590690673085",
    catalogue_pdf: "",                     // Lien vers ton catalogue
    cgv_pdf: "",                           // Conditions générales
    mentions_legales: "",
  },

  // -----------------------------------------------------------
  // 4. PWA — Application mobile installable
  // -----------------------------------------------------------
  pwa: {
    popup_active: true,
    delai_avant_popup_ms: 3000,            // 3 secondes après arrivée
    delai_reapparition_ms: 45000,          // Re-popup toutes les 45s si refusée
    refus_cooldown_jours: 7,               // (legacy, plus utilisé en mode bloquant)
    titre: "📲 Installer Wassou",
    sous_titre: "Accès rapide depuis votre écran d'accueil",
    bouton_installer: "Installer",
    bouton_plus_tard: "Plus tard",
    instructions_ios: "Touche le bouton Partager puis 'Sur l'écran d'accueil'",
    instructions_android: "Clique sur Installer pour ajouter l'app à ton écran d'accueil",
  },

  // -----------------------------------------------------------
  // 5. AUTHENTIFICATION — Admin (login) + Agents (PIN)
  //    Mots de passe & PINs hashés en SHA-256 côté client.
  //    Génère un hash sur https://emn178.github.io/online-tools/sha256.html
  // -----------------------------------------------------------
  auth: {
    session_duree_heures: 8,               // Déconnexion auto après 8h
    session_inactivity_minutes: 30,        // Déconnexion si inactif 30 min
    redirect_after_login: {
      admin: "dashboard-admin.html",
      agent: "dashboard-agent.html",
    },
    redirect_logout: "login.html",

    // ADMINS — login + mot de passe (mot de passe en SHA-256)
    admins: [
      {
        id: "admin-1",
        nom: "Obrayan",
        email: "obrayan@wassou-services.fr",
        login: "admin",
        // Mot de passe par défaut : "wassou2026" (À CHANGER)
        password_sha256: "8d7d2216a1721c28d6a4b804ecf78ef3e2b2f50cbbb2429a92feebbe7e62d24c",
        avatar: "👨‍💼",
      },
      // Ajoute d'autres admins ici si besoin
    ],

    // AGENTS — PIN à 4 chiffres (PIN en SHA-256)
    agents: [
      {
        id: "agent-1",
        nom: "Kevin Rosine",
        prenom: "Kevin",
        role: "Agent terrain",
        specialites: ["jardin", "karcher"],
        telephone: "0690 XX XX XX",
        // PIN par défaut : "1234" (À CHANGER pour chaque agent)
        pin_sha256: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
        avatar: "🧑‍🌾",
        actif: true,
      },
      {
        id: "agent-2",
        nom: "Sonia Victoire",
        prenom: "Sonia",
        role: "Agent terrain",
        specialites: ["karcher"],
        telephone: "0690 XX XX XX",
        // PIN par défaut : "5678"
        pin_sha256: "f8638b979b2f4f793ddb6dbd197e0ee25a7a6ea32b0ae22f5e3c5d119d839e75",
        avatar: "👩‍🌾",
        actif: true,
      },
    ],
  },

  // -----------------------------------------------------------
  // 6. PAIEMENT — Encaissement total + acomptes
  //    Active/désactive chaque méthode selon ton besoin.
  // -----------------------------------------------------------
  paiement: {
    devise: "EUR",
    devise_symbole: "€",
    acompte_min_pct: 30,                   // Acompte minimum requis (% du total)
    acompte_max_pct: 50,                   // Acompte maximum proposé
    tva_taux: 0,                           // 0 si auto-entrepreneur (pas de TVA), 8.5 pour Guadeloupe sinon
    mention_tva_si_zero: "TVA non applicable, art. 293 B du CGI",

    methodes: {
      stripe: {
        active: true,
        label: "💳 Carte bancaire",
        public_key: "",                    // pk_live_xxx ou pk_test_xxx
        compte_dashboard: "https://dashboard.stripe.com",
        // Lien de paiement Stripe (créé depuis ton dashboard Stripe)
        // Tu peux laisser vide et utiliser des liens à la volée
        lien_paiement_template: "",
      },
      virement: {
        active: true,
        label: "🏦 Virement bancaire",
        titulaire: "Wassou Multiservices",
        iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
        bic: "XXXXXXXX",
        banque: "Crédit Agricole Guadeloupe",
        reference_template: "DEVIS-{numero}",
      },
      especes: {
        active: true,
        label: "💵 Espèces sur place",
        instruction: "Paiement en espèces directement à l'agent à la fin de l'intervention.",
      },
      // Méthodes préparées mais désactivées (active: true pour les utiliser)
      paypal: {
        active: false,
        label: "🅿️ PayPal",
        merchant_id: "",
        email: "",
      },
      alma: {
        active: false,
        label: "🟣 Alma (3x/4x)",
        api_key: "",
        merchant_id: "",
      },
      klarna: {
        active: false,
        label: "🌸 Klarna",
        username: "",
      },
      cheque: {
        active: false,
        label: "✏️ Chèque",
        ordre: "Wassou Multiservices",
        adresse_envoi: "",
      },
    },
  },

  // -----------------------------------------------------------
  // 7. SERVICES PROPOSÉS — Catalogue (apparaît partout)
  // -----------------------------------------------------------
  services: [
    {
      id: "jardin",
      nom: "Entretien jardin",
      icone: "🌱",
      prix_base: 80,
      unite: "intervention",
      duree_min: 90,                       // minutes
      description: "Remise en état et entretien régulier de vos espaces verts.",
      inclus: [
        "Tonte et débroussaillage",
        "Taille de haies",
        "Désherbage",
        "Évacuation déchets verts",
      ],
      featured: false,
    },
    {
      id: "karcher",
      nom: "Nettoyage Kärcher",
      icone: "💦",
      prix_base: 60,
      unite: "intervention",
      duree_min: 60,
      description: "Nettoyage haute pression de toutes vos surfaces extérieures.",
      inclus: [
        "Terrasses et dalles",
        "Façades et murs",
        "Cours et allées",
        "Clôtures et portails",
      ],
      featured: true,
    },
    {
      id: "autre",
      nom: "Services sur mesure",
      icone: "🔧",
      prix_base: 0,
      unite: "devis",
      duree_min: 0,
      description: "Toute autre prestation extérieure selon vos besoins spécifiques.",
      inclus: [
        "Devis gratuit sous 24h",
        "Intervention flexible",
        "Prestation adaptée",
      ],
      featured: false,
    },
  ],

  // -----------------------------------------------------------
  // 8. DEVIS & FACTURES — Réglages
  // -----------------------------------------------------------
  devis: {
    prefixe: "DEV",                        // DEV-2026-0001
    prefixe_facture: "FAC",                // FAC-2026-0001
    duree_validite_jours: 30,
    delai_intervention_jours: 7,
    pied_de_page: "Merci de votre confiance — Wassou Multiservices",
    mentions_legales: "Devis valable 30 jours. Acompte requis pour confirmation. Facture émise après prestation.",
    conditions_generales: "Le client s'engage à fournir un accès libre au lieu d'intervention. En cas d'annulation moins de 24h avant, l'acompte reste acquis.",
    pdf: {
      format_complet: true,                // PDF détaillé avec logo + mentions
      format_simple: true,                 // Version impression rapide
      afficher_signature: true,
      afficher_iban: true,
    },
  },

  // -----------------------------------------------------------
  // 9. NOTIFICATIONS — SMS / Email / WhatsApp
  // -----------------------------------------------------------
  notifications: {
    sms: {
      provider: "manuel",                  // "manuel" | "twilio" | "ovh" | "make"
      api_key: "",
      from: "Wassou",
      modeles: {
        confirmation_rdv: "Bonjour {prenom}, votre RDV {service} est confirmé pour le {date}. À bientôt — Wassou Multiservices.",
        rappel_veille: "Rappel : intervention {service} demain à {heure}. Wassou Multiservices.",
        devis_envoye: "Bonjour {prenom}, votre devis n°{numero} est disponible : {lien}. Wassou.",
        paiement_recu: "Merci {prenom} ! Paiement de {montant}€ bien reçu. Wassou Multiservices.",
      },
    },
    email: {
      provider: "manuel",                  // "manuel" | "smtp" | "sendgrid" | "make"
      smtp_host: "",
      smtp_port: 587,
      smtp_user: "",
      smtp_pass: "",
    },
    whatsapp: {
      lien_business: "https://wa.me/c/590690673085",
      numero: "+590690673085",
    },
  },

  // -----------------------------------------------------------
  // 10. AGENT IA — Configuration complète v2.1
  //     L'agent AI prend les RDV et répond aux messages clients.
  //     Le code orchestrateur tourne dans Make.com (voir guide).
  //     Cette config sert de référence et est lue par le dashboard.
  // -----------------------------------------------------------
  ia_agent: {
    active: true,                              // ✅ Activé
    nom: "Wassou Assistant",                   // Nom affiché côté client
    avatar: "🌿",

    // ── MODÈLE & API ─────────────────────────────────────────
    provider: "anthropic",
    model: "claude-sonnet-4-6",                // Sonnet = 5x moins cher qu'Opus pour RDV
    api_key_storage: "make_com_secret",        // ⚠️ Clé stockée dans Make, JAMAIS ici
    max_tokens_per_response: 1000,             // Limite la longueur des réponses
    max_cost_per_day_eur: 5,                   // 🛡️ Garde-fou : stoppe à 5€/jour

    // ── PROMPT SYSTÈME (personnalité de l'agent) ────────────
    prompt_systeme: `Tu es Wassou Assistant, l'assistant virtuel de Wassou Multiservices en Guadeloupe.

Tu réponds aux clients par WhatsApp et email pour :
1. Prendre des rendez-vous (jardinage, kärcher, entretien extérieur)
2. Répondre aux questions sur les services et tarifs
3. Confirmer les RDV et envoyer des rappels
4. Gérer les annulations et reports

RÈGLES STRICTES :
- Toujours en français, ton chaleureux et créole-friendly ("a plus", "à bientôt")
- Toujours signer "— Équipe Wassou 🌿"
- Si le client veut un RDV : demande nom, adresse en Guadeloupe, service souhaité, date/heure préférée
- Tu ne donnes JAMAIS de prix exact (renvoie vers un devis : "Notre équipe vous fera un devis personnalisé")
- Tu ne parles JAMAIS de paiement (ce n'est pas ton rôle)
- Si question hors-sujet ou difficile : "Je transmets votre demande à Obrayan, il vous rappelle dans la journée"
- Si urgence (dégât d'eau, arbre tombé, etc.) : donne le numéro 0690 67 30 85 directement

INFORMATIONS UTILES :
- Zone : Toute la Guadeloupe
- Horaires : Lun-Sam 7h-18h
- Services : jardinage, kärcher, entretien extérieur, débroussaillage, taille de haies
- Délai minimum : 1 jour (pas de RDV pour aujourd'hui)
- Créneau standard : 1h30

Tu as accès aux outils suivants :
- check_disponibilite(date, heure) → vérifie l'agenda
- creer_rdv(client_data) → crée le RDV dans le système
- envoyer_sms(numero, message) → envoie un SMS de confirmation
- escalader_admin(raison) → notifie Obrayan en cas de problème`,

    // ── DISPONIBILITÉS (règles métier) ──────────────────────
    regles_disponibilite: {
      jours_ouvres: [1, 2, 3, 4, 5, 6],         // 0=dim, 1=lun, ... 6=sam
      heure_debut: "07:00",
      heure_fin: "18:00",
      duree_creneau_min: 90,                    // Minutes par RDV
      delai_min_jours: 1,                       // Pas de RDV aujourd'hui
      delai_max_jours: 30,                      // Max 30 jours d'avance
      pause_dejeuner: { debut: "12:00", fin: "13:30" },
      jours_feries_2026: [
        "2026-01-01", "2026-04-06", "2026-05-01", "2026-05-08",
        "2026-05-25", "2026-06-04", "2026-07-14", "2026-08-15",
        "2026-11-01", "2026-11-11", "2026-12-25"
      ],
    },

    // ── CANAUX ACTIFS ───────────────────────────────────────
    canaux: {
      whatsapp_business: {
        active: true,
        phone_number_id: "",                    // À remplir depuis Meta Business
        verify_token: "",                       // Token de vérification webhook
        webhook_make: "",                       // URL Make.com
      },
      email: {
        active: true,
        adresse: "contact@wassou-services.fr",
        signature: "— Équipe Wassou Multiservices 🌿\nGuadeloupe • 0690 67 30 85",
        webhook_make: "",                       // URL Make.com
      },
      formulaire_web: {
        active: true,
        endpoint: "",                           // URL du formulaire public
        webhook_make: "",
      },
    },

    // ── ESCALADE & SUPERVISION ──────────────────────────────
    escalade: {
      mots_cles_urgence: [
        "urgence", "urgent", "tout de suite", "immédiat",
        "dégât", "fuite", "arbre tombé", "danger"
      ],
      mots_cles_reclamation: [
        "remboursement", "avocat", "tribunal", "honteux",
        "scandale", "porter plainte", "arnaque"
      ],
      notifier_admin_si: ["urgence", "reclamation", "client_recurrent_mecontent"],
      admin_notification_canal: "sms",          // sms | email | push
      admin_telephone: "0690 67 30 85",
    },

    // ── INTÉGRATIONS (où vont les données) ──────────────────
    integrations: {
      make_webhook_url: "",                     // ⚠️ À coller après scénario Make
      google_sheets_id: "",                     // ID du Sheet "base données"
      google_calendar_id: "",                   // ID Calendar Wassou
    },

    // ── SUPERVISION (visible dans dashboard admin) ──────────
    supervision: {
      log_conversations: true,                  // Enregistre toutes les conv'
      affiche_dashboard: true,                  // Onglet "Agent IA"
      pause_active: false,                      // Mode "Je reprends la main"
      stats_quotidiennes: true,                 // RDV pris, msg traités, coût
    },
  },

  // -----------------------------------------------------------
  // 11. AVANCÉ — Sécurité & développement
  // -----------------------------------------------------------
  // -----------------------------------------------------------
  //  🔧 MAINTENANCE NEXUSAI — CACHÉ DU CLIENT
  //  Cette section gère le contrat de maintenance et alertes techniques
  //  Le client (Wassou) ne voit RIEN de cette section dans le dashboard.
  //  Accès au panneau caché : 6 clics rapides sur le logo Wassou.
  // -----------------------------------------------------------
  nexus_maintenance: {
    active: true,
    agency_name: "NexusAI Agency",
    agency_email: "client.shopnova@gmail.com",   // ⚠️ Modifiable plus tard
    agency_phone: "+596696531755",                // Numéro Obrayan (NexusAI)
    
    // Compte admin secret (login séparé pour panneau caché)
    secret_admin: {
      login: "nexus",
      // Mot de passe par défaut "nexus2026" en SHA-256 — À CHANGER
      password_sha256: "ff0a5f39b703f6d02441f3b42aa02af28bc400cd8193ffd8fb1f4c4d245444c5",
      role_label: "Support technique"
    },
    
    // Comment vous accédez au panneau caché
    secret_unlock: {
      methode: "logo_clicks",                     // 6 clics rapides sur le logo
      nb_clics: 6,
      delai_max_ms: 3000,                         // Dans les 3 secondes
    },
    
    // Canaux d'alerte pour VOUS (NexusAI uniquement)
    alertes_techniques: {
      // 1. Push notifications PWA (gratuit, instantané)
      push_notifications: {
        active: true,
        // Le navigateur de Obrayan reçoit les alertes
      },
      
      // 2. Telegram Bot (gratuit, fiable, illimité — RECOMMANDÉ)
      telegram: {
        active: false,                            // À activer après configuration
        bot_token: "",                            // Voir guide TELEGRAM_SETUP.md
        chat_id: "68944659",                              // Votre chat ID Telegram
      },
      
      // 3. Email de fallback
      email: {
        active: true,
        adresse: "client.shopnova@gmail.com",
      },
      
      // 4. Webhook Make.com (relai pour multiples canaux)
      make_webhook: "",                           // À coller depuis Make
    },
    
    // Seuils de surveillance crédits Anthropic
    surveillance_credits: {
      budget_mensuel_eur: 20,                     // Budget mensuel prévu
      seuils_alerte: {
        attention: 50,                            // Alerte à 50% (10€ restant)
        urgent: 25,                               // Urgent à 25% (5€ restant)
        critique: 10,                             // Critique à 10% (2€ restant)
      },
      check_frequency_minutes: 30,                // Vérif toutes les 30 min
      mode_silencieux_nuit: {
        active: true,
        debut: "22:00",
        fin: "07:00",                             // Pas de SMS la nuit
      },
    },
    
    // Si crédits à 0 : mode dégradé
    mode_degrade: {
      message_client: "Bonjour, votre message a bien été reçu. Notre équipe vous rappelle dans la journée. Merci de votre patience 🌿\n— Équipe Wassou",
      stocker_dans_sheet: true,                   // Sauve les msg pour traitement manuel
      notifier_admin_immediat: true,              // SMS immédiat à NexusAI
    },
    
    // Stats facturation (pour le contrat maintenance)
    facturation: {
      forfait_mensuel_eur: 49,
      forfait_annuel_eur: 468,                    // 39€/mois si engagement annuel
      inclus_dans_forfait: {
        rdv_par_mois: 200,
        sms_clients: 500,
        stockage_photos_go: 5,
        support_heures_mensuel: 2,
      },
      depassement: {
        rdv_supplementaire: 0.50,                 // €/RDV au-delà de 200
        heure_support_sup: 60,                    // €/heure
      },
    },

    // ----------------------------------------------------------
    // 🆕 CLÉ API ANTHROPIC (CACHÉE — visible UNIQUEMENT depuis le panel Nexus)
    // ----------------------------------------------------------
    // ⚠️ NE JAMAIS COMMITTER UNE VRAIE CLÉ ICI DANS UN REPO PUBLIC.
    // Saisir plutôt depuis le panel Nexus (modal "🔑 Gérer les clés API")
    // → stockage en localStorage côté navigateur uniquement.
    // Si tu mets une valeur ici, elle sera utilisée par défaut (override
    // possible via localStorage).
    anthropic: {
      api_key: "",                                // ← laisse vide, saisis-la dans Nexus
      modele: "claude-sonnet-4-5",
      // Tarif estimé (USD pour 1M tokens) — utilisé pour le tracking local
      tarif_input_per_mtok: 3.00,
      tarif_output_per_mtok: 15.00,
      // Taux EUR/USD pour conversion (modifiable)
      taux_eur_usd: 0.92,
    },

    // ----------------------------------------------------------
    // 🆕 CYCLE DE FACTURATION + RAPPORT MENSUEL TELEGRAM
    // ----------------------------------------------------------
    // Une fois la mensualité activée, un rapport est envoyé au bot Telegram
    // au jour J configuré (par défaut le 1er du mois à 9h).
    cycle_facturation: {
      // Jour du mois où démarre la facturation (1-28)
      jour_debut_mois: 1,
      // Date d'activation initiale (auto-remplie au 1er enregistrement de la clé)
      date_activation: "",                        // ISO yyyy-mm-dd ou vide
      // Forfait actif ?
      actif: false,
    },

    rapport_mensuel: {
      active: true,                               // Envoi auto le jour J
      heure_envoi: "09:00",                       // Format HH:MM
      // Contenu inclus dans le rapport
      inclure: {
        rdv: true,
        ca: true,
        marge: true,
        credits_ia: true,
        alertes: true,
        sms: true,
      },
      // Template du message (Markdown Telegram)
      template: `📊 *Rapport mensuel Wassou — {mois}*

🗓️ *Activité*
• RDV pris : *{rdv_count}* / {rdv_inclus}
• CA encaissé : *{ca_total} €*
• Devis émis : *{devis_count}*
• SMS envoyés : *{sms_count}*

💰 *Finances*
• Forfait mensuel : {forfait} €
• Marge ce mois : *{marge} €*
• Statut paiement : {statut_paiement}

🤖 *Agent IA*
• Crédits dépensés : *{credits_spent} €* / {credits_budget} €
• Solde restant : *{credits_remaining} €* ({credits_pct}%)
• Alertes du mois : {alertes_count}

🌿 _Bonne nouvelle journée — NexusAI_`,
    },
  },

  avance: {
    debug: false,                          // Affiche les logs détaillés
    version: "2.0.0",
    annee_copyright: 2026,
    powered_by: "NexusAI Agency",
    powered_by_url: "https://github.com/drayk973",
    storage_prefix: "wassou_",             // Préfixe pour localStorage
    backup_auto: true,                     // Sauvegarde auto chaque jour
    firebase: {
      active: false,                       // Active si tu branches Firebase
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
    },
  },

};

// ============================================================
// MERGE AUTOMATIQUE DE L'OVERRIDE (modifs depuis parametres.html)
// ============================================================
(function applyOverride() {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem((CONFIG.avance.storage_prefix || 'wassou_') + 'config_override');
    if (!raw) return;
    const override = JSON.parse(raw);
    function deepMerge(target, source) {
      for (const k of Object.keys(source)) {
        if (Array.isArray(source[k])) {
          target[k] = source[k];
        } else if (source[k] && typeof source[k] === 'object') {
          if (!target[k]) target[k] = {};
          deepMerge(target[k], source[k]);
        } else {
          target[k] = source[k];
        }
      }
    }
    deepMerge(CONFIG, override);
  } catch (e) { console.warn('[Wassou] Override invalide, ignoré', e); }

  // Override agents (depuis agents.html)
  try {
    const ag = localStorage.getItem((CONFIG.avance.storage_prefix || 'wassou_') + 'agents_override');
    if (ag) {
      const arr = JSON.parse(ag);
      if (Array.isArray(arr)) CONFIG.auth.agents = arr;
    }
  } catch (e) {}
})();

// ============================================================
// 🌿 LANDING PAGE — Personnalisation de l'accueil public (index.html)
// ============================================================
// Modifie cette section pour personnaliser la landing SANS toucher au code.
// ------------------------------------------------------------
CONFIG.LANDING = {

  // Numéro WhatsApp où arrivent les demandes RDV + Devis
  // Format international SANS le "+", SANS espaces. Ex : "590690673085"
  whatsapp: "590690673085",

  // Textes principaux (HTML autorisé pour le titre hero)
  textes: {
    nav_logo: "Wassou",
    hero_title_html: 'Vos services à domicile,<br/><span class="hl">simples</span> et <span class="hl-gold">soignés</span>.',
    hero_sub: "Jardinage, kärcher, nettoyage, débroussaillage… une équipe locale de confiance pour particuliers et professionnels.",
    about_title: "Une entreprise locale, des prestations soignées.",
    about_text: "Wassou Multiservices intervient partout en Guadeloupe pour le nettoyage et l'entretien de vos espaces, qu'ils soient privés ou professionnels. Notre équipe vous garantit ponctualité, qualité de finition et matériel professionnel.",
    footer_desc: "Services à domicile en Guadeloupe.",
  },

  // Menu déroulant des services (RDV + Devis) + cartes services
  // Si laissé vide, la landing utilisera CONFIG.services (section 7) en fallback.
  services_menu: [
    { id:"menage-maison", nom:"Nettoyage maison", icone:"🧽",
      description:"Ménage complet de votre domicile, en profondeur.",
      inclus:["Sols, vitres, sanitaires","Cuisine dégraissée","Poussière & surfaces"], featured:false },
    { id:"menage-pro", nom:"Nettoyage bureau / local pro", icone:"🏢",
      description:"Entretien régulier ou ponctuel de vos locaux professionnels.",
      inclus:["Bureaux & open-space","Sanitaires & accueil","Vitrerie"], featured:false },
    { id:"jardin", nom:"Entretien jardin", icone:"🌱",
      description:"Remise en état et entretien régulier de vos espaces verts.",
      inclus:["Tonte & débroussaillage","Taille de haies","Évacuation déchets verts"], featured:false },
    { id:"debroussaillage", nom:"Débroussaillage", icone:"🪓",
      description:"Nettoyage de terrains, friches et zones envahies.",
      inclus:["Coupe végétation dense","Élagage","Évacuation"], featured:false },
    { id:"karcher-terrasse", nom:"Karcher terrasse / façade", icone:"💦",
      description:"Nettoyage haute pression de vos surfaces extérieures.",
      inclus:["Terrasses & dalles","Façades & murs","Allées & clôtures"], featured:true },
    { id:"karcher-voiture", nom:"Karcher voiture", icone:"🚗",
      description:"Nettoyage extérieur soigné de votre véhicule à domicile.",
      inclus:["Carrosserie","Jantes","Pas de portes"], featured:false },
    { id:"vitres", nom:"Lavage vitres", icone:"🪟",
      description:"Vitres impeccables, sans traces, intérieur et extérieur.",
      inclus:["Vitres & baies","Encadrements","Miroirs"], featured:false },
    { id:"autre", nom:"Autre prestation", icone:"🔧",
      description:"Une demande particulière ? Parlons-en, devis sous 24h.",
      inclus:["Devis gratuit 24h","Intervention sur mesure"], featured:false },
  ],

};

// ============================================================
// 💬 SUPPORT TECHNIQUE — Bouton chatbot Telegram (sidebar admin)
// ============================================================
// Bouton "Support" affiché dans la sidebar de l'application (zone admin
// connectée). PAS VISIBLE sur la landing publique.
// Au clic → ouvre le chatbot Telegram NexusAI.
CONFIG.SUPPORT = {
  active: true,
  label: "Support NexusAI",
  // Lien direct vers le bot Telegram chatbot
  telegram_url: "https://t.me/nexusai_wassou_bot",
  // Message pré-rempli (optionnel — ajouté en query ?start=)
  start_payload: "support",
  // Icône affichée dans la sidebar
  icon: "💬",
  // Sous-titre dans la sidebar
  sublabel: "Aide en direct",
};

// Expose en global pour tous les autres scripts
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
