import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Sprout, CloudRain, ScanLine, TrendingUp, Bot, Calendar,
  Droplets, FlaskConical, ArrowRight, Sun, Wind, MapPin, Quote, Star, Leaf, BarChart3, ShieldCheck, Navigation, Search, Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCountUp } from '@/hooks/useCountUp';
import { useGeolocation } from '@/hooks/useGeolocation';
import { fetchWeather, reverseGeocode, getLastLocation } from '@/services/weatherApi';
import { useEffect, useState, useCallback } from 'react';
import type { WeatherData } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionTitle } from '@/components/ui/SectionTitle';

const heroBg = 'https://images.pexels.com/photos/9560384/pexels-photo-9560384.jpeg?auto=compress&cs=tinysrgb&w=1600';

const stats = [
  { value: 1000, suffix: '+', labelKey: 'landing.stats.farmers', icon: Sprout },
  { value: 50, suffix: '+', labelKey: 'landing.stats.crops', icon: Leaf },
  { value: 100, suffix: '%', labelKey: 'landing.stats.weather', icon: CloudRain },
  { value: 24, suffix: '/7', labelKey: 'landing.stats.ai', icon: Bot },
];

const services = [
  { icon: CloudRain, titleKey: 'service.weather.title', descKey: 'service.weather.desc', to: '/weather' },
  { icon: Sprout, titleKey: 'service.crop.title', descKey: 'service.crop.desc', to: '/crop-recommendation' },
  { icon: ScanLine, titleKey: 'service.disease.title', descKey: 'service.disease.desc', to: '/disease-detection' },
  { icon: TrendingUp, titleKey: 'service.market.title', descKey: 'service.market.desc', to: '/market-prices' },
  { icon: Bot, titleKey: 'service.ai.title', descKey: 'service.ai.desc', to: '/ai-assistant' },
  { icon: Calendar, titleKey: 'service.calendar.title', descKey: 'service.calendar.desc', to: '/calendar' },
  { icon: Droplets, titleKey: 'service.irrigation.title', descKey: 'service.irrigation.desc', to: '/irrigation' },
  { icon: FlaskConical, titleKey: 'service.fertilizer.title', descKey: 'service.fertilizer.desc', to: '/fertilizer' },
];

const features = [
  { icon: MapPin, titleKey: 'feature.gps.title', descKey: 'feature.gps.desc', to: '/weather' },
  { icon: Bot, titleKey: 'feature.ai.title', descKey: 'feature.ai.desc', to: '/ai-assistant' },
  { icon: BarChart3, titleKey: 'feature.charts.title', descKey: 'feature.charts.desc', to: '/market-prices' },
  { icon: ShieldCheck, titleKey: 'feature.schemes.title', descKey: 'feature.schemes.desc', to: '/schemes' },
  { icon: CloudRain, titleKey: 'feature.advice.title', descKey: 'feature.advice.desc', to: '/weather' },
  { icon: Leaf, titleKey: 'feature.organic.title', descKey: 'feature.organic.desc', to: '/disease-detection' },
];

const testimonials = [
  {
    name: 'Rajesh Kumar', location: 'Patiala, Punjab',
    text: 'AgriNova AI helped me pick the right crop for my soil. My wheat yield increased by 18% this season. The weather alerts saved my harvest during unexpected rain.',
    rating: 5, photo: 'https://images.pexels.com/photos/11688197/pexels-photo-11688197.jpeg?auto=compress&cs=tinysrgb&w=120',
  },
  {
    name: 'Sunita Devi', location: 'Nashik, Maharashtra',
    text: 'The disease detection feature is a lifesaver. I uploaded a photo of my tomato leaves and got an instant diagnosis with organic treatment. My crop recovered fully.',
    rating: 5, photo: 'https://images.pexels.com/photos/11070641/pexels-photo-11070641.jpeg?auto=compress&cs=tinysrgb&w=120',
  },
  {
    name: 'Venkatesh Rao', location: 'Tumakuru, Karnataka',
    text: 'The market price tracker helps me decide when to sell. I got 12% more for my tomatoes by waiting just 3 days based on the trend chart. Brilliant tool.',
    rating: 5, photo: 'https://images.pexels.com/photos/35184089/pexels-photo-35184089.jpeg?auto=compress&cs=tinysrgb&w=120',
  },
];

