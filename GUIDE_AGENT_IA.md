# 🤖 Guide complet — Activer l'Agent AI Wassou avec Make.com

> **Objectif** : Faire en sorte que votre agent AI prenne automatiquement les rendez-vous reçus par WhatsApp Business et email, en utilisant l'API Claude.

---

## 📋 Avant de commencer — Checklist

Avant de lancer ce guide, vous devez avoir :

- [ ] **Une clé API Anthropic** (vous avez dit l'avoir → ✅)
- [ ] **Un compte WhatsApp Business** (pas WhatsApp normal — c'est différent)
- [ ] **Accès au compte Google de Wassou** (pour Sheets + Calendar)
- [ ] **Boîte email contact@wassou-services.fr accessible**
- [ ] **30-60 minutes** devant vous pour tout configurer

⚠️ **Si vous n'avez pas WhatsApp Business** : on peut commencer par l'email seulement, c'est plus simple. Dites-le moi.

---

## 🎯 ÉTAPE 1 — Préparer la "base de données" (Google Sheets)

L'agent a besoin d'un endroit pour écrire les RDV qu'il prend. On utilise Google Sheets parce que :
- C'est gratuit
- Vous pouvez le consulter depuis n'importe où
- Make.com s'y connecte facilement
- Votre PWA peut le lire pour afficher les RDV dans le dashboard

### 1.1 Créer le fichier Google Sheets

1. Aller sur **sheets.google.com** avec le compte Google de Wassou
2. **Nouveau** → feuille vierge
3. Renommer le fichier en : **"Wassou — Base de données"**
4. Créer **3 onglets** (clic droit en bas → "Insérer une feuille") :

#### Onglet "RDV"

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | Date création | Nom | Prénom | Téléphone | Email | Service | Date RDV | Heure | Statut |

#### Onglet "Messages"

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | Date | Canal | Numéro/Email | Message client | Réponse IA | Coût (€) |

#### Onglet "Stats"

| A | B |
|---|---|
| Date | Valeur |
| RDV pris aujourd'hui | 0 |
| Coût IA aujourd'hui | 0 |
| Messages traités | 0 |

### 1.2 Copier l'ID du Sheet

Dans l'URL de votre Sheets :
```
https://docs.google.com/spreadsheets/d/AAAA1234XXXXXX/edit
                                       ^^^^^^^^^^^^^^^^^
                                       👈 C'est ça votre ID
```

Notez-le, vous en aurez besoin pour le `config.js`.

---

## 🎯 ÉTAPE 2 — Compte Make.com

### 2.1 Inscription
1. Aller sur **make.com** → **Sign up free**
2. Inscrivez-vous avec l'email de Wassou
3. Plan **Free** = 1000 opérations/mois (largement suffisant pour démarrer)

### 2.2 Connecter Google
1. Cliquer **Connections** (menu gauche)
2. **+ Add** → chercher **Google Sheets** → connecter avec compte Wassou
3. Faire pareil pour **Google Calendar** (optionnel mais recommandé)

---

## 🎯 ÉTAPE 3 — Connecter WhatsApp Business

⚠️ **Cette étape est la plus technique**. Si elle vous bloque, dites-le moi, on peut commencer par l'email.

### 3.1 WhatsApp Business Cloud API (Meta)

1. Aller sur **business.facebook.com**
2. Créer un compte Business si pas déjà fait
3. Aller sur **developers.facebook.com** → **My Apps** → **Create App**
4. Type : **Business** → continuer
5. Ajouter le produit **WhatsApp** → **Set up**
6. Dans **Quickstart** :
   - Vous obtenez un **Phone Number ID** (à noter)
   - Un **Token d'accès temporaire** (24h, on le remplacera par un permanent)

### 3.2 Token permanent
Dans le menu gauche : **System Users** → créer un user "Wassou Bot" → générer un token avec permission `whatsapp_business_messaging` + `whatsapp_business_management`.

⚠️ **Ce token = mot de passe**. À garder secret. Vous le mettrez dans Make uniquement.

---

## 🎯 ÉTAPE 4 — Le scénario Make.com (le cœur de l'agent)

C'est ici que tout se passe. On va créer 1 scénario par canal.

### 4.1 Scénario WhatsApp

#### Module 1 : WEBHOOK (l'oreille)

1. Make → **+ Create a new scenario**
2. Cliquer le **+ central** → chercher **Webhooks** → **Custom webhook**
3. **Add** → nommer "Wassou WhatsApp In" → **Save**
4. **Copier l'URL générée** (genre `https://hook.eu2.make.com/xxxxxxx`)

🔗 **Dans Meta WhatsApp** : retourner dans Configuration → Webhooks → coller cette URL → ajouter les events `messages`.

#### Module 2 : ROUTER (filtrer les vrais messages)

5. Cliquer le **+** après le webhook → chercher **Flow Control** → **Router**
6. Sur la 1ère branche, cliquer la clé → **Filter** :
   - Label : "Message texte"
   - Condition : `entry[0].changes[0].value.messages[0].type` = `text`

#### Module 3 : ANTHROPIC (le cerveau)

7. Continuer la branche → chercher **HTTP** → **Make a request**
8. Configurer :
   - **URL** : `https://api.anthropic.com/v1/messages`
   - **Method** : POST
   - **Headers** :
     - `x-api-key` : `[VOTRE_CLÉ_ANTHROPIC]`
     - `anthropic-version` : `2023-06-01`
     - `content-type` : `application/json`
   - **Body type** : Raw → JSON
   - **Request content** :
   ```json
   {
     "model": "claude-sonnet-4-6",
     "max_tokens": 1000,
     "system": "[COLLER LE PROMPT SYSTÈME DU CONFIG.JS]",
     "messages": [
       {
         "role": "user",
         "content": "{{1.entry[0].changes[0].value.messages[0].text.body}}"
       }
     ]
   }
   ```

#### Module 4 : PARSER LA RÉPONSE

9. **+** → **Tools** → **Set variable**
   - Nom : `reponse_ia`
   - Valeur : `{{3.content[0].text}}`

#### Module 5 : SAUVEGARDER DANS GOOGLE SHEETS

10. **+** → **Google Sheets** → **Add a row**
    - Spreadsheet : votre fichier Wassou
    - Sheet : **Messages**
    - Remplir les colonnes avec les données du webhook + la réponse IA

#### Module 6 : RÉPONDRE AU CLIENT (WhatsApp)

11. **+** → **HTTP** → **Make a request**
    - URL : `https://graph.facebook.com/v18.0/[PHONE_NUMBER_ID]/messages`
    - Headers :
      - `Authorization` : `Bearer [VOTRE_TOKEN_WHATSAPP]`
      - `content-type` : `application/json`
    - Body :
    ```json
    {
      "messaging_product": "whatsapp",
      "to": "{{1.entry[0].changes[0].value.messages[0].from}}",
      "type": "text",
      "text": { "body": "{{4.reponse_ia}}" }
    }
    ```

#### Module 7 : DÉTECTER UN RDV

12. **+** → **Router** (2e router)
    - Branche 1 : Si la réponse IA contient "RDV confirmé" ou "rendez-vous noté"
    - Branche 2 : Sinon (juste une question, pas un RDV)

13. Sur la branche 1 : **+** → **Google Sheets** → **Add a row** dans l'onglet **RDV**

#### 4.2 Activer le scénario

14. **Save** (icône disquette en bas)
15. Toggle **ON** (en bas à gauche)
16. Tester en envoyant un WhatsApp à votre numéro Business → ça doit répondre 🎉

---

## 🎯 ÉTAPE 5 — Email (plus simple)

### 5.1 Scénario Make pour email

1. **+ Create new scenario**
2. **Email** → **Watch emails** (IMAP)
3. Connecter avec contact@wassou-services.fr
4. Filtrer les emails non-lus uniquement
5. Refaire les modules **Anthropic → Sheets → Email reply** (comme étape 4)

Pour la réponse email :
- **Email** → **Send an email**
- Auto-fill depuis l'email reçu

---

## 🎯 ÉTAPE 6 — Brancher la PWA

Dans **votre dashboard admin**, ajouter un onglet "🤖 Agent IA" qui lit le Google Sheets pour afficher :
- Les conversations en temps réel (onglet Messages)
- Les RDV pris automatiquement (onglet RDV)
- Les coûts du jour (onglet Stats)
- Bouton **PAUSE** qui désactive le scénario Make via API

> 📌 **Je vous code cette page "Agent IA" dans la prochaine étape**, dites-moi quand vous êtes prêt.

---

## 🛡️ SÉCURITÉ — À FAIRE ABSOLUMENT

### Cap de coût quotidien
Dans Make → **Scheduling** du scénario → **Add a limit**
- Stop after **100 operations/day** (largement suffisant pour Wassou)

### Surveillance
1. Activer **Email notifications** dans Make
2. Vous recevrez un email à chaque erreur

### Test du prompt
Avant d'activer, **simulez 10 messages clients** pour vérifier les réponses :
- "Bonjour je veux un RDV pour mon jardin"
- "C'est combien pour kärcher une terrasse de 50m² ?"
- "Annulation de mon RDV de demain"
- "URGENCE arbre tombé sur ma voiture"
- "Vous travaillez le dimanche ?"

Si l'IA répond mal → ajustez le `prompt_systeme` dans `config.js` jusqu'à ce que ce soit parfait.

---

## 📊 Surveillance quotidienne

Chaque matin, regardez :

1. **Make.com** → vue **Scenarios** → vérifier qu'il n'y a pas d'erreurs
2. **Anthropic Console** → onglet **Usage** → vérifier la consommation
3. **Google Sheets** onglet **Messages** → lire 2-3 conversations au hasard
4. **Dashboard Wassou** (une fois codé) → onglet Agent IA

---

## 💰 Estimation coûts mensuels Wassou

| Poste | Coût |
|---|---|
| Make.com Free | 0€ (jusqu'à 1000 ops/mois) |
| WhatsApp Business Cloud API | 0€ (1000 conversations/mois gratuites) |
| Google Sheets / Calendar | 0€ |
| **Claude API Sonnet 4.6** | **~10-30€** (selon volume) |
| **TOTAL** | **~10-30€/mois** |

Si vous dépassez 1000 ops Make → plan **Core** à 9€/mois (10000 ops).

---

## ❓ Questions fréquentes

**Q : Et si Claude répond une bêtise au client ?**
R : Vous voyez tout dans Google Sheets onglet Messages. Vous pouvez désactiver Make en 1 clic, et reprendre la main. Le client ne saura pas qu'il parlait à un robot.

**Q : Que se passe-t-il pendant la nuit ?**
R : L'agent répond 24/7. Le prompt lui dit qu'il ne propose pas de RDV pour aujourd'hui de toute façon (`delai_min_jours: 1`).

**Q : Comment je teste sans risquer d'envoyer des bêtises aux vrais clients ?**
R : Faites un 2e numéro WhatsApp Business "Wassou Test" et un Sheet "Wassou Test". Quand tout marche → bascule sur le vrai.

**Q : Et si le client demande à parler à un humain ?**
R : Le prompt dit déjà à l'IA d'escalader. Make peut envoyer un SMS à Obrayan automatiquement.

---

## 📞 Prochaines étapes

Une fois ce guide suivi, dites-moi :
- ✅ "Make est connecté, l'IA répond aux WhatsApp"
- → Je code l'**onglet "Agent IA" dans le dashboard** pour tout superviser depuis votre app

Si vous bloquez quelque part (étape 3 WhatsApp Business par exemple), envoyez-moi une capture d'écran et je vous débloque.

---

**🌿 Wassou Multiservices — Agent IA v1.0**
