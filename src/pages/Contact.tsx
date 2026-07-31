import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, User, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { GlassCard } from '@/components/ui/GlassCard';

export function Contact() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      user_id: user?.id ?? null,
    });
    setLoading(false);
    if (error) {
      toast('Failed to send message. Please try again.', 'error');
    } else {
      toast('Message sent! We will get back to you soon.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Contact Us</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2 max-w-2xl mx-auto">
          Have a question or feedback? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: Mail, title: 'Email', value: 'support@agrinova.ai', desc: 'We reply within 24 hours' },
            { icon: Phone, title: 'Phone', value: '1800-180-1551', desc: 'Toll free, Mon–Sat 9AM–6PM' },
            { icon: MapPin, title: 'Office', value: 'Krishi Bhavan, New Delhi', desc: 'India 110001' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shrink-0">
                  <item.icon className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-forest-800 dark:text-brand-50">{item.title}</h3>
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400">{item.value}</p>
                  <p className="text-xs text-forest-500 dark:text-brand-200/50 mt-0.5">{item.desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
          <GlassCard>
            <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-5">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className="glass-input w-full pl-11"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className="glass-input w-full pl-11"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Subject</label>
                <div className="relative">
                  <MessageSquare size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="What is this about?"
                    required
                    className="glass-input w-full pl-11"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us more..."
                  required
                  rows={5}
                  className="glass-input w-full resize-none"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Sending...</> : <><Send size={18} /> Send Message</>}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
