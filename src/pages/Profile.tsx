import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Phone, MapPin, Ruler, Languages, Camera, Save, Sprout, Search, Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { indianStates, districtsByState, formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';

export function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    state: '',
    district: '',
    farm_size: '',
    preferred_language: 'English',
    photo_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [savedCrops, setSavedCrops] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        state: profile.state || '',
        district: profile.district || '',
        farm_size: profile.farm_size || '',
        preferred_language: profile.preferred_language || 'English',
        photo_url: profile.photo_url || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: crops } = await supabase.from('saved_crops').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (crops) setSavedCrops(crops);
      const { data: searches } = await supabase.from('search_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
      if (searches) setSearchHistory(searches);
    })();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (error) {
      toast('Failed to update profile.', 'error');
    } else {
      toast('Profile updated successfully!', 'success');
      setEditing(false);
    }
  };

  const districts = form.state ? (districtsByState[form.state] || []) : [];

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">My Profile</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Manage your farm details and personal information.</p>
      </motion.div>

      {/* Profile header */}
      <GlassCard className="mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shrink-0">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile.full_name || user?.email || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold font-display text-forest-800 dark:text-brand-50">{profile.full_name || 'Farmer'}</h2>
            <p className="text-forest-500 dark:text-brand-200/60">{profile.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {profile.state && <span className="chip"><MapPin size={12} /> {profile.state}</span>}
              {profile.farm_size && <span className="chip"><Ruler size={12} /> {profile.farm_size}</span>}
              {profile.is_admin && <span className="chip !bg-amber-100 !text-amber-700">Admin</span>}
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-ghost">
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </GlassCard>

      {editing ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="mb-6">
            <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-5">Edit Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="glass-input w-full pl-11" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="glass-input w-full pl-11" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">State</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, district: '' })} className="glass-input w-full pl-11 appearance-none">
                    <option value="">Select state</option>
                    {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">District</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} disabled={!form.state} className="glass-input w-full pl-11 appearance-none disabled:opacity-50">
                    <option value="">Select district</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Farm Size</label>
                <div className="relative">
                  <Ruler size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input value={form.farm_size} onChange={(e) => setForm({ ...form, farm_size: e.target.value })} placeholder="e.g., 2 acres" className="glass-input w-full pl-11" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Preferred Language</label>
                <div className="relative">
                  <Languages size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <select value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })} className="glass-input w-full pl-11 appearance-none">
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Profile Photo URL</label>
                <div className="relative">
                  <Camera size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." className="glass-input w-full pl-11" />
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary mt-5 disabled:opacity-60">
              {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <GlassCard>
            <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">Farm Details</h3>
            <div className="space-y-3">
              {[
                { icon: User, label: 'Full Name', value: profile.full_name || 'Not set' },
                { icon: Phone, label: 'Phone', value: profile.phone || 'Not set' },
                { icon: MapPin, label: 'State', value: profile.state || 'Not set' },
                { icon: MapPin, label: 'District', value: profile.district || 'Not set' },
                { icon: Ruler, label: 'Farm Size', value: profile.farm_size || 'Not set' },
                { icon: Languages, label: 'Language', value: profile.preferred_language || 'English' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                  <item.icon size={18} className="text-brand-600 dark:text-brand-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-forest-500 dark:text-brand-200/50">{item.label}</div>
                    <div className="text-sm font-medium text-forest-700 dark:text-brand-100 truncate">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4 flex items-center gap-2">
                <Sprout size={18} className="text-brand-600 dark:text-brand-300" /> Saved Crops
              </h3>
              {savedCrops.length > 0 ? (
                <div className="space-y-2">
                  {savedCrops.map((crop) => (
                    <div key={crop.id} className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                      <Sprout size={16} className="text-brand-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-forest-700 dark:text-brand-100">{crop.crop_name}</div>
                        <div className="text-xs text-forest-400">{formatDate(crop.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-forest-400 text-center py-4">No saved crops yet</p>
              )}
            </GlassCard>

            <GlassCard>
              <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4 flex items-center gap-2">
                <Search size={18} className="text-brand-600 dark:text-brand-300" /> Recent Searches
              </h3>
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                      <Clock size={14} className="text-forest-400 shrink-0" />
                      <span className="text-sm text-forest-700 dark:text-brand-100 flex-1 truncate">{s.query}</span>
                      <span className="text-xs text-forest-400">{formatDate(s.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-forest-400 text-center py-4">No recent searches</p>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
