import { GraphQLError } from 'graphql';
import { OMDB_API_KEY } from '../config/env.js';
import Movie from '../models/Movie.js';

if (!OMDB_API_KEY) {
  throw new Error('OMDB_API_KEY must be set in environment variables');
}

const BASE_URL = 'https://www.omdbapi.com/';

interface OMDBMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type?: string; // movie format/type, e.g. "movie" | "series" | "episode"
  Response?: string;
  Error?: string;
}

const formatMovie = (movie: OMDBMovie) => ({
  id: movie.imdbID,
  title: movie.Title,
  year: movie.Year,
  poster: movie.Poster === 'N/A' ? null : movie.Poster,
  type: movie.Type ?? null,
  externalId: movie.imdbID,
});

export const searchMovies = async (query: string, page: number = 1) => {
  try {
    const url = new URL(BASE_URL);
    url.searchParams.append('apikey', OMDB_API_KEY);
    url.searchParams.append('s', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('type', 'movie');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new GraphQLError('Failed to fetch movies!');
    }

    const data = await response.json();

    if (data.Response === 'False') {
      return {
        movies: [],
        totalResults: 0,
      };
    }

    return {
      movies: data.Search.map(formatMovie),
      totalResults: parseInt(data.totalResults, 10) || 0,
    };
  } catch (error) {
    console.error('Error searching movies:', error);
    throw new GraphQLError('Failed to search movies!');
  }
};

export const upsertMovie = async (externalId: string) => {
  try {
    const url = new URL(BASE_URL);
    url.searchParams.append('apikey', OMDB_API_KEY);
    url.searchParams.append('i', externalId);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new GraphQLError('Failed to fetch movie details!');
    }
    const data = await response.json();

    // When fetching by 'i' OMDB returns a single movie object, not a Search array
    if (data.Response === 'False') {
      throw new GraphQLError(data.Error || 'Movie not found!');
    }

    // Normalize field names to match our Movie model
    const movieData = {
      title: data.Title,
      year: data.Year,
      poster: data.Poster === 'N/A' ? null : data.Poster,
      type: data.Type ?? null,
      externalId: data.imdbID,
    };

    const movie = await Movie.findOneAndUpdate(
      { externalId },
      {
        $set: movieData,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    return movie;
  } catch (error) {
    console.error('Error upserting movie:', error);
    throw new GraphQLError('Failed to upsert movie!');
  }
};
