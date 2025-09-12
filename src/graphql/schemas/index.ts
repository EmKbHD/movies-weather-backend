import { userType } from './userType.js';
import { favoriteMoviesType } from './favoriteMoviesType.js';
import { weatherType } from './weatherType.js';
import { movieType } from './movieType.js';

export const typeDefs = `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  ${userType}
  ${favoriteMoviesType}
  ${weatherType}
  ${movieType}
`;
