import { GraphQLError } from 'graphql';
import { weatherService } from '../../services/weatherServices.js';
import { GQLContext } from '../context.js';

const weatherResolvers = {
  Query: {
    getCurrentWeather: async (_: unknown, { city }: { city?: string }, context: GQLContext) => {
      try {
        // If no city provided, use the user's city from their profile
        const userCity = city || context.user?.city;

        if (!userCity) {
          throw new GraphQLError('City is required');
        }

        return await weatherService.getCurrentWeather(userCity);
      } catch (error) {
        console.error('Weather resolver error:', error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to fetch weather data');
      }
    },
  },
};

export default weatherResolvers;
