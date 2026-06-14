import { Response } from 'express';
import Sale from '../models/Sale.model';
import Product from '../models/Product.model';
import Client from '../models/Client.model';
import StockMovement from '../models/StockMovement.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Rapport mensuel — ventes et achats par mois
// @route   GET /api/reports/monthly
export const getMonthlyReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const selectedYear = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  const startOfYear = new Date(selectedYear, 0, 1);
  const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);

  // ✅ Une seule agrégation pour les ventes (pas de boucle)
  const salesAgg = await Sale.aggregate([
    { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear }, status: 'completed' } },
    { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);

  // ✅ Une seule agrégation pour les achats (pas de boucle)
  const purchasesAgg = await StockMovement.aggregate([
    { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear }, type: 'entry', reason: 'Achat' } },
    { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'productInfo' } },
    { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
    { $group: { _id: { $month: '$createdAt' }, total: { $sum: { $multiply: ['$quantity', { $ifNull: ['$productInfo.buyPrice', 0] }] } } } },
  ]);

  const salesMap = new Map(salesAgg.map((s: any) => [s._id, s.total]));
  const purchasesMap = new Map(purchasesAgg.map((p: any) => [p._id, p.total]));
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  const data = monthNames.map((name, i) => {
    const ventes = salesMap.get(i + 1) ?? 0;
    const achats = purchasesMap.get(i + 1) ?? 0;
    return { name, month: i + 1, ventes, achats, profit: ventes - achats };
  });

  res.json({ success: true, year: selectedYear, data });
});

// @desc    Évolution du stock
// @route   GET /api/reports/stock-evolution
export const getStockEvolution = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Le stock actuel est le même pour toutes les périodes (snapshot)
  // On retourne le stock actuel par période pour le graphique
  const [totalStock] = await Product.aggregate([
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);
  const stock = totalStock?.total ?? 0;

  const now = new Date();
  const period = req.query.period as string;
  const count = period === 'week' ? 4 : 12;

  const data = Array.from({ length: count }, (_, i) => {
    if (period === 'week') {
      return { name: `Sem ${i + 1}`, stock };
    }
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return { name: monthNames[monthDate.getMonth()], stock, month: monthDate.getMonth() + 1 };
  });

  res.json({ success: true, period: period || 'week', data });
});

// @desc    Rapport journalier
// @route   GET /api/reports/daily
export const getDailyReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const selectedDate = req.query.date ? new Date(req.query.date as string) : new Date();
  selectedDate.setHours(0, 0, 0, 0);
  const endDate = new Date(selectedDate);
  endDate.setHours(23, 59, 59, 999);

  const [sales, stockMovements] = await Promise.all([
    Sale.find({ createdAt: { $gte: selectedDate, $lte: endDate } })
      .populate('client', 'name')
      .populate('items.product', 'name')
      .lean(),
    StockMovement.find({ createdAt: { $gte: selectedDate, $lte: endDate } })
      .populate('product', 'name')
      .lean(),
  ]);

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const entries = stockMovements.filter(m => m.type === 'entry');
  const exits = stockMovements.filter(m => m.type === 'exit');

  res.json({
    success: true,
    date: selectedDate,
    data: {
      sales: { count: sales.length, total: totalSales, items: sales },
      stock: { entries: entries.length, exits: exits.length, movements: stockMovements },
    },
  });
});

// @desc    Rapport par produit — agrégation globale
// @route   GET /api/reports/products
export const getProductReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [products, salesAgg, stockAgg] = await Promise.all([
    Product.find({}, 'name category quantity unit buyPrice sellPrice status supplier').populate('supplier', 'name').lean(),

    // ✅ Une seule agrégation pour toutes les ventes par produit
    Sale.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
    ]),

    // ✅ Une seule agrégation pour tous les mouvements par produit
    StockMovement.aggregate([
      { $group: { _id: { product: '$product', type: '$type' }, total: { $sum: '$quantity' } } },
    ]),
  ]);

  const salesMap = new Map(salesAgg.map((s: any) => [s._id.toString(), s]));
  const stockEntries = new Map<string, number>();
  const stockExits = new Map<string, number>();
  stockAgg.forEach((s: any) => {
    const key = s._id.product.toString();
    if (s._id.type === 'entry') stockEntries.set(key, s.total);
    else stockExits.set(key, s.total);
  });

  const data = products.map(p => {
    const id = p._id.toString();
    const sale = salesMap.get(id);
    return {
      _id: p._id, name: p.name, category: p.category,
      currentStock: p.quantity, unit: p.unit,
      buyPrice: p.buyPrice, sellPrice: p.sellPrice,
      supplier: (p.supplier as any)?.name,
      totalSold: sale?.totalSold ?? 0,
      revenue: sale?.revenue ?? 0,
      entries: stockEntries.get(id) ?? 0,
      exits: stockExits.get(id) ?? 0,
      status: p.status,
    };
  });

  res.json({ success: true, count: data.length, data });
});

// @desc    Rapport par catégorie — agrégation globale
// @route   GET /api/reports/categories
export const getCategoryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [products, salesAgg] = await Promise.all([
    Product.find({}, 'name category quantity sellPrice').lean(),

    // ✅ Une seule agrégation avec $lookup
    Sale.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo' } },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$productInfo.category', totalSales: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
    ]),
  ]);

  const salesMap = new Map(salesAgg.map((s: any) => [s._id, s]));

  const categories = ['Alimentaire', 'Quincaillerie', 'Vêtements', 'Électronique', 'Cosmétiques', 'Autres'];
  const data = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const sale = salesMap.get(cat);
    return {
      category: cat,
      productCount: catProducts.length,
      totalStock: catProducts.reduce((s, p) => s + p.quantity, 0),
      totalValue: catProducts.reduce((s, p) => s + p.quantity * p.sellPrice, 0),
      totalSales: sale?.totalSales ?? 0,
      revenue: sale?.revenue ?? 0,
    };
  });

  res.json({ success: true, data });
});

// @desc    Rapport clients
// @route   GET /api/reports/clients
export const getClientReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { clientId } = req.query;

  if (clientId) {
    const [sales] = await Promise.all([
      Sale.find({ client: clientId }).populate('items.product', 'name').sort({ createdAt: -1 }).lean(),
    ]);
    const totalSpent = sales.reduce((s, sale) => s + sale.total, 0);
    return res.json({ success: true, data: { salesCount: sales.length, totalSpent, sales } });
  }

  const clients = await Client.find({}, 'name phone address status totalPurchases lastPurchase').sort({ totalPurchases: -1 }).lean();
  res.json({ success: true, count: clients.length, data: clients });
});

// @desc    Inventaire complet
// @route   GET /api/reports/inventory
export const getInventoryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const products = await Product.find({}).populate('supplier', 'name').sort({ name: 1 }).lean();

  const totalValue = products.reduce((s, p) => s + p.quantity * p.buyPrice, 0);
  const totalItems = products.reduce((s, p) => s + p.quantity, 0);

  res.json({
    success: true,
    summary: {
      totalProducts: products.length,
      totalItems,
      totalValue,
      lowStockCount: products.filter(p => p.status === 'low').length,
      outOfStockCount: products.filter(p => p.status === 'out').length,
    },
    data: products,
  });
});
