export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <div className="h-4 w-4 border-2 border-white rounded-full flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-zinc-50">
              Clari<span className="text-blue-600 dark:text-blue-400">Med</span> <span className="text-sm font-normal text-gray-400">Clinical Portal</span>
            </span>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
