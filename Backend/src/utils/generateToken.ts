import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  // Force type to any to bypass TypeScript overload resolution issues
  return (jwt.sign as any)(
    { id: userId }, 
    secret, 
    { expiresIn }
  );
};
