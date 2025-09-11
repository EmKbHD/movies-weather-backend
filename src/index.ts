import { resolvers } from './graphql/resolvers/index.js';
import { typeDefs } from './graphql/schemas/index.js';
import { createContext } from './graphql/context.js';
import cors from 'cors';
import express from 'express';
import { createSchema, createYoga } from 'graphql-yoga';
import { PORT } from './config/env.js';
import { connectDB } from './config/db.js';

// create express app
const app = express();

// Parse JSON bodies
app.use(express.json());

// Defining a graphql schema (docs : https://the-guild.dev/graphql/yoga-server/docs/integrations/integration-with-express)
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context: createContext,
});

// yoga middleware
app.use('/graphql', yoga.requestListener);

//CORS Middleware allow the frontend to call the backend
app.use(cors());

// connect to database
const startServer = async () => {
  try {
    await connectDB(); // call your DB connection function
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err: any) {
    console.error('Failed to start server:', err.message);
  }
};

startServer();
