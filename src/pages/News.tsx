import { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Search, ExternalLink, Calendar } from 'lucide-react';
import { newsItems } from '@/services/data';
import { GlassCard } from '@/components/ui/GlassCard';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';

const categories = ['All', 'Policy', 'Research', 'Weather', 'Technology', 'Market'];

export function News() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const debounced = useDebounce(search, 200);

  const filtered = newsItems.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(debounced.toLowerCase()) || n.excerpt.toLowerCase().includes(debounced.toLowerCase());
    const matchesCat = category === 'All' || n.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Agriculture News</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Latest news and updates from the world of agriculture.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news..."
            className="glass-input w-full pl-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                category === cat
                  ? 'bg-brand-600 text-white'
                  : 'glass-soft text-forest-600 dark:text-brand-200 hover:bg-white/70 dark:hover:bg-forest-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((news, i) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard hover className="h-full flex flex-col !p-0 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="chip">{news.category}</span>
                  <span className="text-xs text-forest-400 flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(news.date)}
                  </span>
                </div>
                <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-2 leading-snug">{news.title}</h3>
                <p className="text-sm text-forest-500 dark:text-brand-200/60 leading-relaxed flex-1">{news.excerpt}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-forest-200/40 dark:border-brand-400/10">
                  <span className="text-xs text-forest-400">{news.source}</span>
                  <button className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:gap-2 transition-all">
                    Read More <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass p-10 text-center">
          <Newspaper className="mx-auto text-forest-300 mb-3" size={48} />
          <p className="text-forest-500 dark:text-brand-200/60">No news found matching your search.</p>
        </div>
      )}
    </div>
  );
}
