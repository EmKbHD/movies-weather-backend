import userResolvers from './userResolvers.js';
import favoriteMoviesResolvers from './favoriteMoviesResolvers.js';
import weatherResolvers from './weatherResolvers.js';
import movieResolvers from './movieResolvers.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...favoriteMoviesResolvers.Query,
    ...weatherResolvers.Query,
    ...movieResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...favoriteMoviesResolvers.Mutation,
  },
};
