'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  TrendingUp,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Upload Report', href: '/reports/upload', icon: UploadCloud },
    { name: 'Trends', href: '/trends', icon: TrendingUp },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-zinc-950 dark:border-zinc-800 transition-colors duration-200">
      <div className="flex h-16 items-center border-b dark:border-zinc-800 px-6">
        <Activity className="h-6 w-6 text-blue-600 dark:text-blue-500" />
        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-zinc-50">ClariMed</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative block"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <div
                  className={`relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t dark:border-zinc-800 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-zinc-500 group-hover:text-red-700 dark:group-hover:text-red-400" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
}
