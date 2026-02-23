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
import { ShoppingCart, Plus, Trash2, Loader2 } from "lucide-react";
import { clientService } from "@/services/client.service";
import { productService } from "@/services/product.service";

const saleSchema = z.object({
  client: z.string().min(1, "Veuillez sélectionner un client"),
  paymentMethod: z.string().min(1, "Veuillez sélectionner un mode de paiement"),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface CartItem {
  product: string;
  quantity: number;
}

interface SaleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const paymentMethods = ["Espèces", "Mobile Money", "Virement", "Crédit"];

export function SaleFormModal({ open, onOpenChange, onSubmit }: SaleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, productsRes] = await Promise.all([
        clientService.getAll(),
        productService.getAll(),
      ]);
      
      if (clientsRes.success) {
        setClients(clientsRes.data);
      }
      
      if (productsRes.success) {
        setProducts(productsRes.data);
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      client: "",
      paymentMethod: "",
    },
  });

  const addToCart = () => {
    if (!selectedProduct) return;

    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return;

    const existingItem = cart.find((item) => item.product === selectedProduct);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product === selectedProduct
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product: selectedProduct,
          quantity,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product !== productId));
  };

  const getCartItemDetails = (item: CartItem) => {
    const product = products.find((p) => p._id === item.product);
    if (!product) return null;
    return {
      name: product.name,
      price: product.sellPrice,
      total: product.sellPrice * item.quantity,
    };
  };

  const totalAmount = cart.reduce((sum, item) => {
    const details = getCartItemDetails(item);
    return sum + (details?.total || 0);
  }, 0);

  const handleSubmit = async (data: SaleFormData) => {
    if (cart.length === 0) {
      alert("Veuillez ajouter au moins un produit");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, items: cart });
      form.reset();
      setCart([]);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("fr-GN").format(value) + " GNF";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Nouvelle vente</DialogTitle>
              <DialogDescription>Créer une nouvelle transaction de vente</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Ajouter des produits */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Ajouter des produits</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="sm:col-span-2">
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name} - {formatPrice(product.sellPrice)} (Stock: {product.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20"
                    placeholder="Qté"
                  />
                  <Button
                    type="button"
                    onClick={addToCart}
                    disabled={!selectedProduct || loading}
                    className="btn-accent flex-1"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Panier */}
          {cart.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b border-border">
                <h3 className="font-semibold text-foreground">Panier ({cart.length} articles)</h3>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {cart.map((item) => {
                  const details = getCartItemDetails(item);
                  if (!details) return null;
                  return (
                    <div
                      key={item.product}
                      className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{details.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatPrice(details.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-foreground">{formatPrice(details.total)}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.product)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-primary/5 px-4 py-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-secondary">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              {/* Client */}
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mode de paiement */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de paiement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>Valider la vente</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
