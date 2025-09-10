import userResolvers from './userResolvers.js';
// import favoriteMoviesResolvers from './favoriteMoviesResolvers.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    // ...favoriteMoviesResolvers.Query,
  },
  // User: {
  //   ...userResolvers.Favorites,
  // },
  Mutation: {
    // ...userResolvers.Mutation,
    // ...favoritesMoviesResolvers.Mutation,
  },
};
