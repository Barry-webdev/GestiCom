import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Middleware de validation générique
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors,
      });
    }
    
    next();
  };
};

// Schémas de validation pour l'authentification
export const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères',
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'L\'email est requis',
      'string.email': 'L\'email doit être valide',
    }),
    phone: Joi.string().pattern(/^\+224\d{9}$/).required().messages({
      'string.empty': 'Le téléphone est requis',
      'string.pattern.base': 'Le téléphone doit être au format +224XXXXXXXXX',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    }),
    role: Joi.string().valid('admin', 'gestionnaire', 'vendeur', 'lecteur').default('vendeur'),
  }),
  
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'L\'email est requis',
      'string.email': 'L\'email doit être valide',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Le mot de passe est requis',
    }),
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Le mot de passe actuel est requis',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.empty': 'Le nouveau mot de passe est requis',
      'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
    }),
  }),
};

// Schémas de validation pour les produits
export const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required().messages({
      'string.empty': 'Le nom du produit est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
    }),
    category: Joi.string().valid('Alimentaire', 'Quincaillerie', 'Vêtements', 'Électronique', 'Cosmétiques', 'Autres').required().messages({
      'string.empty': 'La catégorie est requise',
      'any.only': 'Catégorie invalide',
    }),
    quantity: Joi.number().min(0).required().messages({
      'number.base': 'La quantité doit être un nombre',
      'number.min': 'La quantité ne peut pas être négative',
    }),
    unit: Joi.string().valid('pièce', 'kg', 'litre', 'mètre', 'carton', 'sac').required(),
    buyPrice: Joi.number().min(0).required().messages({
      'number.base': 'Le prix d\'achat doit être un nombre',
      'number.min': 'Le prix d\'achat ne peut pas être négatif',
    }),
    sellPrice: Joi.number().min(0).required().messages({
      'number.base': 'Le prix de vente doit être un nombre',
      'number.min': 'Le prix de vente ne peut pas être négatif',
    }),
    alertThreshold: Joi.number().min(0).default(10),
    supplier: Joi.string().allow(null, ''),
    description: Joi.string().max(500).allow(''),
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(200),
    category: Joi.string().valid('Alimentaire', 'Quincaillerie', 'Vêtements', 'Électronique', 'Cosmétiques', 'Autres'),
    quantity: Joi.number().min(0),
    unit: Joi.string().valid('pièce', 'kg', 'litre', 'mètre', 'carton', 'sac'),
    buyPrice: Joi.number().min(0),
    sellPrice: Joi.number().min(0),
    alertThreshold: Joi.number().min(0),
    supplier: Joi.string().allow(null, ''),
    description: Joi.string().max(500).allow(''),
  }),
};

// Schémas de validation pour les clients
export const clientSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Le nom du client est requis',
    }),
    phone: Joi.string().pattern(/^\+224\d{9}$/).required().messages({
      'string.pattern.base': 'Le téléphone doit être au format +224XXXXXXXXX',
    }),
    email: Joi.string().email().allow(''),
    address: Joi.string().max(200).allow(''),
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^\+224\d{9}$/),
    email: Joi.string().email().allow(''),
    address: Joi.string().max(200).allow(''),
    status: Joi.string().valid('active', 'inactive', 'vip'),
  }),
};

// Schémas de validation pour les fournisseurs
export const supplierSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Le nom du fournisseur est requis',
    }),
    phone: Joi.string().pattern(/^\+224\d{9}$/).required().messages({
      'string.pattern.base': 'Le téléphone doit être au format +224XXXXXXXXX',
    }),
    email: Joi.string().email().allow(''),
    address: Joi.string().max(200).allow(''),
    contact: Joi.string().max(100).allow(''),
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^\+224\d{9}$/),
    email: Joi.string().email().allow(''),
    address: Joi.string().max(200).allow(''),
    contact: Joi.string().max(100).allow(''),
    status: Joi.string().valid('active', 'inactive'),
  }),
};

// Schémas de validation pour les ventes
export const saleSchemas = {
  create: Joi.object({
    client: Joi.string().allow(null, ''),
    items: Joi.array().min(1).items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    ).required().messages({
      'array.min': 'Au moins un article est requis',
    }),
    paymentMethod: Joi.string().valid('Espèces', 'Mobile Money', 'Virement', 'Crédit').required(),
    notes: Joi.string().max(500).allow(''),
  }),
};

// Schémas de validation pour les mouvements de stock
export const stockSchemas = {
  create: Joi.object({
    type: Joi.string().valid('entry', 'exit').required(),
    product: Joi.string().required(),
    quantity: Joi.number().min(1).required().messages({
      'number.min': 'La quantité doit être au moins 1',
    }),
    reason: Joi.string().required().messages({
      'string.empty': 'La raison est requise',
    }),
    comment: Joi.string().max(500).allow(''),
  }),
};

// Schémas de validation pour les utilisateurs
export const userSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+224\d{9}$/).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'gestionnaire', 'vendeur', 'lecteur').required(),
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+224\d{9}$/),
    role: Joi.string().valid('admin', 'gestionnaire', 'vendeur', 'lecteur'),
    status: Joi.string().valid('active', 'inactive'),
  }),
};

// Schémas de validation pour l'entreprise
export const companySchemas = {
  update: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    phone: Joi.string().pattern(/^\+224\d{9}$/).required(),
    email: Joi.string().email().allow(''),
    address: Joi.string().max(300).allow(''),
  }),
};
