import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  threshold: number;
  supplier: mongoose.Types.ObjectId;
  status: 'ok' | 'low' | 'out';
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    },
    category: {
      type: String,
      required: [true, 'La catégorie est requise'],
      enum: ['Alimentaire', 'Quincaillerie', 'Vêtements', 'Électronique', 'Cosmétiques', 'Autres'],
    },
    quantity: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [0, 'La quantité ne peut pas être négative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'L\'unité est requise'],
      enum: ['sac', 'bidon', 'pot', 'carton', 'pièce', 'kg', 'litre', 'mètre', 'boîte'],
    },
    buyPrice: {
      type: Number,
      required: [true, 'Le prix d\'achat est requis'],
      min: [0, 'Le prix d\'achat ne peut pas être négatif'],
    },
    sellPrice: {
      type: Number,
      required: [true, 'Le prix de vente est requis'],
      min: [0, 'Le prix de vente ne peut pas être négatif'],
    },
    threshold: {
      type: Number,
      required: [true, 'Le seuil d\'alerte est requis'],
      min: [0, 'Le seuil ne peut pas être négatif'],
      default: 10,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Le fournisseur est requis'],
    },
    status: {
      type: String,
      enum: ['ok', 'low', 'out'],
      default: 'ok',
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pour calculer automatiquement le statut
ProductSchema.pre('save', function () {
  if (this.quantity === 0) {
    this.status = 'out';
  } else if (this.quantity <= this.threshold) {
    this.status = 'low';
  } else {
    this.status = 'ok';
  }
});

// Index pour la recherche
ProductSchema.index({ name: 'text', category: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
