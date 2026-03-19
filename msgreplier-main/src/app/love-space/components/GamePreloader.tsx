import { Loader2 } from 'lucide-react';

export function GamePreloader({ progress, gameName = '' }: { progress: number, gameName?: string }) {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300 rounded-3xl">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6 animate-pulse">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
        Preparing {gameName}
      </h3>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs text-center">
        Loading game assets for a smooth experience...
      </p>

      <div className="w-64 max-w-[80vw] h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-400 mt-2">{progress}%</span>
    </div>
  );
}