export function Landing() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { location, requestLocation, loading: geoLoading, tried: geoTried } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showLocationCard, setShowLocationCard] = useState(true);

  const loadWeather = useCallback(async (lat: number, lon: number, name?: string) => {
    setWeatherLoading(true);
    try {
      const locationName = name ?? (await reverseGeocode(lat, lon));
      const w = await fetchWeather(lat, lon, locationName);
      setWeather(w);
      setShowLocationCard(false);
    } catch { /* ignore */ }
    setWeatherLoading(false);
  }, []);

  useEffect(() => {
    const last = getLastLocation();
    if (last) loadWeather(last.lat, last.lon, last.name);
  }, [loadWeather]);

  const handleUseLocation = () => { requestLocation(); };

  useEffect(() => {
    if (geoTried && location) loadWeather(location.lat, location.lon);
  }, [location, geoTried, loadWeather]);

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-forest-950/90 via-brand-900/80 to-brand-700/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 chip !bg-white/15 !text-brand-100 !border-white/20 mb-6"><Sprout size={14} /> {t('hero.badge')}</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white leading-tight">
              {t('hero.title').split(',').map((part, i) => (<span key={i} className={i === 1 ? 'block bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent' : ''}>{part}{i === 0 ? ',' : ''}</span>))}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-brand-100/90 leading-relaxed max-w-2xl">{t('hero.subtitle')}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={user ? '/dashboard' : '/signup'} className="btn-primary !text-base !px-8 !py-4">{t('hero.start')} <ArrowRight size={20} /></Link>
              <a href="#features" className="btn-ghost !text-base !px-8 !py-4 !text-white !bg-white/10 !border-white/20 hover:!bg-white/20">{t('hero.explore')}</a>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10">
              {weather ? (
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Sun, label: `${weather.temperature}°C`, sub: weather.description },
                    { icon: Droplets, label: `${weather.humidity}%`, sub: t('weather.humidity') },
                    { icon: Wind, label: `${weather.windSpeed} m/s`, sub: t('weather.windSpeed') },
                    { icon: CloudRain, label: `${weather.rainChance}%`, sub: t('weather.rainChance') },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                      <item.icon className="text-brand-300" size={22} />
                      <div><div className="text-white font-semibold text-sm">{item.label}</div><div className="text-brand-200/70 text-xs">{item.sub}</div></div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                    <MapPin className="text-brand-300" size={18} /><span className="text-brand-100 text-sm font-medium">{weather.location}</span>
                  </div>
                </div>
              ) : showLocationCard ? (
                <div className="max-w-md p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <div className="flex items-center gap-2 mb-3"><MapPin className="text-brand-300" size={20} /><h3 className="text-white font-semibold">Choose your location to receive personalized farming advice.</h3></div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button onClick={handleUseLocation} disabled={geoLoading} className="btn-primary !text-sm !py-2.5 !px-5 disabled:opacity-60">
                      {geoLoading ? <><Loader2 className="animate-spin" size={16} /> Getting location...</> : <><Navigation size={16} /> Use Current Location</>}
                    </button>
                    <Link to="/weather" className="btn-ghost !text-sm !py-2.5 !px-5 !text-white !bg-white/10 !border-white/20 hover:!bg-white/20"><Search size={16} /> Search City</Link>
                  </div>
                </div>
              ) : weatherLoading ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <Loader2 className="animate-spin text-brand-300" size={20} /><span className="text-brand-100 text-sm">Fetching live weather...</span>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16"><div className="max-w-7xl mx-auto px-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((stat, i) => <StatCard key={i} {...stat} delay={i * 0.1} label={t(stat.labelKey)} />)}</div></div></section>

      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle title={t('landing.services.title')} subtitle={t('landing.services.subtitle')} centered />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <motion.div key={service.titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={service.to}><GlassCard hover className="h-full group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shadow-glow mb-4 group-hover:scale-110 transition-transform"><service.icon className="text-white" size={24} /></div>
                  <h3 className="text-lg font-semibold text-forest-800 dark:text-brand-50 mb-2">{t(service.titleKey)}</h3>
                  <p className="text-sm text-forest-500 dark:text-brand-200/60 leading-relaxed">{t(service.descKey)}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">{t('hero.explore')} <ArrowRight size={14} /></div>
                </GlassCard></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle title={t('landing.features.title')} subtitle={t('landing.features.subtitle')} centered />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div key={feature.titleKey} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={feature.to}><GlassCard hover className="h-full flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><feature.icon className="text-brand-600 dark:text-brand-300" size={22} /></div>
                  <div><h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-1">{t(feature.titleKey)}</h3><p className="text-sm text-forest-500 dark:text-brand-200/60">{t(feature.descKey)}</p></div>
                </GlassCard></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle title={t('landing.testimonials.title')} subtitle={t('landing.testimonials.subtitle')} centered />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((tm, i) => (
              <motion.div key={tm.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <GlassCard className="h-full">
                  <Quote className="text-brand-300 dark:text-brand-700 mb-3" size={32} />
                  <p className="text-forest-700 dark:text-brand-100 leading-relaxed mb-5">{tm.text}</p>
                  <div className="flex items-center gap-3">
                    <img src={tm.photo} alt={tm.name} className="w-11 h-11 rounded-full object-cover" />
                    <div><div className="font-semibold text-forest-800 dark:text-brand-50 text-sm">{tm.name}</div><div className="text-xs text-forest-500 dark:text-brand-200/50">{tm.location}</div></div>
                    <div className="ml-auto flex gap-0.5">{Array.from({ length: tm.rating }).map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-700 via-brand-700 to-forest-600 p-10 md:p-16 text-center shadow-glow">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-brand-300 blur-3xl animate-float" />
              <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-forest-400 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">{t('landing.cta.title')}</h2>
              <p className="text-brand-100/90 text-lg mb-8 max-w-2xl mx-auto">{t('landing.cta.subtitle')}</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to={user ? '/dashboard' : '/signup'} className="btn-primary !text-base !px-8 !py-4 !bg-white !text-forest-700 !from-white !to-white hover:!scale-105">{user ? t('landing.cta.dashboard') : t('hero.start')} <ArrowRight size={20} /></Link>
                <Link to="/about" className="btn-ghost !text-base !px-8 !py-4 !text-white !bg-white/10 !border-white/20 hover:!bg-white/20">{t('landing.cta.learn')}</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, suffix, label, icon: Icon, delay }: { value: number; suffix: string; label: string; icon: LucideIcon; delay: number }) {
  const count = useCountUp(value, 2000);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }}>
      <GlassCard className="text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto mb-3"><Icon className="text-brand-600 dark:text-brand-300" size={24} /></div>
        <div className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">{count}{suffix}</div>
        <div className="text-sm text-forest-500 dark:text-brand-200/60 mt-1">{label}</div>
      </GlassCard>
    </motion.div>
  );
}
