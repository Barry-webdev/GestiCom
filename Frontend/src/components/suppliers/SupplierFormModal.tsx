import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck, Loader2 } from "lucide-react";

const supplierSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  phone: z.string().regex(/^\+224\s?\d{3}\s?\d{2}\s?\d{2}\s?\d{2}$/, "Format: +224 XXX XX XX XX"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  contact: z.string().min(3, "Le nom du contact doit contenir au moins 3 caractères"),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: any;
  onSubmit: (data: SupplierFormData) => void;
}

export function SupplierFormModal({
  open,
  onOpenChange,
  supplier,
  onSubmit,
}: SupplierFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!supplier;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      phone: supplier?.phone || "+224 ",
      address: supplier?.address || "",
      email: supplier?.email || "",
      contact: supplier?.contact || "",
    },
  });

  const handleSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? "Modifier le fournisseur" : "Nouveau fournisseur"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Modifiez les informations du fournisseur"
                  : "Ajoutez un nouveau fournisseur"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 mt-4">
            {/* Nom de l'entreprise */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'entreprise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Fria Commerce SARL"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Personne de contact */}
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personne de contact</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Mamadou Diallo"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Téléphone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+224 621 00 00 01"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (optionnel) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@fournisseur.com"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adresse */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Zone Industrielle, Conakry"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 btn-accent"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>{isEditing ? "Modifier" : "Ajouter"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
