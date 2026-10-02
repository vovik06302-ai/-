import React from 'react';
import { Palette, RefreshCw, BarChart3 } from 'lucide-react';
import { useAppTheme } from './ThemeContext';

interface Props {
  onOpenTheme: () => void;
  onOpenUpdate: () => void;
  onOpenReport: () => void;
  hasUpdateAvailable: boolean;
}

export const Navbar: React.FC<Props> = ({
  onOpenTheme,
  onOpenUpdate,
  onOpenReport,
  hasUpdateAvailable
}) => {
  const { themeConfig } = useAppTheme();

  return (
    <header className="bg-slate-800 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
          <span className="text-blue-400">Авто</span>Финансы
        </h1>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenTheme}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors"
            title="Тема оформления"
          >
            <Palette className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenUpdate}
            className={`p-2 rounded-lg transition-colors relative ${
              hasUpdateAvailable
                ? 'text-amber-400 hover:bg-amber-950/40 animate-pulse'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
            }`}
            title="Проверить обновления"
          >
            <RefreshCw className="w-5 h-5" />
            {hasUpdateAvailable && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={onOpenReport}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors"
            title="Отчёт"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
