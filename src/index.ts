import { typeDefs, resolvers } from './graphql/index.js';
import { createContext } from './graphql/context';
// import { errorHandler } from './middleware/errorHandler';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { createSchema, createYoga } from 'graphql-yoga';
import mongoose from 'mongoose';
import { MONGODB_URI, PORT } from './config/env.js';

// loading environment variables
dotenv.config();

// create express app
const app = express();

// Parse JSON bodies
app.use(express.json());

// define a graphql schema (docs : https://the-guild.dev/graphql/yoga-server/docs/integrations/integration-with-express)
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context: createContext,
});

// yoga middleware
app.use('/graphql', yoga);

//CORS Middleware allow the frontend to call the backend
app.use(cors());

// connect to database

mongoose
  .connect(MONGODB_URI as string)
  .then(() => {
    const port = PORT;
    app.listen(port, () => {
      console.log(`Connected to MongDB and Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error:', err);
  });
