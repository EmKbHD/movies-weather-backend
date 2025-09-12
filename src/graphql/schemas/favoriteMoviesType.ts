export const favoriteMoviesType = `
  type FavoriteMovie {
    id: ID!
    userId: ID!
    movieId: String!
    title: String!
    year: String!
    poster: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getFavoriteMovies(userId: ID!): [FavoriteMovie!]!
  }

  type Mutation {
    addFavoriteMovie(movieId: String!): Boolean!
    removeFavoriteMovie(movieId: String!): Boolean!
  }
`;
