import userResolvers from './userResolvers.js';
import favoriteMoviesResolvers from './favoriteMoviesResolvers.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...favoriteMoviesResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...favoriteMoviesResolvers.Mutation,
  },
};
