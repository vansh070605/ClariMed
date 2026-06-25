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
    <div className="flex h-screen print:h-auto overflow-hidden print:overflow-visible bg-slate-50 dark:bg-[#1b1b24]/40 text-on-surface font-body-md transition-colors duration-200">
      {/* Floating Island Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative print:h-auto print:overflow-visible z-0">
        {/* Floating Top Header */}
        <Header />
        
        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto px-8 py-8 print:overflow-visible print:px-0 print:py-0">
          <div className="max-w-7xl mx-auto space-y-8 pb-12 print:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
