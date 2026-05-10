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
    refus_cooldown_jours: 7,               // Si refusé, ne re-popup pas avant 7 jours
    titre: "📲 Installer l'application",
    sous_titre: "Accède à Wassou en plein écran depuis ton téléphone",
    bouton_installer: "Installer",
    bouton_plus_tard: "Plus tard",
    instructions_ios: "Touche 'Partager' puis 'Sur l'écran d'accueil'",
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
  // 10. AGENT IA — Préparé, désactivé pour l'instant
  //     Active "active: true" + remplis les clés quand tu seras prêt.
  // -----------------------------------------------------------
  ia_agent: {
    active: false,                         // ⚠️ Mets true quand tu veux l'activer
    provider: "anthropic",                 // "anthropic" | "openai" | "make"
    model: "claude-sonnet-4-5",
    api_key: "",                           // sk-ant-xxx
    prompt_systeme: `Tu es l'assistant IA de Wassou Multiservices en Guadeloupe.
Tu prends les rendez-vous, vérifies les disponibilités sur l'agenda Google,
réponds aux clients en français, et programmes les interventions.
Sois chaleureux, professionnel et concis.`,
    google_calendar: {
      id: "",                              // ID du calendrier Google
      oauth_token: "",
    },
    email: {
      imap_user: "",
      imap_pass: "",
      smtp_user: "",
      smtp_pass: "",
    },
    whatsapp_webhook: "",
    regles_disponibilite: {
      jours_ouvres: [1, 2, 3, 4, 5, 6],   // 0=dim, 1=lun, ... 6=sam
      heure_debut: "07:00",
      heure_fin: "18:00",
      duree_creneau_min: 90,
      delai_min_jours: 1,                  // Pas de RDV pour aujourd'hui
      delai_max_jours: 30,
    },
    integrations: {
      make_webhook: "",                    // Pour automatiser via Make.com
      n8n_webhook: "",
      blotato_key: "",
    },
  },

  // -----------------------------------------------------------
  // 11. AVANCÉ — Sécurité & développement
  // -----------------------------------------------------------
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

// Expose en global pour tous les autres scripts
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
