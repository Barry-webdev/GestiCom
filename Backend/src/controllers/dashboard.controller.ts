import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import Product from '../models/Product.model';
import Sale from '../models/Sale.model';
import Client from '../models/Client.model';
import StockMovement from '../models/StockMovement.model';
import Supplier from '../models/Supplier.model';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Exécuter toutes les requêtes en parallèle pour optimiser les performances
  const [
    products,
    todaySales,
    monthSales,
    clients,
    lowStockProducts,
    todayStockMovements,
    monthStockMovements,
    suppliers,
  ] = await Promise.all([
    Product.find(),
    Sale.find({ createdAt: { $gte: startOfDay }, status: 'completed' }),
    Sale.find({ createdAt: { $gte: startOfMonth }, status: 'completed' }),
    Client.find(),
    Product.find({ status: { $in: ['low', 'out'] } }),
    StockMovement.find({ createdAt: { $gte: startOfDay } }),
    StockMovement.find({ createdAt: { $gte: startOfMonth } }),
    Supplier.find(),
  ]);

  // Calculer les statistiques
  const totalProducts = products.length;
  const stockValue = products.reduce((sum, p) => sum + (p.quantity * p.buyPrice), 0);
  
  const todaySalesCount = todaySales.length;
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  
  const monthSalesCount = monthSales.length;
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
  
  const activeClients = clients.filter(c => c.status === 'active').length;
  const vipClients = clients.filter(c => c.status === 'vip').length;
  
  const lowStockAlerts = lowStockProducts.length;
  
  const todayEntries = todayStockMovements.filter(m => m.type === 'entry').length;
  const todayExits = todayStockMovements.filter(m => m.type === 'exit').length;
  
  const monthEntries = monthStockMovements.filter(m => m.type === 'entry').length;
  const monthExits = monthStockMovements.filter(m => m.type === 'exit').length;
  
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalSuppliers = suppliers.length;

  // Ventes des 7 derniers jours pour le graphique
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    
    const daySales = await Sale.find({
      createdAt: { $gte: date, $lt: nextDate },
      status: 'completed',
    });
    
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    last7Days.push({
      name: dayNames[date.getDay()],
      date: date.toISOString(),
      sales: daySales.length,
      revenue: daySales.reduce((sum, s) => sum + s.total, 0),
    });
  }

  // Ventes par catégorie
  const categories = ['Alimentaire', 'Quincaillerie', 'Vêtements', 'Électronique', 'Cosmétiques', 'Autres'];
  const categorySales = await Promise.all(
    categories.map(async (category) => {
      const categoryProducts = products.filter(p => p.category === category);
      const productIds = categoryProducts.map(p => p._id);
      
      const sales = await Sale.find({
        'items.product': { $in: productIds },
        status: 'completed',
      });
      
      let total = 0;
      sales.forEach(sale => {
        sale.items.forEach((item: any) => {
          if (productIds.some(id => id.toString() === item.product.toString())) {
            total += item.total;
          }
        });
      });
      
      return {
        name: category,
        value: total,
        products: categoryProducts.length,
      };
    })
  );

  // Top 5 produits les plus vendus
  const topProducts = await Sale.aggregate([
    { $match: { status: 'completed' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
  ]);

  // Peupler les informations des produits
  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await Product.findById(item._id);
      return {
        product: product ? { _id: product._id, name: product.name } : null,
        quantity: item.totalQuantity,
        revenue: item.totalRevenue,
      };
    })
  );

  // Ventes récentes (5 dernières)
  const recentSales = await Sale.find()
    .populate('client', 'name')
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      overview: {
        totalProducts,
        stockValue,
        todaySalesCount,
        todaySalesTotal,
        monthSalesCount,
        monthRevenue,
        activeClients,
        vipClients,
        lowStockAlerts,
        todayEntries,
        todayExits,
        monthEntries,
        monthExits,
        activeSuppliers,
        totalSuppliers,
      },
      charts: {
        last7Days,
        categorySales,
      },
      topProducts: topProductsWithDetails.filter(p => p.product !== null),
      recentSales,
      lowStockProducts: lowStockProducts.slice(0, 10), // Limiter à 10
    },
  });
});
