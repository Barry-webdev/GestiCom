import { Response } from 'express';
import Notification from '../models/Notification.model';
import Product from '../models/Product.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { unreadOnly } = req.query;

  let query: any = {};
  if (unreadOnly === 'true') {
    query.read = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ read: false });

  res.json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification non trouvée',
    });
  }

  notification.read = true;
  await notification.save();

  res.json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ read: false }, { read: true });

  res.json({
    success: true,
    message: 'Toutes les notifications ont été marquées comme lues',
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification non trouvée',
    });
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: 'Notification supprimée',
  });
});

// @desc    Get stock alerts (low and out of stock)
// @route   GET /api/notifications/alerts
// @access  Private
export const getStockAlerts = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Produits en stock bas
  const lowStockProducts = await Product.find({ status: 'low' }).select('name quantity unit threshold');

  // Produits en rupture
  const outOfStockProducts = await Product.find({ status: 'out' }).select('name quantity unit');

  // Fenêtre de 24h pour éviter de recréer des notifications déjà vues
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  for (const product of lowStockProducts) {
    // Ne pas recréer si une notification existe déjà dans les 24 dernières heures (lue ou non)
    const existingNotif = await Notification.findOne({
      type: 'stock_low',
      product: product._id,
      createdAt: { $gte: since24h },
    });

    if (!existingNotif) {
      await Notification.create({
        type: 'stock_low',
        title: 'Stock bas',
        message: `${product.name} : ${product.quantity} ${product.unit}s restants (seuil: ${product.threshold})`,
        product: product._id,
        productName: product.name,
      });
    }
  }

  for (const product of outOfStockProducts) {
    // Ne pas recréer si une notification existe déjà dans les 24 dernières heures (lue ou non)
    const existingNotif = await Notification.findOne({
      type: 'stock_out',
      product: product._id,
      createdAt: { $gte: since24h },
    });

    if (!existingNotif) {
      await Notification.create({
        type: 'stock_out',
        title: 'Rupture de stock',
        message: `${product.name} est en rupture de stock`,
        product: product._id,
        productName: product.name,
      });
    }
  }

  res.json({
    success: true,
    data: {
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      products: {
        low: lowStockProducts,
        out: outOfStockProducts,
      },
    },
  });
});
