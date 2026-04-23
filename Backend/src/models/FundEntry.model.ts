import mongoose, { Document, Schema } from 'mongoose';

export type FundCategory = 'magasin' | 'etablissement' | 'residence' | 'partenaire';

export interface IFundEntry extends Document {
  category: FundCategory;
  sourceName: string;       // Nom précis : "École ABC", "Résidence Kaloum", etc.
  amount: number;
  description?: string;
  partner?: mongoose.Types.ObjectId; // Lié à un partenaire si category === 'partenaire'
  partnerName?: string;
  user: mongoose.Types.ObjectId;
  userName: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FundEntrySchema = new Schema<IFundEntry>(
  {
    category: {
      type: String,
      required: [true, 'La catégorie est requise'],
      enum: ['magasin', 'etablissement', 'residence', 'partenaire'],
    },
    sourceName: {
      type: String,
      required: [true, 'La source est requise'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Le montant est requis'],
      min: [1, 'Le montant doit être supérieur à 0'],
    },
    description: { type: String, trim: true },
    partner: { type: Schema.Types.ObjectId, ref: 'Partner' },
    partnerName: { type: String, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

FundEntrySchema.index({ category: 1 });
FundEntrySchema.index({ date: -1 });
FundEntrySchema.index({ partner: 1 });

export default mongoose.model<IFundEntry>('FundEntry', FundEntrySchema);
