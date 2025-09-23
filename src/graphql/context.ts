import User from '../models/User.js';
import { verifyToken } from '../services/authServices.js';
import { YogaInitialContext } from 'graphql-yoga';
import { JwtPayload } from 'jsonwebtoken';

export interface GQLContext {
  request: YogaInitialContext['request'];
  // keep user small: only fields resolvers usually need
  user?: { id: string; city: string; email: string };
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
    return { request: context.request, token: undefined };
  }

  try {
    // Centralized token verification (might throw on invalid token)
    const payload = (await verifyToken(token)) as JwtPayload;
    if (!payload || !payload.id) {
      return { request: context.request, token };
    }

    // Fetch the user from DB and exclude the password .lean() returns a plain JS object instead of a Mongoose document
    const userDoc = await User.findById(payload.id).select('-password').lean().exec();

    if (!userDoc) {
      return { request: context.request, token };
    }

    // Ensure id is a string (ObjectId -> string)
    const user = { id: userDoc._id.toString(), city: userDoc.city, email: userDoc.email };

    return {
      request: context.request,
      user,
      token,
    };
  } catch (err) {
    // invalid token or verify error -> proceed without user (unauthenticated)
    return { request: context.request, token };
  }
};
