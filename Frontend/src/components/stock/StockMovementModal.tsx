import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { productService } from "@/services/product.service";

const stockMovementSchema = z.object({
  type: z.enum(["entry", "exit"]),
  product: z.string().min(1, "Veuillez sélectionner un produit"),
  quantity: z.coerce.number().min(1, "La quantité doit être supérieure à 0"),
  reason: z.string().min(1, "Veuillez sélectionner une raison"),
  comment: z.string().optional(),
});

type StockMovementFormData = z.infer<typeof stockMovementSchema>;

interface StockMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "entry" | "exit";
  onSubmit: (data: StockMovementFormData) => void;
}

const entryReasons = ["Achat", "Retour client", "Ajustement inventaire", "Transfert entrant", "Production"];
const exitReasons = ["Vente", "Perte", "Casse", "Vol", "Don", "Transfert sortant", "Échantillon", "Autre"];

export function StockMovementModal({
  open,
  onOpenChange,
  type,
  onSubmit,
}: StockMovementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      type,
      product: "",
      quantity: 1,
      reason: "",
      comment: "",
    },
  });

  // Mettre à jour le type quand il change
  useEffect(() => {
    form.setValue('type', type);
    form.setValue('reason', ''); // Réinitialiser la raison
  }, [type, form]);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: StockMovementFormData) => {
    setIsSubmitting(true);
    try {
      console.log('📤 Données envoyées:', data);
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEntry = type === "entry";
  const Icon = isEntry ? ArrowUpCircle : ArrowDownCircle;
  const iconColor = isEntry ? "text-success" : "text-destructive";
  const bgColor = isEntry ? "bg-success/10" : "bg-destructive/10";
  const reasons = isEntry ? entryReasons : exitReasons;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEntry ? "Entrée de stock" : "Sortie de stock"}
              </DialogTitle>
              <DialogDescription>
                {isEntry
                  ? "Enregistrer une entrée de produit"
                  : "Enregistrer une sortie de produit"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 mt-4">
            {/* Produit */}
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loading ? (
                        <SelectItem value="loading" disabled>Chargement...</SelectItem>
                      ) : products.length === 0 ? (
                        <SelectItem value="empty" disabled>Aucun produit</SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
                            {product.name} (Stock: {product.quantity} {product.unit}s)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantité et Raison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        className="input-field"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Commentaire */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaire (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ajouter un commentaire..."
                      className="resize-none"
                      rows={3}
                      {...field}
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
                className={`flex-1 ${
                  isEntry
                    ? "bg-success hover:bg-success/90 text-success-foreground"
                    : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>Enregistrer</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
