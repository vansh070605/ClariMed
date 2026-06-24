'use client';

import { Bell, Search, Moon, Sun, X, Activity, User as UserIcon, Settings, LogOut } from 'lucide-react';
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
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // WebSocket Connection
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
      <header className="flex h-16 items-center justify-between border-b border-gray-200/50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl dark:border-zinc-800/50 px-6 print:hidden relative z-50 shadow-sm">
        <div className="flex flex-1 items-center">
          {/* Mobile menu button could go here */}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative w-64 hidden md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 h-9"
            />
          </div>
          
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          <button 
            className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            onClick={() => setUnreadCount(0)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-sm hover:ring-2 hover:ring-blue-600/50 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-zinc-950 transition-all outline-none">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-200 dark:border-zinc-800">
              <div className="px-2 py-1.5 text-sm font-medium">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-gray-500 dark:text-zinc-400">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 focus:bg-gray-50 dark:focus:bg-zinc-800"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />
              <DropdownMenuItem 
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Floating Toasts */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 w-80 print:hidden">
        <AnimatePresence>
          {notifications.filter(n => !n.hideToast).map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg rounded-xl p-4 flex items-start gap-3"
            >
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full shrink-0">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{notif.title}</h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{notif.message}</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, hideToast: true } : n))}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
