# 👥 PERMISSIONS PAR RÔLE - GESTISTOCK

## 📊 TABLEAU DES PERMISSIONS

| Fonctionnalité | Admin | Gestionnaire | Vendeur | Lecteur |
|----------------|-------|--------------|---------|---------|
| **DASHBOARD** |
| Voir le dashboard | ✅ | ✅ | ✅ | ✅ |
| Voir les statistiques | ✅ | ✅ | ✅ | ✅ |
| **PRODUITS** |
| Voir les produits | ✅ | ✅ | ✅ | ✅ |
| Créer un produit | ✅ | ✅ | ❌ | ❌ |
| Modifier un produit | ✅ | ✅ | ❌ | ❌ |
| Supprimer un produit | ✅ | ❌ | ❌ | ❌ |
| **CLIENTS** |
| Voir les clients | ✅ | ✅ | ✅ | ✅ |
| Créer un client | ✅ | ✅ | ❌ | ❌ |
| Modifier un client | ✅ | ✅ | ❌ | ❌ |
| Supprimer un client | ✅ | ❌ | ❌ | ❌ |
| **FOURNISSEURS** |
| Voir les fournisseurs | ✅ | ✅ | ✅ | ✅ |
| Créer un fournisseur | ✅ | ✅ | ❌ | ❌ |
| Modifier un fournisseur | ✅ | ✅ | ❌ | ❌ |
| Supprimer un fournisseur | ✅ | ❌ | ❌ | ❌ |
| **VENTES** |
| Voir les ventes | ✅ | ✅ | ✅ | ✅ |
| Créer une vente | ✅ | ✅ | ✅ | ❌ |
| Ajouter un paiement | ✅ | ✅ | ✅ | ❌ |
| Modifier une vente | ✅ | ✅ | ❌ | ❌ |
| Supprimer une vente | ✅ | ❌ | ❌ | ❌ |
| Voir les créances | ✅ | ✅ | ✅ | ✅ |
| Générer facture PDF | ✅ | ✅ | ✅ | ✅ |
| **STOCK** |
| Voir les mouvements | ✅ | ✅ | ✅ | ✅ |
| Créer un mouvement | ✅ | ✅ | ❌ | ❌ |
| Modifier un mouvement | ✅ | ✅ | ❌ | ❌ |
| Supprimer un mouvement | ✅ | ❌ | ❌ | ❌ |
| **RAPPORTS** |
| Voir les rapports | ✅ | ✅ | ✅ | ✅ |
| Générer PDF/Excel | ✅ | ✅ | ✅ | ✅ |
| **UTILISATEURS** |
| Voir les utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Créer un utilisateur | ✅ | ❌ | ❌ | ❌ |
| Modifier un utilisateur | ✅ | ❌ | ❌ | ❌ |
| Supprimer un utilisateur | ✅ | ❌ | ❌ | ❌ |
| Réinitialiser mot de passe | ✅ | ❌ | ❌ | ❌ |
| **PARAMÈTRES** |
| Voir les paramètres | ✅ | ✅ | ✅ | ✅ |
| Modifier l'entreprise | ✅ | ❌ | ❌ | ❌ |
| Changer son mot de passe | ✅ | ✅ | ✅ | ✅ |

## 🎯 RÉSUMÉ PAR RÔLE

### 👑 ADMIN (Administrateur)
**Permissions** : TOUTES ✅

L'admin peut :
- ✅ Tout voir
- ✅ Tout créer
- ✅ Tout modifier
- ✅ Tout supprimer
- ✅ Gérer les utilisateurs
- ✅ Modifier les paramètres de l'entreprise

**Cas d'usage** : Propriétaire de l'entreprise, Directeur

---

### 📊 GESTIONNAIRE
**Permissions** : Presque toutes, SAUF suppression et gestion des utilisateurs

Le gestionnaire peut :
- ✅ Voir tout
- ✅ Créer : produits, clients, fournisseurs, ventes, mouvements de stock
- ✅ Modifier : produits, clients, fournisseurs, ventes, mouvements de stock
- ✅ Ajouter des paiements échelonnés
- ✅ Générer des factures PDF
- ✅ Générer des rapports
- ❌ Supprimer des éléments
- ❌ Gérer les utilisateurs
- ❌ Modifier les paramètres de l'entreprise

