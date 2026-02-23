import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  phone: string;
  address: string;
  email?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Le nom de l\'entreprise est requis'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'L\'adresse est requise'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompany>('Company', CompanySchema);
