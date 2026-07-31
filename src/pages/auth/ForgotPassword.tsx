import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Sprout, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast(error, 'error');
    } else {
      setSent(true);
      toast('Password reset link sent to your email.', 'success');
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shadow-glow mb-4">
              <Sprout className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold font-display text-forest-800 dark:text-brand-50">Reset Password</h1>
            <p className="text-forest-500 dark:text-brand-200/60 mt-1.5">
              {sent ? 'Check your email for the reset link' : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto">
                <CheckCircle className="text-brand-600 dark:text-brand-300" size={32} />
              </div>
              <p className="text-forest-600 dark:text-brand-200/70">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn-ghost w-full">
                <ArrowLeft size={18} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    required
                    className="glass-input w-full pl-11"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Reset Link'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {!sent && (
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-forest-500 dark:text-brand-200/60 hover:text-brand-600 mt-6 transition">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
