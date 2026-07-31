import { motion } from 'framer-motion';
import { Sprout, Target, Eye, Cpu, Users, Award, Leaf, Bot } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionTitle } from '@/components/ui/SectionTitle';

const team = [
  { name: 'Arjun Sharma', role: 'CEO & Founder', photo: 'https://images.pexels.com/photos/11688197/pexels-photo-11688197.jpeg?auto=compress&cs=tinysrgb&w=200', bio: 'Third-generation farmer turned agritech entrepreneur.' },
  { name: 'Dr. Priya Reddy', role: 'Chief Agronomist', photo: 'https://images.pexels.com/photos/11070641/pexels-photo-11070641.jpeg?auto=compress&cs=tinysrgb&w=200', bio: 'PhD in Agricultural Sciences with 15 years of field experience.' },
  { name: 'Vikram Singh', role: 'AI Engineer', photo: 'https://images.pexels.com/photos/35184089/pexels-photo-35184089.jpeg?auto=compress&cs=tinysrgb&w=200', bio: 'ML specialist focused on computer vision for plant disease detection.' },
  { name: 'Anita Patel', role: 'Product Designer', photo: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200', bio: 'Designs intuitive interfaces that work for farmers of all tech levels.' },
];

export function About() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shadow-glow mx-auto mb-6">
          <Sprout className="text-white" size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-forest-800 dark:text-brand-50">About AgriNova AI</h1>
        <p className="text-lg text-forest-500 dark:text-brand-200/60 mt-4 max-w-3xl mx-auto">
          We're on a mission to empower every farmer with AI-driven insights, making smart farming accessible to all.
        </p>
      </motion.div>

      {/* Mission & Vision */}
      <div className="grid gap-6 md:grid-cols-2 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard className="h-full">
            <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-4">
              <Target className="text-brand-600 dark:text-brand-300" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-forest-800 dark:text-brand-50 mb-3">Our Mission</h3>
            <p className="text-forest-600 dark:text-brand-200/70 leading-relaxed">
              To democratize smart farming technology by providing every farmer — regardless of farm size or tech literacy — with access to real-time weather, AI crop recommendations, disease detection, and market intelligence. We believe technology should serve the farmer, not the other way around.
            </p>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard className="h-full">
            <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-4">
              <Eye className="text-brand-600 dark:text-brand-300" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-forest-800 dark:text-brand-50 mb-3">Our Vision</h3>
            <p className="text-forest-600 dark:text-brand-200/70 leading-relaxed">
              A future where every Indian farm is a smart farm — where data-driven decisions replace guesswork, where farmers get fair prices through transparent markets, and where sustainable practices are the norm, not the exception. We envision a thriving agricultural ecosystem powered by AI and built for farmers.
            </p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Technology */}
      <section className="mb-12">
        <SectionTitle title="Our Technology" subtitle="Built with cutting-edge AI and modern web technologies." centered />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Bot, title: 'AI & Machine Learning', desc: 'Gemini-powered assistant and computer vision for disease detection, trained on Indian crop data.' },
            { icon: Cpu, title: 'Real-Time Data', desc: 'Live weather from Open-Meteo API and market prices from major APMC markets across India.' },
            { icon: Leaf, title: 'Sustainable Focus', desc: 'Organic-first recommendations that prioritize soil health and environmental sustainability.' },
          ].map((tech, i) => (
            <motion.div key={tech.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center mx-auto mb-4">
                  <tech.icon className="text-white" size={28} />
                </div>
                <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-2">{tech.title}</h3>
                <p className="text-sm text-forest-500 dark:text-brand-200/60 leading-relaxed">{tech.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-12">
        <SectionTitle title="Our Team" subtitle="The people behind AgriNova AI." centered />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard hover className="text-center h-full">
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4">
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-forest-800 dark:text-brand-50">{member.name}</h3>
                <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-2">{member.role}</p>
                <p className="text-xs text-forest-500 dark:text-brand-200/60 leading-relaxed">{member.bio}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { icon: Users, value: '1,000+', label: 'Active Farmers' },
            { icon: Sprout, value: '50+', label: 'Crops Tracked' },
            { icon: Award, value: '15+', label: 'States Covered' },
            { icon: Leaf, value: '100%', label: 'AI Powered' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="text-center">
                <stat.icon size={28} className="text-brand-600 dark:text-brand-300 mx-auto mb-2" />
                <div className="text-2xl font-bold font-display text-forest-800 dark:text-brand-50">{stat.value}</div>
                <div className="text-sm text-forest-500 dark:text-brand-200/60">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
