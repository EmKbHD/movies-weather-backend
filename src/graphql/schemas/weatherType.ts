export const weatherType = `
  type Weather {
    cityName: String!
    temperature: Float!
    icon: String!
    timestamp: String!
  }

  extend type Query {
    getCurrentWeather(city: String): Weather!
  }
`;
