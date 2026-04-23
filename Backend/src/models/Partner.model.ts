import mongoose, { Document, Schema } from 'mongoose';

export interface IPartner extends Document {
  name: string;
  phone: string;
  address?: string;
  description?: string;
  totalSent: number;
  lastContribution?: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du partenaire est requis'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      trim: true,
    },
    address: { type: String, trim: true },
    description: { type: String, trim: true },
    totalSent: { type: Number, default: 0, min: 0 },
    lastContribution: { type: Date },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

PartnerSchema.index({ name: 'text' });

export default mongoose.model<IPartner>('Partner', PartnerSchema);
