import express from 'express';
import cors from 'cors';
import { createServer } from '@graphql-yoga/node';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext } from './graphql/context';
import { connectDB } from './config/db';
import { PORT } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import dotenv from 'dotenv';
import { createSchema, createYoga } from 'graphql-yoga';
import mongoose from 'mongoose';

// loading environment variables
dotenv.config();

// create express app
const app = express();

// Parse JSON bodies
app.use(express.json());

// define a graphql schema (docs : https://the-guild.dev/graphql/yoga-server/docs/integrations/integration-with-express)
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context,
});

// yoga middleware
app.use('/graphql', yoga);

//CORS Middleware allow the frontend to call the backend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// connect to database
const MONGODB = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB as string)
  .then(() => {
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Connected to MongDB and Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
