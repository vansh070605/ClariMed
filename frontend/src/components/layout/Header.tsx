'use client';

import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-zinc-900 px-6">
      <div className="flex flex-1 items-center">
        {/* Mobile menu button could go here */}
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative w-64">
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
            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}

        <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-zinc-900" />
        </button>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
      </div>
    </header>
  );
}
