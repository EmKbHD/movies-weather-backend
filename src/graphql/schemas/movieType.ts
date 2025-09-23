export const movieType = `

# A movie as returned by an external search (not stored unless favorite)

  type Movie {
    id: ID!
    title: String!
    year: String!
    poster: String!
    type: String
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
