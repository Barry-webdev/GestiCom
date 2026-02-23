import { Response } from 'express';
import Supplier from '../models/Supplier.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, status } = req.query;

  let query: any = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { contact: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  const suppliers = await Supplier.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers,
  });
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
export const getSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Fournisseur non trouvé',
    });
  }

  res.json({
    success: true,
    data: supplier,
  });
});

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (admin, gestionnaire)
export const createSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const supplier = await Supplier.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Fournisseur créé avec succès',
    data: supplier,
  });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (admin, gestionnaire)
export const updateSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  let supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Fournisseur non trouvé',
    });
  }

  supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Fournisseur modifié avec succès',
    data: supplier,
  });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (admin)
export const deleteSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Fournisseur non trouvé',
    });
  }

  await supplier.deleteOne();

  res.json({
    success: true,
    message: 'Fournisseur supprimé avec succès',
  });
});
