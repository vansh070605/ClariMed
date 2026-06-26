'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { login, getCurrentUser } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { HeartPulse, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      const userData = await getCurrentUser();
      setUser(userData);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        // @ts-expect-error - Expected API error
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail[0].msg);
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError('Invalid email or password. Please try again.');
        }
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#121118] font-sans selection:bg-primary/20">
      {/* Left Decorative Panel (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-[#4d44e3] to-indigo-800 flex-col items-center justify-center p-16 text-white">
        {/* Ambient background circles */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute -bottom-32 -right-20 w-[450px] h-[450px] bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s' }} />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
              <HeartPulse className="h-7 w-7 text-white animate-pulse" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">ClariMed</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-5">
            Your health, made <span className="text-primary-fixed">crystal clear.</span>
          </h1>
          <p className="text-blue-100/90 text-lg leading-relaxed mb-10">
            Upload your medical reports and get AI-powered insights, biomarker tracking, and a longitudinal health history — all in one place.
          </p>

          <div className="space-y-6">
            {[
              { title: 'AI Biomarker Extraction', desc: 'Automatic parsing of lab values and clinical data.' },
              { title: 'Trend Analysis', desc: 'Track your health across time with interactive charts.' },
              { title: 'Doctor Share Portal', desc: 'Securely share your data with healthcare providers.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 100 }}
                className="flex items-start gap-4"
              >
                <div className="h-7 w-7 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                  <div className="h-2.5 w-2.5 bg-white rounded-full" />
                </div>
                <div>
                  <p className="font-semibold text-white text-[16px]">{f.title}</p>
                  <p className="text-blue-200/80 text-sm mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-50 dark:bg-[#121118]">
        {/* Soft floating background blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-900/5 blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-400/15 dark:bg-indigo-900/5 blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-400/10 dark:bg-violet-900/5 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800/80 shadow-soft rounded-[32px] p-8 md:p-10 relative z-10"
        >
          {/* Mobile logo header layout */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50">ClariMed</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Welcome back</h2>
            <p className="text-gray-500 dark:text-zinc-400 mt-2 text-sm">Sign in to continue to your health dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 text-base focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 text-base pr-12 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-medium text-red-700 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-on-primary shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-primary/10 mt-2 cursor-pointer flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center border-t dark:border-zinc-800/50 pt-6">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-bold text-primary hover:text-primary/80 dark:text-primary-fixed-dim dark:hover:text-primary-fixed transition-colors cursor-pointer"
              >
                Create one free
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
