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
}

interface OMDBSearchResponse {
  Search: OMDBMovie[];
  totalResults: string;
  Response: string;
}

const formatMovie = (movie: OMDBMovie) => ({
  id: movie.imdbID,
  title: movie.Title,
  year: movie.Year,
  poster: movie.Poster === 'N/A' ? null : movie.Poster,
  format: movie.Type ?? null,
  externalId: movie.imdbID,
});

export const searchMovies = async (query: string, page: number = 1) => {
  try {
    const url = new URL(BASE_URL);
    url.searchParams.append('apikey', OMDB_API_KEY);
    url.searchParams.append('s', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('type', 'movie');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch movies!');
    }

    const data: OMDBSearchResponse = await response.json();

    if (data.Response === 'False') {
      return {
        movies: [],
        totalResults: 0,
      };
    }

    return {
      movies: data.Search.map(formatMovie),
      totalResults: parseInt(data.totalResults),
    };
  } catch (error) {
    console.error('Error searching movies:', error);
    throw new Error('Failed to search movies!');
  }
};

export const upsertMovie = async (externalId: string) => {
  try {
    const url = new URL(BASE_URL);
    url.searchParams.append('apikey', OMDB_API_KEY);
    url.searchParams.append('i', externalId);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch movie details!');
    }
    const data: OMDBSearchResponse = await response.json();

    if (data.Response === 'False') {
      throw new Error('Movie not found!');
    }

    const movieData = await Movie.findOneAndUpdate(
      { externalId },
      {
        title: data.Search[0].Title,
        year: data.Search[0].Year,
        poster: data.Search[0].Poster === 'N/A' ? null : data.Search[0].Poster,
        format: data.Search[0].Type ?? null,
        externalId: data.Search[0].imdbID,
      },
      { upsert: true, new: true }
    ).exec();

    return movieData;
  } catch (error) {
    console.error('Error upserting movie:', error);
    throw new Error('Failed to upsert movie!');
  }
};
