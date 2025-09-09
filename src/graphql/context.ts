import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../models/User.js';

export interface Context {
  req: Request;
  user?: any;
}

export const createContext = async ({ req }: { req: Request }) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (auth) {
    try {
      const payload: any = jwt.verify(auth, JWT_SECRET);
      const user = await User.findById(payload.id);
      return { req, user };
    } catch (err) {
      return { req };
    }
  }
  return { req };
};
