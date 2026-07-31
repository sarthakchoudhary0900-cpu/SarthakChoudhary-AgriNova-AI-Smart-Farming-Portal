import axios from 'axios';
import type { WeatherData } from '@/types';

const OPENWEATHER_API_KEY = '679e284ec76b53a691172edefe3b551d';
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

const WEATHER_ICONS: Record<string, string> = {
  '01d': '☀️', '01n': '🌙', '02d': '🌤️', '02n': '☁️', '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️', '09d': '🌦️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️', '13d': '🌨️', '13n': '🌨️', '50d': '🌫️', '50n': '🌫️',
};

const weatherClient = axios.create({ baseURL: OPENWEATHER_BASE, timeout: 8000 });
const geocodingClient = axios.create({ baseURL: 'https://geocoding-api.open-meteo.com/v1', timeout: 8000 });

const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const RECENT_KEY = 'agrinova-recent-searches';
const LOCATION_KEY = 'agrinova-last-location';

export function getRecentSearches(): string[] {
  try { const s = localStorage.getItem(RECENT_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

export function addRecentSearch(query: string): string[] {
  try {
    const recent = getRecentSearches().filter(s => s.toLowerCase() !== query.toLowerCase());
    recent.unshift(query);
    const trimmed = recent.slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch { return []; }
}

export function saveLastLocation(lat: number, lon: number, name: string) {
  try { localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lon, name })); } catch { /* ignore */ }
}

export function getLastLocation(): { lat: number; lon: number; name: string } | null {
  try { const s = localStorage.getItem(LOCATION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

export interface CitySuggestion {
  name: string; country: string; admin1?: string; lat: number; lon: number;
}

export async function searchCities(query: string): Promise<CitySuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await geocodingClient.get('/search', {
      params: { name: query.trim(), count: 10, language: 'en', format: 'json' },
    });
    return (res.data?.results ?? []).map((r: { name: string; country?: string; admin1?: string; latitude: number; longitude: number }) => ({
      name: r.name, country: r.country ?? '', admin1: r.admin1 ?? '', lat: r.latitude, lon: r.longitude,
    }));
  } catch { return []; }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await weatherClient.get('/weather', {
      params: { lat, lon, appid: OPENWEATHER_API_KEY, units: 'metric' },
    });
    const d = res.data;
    const name = d.name || 'Your location';
    const country = d.sys?.country || '';
    return country ? `${name}, ${country}` : name;
  } catch {
    try {
      const res = await geocodingClient.get('/search', {
        params: { latitude: lat, longitude: lon, count: 1, language: 'en', format: 'json' },
      });
      const hit = res.data?.results?.[0];
      return hit ? `${hit.name}, ${hit.country ?? ''}` : 'Your location';
    } catch { return 'Your location'; }
  }
}

export async function fetchWeather(lat: number, lon: number, locationName: string): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  // Fetch current weather + one-call for UV, rain probability, sunrise/sunset
  const [currentRes, oneCallRes] = await Promise.allSettled([
    weatherClient.get('/weather', {
      params: { lat, lon, appid: OPENWEATHER_API_KEY, units: 'metric' },
    }),
    weatherClient.get('/onecall', {
      params: { lat, lon, appid: OPENWEATHER_API_KEY, units: 'metric', exclude: 'minutely,alerts' },
    }),
  ]);

  if (currentRes.status !== 'fulfilled') throw new Error('Weather API failed');

  const c = currentRes.value.data;
  let uvIndex = 0;
  let rainChance = 0;
  let sunrise = '';
  let sunset = '';

  if (oneCallRes.status === 'fulfilled') {
    const oc = oneCallRes.value.data;
    uvIndex = Math.round(oc.current?.uvi ?? 0);
    rainChance = oc.daily?.[0]?.pop ? Math.round(oc.daily[0].pop * 100) : 0;
    sunrise = oc.current?.sunrise ? new Date(oc.current.sunrise * 1000).toISOString() : '';
    sunset = oc.current?.sunset ? new Date(oc.current.sunset * 1000).toISOString() : '';
  } else {
    // Fallback: use data from current weather endpoint
    sunrise = c.sys?.sunrise ? new Date(c.sys.sunrise * 1000).toISOString() : '';
    sunset = c.sys?.sunset ? new Date(c.sys.sunset * 1000).toISOString() : '';
  }

  const weatherIcon = c.weather?.[0]?.icon ?? '01d';
  const description = c.weather?.[0]?.description ?? 'Clear';
  const icon = WEATHER_ICONS[weatherIcon] ?? '🌤️';

  const data: WeatherData = {
    temperature: Math.round(c.main?.temp ?? 0),
    feelsLike: Math.round(c.main?.feels_like ?? 0),
    humidity: c.main?.humidity ?? 0,
    pressure: Math.round(c.main?.pressure ?? 1013),
    cloudCover: c.clouds?.all ?? 0,
    windSpeed: Math.round(c.wind?.speed ?? 0),
    visibility: Math.round((c.visibility ?? 10000) / 1000),
    rainChance,
    uvIndex,
    sunrise,
    sunset,
    weatherCode: c.weather?.[0]?.id ?? 800,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    icon,
    location: locationName,
  };

  weatherCache.set(cacheKey, { data, timestamp: Date.now() });
  saveLastLocation(lat, lon, locationName);
  return data;
}

