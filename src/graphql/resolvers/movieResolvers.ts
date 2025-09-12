import { GraphQLError } from 'graphql';
import { searchMovies } from '../../services/moviesServices.js';
import { GQLContext } from '../context.js';

interface SearchMoviesArgs {
  query: string;
  page?: number;
}

const movieResolvers = {
  Query: {
    searchMovies: async (_: unknown, args: SearchMoviesArgs, context: GQLContext) => {
      try {
        // Check if user is authenticated
        if (!context.user) {
          throw new GraphQLError('You must be logged in to search movies..');
        }

        const { query } = args;

        if (!query.trim()) {
          throw new GraphQLError('Search query cannot be empty..');
        }

        const result = await searchMovies(query);

        // Return only the fields specified in MovieSearchResult type
        return {
          movies: result.movies,
          totalResults: result.totalResults,
        };
      } catch (error) {
        console.error('Movie resolver error:', error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to search movies..');
      }
    },
  },
};

export default movieResolvers;
