import { OPENWEATHER_API_KEY } from '../config/env.js';

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

export class WeatherService {
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private apiKey: string;

  constructor() {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OPENWEATHER_API_KEY must be set in environment variables');
    }
    this.apiKey = OPENWEATHER_API_KEY;
  }

  private formatWeatherData(data: WeatherResponse) {
    return {
      cityName: data.name,
      temperature: data.main.temp,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      timestamp: new Date(data.dt * 1000).toISOString(),
    };
  }

  async getCurrentWeather(city: string) {
    try {
      const url = new URL(`${this.baseUrl}/weather`);
      url.searchParams.append('q', city);
      url.searchParams.append('appid', this.apiKey);
      url.searchParams.append('units', 'metric');

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Weather data not found');
      }

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw new Error('Failed to fetch weather data');
    }
  }
}

export const weatherService = new WeatherService();
