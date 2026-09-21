import jwt from 'jsonwebtoken';

const DEFAULT_SECRET = 'super-secret-node-wars-key-change-in-prod';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret === DEFAULT_SECRET) {
      throw new Error('[FATAL] JWT_SECRET must be set to a secure string in production environment.');
    }
  }
  return secret || DEFAULT_SECRET;
};

export const JWT_SECRET = getJwtSecret();

export interface JwtPayload {
  id: string;
  role: string;
}

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
