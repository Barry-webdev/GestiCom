# 🔧 Commandes Git pour le Déploiement

## 📦 Préparer le dépôt GitHub

### 1. Initialiser Git (si pas déjà fait)

```bash
git init
```

### 2. Vérifier les fichiers à commiter

```bash
git status
```

### 3. Ajouter tous les fichiers

```bash
git add .
```

### 4. Créer le commit initial

```bash
git commit -m "feat: GestiStock ready for production deployment

- Backend API with Express + MongoDB
- Frontend React + Vite + TailwindCSS
- Authentication & Authorization (JWT)
- CRUD operations for Products, Sales, Clients, Suppliers
- Dashboard with statistics
- Reports (PDF & Excel)
- Stock management
- Notifications system
- Responsive design
- Deployment configuration for Render & Vercel"
```

---

## 🌐 Créer le dépôt sur GitHub

### Option 1 : Via l'interface GitHub

1. Aller sur https://github.com
2. Cliquer sur **"New repository"**
3. Nom : `gestistock`
4. Description : `Système de gestion de stock pour Barry & Fils - Pita, Guinée`
5. Visibilité : **Private** (recommandé) ou Public
6. **NE PAS** cocher "Initialize with README"
7. Cliquer sur **"Create repository"**

### Option 2 : Via GitHub CLI (si installé)

```bash
gh repo create gestistock --private --source=. --remote=origin
```

---

## 🔗 Lier le dépôt local à GitHub

```bash
# Remplacer 'votre-username' par votre nom d'utilisateur GitHub
git remote add origin https://github.com/votre-username/gestistock.git

# Vérifier que le remote est bien ajouté
git remote -v
```

---

## 🚀 Pousser le code sur GitHub

### Première fois

```bash
# Renommer la branche en 'main' (si nécessaire)
git branch -M main

# Pousser le code
git push -u origin main
```

### Pushs suivants

```bash
git push
```

---

## 🔄 Workflow de développement

### Faire des modifications

```bash
# 1. Modifier les fichiers
# 2. Vérifier les changements
git status
git diff

# 3. Ajouter les fichiers modifiés
git add .

# 4. Commiter avec un message descriptif
git commit -m "feat: add new feature"

# 5. Pousser sur GitHub
git push
```

---

## 📝 Convention de commits

Utiliser des messages clairs et descriptifs :

```bash
# Nouvelle fonctionnalité
git commit -m "feat: add product image upload"

# Correction de bug
git commit -m "fix: resolve login authentication issue"

# Mise à jour de documentation
git commit -m "docs: update deployment guide"

# Refactoring
git commit -m "refactor: optimize database queries"

# Style/Formatting
git commit -m "style: format code with prettier"

# Configuration
git commit -m "chore: update environment variables"
```

---

## 🌿 Gestion des branches (optionnel)

### Créer une branche de développement

```bash
# Créer et basculer sur une nouvelle branche
git checkout -b develop

# Pousser la branche sur GitHub
git push -u origin develop
```

### Fusionner dans main

```bash
# Basculer sur main
git checkout main

# Fusionner develop dans main
git merge develop

# Pousser les changements
git push
```

---

## 🔍 Commandes utiles

### Voir l'historique des commits

```bash
git log --oneline --graph --all
```

### Annuler le dernier commit (avant push)

```bash
git reset --soft HEAD~1
```

### Voir les différences

```bash
# Différences non staged
git diff

# Différences staged
git diff --staged
```

### Ignorer des fichiers

Les fichiers listés dans `.gitignore` sont automatiquement ignorés :
- `node_modules/`
- `.env`
- `dist/`
- etc.

---

## ⚠️ Fichiers sensibles

**NE JAMAIS commiter :**
- `.env` (contient des secrets)
- `node_modules/` (trop volumineux)
- `dist/` (généré automatiquement)
- Fichiers avec mots de passe ou clés API

**Vérifier avant chaque commit :**

```bash
git status
```

Si un fichier sensible apparaît, l'ajouter à `.gitignore` :

```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: update gitignore"
```

---

## 🔐 Sécurité

### Si vous avez accidentellement commité un secret

```bash
# 1. Supprimer le fichier du tracking Git
git rm --cached .env

# 2. Ajouter au .gitignore
echo ".env" >> .gitignore

# 3. Commiter
git add .gitignore
git commit -m "chore: remove sensitive file from tracking"

# 4. Pousser
git push

# 5. IMPORTANT : Changer immédiatement les secrets exposés !
```

---

## 📊 Vérifier l'état du dépôt

```bash
# Statut actuel
git status

# Branches locales
git branch

# Branches distantes
git branch -r

# Tous les remotes
git remote -v

# Dernier commit
git log -1
```

---

## 🎯 Checklist avant le premier push

- [ ] `.gitignore` configuré correctement
- [ ] Pas de fichiers `.env` dans le staging
- [ ] Pas de `node_modules/` dans le staging
- [ ] README.md créé (optionnel)
- [ ] Commit message descriptif
- [ ] Remote GitHub configuré
- [ ] Prêt à pousser !

---

## 🚀 Commande complète pour le premier déploiement

```bash
# Tout en une fois
git init
git add .
git commit -m "feat: initial commit - GestiStock production ready"
git branch -M main
git remote add origin https://github.com/votre-username/gestistock.git
git push -u origin main
```

---

**Après le push, suivre `DEPLOIEMENT_RAPIDE.md` pour déployer sur Render et Vercel ! 🎉**
