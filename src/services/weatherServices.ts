import { OPENWEATHER_API_KEY } from '../config/env.js';

if (!OPENWEATHER_API_KEY) {
  throw new Error('OPENWEATHER_API_KEY must be set in environment variables');
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherResponse {
  weather: [
    {
      icon: string;
    },
  ];
  main: {
    temp: number;
  };
  name: string;
  dt: number;
}

const formatWeatherData = (data: WeatherResponse) => ({
  cityName: data.name,
  temperature: data.main.temp,
  icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
  timestamp: new Date(data.dt * 1000).toISOString(),
});

export const getCurrentWeather = async (city: string) => {
  try {
    const url = new URL(`${BASE_URL}/weather`);
    url.searchParams.append('q', city);
    url.searchParams.append('appid', OPENWEATHER_API_KEY);
    url.searchParams.append('units', 'metric');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Weather data not found');
    }

    const data = await response.json();
    return formatWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw new Error('Failed to fetch weather data');
  }
};
