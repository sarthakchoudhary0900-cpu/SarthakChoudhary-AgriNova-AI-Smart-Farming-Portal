import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Sprout, Layers, Loader2, Leaf, Beaker, Clock, TrendingUp } from 'lucide-react';
import { soilTypes, cropNames } from '@/services/cropAdvisor';
import { GlassCard } from '@/components/ui/GlassCard';

const growthStages = ['Seedling', 'Vegetative', 'Flowering', 'Grain Filling', 'Maturity'];

export function Fertilizer() {
  const [form, setForm] = useState({ crop: '', stage: '', soil: '' });
  const [result, setResult] = useState<{ npk: string; organic: string; chemical: string; timing: string; tips: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(generateAdvice(form.crop, form.stage, form.soil));
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Fertilizer Advisor</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Get NPK, organic, and chemical fertilizer recommendations for your crop.</p>
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
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Growth Stage</label>
                <div className="relative">
                  <TrendingUp size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} required className="glass-input w-full pl-11 appearance-none">
                    <option value="">Select growth stage</option>
                    {growthStages.map((s) => <option key={s} value={s}>{s}</option>)}
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
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><FlaskConical size={18} /> Get Recommendation</>}
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
                  <p className="mt-4 text-forest-500 dark:text-brand-200/60">Preparing fertilizer plan...</p>
                </GlassCard>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-brand-600 flex items-center justify-center">
                      <FlaskConical className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest-800 dark:text-brand-50 text-lg">Fertilizer Plan</h3>
                      <p className="text-sm text-forest-500 dark:text-brand-200/60">{form.crop} • {form.stage} stage</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Beaker size={16} className="text-brand-600 dark:text-brand-300" />
                        <span className="text-sm font-semibold text-forest-700 dark:text-brand-100">NPK Recommendation</span>
                      </div>
                      <p className="text-sm text-forest-600 dark:text-brand-200/70 leading-relaxed pl-6">{result.npk}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Leaf size={16} className="text-brand-600 dark:text-brand-300" />
                        <span className="text-sm font-semibold text-forest-700 dark:text-brand-100">Organic Fertilizer</span>
                      </div>
                      <p className="text-sm text-forest-600 dark:text-brand-200/70 leading-relaxed pl-6">{result.organic}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FlaskConical size={16} className="text-brand-600 dark:text-brand-300" />
                        <span className="text-sm font-semibold text-forest-700 dark:text-brand-100">Chemical Fertilizer</span>
                      </div>
                      <p className="text-sm text-forest-600 dark:text-brand-200/70 leading-relaxed pl-6">{result.chemical}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={16} className="text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Application Timing</span>
                      </div>
                      <p className="text-sm text-forest-600 dark:text-brand-200/70 leading-relaxed pl-6">{result.timing}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-100/50 dark:bg-forest-800/60">
                      <span className="text-sm font-semibold text-forest-700 dark:text-brand-100">Additional Tips</span>
                      <ul className="mt-2 space-y-1.5">
                        {result.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-forest-600 dark:text-brand-200/70 flex items-start gap-2">
                            <span className="text-brand-500 shrink-0">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full flex flex-col items-center justify-center min-h-[300px] text-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-4">
                    <FlaskConical className="text-brand-500" size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-forest-700 dark:text-brand-100">Smart Fertilizer Planning</h3>
                  <p className="text-forest-500 dark:text-brand-200/60 mt-2 max-w-sm">
                    Get NPK ratios, organic alternatives, and precise application timing for your crop's growth stage.
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

function generateAdvice(crop: string, stage: string, soil: string) {
  const cropLower = crop.toLowerCase();
  const stageLower = stage.toLowerCase();

  let npk = 'NPK 100:50:50 kg/ha';
  let organic = 'Apply 10–15 tons FYM/compost per hectare before sowing.';
  let chemical = 'Urea 220 kg, DAP 110 kg, MOP 85 kg per hectare.';
  const timing = 'Apply 50% N + full P & K as basal, remaining N in 2 splits at tillering and flowering.';
  const tips = [
    'Conduct a soil test before applying fertilizers for accurate dosage.',
    'Apply fertilizers near the root zone for better absorption.',
    'Water the field after fertilizer application for proper nutrient release.',
  ];

  if (cropLower.includes('rice')) {
    npk = 'NPK 120:60:60 kg/ha + Zinc 25 kg/ha';
    organic = 'Apply 10 tons FYM or 2 tons vermicompost per hectare.';
    chemical = 'Urea 260 kg, DAP 130 kg, MOP 100 kg, Zinc Sulphate 25 kg/ha.';
    if (stageLower.includes('seedling')) tips.push('Apply basal dose before transplanting.');
    else if (stageLower.includes('vegetative')) tips.push('Apply first nitrogen top dressing at tillering stage.');
    else if (stageLower.includes('flowering')) tips.push('Apply final nitrogen dose at panicle initiation.');
  } else if (cropLower.includes('wheat')) {
    npk = 'NPK 120:60:40 kg/ha';
    organic = 'Apply 10–15 tons FYM/compost per hectare before sowing.';
    chemical = 'Urea 260 kg, DAP 130 kg, MOP 67 kg per hectare.';
    if (stageLower.includes('grain')) tips.push('Apply second nitrogen dose at grain filling for better grain weight.');
  } else if (cropLower.includes('cotton')) {
    npk = 'NPK 120:60:60 kg/ha';
    organic = 'Apply 10 tons FYM + 2 kg Azotobacter and PSB culture per hectare.';
    chemical = 'Urea 260 kg, DAP 130 kg, MOP 100 kg per hectare.';
    tips.push('Apply foliar spray of 2% urea at flowering for better boll set.');
  } else if (cropLower.includes('tomato') || cropLower.includes('potato')) {
    npk = 'NPK 100:50:50 kg/ha + FYM 20 tons/ha';
    organic = 'Apply 20 tons FYM + vermicompost 2 tons per hectare.';
    chemical = 'Urea 220 kg, DAP 110 kg, MOP 85 kg per hectare.';
    tips.push('Apply calcium and boron for fruit quality and disease resistance.');
  }

  if (soil.toLowerCase().includes('sandy')) tips.push('Sandy soil needs split doses — apply in 4–5 splits to reduce leaching.');
  if (soil.toLowerCase().includes('clay')) tips.push('Clay soil retains nutrients — reduce nitrogen dose by 10–15%.');

  return { npk, organic, chemical, timing, tips };
}
