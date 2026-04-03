import axios from 'axios';

const API_KEY = 'e47ccb9f3bd66f152ea701ad4063d07748d60120'; // Replace with your actual AQI API key
const BASE_URL = 'https://api.waqi.info/feed'; // Corrected base URL

// Fetch AQI data for all locations or a specific city
export const fetchAQIData = async (city = '') => {
  try {
    const url = city
      ? `${BASE_URL}/${city}/?token=${API_KEY}`
      : `${BASE_URL}/here/?token=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    return [];
  }
};