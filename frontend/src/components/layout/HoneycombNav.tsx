'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  TrendingUp,
  Bot,
  Settings,
  X,
  Grid,
  HeartPulse,
  LogOut
} from 'lucide-react';

export function HoneycombNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  // Close menu on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, x: -60, y: -104 },
    { name: 'Reports', href: '/reports', icon: FileText, x: 60, y: -104 },
    { name: 'Upload Report', href: '/reports/upload', icon: UploadCloud, x: -120, y: 0 },
    { name: 'Trends', href: '/trends', icon: TrendingUp, x: 120, y: 0 },
    { name: 'AI Assistant', href: '/chat', icon: Bot, x: -60, y: 104 },
    { name: 'Settings', href: '/settings', icon: Settings, x: 60, y: 104 },
  ];

  const handleToggle = () => setIsOpen(!isOpen);

  // Framer Motion variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const menuContainerVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.25,
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = (x: number, y: number) => ({
    hidden: { x: 0, y: 0, scale: 0, opacity: 0 },
    visible: {
      x,
      y,
      scale: 1,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 120, damping: 14 },
    },
    exit: {
      x: 0,
      y: 0,
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' as const },
    },
  });

  const centerVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 12, delay: 0.1 },
    },
    exit: {
      scale: 0,
      rotate: 180,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      {/* Floating Honeycomb Trigger Button */}
      <div className="fixed bottom-6 right-6 z-[100] print:hidden lg:hidden">
        <button
          onClick={handleToggle}
          aria-label="Toggle navigation menu"
          className="relative group w-14 h-16 flex items-center justify-center cursor-pointer transition-all duration-300 drop-shadow-md hover:drop-shadow-lg"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-violet-600 transition-all duration-300 group-hover:scale-105" />
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10 text-white flex items-center justify-center"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Grid className="h-6 w-6" />}
          </motion.div>
          {/* Subtle outer glowing ring */}
          {!isOpen && (
            <div className="absolute inset-0 border-2 border-primary/40 rounded-none animate-pulse" 
                 style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          )}
        </button>
      </div>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleToggle}
            className="fixed inset-0 z-[90] bg-slate-950/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center print:hidden"
          >
            {/* Prevent clicking card content from closing menu */}
            <motion.div
              variants={menuContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-[340px] h-[340px] flex items-center justify-center scale-90 xs:scale-95 sm:scale-100"
            >
              {/* Outer Hexagonal Ring Items */}
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
                
                return (
                  <motion.div
                    key={item.name}
                    custom={{ x: item.x, y: item.y }}
                    variants={itemVariants(item.x, item.y)}
                    className="absolute cursor-pointer select-none group"
                  >
                    <Link href={item.href} className="block">
                      <div
                        className={`flex items-center justify-center p-[2px] transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-br from-primary to-violet-500 drop-shadow-[0_0_10px_rgba(53,37,205,0.4)]'
                            : 'bg-gradient-to-br from-border/70 to-border/20 group-hover:from-primary/50 group-hover:to-violet-500/50'
                        }`}
                        style={{
                          width: '116px',
                          height: '132px',
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        }}
                      >
                        <div
                          className={`flex flex-col items-center justify-center w-[112px] h-[128px] px-2 text-center transition-all duration-300 ${
                            isActive
                              ? 'bg-primary-container/25 dark:bg-primary/20 text-primary dark:text-white font-extrabold'
                              : 'bg-card hover:bg-slate-50 dark:hover:bg-zinc-900/90 text-slate-600 dark:text-zinc-300 group-hover:text-primary dark:group-hover:text-white'
                          }`}
                          style={{
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                          }}
                        >
                          <item.icon className={`h-6 w-6 mb-2 transition-transform duration-300 group-hover:scale-110 ${
                            isActive 
                              ? 'text-primary dark:text-white' 
                              : 'text-slate-500 dark:text-zinc-400 group-hover:text-primary dark:group-hover:text-white'
                          }`} />
                          <span className="text-[11px] font-bold tracking-tight leading-tight max-w-[90px]">{item.name}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Central Hexagon (Logo & Close Option / Info Indicator) */}
              <motion.div
                variants={centerVariants}
                className="absolute flex items-center justify-center p-[2px] bg-gradient-to-br from-primary/30 to-violet-600/30"
                style={{
                  width: '116px',
                  height: '132px',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              >
                <div
                  className="flex flex-col items-center justify-center w-[112px] h-[128px] bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-1">
                    <HeartPulse className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary dark:text-white">ClariMed</span>
                  
                  {/* Logout trigger directly in overlay context */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                      router.push('/login');
                    }}
                    className="mt-1.5 p-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer flex items-center gap-0.5"
                    title="Logout"
                  >
                    <LogOut className="h-3 w-3" />
                    <span className="text-[9px] font-bold">Exit</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
