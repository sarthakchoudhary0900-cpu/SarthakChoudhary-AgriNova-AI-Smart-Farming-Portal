import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Heart, Sun, TrendingUp, AlertTriangle, Droplets, BarChart3, Wallet,
  Download, FileText, CloudRain, Printer, Loader2, MapPin, Target, Award,
  Beaker, Clock, Leaf, Sprout,
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, RadialLinearScale, Filler, Tooltip, Legend, Title,
} from 'chart.js';
import { useGeolocation } from '@/hooks/useGeolocation';
import { fetchWeather, reverseGeocode, type SmartAdvice } from '@/services/weatherApi';
import { getSmartAdvice } from '@/services/weatherApi';
import { marketPrices } from '@/services/data';
import { calculateFarmHealth, generateAIInsights, type AIInsight } from '@/services/farmHealth';
import { recommendCrop, getFarmingScore, seasons, soilTypes, waterLevels, budgetLevels } from '@/services/cropAdvisor';
import { indianStates, districtsByState } from '@/lib/utils';
import type { WeatherData, CropRecResult } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Spinner } from '@/components/ui/Spinner';

const Line = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Line })));
const Bar = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Bar })));
const Radar = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Radar })));

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Filler, Tooltip, Legend, Title);

export function SmartAnalytics() {
  const { t } = useTranslation();
  const { location, requestLocation, tried: geoTried } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [cropResult, setCropResult] = useState<CropRecResult | null>(null);
  const [farmingScore, setFarmingScore] = useState(0);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const name = await reverseGeocode(lat, lon);
      const w = await fetchWeather(lat, lon, name);
      setWeather(w);
    } catch {
      setWeather(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (geoTried) {
      if (location) loadWeather(location.lat, location.lon);
      else loadWeather(28.6139, 77.209); // Default: New Delhi
    }
  }, [location, geoTried, loadWeather]);

  const districts = selectedState ? (districtsByState[selectedState] || []) : [];

  const handleGenerateCrop = () => {
    if (!selectedState || !selectedDistrict) return;
    const input = {
      state: selectedState, district: selectedDistrict, season: seasons[0],
      soilType: soilTypes[0], farmSize: '1 acre', waterAvailability: waterLevels[1],
      budget: budgetLevels[1], expectedInvestment: '₹50,000', cropPreference: selectedCrop,
    };
    const rec = recommendCrop(input);
    const score = getFarmingScore(input);
    setCropResult(rec);
    setFarmingScore(score);
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (location) loadWeather(location.lat, location.lon);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location, loadWeather]);

  const marketTrend: 'up' | 'down' | 'neutral' = useMemo(() => {
    if (!weather) return 'neutral';
    const filtered = selectedState ? marketPrices.filter(c => c.state === selectedState) : marketPrices;
    if (filtered.length === 0) return 'neutral';
    const ups = filtered.filter(c => c.currentPrice > c.yesterdayPrice).length;
    const downs = filtered.filter(c => c.currentPrice < c.yesterdayPrice).length;
    return ups > downs ? 'up' : downs > ups ? 'down' : 'neutral';
  }, [weather, selectedState]);

  const farmHealth = useMemo(() => calculateFarmHealth(weather, cropResult, marketTrend), [weather, cropResult, marketTrend]);
  const aiInsights = useMemo(() => generateAIInsights(weather, cropResult, marketTrend, selectedCrop || cropResult?.crop), [weather, cropResult, marketTrend, selectedCrop]);
  const smartAdvice: SmartAdvice[] = useMemo(() => weather ? getSmartAdvice(weather) : [], [weather]);

  const filteredMarket = useMemo(() => {
    let result = marketPrices;
    if (selectedState && selectedState !== 'All') result = result.filter(c => c.state === selectedState);
    if (selectedCrop) result = result.filter(c => c.name.toLowerCase().includes(selectedCrop.toLowerCase()));
    return result;
  }, [selectedState, selectedCrop]);

  const highestCrop = useMemo(() => {
    if (filteredMarket.length === 0) return null;
    return filteredMarket.reduce((max, c) => (c.currentPrice > max.currentPrice ? c : max), filteredMarket[0]);
  }, [filteredMarket]);

  const lowestCrop = useMemo(() => {
    if (filteredMarket.length === 0) return null;
    return filteredMarket.reduce((min, c) => (c.currentPrice < min.currentPrice ? c : min), filteredMarket[0]);
  }, [filteredMarket]);

  const exportPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(20);
      doc.text('AgriNova AI - Smart Farm Analytics Report', 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
      y += 15;

      doc.setFontSize(14);
      doc.text('Farm Health Score', 14, y); y += 8;
      doc.setFontSize(11);
      doc.text(`Score: ${farmHealth.score}/100 - ${farmHealth.label}`, 14, y); y += 6;
      doc.text(`Recommendation: ${farmHealth.recommendation}`, 14, y); y += 10;

      if (weather) {
        doc.setFontSize(14);
        doc.text('Weather Status', 14, y); y += 8;
        doc.setFontSize(11);
        doc.text(`Location: ${weather.location}`, 14, y); y += 6;
        doc.text(`Temperature: ${weather.temperature}C (Feels like ${weather.feelsLike}C)`, 14, y); y += 6;
        doc.text(`Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed} km/h | Rain: ${weather.rainChance}%`, 14, y); y += 6;
        doc.text(`UV Index: ${weather.uvIndex} | Pressure: ${weather.pressure} hPa`, 14, y); y += 10;
      }

      if (cropResult) {
        doc.setFontSize(14);
        doc.text('Crop Recommendation', 14, y); y += 8;
        doc.setFontSize(11);
        doc.text(`Crop: ${cropResult.crop} (Farming Score: ${farmingScore}/100)`, 14, y); y += 6;
        doc.text(`Expected Yield: ${cropResult.expectedYield}`, 14, y); y += 6;
        doc.text(`Profit Estimate: ${cropResult.profitEstimate}`, 14, y); y += 6;
        doc.text(`Water Requirement: ${cropResult.waterRequirement}`, 14, y); y += 6;
        doc.text(`Sowing: ${cropResult.sowingMonth} | Harvest: ${cropResult.harvestMonth}`, 14, y); y += 10;
      }

      if (aiInsights.length > 0) {
        doc.setFontSize(14);
        doc.text('AI Insights', 14, y); y += 8;
        doc.setFontSize(10);
        aiInsights.forEach((insight, i) => {
          doc.text(`${i + 1}. [${insight.priority}] ${insight.reason}`, 14, y); y += 5;
          doc.text(`   Action: ${insight.action}`, 14, y); y += 5;
          doc.text(`   Benefit: ${insight.benefit}`, 14, y); y += 8;
        });
      }

      doc.save('agrinova-analytics-report.pdf');
    });
  };

  const exportCropPDF = () => {
    if (!cropResult) return;
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(20);
      doc.text('AgriNova AI - Crop Recommendation', 14, y); y += 15;
      doc.setFontSize(12);
      doc.text(`Crop: ${cropResult.crop}`, 14, y); y += 8;
      doc.text(`Farming Score: ${farmingScore}/100`, 14, y); y += 8;
      doc.setFontSize(10);
      const fields: [string, string][] = [
        ['Expected Yield', cropResult.expectedYield],
        ['Profit Estimate', cropResult.profitEstimate],
        ['Growing Duration', cropResult.growingDuration],
        ['Water Requirement', cropResult.waterRequirement],
        ['Disease Risk', cropResult.diseaseRisk],
        ['Fertilizer', cropResult.fertilizer],
        ['Sowing Month', cropResult.sowingMonth || 'N/A'],
        ['Harvest Month', cropResult.harvestMonth || 'N/A'],
        ['Irrigation Schedule', cropResult.irrigationSchedule || 'N/A'],
        ['Market Demand', cropResult.marketDemand],
        ['Difficulty', cropResult.difficulty],
      ];
      fields.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, 14, y); y += 6;
      });
      y += 5;
      doc.setFontSize(9);
      const reasoning = doc.splitTextToSize(`Reasoning: ${cropResult.reasoning}`, 180);
      doc.text(reasoning, 14, y);
      doc.save('agrinova-crop-recommendation.pdf');
    });
  };

  const exportWeatherPDF = () => {
    if (!weather) return;
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(20);
      doc.text('AgriNova AI - Weather Report', 14, y); y += 15;
      doc.setFontSize(12);
      doc.text(`Location: ${weather.location}`, 14, y); y += 8;
      doc.text(`Temperature: ${weather.temperature}C`, 14, y); y += 8;
      doc.setFontSize(10);
      const fields: [string, string][] = [
        ['Feels Like', `${weather.feelsLike}C`],
        ['Description', weather.description],
        ['Humidity', `${weather.humidity}%`],
        ['Pressure', `${weather.pressure} hPa`],
        ['Wind Speed', `${weather.windSpeed} km/h`],
        ['Cloud Cover', `${weather.cloudCover}%`],
        ['Visibility', `${weather.visibility} km`],
        ['Rain Chance', `${weather.rainChance}%`],
        ['UV Index', String(weather.uvIndex)],
      ];
      fields.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, 14, y); y += 6;
      });
      y += 5;
      doc.setFontSize(12);
      doc.text('Smart Farming Advice:', 14, y); y += 8;
      doc.setFontSize(10);
      smartAdvice.forEach((tip) => {
        const lines = doc.splitTextToSize(`${tip.condition}: ${tip.advice}`, 180);
        doc.text(lines, 14, y); y += lines.length * 5 + 3;
      });
      doc.save('agrinova-weather-report.pdf');
    });
  };

  const printDashboard = () => window.print();

  // Chart data
  const tempChartData = weather ? {
    labels: ['Now'],
    datasets: [{ label: t('analytics.temperature'), data: [weather.temperature], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4 }],
  } : null;

  const humidityChartData = weather ? {
    labels: ['Now'],
    datasets: [{ label: t('weather.humidity'), data: [weather.humidity], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }],
  } : null;

  const marketChartData = filteredMarket.length > 0 ? {
    labels: filteredMarket.map(c => c.name.split(' ')[0]),
    datasets: [{ label: t('market.perQuintal'), data: filteredMarket.map(c => c.currentPrice), backgroundColor: '#10b981', borderRadius: 8 }],
  } : null;

  const cropRadarData = cropResult ? {
    labels: [t('crop.result.yield'), t('crop.result.profit'), t('crop.result.water'), t('crop.result.disease'), t('crop.result.marketDemand'), t('crop.result.difficulty')],
    datasets: [{ label: cropResult.crop, data: [85, 75, 70, 60, 95, 70], backgroundColor: 'rgba(16,185,129,0.2)', borderColor: '#10b981', borderWidth: 2 }],
  } : null;

  const overviewCards = [
    { icon: Heart, label: t('analytics.overview.health'), value: `${farmHealth.score}/100`, color: farmHealth.score >= 60 ? 'text-brand-600' : 'text-red-500', bg: 'bg-brand-50 dark:bg-forest-800/40' },
    { icon: Sun, label: t('analytics.overview.weather'), value: weather ? `${weather.temperature}°C` : '--', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: Target, label: t('analytics.overview.confidence'), value: cropResult ? `${farmingScore}%` : '--', color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-forest-800/40' },
    { icon: TrendingUp, label: t('analytics.overview.trend'), value: marketTrend === 'up' ? t('analytics.trend.bullish') : marketTrend === 'down' ? t('analytics.trend.bearish') : t('analytics.trend.neutral'), color: marketTrend === 'up' ? 'text-brand-600' : marketTrend === 'down' ? 'text-red-500' : 'text-amber-500', bg: 'bg-brand-50 dark:bg-forest-800/40' },
    { icon: AlertTriangle, label: t('analytics.overview.disease'), value: weather ? (weather.humidity >= 80 ? 'High' : weather.humidity >= 60 ? 'Medium' : 'Low') : '--', color: weather && weather.humidity >= 80 ? 'text-red-500' : 'text-amber-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { icon: Droplets, label: t('analytics.overview.irrigation'), value: weather ? (weather.rainChance >= 50 ? 'Low' : weather.rainChance >= 25 ? 'Medium' : 'High') : '--', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: BarChart3, label: t('analytics.overview.yield'), value: cropResult ? cropResult.expectedYield.split('–')[0] : '--', color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-forest-800/40' },
    { icon: Wallet, label: t('analytics.overview.profit'), value: cropResult ? cropResult.profitEstimate.split('–')[0] : '--', color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-forest-800/40' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">{t('analytics.title')}</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">{t('analytics.subtitle')}</p>
      </motion.div>

      {/* Location selector */}
      <GlassCard className="mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">{t('analytics.filter.state')}</label>
            <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }} className="glass-input w-full">
              <option value="">{t('common.selectState')}</option>
              {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">{t('analytics.filter.district')}</label>
            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedState} className="glass-input w-full disabled:opacity-50">
              <option value="">{t('common.selectDistrict')}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">{t('analytics.filter.crop')}</label>
            <input type="text" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} placeholder={t('analytics.allCrops')} className="glass-input w-full" />
          </div>
        </div>
        <button onClick={handleGenerateCrop} disabled={!selectedState || !selectedDistrict} className="btn-primary mt-4 disabled:opacity-50">
          <Sprout size={18} /> {t('crop.form.submit')}
        </button>
      </GlassCard>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Spinner size={40} />
        </div>
      ) : (
        <>
          {/* Overview cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {overviewCards.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="text-center">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mx-auto mb-3`}>
                    <card.icon className={card.color} size={24} />
                  </div>
                  <div className="text-2xl font-bold text-forest-800 dark:text-brand-50">{card.value}</div>
                  <div className="text-sm text-forest-500 dark:text-brand-200/60 mt-1">{card.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Weather Analytics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <GlassCard>
              <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4 flex items-center gap-2">
                <CloudRain className="text-brand-600 dark:text-brand-300" size={20} /> {t('analytics.weather.title')}
              </h3>
              {weather ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-forest-600 dark:text-brand-200 mb-2">{t('analytics.temp7day')}</div>
                    <div className="h-48">
                      <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-brand-500" /></div>}>
                        <Line data={tempChartData!} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                      </Suspense>
                    </div>
                    <p className="text-xs text-forest-400 mt-2">{t('analytics.currentOnly')}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-forest-600 dark:text-brand-200 mb-2">{t('analytics.humidityTrend')}</div>
                    <div className="h-48">
                      <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-brand-500" /></div>}>
                        <Line data={humidityChartData!} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                      </Suspense>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: t('analytics.rainfall'), value: `${weather.rainChance}%` },
                      { label: t('analytics.windSpeed'), value: `${weather.windSpeed} km/h` },
                      { label: t('analytics.uvIndex'), value: weather.uvIndex },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40 text-center">
                        <div className="text-lg font-bold text-forest-800 dark:text-brand-50">{item.value}</div>
                        <div className="text-xs text-forest-500 dark:text-brand-200/60">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-forest-500">{t('analytics.noData')}</p>
              )}
            </GlassCard>
          </motion.div>

          {/* Market Analytics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <GlassCard>
              <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4 flex items-center gap-2">
                <TrendingUp className="text-brand-600 dark:text-brand-300" size={20} /> {t('analytics.market.title')}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                {highestCrop && (
                  <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.highestCrop')}</div>
                    <div className="text-lg font-bold text-brand-700 dark:text-brand-300">{highestCrop.name}</div>
                    <div className="text-sm text-forest-600 dark:text-brand-200">₹{highestCrop.currentPrice}/qtl</div>
                  </div>
                )}
                {lowestCrop && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.lowestCrop')}</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">{lowestCrop.name}</div>
                    <div className="text-sm text-forest-600 dark:text-brand-200">₹{lowestCrop.currentPrice}/qtl</div>
                  </div>
                )}
              </div>
              {marketChartData && (
                <div className="h-64">
                  <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-brand-500" /></div>}>
                    <Bar data={marketChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </Suspense>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Crop Analytics */}
          {cropResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
              <GlassCard>
                <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4 flex items-center gap-2">
                  <Sprout className="text-brand-600 dark:text-brand-300" size={20} /> {t('analytics.crop.title')}: {cropResult.crop}
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="h-64">
                    {cropRadarData && (
                      <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-brand-500" /></div>}>
                        <Radar data={cropRadarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }} />
                      </Suspense>
                    )}
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: BarChart3, label: t('crop.result.yield'), value: cropResult.expectedYield },
                      { icon: Wallet, label: t('crop.result.profit'), value: cropResult.profitEstimate },
                      { icon: Clock, label: t('crop.result.duration'), value: cropResult.growingDuration },
                      { icon: Droplets, label: t('crop.result.water'), value: cropResult.waterRequirement },
                      { icon: AlertTriangle, label: t('crop.result.disease'), value: cropResult.diseaseRisk },
                      { icon: Beaker, label: t('crop.result.fertilizer'), value: cropResult.fertilizer },
                      { icon: Award, label: t('crop.result.marketDemand'), value: cropResult.marketDemand },
                      { icon: Leaf, label: t('crop.result.difficulty'), value: cropResult.difficulty },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                        <item.icon size={18} className="text-brand-600 dark:text-brand-300 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-forest-500 dark:text-brand-200/60">{item.label}</div>
                          <div className="text-sm font-semibold text-forest-700 dark:text-brand-100 truncate">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Smart Insights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
            <GlassCard>
              <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4 flex items-center gap-2">
                <LightbulbIcon /> {t('analytics.insights.title')}
              </h3>
              {aiInsights.length > 0 ? (
                <div className="space-y-3">
                  {aiInsights.map((insight, i) => (
                    <InsightCard key={i} insight={insight} delay={0.25 + i * 0.1} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-forest-500">{t('analytics.noData')}</p>
              )}
            </GlassCard>
          </motion.div>

          {/* District Analytics */}
          {selectedState && selectedDistrict && weather && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
              <GlassCard>
                <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4 flex items-center gap-2">
                  <MapPin className="text-brand-600 dark:text-brand-300" size={20} /> {t('analytics.district.title')}: {selectedDistrict}, {selectedState}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.recoWeather')}</div>
                    <div className="text-lg font-bold text-forest-800 dark:text-brand-50">{weather.temperature}°C, {weather.description}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.rainfallStatus')}</div>
                    <div className="text-lg font-bold text-forest-800 dark:text-brand-50">{weather.rainChance}% chance</div>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.temperature')}</div>
                    <div className="text-lg font-bold text-forest-800 dark:text-brand-50">{weather.temperature}°C (feels {weather.feelsLike}°C)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.marketDemand')}</div>
                    <div className="text-lg font-bold text-forest-800 dark:text-brand-50">{marketTrend === 'up' ? 'High' : marketTrend === 'down' ? 'Low' : 'Stable'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.irrigationAdvice')}</div>
                    <div className="text-lg font-bold text-forest-800 dark:text-brand-50">{weather.rainChance >= 50 ? 'Not needed' : weather.rainChance >= 25 ? 'Monitor' : 'Required'}</div>
                  </div>
                  {cropResult && (
                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                      <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.recoCrops')}</div>
                      <div className="text-lg font-bold text-forest-800 dark:text-brand-50">{cropResult.crop}</div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Export */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard>
              <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4 flex items-center gap-2">
                <Download className="text-brand-600 dark:text-brand-300" size={20} /> {t('analytics.export.title')}
              </h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={exportPDF} className="btn-primary"><FileText size={18} /> {t('analytics.export.pdf')}</button>
                <button onClick={exportCropPDF} disabled={!cropResult} className="btn-ghost disabled:opacity-50"><Sprout size={18} /> {t('analytics.export.cropPdf')}</button>
                <button onClick={exportWeatherPDF} disabled={!weather} className="btn-ghost disabled:opacity-50"><CloudRain size={18} /> {t('analytics.export.weatherPdf')}</button>
                <button onClick={printDashboard} className="btn-ghost"><Printer size={18} /> {t('analytics.export.print')}</button>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </div>
  );
}

function LightbulbIcon() {
  return <span className="text-2xl">💡</span>;
}

function InsightCard({ insight, delay }: { insight: AIInsight; delay: number }) {
  const { t } = useTranslation();
  const styles = {
    High: { border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    Medium: { border: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
    Low: { border: 'border-l-brand-500', bg: 'bg-brand-50 dark:bg-forest-800/40', text: 'text-brand-600 dark:text-brand-300' },
  };
  const s = styles[insight.priority];

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className={`p-4 rounded-xl border-l-4 ${s.border} ${s.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{insight.icon}</span>
        <span className={`text-xs font-bold uppercase ${s.text}`}>{t(`analytics.priority.${insight.priority.toLowerCase()}`)}</span>
      </div>
      <p className="text-sm font-semibold text-forest-700 dark:text-brand-100 mb-2">{insight.reason}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.action')}</div>
          <div className="text-sm text-forest-700 dark:text-brand-100">{insight.action}</div>
        </div>
        <div>
          <div className="text-xs text-forest-500 dark:text-brand-200/60">{t('analytics.benefit')}</div>
          <div className="text-sm text-forest-700 dark:text-brand-100">{insight.benefit}</div>
        </div>
      </div>
    </motion.div>
  );
}