**Cas d'usage** : Responsable de magasin, Chef de service

---

### 🛒 VENDEUR
**Permissions** : Ventes et consultation uniquement

Le vendeur peut :
- ✅ Voir : dashboard, produits, clients, fournisseurs, ventes, stock, rapports
- ✅ Créer des ventes
- ✅ Ajouter des paiements échelonnés
- ✅ Générer des factures PDF
- ✅ Générer des rapports
- ❌ Créer/Modifier/Supprimer : produits, clients, fournisseurs, stock
- ❌ Gérer les utilisateurs

**Cas d'usage** : Vendeur en magasin, Caissier

---

### 👁️ LECTEUR
**Permissions** : Consultation uniquement (lecture seule)

Le lecteur peut :
- ✅ Voir : dashboard, produits, clients, fournisseurs, ventes, stock, rapports
- ✅ Générer des factures PDF (consultation)
- ✅ Générer des rapports (consultation)
- ❌ Créer quoi que ce soit
- ❌ Modifier quoi que ce soit
- ❌ Supprimer quoi que ce soit

**Cas d'usage** : Comptable, Auditeur, Stagiaire

---

## 🔄 DIFFÉRENCES ADMIN vs GESTIONNAIRE

| Action | Admin | Gestionnaire |
|--------|-------|--------------|
| Créer produit/client/fournisseur | ✅ | ✅ |
| Modifier produit/client/fournisseur | ✅ | ✅ |
| **Supprimer** produit/client/fournisseur | ✅ | ❌ |
| Créer une vente | ✅ | ✅ |
| Ajouter un paiement | ✅ | ✅ |
| Modifier une vente | ✅ | ✅ |
| **Supprimer** une vente | ✅ | ❌ |
| Créer mouvement de stock | ✅ | ✅ |
| Modifier mouvement de stock | ✅ | ✅ |
| **Supprimer** mouvement de stock | ✅ | ❌ |
| **Gérer les utilisateurs** | ✅ | ❌ |
| **Modifier paramètres entreprise** | ✅ | ❌ |

## 💡 RECOMMANDATION

### Le Gestionnaire devrait-il avoir les mêmes permissions que l'Admin ?

**Actuellement** : Le gestionnaire ne peut PAS :
- ❌ Supprimer des éléments (sécurité)
- ❌ Gérer les utilisateurs (sécurité)
- ❌ Modifier les paramètres de l'entreprise (sécurité)

**Options** :

#### Option 1 : Garder comme ça (Recommandé) ✅
- **Avantage** : Sécurité renforcée, séparation des responsabilités
- **Inconvénient** : Le gestionnaire doit demander à l'admin pour supprimer

#### Option 2 : Donner toutes les permissions au gestionnaire
- **Avantage** : Plus de flexibilité pour le gestionnaire
- **Inconvénient** : Moins de contrôle, risque de suppression accidentelle

#### Option 3 : Permissions personnalisées
- **Avantage** : Contrôle fin des permissions
- **Inconvénient** : Plus complexe à gérer

## 🎯 CONCLUSION

**NON, le gestionnaire ne peut PAS faire exactement pareil que l'admin.**

Le gestionnaire peut faire **presque tout** (créer, modifier, voir), mais ne peut PAS :
1. ❌ Supprimer des éléments
2. ❌ Gérer les utilisateurs
3. ❌ Modifier les paramètres de l'entreprise

C'est une **bonne pratique de sécurité** pour éviter les suppressions accidentelles et garder le contrôle sur les utilisateurs et les paramètres critiques.

---

**Voulez-vous que je modifie les permissions pour donner plus de droits au gestionnaire ?**

Si oui, dites-moi quelles permissions vous voulez ajouter :
- [ ] Supprimer des produits/clients/fournisseurs
- [ ] Supprimer des ventes
- [ ] Supprimer des mouvements de stock
- [ ] Gérer les utilisateurs
- [ ] Modifier les paramètres de l'entreprise
