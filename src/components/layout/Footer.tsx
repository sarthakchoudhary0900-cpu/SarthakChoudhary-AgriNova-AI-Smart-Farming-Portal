import { Link } from 'react-router-dom';
import { Sprout, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-forest-200/40 dark:border-brand-400/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shadow-glow">
                <Sprout className="text-white" size={22} />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-forest-800 dark:text-brand-50 leading-none">
                  AgriNova AI
                </span>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-medium block mt-0.5">
                  Smart Farming Portal
                </span>
              </div>
            </Link>
            <p className="text-sm text-forest-500 dark:text-brand-200/60 leading-relaxed">
              Empowering farmers with AI-driven insights, real-time weather, and market intelligence for smarter, sustainable agriculture.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg glass-soft flex items-center justify-center text-forest-600 dark:text-brand-200 hover:bg-brand-100 dark:hover:bg-forest-800/60 transition"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">Features</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/weather', label: 'Real Weather' },
                { to: '/crop-recommendation', label: 'Crop Recommendation' },
                { to: '/disease-detection', label: 'Disease Detection' },
                { to: '/market-prices', label: 'Market Prices' },
                { to: '/ai-assistant', label: 'AI Assistant' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-forest-500 dark:text-brand-200/60 hover:text-brand-600 dark:hover:text-brand-300 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/schemes', label: 'Government Schemes' },
                { to: '/calendar', label: 'Farm Calendar' },
                { to: '/irrigation', label: 'Irrigation Planner' },
                { to: '/fertilizer', label: 'Fertilizer Advisor' },
                { to: '/news', label: 'Agriculture News' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-forest-500 dark:text-brand-200/60 hover:text-brand-600 dark:hover:text-brand-300 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-forest-800 dark:text-brand-50 mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-forest-500 dark:text-brand-200/60">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <span>support@agrinova.ai</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <span>1800-180-1551 (Toll Free)</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <span>Krishi Bhavan, New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-forest-200/40 dark:border-brand-400/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-forest-500 dark:text-brand-200/50">
            © 2025 AgriNova AI. Built for farmers, powered by AI.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/about" className="text-forest-500 dark:text-brand-200/50 hover:text-brand-600 transition">About</Link>
            <Link to="/contact" className="text-forest-500 dark:text-brand-200/50 hover:text-brand-600 transition">Contact</Link>
            <a href="#" className="text-forest-500 dark:text-brand-200/50 hover:text-brand-600 transition">Privacy</a>
            <a href="#" className="text-forest-500 dark:text-brand-200/50 hover:text-brand-600 transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
