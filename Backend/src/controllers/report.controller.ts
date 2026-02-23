import { Response } from 'express';
import Sale from '../models/Sale.model';
import Product from '../models/Product.model';
import StockMovement from '../models/StockMovement.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get monthly sales and purchases report
// @route   GET /api/reports/monthly
// @access  Private
export const getMonthlyReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { year } = req.query;
  const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();

  const monthlyData = [];

  for (let month = 0; month < 12; month++) {
    const startDate = new Date(selectedYear, month, 1);
    const endDate = new Date(selectedYear, month + 1, 0, 23, 59, 59);

    // Ventes du mois
    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed',
    });
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

    // Achats du mois (entrées de stock avec raison "Achat")
    const purchases = await StockMovement.find({
      createdAt: { $gte: startDate, $lte: endDate },
      type: 'entry',
      reason: 'Achat',
    }).populate('product', 'buyPrice');

    let totalPurchases = 0;
    for (const movement of purchases) {
      const product = movement.product as any;
      if (product && product.buyPrice) {
        totalPurchases += movement.quantity * product.buyPrice;
      }
    }

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    monthlyData.push({
      name: monthNames[month],
      month: month + 1,
      ventes: totalSales,
      achats: totalPurchases,
      profit: totalSales - totalPurchases,
    });
  }

  res.json({
    success: true,
    year: selectedYear,
    data: monthlyData,
  });
});

// @desc    Get stock evolution report
// @route   GET /api/reports/stock-evolution
// @access  Private
export const getStockEvolution = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { period } = req.query; // 'week' or 'month'
  const now = new Date();
  const data = [];

  if (period === 'week') {
    // 4 dernières semaines
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Calculer le stock total à cette date
      const products = await Product.find();
      const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);

      data.push({
        name: `Sem ${4 - i}`,
        stock: totalStock,
        date: weekEnd,
      });
    }
  } else {
    // 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const products = await Product.find();
      const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);

      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      data.push({
        name: monthNames[monthDate.getMonth()],
        stock: totalStock,
        month: monthDate.getMonth() + 1,
      });
    }
  }

  res.json({
    success: true,
    period: period || 'week',
    data,
  });
});

// @desc    Get daily report
// @route   GET /api/reports/daily
// @access  Private
export const getDailyReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date } = req.query;
  const selectedDate = date ? new Date(date as string) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const endDate = new Date(selectedDate);
  endDate.setHours(23, 59, 59, 999);

  // Ventes du jour
  const sales = await Sale.find({
    createdAt: { $gte: selectedDate, $lte: endDate },
  }).populate('client', 'name').populate('items.product', 'name');

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  // Mouvements de stock du jour
  const stockMovements = await StockMovement.find({
    createdAt: { $gte: selectedDate, $lte: endDate },
  }).populate('product', 'name');

  const entries = stockMovements.filter(m => m.type === 'entry');
  const exits = stockMovements.filter(m => m.type === 'exit');

  res.json({
    success: true,
    date: selectedDate,
    data: {
      sales: {
        count: sales.length,
        total: totalSales,
        items: sales,
      },
      stock: {
        entries: entries.length,
        exits: exits.length,
        movements: stockMovements,
      },
    },
  });
});

// @desc    Get product report
// @route   GET /api/reports/products
// @access  Private
export const getProductReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const products = await Product.find().populate('supplier', 'name');

  const productData = await Promise.all(
    products.map(async (product) => {
      // Ventes du produit
      const sales = await Sale.find({
        'items.product': product._id,
      });

      let totalSold = 0;
      let revenue = 0;

      sales.forEach(sale => {
        const item = sale.items.find((i: any) => i.product.toString() === product._id.toString());
        if (item) {
          totalSold += item.quantity;
          revenue += item.total;
        }
      });

      // Mouvements de stock
      const movements = await StockMovement.find({
        product: product._id,
      });

      const entries = movements.filter(m => m.type === 'entry').reduce((sum, m) => sum + m.quantity, 0);
      const exits = movements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0);

      return {
        _id: product._id,
        name: product.name,
        category: product.category,
        currentStock: product.quantity,
        unit: product.unit,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        supplier: (product.supplier as any)?.name,
        totalSold,
        revenue,
        entries,
        exits,
        status: product.status,
      };
    })
  );

  res.json({
    success: true,
    count: productData.length,
    data: productData,
  });
});

// @desc    Get category report
// @route   GET /api/reports/categories
// @access  Private
export const getCategoryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = ['Alimentaire', 'Quincaillerie', 'Vêtements', 'Électronique', 'Cosmétiques', 'Autres'];

  const categoryData = await Promise.all(
    categories.map(async (category) => {
      const products = await Product.find({ category });
      const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
      const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.sellPrice), 0);

      // Ventes par catégorie
      let totalSales = 0;
      let revenue = 0;

      for (const product of products) {
        const sales = await Sale.find({
          'items.product': product._id,
        });

        sales.forEach(sale => {
          const item = sale.items.find((i: any) => i.product.toString() === product._id.toString());
          if (item) {
            totalSales += item.quantity;
            revenue += item.total;
          }
        });
      }

      return {
        category,
        productCount: products.length,
        totalStock,
        totalValue,
        totalSales,
        revenue,
      };
    })
  );

  res.json({
    success: true,
    data: categoryData,
  });
});

// @desc    Get client report
// @route   GET /api/reports/clients
// @access  Private
export const getClientReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { clientId } = req.query;

  if (clientId) {
    // Rapport pour un client spécifique
    const sales = await Sale.find({ client: clientId })
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    const totalSpent = sales.reduce((sum, sale) => sum + sale.total, 0);

    res.json({
      success: true,
      data: {
        salesCount: sales.length,
        totalSpent,
        sales,
      },
    });
  } else {
    // Rapport global des clients
    const Client = require('../models/Client.model').default;
    const clients = await Client.find().sort({ totalPurchases: -1 });

    res.json({
      success: true,
      count: clients.length,
      data: clients,
    });
  }
});

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private
export const getInventoryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const products = await Product.find().populate('supplier', 'name').sort({ name: 1 });

  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.buyPrice), 0);
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  const lowStock = products.filter(p => p.status === 'low');
  const outOfStock = products.filter(p => p.status === 'out');

  res.json({
    success: true,
    summary: {
      totalProducts: products.length,
      totalItems,
      totalValue,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
    },
    data: products,
  });
});
