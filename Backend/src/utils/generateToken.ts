import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  const options: SignOptions = {
    expiresIn: expiresIn
  };
  
  return jwt.sign({ id: userId }, secret, options);
};
