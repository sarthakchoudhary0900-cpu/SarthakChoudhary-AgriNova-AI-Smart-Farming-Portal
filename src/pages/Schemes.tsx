import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Landmark, CheckCircle2, FileText, Calendar, ExternalLink, Search, Award,
} from 'lucide-react';
import { govSchemes } from '@/services/data';
import { GlassCard } from '@/components/ui/GlassCard';
import { useDebounce } from '@/hooks/useDebounce';

export function Schemes() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 200);
  const filtered = govSchemes.filter((s) =>
    s.title.toLowerCase().includes(debounced.toLowerCase()) ||
    s.category.toLowerCase().includes(debounced.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Government Schemes</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Latest agriculture schemes with eligibility, benefits, and how to apply.</p>
      </motion.div>

      <div className="relative max-w-md mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search schemes..."
          className="glass-input w-full pl-11"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((scheme, i) => (
          <motion.div
            key={scheme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard hover className="h-full flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shrink-0">
                  <Landmark className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <span className="chip">{scheme.category}</span>
                  <h3 className="text-lg font-semibold text-forest-800 dark:text-brand-50 mt-2">{scheme.title}</h3>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-brand-600 dark:text-brand-300" />
                    <span className="text-sm font-semibold text-forest-700 dark:text-brand-100">Eligibility</span>
                  </div>
                  <p className="text-sm text-forest-600 dark:text-brand-200/70 leading-relaxed pl-6">{scheme.eligibility}</p>
                </div>

                <div className="p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={16} className="text-brand-600 dark:text-brand-300" />
                    <span className="text-sm font-semibold text-forest-700 dark:text-brand-100">Benefits</span>
                  </div>
                  <p className="text-sm text-forest-600 dark:text-brand-200/70 leading-relaxed pl-6">{scheme.benefits}</p>
                </div>

                <div className="p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-brand-600 dark:text-brand-300" />
                    <span className="text-sm font-semibold text-forest-700 dark:text-brand-100">Documents Required</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {scheme.documents.map((doc) => (
                      <span key={doc} className="text-xs px-2 py-0.5 rounded-md bg-brand-100 dark:bg-forest-700/40 text-forest-700 dark:text-brand-200">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Deadline: {scheme.deadline}</span>
                  </div>
                </div>
              </div>

              <a
                href={scheme.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full mt-4 !py-2.5 text-sm"
              >
                Apply Now <ExternalLink size={16} />
              </a>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass p-10 text-center">
          <Landmark className="mx-auto text-forest-300 mb-3" size={48} />
          <p className="text-forest-500 dark:text-brand-200/60">No schemes found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
