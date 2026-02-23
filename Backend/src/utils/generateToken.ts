import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions);
};
