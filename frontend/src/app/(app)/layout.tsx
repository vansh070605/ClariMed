'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useEffect } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let wasDark = false;
    const handleBeforePrint = () => {
      wasDark = document.documentElement.classList.contains('dark');
      if (wasDark) {
        document.documentElement.classList.remove('dark');
      }
    };
    const handleAfterPrint = () => {
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
    };
    
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return (
    <div className="flex h-screen print:h-auto overflow-hidden print:overflow-visible bg-[#f8fafc] dark:bg-[#09090b] print:bg-white print:dark:bg-white transition-colors duration-200">
      {/* Subtle modern background gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/10 pointer-events-none -z-10" />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden print:overflow-visible relative z-0">
        <Header />
        <main className="flex-1 overflow-y-auto print:overflow-visible p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
