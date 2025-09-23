export const favoriteMoviesType = `

# FavoriteMovie is the stored favorite document

  type FavoriteMovie {
    id: ID!
    userId: ID!
    movie: Movie!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
  # Returns the authenticated user's favorites (no args required)
    getFavoriteMovies: [FavoriteMovie!]!
  }

  type Mutation {
    # Add the provided movie to the authenticated user's favorites

    addFavoriteMovie(externalID:String!): FavoriteMovie!

    # Remove a favorite movie of the authenticated user by movieId

    removeFavoriteMovie(userId:ID, movieId: String!): Boolean!
  }
`;
