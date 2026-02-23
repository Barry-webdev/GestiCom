import { Response } from 'express';
import Client from '../models/Client.model';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
export const getClients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, status } = req.query;

  let query: any = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
    ];
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  const clients = await Client.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: clients.length,
    data: clients,
  });
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
export const getClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client non trouvé',
    });
  }

  res.json({
    success: true,
    data: client,
  });
});

// @desc    Create client
// @route   POST /api/clients
// @access  Private (admin, gestionnaire)
export const createClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await Client.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Client créé avec succès',
    data: client,
  });
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private (admin, gestionnaire)
export const updateClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  let client = await Client.findById(req.params.id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client non trouvé',
    });
  }

  client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Client modifié avec succès',
    data: client,
  });
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private (admin)
export const deleteClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client non trouvé',
    });
  }

  await client.deleteOne();

  res.json({
    success: true,
    message: 'Client supprimé avec succès',
  });
});

// @desc    Get VIP clients
// @route   GET /api/clients/vip/list
// @access  Private
export const getVIPClients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clients = await Client.find({ status: 'vip' }).sort({ totalPurchases: -1 });

  res.json({
    success: true,
    count: clients.length,
    data: clients,
  });
});
