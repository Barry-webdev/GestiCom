import { Response } from 'express';
import Product from '../models/Product.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, category, status } = req.query;

  let query: any = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { supplier: { $regex: search, $options: 'i' } },
    ];
  }

  // Category filter
  if (category && category !== 'all') {
    query.category = category;
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  const products = await Product.find(query).populate('supplier', 'name').sort({ createdAt: -1 });

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id).populate('supplier', 'name');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produit non trouvé',
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (admin, gestionnaire)
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Produit créé avec succès',
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (admin, gestionnaire)
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produit non trouvé',
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Produit modifié avec succès',
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (admin)
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produit non trouvé',
    });
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: 'Produit supprimé avec succès',
  });
});

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
export const getLowStockProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const products = await Product.find({
    $or: [{ status: 'low' }, { status: 'out' }],
  }).sort({ quantity: 1 });

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});
