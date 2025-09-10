import { userType } from './userType.js';
import { favoriteMoviesType } from './favoriteMoviesType.js';

export const typeDefs = `
  ${userType}
  ${favoriteMoviesType}
`;
