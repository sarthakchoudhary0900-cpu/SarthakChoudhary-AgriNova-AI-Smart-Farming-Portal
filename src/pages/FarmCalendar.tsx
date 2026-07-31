import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sprout, Droplets, FlaskConical, Scissors,
  AlertTriangle, ChevronLeft, ChevronRight, CloudRain,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { classNames } from '@/lib/utils';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthTasks: Record<number, { icon: LucideIcon; title: string; desc: string; type: string }[]> = {
  0: [
    { icon: Sprout, title: 'Rabi Sowing', desc: 'Complete wheat and mustard sowing', type: 'sowing' },
    { icon: Droplets, title: 'Irrigation', desc: 'Light irrigation for newly sown crops', type: 'irrigation' },
  ],
  1: [
    { icon: FlaskConical, title: 'Fertilizer Application', desc: 'Apply first nitrogen dose to wheat', type: 'fertilizer' },
    { icon: AlertTriangle, title: 'Weed Control', desc: 'Remove weeds from wheat fields', type: 'alert' },
  ],
  2: [
    { icon: FlaskConical, title: 'Second Fertilizer Dose', desc: 'Apply remaining nitrogen to wheat', type: 'fertilizer' },
    { icon: CloudRain, title: 'Weather Watch', desc: 'Monitor for unseasonal rain', type: 'alert' },
  ],
  3: [
    { icon: Scissors, title: 'Rabi Harvest', desc: 'Harvest wheat when grains mature', type: 'harvest' },
    { icon: Sprout, title: 'Land Preparation', desc: 'Prepare fields for Kharif crops', type: 'sowing' },
  ],
  4: [
    { icon: Sprout, title: 'Kharif Sowing', desc: 'Begin paddy and cotton sowing', type: 'sowing' },
    { icon: Droplets, title: 'Pre-monsoon Irrigation', desc: 'Ensure soil moisture for sowing', type: 'irrigation' },
  ],
  5: [
    { icon: Sprout, title: 'Continue Sowing', desc: 'Complete Kharif crop sowing', type: 'sowing' },
    { icon: CloudRain, title: 'Monsoon Arrival', desc: 'Monitor monsoon progress', type: 'alert' },
  ],
  6: [
    { icon: Droplets, title: 'Flood Watch', desc: 'Ensure drainage in paddy fields', type: 'alert' },
    { icon: FlaskConical, title: 'Fertilizer', desc: 'Apply basal dose to standing crops', type: 'fertilizer' },
  ],
  7: [
    { icon: FlaskConical, title: 'Top Dressing', desc: 'Apply nitrogen top dressing', type: 'fertilizer' },
    { icon: AlertTriangle, title: 'Pest Control', desc: 'Monitor for stem borer and leaf folder', type: 'alert' },
  ],
  8: [
    { icon: Scissors, title: 'Early Harvest', desc: 'Harvest early-maturing varieties', type: 'harvest' },
    { icon: AlertTriangle, title: 'Disease Watch', desc: 'Monitor for blast in paddy', type: 'alert' },
  ],
  9: [
    { icon: Scissors, title: 'Kharif Harvest', desc: 'Harvest paddy and cotton', type: 'harvest' },
    { icon: Sprout, title: 'Rabi Prep', desc: 'Prepare fields for Rabi sowing', type: 'sowing' },
  ],
  10: [
    { icon: Sprout, title: 'Rabi Sowing', desc: 'Sow wheat, mustard, and chickpea', type: 'sowing' },
    { icon: Droplets, title: 'Irrigation', desc: 'Light irrigation after sowing', type: 'irrigation' },
  ],
  11: [
    { icon: FlaskConical, title: 'Fertilizer', desc: 'First nitrogen dose to wheat', type: 'fertilizer' },
    { icon: AlertTriangle, title: 'Cold Protection', desc: 'Protect sensitive crops from frost', type: 'alert' },
  ],
};

const typeColors: Record<string, string> = {
  sowing: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  irrigation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  fertilizer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  harvest: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  alert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export function FarmCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const tasks = monthTasks[currentMonth] || [];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Farm Calendar</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Monthly farming activities with sowing, irrigation, fertilizer, and harvest reminders.</p>
      </motion.div>

      {/* Month selector */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentMonth((m) => (m - 1 + 12) % 12)} className="btn-ghost !p-3">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold font-display text-forest-800 dark:text-brand-50">{monthNames[currentMonth]}</h2>
          <p className="text-sm text-forest-500 dark:text-brand-200/60">{tasks.length} activities planned</p>
        </div>
        <button onClick={() => setCurrentMonth((m) => (m + 1) % 12)} className="btn-ghost !p-3">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <GlassCard className="mb-6">
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-forest-500 dark:text-brand-200/60 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: new Date(2025, currentMonth + 1, 0).getDate() }).map((_, i) => {
            const firstDay = new Date(2025, currentMonth, 1).getDay();
            const dayNum = i + 1;
            const hasTask = tasks.some((_, idx) => (dayNum % (idx + 3)) === 0);
            return (
              <div key={i} style={{ gridColumnStart: i === 0 ? firstDay + 1 : undefined }}>
                <div className={classNames(
                  'aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition',
                  hasTask
                    ? 'bg-brand-100 dark:bg-brand-900/40 text-forest-700 dark:text-brand-200 font-semibold'
                    : 'text-forest-500 dark:text-brand-200/40 hover:bg-brand-50 dark:hover:bg-forest-800/40'
                )}>
                  {dayNum}
                  {hasTask && <div className="w-1 h-1 rounded-full bg-brand-500 mt-0.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Tasks for month */}
      <div>
        <h3 className="text-xl font-semibold text-forest-800 dark:text-brand-50 mb-4">
          Activities for {monthNames[currentMonth]}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard hover className="flex items-start gap-4">
                <div className={classNames('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', typeColors[task.type])}>
                  <task.icon size={22} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-forest-800 dark:text-brand-50">{task.title}</h4>
                  <p className="text-sm text-forest-500 dark:text-brand-200/60 mt-1">{task.desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3">
        {[
          { label: 'Sowing', color: typeColors.sowing },
          { label: 'Irrigation', color: typeColors.irrigation },
          { label: 'Fertilizer', color: typeColors.fertilizer },
          { label: 'Harvest', color: typeColors.harvest },
          { label: 'Alerts', color: typeColors.alert },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={classNames('w-4 h-4 rounded-md', item.color)} />
            <span className="text-sm text-forest-600 dark:text-brand-200/70">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
