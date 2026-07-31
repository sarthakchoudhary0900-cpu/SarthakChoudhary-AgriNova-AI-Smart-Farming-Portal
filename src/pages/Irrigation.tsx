import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Sprout, Layers, CloudRain, Loader2, Clock, Sun, Calendar } from 'lucide-react';
import { soilTypes, cropNames } from '@/services/cropAdvisor';
import { GlassCard } from '@/components/ui/GlassCard';

export function Irrigation() {
  const [form, setForm] = useState({ crop: '', soil: '', weather: '' });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(generateAdvice(form.crop, form.soil, form.weather));
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Irrigation Planner</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Get crop-specific irrigation recommendations based on soil and weather.</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard>
            <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-5">Enter Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Crop</label>
                <div className="relative">
                  <Sprout size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} required className="glass-input w-full pl-11 appearance-none">
                    <option value="">Select crop</option>
                    {cropNames.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Soil Type</label>
                <div className="relative">
                  <Layers size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <select value={form.soil} onChange={(e) => setForm({ ...form, soil: e.target.value })} required className="glass-input w-full pl-11 appearance-none">
                    <option value="">Select soil type</option>
                    {soilTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Current Weather</label>
                <div className="relative">
                  <CloudRain size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <select value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })} required className="glass-input w-full pl-11 appearance-none">
                    <option value="">Select weather</option>
                    <option value="hot-dry">Hot & Dry</option>
                    <option value="hot-humid">Hot & Humid</option>
                    <option value="moderate">Moderate</option>
                    <option value="cool">Cool</option>
                    <option value="rainy">Rainy / Overcast</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><Droplets size={18} /> Get Recommendation</>}
              </button>
            </form>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full flex flex-col items-center justify-center min-h-[300px]">
                  <Loader2 className="animate-spin text-brand-500" size={48} />
                  <p className="mt-4 text-forest-500 dark:text-brand-200/60">Calculating irrigation needs...</p>
                </GlassCard>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-brand-600 flex items-center justify-center">
                      <Droplets className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest-800 dark:text-brand-50 text-lg">Irrigation Plan</h3>
                      <p className="text-sm text-forest-500 dark:text-brand-200/60">{form.crop} • {form.soil} soil</p>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {result.split('\n').map((line, i) => line.trim() && (
                      <div key={i} className="flex items-start gap-2 mb-3 p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                        {line.startsWith('•') ? (
                          <Droplets size={16} className="text-brand-500 shrink-0 mt-0.5" />
                        ) : line.includes('Schedule') ? (
                          <Clock size={16} className="text-brand-500 shrink-0 mt-0.5" />
                        ) : line.includes('Tip') ? (
                          <Sun size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Calendar size={16} className="text-brand-500 shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm text-forest-700 dark:text-brand-100 leading-relaxed">{line.replace(/^[•]\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full flex flex-col items-center justify-center min-h-[300px] text-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-4">
                    <Droplets className="text-brand-500" size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-forest-700 dark:text-brand-100">Smart Irrigation Planning</h3>
                  <p className="text-forest-500 dark:text-brand-200/60 mt-2 max-w-sm">
                    Enter your crop, soil, and weather to get a personalized irrigation schedule that saves water and improves yield.
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function generateAdvice(crop: string, soil: string, weather: string): string {
  const cropLower = crop.toLowerCase();
  const soilLower = soil.toLowerCase();
  const weatherLower = weather.toLowerCase();

  let frequency = 'Every 5–7 days';
  let depth = '50mm per irrigation';
  let method = 'Furrow irrigation';
  let timing = 'Early morning (6–8 AM)';

  if (cropLower.includes('rice')) {
    frequency = 'Maintain 2–5cm standing water';
    depth = 'Continuous flooding until grain filling';
    method = 'Flood irrigation';
  } else if (cropLower.includes('cotton')) {
    frequency = 'Every 10–15 days';
    depth = '60mm per irrigation';
    method = 'Drip or furrow irrigation';
  } else if (cropLower.includes('wheat')) {
    frequency = '4–6 irrigations at critical stages';
    depth = '50mm per irrigation';
    method = 'Furrow or sprinkler';
  } else if (cropLower.includes('tomato') || cropLower.includes('potato')) {
    frequency = 'Every 7–10 days';
    depth = '30–40mm per irrigation';
    method = 'Drip irrigation recommended';
  }

  if (soilLower.includes('sandy')) {
    frequency = frequency.replace(/\d+–\d+|\d+/, (m) => {
      const n = parseInt(m);
      return String(Math.max(2, Math.floor(n / 2)));
    });
  } else if (soilLower.includes('clay')) {
    frequency = frequency.replace(/\d+–\d+|\d+/, (m) => {
      const n = parseInt(m);
      return String(n + 2);
    });
  }

  if (weatherLower.includes('hot') && weatherLower.includes('dry')) {
    frequency = 'Increase frequency — ' + frequency;
    timing = 'Early morning or late evening to reduce evaporation';
  } else if (weatherLower.includes('rainy')) {
    frequency = 'Skip irrigation if rain is expected — monitor soil moisture';
  } else if (weatherLower.includes('cool')) {
    frequency = 'Reduce frequency — ' + frequency;
  }

  return `Schedule: ${frequency}\nDepth: ${depth}\nMethod: ${method}\nBest Timing: ${timing}\n\n• Check soil moisture before irrigating — avoid overwatering\n• Use mulch to retain moisture and reduce evaporation\n• Tip: Install a rain gauge to track natural precipitation`;
}
