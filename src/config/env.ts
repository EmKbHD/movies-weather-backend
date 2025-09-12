import dotenv from 'dotenv';
dotenv.config();

// Server Configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 4000;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Database
export const MONGODB_URI = process.env.MONGODB_URI!;

// Authentication
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Email Service (SendGrid)
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL!;

// External APIs
export const MOVIES_PROVIDER = process.env.MOVIES_PROVIDER || 'OMDB'; // or 'TMDB'
export const OMDB_API_KEY = process.env.OMDB_API_KEY!;
export const TMDB_API_KEY = process.env.TMDB_API_KEY;
export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY!;
