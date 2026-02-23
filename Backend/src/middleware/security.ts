import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting pour prévenir les attaques DoS et brute force
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par IP
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting strict pour les routes d'authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 tentatives de connexion
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
  skipSuccessfulRequests: true, // Ne compte pas les connexions réussies
});

// Rate limiting pour les routes sensibles (création, modification, suppression)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Trop de requêtes, veuillez ralentir.',
});

// Configuration Helmet pour les headers de sécurité HTTP
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Pour Swagger
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// Middleware pour ajouter des timeouts aux requêtes
export const requestTimeout = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(timeout, () => {
      res.status(408).json({
        success: false,
        message: 'Requête expirée - timeout',
      });
    });
    
    res.setTimeout(timeout, () => {
      res.status(503).json({
        success: false,
        message: 'Service temporairement indisponible',
      });
    });
    
    next();
  };
};

// Middleware pour logger les requêtes suspectes
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /<script>/i,
    /javascript:/i,
    /on\w+=/i,
    /\.\.\//,
    /union.*select/i,
    /drop.*table/i,
  ];

  const checkSuspicious = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkSuspicious);
    }
    return false;
  };

  if (checkSuspicious(req.body) || checkSuspicious(req.query) || checkSuspicious(req.params)) {
    console.warn('⚠️ Requête suspecte détectée:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Middleware pour bloquer les requêtes avec des payloads trop grands
export const payloadSizeCheck = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Payload trop volumineux',
    });
  }

  next();
};
