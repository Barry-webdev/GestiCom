import { Response } from 'express';
import User from '../models/User.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin)
export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private (admin)
export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Cet email est déjà utilisé',
    });
  }

  // Créer l'utilisateur
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
  });

  res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin)
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  }

  const { name, email, phone, role, status } = req.body;

  // Vérifier si l'email est déjà utilisé par un autre utilisateur
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.role = role || user.role;
  user.status = status || user.status;

  await user.save();

  res.json({
    success: true,
    message: 'Utilisateur modifié avec succès',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin)
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  }

  // Empêcher la suppression de son propre compte
  if (user._id.toString() === req.user!._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Vous ne pouvez pas supprimer votre propre compte',
    });
  }

  // Empêcher la suppression d'un admin
  if (user.role === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Impossible de supprimer un administrateur',
    });
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'Utilisateur supprimé avec succès',
  });
});

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private (admin)
export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  }

  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Le mot de passe doit contenir au moins 6 caractères',
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès',
  });
});

// @desc    Toggle user status
// @route   PUT /api/users/:id/toggle-status
// @access  Private (admin)
export const toggleStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  }

  // Empêcher la désactivation de son propre compte
  if (user._id.toString() === req.user!._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Vous ne pouvez pas désactiver votre propre compte',
    });
  }

  user.status = user.status === 'active' ? 'inactive' : 'active';
  await user.save();

  res.json({
    success: true,
    message: `Utilisateur ${user.status === 'active' ? 'activé' : 'désactivé'} avec succès`,
    data: {
      _id: user._id,
      name: user.name,
      status: user.status,
    },
  });
});
