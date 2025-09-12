# Movies & Weather GraphQL Backend

A minimal Node.js/TypeScript backend using Express and GraphQL Yoga. It provides:

- User auth (signup/login via JWT)
- Movie search (OMDb)
- Current weather (OpenWeather)
- Favorite movies CRUD

## Stack

- Node.js + TypeScript, Express, GraphQL Yoga
- MongoDB via Mongoose
- JWT authentication
- SendGrid (email service)

## Prerequisites

- Node.js 18+
- MongoDB connection string
- OMDb and OpenWeather API keys

## Setup

- Install deps: `yarn`
- Copy env template: `.env.example` → `.env`
- Fill required variables in `.env` (see below)

## Environment Variables

Required (see `src/config/env.ts` and `.env.example`):

- `PORT` (e.g., 4000)
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL` (e.g., http://localhost:3000)
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- `OMDB_API_KEY`
- `OPENWEATHER_API_KEY`
- Optional: `MOVIES_PROVIDER` (default OMDB), `TMDB_API_KEY`, `JWT_EXPIRES_IN`

## Scripts

- Dev: `yarn dev` (reload via nodemon + tsx)
- Lint: `yarn lint`
- Format: `yarn format`

## Run

- Development: `yarn dev`
- GraphQL endpoint: `http://localhost:<PORT>/graphql`
- Add `Authorization: Bearer <token>` header for protected operations

## GraphQL

- Base schema entry: `src/graphql/schemas/index.ts`
- Resolvers composition: `src/graphql/resolvers/index.ts`

Example mutations/queries:

Signup (public):

```
mutation ($input: SignUpInput!) {
  signup(input: $input) {
    token
    user { id firstName email city }
  }
}
```

Login (public):

```
mutation ($input: LogInInput!) {
  login(input: $input) {
    token
    user { id firstName email }
  }
}
```

Authenticated queries (require Bearer token):

```
query {
  searchMovies(query: "Matrix") { totalResults movies { id title year poster } }
}
```

```
query { getCurrentWeather(city: "Bujumbura") { cityName temperature icon timestamp } }
```

## Auth

- Send `Authorization: Bearer <JWT>` header.
- Context extraction: `src/graphql/context.ts`

## Project Structure

- `src/index.ts`: Express + Yoga server
- `src/config/*`: env and MongoDB connection
- `src/graphql/*`: types, resolvers, context
- `src/models/*`: Mongoose models
- `src/services/*`: auth, movies (OMDb), weather (OpenWeather), mailer
- `src/middleware/errorHandler.ts`: GraphQL error helpers

## Notes

- Ensure `OMDB_API_KEY` and `OPENWEATHER_API_KEY` are set before movie/weather queries.
- Favorites resolvers require a valid token; they operate on the authenticated user’s id.
