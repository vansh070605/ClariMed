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
    <div className="min-h-screen flex">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 flex-col items-center justify-center p-16 text-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
              <HeartPulse className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">ClariMed</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-5">
            Start your health <span className="text-blue-200">intelligence journey.</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Join thousands of users who trust ClariMed to decode their medical reports, track biomarker trends, and take control of their health data.
          </p>

          <div className="mt-10 p-5 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
            <p className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">Free to get started</p>
            <p className="text-white text-base">Upload your first lab report and get instant AI-powered analysis — no credit card required.</p>
          </div>
        </motion.div>
      </div>

      {/* Right Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <HeartPulse className="h-6 w-6 text-blue-600" />
            <span className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50">ClariMed</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-zinc-50">Create your account</h2>
            <p className="text-gray-500 dark:text-zinc-400 mt-2">Start tracking your health intelligence for free.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Vansh Agrawal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-12 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base pr-12 focus-visible:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base focus-visible:ring-blue-500"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-700 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30 transition-all mt-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
