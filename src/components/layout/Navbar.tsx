import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Sprout, Menu, X, Sun, Moon, Globe, LogOut, User, Settings,
  LayoutDashboard, Search, Mic,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { classNames } from '@/lib/utils';

const navLinks = [
  { to: '/dashboard', labelKey: 'nav.dashboard' },
  { to: '/weather', labelKey: 'nav.weather' },
  { to: '/crop-recommendation', labelKey: 'nav.crops' },
  { to: '/disease-detection', labelKey: 'nav.disease' },
  { to: '/market-prices', labelKey: 'nav.market' },
  { to: '/ai-assistant', labelKey: 'nav.assistant' },
  { to: '/analytics', labelKey: 'nav.analytics' },
  { to: '/schemes', labelKey: 'nav.schemes' },
  { to: '/calendar', labelKey: 'nav.calendar' },
  { to: '/irrigation', labelKey: 'nav.irrigation' },
  { to: '/fertilizer', labelKey: 'nav.fertilizer' },
  { to: '/news', labelKey: 'nav.news' },
  { to: '/why-smart', labelKey: 'nav.smart' },
];

const publicLinks = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/contact', labelKey: 'nav.contact' },
  { to: '/why-smart', labelKey: 'nav.smart' },
];

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { transcript, isListening, isSupported, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (transcript) setSearchQuery(transcript);
  }, [transcript]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
      stopListening();
    }
  };

  const handleVoiceSearch = () => {
    if (!isSupported) return;
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <>
      <header className={classNames('fixed top-0 left-0 right-0 z-50 transition-all duration-300', scrolled ? 'py-2' : 'py-4')}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={classNames('flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300', scrolled ? 'glass shadow-glass' : 'bg-transparent')}>
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shadow-glow">
                <Sprout className="text-white" size={22} />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-lg text-forest-800 dark:text-brand-50 leading-none">AgriNova</span>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-medium block leading-none mt-0.5">{t('hero.badge')}</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {publicLinks.map((link) => (
                <NavLink key={link.to} to={link.to} active={location.pathname === link.to}>
                  {t(link.labelKey)}
                </NavLink>
              ))}
              {user && (
                <NavLink to="/dashboard" active={location.pathname === '/dashboard'}>
                  {t('nav.dashboard')}
                </NavLink>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen((s) => !s)} className="p-2.5 rounded-xl glass-soft hover:bg-white/70 dark:hover:bg-forest-800/60 transition" aria-label={t('nav.search')}>
                <Search size={18} className="text-forest-700 dark:text-brand-200" />
              </button>

              <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="p-2.5 rounded-xl glass-soft hover:bg-white/70 dark:hover:bg-forest-800/60 transition flex items-center gap-1.5" aria-label={t('settings.language')}>
                <Globe size={18} className="text-forest-700 dark:text-brand-200" />
                <span className="text-xs font-semibold text-forest-700 dark:text-brand-200">{lang === 'en' ? 'EN' : 'हि'}</span>
              </button>

              <button onClick={toggleTheme} className="p-2.5 rounded-xl glass-soft hover:bg-white/70 dark:hover:bg-forest-800/60 transition" aria-label={t('settings.appearance')}>
                {theme === 'dark' ? <Sun size={18} className="text-brand-300" /> : <Moon size={18} className="text-forest-700" />}
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen((s) => !s)} className="flex items-center gap-2 p-1 pr-3 rounded-xl glass-soft hover:bg-white/70 dark:hover:bg-forest-800/60 transition">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {profile?.photo_url ? <img src={profile.photo_url} alt="" className="w-full h-full object-cover" /> : (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-forest-700 dark:text-brand-100 max-w-[100px] truncate">{profile?.full_name || t('nav.profile')}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-56 glass p-2 shadow-glass">
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-forest-800/60 transition">
                          <User size={16} className="text-brand-600 dark:text-brand-300" />
                          <span className="text-sm font-medium text-forest-700 dark:text-brand-100">{t('nav.profile')}</span>
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-forest-800/60 transition">
                          <Settings size={16} className="text-brand-600 dark:text-brand-300" />
                          <span className="text-sm font-medium text-forest-700 dark:text-brand-100">{t('nav.settings')}</span>
                        </Link>
                        {profile?.is_admin && (
                          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-forest-800/60 transition">
                            <LayoutDashboard size={16} className="text-brand-600 dark:text-brand-300" />
                            <span className="text-sm font-medium text-forest-700 dark:text-brand-100">{t('nav.admin')}</span>
                          </Link>
                        )}
                        <hr className="my-1 border-forest-200/40 dark:border-brand-400/10" />
                        <button onClick={() => { signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                          <LogOut size={16} className="text-red-500" />
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">{t('nav.logout')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost !py-2 !px-4 text-sm">{t('nav.login')}</Link>
                  <Link to="/signup" className="btn-primary !py-2 !px-4 text-sm">{t('nav.signup')}</Link>
                </div>
              )}

              <button onClick={() => setMobileOpen((s) => !s)} className="lg:hidden p-2.5 rounded-xl glass-soft hover:bg-white/70 dark:hover:bg-forest-800/60 transition" aria-label={t('nav.menu')}>
                {mobileOpen ? <X size={18} /> : <Menu size={18} className="text-forest-700 dark:text-brand-200" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleSearch} className="mt-2 glass p-3 flex items-center gap-2">
                <Search size={18} className="text-forest-500 ml-2" />
                <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={isListening ? t('ai.listening') : t('nav.search')} className="flex-1 bg-transparent outline-none text-forest-800 dark:text-brand-50 placeholder-forest-400" />
                {isSupported && (
                  <button type="button" onClick={handleVoiceSearch} className={`p-2 rounded-lg transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'glass-soft text-forest-600 dark:text-brand-200'}`} aria-label="Voice search">
                    <Mic size={18} />
                  </button>
                )}
                <button type="submit" className="btn-primary !py-2 !px-4 text-sm">{t('nav.search')}</button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] glass rounded-none !rounded-l-3xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-bold text-lg text-forest-800 dark:text-brand-50">{t('nav.menu')}</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg glass-soft"><X size={18} /></button>
              </div>

              <div className="space-y-1">
                {publicLinks.map((link) => (
                  <Link key={link.to} to={link.to} className={classNames('block px-4 py-3 rounded-xl font-medium transition', location.pathname === link.to ? 'bg-brand-100 text-forest-700 dark:bg-brand-900/40 dark:text-brand-200' : 'text-forest-600 dark:text-brand-100 hover:bg-brand-50 dark:hover:bg-forest-800/60')}>{t(link.labelKey)}</Link>
                ))}
              </div>

              {user && (
                <>
                  <hr className="my-4 border-forest-200/40 dark:border-brand-400/10" />
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link key={link.to} to={link.to} className={classNames('block px-4 py-3 rounded-xl font-medium transition', location.pathname === link.to ? 'bg-brand-100 text-forest-700 dark:bg-brand-900/40 dark:text-brand-200' : 'text-forest-600 dark:text-brand-100 hover:bg-brand-50 dark:hover:bg-forest-800/60')}>{t(link.labelKey)}</Link>
                    ))}
                  </div>
                </>
              )}

              {!user && (
                <div className="mt-6 space-y-3">
                  <Link to="/login" className="btn-ghost w-full">{t('nav.login')}</Link>
                  <Link to="/signup" className="btn-primary w-full">{t('nav.signup')}</Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className={classNames('px-4 py-2 rounded-xl font-medium text-sm transition-all', active ? 'bg-brand-100 text-forest-700 dark:bg-brand-900/40 dark:text-brand-200' : 'text-forest-600 dark:text-brand-100/80 hover:bg-brand-50 dark:hover:bg-forest-800/60')}>{children}</Link>
  );
}
