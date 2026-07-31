import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Sun, CloudRain, Wind, Droplets, Sunrise, Sunset, Thermometer,
  Sun as UVIcon, CheckCircle2, AlertTriangle, TrendingUp, Bell,
  Sprout, ScanLine, Bot, Calendar, ArrowRight, Heart, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { fetchWeather, reverseGeocode, getWeatherAdvice } from '@/services/weatherApi';
import { marketPrices, govSchemes } from '@/services/data';
import { calculateFarmHealth, type ScoreChange } from '@/services/farmHealth';
import type { WeatherData } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function Dashboard() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { location, requestLocation, tried: geoTried } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [showChanges, setShowChanges] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const name = await reverseGeocode(lat, lon);
      const w = await fetchWeather(lat, lon, name);
      setWeather(w);
      setLastRefresh(new Date());
    } catch {
      setWeather(null);
    }
    setWeatherLoading(false);
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (geoTried) {
      if (location) loadWeather(location.lat, location.lon);
      else loadWeather(28.6139, 77.209); // Default: New Delhi
    }
  }, [location, geoTried, loadWeather]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (location) loadWeather(location.lat, location.lon);
      else loadWeather(28.6139, 77.209);
    }, REFRESH_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [location, loadWeather]);

  const advice = weather ? getWeatherAdvice(weather) : [];
  const today = new Date();

  // Determine market trend
  const marketTrend: 'up' | 'down' | 'neutral' = (() => {
    const ups = marketPrices.filter(c => c.currentPrice > c.yesterdayPrice).length;
    const downs = marketPrices.filter(c => c.currentPrice < c.yesterdayPrice).length;
    return ups > downs ? 'up' : downs > ups ? 'down' : 'neutral';
  })();

  const farmHealth = calculateFarmHealth(weather, null, marketTrend);

  const tasks = [
    { task: 'Check irrigation for paddy fields', done: true, priority: 'high' },
    { task: 'Apply NPK fertilizer to wheat crop', done: false, priority: 'high' },
    { task: 'Inspect tomato plants for blight', done: false, priority: 'medium' },
    { task: 'Harvest mature maize cobs', done: false, priority: 'medium' },
    { task: 'Register for PM-KISAN installment', done: false, priority: 'low' },
  ];

  const notifications = [
    { title: 'Rain expected tomorrow', desc: 'Delay fertilizer application', time: '2h ago', type: 'weather' },
    { title: 'Tomato price rising', desc: 'Best time to sell in Kolar market', time: '5h ago', type: 'market' },
    { title: 'New scheme announced', desc: 'PMKSY subsidy increased to 55%', time: '1d ago', type: 'scheme' },
    { title: 'Disease alert in your area', desc: 'Report of leaf rust in wheat', time: '2d ago', type: 'alert' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">
          {t('dashboard.welcome')}, {profile?.full_name?.split(' ')[0] || 'Farmer'}!
        </h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">
          {formatDate(today)} • {t('dashboard.today')}
          {lastRefresh && <span className="text-xs ml-2 text-forest-400">({t('market.lastUpdated')}: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})</span>}
        </p>
      </motion.div>

      {/* Farm Health Score */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <GlassCard className="bg-gradient-to-br from-brand-600 to-forest-700 !border-0 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42 * (farmHealth.score / 100)} ${2 * Math.PI * 42}`}
                    initial={{ strokeDasharray: '0 999' }}
                    animate={{ strokeDasharray: `${2 * Math.PI * 42 * (farmHealth.score / 100)} ${2 * Math.PI * 42}` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="text-center">
                  <div className="text-2xl font-bold font-display">{farmHealth.score}</div>
                  <div className="text-xs text-brand-100/70">/ 100</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-brand-100/80 text-sm mb-1">
                  <Heart size={16} /> {t('dashboard.health.score')}
                </div>
                <h3 className="text-xl font-bold font-display">{farmHealth.label}</h3>
                <p className="text-sm text-brand-100/80 mt-1 max-w-md">{farmHealth.recommendation}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto md:ml-auto">
              {farmHealth.factors.map((factor) => (
                <div key={factor.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 mb-1">
                    {factor.status === 'good' ? <CheckCircle2 size={14} className="text-brand-200" /> : factor.status === 'medium' ? <AlertTriangle size={14} className="text-amber-200" /> : <AlertTriangle size={14} className="text-red-200" />}
                    <span className="text-xs text-brand-100/70">{factor.label}</span>
                  </div>
                  <div className="text-sm font-semibold">{factor.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score changes explanation */}
          {farmHealth.changes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/15">
              <button onClick={() => setShowChanges(!showChanges)} className="flex items-center gap-2 text-sm text-brand-100/80 hover:text-white transition">
                {showChanges ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {t('dashboard.health.changes')}
              </button>
              {showChanges && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
                  {farmHealth.changes.map((change: ScoreChange, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/10">
                      <span className={`text-sm font-bold ${change.delta > 0 ? 'text-brand-200' : 'text-red-300'}`}>
                        {change.delta > 0 ? '+' : ''}{change.delta}
                      </span>
                      <span className="text-sm text-brand-100/80">{change.reason}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Weather + Advice */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          {weatherLoading ? (
            <SkeletonCard lines={4} className="h-full" />
          ) : weather ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="h-full bg-gradient-to-br from-brand-600 to-forest-700 !border-0 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-brand-100/80 text-sm">
                      <Sun size={16} /> {weather.location}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-5xl">{weather.icon}</span>
                      <div>
                        <div className="text-5xl font-bold font-display">{weather.temperature}°C</div>
                        <div className="text-brand-100/80">{weather.description}</div>
                      </div>
                    </div>
                  </div>
                  <Link to="/weather" className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition text-sm font-medium">{t('dashboard.details')}</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Droplets, label: t('weather.humidity'), value: `${weather.humidity}%` },
                    { icon: Wind, label: t('weather.windSpeed'), value: `${weather.windSpeed} km/h` },
                    { icon: CloudRain, label: t('weather.rainChance'), value: `${weather.rainChance}%` },
                    { icon: UVIcon, label: t('weather.uvIndex'), value: weather.uvIndex },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-md">
                      <item.icon size={18} className="text-brand-200 mb-1.5" />
                      <div className="text-xs text-brand-100/70">{item.label}</div>
                      <div className="text-lg font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md flex items-center gap-2">
                    <Sunrise size={18} className="text-amber-200" />
                    <div>
                      <div className="text-xs text-brand-100/70">{t('weather.sunrise')}</div>
                      <div className="text-sm font-semibold">{weather.sunrise ? new Date(weather.sunrise).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md flex items-center gap-2">
                    <Sunset size={18} className="text-orange-200" />
                    <div>
                      <div className="text-xs text-brand-100/70">{t('weather.sunset')}</div>
                      <div className="text-sm font-semibold">{weather.sunset ? new Date(weather.sunset).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : null}
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="text-brand-600 dark:text-brand-300" size={20} />
              <h3 className="font-semibold text-forest-800 dark:text-brand-50">{t('dashboard.weather.title')}</h3>
            </div>
            <div className="space-y-3">
              {advice.length > 0 ? advice.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                  <CheckCircle2 className="text-brand-600 dark:text-brand-300 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-forest-700 dark:text-brand-100 leading-relaxed">{tip}</p>
                </div>
              )) : <p className="text-sm text-forest-500">{t('common.loading')}</p>}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Tasks + Market + Notifications */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-brand-600 dark:text-brand-300" size={20} />
                <h3 className="font-semibold text-forest-800 dark:text-brand-50">{t('dashboard.tasks.title')}</h3>
              </div>
              <span className="chip">{tasks.filter(t => t.done).length}/{tasks.length}</span>
            </div>
            <div className="space-y-2.5">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 dark:hover:bg-forest-800/40 transition">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-brand-500 border-brand-500' : 'border-forest-300 dark:border-brand-400/30'}`}>
                    {task.done && <CheckCircle2 className="text-white" size={12} />}
                  </div>
                  <span className={`text-sm flex-1 ${task.done ? 'line-through text-forest-400 dark:text-brand-200/40' : 'text-forest-700 dark:text-brand-100'}`}>{task.task}</span>
                  <span className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-brand-400'}`} />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-brand-600 dark:text-brand-300" size={20} />
                <h3 className="font-semibold text-forest-800 dark:text-brand-50">{t('dashboard.market.title')}</h3>
              </div>
              <Link to="/market-prices" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">{t('dashboard.market.viewAll')}</Link>
            </div>
            <div className="space-y-2.5">
              {marketPrices.slice(0, 5).map((crop) => {
                const diff = crop.currentPrice - crop.yesterdayPrice;
                const up = diff >= 0;
                return (
                  <div key={crop.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-forest-800/40 transition">
                    <img src={crop.image} alt={crop.name} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-forest-700 dark:text-brand-100 truncate">{crop.name}</div>
                      <div className="text-xs text-forest-400">₹{crop.currentPrice}/qtl</div>
                    </div>
                    <div className={`text-sm font-semibold ${up ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>{up ? '▲' : '▼'} {Math.abs(diff)}</div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-brand-600 dark:text-brand-300" size={20} />
              <h3 className="font-semibold text-forest-800 dark:text-brand-50">{t('dashboard.notifications.title')}</h3>
            </div>
            <div className="space-y-2.5">
              {notifications.map((n, i) => (
                <div key={i} className="p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40 hover:bg-brand-100 dark:hover:bg-forest-800/60 transition cursor-pointer">
                  <div className="flex items-start gap-2">
                    {n.type === 'alert' ? <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} /> : n.type === 'weather' ? <CloudRain className="text-brand-500 shrink-0 mt-0.5" size={16} /> : n.type === 'market' ? <TrendingUp className="text-brand-500 shrink-0 mt-0.5" size={16} /> : <Sprout className="text-brand-500 shrink-0 mt-0.5" size={16} />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-forest-700 dark:text-brand-100">{n.title}</div>
                      <div className="text-xs text-forest-500 dark:text-brand-200/50">{n.desc}</div>
                      <div className="text-xs text-forest-400 mt-0.5">{n.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions + Govt Schemes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <GlassCard className="h-full">
            <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">{t('dashboard.quickActions.title')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { to: '/crop-recommendation', icon: Sprout, label: t('nav.crops') },
                { to: '/disease-detection', icon: ScanLine, label: t('nav.disease') },
                { to: '/ai-assistant', icon: Bot, label: t('nav.assistant') },
                { to: '/calendar', icon: Calendar, label: t('nav.calendar') },
                { to: '/irrigation', icon: Droplets, label: t('nav.irrigation') },
                { to: '/fertilizer', icon: Thermometer, label: t('nav.fertilizer') },
                { to: '/market-prices', icon: TrendingUp, label: t('nav.market') },
                { to: '/schemes', icon: CheckCircle2, label: t('nav.schemes') },
              ].map((action) => (
                <Link key={action.to} to={action.to} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40 hover:bg-brand-100 dark:hover:bg-forest-800/60 transition group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <action.icon className="text-white" size={20} />
                  </div>
                  <span className="text-xs font-medium text-forest-700 dark:text-brand-100 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-forest-800 dark:text-brand-50">{t('dashboard.schemes.title')}</h3>
              <Link to="/schemes" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">{t('dashboard.market.viewAll')}</Link>
            </div>
            <div className="space-y-3">
              {govSchemes.slice(0, 3).map((scheme) => (
                <Link key={scheme.id} to="/schemes" className="block p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40 hover:bg-brand-100 dark:hover:bg-forest-800/60 transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-forest-700 dark:text-brand-100 truncate">{scheme.title.split('(')[0]}</div>
                      <div className="text-xs text-forest-500 dark:text-brand-200/50 mt-0.5">{scheme.category}</div>
                    </div>
                    <ArrowRight size={14} className="text-brand-500 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
