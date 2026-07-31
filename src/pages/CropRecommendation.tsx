import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout, MapPin, Calendar, Layers, Ruler, Droplets, Wallet, TrendingUp,
  Leaf, Clock, Beaker, AlertTriangle, Award, BarChart3, Loader2, Save, Check,
  Scissors, CloudRain, Target,
} from 'lucide-react';
import { recommendCrop, getFarmingScore, getTopCrops, seasons, soilTypes, waterLevels, budgetLevels } from '@/services/cropAdvisor';
import { fetchWeather, getLastLocation } from '@/services/weatherApi';
import { indianStates, districtsByState } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { CropRecResult, WeatherData } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';

interface FormState {
  state: string; district: string; season: string; soilType: string;
  farmSize: string; waterAvailability: string; budget: string;
  expectedInvestment: string; cropPreference: string;
}

export function CropRecommendation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>({ state: '', district: '', season: '', soilType: '', farmSize: '', waterAvailability: '', budget: '', expectedInvestment: '', cropPreference: '' });
  const [result, setResult] = useState<CropRecResult | null>(null);
  const [farmingScore, setFarmingScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [topCrops, setTopCrops] = useState<{ crop: string; score: number }[]>([]);

  const districts = form.state ? (districtsByState[form.state] || []) : [];

  // Load weather from last known location
  useEffect(() => {
    const last = getLastLocation();
    if (last) {
      (async () => {
        try {
          const w = await fetchWeather(last.lat, last.lon, last.name);
          setWeather(w);
        } catch { /* weather optional */ }
      })();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    // Fetch fresh weather if we have coordinates
    const last = getLastLocation();
    let liveWeather = weather;
    if (last) {
      try { liveWeather = await fetchWeather(last.lat, last.lon, last.name); setWeather(liveWeather); } catch { /* use existing */ }
    }
    await new Promise(r => setTimeout(r, 800));
    const rec = recommendCrop(form, liveWeather);
    const score = getFarmingScore(form, liveWeather);
    const top = getTopCrops(form, liveWeather, 3).map(s => ({ crop: s.crop.name, score: s.farmingScore }));
    setResult(rec);
    setFarmingScore(score);
    setTopCrops(top);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user || !result) return;
    const { error } = await supabase.from('crop_recommendations').insert({ inputs: form, result });
    if (error) { toast('Failed to save. Please try again.', 'error'); }
    else { toast('Recommendation saved to your profile!', 'success'); setSaved(true); }
  };

  const fields: { key: keyof FormState; label: string; icon: typeof MapPin; type: string; options?: string[]; placeholder: string }[] = [
    { key: 'state', label: 'State', icon: MapPin, type: 'select', options: indianStates, placeholder: 'Select your state' },
    { key: 'district', label: 'District', icon: MapPin, type: 'select', options: districts, placeholder: 'Select your district' },
    { key: 'season', label: 'Season', icon: Calendar, type: 'select', options: seasons, placeholder: 'Select season' },
    { key: 'soilType', label: 'Soil Type', icon: Layers, type: 'select', options: soilTypes, placeholder: 'Select soil type' },
    { key: 'farmSize', label: 'Farm Size', icon: Ruler, type: 'text', placeholder: 'e.g., 2 acres' },
    { key: 'waterAvailability', label: 'Water Availability', icon: Droplets, type: 'select', options: waterLevels, placeholder: 'Select water level' },
    { key: 'budget', label: 'Budget', icon: Wallet, type: 'select', options: budgetLevels, placeholder: 'Select budget' },
    { key: 'expectedInvestment', label: 'Expected Investment', icon: TrendingUp, type: 'text', placeholder: 'e.g., ₹1,00,000' },
    { key: 'cropPreference', label: 'Crop Preference (optional)', icon: Sprout, type: 'text', placeholder: 'e.g., Rice, Wheat, Cotton' },
  ];

  const scoreColor = farmingScore >= 80 ? '#10b981' : farmingScore >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 42;
  const scoreOffset = circumference - (circumference * farmingScore / 100);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Smart Crop Recommendation</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">AI-powered crop suggestions with Farming Score, yield, profit, and irrigation schedule.</p>
        {weather && <p className="text-xs text-forest-400 mt-1">Using live weather: {weather.temperature}°C, {weather.humidity}% humidity, {weather.rainChance}% rain chance — {weather.location}</p>}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard>
            <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-5">Enter Your Farm Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">{field.label}</label>
                  <div className="relative">
                    <field.icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
                    {field.type === 'select' ? (
                      <select value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} required={field.key !== 'cropPreference' && field.key !== 'district'} disabled={field.key === 'district' && !form.state} className="glass-input w-full pl-11 appearance-none disabled:opacity-50">
                        <option value="">{field.placeholder}</option>
                        {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.placeholder} required={field.key !== 'cropPreference'} className="glass-input w-full pl-11" />
                    )}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><Sprout size={18} /> Get Recommendation</>}
              </button>
            </form>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full flex flex-col items-center justify-center min-h-[400px]">
                  <Loader2 className="animate-spin text-brand-500" size={48} />
                  <p className="mt-4 text-forest-500 dark:text-brand-200/60">Analyzing your farm conditions with live weather data...</p>
                </GlassCard>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="chip mb-2"><Award size={12} /> Recommended Crop</div>
                      <h3 className="text-2xl font-bold font-display text-forest-800 dark:text-brand-50">{result.crop}</h3>
                    </div>
                    {user && <button onClick={handleSave} disabled={saved} className={`btn-ghost !py-2 !px-4 text-sm ${saved ? '!text-brand-600' : ''}`}>{saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save</>}</button>}
                  </div>

                  <div className="flex gap-4 mb-5">
                    <div className="rounded-2xl overflow-hidden h-48 flex-1">
                      <img src={result.image} alt={result.crop} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-32 flex flex-col items-center justify-center bg-brand-50 dark:bg-forest-800/40 rounded-2xl p-3">
                      <div className="relative w-24 h-24">
                        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="8" />
                          <motion.circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: scoreOffset }} transition={{ duration: 1.5, ease: 'easeOut' }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold font-display" style={{ color: scoreColor }}>{farmingScore}</span>
                          <span className="text-xs text-forest-500">/ 100</span>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-forest-600 dark:text-brand-200 mt-1 text-center">Farming Score</div>
                    </div>
                  </div>

                  {topCrops.length > 1 && (
                    <div className="mb-4 p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                      <div className="text-xs font-semibold text-forest-500 dark:text-brand-200/60 mb-2">Top 3 Recommended Crops</div>
                      <div className="flex flex-wrap gap-2">
                        {topCrops.map((c, i) => (
                          <span key={i} className={`chip !text-xs ${i === 0 ? '!bg-brand-600 !text-white' : ''}`}>{c.crop}: {c.score}/100</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { icon: BarChart3, label: 'Expected Yield', value: result.expectedYield },
                      { icon: TrendingUp, label: 'Profit Estimate', value: result.profitEstimate },
                      { icon: Clock, label: 'Growing Duration', value: result.growingDuration },
                      { icon: Droplets, label: 'Water Requirement', value: result.waterRequirement },
                      { icon: AlertTriangle, label: 'Disease Risk', value: result.diseaseRisk },
                      { icon: Beaker, label: 'Fertilizer', value: result.fertilizer },
                      { icon: Calendar, label: 'Sowing Month', value: result.sowingMonth || '—' },
                      { icon: Scissors, label: 'Harvest Month', value: result.harvestMonth || '—' },
                      { icon: Leaf, label: 'Harvest Time', value: result.harvestTime },
                      { icon: Award, label: 'Market Demand', value: result.marketDemand },
                      { icon: CloudRain, label: 'Irrigation Schedule', value: result.irrigationSchedule || '—' },
                      { icon: Target, label: 'Difficulty', value: result.difficulty },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                        <div className="flex items-center gap-2 mb-1"><item.icon size={14} className="text-brand-600 dark:text-brand-300" /><span className="text-xs text-forest-500 dark:text-brand-200/60">{item.label}</span></div>
                        <div className="text-sm font-semibold text-forest-700 dark:text-brand-100">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-brand-100/50 dark:bg-forest-800/60">
                    <div className="flex items-start gap-2"><Sprout className="text-brand-600 dark:text-brand-300 shrink-0 mt-0.5" size={18} /><div className="text-sm text-forest-700 dark:text-brand-100 leading-relaxed whitespace-pre-line">{result.reasoning}</div></div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-4"><Sprout className="text-brand-500" size={40} /></div>
                  <h3 className="text-xl font-semibold text-forest-700 dark:text-brand-100">Ready to find your best crop?</h3>
                  <p className="text-forest-500 dark:text-brand-200/60 mt-2 max-w-sm">Fill in your farm details and our AI will recommend the most suitable crop with a Farming Score, yield, profit, and irrigation schedule — using live weather data.</p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
