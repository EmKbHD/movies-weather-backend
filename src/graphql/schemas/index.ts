import { userType } from './userType.js';
import { favoriteMoviesType } from './favoriteMoviesType.js';
import { weatherType } from './weatherType.js';
import { movieType } from './movieType.js';

export const typeDefs = `
  ${userType}
  ${favoriteMoviesType}
  ${weatherType}
  ${movieType}
`;
