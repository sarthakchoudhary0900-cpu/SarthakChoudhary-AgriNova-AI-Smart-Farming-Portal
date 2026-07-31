import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CloudRain, Droplets, Bug, TrendingUp, Calendar, FlaskConical,
  ShieldCheck, Zap, Sun, Wind, Lightbulb,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { LucideIcon } from 'lucide-react';

interface Problem {
  icon: LucideIcon;
  problem: string;
  solution: string;
  benefits: string[];
  example: string;
  color: string;
}

const problems: Problem[] = [
  {
    icon: CloudRain,
    problem: 'Farmer irrigates the field before a rainstorm, wasting water and electricity.',
    solution: 'AI detects rain probability from live weather data and warns the farmer in advance.',
    benefits: ['Water saved', 'Electricity saved', 'Prevents waterlogging', 'Reduces fertilizer runoff'],
    example: 'Rain tomorrow (85% chance). Do not irrigate today. Water saved: 50,000 liters/hectare.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Bug,
    problem: 'Fungal diseases spread rapidly in high humidity, destroying crops before the farmer notices.',
    solution: 'Weather-based disease risk monitoring alerts farmers when humidity favors fungal growth.',
    benefits: ['Early detection', 'Reduced crop loss', 'Lower fungicide cost', 'Higher yield'],
    example: 'Humidity above 80%. Watch for fungal diseases. Inspect crops every morning.',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: TrendingUp,
    problem: 'Farmer sells produce at low prices because they do not know market trends.',
    solution: 'Live market price tracking with weekly and monthly trend charts helps time the sale.',
    benefits: ['Better selling price', '12-15% higher income', 'Informed decisions', 'No middleman dependency'],
    example: 'Tomato prices rising 8% this week. Consider selling within 3-5 days for maximum profit.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Sun,
    problem: 'Heat waves above 38°C damage crops because farmers do not adjust irrigation timing.',
    solution: 'Temperature alerts recommend early morning irrigation to reduce evaporation losses.',
    benefits: ['Reduced heat stress', 'Water efficiency', 'Crop protection', 'Better yield'],
    example: 'Temperature above 38°C. Water crops early morning (6-8 AM). Provide shade for sensitive plants.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: Calendar,
    problem: 'Farmers plant crops at the wrong time, leading to poor yield and wasted investment.',
    solution: 'AI crop recommendation analyzes soil, season, water, and budget to suggest the right crop and sowing month.',
    benefits: ['Higher yield', 'Lower risk', 'Optimal resource use', 'Better profit'],
    example: 'For your soil and water availability, Wheat is recommended. Sowing: November. Farming Score: 82/100.',
    color: 'from-brand-500 to-forest-600',
  },
  {
    icon: FlaskConical,
    problem: 'Farmers apply too much or too little fertilizer, wasting money and harming soil health.',
    solution: 'Crop-specific fertilizer advisor calculates exact NPK and organic doses based on growth stage.',
    benefits: ['Saves money', 'Protects soil', 'Higher yield', 'Environmental safety'],
    example: 'For Wheat at tillering stage: Apply 50% N + full P & K as basal, remaining N in 2 splits.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Wind,
    problem: 'Pesticide spraying during strong winds causes drift, wasting chemicals and harming nearby crops.',
    solution: 'Wind speed monitoring delays spraying recommendations when conditions are unsafe.',
    benefits: ['Chemical savings', 'No drift damage', 'Worker safety', 'Environmental protection'],
    example: 'Strong wind (32 km/h). Delay pesticide spraying. Stake tall crops and protect seedlings.',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: Droplets,
    problem: 'Over-irrigation wastes water and leaches nutrients, while under-irrigation stresses crops.',
    solution: 'Smart irrigation planner uses soil type, crop, and weather to recommend exact water needs and timing.',
    benefits: ['Water saved', 'Nutrient retention', 'Higher yield', 'Lower electricity cost'],
    example: 'For Rice in clay soil: Maintain 2-5cm standing water. Irrigate every 3-5 days. 1,200mm total.',
    color: 'from-blue-500 to-indigo-600',
  },
];

export function WhySmart() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">{t('smart.title')}</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">{t('smart.subtitle')}</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {problems.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0 shadow-glow`}>
                  <p.icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <div className="chip mb-2">{t('smart.problem')}</div>
                  <p className="text-sm text-forest-700 dark:text-brand-100 leading-relaxed">{p.problem}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40 mb-4">
                <Lightbulb className="text-brand-600 dark:text-brand-300 shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="text-xs font-semibold text-brand-600 dark:text-brand-300 uppercase mb-1">{t('smart.solution')}</div>
                  <p className="text-sm text-forest-700 dark:text-brand-100 leading-relaxed">{p.solution}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-semibold text-forest-500 dark:text-brand-200/60 uppercase mb-2">{t('smart.benefits')}</div>
                <div className="flex flex-wrap gap-2">
                  {p.benefits.map((b, j) => (
                    <span key={j} className="chip !text-xs flex items-center gap-1">
                      <ShieldCheck size={10} /> {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500">
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">{t('smart.example')}</div>
                <p className="text-sm text-forest-700 dark:text-brand-100 leading-relaxed">{p.example}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-10">
        <GlassCard className="bg-gradient-to-br from-brand-600 to-forest-700 !border-0 text-white text-center">
          <Zap className="mx-auto text-brand-200 mb-4" size={48} />
          <h3 className="text-2xl font-bold font-display mb-3">8 Real Problems. One Smart Solution.</h3>
          <p className="text-brand-100/80 max-w-2xl mx-auto leading-relaxed">
            AgriNova AI combines live weather data, AI crop intelligence, market tracking, and disease monitoring to solve the everyday problems Indian farmers face — all in one portal.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
