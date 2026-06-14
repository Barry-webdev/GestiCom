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
  const updated = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  if (!updated) return res.status(404).json({ success: false, message: 'Notification non trouvée' });
  res.json({ success: true, data: updated });
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
  const [lowStockProducts, outOfStockProducts] = await Promise.all([
    Product.find({ status: 'low' }, 'name quantity unit threshold').lean(),
    Product.find({ status: 'out' }, 'name quantity unit').lean(),
  ]);

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const allProducts = [...lowStockProducts, ...outOfStockProducts];

  if (allProducts.length === 0) {
    return res.json({ success: true, data: { lowStock: 0, outOfStock: 0, products: { low: [], out: [] } } });
  }

  // ✅ Une seule requête pour récupérer toutes les notifs existantes (pas de N+1)
  const productIds = allProducts.map(p => p._id);
  const existingNotifs = await Notification.find({
    product: { $in: productIds },
    createdAt: { $gte: since24h },
  }, 'type product').lean();

  const existingSet = new Set(existingNotifs.map(n => `${n.type}_${n.product}`));

  // Créer les notifications manquantes en bulk
  const toCreate = [];

  for (const product of lowStockProducts) {
    if (!existingSet.has(`stock_low_${product._id}`)) {
      toCreate.push({
        type: 'stock_low',
        title: 'Stock bas',
        message: `${product.name} : ${product.quantity} ${product.unit}s restants (seuil: ${(product as any).threshold})`,
        product: product._id,
        productName: product.name,
      });
    }
  }

  for (const product of outOfStockProducts) {
    if (!existingSet.has(`stock_out_${product._id}`)) {
      toCreate.push({
        type: 'stock_out',
        title: 'Rupture de stock',
        message: `${product.name} est en rupture de stock`,
        product: product._id,
        productName: product.name,
      });
    }
  }

  if (toCreate.length > 0) {
    await Notification.insertMany(toCreate);
  }

  res.json({
    success: true,
    data: {
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      products: { low: lowStockProducts, out: outOfStockProducts },
    },
  });
});
