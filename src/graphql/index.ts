import { userType } from './schemas/userType.js';
import { favoriteMoviesType } from './schemas/favoriteMoviesType.js';

export const typeDefs = `
  ${userType}
  ${favoriteMoviesType}
`;
