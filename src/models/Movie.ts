import { Schema, model, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  year: string;
  actors: string;
  genre: string;
  poster: string;
  externalId: string;
}

const movieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true },
    year: { type: String },
    actors: { type: String },
    poster: { type: String, required: true },
    externalId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const Movie = model<IMovie>('Movie', movieSchema);
export default Movie;
