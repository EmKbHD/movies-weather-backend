import bcrypt from 'bcryptjs';
import User, { IUser } from '../../models/User.js';
import { generateToken } from '../../services/authServices.js';
import { GraphQLError } from 'graphql';
import { GQLContext } from '../context.js';

type SignupInput = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export default {
  Query: {
    me: async (_: unknown, __: unknown, context: GQLContext) => {
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

  // mutations for signup, login, logout
  Mutation: {
    signup: async (_: unknown, { input }: { input: SignupInput }, ctx: GQLContext) => {
      try {
        const { firstName, lastName, email, password } = input;

        if (!firstName || !email || !password) {
          throw new GraphQLError('Missing required fields..');
        }

        // check existing
        const existing = await User.findOne({ email }).exec();
        if (existing) {
          throw new GraphQLError('Email already registered..');
        }

        // create user
        const hashed = await bcrypt.hash(password, 12);
        const userDoc: IUser = new User({
          firstName,
          lastName,
          email,
          password: hashed,
        });

        await userDoc.save();

        // generate user token
        const token = generateToken(userDoc._id.toString());

        // prepare user payload for response (no password)
        const user = userDoc.toObject();
        delete (user as any).password;

        return { token, user };
      } catch (err) {
        const e = err as any;
        throw new GraphQLError(e.message || 'Failed to signup..');
      }
    },

    // login mutation
    login: async (_: unknown, { input }: { input: LoginInput }, ctx: GQLContext) => {
      try {
        const { email, password } = input;
        if (!email || !password) throw new GraphQLError('Missing email or password');

        const userDoc = await User.findOne({ email }).exec();
        if (!userDoc) throw new GraphQLError('Invalid credentials');

        const ok = await bcrypt.compare(password, userDoc.password);
        if (!ok) throw new GraphQLError('Invalid credentials');

        // Generate the user token
        const token = generateToken(userDoc._id.toString());

        const user = userDoc.toObject();
        delete (user as any).password;

        return { token, user };
      } catch (err) {
        const e = err as any;
        throw new GraphQLError(e.message || 'Failed to login');
      }
    },

    // logout mutation
    logout: async (_: unknown, __: unknown, ctx: GQLContext) => {
      // If you were using cookies you'd clear them here.
      // For bearer tokens the client simply discards the token.
      return true;
    },
  },
};
