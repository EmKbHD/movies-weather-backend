export const favoriteMoviesType = `

# FavoriteMovie is the stored favorite document

  type FavoriteMovie {
    id: ID!
    userId: ID!
    movieId: String!
    title: String!
    year: String!
    actors: String!
    genre: String!
    type: String!
    duration: String!
    poster: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
  # Returns the authenticated user's favorites (no args required)
    getFavoriteMovies: [FavoriteMovie!]!
  }

  type Mutation {
    # Add the provided movie to the authenticated user's favorites

    addFavoriteMovie(movie:MovieInput!): FavoriteMovie!

    # Remove a favorite movie of the authenticated user by movieId

    removeFavoriteMovie(movieId: String!): Boolean!
  }
`;
