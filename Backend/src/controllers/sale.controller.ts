import { Response } from 'express';
import Sale from '../models/Sale.model';
import Product from '../models/Product.model';
import Client from '../models/Client.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
export const getSales = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, status, paymentStatus, startDate, endDate } = req.query;

  let query: any = {};

  // Search filter
  if (search) {
    query.$or = [
      { saleId: { $regex: search, $options: 'i' } },
      { clientName: { $regex: search, $options: 'i' } },
    ];
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Payment status filter
  if (paymentStatus && paymentStatus !== 'all') {
    query.paymentStatus = paymentStatus;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  const sales = await Sale.find(query)
    .populate('client', 'name phone')
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: sales.length,
    data: sales,
  });
});

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
export const getSale = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sale = await Sale.findById(req.params.id)
    .populate('client', 'name phone address email')
    .populate('user', 'name email')
    .populate('items.product', 'name category')
    .populate('payments.user', 'name');

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Vente non trouvée',
    });
  }

  res.json({
    success: true,
    data: sale,
  });
});

// @desc    Create sale
// @route   POST /api/sales
// @access  Private (admin, gestionnaire, vendeur)
export const createSale = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { client, items, initialPayment, paymentMethod, dueDate, notes } = req.body;

  // Vérifier le client
  const clientDoc = await Client.findById(client);
  if (!clientDoc) {
    return res.status(404).json({
      success: false,
      message: 'Client non trouvé',
    });
  }

  // Calculer les totaux et vérifier le stock
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Produit ${item.product} non trouvé`,
      });
    }

    if (product.quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant pour ${product.name}. Disponible: ${product.quantity}`,
      });
    }

    const itemTotal = product.sellPrice * item.quantity;
    subtotal += itemTotal;

    processedItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      unit: product.unit,
      price: product.sellPrice,
      total: itemTotal,
    });

    // Déduire du stock
    product.quantity -= item.quantity;
    await product.save();
  }

  const tax = 0;
  const total = subtotal + tax;
  const amountPaid = initialPayment || 0;
  const amountDue = total - amountPaid;

  // Déterminer le statut de paiement
  let paymentStatus: 'paid' | 'partial' | 'unpaid';
  if (amountPaid >= total) {
    paymentStatus = 'paid';
  } else if (amountPaid > 0) {
    paymentStatus = 'partial';
  } else {
    paymentStatus = 'unpaid';
  }

  // Générer le saleId
  const year = new Date().getFullYear();
  const count = await Sale.countDocuments();
  const saleId = `VNT-${year}-${String(count + 1).padStart(4, '0')}`;

  // Créer le tableau de paiements
  const payments = [];
  if (amountPaid > 0) {
    payments.push({
      amount: amountPaid,
      paymentMethod,
      date: new Date(),
      user: req.user!._id,
      userName: req.user!.name,
      notes: 'Paiement initial',
    });
  }

  // Créer la vente
  const sale = await Sale.create({
    saleId,
    client,
    clientName: clientDoc.name,
    items: processedItems,
    subtotal,
    tax,
    total,
    amountPaid,
    amountDue,
    payments,
    paymentStatus,
    status: 'completed',
    dueDate: dueDate ? new Date(dueDate) : undefined,
    user: req.user!._id,
    userName: req.user!.name,
    notes,
  });

  // Mettre à jour le client
  clientDoc.totalPurchases += total;
  clientDoc.lastPurchase = new Date();
  
  // Promouvoir en VIP si le total dépasse 5 000 000 GNF
  if (clientDoc.totalPurchases >= 5000000 && clientDoc.status !== 'vip') {
    clientDoc.status = 'vip';
    console.log(`🌟 Client ${clientDoc.name} promu en VIP ! Total: ${clientDoc.totalPurchases} GNF`);
  }
  
  await clientDoc.save();

  res.status(201).json({
    success: true,
    message: 'Vente créée avec succès',
    data: sale,
  });
});

