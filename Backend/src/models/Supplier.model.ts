import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  phone: string;
  address: string;
  email?: string;
  contact: string;
  products: number;
  lastDelivery?: Date;
  totalValue: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du fournisseur est requis'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      match: [/^\+224\d{9}$/, 'Format de téléphone invalide (+224XXXXXXXXX)'],
    },
    address: {
      type: String,
      required: [true, 'L\'adresse est requise'],
      trim: true,
      minlength: [5, 'L\'adresse doit contenir au moins 5 caractères'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    contact: {
      type: String,
      required: [true, 'Le nom du contact est requis'],
      trim: true,
      minlength: [3, 'Le nom du contact doit contenir au moins 3 caractères'],
    },
    products: {
      type: Number,
      default: 0,
      min: [0, 'Le nombre de produits ne peut pas être négatif'],
    },
    lastDelivery: {
      type: Date,
    },
    totalValue: {
      type: Number,
      default: 0,
      min: [0, 'La valeur totale ne peut pas être négative'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche
SupplierSchema.index({ name: 'text', contact: 'text' });

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);
