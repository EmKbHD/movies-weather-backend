export const favoriteMoviesType = `

# FavoriteMovie is the stored favorite document

  type FavoriteMovie {
    id: ID!
    userId: ID!
    movie: Movie!
    createdAt: String!
    updatedAt: String!
  }

  # Returns the authenticated user's favorites (no args required)

  type Query {
    getFavoriteMovies: [FavoriteMovie!]!
  }


  # Add the provided movie to the authenticated user's favorites
  # Remove a favorite movie of the authenticated user by movieId

  type Mutation {
    addFavoriteMovie(externalId:String!): FavoriteMovie!
    removeFavoriteMovie(externalId:String!): Boolean!
  }
`;
