import mongoose, { Document, model, Schema } from 'mongoose';

// Define the TypeScript interface for a User
export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
  // list of favorite movie IDs
  favorites?: mongoose.Types.ObjectId[];
}

// Define the schema
const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: { type: String },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
  },
  { timestamps: true }
);

// Export the model typed with IUser
const User = model<IUser>('User', userSchema);
export default User;
