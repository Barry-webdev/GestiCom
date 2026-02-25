import mongoose, { Document, Schema } from 'mongoose';

export interface ISaleItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface IPayment {
  amount: number;
  paymentMethod: string;
  date: Date;
  notes?: string;
  user: mongoose.Types.ObjectId;
  userName: string;
}

export interface ISale extends Document {
  saleId: string;
  client: mongoose.Types.ObjectId;
  clientName: string;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  payments: IPayment[];
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  status: 'completed' | 'pending' | 'cancelled';
  dueDate?: Date;
  user: mongoose.Types.ObjectId;
  userName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
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
  price: {
    type: Number,
    required: true,
    min: [0, 'Le prix ne peut pas être négatif'],
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Le total ne peut pas être négatif'],
  },
});

const PaymentSchema = new Schema<IPayment>({
  amount: {
    type: Number,
    required: true,
    min: [0, 'Le montant ne peut pas être négatif'],
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Espèces', 'Mobile Money', 'Orange Money', 'MTN Money', 'Virement', 'Chèque'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
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
});

const SaleSchema = new Schema<ISale>(
  {
    saleId: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    items: [SaleItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Le sous-total ne peut pas être négatif'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'La taxe ne peut pas être négative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Le total ne peut pas être négatif'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Le montant payé ne peut pas être négatif'],
    },
    amountDue: {
      type: Number,
      default: 0,
      min: [0, 'Le montant dû ne peut pas être négatif'],
    },
    payments: [PaymentSchema],
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'unpaid',
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled'],
      default: 'completed',
    },
    dueDate: {
      type: Date,
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
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Générer automatiquement le saleId
SaleSchema.pre('save', async function (next) {
  if (!this.saleId) {
    try {
      const year = new Date().getFullYear();
      const Sale = mongoose.model('Sale');
      const count = await Sale.countDocuments();
      this.saleId = `VNT-${year}-${String(count + 1).padStart(4, '0')}`;
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Index
SaleSchema.index({ saleId: 1 });
SaleSchema.index({ client: 1 });
SaleSchema.index({ paymentStatus: 1 });
SaleSchema.index({ createdAt: -1 });

export default mongoose.model<ISale>('Sale', SaleSchema);
