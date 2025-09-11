// src/graphql/context.ts
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';
import { JWT_SECRET } from '../config/env.js';

export interface GQLContext {
  req: Request;
  user?: Partial<IUser> | null;
}

/**
 * createContext used by GraphQL server.
 * Expects the request to contain an Authorization: Bearer <token> header.
 */
export const createContext = async ({ req }: { req: Request }): Promise<GQLContext> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { req, user: null };
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; iat?: number; exp?: number };
    if (!payload || !payload.id) return { req, user: null };

    // Optionally fetch the user from DB (you can avoid fetching if token contains enough info)
    // We .select('-password') to avoid returning password hash to resolvers
    const user = await User.findById(payload.id).select('-password').lean().exec();
    return { req, user: user ?? null };
  } catch (err) {
    // invalid token -> proceed without user (resolvers should check ctx.user when needed)
    return { req, user: null };
  }
};
