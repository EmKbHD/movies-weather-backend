import mongoose, { Types } from 'mongoose';

const { Schema, model } = mongoose;

const favoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    externalId: { type: String, required: true },
    movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  },
  { timestamps: true }
);

// Create a compound index to ensure a user cannot favorite the same movie multiple times
favoriteSchema.index({ userId: 1, movie: 1 }, { unique: true });

const Favorite = model('Favorite', favoriteSchema);
export default Favorite;
