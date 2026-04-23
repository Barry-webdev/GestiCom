import { Response } from 'express';
import Partner from '../models/Partner.model';
import FundEntry from '../models/FundEntry.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getPartners = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search } = req.query;
  const query: any = {};
  if (search) query.name = { $regex: search, $options: 'i' };

  const partners = await Partner.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: partners.length, data: partners });
});

export const getPartner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const partner = await Partner.findById(req.params.id);
  if (!partner) return res.status(404).json({ success: false, message: 'Partenaire non trouvé' });

  // Historique des entrées de ce partenaire
  const entries = await FundEntry.find({ partner: req.params.id }).sort({ date: -1 });

  res.json({ success: true, data: { partner, entries } });
});

export const createPartner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const partner = await Partner.create(req.body);
  res.status(201).json({ success: true, message: 'Partenaire créé avec succès', data: partner });
});

export const updatePartner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!partner) return res.status(404).json({ success: false, message: 'Partenaire non trouvé' });
  res.json({ success: true, message: 'Partenaire modifié avec succès', data: partner });
});

export const deletePartner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const partner = await Partner.findById(req.params.id);
  if (!partner) return res.status(404).json({ success: false, message: 'Partenaire non trouvé' });
  await partner.deleteOne();
  res.json({ success: true, message: 'Partenaire supprimé avec succès' });
});
