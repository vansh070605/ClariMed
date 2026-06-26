'use client';

import { Bell, Search, Moon, Sun, X, Activity, Settings, LogOut, HelpCircle, UploadCloud, TrendingUp, Bot, FileText, Heart, HeartPulse } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  hideToast?: boolean;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // WebSocket Connection for Live Notifications
    const ws = new WebSocket('ws://localhost:8000/ws/notifications');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NOTIFICATION') {
          const newNotif = { ...data, id: Date.now() };
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Auto-remove toast after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.map(n => n.id === newNotif.id ? { ...n, hideToast: true } : n));
          }, 5000);
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
      <header className="bg-card/80 backdrop-blur-md rounded-full mt-6 mx-4 sm:mx-8 px-4 sm:px-6 py-2.5 sm:py-3 shadow-soft border border-border sticky top-0 z-50 flex justify-between items-center w-auto transition-all duration-300 print:hidden">
        {/* Mobile Logo & Brand (Visible on mobile/tablet, hidden on desktop layout where sidebar is active) */}
        <div className="flex lg:hidden items-center gap-2.5 mr-4 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
            <HeartPulse className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-lg text-primary dark:text-primary-fixed-dim tracking-tight">ClariMed</span>
        </div>

        {/* Search Bar (Hidden on mobile, visible on tablet/desktop viewports) */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mr-4">
          <div className="relative w-full focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 rounded-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant h-4 w-4" />
            <input
              type="text"
              placeholder="Search patients, reports..."
              className="w-full bg-slate-50 dark:bg-[#1b1b24] border border-slate-200 dark:border-border rounded-full py-2.5 pl-12 pr-4 text-body-md focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder:text-on-surface-variant/50 text-on-surface"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Switcher */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {/* Interactive Notifications (Bell) Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-2.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-all relative cursor-pointer outline-none"
              onClick={() => setUnreadCount(0)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl border-border bg-card shadow-lg mt-2 p-2">
              <div className="px-3 py-2 flex justify-between items-center border-b border-border/30">
                <span className="text-sm font-semibold text-on-surface">Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setNotifications([]); }} 
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-on-surface-variant">
                    <Bell className="h-8 w-8 mx-auto text-on-surface-variant/30 mb-2" />
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-3 py-2.5 text-xs hover:bg-surface-container rounded-xl transition-colors mb-1">
                      <p className="font-semibold text-on-surface">{notif.title}</p>
                      <p className="text-on-surface-variant mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Interactive Help Guide Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hidden sm:inline-flex p-2.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-all cursor-pointer outline-none"
            title="Open Portal Guide"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <div className="w-px h-6 bg-border mx-1 sm:mx-2"></div>

          {/* User Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-surface-container rounded-full transition-all outline-none cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-label-sm font-semibold text-on-surface">{user?.name || 'Dr. Guest'}</p>
                <p className="text-[10px] text-on-surface-variant">{user?.email ? user.email.split('@')[0] : 'Clinical Portal'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-medium shadow-sm border-2 border-white select-none shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border bg-card shadow-lg mt-2 p-1.5">
              <div className="px-2.5 py-2 text-sm font-medium">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-on-surface">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-on-surface-variant">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border opacity-50 my-1" />
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="cursor-pointer rounded-xl hover:bg-surface-container dark:hover:bg-surface-variant/20 focus:bg-surface-container dark:focus:bg-surface-variant/20 py-2 px-3 transition-colors text-on-surface"
              >
                <Settings className="mr-2 h-4 w-4 text-on-surface-variant" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border opacity-50 my-1" />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 py-2 px-3 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Floating WebSocket Toasts */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-2 w-80 print:hidden">
        <AnimatePresence>
          {notifications.filter(n => !n.hideToast).map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-[#1b1b24] border border-border shadow-lg rounded-2xl p-4 flex items-start gap-3"
            >
              <div className="bg-primary-container/10 p-2 rounded-full shrink-0">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-on-surface">{notif.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{notif.message}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, hideToast: true } : n))}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Portal Guide Dialog Pop-up */}
      <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border-border/80 bg-white dark:bg-zinc-950 p-8 shadow-2xl ring-1 ring-black/5">
          <DialogHeader className="gap-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
                ClariMed Patient Portal Guide
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-500 mt-2 leading-relaxed">
              Welcome to the ClariMed Clinical Portal. Follow this quick walkthrough to learn how our AI-powered medical copilot translates complex lab PDFs into actionable health insights.
            </DialogDescription>
          </DialogHeader>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-2">
            {/* Step 1 */}
            <div className="flex flex-col p-5 bg-slate-50 dark:bg-[#1b1b24]/40 rounded-2xl border border-slate-100 dark:border-zinc-900/30 hover:shadow-sm transition-all duration-300">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl w-fit mb-4">
                <UploadCloud className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-1.5">1. Upload Reports</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Click <span className="font-semibold text-indigo-600 dark:text-indigo-400">Upload Report</span> in the sidebar and drop in your PDF or image lab results. Our system automatically parses the text.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col p-5 bg-slate-50 dark:bg-[#1b1b24]/40 rounded-2xl border border-slate-100 dark:border-zinc-900/30 hover:shadow-sm transition-all duration-300">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl w-fit mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-1.5">2. Trace Trends</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Visit the <span className="font-semibold text-emerald-600 dark:text-emerald-400">Trends</span> dashboard to trace biometric values over a timeline. Spot progress and track declines.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col p-5 bg-slate-50 dark:bg-[#1b1b24]/40 rounded-2xl border border-slate-100 dark:border-zinc-900/30 hover:shadow-sm transition-all duration-300">
              <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-xl w-fit mb-4">
                <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-1.5">3. Ask Assistant</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Chat with our <span className="font-semibold text-violet-600 dark:text-violet-400">AI Assistant</span> to clarify terminology, understand biomarkers, and ask context-aware questions.
              </p>
            </div>
          </div>

          {/* Safety Guardrails */}
          <div className="mt-4 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30">
            <div className="flex gap-3">
              <Heart className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Clinical Safety & Warnings</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                  ClariMed is designed to extract data and summarize lab reports for ease of review. It does not replace professional medical diagnosis, advice, or treatment plans.
                </p>
                <p className="text-xs text-amber-800 font-semibold mt-1">
                  ⚠️ Always consult your physician before making any healthcare decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Help Center Contact */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Clinical Support: support@clarimed.com</span>
            <span>v1.0.0</span>
          </div>

          <DialogFooter className="mt-6 border-t border-gray-100 dark:border-zinc-900/50 pt-5 flex justify-end">
            <DialogClose render={<Button className="h-11 rounded-full font-semibold shadow-sm hover:shadow transition-all bg-primary text-on-primary hover:opacity-90 cursor-pointer" />}>
              Got it, let's go
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
