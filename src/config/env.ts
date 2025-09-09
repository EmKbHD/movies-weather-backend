import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
export const SENDGRID_FROM = process.env.SENDGRID_FROM || 'no-reply@domain.com';
export const OMDB_API_KEY = process.env.OMDB_API_KEY;
export const TMDB_API_KEY = process.env.TMDB_API_KEY;
export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY!;
