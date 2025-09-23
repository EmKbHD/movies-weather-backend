import { Schema, model, Document } from 'mongoose';
export interface IMovie extends Document {
  title: string;
  year: string;
  type: string;
  poster: string;
  externalId: string;
}

const movieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true },
    year: { type: String },
    type: { type: String },
    poster: { type: String },
    externalId: { type: String, required: true },
  },
  { timestamps: true }
);

// Create an index compound index on externalId to ensure uniqueness
movieSchema.index({ externalId: 1 }, { unique: true });

const Movie = model<IMovie>('Movie', movieSchema);
export default Movie;
