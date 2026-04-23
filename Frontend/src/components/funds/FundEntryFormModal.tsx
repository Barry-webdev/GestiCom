import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { partnerService } from "@/services/partner.service";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entry?: any;
  onSubmit: (data: any) => void;
}

export default function FundEntryFormModal({ open, onOpenChange, entry, onSubmit }: Props) {
  const [form, setForm] = useState({ category: "magasin", sourceName: "", amount: "", description: "", partner: "", date: "" });
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    partnerService.getAll().then(r => { if (r.success) setPartners(r.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (entry) {
      setForm({
        category: entry.category || "magasin",
        sourceName: entry.sourceName || "",
        amount: entry.amount?.toString() || "",
        description: entry.description || "",
        partner: entry.partner?._id || entry.partner || "",
        date: entry.date ? new Date(entry.date).toISOString().split("T")[0] : "",
      });
    } else {
      setForm({ category: "magasin", sourceName: "", amount: "", description: "", partner: "", date: new Date().toISOString().split("T")[0] });
    }
  }, [entry, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
      partner: form.category === "partenaire" ? form.partner : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Modifier l'entrée" : "Nouvelle entrée de fonds"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v, partner: "" }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="magasin">Magasin</SelectItem>
                <SelectItem value="etablissement">Établissement</SelectItem>
                <SelectItem value="residence">Résidence</SelectItem>
                <SelectItem value="partenaire">Partenaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.category === "partenaire" && (
            <div>
              <Label>Partenaire</Label>
              <Select value={form.partner} onValueChange={v => setForm(f => ({ ...f, partner: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un partenaire" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map(p => (
                    <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Source détaillée</Label>
            <Input className="mt-1" placeholder={
              form.category === "magasin" ? "Ex: Magasin principal" :
              form.category === "etablissement" ? "Ex: École ABC" :
              form.category === "residence" ? "Ex: Résidence Kaloum" : "Nom du partenaire"
            }
              value={form.sourceName} onChange={e => setForm(f => ({ ...f, sourceName: e.target.value }))} required />
          </div>

          <div>
            <Label>Montant (GNF)</Label>
            <Input className="mt-1" type="number" min="1" placeholder="0"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
          </div>

          <div>
            <Label>Date</Label>
            <Input className="mt-1" type="date"
              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>

          <div>
            <Label>Description (optionnel)</Label>
            <Textarea className="mt-1" rows={2} placeholder="Notes sur cette entrée..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" className="flex-1 btn-accent">
              {entry ? "Modifier" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
