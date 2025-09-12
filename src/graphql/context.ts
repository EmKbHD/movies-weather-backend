// src/graphql/context.ts
import { Request } from 'express';
import User, { IUser } from '../models/User.js';
import { verifyToken } from '../services/authServices.js';
import { YogaInitialContext } from 'graphql-yoga';

export interface GQLContext {
  request: YogaInitialContext['request'];
  userId?: String | null;
}

/**
 * createContext used by GraphQL server.
 * Expects the request to contain an Authorization: Bearer <token> header.
 */
export const createContext = async (context: YogaInitialContext): Promise<GQLContext> => {
  const authHeader = context.request.headers.get('authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { request: context.request, userId: null };
  }

  try {
    const payload = verifyToken(token);
    if (!payload || typeof payload === 'string' || !('id' in payload)) {
      return { request: context.request, userId: null };
    }
    // Optionally fetch the user from DB (you can avoid fetching if token contains enough info)
    // We .select('-password') to avoid returning password hash to resolvers
    const userId = await User.findById(payload.id).select('-password').lean().exec();
    return { request: context.request, userId: (payload as any).id };
  } catch (err) {
    // invalid token -> proceed without userId (resolvers should check ctx.userId when needed)
    return { request: context.request, userId: null };
  }
};
