import Favorite from '../../models/Favorite.js';
import { GraphQLError } from 'graphql';
import { GQLContext as Context } from '../context.js';
import Movie from '../../models/Movie.js';
import { upsertMovie } from '../../services/moviesServices.js';

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
        return await Favorite.find({ userId }).sort({ createdAt: -1 }).populate('movie').exec();
      } catch (error: any) {
        throw new GraphQLError(error.message || 'Failed to fetch favorite movies!');
      }
    },
  },

  //MUTATIONS START HERE

  Mutation: {
    //ADD FAVORITE MOVIE
    addFavoriteMovie: async (_: unknown, { externalId }: { externalId: string }, ctx: Context) => {
      // If user is not authenticated via context
      if (!ctx.user) {
        throw new GraphQLError('User not authenticated!');
      }

      const userId = ctx.user.id;

      try {
        // Ensure the movie exists in our Movie collection (create or update)
        const movie = await upsertMovie(externalId);
        if (!movie) {
          throw new GraphQLError('Failed to fetch or save the movie details!');
        }

        // Create Favorite only if it does not exit; atomic approach via findOneAndUpdate with setOnInsert
        const favorite = await Favorite.findOneAndUpdate(
          { userId, externalId }, // keys to find duplicate
          {
            $setOnInsert: {
              userId,
              movie: movie._id,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
          .populate('movie')
          .exec();

        // If favorite was just created, Mongo returns the new doc (because new: true). But we also need to detect whether it was previously present.
        // A simple way: query for count existence before creating (or rely on unique index to cause error).
        // To keep behavior simple: return the favorite doc, but if it already existed, tell user
        // We'll check whether it was created by checking the createdAt vs updatedAt or attempt to create with insertOne first.

        // To tell user if it existed
        const wasExisting =
          favorite && favorite.createdAt && favorite.createdAt < favorite.updatedAt ? false : false;

        if (wasExisting) {
          throw new GraphQLError('Movie already in favorites!');
        }
        return favorite;
      } catch (error: any) {
        throw new GraphQLError(error.message || 'Failed to add favorite movie!');
      }
    },

    //REMOVE FAVORITE MOVIE
    removeFavoriteMovie: async (
      _: unknown,
      { externalId }: { externalId: string },
      ctx: Context
    ) => {
      // If user is not authenticated via context
      if (!ctx.user) {
        throw new GraphQLError('User not authenticated');
      }
      const userId = ctx.user.id;

      try {
        // Find if the Movie is in the DB
        const movie = await Movie.findOne({ externalId });

        if (!movie) {
          return true;
        }

        await Favorite.deleteOne({
          userId,
          externalId,
        }).exec();

        return true;
      } catch (error: any) {
        throw new GraphQLError(error.message || 'Failed to remove favorite movie!');
      }
    },
  },
};

export default favoriteMoviesResolvers;
