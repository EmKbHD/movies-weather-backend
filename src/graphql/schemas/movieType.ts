export const movieType = `
  type Movie {
    id: ID!
    title: String!
    actors: String
    year: String!
    poster: String!
    genre: String
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
