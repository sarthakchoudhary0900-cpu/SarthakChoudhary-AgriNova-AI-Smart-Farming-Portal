import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon, Sprout, ScanLine, Landmark, TrendingUp, Newspaper, CloudRain, MapPin,
  ArrowRight, X,
} from 'lucide-react';
import { marketPrices, govSchemes, newsItems } from '@/services/data';
import { cropNames } from '@/services/cropAdvisor';
import { allDiseaseNames } from '@/services/diseaseApi';
import { indianStates, districtsByState } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { LucideIcon } from 'lucide-react';

interface SearchResult {
  type: string;
  title: string;
  desc: string;
  to: string;
  icon: LucideIcon;
}

const categories = [
  { key: 'all', label: 'All', icon: SearchIcon },
  { key: 'crop', label: 'Crops', icon: Sprout },
  { key: 'disease', label: 'Diseases', icon: ScanLine },
  { key: 'state', label: 'States & Districts', icon: MapPin },
  { key: 'scheme', label: 'Schemes', icon: Landmark },
  { key: 'market', label: 'Market', icon: TrendingUp },
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'weather', label: 'Weather', icon: CloudRain },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState('all');
  const debounced = useDebounce(query, 200);

  useEffect(() => { setQuery(params.get('q') || ''); }, [params]);

  useEffect(() => {
    if (debounced && user) {
      supabase.from('search_history').insert({ user_id: user.id, query: debounced, category }).then(() => {});
    }
  }, [debounced, user, category]);

  const results: SearchResult[] = [];

  if (debounced) {
    const q = debounced.toLowerCase();

    if (category === 'all' || category === 'crop') {
      cropNames.forEach((crop) => {
        if (crop.toLowerCase().includes(q)) {
          results.push({ type: 'Crop', title: crop, desc: 'View crop recommendation and growing guide', to: '/crop-recommendation', icon: Sprout });
        }
      });
    }

    if (category === 'all' || category === 'disease') {
      allDiseaseNames.forEach((disease: string) => {
        if (disease.toLowerCase().includes(q)) {
          results.push({ type: 'Disease', title: disease, desc: 'View symptoms, treatment, and prevention', to: '/disease-detection', icon: ScanLine });
        }
      });
    }

    if (category === 'all' || category === 'state') {
      indianStates.forEach((state) => {
        if (state.toLowerCase().includes(q)) {
          results.push({ type: 'State', title: state, desc: `View districts and crop recommendations for ${state}`, to: '/crop-recommendation', icon: MapPin });
        }
        const districts = districtsByState[state] || [];
        districts.forEach((district) => {
          if (district.toLowerCase().includes(q)) {
            results.push({ type: 'District', title: `${district}, ${state}`, desc: `View crop recommendations for ${district}`, to: '/crop-recommendation', icon: MapPin });
          }
        });
      });
    }

    if (category === 'all' || category === 'market') {
      marketPrices.forEach((crop) => {
        if (crop.name.toLowerCase().includes(q)) {
          results.push({ type: 'Market', title: crop.name, desc: `₹${crop.currentPrice}/qtl — Best market: ${crop.bestMarket}`, to: '/market-prices', icon: TrendingUp });
        }
      });
    }

    if (category === 'all' || category === 'scheme') {
      govSchemes.forEach((scheme) => {
        if (scheme.title.toLowerCase().includes(q) || scheme.category.toLowerCase().includes(q)) {
          results.push({ type: 'Scheme', title: scheme.title, desc: scheme.benefits, to: '/schemes', icon: Landmark });
        }
      });
    }

    if (category === 'all' || category === 'news') {
      newsItems.forEach((news) => {
        if (news.title.toLowerCase().includes(q) || news.excerpt.toLowerCase().includes(q)) {
          results.push({ type: 'News', title: news.title, desc: news.excerpt, to: '/news', icon: Newspaper });
        }
      });
    }

    if ((category === 'all' || category === 'weather') && ('weather'.includes(q) || 'rain'.includes(q) || 'temperature'.includes(q) || 'humidity'.includes(q) || 'forecast'.includes(q))) {
      results.push({ type: 'Weather', title: 'Weather Forecast', desc: 'Check real-time weather and farming advice', to: '/weather', icon: CloudRain });
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Search</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Search across crops, diseases, states, districts, schemes, market, news, and weather.</p>
      </motion.div>

      <div className="relative mb-6">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-400" />
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setParams({ q: e.target.value }); }} placeholder="Search everything..." autoFocus className="glass-input w-full pl-12 pr-12 !py-4 text-lg" />
        {query && <button onClick={() => { setQuery(''); setParams({}); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"><X size={20} /></button>}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((cat) => (
          <button key={cat.key} onClick={() => setCategory(cat.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${category === cat.key ? 'bg-brand-600 text-white' : 'glass-soft text-forest-600 dark:text-brand-200 hover:bg-white/70 dark:hover:bg-forest-800/60'}`}>
            <cat.icon size={16} /> {cat.label}
          </button>
        ))}
      </div>

      {debounced ? (
        <div>
          <p className="text-sm text-forest-500 dark:text-brand-200/60 mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for "{debounced}"</p>
          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((result, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={result.to}>
                    <GlassCard hover className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0"><result.icon className="text-brand-600 dark:text-brand-300" size={22} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className="chip !text-xs">{result.type}</span></div>
                        <h3 className="font-semibold text-forest-800 dark:text-brand-50 mt-1 truncate">{result.title}</h3>
                        <p className="text-sm text-forest-500 dark:text-brand-200/60 truncate">{result.desc}</p>
                      </div>
                      <ArrowRight size={18} className="text-brand-500 shrink-0" />
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass p-10 text-center">
              <SearchIcon className="mx-auto text-forest-300 mb-3" size={48} />
              <p className="text-forest-500 dark:text-brand-200/60">No results found for "{debounced}"</p>
              <p className="text-sm text-forest-400 mt-1">Try a different search term or category.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass p-10 text-center">
          <SearchIcon className="mx-auto text-forest-300 mb-3" size={48} />
          <p className="text-forest-500 dark:text-brand-200/60">Start typing to search across the entire portal.</p>
        </div>
      )}
    </div>
  );
}
