import mongoose, { Types } from 'mongoose';

const { Schema, model } = mongoose;

export interface Favorite extends Document {
  title: string;
  year: string;
  poster: string;
  userId: Types.ObjectId;
  movieId: string;
}

const favoriteSchema = new Schema<Favorite>(
  {
    title: { type: String, required: true },
    year: { type: String, required: true },
    poster: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    movieId: { type: String, ref: 'movieId', required: true },
  },
  { timestamps: true }
);

const Favorite = model('favorite', favoriteSchema);
export default Favorite;