// @desc    Add payment to sale
// @route   POST /api/sales/:id/payments
// @access  Private (admin, gestionnaire, vendeur)
export const addPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, paymentMethod, notes } = req.body;

  const sale = await Sale.findById(req.params.id);

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Vente non trouvée',
    });
  }

  if (sale.paymentStatus === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Cette vente est déjà entièrement payée',
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Le montant doit être supérieur à 0',
    });
  }

  if (amount > sale.amountDue) {
    return res.status(400).json({
      success: false,
      message: `Le montant ne peut pas dépasser le montant dû (${sale.amountDue} GNF)`,
    });
  }

  // Ajouter le paiement
  sale.payments.push({
    amount,
    paymentMethod,
    date: new Date(),
    notes,
    user: req.user!._id,
    userName: req.user!.name,
  });

  // Mettre à jour les montants
  sale.amountPaid += amount;
  sale.amountDue -= amount;

  // Mettre à jour le statut de paiement
  if (sale.amountDue <= 0) {
    sale.paymentStatus = 'paid';
  } else {
    sale.paymentStatus = 'partial';
  }

  await sale.save();

  res.json({
    success: true,
    message: 'Paiement enregistré avec succès',
    data: sale,
  });
});

// @desc    Get sales with outstanding payments (créances)
// @route   GET /api/sales/outstanding
// @access  Private
export const getOutstandingSales = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sales = await Sale.find({
    paymentStatus: { $in: ['unpaid', 'partial'] },
    status: 'completed',
  })
    .populate('client', 'name phone')
    .sort({ dueDate: 1, createdAt: -1 });

  const totalOutstanding = sales.reduce((sum, sale) => sum + sale.amountDue, 0);

  res.json({
    success: true,
    count: sales.length,
    totalOutstanding,
    data: sales,
  });
});

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private (admin, gestionnaire)
export const updateSale = asyncHandler(async (req: AuthRequest, res: Response) => {
  let sale = await Sale.findById(req.params.id);

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Vente non trouvée',
    });
  }

  // On peut seulement modifier le statut, la date d'échéance et les notes
  const { status, dueDate, notes } = req.body;

  if (status) sale.status = status;
  if (dueDate) sale.dueDate = new Date(dueDate);
  if (notes !== undefined) sale.notes = notes;

  await sale.save();

  res.json({
    success: true,
    message: 'Vente modifiée avec succès',
    data: sale,
  });
});

// @desc    Delete sale (cancel)
// @route   DELETE /api/sales/:id
// @access  Private (admin)
export const deleteSale = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sale = await Sale.findById(req.params.id);

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Vente non trouvée',
    });
  }

  // Remettre les produits en stock
  for (const item of sale.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.quantity += item.quantity;
      await product.save();
    }
  }

  // Mettre à jour le client
  const client = await Client.findById(sale.client);
  if (client) {
    client.totalPurchases -= sale.total;
    await client.save();
  }

  await sale.deleteOne();

  res.json({
    success: true,
    message: 'Vente annulée avec succès',
  });
});

// @desc    Get sales statistics
// @route   GET /api/sales/stats/summary
// @access  Private
export const getSalesStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todaySales, monthSales, totalSales, outstandingSales] = await Promise.all([
    Sale.find({ createdAt: { $gte: today }, status: 'completed' }),
    Sale.find({ createdAt: { $gte: thisMonth }, status: 'completed' }),
    Sale.find({ status: 'completed' }),
    Sale.find({ paymentStatus: { $in: ['unpaid', 'partial'] }, status: 'completed' }),
  ]);

  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const monthTotal = monthSales.reduce((sum, sale) => sum + sale.total, 0);
  const averageBasket = totalSales.length > 0 
    ? totalSales.reduce((sum, sale) => sum + sale.total, 0) / totalSales.length 
    : 0;
  const totalOutstanding = outstandingSales.reduce((sum, sale) => sum + sale.amountDue, 0);

  res.json({
    success: true,
    data: {
      todayCount: todaySales.length,
      todayTotal,
      monthCount: monthSales.length,
      monthTotal,
      averageBasket,
      outstandingCount: outstandingSales.length,
      totalOutstanding,
    },
  });
});
