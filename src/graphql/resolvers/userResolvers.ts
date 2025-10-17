import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import User, { IUser } from '../../models/User.js';
import Movie from '../../models/Movie.js';
import { generateToken, verifyToken } from '../../services/authServices.js';
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

type PasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const PASSWORD_MIN = 8;
const UPPER = /[A-Z]/;
const LOWER = /[a-z]/;
const DIGIT = /[0-9]/;
const SPECIAL = /[^A-Za-z0-9]/;

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

    // Update Profile info

    /**
     * updateProfile(input: UpdateProfileInput!): User!
     * - Uses upsert
     * - If email changes: enforce uniqueness and bump tokenVersion to force re-login
     */

    updateProfile: async (
      _: unknown,
      { input }: { input: Partial<Pick<IUser, 'firstName' | 'lastName' | 'email' | 'city'>> },
      ctx: GQLContext
    ) => {
      if (!ctx.user) throw new GraphQLError('User not authenticated');

      const { firstName, lastName, email, city } = input || {};
      const updates: Record<string, any> = {};
      if (typeof firstName !== 'undefined') updates.firstName = firstName;
      if (typeof lastName !== 'undefined') updates.lastName = lastName;
      if (typeof city !== 'undefined') updates.city = city;

      try {
        // Load current user to compare email
        const current = await User.findById(ctx.user.id).exec();
        if (!current) throw new GraphQLError('⚠️ User not found!');

        let shouldInvalidateTokens = false;

        if (typeof email !== 'undefined' && email !== current.email) {
          // Ensure email uniqueness - The $ne operator in Mongoose (and MongoDB in general) means “not equal to.”
          const exists = await User.findOne({ email, _id: { $ne: ctx.user.id } })
            .lean()
            .exec();
          if (exists) throw new GraphQLError('⚠️ Email already in use!');

          updates.email = email;
          // “Token-based when email is updated” → force re-auth by bumping tokenVersion
          shouldInvalidateTokens = true;
        }

        // Apply updates (upsert as requested)
        const doc = await User.findOneAndUpdate(
          { _id: ctx.user.id },
          {
            $set: updates,
            ...(shouldInvalidateTokens ? { $inc: { tokenVersion: 1 } } : {}),
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        ).exec();

        if (!doc) throw new GraphQLError('⚠️ Failed to update profile!');

        // NOTE : if email was changed, all existing tokens are now invalid.
        return formatUser(doc);
      } catch (err: any) {
        throw new GraphQLError(err.message || '⚠️ Failed to update profile!');
      }
    },

    // Update Password
    /**
     * updatePassword(token: String!, newPassword: String!): SuccessResponse!
     * - Hash with bcrypt
     * - User will be disconnected and must login afresh
     */

    updatePassword: async (_: unknown, { input }: { input: PasswordInput }, ctx: GQLContext) => {
      if (!ctx.user) throw new GraphQLError('User not authenticated');

      const { currentPassword, newPassword, confirmNewPassword } = input || {};
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new GraphQLError('Missing required fields');
      }

      // 0️⃣ confirm match (defense-in-depth; already validated on client)
      if (newPassword !== confirmNewPassword) {
        throw new GraphQLError('Passwords must match');
      }

      // 🔐 password policy (align with your Yup schema)
      if (newPassword.length < PASSWORD_MIN) {
        throw new GraphQLError(`Password must be at least ${PASSWORD_MIN} characters`);
      }
      if (!UPPER.test(newPassword))
        throw new GraphQLError('Password must contain at least one uppercase letter');
      if (!LOWER.test(newPassword))
        throw new GraphQLError('Password must contain at least one lowercase letter');
      if (!DIGIT.test(newPassword))
        throw new GraphQLError('Password must contain at least one number');
      if (!SPECIAL.test(newPassword))
        throw new GraphQLError('Password must contain at least one special character');

      // 1️⃣ Fetch user
      const user = await User.findById(ctx.user.id).exec();
      if (!user) throw new GraphQLError('User not found');

      // 2️⃣ Verify current password
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) throw new GraphQLError('Current password is incorrect');

      // 3️⃣ Prevent reuse (same as old)
      const sameAsOld = await bcrypt.compare(newPassword, user.password);
      if (sameAsOld) throw new GraphQLError('New password must be different from the old password');

      // 4️⃣ Hash + save
      user.password = await bcrypt.hash(newPassword, 12);

      // Optional but recommended for token/session invalidation:
      (user as any).passwordChangedAt = new Date();
      await user.save();

      // If you use refresh tokens or JWT versioning, bump/invalidate here:
      // user.tokenVersion += 1; await user.save();

      return { success: true, message: 'Password updated successfully' };
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
      // The parent.user might be: a string id, a plain object, or a Mongoose doc
      if (typeof parent.user === 'string') return User.findById(parent.user).exec();
      if (parent.user && parent.user.id) return parent.user;
      if (parent.id) return User.findById(parent.id).exec();
      return null;
    },
  },
};
