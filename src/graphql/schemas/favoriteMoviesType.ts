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
    getFavoriteMovies(email: String!): [FavoriteMovie!]!
  }

  type Mutation {
    addFavoriteMovie(email:String!, movieId: String!): User!
    removeFavoriteMovie(email:String!, movieId: String!): User!
  }
`;
