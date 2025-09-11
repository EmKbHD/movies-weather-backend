// src/services/authServices.ts
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

// defensive check (optional but helpful)
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the environment');
}

/**
 * Generate a JWT for a given user id (string).
 */
export const generateToken = (userId: string): string => {
  const payload = { id: userId };

  // Ensure options type matches jsonwebtoken types
  const opts: SignOptions = {
    expiresIn: '1h',
  };

  // Cast the secret to jwt.Secret to satisfy the type system
  return jwt.sign(payload, JWT_SECRET as Secret, opts);
};

/**
 * Verify a token. Returns decoded payload { id, iat, exp } or null if invalid.
 */
export const verifyToken = (token: string): { id: string; iat?: number; exp?: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET as Secret) as { id: string; iat?: number; exp?: number };
  } catch {
    return null;
  }
};