export interface SmartAdvice {
  condition: string;
  advice: string;
  icon: string;
  severity: 'good' | 'warning' | 'critical';
}

export function getSmartAdvice(w: WeatherData): SmartAdvice[] {
  const tips: SmartAdvice[] = [];

  if (w.temperature >= 38) {
    tips.push({ condition: `Temperature above 38°C (${w.temperature}°C)`, advice: 'Water crops early morning (6–8 AM) to reduce evaporation. Provide shade for sensitive plants.', icon: '🌡️', severity: 'critical' });
  } else if (w.temperature >= 32) {
    tips.push({ condition: `High temperature (${w.temperature}°C)`, advice: 'Increase irrigation frequency. Monitor heat-sensitive crops closely.', icon: '🌡️', severity: 'warning' });
  } else if (w.temperature <= 5) {
    tips.push({ condition: `Cold conditions (${w.temperature}°C)`, advice: 'Protect crops with covers. Delay sowing of cold-sensitive varieties.', icon: '❄️', severity: 'warning' });
  } else {
    tips.push({ condition: `Favorable temperature (${w.temperature}°C)`, advice: 'Good conditions for regular farm operations.', icon: '✅', severity: 'good' });
  }

  if (w.rainChance >= 70) {
    tips.push({ condition: `Rain expected (${w.rainChance}% chance)`, advice: 'Do not irrigate today. Delay fertilizer and pesticide application.', icon: '🌧️', severity: 'warning' });
  } else if (w.rainChance <= 20 && w.temperature > 25) {
    tips.push({ condition: `Dry conditions (${w.rainChance}% rain chance)`, advice: 'Ensure adequate soil moisture. Apply mulch to retain water.', icon: '☀️', severity: 'warning' });
  } else {
    tips.push({ condition: `Rain prediction (${w.rainChance}%)`, advice: 'Normal irrigation schedule is fine.', icon: '✅', severity: 'good' });
  }

  if (w.humidity >= 80) {
    tips.push({ condition: `Humidity above 80% (${w.humidity}%)`, advice: 'Watch for fungal diseases. Improve field ventilation and monitor crops daily.', icon: '💧', severity: 'critical' });
  } else if (w.humidity >= 60) {
    tips.push({ condition: `Moderate humidity (${w.humidity}%)`, advice: 'Monitor for fungal diseases. Maintain good air circulation.', icon: '💧', severity: 'warning' });
  } else {
    tips.push({ condition: `Low humidity (${w.humidity}%)`, advice: 'Low disease risk. Good conditions for harvesting and drying.', icon: '✅', severity: 'good' });
  }

  if (w.uvIndex >= 8) {
    tips.push({ condition: `Very high UV index (${w.uvIndex})`, advice: 'Workers should use sun protection. Avoid midday field work.', icon: '🔆', severity: 'critical' });
  }

  if (w.windSpeed >= 30) {
    tips.push({ condition: `Strong wind (${w.windSpeed} m/s)`, advice: 'Delay pesticide spraying. Stake tall crops. Protect young seedlings.', icon: '💨', severity: 'critical' });
  } else if (w.windSpeed >= 20) {
    tips.push({ condition: `Moderate wind (${w.windSpeed} m/s)`, advice: 'Be cautious with spraying. Check stakes and supports.', icon: '💨', severity: 'warning' });
  }

  return tips;
}

export function getWeatherAdvice(w: WeatherData): string[] {
  return getSmartAdvice(w).map(a => `${a.condition}. ${a.advice}`);
}
