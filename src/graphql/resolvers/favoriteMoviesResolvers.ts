import Favorite from '../../models/Favorite.js';
import { verifyToken } from '../../services/authServices.js';
import { GraphQLError } from 'graphql';
import { JwtPayload } from 'jsonwebtoken';

interface Context {
  token?: string;
}

interface MovieInput {
  title: string;
  year: string;
  poster: string;
  movieId: string;
}

const favoriteMoviesResolvers = {
  Query: {
    getFavoriteMovies: async (_: unknown, { userId }: { userId: string }, { token }: Context) => {
      try {
        const decoded = token ? (verifyToken(token) as JwtPayload) : null;
        if (!decoded) {
          throw new GraphQLError('User not authenticated');
        }

        return await Favorite.find({ userId });
      } catch (error) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message);
        }
        throw new GraphQLError('An error occurred');
      }
    },
  },
  Mutation: {
    addFavoriteMovie: async (
      _: unknown,
      { movieInput }: { movieInput: MovieInput },
      { token }: Context
    ) => {
      try {
        const decoded = token ? (verifyToken(token) as JwtPayload) : null;
        if (!decoded) {
          throw new GraphQLError('User not authenticated');
        }

        const { title, year, poster, movieId } = movieInput;

        const existingFavorite = await Favorite.findOne({
          userId: decoded.id,
          movieId,
        });

        if (existingFavorite) {
          throw new GraphQLError('Movie already in favorites');
        }

        const favorite = new Favorite({
          userId: decoded.id,
          title,
          year,
          poster,
          movieId,
        });

        return await favorite.save();
      } catch (error) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message);
        }
        throw new GraphQLError('An error occurred');
      }
    },
    removeFavoriteMovie: async (
      _: unknown,
      { movieId }: { movieId: string },
      { token }: Context
    ) => {
      try {
        const decoded = token ? (verifyToken(token) as JwtPayload) : null;
        if (!decoded) {
          throw new GraphQLError('User not authenticated');
        }

        const result = await Favorite.deleteOne({
          userId: decoded.id,
          movieId,
        });

        return result.deletedCount > 0;
      } catch (error) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message);
        }
        throw new GraphQLError('An error occurred');
      }
    },
  },
};

export default favoriteMoviesResolvers;
