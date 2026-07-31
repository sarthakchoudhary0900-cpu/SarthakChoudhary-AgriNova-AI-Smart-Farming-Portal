import { useTranslation } from 'react-i18next';
import { Moon, Sun, Bell, MapPin } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { t } = useTranslation();

  const handleLangChange = (newLang: 'en' | 'hi') => {
    setLang(newLang);
    toast(newLang === 'hi' ? 'भाषा बदली गई' : 'Language changed', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">{t('settings.title')}</h1>
      </div>

      {/* Appearance */}
      <GlassCard className="mb-6">
        <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">{t('settings.appearance')}</h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="text-brand-300" size={22} /> : <Sun className="text-amber-500" size={22} />}
            <div>
              <div className="font-medium text-forest-700 dark:text-brand-100">{theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</div>
              <div className="text-sm text-forest-500 dark:text-brand-200/60">{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</div>
            </div>
          </div>
          <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full bg-brand-200 dark:bg-brand-700 transition">
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </GlassCard>

      {/* Language */}
      <GlassCard className="mb-6">
        <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">{t('settings.language')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleLangChange('en')} className={`p-4 rounded-xl border-2 transition text-left ${lang === 'en' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-transparent glass-soft'}`}>
            <div className="font-semibold text-forest-700 dark:text-brand-100">English</div>
            <div className="text-sm text-forest-500 dark:text-brand-200/60">English</div>
          </button>
          <button onClick={() => handleLangChange('hi')} className={`p-4 rounded-xl border-2 transition text-left ${lang === 'hi' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-transparent glass-soft'}`}>
            <div className="font-semibold text-forest-700 dark:text-brand-100">हिन्दी</div>
            <div className="text-sm text-forest-500 dark:text-brand-200/60">Hindi</div>
          </button>
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard className="mb-6">
        <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">{t('settings.notifications')}</h3>
        <div className="space-y-3">
          {['Weather alerts', 'Market price changes', 'Disease warnings', 'Scheme deadlines'].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
              <div className="flex items-center gap-3">
                <Bell className="text-brand-600 dark:text-brand-300" size={20} />
                <span className="text-sm font-medium text-forest-700 dark:text-brand-100">{item}</span>
              </div>
              <button className="relative w-14 h-7 rounded-full bg-brand-500 transition">
                <div className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-white shadow-md" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Location */}
      <GlassCard>
        <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">{t('settings.location')}</h3>
        <div className="p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
          <div className="flex items-center gap-3">
            <MapPin className="text-brand-600 dark:text-brand-300" size={20} />
            <div>
              <div className="font-medium text-forest-700 dark:text-brand-100">{profile?.state || 'Not set'} {profile?.district ? ', ' + profile.district : ''}</div>
              <div className="text-sm text-forest-500 dark:text-brand-200/60">Your farm location</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
