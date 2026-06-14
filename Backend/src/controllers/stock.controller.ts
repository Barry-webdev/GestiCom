import { Response } from 'express';
import StockMovement from '../models/StockMovement.model';
import Product from '../models/Product.model';
import Supplier from '../models/Supplier.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all stock movements
// @route   GET /api/stock
// @access  Private
export const getStockMovements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, type, startDate, endDate } = req.query;

  let query: any = {};

  // Search filter
  if (search) {
    query.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { userName: { $regex: search, $options: 'i' } },
      { reason: { $regex: search, $options: 'i' } },
    ];
  }

  // Type filter
  if (type && type !== 'all') {
    query.type = type;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  const movements = await StockMovement.find(query)
    .populate('product', 'name category')
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: movements.length,
    data: movements,
  });
});

// @desc    Get single stock movement
// @route   GET /api/stock/:id
// @access  Private
export const getStockMovement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const movement = await StockMovement.findById(req.params.id)
    .populate('product', 'name category quantity unit')
    .populate('user', 'name email');

  if (!movement) {
    return res.status(404).json({
      success: false,
      message: 'Mouvement de stock non trouvé',
    });
  }

  res.json({
    success: true,
    data: movement,
  });
});

// @desc    Create stock movement
// @route   POST /api/stock
// @access  Private (admin, gestionnaire)
export const createStockMovement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, product: productId, quantity, reason, comment } = req.body;

  // Vérifier le produit
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produit non trouvé',
    });
  }

  // Vérifier le stock pour les sorties
  if (type === 'exit' && product.quantity < quantity) {
    return res.status(400).json({
      success: false,
      message: `Stock insuffisant. Disponible: ${product.quantity} ${product.unit}s`,
    });
  }

  // Créer le mouvement
  const movement = await StockMovement.create({
    type,
    product: productId,
    productName: product.name,
    quantity,
    unit: product.unit,
    reason,
    user: req.user!._id,
    userName: req.user!.name,
    comment,
  });

  // Mettre à jour le stock du produit
  if (type === 'entry') {
    product.quantity += quantity;
    
    // Si c'est un achat, mettre à jour le total des achats du fournisseur
    if (reason === 'Achat' && product.supplier) {
      const supplier = await Supplier.findById(product.supplier);
      if (supplier) {
        const purchaseAmount = quantity * product.buyPrice;
        supplier.totalValue += purchaseAmount;
        supplier.lastDelivery = new Date();
        await supplier.save();
      }
    }
  } else {
    product.quantity -= quantity;
  }
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Mouvement de stock enregistré avec succès',
    data: movement,
  });
});

// @desc    Update stock movement
// @route   PUT /api/stock/:id
// @access  Private (admin, gestionnaire)
export const updateStockMovement = asyncHandler(async (req: AuthRequest, res: Response) => {
  let movement = await StockMovement.findById(req.params.id);

  if (!movement) {
    return res.status(404).json({
      success: false,
      message: 'Mouvement de stock non trouvé',
    });
  }

  // On peut seulement modifier le commentaire
  const { comment } = req.body;

  if (comment !== undefined) {
    movement.comment = comment;
    await movement.save();
  }

  res.json({
    success: true,
    message: 'Mouvement de stock modifié avec succès',
    data: movement,
  });
});

// @desc    Delete stock movement
// @route   DELETE /api/stock/:id
// @access  Private (admin)
export const deleteStockMovement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const movement = await StockMovement.findById(req.params.id);

  if (!movement) {
    return res.status(404).json({
      success: false,
      message: 'Mouvement de stock non trouvé',
    });
  }

  // Annuler le mouvement dans le stock du produit
  const product = await Product.findById(movement.product);
  if (product) {
    if (movement.type === 'entry') {
      product.quantity -= movement.quantity;
    } else {
      product.quantity += movement.quantity;
    }
    await product.save();
  }

  await movement.deleteOne();

  res.json({
    success: true,
    message: 'Mouvement de stock supprimé avec succès',
  });
});

// @desc    Get stock statistics
// @route   GET /api/stock/stats/summary
// @access  Private
export const getStockStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // ✅ Une seule agrégation avec $facet au lieu de 4 requêtes find
  const [result] = await StockMovement.aggregate([
    {
      $facet: {
        todayEntries: [{ $match: { createdAt: { $gte: today }, type: 'entry' } }, { $count: 'count' }],
        todayExits: [{ $match: { createdAt: { $gte: today }, type: 'exit' } }, { $count: 'count' }],
        monthEntries: [{ $match: { createdAt: { $gte: thisMonth }, type: 'entry' } }, { $count: 'count' }],
        monthExits: [{ $match: { createdAt: { $gte: thisMonth }, type: 'exit' } }, { $count: 'count' }],
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      todayEntries: result.todayEntries[0]?.count ?? 0,
      todayExits: result.todayExits[0]?.count ?? 0,
      monthEntries: result.monthEntries[0]?.count ?? 0,
      monthExits: result.monthExits[0]?.count ?? 0,
    },
  });
});
