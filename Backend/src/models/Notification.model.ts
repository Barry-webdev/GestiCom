import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: 'stock_low' | 'stock_out' | 'sale' | 'stock_movement';
  title: string;
  message: string;
  product?: mongoose.Types.ObjectId;
  productName?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      required: true,
      enum: ['stock_low', 'stock_out', 'sale', 'stock_movement'],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les requêtes
NotificationSchema.index({ read: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ product: 1 });
// TTL — auto-suppression après 30 jours
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
