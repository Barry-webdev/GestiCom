# 📄 GÉNÉRATION DE FACTURES PDF PROFESSIONNELLES

## ✅ FONCTIONNALITÉ IMPLÉMENTÉE

Votre application GestiStock dispose maintenant d'un système complet de génération de factures PDF professionnelles pour toutes les ventes, avec support des paiements échelonnés.

## 🎯 FONCTIONNALITÉS

### 1. Facture PDF Professionnelle

Chaque facture générée contient :
- ✅ **En-tête avec logo** : Nom de l'entreprise, adresse, téléphone, email
- ✅ **Type de document** : "FACTURE" (si payé) ou "FACTURE PROFORMA" (si impayé/partiel)
- ✅ **Numéro de facture** : Numéro unique de la vente (ex: VNT-2026-001)
- ✅ **Informations client** : Nom, téléphone, adresse, email
- ✅ **Informations vente** : Date, vendeur, statut de paiement
- ✅ **Tableau des articles** : Produit, quantité, prix unitaire, total
- ✅ **Totaux** : Sous-total, TVA (si applicable), Total
- ✅ **Historique des paiements** : Liste de tous les paiements effectués
- ✅ **Résumé du paiement** : Montant total, montant payé, reste à payer
- ✅ **Date d'échéance** : Si paiement partiel
- ✅ **Notes** : Notes de la vente
- ✅ **Pied de page** : Coordonnées de l'entreprise, message de remerciement

### 2. Actions Disponibles

Sur la page de détail d'une vente, vous pouvez :
- 📥 **Télécharger la facture** : Génère un PDF et le télécharge
- 🖨️ **Imprimer la facture** : Ouvre la boîte de dialogue d'impression
- 📄 **Bouton Facture PDF** : Accès rapide au téléchargement

### 3. Support des Paiements Échelonnés

La facture s'adapte automatiquement selon le statut de paiement :

#### Vente Payée Intégralement
```
Type: FACTURE
Statut: Payé ✅
Affichage: Montant total payé
```

#### Vente Partiellement Payée
```
Type: FACTURE PROFORMA
Statut: Partiellement payé ⚠️
Affichage:
  - Montant total: 1 000 000 GNF
  - Montant payé: 300 000 GNF
  - Reste à payer: 700 000 GNF
  - Date d'échéance: 30/03/2026
  - Historique des paiements
```

#### Vente Impayée
```
Type: FACTURE PROFORMA
Statut: Impayé ❌
Affichage:
  - Montant total: 1 000 000 GNF
  - Montant payé: 0 GNF
  - Reste à payer: 1 000 000 GNF
```

### 4. Historique des Paiements

Si la vente a des paiements échelonnés, la facture affiche un tableau avec :
- Date du paiement
- Montant payé
- Mode de paiement (Espèces, Mobile Money, etc.)
- Notes du paiement

**Exemple** :
```
HISTORIQUE DES PAIEMENTS
┌────────────┬─────────────┬──────────────┬─────────────────┐
│ Date       │ Montant     │ Mode         │ Notes           │
├────────────┼─────────────┼──────────────┼─────────────────┤
│ 15/02/2026 │ 300 000 GNF │ Espèces      │ Paiement initial│
│ 01/03/2026 │ 200 000 GNF │ Mobile Money │ 1er versement   │
│ 15/03/2026 │ 250 000 GNF │ Espèces      │ 2ème versement  │
└────────────┴─────────────┴──────────────┴─────────────────┘
```

## 🎨 DESIGN PROFESSIONNEL

### Charte Graphique
- **Couleur principale** : Navy Blue (#1C2A47)
- **Couleur accent** : Gold (#F59E0B)
- **Police** : Helvetica
- **Format** : A4 (210 x 297 mm)

### Mise en Page
- En-tête coloré avec nom de l'entreprise
- Cadres pour client et informations
- Tableau des articles avec lignes alternées
- Encadré pour les totaux
- Encadré orange pour le résumé du paiement (si dette)
- Pied de page avec coordonnées

## 📊 UTILISATION

### Générer une Facture

1. Aller sur "Ventes"
2. Cliquer sur une vente pour voir les détails
3. Cliquer sur un des boutons :
   - **"Facture PDF"** : Télécharge directement
   - **"Télécharger"** : Télécharge la facture
   - **"Imprimer"** : Ouvre la boîte d'impression

### Nom du Fichier

Le fichier PDF est automatiquement nommé :
```
Facture_VNT-2026-001_Mamadou_Diallo.pdf
```

Format : `Facture_{NuméroVente}_{NomClient}.pdf`

## 🔧 TECHNIQUE

### Fichiers Créés

1. **Frontend/src/lib/invoice-generator.ts**
   - Fonction `generateInvoicePDF()` : Génère le PDF
   - Fonction `downloadInvoice()` : Télécharge le PDF
   - Fonction `printInvoice()` : Imprime le PDF

2. **Frontend/src/pages/SaleDetail.tsx** (modifié)
   - Intégration des boutons de génération
   - Récupération des données de l'API
   - Modal d'ajout de paiement

3. **Frontend/src/services/sale.service.ts** (modifié)
   - Méthode `addPayment()` : Enregistre un paiement
   - Méthode `getOutstanding()` : Liste des créances

### Bibliothèques Utilisées

- **jsPDF** : Génération de PDF
- **jspdf-autotable** : Tableaux dans les PDF

## ✅ AVANTAGES

1. **Professionnel** : Factures de qualité professionnelle
2. **Automatique** : Génération en un clic
3. **Complet** : Toutes les informations nécessaires
4. **Adaptatif** : S'adapte aux paiements échelonnés
5. **Traçable** : Historique complet des paiements
6. **Imprimable** : Prêt pour l'impression
7. **Personnalisé** : Avec les informations de votre entreprise

## 📝 INFORMATIONS ENTREPRISE

Les informations de l'entreprise (nom, adresse, téléphone, email) sont récupérées automatiquement depuis les paramètres de l'application.

Pour les modifier :
1. Aller dans "Paramètres"
2. Section "Informations de l'entreprise"
3. Modifier les informations
4. Enregistrer

## 🎯 CAS D'USAGE

### 1. Vente au Comptant
- Client paie intégralement
- Facture générée avec statut "Payé"
- Prête à imprimer et remettre au client

### 2. Vente à Crédit
- Client ne paie rien immédiatement
- Facture proforma générée
- Affiche le montant total à payer
- Date d'échéance visible

### 3. Vente avec Acompte
- Client paie 30% à la commande
- Facture proforma avec historique du paiement
- Affiche le reste à payer (70%)
- Date d'échéance pour le solde

### 4. Paiements Échelonnés
- Client paie en plusieurs fois
- Facture mise à jour à chaque paiement
- Historique complet visible
- Reste à payer calculé automatiquement

## 🚀 DÉPLOIEMENT

Le code a été poussé sur GitHub. Vercel va automatiquement redéployer le frontend dans 2-3 minutes.

---

**Date** : 23 février 2026  
**Version** : 1.3.0  
**Status** : ✅ Implémenté et déployé
