import User from '../../models/User.js';
import { GraphQLError } from 'graphql';
import { Context } from '../context.js';

export default {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      //Checking if user is authenticated
      if (!context.user) {
        throw new GraphQLError('User Not authenticated..');
      }
      try {
        const user = await User.findById(context.user.id);

        if (!user) {
          throw new GraphQLError('User not found');
        }
        return user;
      } catch (error: any) {
        throw new GraphQLError(error);
      }
    },
  },
};
