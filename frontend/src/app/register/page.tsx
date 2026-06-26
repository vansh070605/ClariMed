'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { register, getCurrentUser } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
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
          setError('Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#121118] font-sans selection:bg-primary/20">
      {/* Left Decorative Panel (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-800 via-[#4d44e3] to-primary flex-col items-center justify-center p-16 text-white">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute -bottom-32 -right-20 w-[450px] h-[450px] bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-indigo-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s' }} />

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
            Start your health <span className="text-primary-fixed">intelligence journey.</span>
          </h1>
          <p className="text-blue-100/90 text-lg leading-relaxed mb-8">
            Join thousands of users who trust ClariMed to decode their medical reports, track biomarker trends, and take control of their health data.
          </p>

          <div className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/15 shadow-sm">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1.5">Free to get started</p>
            <p className="text-white text-[15px] leading-relaxed">
              Upload your first lab report and get instant AI-powered analysis — no credit card required.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Register Form Panel */}
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

          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Create account</h2>
            <p className="text-gray-500 dark:text-zinc-400 mt-2 text-sm">Start tracking your health intelligence for free.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Vansh Agrawal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 text-base focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 text-base focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 text-base pr-12 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 text-base focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-medium text-red-700 dark:text-red-400 animate-shake"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-on-primary shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-primary/10 mt-4 cursor-pointer flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center border-t dark:border-zinc-800/50 pt-5">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-bold text-primary hover:text-primary/80 dark:text-primary-fixed-dim dark:hover:text-primary-fixed transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
