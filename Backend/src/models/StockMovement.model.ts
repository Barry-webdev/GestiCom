import mongoose, { Document, Schema } from 'mongoose';

export interface IStockMovement extends Document {
  type: 'entry' | 'exit';
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unit: string;
  reason: string;
  user: mongoose.Types.ObjectId;
  userName: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    type: {
      type: String,
      required: true,
      enum: ['entry', 'exit'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La quantité doit être au moins 1'],
    },
    unit: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'Achat',
        'Retour client',
        'Ajustement inventaire',
        'Transfert entrant',
        'Production',
        'Vente',
        'Perte',
        'Casse',
        'Vol',
        'Don',
        'Transfert sortant',
        'Échantillon',
        'Autre',
      ],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index
StockMovementSchema.index({ product: 1 });
StockMovementSchema.index({ createdAt: -1 });
StockMovementSchema.index({ type: 1 });

export default mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
