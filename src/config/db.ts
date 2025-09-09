import mongoose from 'mongoose';
import { MONGODB_URI } from './env.js';

// checking the type of MONGODB_URI to ensure it's a string and not empty
export const connectDB = async () => {
  if (!MONGODB_URI || typeof MONGODB_URI !== 'string' || MONGODB_URI.trim() === '') {
    throw new Error('MONGODB_URI is empty. Please set it in your environment.');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
};
