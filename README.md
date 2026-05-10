# 🌿 Wassou Multiservices — Application v2.0

PWA complète de gestion pour ton activité de jardinage et nettoyage Kärcher en Guadeloupe.
**Site public + Back-office Admin/Agent + Devis & Paiements + Configuration centralisée.**

---

## 🚀 Démarrer en 3 minutes

### Option A — Test rapide (Netlify Drop)
1. Glisse-dépose le dossier `wassou-v2/` sur **https://app.netlify.com/drop**
2. Une URL temporaire est générée (ex: `https://nom-aleatoire.netlify.app`)
3. Connecte-toi avec les identifiants par défaut (voir plus bas)

### Option B — Déploiement GitHub Pages (production)
1. Pousse le dossier sur ton repo `Wassou-services-`
2. Active GitHub Pages : Settings → Pages → Branch `main` / dossier `root`
3. Ton site est en ligne sur `https://drayk973.github.io/Wassou-services-/`

### Option C — Local
1. Ouvre `index.html` directement (mais le service worker ne marchera qu'en HTTPS)
2. Ou utilise `python3 -m http.server` dans le dossier puis http://localhost:8000

---

## 🔑 Identifiants par défaut

| Type | Identifiant | Mot de passe / PIN |
|------|-------------|---------------------|
| **Admin** | `admin` | `wassou2026` |
| **Agent — Kevin** | sélection | PIN `1234` |
| **Agent — Sonia** | sélection | PIN `5678` |

> ⚠️ **Change ces identifiants AVANT toute mise en production !** Voir plus bas comment générer de nouveaux hashs SHA-256.

Page de connexion : **`/login.html`**

---

## 📂 Structure du projet

```
wassou-v2/
├── README.md                  ← Ce fichier
├── config.js                  ← TOUTES les options (modifie ici en priorité)
├── manifest.json              ← Configuration PWA
├── sw.js                      ← Service Worker (cache offline)
│
├── index.html                 ← Landing publique
├── login.html                 ← Connexion Admin/Agent
│
├── dashboard-admin.html       ← Vue globale (admin)
├── dashboard-agent.html       ← Vue limitée (agent)
│
├── clients.html               ← Liste clients (CRUD)
├── client-detail.html         ← Fiche client + historique
├── agents.html                ← Gestion agents (admin only)
├── interventions.html         ← Planning interventions
├── sms.html                   ← Envoi SMS / WhatsApp
├── devis.html                 ← Liste devis
├── devis-create.html          ← Création/édition devis + PDF
├── paiements.html             ← Encaissements
├── rapports.html              ← Statistiques + export CSV (admin only)
├── parametres.html            ← Configuration UI (admin only)
│
├── css/style.css              ← Design system complet
├── js/
│   ├── auth.js                ← Login + sessions sécurisées
│   ├── data.js                ← localStorage (clients, devis, etc.)
│   ├── app.js                 ← Helpers UI (toast, modal, format)
│   ├── payment.js             ← Stripe + Virement + Espèces
│   ├── pwa-install.js         ← Popup d'installation
│   └── sidebar.js             ← Menu latéral (généré dynamiquement)
├── assets/
│   ├── logo.svg               ← Logo (remplace par le tien)
│   └── favicon.png
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-192-maskable.png
    └── icon-512-maskable.png
```

---

## ⚙️ Personnalisation : tout se passe dans `config.js`

Le fichier `config.js` contient **12 sections** qui pilotent tout le site. Modifie ce fichier — pas besoin de toucher au code HTML.

### Sections disponibles

| Section | Contenu |
|---------|---------|
| `business` | Nom, slogan, téléphone, email, SIRET, horaires |
| `branding.couleurs` | Couleurs vert + or |
| `branding.polices` | Sora + DM Sans |
| `liens` | Facebook, Instagram, TikTok, WhatsApp, Google Maps |
| `pwa` | Popup d'installation (délai, cooldown, textes) |
| `auth.admins[]` | Liste des comptes administrateurs |
| `auth.agents[]` | Liste des agents avec PIN |
| `paiement.methodes` | Stripe, Virement, Espèces (+ PayPal, Alma, Klarna, Chèque préparés) |
| `services[]` | Catalogue affiché sur le site public |
| `devis` | Préfixe (DEV-2026-XXXX), validité, mentions |
| `notifications.sms` | Modèles SMS avec variables `{prenom}`, `{date}`, etc. |
| `ia_agent` | Agent IA Claude (désactivé par défaut, prêt à activer) |

### Page Paramètres en interface
Tu peux aussi modifier ces options depuis **`/parametres.html`** (admin only). Les modifications sont sauvées dans le navigateur (localStorage). Pour une production durable, édite `config.js` puis redéploie.

---

## 🔐 Générer un hash SHA-256 (pour mots de passe / PIN)

### Méthode 1 — Console du navigateur (le plus simple)
1. Ouvre n'importe quelle page de l'app
2. Ouvre la console (F12 → Console)
3. Tape :
   ```javascript
   await Auth.sha256("ton-mot-de-passe-ici")
   ```
4. Copie le résultat dans `config.js` → `password_sha256` ou `pin_sha256`

### Méthode 2 — Outil en ligne
Utilise **https://emn178.github.io/online-tools/sha256.html**

### Méthode 3 — Terminal Linux/Mac
```bash
echo -n "ton-mot-de-passe" | sha256sum
```

---

## 💳 Configurer Stripe (paiement par carte)

1. Crée un compte sur **https://dashboard.stripe.com**
2. Récupère ta clé publique (`pk_live_...`) dans Developers → API keys
3. Crée un **lien de paiement** : Products → Payment links
4. Ajoute dans `config.js` :
```javascript
paiement: {
  methodes: {
    stripe: {
      active: true,
      public_key: "pk_live_xxxxxxxxxxxx",
      lien_paiement_template: "https://buy.stripe.com/xxxxxx"
    }
  }
}
```

---

## 🏦 Configurer le virement bancaire

Dans `config.js` :
```javascript
paiement: {
  methodes: {
    virement: {
      active: true,
      titulaire: "Wassou Multiservices",
      iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
      bic: "XXXXXXXX",
      banque: "Crédit Agricole Guadeloupe"
    }
  }
}
```

L'IBAN apparaîtra automatiquement sur les devis PDF.

---

## 🤖 Activer l'agent IA Claude (prise de RDV automatique)

L'agent IA est **préparé mais désactivé** par défaut. Pour l'activer plus tard :

1. Dans `config.js` :
```javascript
ia_agent: {
  active: true,
  api_key: "sk-ant-api03-xxxxx",
  google_calendar: { id: "...", oauth_token: "..." },
  integrations: { make_webhook: "https://hook.make.com/..." }
}
```

2. La logique IA n'est pas encore branchée — tu peux la connecter via Make.com ou n8n en utilisant les webhooks configurés.

---

## 🔥 Migrer vers Firebase (production scalable)

Le code utilise actuellement `localStorage` (données stockées dans le navigateur). Pour passer à Firebase :

1. Dans `config.js` :
```javascript
avance: {
  firebase: {
    active: true,
    apiKey: "...",
    authDomain: "wassou.firebaseapp.com",
    projectId: "wassou",
    // ...
  }
}
```

2. Adapter `js/data.js` pour utiliser `firebase.firestore()` au lieu de `localStorage`. Le préfixe `wassou_` correspondra aux noms de collections Firestore.

---

## 📱 Fonctionnalités PWA (Progressive Web App)

- ✅ Installable sur écran d'accueil iOS / Android / desktop
- ✅ Fonctionne hors ligne (service worker)
- ✅ Mode plein écran sans barre de navigateur
- ✅ Popup d'invitation à installer (configurable)
- ✅ Raccourcis : Dashboard / RDV / Services

---

## 🧑‍💻 Workflow Admin vs Agent

### 👨‍💼 Admin
- Voit **tout** : tous les clients, toutes les interventions, tous les devis, tous les paiements
- Peut **créer/modifier/supprimer** clients, agents, interventions
- Accès aux **rapports** et à la **configuration**
- Peut **confirmer manuellement** les paiements (virements reçus, espèces remontées)

### 🧑‍🌾 Agent
- Voit **uniquement** ses interventions, ses clients, ses devis, ses encaissements
- Peut **créer des devis** pour ses interventions
- Peut **enregistrer des paiements** en espèces
- N'a **pas accès** aux pages : Agents, Rapports, Paramètres

---

## 📊 Données stockées dans le navigateur (localStorage)

Toutes les clés ont le préfixe **`wassou_`** :

| Clé | Contenu |
|-----|---------|
| `wassou_clients` | Liste des clients |
| `wassou_interventions` | Planning |
| `wassou_devis` | Devis et factures |
| `wassou_paiements` | Historique paiements |
| `wassou_sms` | SMS envoyés |
| `wassou_rdvs` | Demandes RDV depuis le site public |
| `wassou_session` | Session de connexion en cours |
| `wassou_config_override` | Modifications via /parametres.html |
| `wassou_agents_override` | Modifications via /agents.html |
| `wassou_pwa_dismissed` | Date de refus du popup PWA |

### Sauvegarder / Restaurer
Depuis la console : `JSON.stringify(localStorage)` pour exporter, et `localStorage.setItem(...)` pour restaurer.

Plus simplement : **Rapports → Export CSV** pour sortir tes données dans Excel.

---

## 🎨 Personnaliser le design

### Changer les couleurs
Dans `config.js` → `branding.couleurs.primary` et `gold`. Ou via **Paramètres** dans l'app.

### Changer les polices
Dans `config.js` → `branding.polices`. Importe-les depuis Google Fonts dans chaque `<head>`.

### Changer le logo
Remplace `/assets/logo.svg` par ton logo (SVG, PNG, JPG).

### Changer les icônes PWA
Remplace les fichiers dans `/icons/` :
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-192-maskable.png` (avec safe zone 10%)
- `icon-512-maskable.png` (avec safe zone 10%)

Utilise **https://maskable.app** pour générer les versions maskable.

---

## 🧪 Tester rapidement

1. **Site public** : ouvre `/index.html` → vérifier les services, le formulaire RDV
2. **Connexion admin** : `/login.html` → admin / wassou2026
3. **Dashboard admin** : KPIs, données démo (3 clients de test)
4. **Créer un devis** : Devis → Nouveau → choisir client, ajouter lignes, télécharger le PDF
5. **Encaisser** : Paiements → Encaisser → choisir devis, méthode (Espèces pour test)
6. **Connexion agent** : déconnecte-toi → onglet Agent → choisir Kevin → PIN 1234

---

## 🆘 Problèmes courants

### Le service worker ne marche pas
- Le SW ne fonctionne **qu'en HTTPS** ou en `localhost`. En `file://` direct, c'est normal.
- Vide le cache : DevTools → Application → Storage → Clear site data

### J'ai oublié mon mot de passe admin
1. Ouvre la console du navigateur (F12)
2. `localStorage.removeItem('wassou_session')` pour te déconnecter
3. Édite `config.js` → génère un nouveau hash SHA-256 et remplace `password_sha256`
4. Redéploie

### Les modifs depuis /parametres.html ont disparu
Elles sont stockées en localStorage. Si tu vides le cache du navigateur, elles sont perdues. Pour une persistance vraie, modifie directement `config.js` et redéploie.

### La popup PWA ne s'affiche pas
- Vérifie qu'elle n'a pas été refusée récemment : `localStorage.removeItem('wassou_pwa_dismissed')`
- Sur iOS, la popup donne juste les instructions — l'installation se fait via le bouton Partager → Sur l'écran d'accueil

---

## 📞 Contact / Support

- **Site public** : https://drayk973.github.io/Wassou-services-/
- **WhatsApp Wassou** : https://wa.me/c/590690673085
- **Powered by NexusAI Agency** : https://github.com/drayk973

---

## 📜 Crédits

- **Design** : Vert forêt + or — palette personnalisée Wassou
- **Polices** : Sora (titres) + DM Sans (corps) via Google Fonts
- **PDF** : jsPDF (CDN cloudflare)
- **Icônes** : Emojis Unicode + SVG custom

---

## ✅ Checklist avant mise en production

- [ ] Modifier le mot de passe admin (`config.js` → `auth.admins[0].password_sha256`)
- [ ] Modifier les PINs des agents
- [ ] Remplir le SIRET dans `business.siret`
- [ ] Renseigner l'IBAN si tu acceptes les virements
- [ ] Configurer Stripe si tu acceptes les CB
- [ ] Remplacer `/assets/logo.svg` par ton vrai logo
- [ ] Régénérer les icônes PWA (192/512) avec ton logo
- [ ] Renseigner les liens Facebook / Instagram / Google Maps
- [ ] Tester l'installation PWA sur mobile
- [ ] Tester la création d'un devis + PDF
- [ ] Tester un encaissement de chaque méthode active
- [ ] Tester la connexion agent + visibilité limitée

---

**Bonne route avec Wassou Multiservices ! 🌿💛**
