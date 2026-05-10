# 🔔 Activer les alertes silencieuses Telegram (5 minutes)

> **But** : recevoir vos alertes techniques NexusAI **directement sur votre téléphone** via Telegram, **sans coût**, **illimité**, **discret** (le client ne voit rien).

---

## Pourquoi Telegram et pas SMS ?

| | Telegram | SMS Digicel |
|---|---|---|
| Coût | 🟢 0€ | 🟡 Inclus dans forfait |
| Limite | 🟢 Illimité | 🟢 Illimité |
| Multimédia | 🟢 Photos, fichiers, liens cliquables | 🔴 Texte seul |
| Historique | 🟢 Toujours dispo | 🔴 Dépend du téléphone |
| Setup | 🟡 5 min (une fois) | 🟢 Immédiat |
| API publique | 🟢 Oui (officielle) | 🔴 Pas chez Digicel Guadeloupe |

→ **Telegram c'est la meilleure solution pour vous.**

---

## Étape 1 — Installer Telegram

Si vous n'avez pas encore Telegram sur votre téléphone :
- 📱 iPhone : App Store → "Telegram" → installer
- 🤖 Android : Play Store → "Telegram" → installer
- Inscription avec votre numéro 0696 53 17 55

---

## Étape 2 — Créer votre bot personnel

1. Dans Telegram, chercher : **@BotFather** (le bot officiel pour créer des bots)
2. Envoyer : `/newbot`
3. Le bot vous demande un **nom** : `NexusAI Wassou Alerts`
4. Puis un **username** (doit finir par `bot`) : `nexusai_wassou_bot` (si pris, essayez avec votre prénom)
5. BotFather vous donne un **token** comme :
   ```
   7824567890:AAFqHelloWorldAbcdef1234567890XYZ
   ```
6. **⚠️ Copiez ce token, ne le partagez à personne**

---

## Étape 3 — Récupérer votre Chat ID

1. Cherchez votre bot dans Telegram (avec le username choisi)
2. Cliquez **Démarrer** ou envoyez n'importe quel message (ex: "salut")
3. Dans votre navigateur, ouvrez cette URL en remplaçant `VOTRE_TOKEN` :
   ```
   https://api.telegram.org/botVOTRE_TOKEN/getUpdates
   ```
   Exemple :
   ```
   https://api.telegram.org/bot7824567890:AAFqHello.../getUpdates
   ```
4. Vous verrez du JSON. Cherchez `"chat":{"id":XXXXXXXXX,...`
5. Le **chat_id** c'est le numéro après `"id":` (ex : `123456789`)

---

## Étape 4 — Configurer dans le panneau NexusAI

1. Sur votre site Wassou, **cliquez 6 fois rapidement** sur le logo 🌿 dans la sidebar
2. Login : `nexus` / `nexus2026` (à changer après !)
3. Allez dans Configuration → Modifier le `config.js`
4. Trouvez la section :
   ```javascript
   telegram: {
     active: false,
     bot_token: "",
     chat_id: "",
   },
   ```
5. Remplacez par :
   ```javascript
   telegram: {
     active: true,
     bot_token: "7824567890:AAFqHelloWorldAbcdef1234567890XYZ",
     chat_id: "123456789",
   },
   ```
6. Sauvegardez et commit sur GitHub

---

## Étape 5 — Tester

1. Retournez dans le panneau NexusAI (6 clics sur le logo)
2. Cliquez **📨 Test alerte**
3. Votre téléphone doit recevoir **immédiatement** une notif Telegram :
   ```
   ⚠️ Test alerte
   Ceci est un test du système d'alertes NexusAI.
   Si tu vois ce message, tout fonctionne ✅
   Site: Wassou Multiservices
   ```

🎉 **C'est bon, vous êtes opérationnel !**

---

## 📋 Que recevrez-vous maintenant ?

Vous serez alerté **silencieusement** (pas de SMS, pas de mail au client) pour :

| Niveau | Ce qui se passe | Vous recevez |
|---|---|---|
| 🟡 **Attention** | Crédit IA < 50% (10€ restant) | 1 message Telegram |
| 🟠 **Urgent** | Crédit IA < 25% (5€ restant) | 1 message Telegram |
| 🔴 **Critique** | Crédit IA = 0€ | Telegram + push + email |
| 🛑 **Erreur API** | Clé API invalide | Telegram immédiat |
| 📈 **Pic anormal** | Conso x3 vs normale | Telegram (anti-fraude) |

---

## 🌙 Mode silencieux la nuit

Configuré par défaut : **pas d'alerte entre 22h et 7h** sauf alerte CRITIQUE.

Modifiable dans `config.js` :
```javascript
mode_silencieux_nuit: {
  active: true,
  debut: "22:00",   // ← changez l'heure ici
  fin: "07:00",
}
```

---

## ❓ Problèmes ?

**Le test ne marche pas ?**
1. Vérifiez que `active: true` dans le config
2. Vérifiez que vous avez bien envoyé un message au bot (étape 3)
3. Re-testez l'URL `getUpdates`, vous devez voir votre message dans le JSON

**Vous voulez ajouter d'autres personnes ?**
Pour qu'un collègue (ex: votre associé) reçoive aussi les alertes :
1. Il s'abonne à votre bot
2. On modifie le code pour envoyer à plusieurs `chat_id`
3. Demandez-moi, je l'ajoute en 1 minute

---

🌿 **Pratique, gratuit, illimité, discret.**
