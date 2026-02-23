import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Printer,
  Download,
  User,
  Calendar,
  CreditCard,
  Package,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Données mockées
const saleData = {
  id: "VNT-2024-001",
  date: "22/12/2024",
  time: "14:30",
  client: {
    name: "Mamadou Diallo",
    phone: "+224 622 12 34 56",
    address: "Kaloum, Conakry",
  },
  items: [
    {
      id: 1,
      product: "Riz importé 50kg",
      quantity: 2,
      unit: "sac",
      price: 450000,
      total: 900000,
    },
    {
      id: 2,
      product: "Huile végétale 20L",
      quantity: 1,
      unit: "bidon",
      price: 280000,
      total: 280000,
    },
    {
      id: 3,
      product: "Sucre en poudre 25kg",
      quantity: 1,
      unit: "sac",
      price: 175000,
      total: 175000,
    },
  ],
  paymentMethod: "Espèces",
  status: "completed",
  user: "Vendeur 1",
  notes: "Client régulier, livraison prévue demain matin",
};

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
  };

  const subtotal = saleData.items.reduce((sum, item) => sum + item.total, 0);
  const tax = 0; // Pas de taxe pour l'instant
  const total = subtotal + tax;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Complétée</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">En attente</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Annulée</Badge>;
      default:
        return null;
    }
  };

  return (
    <MainLayout title="Détail de la vente" subtitle={`Vente ${saleData.id}`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate("/sales")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Télécharger</span>
          </Button>
          <Button className="btn-accent gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Facture</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails de la vente */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête de la vente */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Vente {saleData.id}
                </h2>
                <div className="flex items-center gap-2">
                  {getStatusBadge(saleData.status)}
                  <span className="text-sm text-muted-foreground">
                    {saleData.date} à {saleData.time}
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground mb-1">Montant total</p>
                <p className="text-3xl font-bold text-secondary">{formatPrice(total)}</p>
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">{saleData.client.name}</p>
                  <p className="text-sm text-muted-foreground">{saleData.client.phone}</p>
                  <p className="text-sm text-muted-foreground">{saleData.client.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Articles vendus */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Articles vendus</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Produit</TableHead>
                    <TableHead className="font-semibold text-center">Quantité</TableHead>
                    <TableHead className="font-semibold text-right">Prix unitaire</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleData.items.map((item) => (
                    <TableRow key={item.id} className="table-row">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{item.product}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-foreground">
                          {item.quantity} {item.unit}s
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-foreground">
                          {formatPrice(item.total)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totaux */}
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">TVA</span>
                    <span className="font-medium text-foreground">{formatPrice(tax)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-secondary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {saleData.notes && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-3">Notes</h3>
              <p className="text-muted-foreground">{saleData.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations de paiement */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Paiement</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Mode de paiement</p>
                  <p className="text-sm text-muted-foreground">{saleData.paymentMethod}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Date de paiement</p>
                  <p className="text-sm text-muted-foreground">
                    {saleData.date} à {saleData.time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Vendeur</p>
                  <p className="text-sm text-muted-foreground">{saleData.user}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Résumé</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Articles</span>
                <span className="font-semibold text-foreground">{saleData.items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quantité totale</span>
                <span className="font-semibold text-foreground">
                  {saleData.items.reduce((sum, item) => sum + item.quantity, 0)} unités
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Montant payé</span>
                  <span className="text-lg font-bold text-success">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                Générer facture
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" />
                Télécharger reçu
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
                Annuler la vente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
