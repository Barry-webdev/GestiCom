import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant',
      });
    }

    // Vérifier que JWT_SECRET est défini
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ success: false, message: 'Configuration serveur invalide' });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    // Get user from token — .lean() pour la performance (pas d'hydratation Mongoose)
    const user = await User.findById(decoded.id).select('-password').lean() as any;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé - Token invalide',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Permissions insuffisantes',
      });
    }

    next();
  };
};
