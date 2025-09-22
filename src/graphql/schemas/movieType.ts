export const movieType = `

# A movie as returned by an external search (not stored unless favorite)

  type Movie {
    id: ID!
    title: String!
    year: String!
    actors: String
    poster: String!
    genre: String
    type: String
    duration: String
    externalId: String!
  }

  # Reusable input for sending movie data to mutations

  input MovieInput {
    title: String!
    year: String!
    actors: String
    poster: String!
    genre: String
    type: String
    duration: String
    externalId: String!
  }

  type MovieSearchResult {
    movies: [Movie!]!
    totalResults: Int!
  }

  extend type Query {
    searchMovies(query: String!): MovieSearchResult!
  }
`;
