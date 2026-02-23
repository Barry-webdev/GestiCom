# 🚀 Instructions pour Déployer le Frontend

## Problème actuel
Le dépôt `stock-savvy` n'existe plus, et le dépôt `GestiCom` contient déjà le Backend.

## ✅ Solution : Créer un nouveau dépôt GitHub pour le Frontend

### Étape 1 : Créer le dépôt sur GitHub

1. Va sur https://github.com
2. Clique sur **"New repository"** (bouton vert)
3. Remplis :
   ```
   Repository name: gestistock-frontend
   Description: Frontend React pour GestiStock - Barry & Fils
   Visibility: Public (ou Private)
   ```
4. **NE COCHE PAS** "Initialize with README"
5. Clique sur **"Create repository"**

### Étape 2 : Lier le dépôt local au nouveau dépôt

Exécute ces commandes dans le dossier Frontend :

```bash
# Supprimer l'ancien remote (déjà fait)
git remote remove origin

# Ajouter le nouveau remote (remplace 'Barry-webdev' par ton username)
git remote add origin https://github.com/Barry-webdev/gestistock-frontend.git

# Pousser le code
git push -u origin main
```

### Étape 3 : Déployer sur Vercel

1. Va sur https://vercel.com
2. Clique sur **"Add New..."** → **"Project"**
3. Sélectionne le dépôt **"gestistock-frontend"**
4. Configuration :
   ```
   Framework: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   ```
5. Variable d'environnement :
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
6. Clique sur **"Deploy"**

---

## 🎯 Alternative : Utiliser le même dépôt avec Root Directory

Si tu préfères garder tout dans le même dépôt `GestiCom` :

### Option A : Pousser le Frontend dans un sous-dossier

```bash
# Dans le dossier racine (Gestion C)
git add Frontend/
git commit -m "feat: add frontend application"
git push
```

Puis sur Vercel :
```
Repository: Barry-webdev/GestiCom
Root Directory: Frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

---

## 📋 Commandes à exécuter maintenant

### Si tu crées un nouveau dépôt (RECOMMANDÉ)

```bash
# 1. Créer le dépôt sur GitHub (via l'interface web)

# 2. Dans le dossier Frontend, exécuter :
cd Frontend
git remote add origin https://github.com/Barry-webdev/gestistock-frontend.git
git push -u origin main
```

### Si tu utilises le dépôt GestiCom existant

```bash
# Dans le dossier racine
git add Frontend/
git commit -m "feat: add frontend application"
git push
```

---

## ✅ Après avoir poussé le code

1. Va sur Vercel
2. Import le dépôt
3. Configure comme indiqué ci-dessus
4. Déploie
5. Note l'URL obtenue

---

**Quelle option préfères-tu ?**
1. Créer un nouveau dépôt `gestistock-frontend` (plus propre)
2. Utiliser le dépôt `GestiCom` avec le Frontend dans un sous-dossier
