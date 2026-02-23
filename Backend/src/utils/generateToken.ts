import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
  return jwt.sign(
    { id: userId }, 
    secret, 
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
