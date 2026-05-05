import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import Product from '../models/Product.model';
import Sale from '../models/Sale.model';
import Client from '../models/Client.model';
import StockMovement from '../models/StockMovement.model';
import Supplier from '../models/Supplier.model';

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last7DaysStart = new Date(now);
  last7DaysStart.setDate(last7DaysStart.getDate() - 6);
  last7DaysStart.setHours(0, 0, 0, 0);

  // ✅ TOUT en parallèle — un seul round-trip MongoDB
  const [
    products,
    todaySales,
    monthSales,
    activeClients,
    vipClients,
    lowStockProducts,
    todayMovements,
    monthMovements,
    activeSuppliers,
    totalSuppliers,
    last7DaysSales,        // Une seule requête pour les 7 jours
    topProductsAgg,        // Agrégation pour top produits
    categorySalesAgg,      // Agrégation pour catégories
    recentSales,
  ] = await Promise.all([
    // Overview
    Product.find({}, 'quantity buyPrice status name unit').lean(),
    Sale.countDocuments({ createdAt: { $gte: startOfDay }, status: 'completed' }),
    Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Client.countDocuments({ status: 'active' }),
    Client.countDocuments({ status: 'vip' }),
    Product.find({ status: { $in: ['low', 'out'] } }, 'name quantity unit status').lean(),
    StockMovement.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    StockMovement.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    Supplier.countDocuments({ status: 'active' }),
    Supplier.countDocuments(),

    // ✅ Graphique 7 jours — UNE seule requête + groupement JS
    Sale.find(
      { createdAt: { $gte: last7DaysStart }, status: 'completed' },
      'createdAt total'
    ).lean(),

    // ✅ Top produits — agrégation MongoDB (pas de N+1)
    Sale.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.productName' }, totalQuantity: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.total' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]),

    // ✅ Catégories — agrégation MongoDB (pas de 6 requêtes séparées)
    Sale.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo' } },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$productInfo.category', value: { $sum: '$items.total' } } },
    ]),

    // Ventes récentes
    Sale.find({}, 'clientName total createdAt items saleId')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Calculs overview
  const stockValue = products.reduce((s, p) => s + p.quantity * p.buyPrice, 0);
  const todaySalesTotal = await Sale.aggregate([
    { $match: { createdAt: { $gte: startOfDay }, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]).then(r => r[0]?.total ?? 0);

  const monthData = monthSales[0] ?? { total: 0, count: 0 };
  const todayEntry = todayMovements.find((m: any) => m._id === 'entry')?.count ?? 0;
  const todayExit = todayMovements.find((m: any) => m._id === 'exit')?.count ?? 0;
  const monthEntry = monthMovements.find((m: any) => m._id === 'entry')?.count ?? 0;
  const monthExit = monthMovements.find((m: any) => m._id === 'exit')?.count ?? 0;

  // ✅ Graphique 7 jours — groupement en JS (pas de boucle avec await)
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const daySales = last7DaysSales.filter((s: any) => {
      const d = new Date(s.createdAt);
      return d >= date && d < nextDate;
    });

    return {
      name: dayNames[date.getDay()],
      date: date.toISOString(),
      sales: daySales.length,
      revenue: daySales.reduce((sum: number, s: any) => sum + s.total, 0),
    };
  });

  // ✅ Catégories formatées
  const allCategories = ['Alimentaire', 'Quincaillerie', 'Vêtements', 'Électronique', 'Cosmétiques', 'Autres'];
  const catMap = new Map(categorySalesAgg.map((c: any) => [c._id, c.value]));
  const categorySales = allCategories.map(cat => ({
    name: cat,
    value: catMap.get(cat) ?? 0,
    products: products.filter(p => p.category === cat).length,
  }));

  // ✅ Top produits sans N+1
  const topProducts = topProductsAgg.map((item: any) => ({
    product: { _id: item._id, name: item.name },
    quantity: item.totalQuantity,
    revenue: item.totalRevenue,
  }));

  res.json({
    success: true,
    data: {
      overview: {
        totalProducts: products.length,
        stockValue,
        todaySalesCount: todaySales,
        todaySalesTotal,
        monthSalesCount: monthData.count,
        monthRevenue: monthData.total,
        activeClients,
        vipClients,
        lowStockAlerts: lowStockProducts.length,
        todayEntries: todayEntry,
        todayExits: todayExit,
        monthEntries: monthEntry,
        monthExits: monthExit,
        activeSuppliers,
        totalSuppliers,
      },
      charts: { last7Days, categorySales },
      topProducts,
      recentSales,
      lowStockProducts: lowStockProducts.slice(0, 10),
    },
  });
});
