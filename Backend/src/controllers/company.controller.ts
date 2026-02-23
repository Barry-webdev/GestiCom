import { Response } from 'express';
import Company from '../models/Company.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get company info
// @route   GET /api/company
// @access  Private
export const getCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Il ne devrait y avoir qu'une seule entreprise
  let company = await Company.findOne();

  // Si aucune entreprise n'existe, créer une par défaut
  if (!company) {
    company = await Company.create({
      name: 'Mon Entreprise',
      phone: '+224 000 00 00 00',
      address: 'Conakry, Guinée',
    });
  }

  res.json({
    success: true,
    data: company,
  });
});

// @desc    Update company info
// @route   PUT /api/company
// @access  Private (admin)
export const updateCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, address, email, logo } = req.body;

  let company = await Company.findOne();

  if (!company) {
    // Créer si n'existe pas
    company = await Company.create({
      name,
      phone,
      address,
      email,
      logo,
    });
  } else {
    // Mettre à jour
    company.name = name || company.name;
    company.phone = phone || company.phone;
    company.address = address || company.address;
    company.email = email || company.email;
    company.logo = logo || company.logo;

    await company.save();
  }

  res.json({
    success: true,
    message: 'Informations de l\'entreprise mises à jour',
    data: company,
  });
});
