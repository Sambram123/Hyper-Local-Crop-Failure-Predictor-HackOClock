import { WeatherInput } from './scoring';
import logger from '../utils/logger';

const OPEN_METEO_BASE_URL = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';

export async function getWeather(lat: number, lng: number): Promise<WeatherInput> {
  try {
    const url = `${OPEN_METEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=7&forecast_days=7&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    const current = data.current;
    const daily = data.daily;
    
    if (!current || !daily || !daily.precipitation_sum) {
      throw new Error('Invalid data format received from Open-Meteo');
    }

    // daily.precipitation_sum contains past 7 days + today + next 6 days (14 total elements)
    // Indexes 0-6 are the past 7 days.
    // Indexes 7-13 are today + next 6 days (forecast).
    
    const precipArray = daily.precipitation_sum as number[];
    
    let rainfall7d = 0;
    for (let i = 0; i < 7 && i < precipArray.length; i++) {
      rainfall7d += (precipArray[i] || 0);
    }
    
    let forecastRain = 0;
    for (let i = 7; i < 14 && i < precipArray.length; i++) {
      forecastRain += (precipArray[i] || 0);
    }
    
    // Fallback to daily max if current temperature is not available
    const tempMax = current.temperature_2m !== undefined && current.temperature_2m !== null
      ? current.temperature_2m 
      : (daily.temperature_2m_max && daily.temperature_2m_max[7] !== undefined ? daily.temperature_2m_max[7] : 30);
      
    const tempMin = daily.temperature_2m_min && daily.temperature_2m_min[7] !== undefined 
      ? daily.temperature_2m_min[7] 
      : 20;
      
    const humidity = current.relative_humidity_2m !== undefined && current.relative_humidity_2m !== null
      ? current.relative_humidity_2m 
      : 50;

    return {
      tempMax: Number(tempMax),
      tempMin: Number(tempMin),
      humidity: Number(humidity),
      rainfall7d: Number(rainfall7d.toFixed(2)),
      forecastRain: Number(forecastRain.toFixed(2))
    };
    
  } catch (error) {
    logger.error('Weather service failed', error);
    throw new Error('Unable to fetch weather data. Open-Meteo might be unreachable.');
  }
}
