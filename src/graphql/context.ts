import { Request } from 'express';
import User, { IUser } from '../models/User.js';
import { verifyToken } from '../services/authServices.js';
import { YogaInitialContext } from 'graphql-yoga';
import { JwtPayload } from 'jsonwebtoken';

export interface GQLContext {
  request: YogaInitialContext['request'];
  user?: IUser;
  token?: string;
}

/**
 * createContext used by GraphQL server.
 * Expects the request to contain an Authorization: Bearer <token> header.
 */
export const createContext = async (context: YogaInitialContext): Promise<GQLContext> => {
  const authHeader = context.request.headers.get('authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return { request: context.request, token };
  }

  try {
    const payload = verifyToken(token) as JwtPayload;
    if (!payload || !payload.id) {
      return { request: context.request, token };
    }

    // Fetch the user from DB and exclude the password
    const user = await User.findById(payload.id).select('-password').lean().exec();

    if (!user) {
      return { request: context.request, token };
    }

    return {
      request: context.request,
      user: user as IUser,
      token,
    };
  } catch (err) {
    // invalid token -> proceed without user
    return { request: context.request, token };
  }
};
