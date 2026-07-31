import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, TrendingDown, MapPin, BarChart3, ArrowUp, ArrowDown, Search, Clock,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { marketPrices, marketStates } from '@/services/data';
import { GlassCard } from '@/components/ui/GlassCard';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type TrendType = 'weekly' | 'monthly';
type SortBy = 'name' | 'price' | 'change';

export function MarketPrices() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [trendType, setTrendType] = useState<TrendType>('weekly');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    let result = marketPrices.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesState = stateFilter === 'All' || c.state === stateFilter;
      return matchesSearch && matchesState;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return b.currentPrice - a.currentPrice;
      const changeA = ((a.currentPrice - a.yesterdayPrice) / a.yesterdayPrice) * 100;
      const changeB = ((b.currentPrice - b.yesterdayPrice) / b.yesterdayPrice) * 100;
      return changeB - changeA;
    });

    return result;
  }, [debouncedSearch, stateFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">{t('market.title')}</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">{t('market.subtitle')}</p>
      </motion.div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('market.searchPlaceholder')} className="glass-input w-full pl-11" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="glass-input lg:w-48">
          <option value="name">{t('market.sort.name')}</option>
          <option value="price">{t('market.sort.price')}</option>
          <option value="change">{t('market.sort.change')}</option>
        </select>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {marketStates.map((state) => (
            <button key={state} onClick={() => setStateFilter(state)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${stateFilter === state ? 'bg-brand-600 text-white' : 'glass-soft text-forest-600 dark:text-brand-200 hover:bg-white/70 dark:hover:bg-forest-800/60'}`}>{state}</button>
          ))}
        </div>
      </div>

      {/* Trend toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTrendType('weekly')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${trendType === 'weekly' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'glass-soft text-forest-500'}`}>{t('market.weekly')}</button>
        <button onClick={() => setTrendType('monthly')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${trendType === 'monthly' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'glass-soft text-forest-500'}`}>{t('market.monthly')}</button>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((crop, i) => {
          const diff = crop.currentPrice - crop.yesterdayPrice;
          const up = diff >= 0;
          const changePercent = ((diff / crop.yesterdayPrice) * 100).toFixed(1);
          const trendData = trendType === 'weekly' ? crop.weeklyTrend : crop.monthlyTrend;
          const labels = trendType === 'weekly' ? crop.weeklyTrend.map((_, idx) => `D${idx + 1}`) : crop.monthlyTrend.map((_, idx) => `D${idx + 1}`);

          return (
            <motion.div key={crop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <img src={crop.image} alt={crop.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-forest-800 dark:text-brand-50">{crop.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 dark:text-brand-200/50"><MapPin size={12} /> {crop.bestMarket}</div>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold ${up ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {up ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {Math.abs(parseFloat(changePercent))}%
                  </div>
                </div>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold font-display text-forest-800 dark:text-brand-50">₹{crop.currentPrice.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-forest-400">{t('market.perQuintal')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-forest-400">{t('market.yesterday')}</div>
                    <div className="text-sm font-medium text-forest-600 dark:text-brand-200">₹{crop.yesterdayPrice.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="h-32 mb-4">
                  <Line
                    data={{ labels, datasets: [{ data: trendData, borderColor: up ? '#10b981' : '#ef4444', backgroundColor: up ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { display: false }, y: { display: false } } }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-forest-800/40 text-center">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60 flex items-center justify-center gap-1"><TrendingUp size={12} /> {t('market.highest')}</div>
                    <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">₹{crop.highestPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                    <div className="text-xs text-forest-500 dark:text-brand-200/60 flex items-center justify-center gap-1"><TrendingDown size={12} /> {t('market.lowest')}</div>
                    <div className="text-sm font-semibold text-red-600 dark:text-red-400">₹{crop.lowestPrice.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Last updated */}
                <div className="flex items-center gap-1.5 text-xs text-forest-400 dark:text-brand-200/40">
                  <Clock size={12} /> {t('market.lastUpdated')}: {formatDate(crop.lastUpdated)}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass p-10 text-center">
          <BarChart3 className="mx-auto text-forest-300 mb-3" size={48} />
          <p className="text-forest-500 dark:text-brand-200/60">{t('market.noResults')} "{search}"</p>
        </div>
      )}
    </div>
  );
}
