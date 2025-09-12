import { GraphQLError } from 'graphql';
import { getCurrentWeather } from '../../services/weatherServices.js';
import { GQLContext } from '../context.js';

const weatherResolvers = {
  Query: {
    getCurrentWeather: async (_: unknown, { city }: { city?: string }, context: GQLContext) => {
      try {
        // Check if user is logged in
        if (!context.user) {
          throw new GraphQLError('Please log in to check weather');
        }

        // Use provided city or user's city from profile
        const userCity = city || context.user.city;

        // Make sure we have a city to search for weather
        if (!userCity) {
          throw new GraphQLError('Please provide a city name');
        }

        // Get the weather data
        const weatherData = await getCurrentWeather(userCity);
        return weatherData;
      } catch (error: any) {
        // Log the error for debugging
        console.error('Weather error:', error);

        // Return an error message
        return new GraphQLError(error.message || 'Could not get weather data. Please try again.');
      }
    },
  },
};

export default weatherResolvers;
