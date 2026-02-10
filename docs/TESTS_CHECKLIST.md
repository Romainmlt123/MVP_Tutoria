# Checklist de tests – Tutor'IA

Ce document liste ce qu’il faut tester pour vérifier que tout fonctionne. Les pages **publiques** ont été vérifiées automatiquement (login, signup, forgot-password, redirection protégée).

---

## 1. Auth & pages publiques

| Test | Action | Résultat attendu |
|------|--------|------------------|
| **Login** | Aller sur http://localhost:5173 → redirige vers `/login` | Page Connexion avec champs Email, Mot de passe, lien « Mot de passe oublié ? », « Créer un compte » |
| **Signup** | Cliquer « Créer un compte » | Page inscription (email, mot de passe, confirmation) |
| **Mot de passe oublié** | Cliquer « Mot de passe oublié ? » | Page avec champ email et bouton « Envoyer le lien » |
| **Route protégée sans login** | Aller sur `/flashcards` ou `/chat` sans être connecté | Redirection vers `/login` |
| **Connexion** | Se connecter avec un compte existant | Redirection vers `/` (Accueil), sidebar avec ton profil |
| **Déconnexion** | Sidebar → bouton Déconnexion | Redirection vers `/login` |

---

## 2. Profil & Paramètres

| Test | Action | Résultat attendu |
|------|--------|------------------|
| **Profil dans la Sidebar** | Après login, regarder la sidebar en bas | Avatar (ou icône) + nom / email |
| **Paramètres – Onglet Profil** | Aller dans Paramètres (sidebar) → onglet Profil | Formulaire Nom d’affichage + URL avatar, bouton Enregistrer |
| **Sauvegarder le profil** | Modifier nom et/ou URL avatar → Enregistrer | Message « Profil enregistré », sidebar mise à jour |
| **Paramètres – Préférences IA** | Onglet « Préférences IA » | Personnalité (cartes), vitesse de parole, toggles (interruption, lecture auto) |
| **Sauvegarder les préférences** | Changer persona / vitesse → Enregistrer | Message « Préférences enregistrées » (recharger la page : les valeurs restent) |

---

## 3. Chat (conversations BDD)

| Test | Action | Résultat attendu |
|------|--------|------------------|
| **Ouvrir l’historique** | Sur `/chat`, cliquer l’icône menu (hamburger) à gauche | Panneau « Historique » avec « Nouvelle conversation » et liste (vide au début) |
| **Nouvelle conversation** | Cliquer « Nouvelle conversation » | Zone de chat vide, prête à taper |
| **Envoyer un message** | Taper un message et envoyer | Message utilisateur affiché, puis réponse de l’IA (si backend OK) ou message d’erreur |
| **Conversation créée** | Après envoi, rouvrir l’historique | Une conversation apparaît (titre = début du premier message) |
| **Changer de conversation** | Cliquer une autre conversation dans l’historique | Messages de cette conversation s’affichent |
| **Revenir à une conversation** | Cliquer une conversation existante | Les messages chargés depuis la BDD s’affichent |

---

## 4. Flashcards (complète)

| Test | Action | Résultat attendu |
|------|--------|------------------|
| **Bibliothèque** | Aller sur `/flashcards` | Titre « Bibliothèque de Flashcards », bouton « Révision quotidienne », grille de dossiers (ou vide), bouton « Créer un nouveau dossier », section Stats (série, total maîtrisé, précision + graphique 7 jours) |
| **Créer un dossier** | Cliquer « Créer un nouveau dossier » | Modal : Nom, choix Icône, choix Couleur, Annuler / Créer |
| **Créer un dossier (submit)** | Remplir le nom (ex. Maths), choisir icône/couleur → Créer | Modal se ferme, redirection vers le détail du deck (`/flashcards/deck/:id`) |
| **Détail du deck** | Sur un deck, voir en-tête + liste de cartes | Nom du deck, icône, « X carte(s) », boutons « Réviser ce deck », « Ajouter une carte », menu (⋯) avec « Supprimer le dossier » |
| **Ajouter une carte** | Cliquer « Ajouter une carte » | Modal Recto / Verso (ex. question + réponse), Annuler / Ajouter |
| **Ajouter une carte (submit)** | Remplir recto et verso → Ajouter | Modal se ferme, la carte apparaît dans la liste |
| **Modifier une carte** | Menu (⋯) sur une carte → Modifier | Modal pré-rempli, Enregistrer met à jour la carte |
| **Supprimer une carte** | Menu (⋯) sur une carte → Supprimer | La carte disparaît de la liste |
| **Réviser ce deck** | Cliquer « Réviser ce deck » (avec au moins 1 carte) | Page de révision : une carte (recto), puis « Voir la réponse » → verso, boutons Incorrect / Correct |
| **Session de révision** | Répondre Correct / Incorrect pour toutes les cartes | À la fin : écran « Révision terminée » avec X correct, Y incorrect, précision %, lien « Retour à la bibliothèque » |
| **Révision quotidienne** | Depuis la bibliothèque, cliquer « Révision quotidienne » (avec au moins un deck ayant des cartes) | Même flow de révision avec toutes les cartes de tous les decks concernés |
| **Stats après révision** | Après une révision, retour à la bibliothèque | Section « Statistiques d’apprentissage » mise à jour (série, total maîtrisé, précision, graphique si des reviews ont été enregistrées) |
| **Supprimer le dossier** | Menu (⋯) du deck → Supprimer le dossier | Confirmation implicite (ou message), redirection vers `/flashcards`, le deck n’apparaît plus |

---

## 5. Récupération de mot de passe

| Test | Action | Résultat attendu |
|------|--------|------------------|
| **Demander un lien** | Sur `/forgot-password`, entrer un email existant → Envoyer le lien | Message du type « Un email t’a été envoyé… » |
| **Lien reçu** | Ouvrir le lien reçu par email (dans la même app / même origine) | Page « Nouveau mot de passe » (recto/verso) |
| **Changer le mot de passe** | Saisir nouveau mot de passe + confirmation → Définir | Message succès puis redirection vers `/` ou `/login` |
| **Se connecter avec le nouveau MDP** | Sur `/login`, se connecter avec le nouveau mot de passe | Connexion OK |

---

## 6. Analytics

| Test | Action | Résultat attendu |
|------|--------|------------------|
| **Page Analytics** | Aller sur `/analytics` | Titre « Bon retour, [ton nom ou email] », KPIs : Conversations, Messages échangés (réels) + 2 autres (mock), graphiques et sections en dessous |

---

## 7. Email non confirmé (optionnel)

Si dans Supabase tu actives la confirmation d’email :

| Test | Action | Résultat attendu |
|------|--------|------------------|
| **Bannière** | Se connecter avec un compte dont l’email n’est pas confirmé | Bannière jaune « Vérifie ton email… » avec bouton « Renvoyer l’email » et croix pour fermer |

---

## Résumé des tests automatiques (MCP Chrome)

- **Login** : page chargée, champs Email / Mot de passe, liens « Mot de passe oublié ? » et « Créer un compte » présents.
- **Signup** : page chargée, formulaire inscription (email, mot de passe, confirmation).
- **Forgot password** : page chargée, champ email et bouton « Envoyer le lien ».
- **Route protégée** : navigation vers `/flashcards` sans être connecté → redirection vers `/login`.

Pour tout le reste (connexion, chat, flashcards, paramètres, analytics, mot de passe oublié de bout en bout), utilise cette checklist manuellement avec ton compte et ton environnement Supabase.
