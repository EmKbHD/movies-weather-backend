import Favorite from '../../models/Favorite.js';
import { GraphQLError } from 'graphql';
import { GQLContext as Context } from '../context.js';
interface MovieInput {
  title: string;
  year: string;
  actors: string;
  genre: string;
  type: string;
  duration: string;
  poster: string;
  movieId: string;
}

const favoriteMoviesResolvers = {
  //QUERIES START HERE
  Query: {
    // Fetch favorites movies for the authenticated user (no token needed in args)
    getFavoriteMovies: async (_: unknown, __: unknown, ctx: Context) => {
      // If user is not authenticated via context
      if (!ctx.user) {
        throw new GraphQLError('User not authenticated!');
      }

      // Use ctx.user.id (the id created by createContext)
      const userId = ctx.user.id;
      try {
        //Returns Favorite documents for this user
        return await Favorite.find({ userId }).sort({ createdAt: -1 }).exec();
      } catch (error: any) {
        throw new GraphQLError(error.message || 'Failed to fetch favorite movies!');
      }
    },
  },

  //MUTATIONS START HERE

  Mutation: {
    //ADD FAVORITE MOVIE
    addFavoriteMovie: async (
      _: unknown,
      { movieInput }: { movieInput: MovieInput },
      ctx: Context
    ) => {
      // If user is not authenticated via context
      if (!ctx.user) {
        throw new GraphQLError('User not authenticated!');
      }

      const userId = ctx.user.id;

      try {
        const { title, year, genre, type, actors, duration, poster, movieId } = movieInput;

        const existingFavorite = await Favorite.findOne({ userId, movieId }).exec();

        if (existingFavorite) {
          throw new GraphQLError('Movie already in favorites!');
        }

        const favorite = new Favorite({
          userId,
          title,
          year,
          actors,
          genre,
          type,
          duration,
          poster,
          movieId,
        });

        return await favorite.save();
      } catch (error: any) {
        throw new GraphQLError(error.message || 'Failed to add favorite movie!');
      }
    },

    //REMOVE FAVORITE MOVIE
    removeFavoriteMovie: async (_: unknown, { movieId }: { movieId: string }, ctx: Context) => {
      // If user is not authenticated via context
      if (!ctx.user) {
        throw new GraphQLError('User not authenticated');
      }
      const userId = ctx.user.id;

      try {
        const result = await Favorite.deleteOne({
          userId,
          movieId,
        }).exec();

        return result.deletedCount > 0;
      } catch (error: any) {
        throw new GraphQLError(error.message || 'Failed to remove favorite movie!');
      }
    },
  },
};

export default favoriteMoviesResolvers;
