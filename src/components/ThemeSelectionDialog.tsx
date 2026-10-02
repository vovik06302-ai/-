import React from 'react';
import { AppThemeKey, APP_THEMES } from '../types/finance';
import { Palette, Check, X } from 'lucide-react';

interface ThemeSelectionDialogProps {
  selectedTheme: AppThemeKey;
  onDismiss: () => UnitFunction;
  onSelectTheme: (theme: AppThemeKey) => void;
}

type UnitFunction = () => void;

export const ThemeSelectionDialog: React.FC<ThemeSelectionDialogProps> = ({
  selectedTheme,
  onDismiss,
  onSelectTheme,
}) => {
  const themeKeys: AppThemeKey[] = ['BLUE', 'GREEN', 'PURPLE', 'ORANGE', 'RED'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-slate-800/90">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Тема оформления</h3>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            data-testid="close_theme_dialog_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-300">Выберите основной цвет приложения:</p>

          <div className="space-y-2">
            {themeKeys.map((key) => {
              const theme = APP_THEMES[key];
              const isSelected = selectedTheme === key;

              return (
                <button
                  key={key}
                  onClick={() => onSelectTheme(key)}
                  data-testid={`theme_option_${key.toLowerCase()}`}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-slate-700/80 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full border border-white/30 shadow-inner flex-shrink-0"
                      style={{ backgroundColor: theme.primaryHex }}
                    />
                    <span className={`text-base ${isSelected ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                      {theme.label}
                    </span>
                  </div>

                  {isSelected && <Check className="w-5 h-5 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-700/80 bg-slate-800/50">
          <button
            onClick={onDismiss}
            data-testid="close_theme_dialog_button"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
