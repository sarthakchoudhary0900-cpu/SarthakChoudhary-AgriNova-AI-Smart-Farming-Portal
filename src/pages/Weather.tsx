import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CloudRain, Wind, Droplets, Sunrise, Sunset, Thermometer,
  Sun as UV, Cloud, Eye, Gauge, MapPin, Search, Navigation, Loader2, Lightbulb,
  AlertTriangle, CheckCircle2, X,
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import {
  fetchWeather, reverseGeocode, searchCities, getSmartAdvice,
  getRecentSearches, addRecentSearch, getLastLocation, saveLastLocation,
  type CitySuggestion, type SmartAdvice,
} from '@/services/weatherApi';
import type { WeatherData } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Spinner } from '@/components/ui/Spinner';
import { useDebounce } from '@/hooks/useDebounce';

const REFRESH_INTERVAL = 5 * 60 * 1000;

export function Weather() {
  const { t } = useTranslation();
  const { location, requestLocation, loading: geoLoading, tried: geoTried } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const debouncedCity = useDebounce(city, 300);
  const loadedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const loadWeather = useCallback(async (lat: number, lon: number, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const locationName = name ?? (await reverseGeocode(lat, lon));
      const w = await fetchWeather(lat, lon, locationName);
      setWeather(w);
      setLastRefresh(new Date());
      saveLastLocation(lat, lon, locationName);
    } catch {
      setError(t('common.error'));
    }
    setLoading(false);
  }, [t]);

  // Try GPS once on mount
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      requestLocation();
    }
  }, [requestLocation]);

  // When GPS resolves, load weather
  useEffect(() => {
    if (geoTried) {
      if (location) {
        loadWeather(location.lat, location.lon);
      } else if (!geoLoading) {
        // GPS failed — check localStorage for last location
        const last = getLastLocation();
        if (last) {
          loadWeather(last.lat, last.lon, last.name);
        } else {
          setGpsDenied(true);
          loadWeather(28.6139, 77.209, 'New Delhi, India');
        }
      }
    }
  }, [location, geoTried, geoLoading, loadWeather]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const last = getLastLocation();
      if (last) loadWeather(last.lat, last.lon, last.name);
      else if (location) loadWeather(location.lat, location.lon);
    }, REFRESH_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [location, loadWeather]);

  // Autocomplete
  useEffect(() => {
    if (debouncedCity.trim().length < 2) { setSuggestions([]); return; }
    let cancelled = false;
    (async () => {
      const results = await searchCities(debouncedCity);
      if (!cancelled) setSuggestions(results);
    })();
    return () => { cancelled = true; };
  }, [debouncedCity]);

  useEffect(() => { setRecentSearches(getRecentSearches()); }, []);

  const handleSelectCity = async (s: CitySuggestion) => {
    setShowSuggestions(false);
    setCity('');
    setSuggestions([]);
    const name = `${s.name}${s.admin1 ? ', ' + s.admin1 : ''}, ${s.country}`;
    addRecentSearch(name);
    setRecentSearches(getRecentSearches());
    await loadWeather(s.lat, s.lon, name);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setShowSuggestions(false);
    const results = await searchCities(city.trim());
    if (results.length > 0) {
      const s = results[0];
      const name = `${s.name}${s.admin1 ? ', ' + s.admin1 : ''}, ${s.country}`;
      addRecentSearch(name);
      setRecentSearches(getRecentSearches());
      await loadWeather(s.lat, s.lon, name);
      setCity('');
    } else {
      setError(`Could not find "${city}". Try another city or district name.`);
    }
  };

  const handleGPS = () => { setGpsDenied(false); requestLocation(); };

  const smartAdvice = weather ? getSmartAdvice(weather) : [];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">{t('weather.title')}</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">{t('weather.subtitle')}</p>
        {lastRefresh && <p className="text-xs text-forest-400 mt-1">{t('market.lastUpdated')}: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>}
      </motion.div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
              <input type="text" value={city} onChange={(e) => { setCity(e.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder={t('weather.searchPlaceholder')} className="glass-input w-full pl-11" />
              {city && <button type="button" onClick={() => { setCity(''); setSuggestions([]); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"><X size={16} /></button>}
            </div>
          </form>
          <AnimatePresence>
            {showSuggestions && (suggestions.length > 0 || (recentSearches.length > 0 && !city)) && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 w-full glass p-2 z-20 max-h-80 overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSelectCity(s)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-forest-800/60 transition text-left">
                      <MapPin size={16} className="text-brand-500 shrink-0" />
                      <div className="min-w-0"><div className="text-sm font-medium text-forest-700 dark:text-brand-100 truncate">{s.name}</div><div className="text-xs text-forest-400 truncate">{s.admin1 ? s.admin1 + ', ' : ''}{s.country}</div></div>
                    </button>
                  ))
                ) : !city && recentSearches.length > 0 ? (
                  <>
                    <div className="px-3 py-1.5 text-xs font-semibold text-forest-400 uppercase">{t('weather.recentSearches')}</div>
                    {recentSearches.map((s, i) => (
                      <button key={i} onClick={() => { setCity(s); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-forest-800/60 transition text-left">
                        <Search size={14} className="text-forest-400 shrink-0" /><span className="text-sm text-forest-600 dark:text-brand-200 truncate">{s}</span>
                      </button>
                    ))}
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={handleGPS} disabled={geoLoading} className="btn-ghost disabled:opacity-60">
          {geoLoading ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
          <span className="hidden sm:inline">{t('weather.useGPS')}</span>
        </button>
      </div>

      {gpsDenied && !location && (
        <div className="glass p-4 mb-6 border-l-4 border-l-amber-500">
          <p className="text-sm text-amber-700 dark:text-amber-400">{t('weather.gpsDenied')}</p>
        </div>
      )}

      {error && (
        <div className="glass p-4 mb-6 border-l-4 border-l-red-500">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading && !weather ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3"><Spinner size={40} /><p className="text-forest-500 dark:text-brand-200/60">{t('weather.fetching')}</p></div>
        </div>
      ) : weather ? (
        <>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="bg-gradient-to-br from-brand-600 to-forest-700 !border-0 text-white mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-brand-100/80"><MapPin size={18} /><span className="text-sm">{weather.location}</span></div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-7xl">{weather.icon}</span>
                    <div>
                      <div className="text-6xl font-bold font-display">{weather.temperature}°C</div>
                      <div className="text-brand-100/80 text-lg">{weather.description}</div>
                      <div className="text-brand-100/60 text-sm mt-1">{t('weather.feelsLike')}: {weather.feelsLike}°C</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md flex items-center gap-3"><Sunrise className="text-amber-200" size={24} /><div><div className="text-xs text-brand-100/70">{t('weather.sunrise')}</div><div className="font-semibold">{weather.sunrise ? new Date(weather.sunrise).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}</div></div></div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md flex items-center gap-3"><Sunset className="text-orange-200" size={24} /><div><div className="text-xs text-brand-100/70">{t('weather.sunset')}</div><div className="font-semibold">{weather.sunset ? new Date(weather.sunset).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}</div></div></div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[
              { icon: Droplets, label: t('weather.humidity'), value: `${weather.humidity}%`, color: 'text-blue-500' },
              { icon: Gauge, label: t('weather.pressure'), value: `${weather.pressure} hPa`, color: 'text-forest-600' },
              { icon: Cloud, label: t('weather.cloudCover'), value: `${weather.cloudCover}%`, color: 'text-slate-500' },
              { icon: Wind, label: t('weather.windSpeed'), value: `${weather.windSpeed} m/s`, color: 'text-teal-500' },
              { icon: Eye, label: t('weather.visibility'), value: `${weather.visibility} km`, color: 'text-indigo-500' },
              { icon: CloudRain, label: t('weather.rainChance'), value: `${weather.rainChance}%`, color: 'text-blue-600' },
              { icon: UV, label: t('weather.uvIndex'), value: weather.uvIndex, color: 'text-amber-500' },
              { icon: Thermometer, label: t('weather.feelsLike'), value: `${weather.feelsLike}°C`, color: 'text-red-500' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="text-center">
                  <item.icon size={28} className={`mx-auto mb-3 ${item.color}`} />
                  <div className="text-2xl font-bold text-forest-800 dark:text-brand-50">{item.value}</div>
                  <div className="text-sm text-forest-500 dark:text-brand-200/60 mt-1">{item.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center"><Lightbulb className="text-white" size={20} /></div>
                <div><h3 className="font-semibold text-forest-800 dark:text-brand-50 text-lg">{t('weather.advice.title')}</h3><p className="text-sm text-forest-500 dark:text-brand-200/60">{t('weather.advice.subtitle')}</p></div>
              </div>
              <div className="space-y-3">
                {smartAdvice.map((tip, i) => <SmartAdviceCard key={i} advice={tip} delay={0.4 + i * 0.1} />)}
              </div>
            </GlassCard>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}

function SmartAdviceCard({ advice, delay }: { advice: SmartAdvice; delay: number }) {
  const severityStyles = {
    good: { bg: 'bg-brand-50 dark:bg-forest-800/40', icon: 'text-brand-600 dark:text-brand-300', border: 'border-l-brand-500', Icon: CheckCircle2 },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600', border: 'border-l-amber-500', Icon: AlertTriangle },
    critical: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600', border: 'border-l-red-500', Icon: AlertTriangle },
  };
  const style = severityStyles[advice.severity];
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${style.bg} ${style.border}`}>
      <style.Icon size={20} className={`${style.icon} shrink-0 mt-0.5`} />
      <div><div className="text-sm font-semibold text-forest-700 dark:text-brand-100">{advice.condition}</div><div className="text-sm text-forest-600 dark:text-brand-200/70 mt-0.5 leading-relaxed">{advice.advice}</div></div>
    </motion.div>
  );
}
