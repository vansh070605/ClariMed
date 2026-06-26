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
  HeartPulse,
  Bot
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Upload Report', href: '/reports/upload', icon: UploadCloud },
    { name: 'Trends', href: '/trends', icon: TrendingUp },
    { name: 'AI Assistant', href: '/chat', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-card rounded-3xl m-6 h-[calc(100vh-3rem)] w-64 shadow-soft border border-border flex flex-col py-8 space-y-2 flex-shrink-0 hidden lg:flex z-10 relative transition-all duration-300">
      {/* Brand Header */}
      <div className="px-8 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
          <HeartPulse className="h-5 w-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-title-lg font-bold text-primary dark:text-primary-fixed-dim tracking-tight">ClariMed</h1>
          <p className="text-label-sm text-on-surface-variant">Clinical Portal</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-full scale-95 active:scale-90 transition-all duration-200 ${
                isActive
                  ? 'bg-secondary-container dark:bg-on-secondary-container/20 text-on-secondary-container dark:text-secondary-fixed shadow-sm font-semibold'
                  : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container dark:hover:bg-surface-variant/10'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout Action Button */}
      <div className="px-6 pt-4 mt-auto">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-3 px-4 text-label-md font-semibold hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}
