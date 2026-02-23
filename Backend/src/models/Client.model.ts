import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  phone: string;
  address: string;
  email?: string;
  totalPurchases: number;
  lastPurchase?: Date;
  status: 'active' | 'inactive' | 'vip';
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du client est requis'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      validate: {
        validator: function(v: string) {
          // Accepter +224XXXXXXXXX ou 224XXXXXXXXX ou XXXXXXXXX (9 chiffres)
          return /^(\+?224)?[0-9]{9}$/.test(v.replace(/\s/g, ''));
        },
        message: 'Format de téléphone invalide (ex: +224621234567 ou 621234567)'
      },
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
    totalPurchases: {
      type: Number,
      default: 0,
      min: [0, 'Le total des achats ne peut pas être négatif'],
    },
    lastPurchase: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'vip'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche
ClientSchema.index({ name: 'text', phone: 'text' });

export default mongoose.model<IClient>('Client', ClientSchema);
