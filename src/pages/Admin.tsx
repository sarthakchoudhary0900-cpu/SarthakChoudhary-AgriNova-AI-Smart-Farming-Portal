import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Landmark, Newspaper, Sprout, Mail, Trash2, Plus, Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { govSchemes, newsItems, marketPrices } from '@/services/data';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatDate } from '@/lib/utils';

export function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [messages, setMessages] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState({ title: '', body: '', category: 'general' });

  useEffect(() => {
    (async () => {
      const { data: msgs } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(50);
      if (msgs) setMessages(msgs);
      if (user) {
        const { data: ns } = await supabase.from('admin_notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (ns) setNotes(ns);
      }
    })();
  }, [user]);

  const addNote = async () => {
    if (!user || !newNote.title) return;
    const { data, error } = await supabase.from('admin_notes').insert({ ...newNote, user_id: user.id }).select().maybeSingle();
    if (error) {
      toast('Failed to add note.', 'error');
    } else if (data) {
      setNotes([data, ...notes]);
      setNewNote({ title: '', body: '', category: 'general' });
      toast('Note added.', 'success');
    }
  };

  const deleteNote = async (id: string) => {
    await supabase.from('admin_notes').delete().eq('id', id);
    setNotes(notes.filter((n) => n.id !== id));
    toast('Note deleted.', 'info');
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id);
    setMessages(messages.filter((m) => m.id !== id));
    toast('Message deleted.', 'info');
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'messages', label: 'Messages', icon: Mail },
    { key: 'schemes', label: 'Schemes', icon: Landmark },
    { key: 'news', label: 'News', icon: Newspaper },
    { key: 'crops', label: 'Crop Data', icon: Sprout },
    { key: 'notes', label: 'Notes', icon: Plus },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Admin Panel</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Manage users, content, and messages.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              tab === t.key
                ? 'bg-brand-600 text-white'
                : 'glass-soft text-forest-600 dark:text-brand-200 hover:bg-white/70 dark:hover:bg-forest-800/60'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { icon: Users, label: 'Users', value: '1,000+', color: 'text-brand-600' },
            { icon: Landmark, label: 'Schemes', value: govSchemes.length, color: 'text-amber-600' },
            { icon: Newspaper, label: 'News Articles', value: newsItems.length, color: 'text-blue-600' },
            { icon: Sprout, label: 'Crops Tracked', value: marketPrices.length, color: 'text-forest-600' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="text-center">
                <stat.icon size={28} className={`mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold font-display text-forest-800 dark:text-brand-50">{stat.value}</div>
                <div className="text-sm text-forest-500 dark:text-brand-200/60">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'messages' && (
        <div className="space-y-4">
          {messages.length > 0 ? messages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-brand-600 dark:text-brand-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-forest-800 dark:text-brand-50">{msg.name}</span>
                    <span className="text-xs text-forest-400">{msg.email}</span>
                    <span className="text-xs text-forest-400">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mt-1">{msg.subject}</p>
                  <p className="text-sm text-forest-600 dark:text-brand-200/70 mt-1">{msg.message}</p>
                </div>
                <button onClick={() => deleteMessage(msg.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0">
                  <Trash2 size={16} />
                </button>
              </GlassCard>
            </motion.div>
          )) : (
            <div className="glass p-10 text-center">
              <Mail className="mx-auto text-forest-300 mb-3" size={48} />
              <p className="text-forest-500 dark:text-brand-200/60">No messages yet.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'schemes' && (
        <div className="grid gap-4 md:grid-cols-2">
          {govSchemes.map((scheme, i) => (
            <motion.div key={scheme.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard>
                <span className="chip">{scheme.category}</span>
                <h3 className="font-semibold text-forest-800 dark:text-brand-50 mt-2">{scheme.title}</h3>
                <p className="text-sm text-forest-500 dark:text-brand-200/60 mt-1">{scheme.benefits}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'news' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((news, i) => (
            <motion.div key={news.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard className="!p-0 overflow-hidden">
                <img src={news.image} alt="" className="w-full h-32 object-cover" />
                <div className="p-4">
                  <span className="chip">{news.category}</span>
                  <h3 className="font-semibold text-forest-800 dark:text-brand-50 mt-2 text-sm">{news.title}</h3>
                  <p className="text-xs text-forest-400 mt-1">{formatDate(news.date)}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'crops' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketPrices.map((crop, i) => (
            <motion.div key={crop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard className="flex items-center gap-3">
                <img src={crop.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h3 className="font-semibold text-forest-800 dark:text-brand-50 text-sm">{crop.name}</h3>
                  <p className="text-xs text-forest-500">₹{crop.currentPrice}/qtl</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'notes' && (
        <div>
          <GlassCard className="mb-6">
            <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">Add New Note</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title"
                className="glass-input w-full"
              />
              <textarea
                value={newNote.body}
                onChange={(e) => setNewNote({ ...newNote, body: e.target.value })}
                placeholder="Note content"
                rows={3}
                className="glass-input w-full resize-none"
              />
              <button onClick={addNote} className="btn-primary">
                <Save size={18} /> Save Note
              </button>
            </div>
          </GlassCard>

          <div className="space-y-4">
            {notes.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <GlassCard className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-forest-800 dark:text-brand-50">{note.title}</h3>
                    <p className="text-sm text-forest-500 dark:text-brand-200/60 mt-1">{note.body}</p>
                    <span className="text-xs text-forest-400 mt-2 block">{formatDate(note.created_at)}</span>
                  </div>
                  <button onClick={() => deleteNote(note.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0">
                    <Trash2 size={16} />
                  </button>
                </GlassCard>
              </motion.div>
            ))}
            {notes.length === 0 && (
              <div className="glass p-10 text-center">
                <Plus className="mx-auto text-forest-300 mb-3" size={48} />
                <p className="text-forest-500 dark:text-brand-200/60">No notes yet. Add one above.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
