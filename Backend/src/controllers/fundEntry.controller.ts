import { Response } from 'express';
import FundEntry from '../models/FundEntry.model';
import Partner from '../models/Partner.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getFundEntries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category, partner, startDate, endDate, search } = req.query;

  const query: any = {};
  if (category && category !== 'all') query.category = category;
  if (partner) query.partner = partner;
  if (search) query.$or = [
    { sourceName: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { partnerName: { $regex: search, $options: 'i' } },
  ];
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate as string);
    if (endDate) query.date.$lte = new Date(endDate as string);
  }

  const entries = await FundEntry.find(query)
    .populate('partner', 'name phone')
    .sort({ date: -1 });

  res.json({ success: true, count: entries.length, data: entries });
});

export const getFundEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await FundEntry.findById(req.params.id).populate('partner', 'name phone');
  if (!entry) return res.status(404).json({ success: false, message: 'Entrée non trouvée' });
  res.json({ success: true, data: entry });
});

export const createFundEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category, sourceName, amount, description, partner, date } = req.body;

  let partnerName: string | undefined;

  // Si lié à un partenaire, récupérer son nom et mettre à jour son total
  if (category === 'partenaire' && partner) {
    const partnerDoc = await Partner.findById(partner);
    if (!partnerDoc) return res.status(404).json({ success: false, message: 'Partenaire non trouvé' });
    partnerName = partnerDoc.name;
    partnerDoc.totalSent += amount;
    partnerDoc.lastContribution = new Date();
    await partnerDoc.save();
  }

  const entry = await FundEntry.create({
    category,
    sourceName,
    amount,
    description,
    partner: category === 'partenaire' ? partner : undefined,
    partnerName,
    user: req.user!._id,
    userName: req.user!.name,
    date: date ? new Date(date) : new Date(),
  });

  res.status(201).json({ success: true, message: 'Entrée de fonds enregistrée', data: entry });
});

export const updateFundEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await FundEntry.findById(req.params.id);
  if (!entry) return res.status(404).json({ success: false, message: 'Entrée non trouvée' });

  // Si le montant change et que c'est un partenaire, ajuster le total
  if (entry.partner && req.body.amount && req.body.amount !== entry.amount) {
    const partner = await Partner.findById(entry.partner);
    if (partner) {
      partner.totalSent = partner.totalSent - entry.amount + req.body.amount;
      await partner.save();
    }
  }

  const updated = await FundEntry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, message: 'Entrée modifiée avec succès', data: updated });
});

export const deleteFundEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await FundEntry.findById(req.params.id);
  if (!entry) return res.status(404).json({ success: false, message: 'Entrée non trouvée' });

  // Déduire du total partenaire si applicable
  if (entry.partner) {
    const partner = await Partner.findById(entry.partner);
    if (partner) {
      partner.totalSent = Math.max(0, partner.totalSent - entry.amount);
      await partner.save();
    }
  }

  await entry.deleteOne();
  res.json({ success: true, message: 'Entrée supprimée avec succès' });
});

export const getFundStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { period } = req.query; // 'day' | 'month' | 'year'
  const now = new Date();

  let startDate: Date;
  if (period === 'day') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    // month par défaut
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const entries = await FundEntry.find({ date: { $gte: startDate } });

  const categories = ['magasin', 'etablissement', 'residence', 'partenaire'];
  const byCategory = categories.map(cat => ({
    category: cat,
    total: entries.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    count: entries.filter(e => e.category === cat).length,
  }));

  const totalGlobal = entries.reduce((s, e) => s + e.amount, 0);

  // Top partenaires
  const partnerMap = new Map<string, { name: string; total: number }>();
  entries.filter(e => e.partner).forEach(e => {
    const key = e.partner!.toString();
    const existing = partnerMap.get(key) || { name: e.partnerName || '', total: 0 };
    existing.total += e.amount;
    partnerMap.set(key, existing);
  });
  const byPartner = Array.from(partnerMap.entries()).map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total);

  res.json({
    success: true,
    data: { totalGlobal, byCategory, byPartner, period: period || 'month', startDate },
  });
});
