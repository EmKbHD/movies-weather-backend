import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import User, { IUser } from '../../models/User.js';
import Movie from '../../models/Movie.js';
import { generateToken } from '../../services/authServices.js';
import { GQLContext } from '../context.js';

// Input types
type SignupInput = {
  firstName: string;
  lastName?: string;
  email: string;
  city: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

// Helper to format a Mongoose doc into the GraphQL User shape
const formatUser = (doc: IUser) => ({
  id: doc._id.toString(),
  firstName: doc.firstName,
  lastName: doc.lastName || '',
  email: doc.email,
  city: doc.city,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export default {
  // Queries
  Query: {
    me: async (_: unknown, __: unknown, ctx: GQLContext) => {
      // Checking if user is authenticated
      if (!ctx.user) throw new GraphQLError('User not authenticated');

      try {
        const user = await User.findById(ctx.user.id).exec();
        if (!user) throw new GraphQLError('User not found');
        return formatUser(user);
      } catch (error: any) {
        throw new GraphQLError(error.message || 'Failed to fetch user');
      }
    },

    // Query all users
    users: async () => {
      try {
        const users = await User.find().exec();
        return users.map(formatUser);
      } catch (error: any) {
        throw new GraphQLError(error.message || 'Failed to fetch users');
      }
    },
  },

  // Mutations
  Mutation: {
    // Signup mutation
    signup: async (_: unknown, { input }: { input: SignupInput }, _ctx: GQLContext) => {
      try {
        const { firstName, lastName, email, city, password } = input;

        if (!firstName || !email || !city || !password) {
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
          city,
          email,
          password: hashed,
        });

        await userDoc.save();

        // generate user token
        const token = await generateToken(userDoc._id.toString());

        // Convert userDoc to a plain object and format it according to the User type
        return { token, user: formatUser(userDoc) };
      } catch (err: any) {
        throw new GraphQLError(err.message || 'Failed to signup..');
      }
    },

    // Login mutation
    login: async (_: unknown, { input }: { input: LoginInput }, _ctx: GQLContext) => {
      try {
        const { email, password } = input;
        if (!email || !password) throw new GraphQLError('Missing email or password');

        const userDoc = await User.findOne({ email }).exec();
        if (!userDoc) throw new GraphQLError('Invalid credentials');

        const ok = await bcrypt.compare(password, userDoc.password);
        if (!ok) throw new GraphQLError('Invalid credentials');

        // Generate the user token
        const token = generateToken(userDoc._id.toString());

        // Convert userDoc to a plain object and format it according to the User type
        return { token, user: formatUser(userDoc) };
      } catch (err: any) {
        throw new GraphQLError(err.message || 'Failed to login');
      }
    },

    // Logout mutation
    logout: async (_: unknown, __: unknown, _ctx: GQLContext) => {
      // If you were using cookies you'd clear them here.
      // For bearer tokens the client simply discards the token.
      return true;
    },
  },

  // Query resolver when User Favorites Movies are requested
  User: {
    favorites: async (parent: IUser) => {
      // parent = current user
      return await Movie.find({ _id: { $in: parent.favorites } }).exec();
    },
  },

  // ensure AuthPayload.user resolves even if the resolver returns only an id or a plain user object
  AuthPayload: {
    user: async (parent: any) => {
      if (!parent) return null;
      // parent.user might be: a string id, a plain object, or a Mongoose doc
      if (typeof parent.user === 'string') return User.findById(parent.user).exec();
      if (parent.user && parent.user.id) return parent.user;
      if (parent.id) return User.findById(parent.id).exec();
      return null;
    },
  },
};
