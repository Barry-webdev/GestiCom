import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  Loader2,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saleService } from "@/services/sale.service";
import { companyService } from "@/services/company.service";
import { downloadInvoice, printInvoice } from "@/lib/invoice-generator";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";

const paymentMethods = ["Espèces", "Mobile Money", "Orange Money", "MTN Money", "Virement"];

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saleData, setSaleData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [saleRes, companyRes] = await Promise.all([
        saleService.getById(id!),
        companyService.get(),
      ]);

      if (saleRes.success) {
        setSaleData(saleRes.data);
      }
      if (companyRes.success) {
        setCompanyData(companyRes.data);
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
      showErrorToast("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!saleData || !companyData) return;

    try {
      downloadInvoice({
        sale: saleData,
        company: companyData,
        client: saleData.client || {
          name: saleData.clientName,
          phone: "N/A",
        },
      });
      showSuccessToast("Succès", "Facture téléchargée");
    } catch (error) {
      showErrorToast("Erreur", "Impossible de générer la facture");
    }
  };

  const handlePrintInvoice = () => {
    if (!saleData || !companyData) return;

    try {
      printInvoice({
        sale: saleData,
        company: companyData,
        client: saleData.client || {
          name: saleData.clientName,
          phone: "N/A",
        },
      });
    } catch (error) {
      showErrorToast("Erreur", "Impossible d'imprimer la facture");
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || !paymentMethod) {
      showErrorToast("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      setSubmitting(true);
      const response = await saleService.addPayment(id!, {
        amount: paymentAmount,
        paymentMethod,
        notes: paymentNotes,
      });

      if (response.success) {
        showSuccessToast("Succès", "Paiement enregistré");
        setShowPaymentModal(false);
        setPaymentAmount(0);
        setPaymentMethod("");
        setPaymentNotes("");
        loadData();
      }
    } catch (error: any) {
      showErrorToast("Erreur", error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
  };

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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Payé</Badge>;
      case "partial":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Partiellement payé</Badge>;
      case "unpaid":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Impayé</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <MainLayout title="Détail de la vente" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!saleData) {
    return (
      <MainLayout title="Détail de la vente" subtitle="Vente introuvable">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Cette vente n'existe pas</p>
          <Button onClick={() => navigate("/sales")}>Retour aux ventes</Button>
        </div>
      </MainLayout>
    );
  }

  const subtotal = saleData.subtotal || 0;
  const tax = saleData.tax || 0;
  const total = saleData.total || 0;

  return (
    <MainLayout title="Détail de la vente" subtitle={`Vente ${saleData.saleId}`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate("/sales")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePrintInvoice}>
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleDownloadInvoice}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Télécharger</span>
          </Button>
          <Button className="btn-accent gap-2" onClick={handleDownloadInvoice}>
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Facture PDF</span>
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
                  Vente {saleData.saleId}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(saleData.status)}
                  {saleData.paymentStatus && getPaymentStatusBadge(saleData.paymentStatus)}
                  <span className="text-sm text-muted-foreground">
                    {new Date(saleData.createdAt).toLocaleDateString('fr-FR')}
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
                  <p className="font-semibold text-foreground mb-1">
                    {saleData.client?.name || saleData.clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {saleData.client?.phone || "N/A"}
                  </p>
                  {saleData.client?.address && (
                    <p className="text-sm text-muted-foreground">{saleData.client.address}</p>
                  )}
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
                  {saleData.items?.map((item: any, index: number) => (
                    <TableRow key={index} className="table-row">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{item.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-foreground">
                          {item.quantity} {item.unit}
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

          {/* Historique des paiements */}
          {saleData.payments && saleData.payments.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Historique des paiements</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Par</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saleData.payments.map((payment: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(payment.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="font-semibold">{formatPrice(payment.amount)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{payment.userName}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

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
          {/* Statut de paiement */}
          {saleData.paymentStatus !== 'paid' && (
            <div className="bg-card rounded-xl border border-warning p-6 shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Paiement</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payé</span>
                  <span className="font-semibold text-success">{formatPrice(saleData.amountPaid || 0)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Reste à payer</span>
                  <span className="text-lg font-bold text-warning">{formatPrice(saleData.amountDue || 0)}</span>
                </div>
                {saleData.dueDate && (
                  <div className="text-sm text-muted-foreground pt-2">
                    Échéance: {new Date(saleData.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
              <Button 
                className="w-full mt-4 btn-accent gap-2"
                onClick={() => setShowPaymentModal(true)}
              >
                <Plus className="w-4 h-4" />
                Enregistrer un paiement
              </Button>
            </div>
          )}

          {/* Informations */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Informations</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(saleData.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Vendeur</p>
                  <p className="text-sm text-muted-foreground">{saleData.userName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleDownloadInvoice}>
                <FileText className="w-4 h-4" />
                Télécharger facture
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handlePrintInvoice}>
                <Printer className="w-4 h-4" />
                Imprimer facture
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de paiement */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>
              Reste à payer: {formatPrice(saleData.amountDue || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Montant (GNF)</Label>
              <Input
                type="number"
                min="0"
                max={saleData.amountDue}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                placeholder="Montant du paiement"
              />
            </div>
            <div>
              <Label>Mode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optionnel)</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Notes sur ce paiement"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 btn-accent"
                onClick={handleAddPayment}
                disabled={submitting || !paymentAmount || !paymentMethod}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
