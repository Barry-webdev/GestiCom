import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  partner?: any;
  onSubmit: (data: any) => void;
}

export default function PartnerFormModal({ open, onOpenChange, partner, onSubmit }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", description: "" });

  useEffect(() => {
    if (partner) {
      setForm({ name: partner.name || "", phone: partner.phone || "", address: partner.address || "", description: partner.description || "" });
    } else {
      setForm({ name: "", phone: "", address: "", description: "" });
    }
  }, [partner, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{partner ? "Modifier le partenaire" : "Nouveau partenaire"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Nom complet</Label>
            <Input className="mt-1" placeholder="Nom du partenaire"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input className="mt-1" placeholder="+224XXXXXXXXX"
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
          </div>
          <div>
            <Label>Adresse (optionnel)</Label>
            <Input className="mt-1" placeholder="Adresse"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <Label>Description (optionnel)</Label>
            <Textarea className="mt-1" rows={2} placeholder="Notes sur ce partenaire..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" className="flex-1 btn-accent">
              {partner ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
