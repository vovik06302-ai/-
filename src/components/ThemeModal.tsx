import React from 'react';
import { AppTheme } from '../types';
import { useAppTheme, THEME_CONFIGS } from './ThemeContext';
import { Palette, Check, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeModal: React.FC<Props> = ({ onClose, onSelectTheme }) => {
  const { theme: currentTheme } = useAppTheme();

  const themes: AppTheme[] = ['BLUE', 'GREEN', 'PURPLE', 'ORANGE', 'RED'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Тема оформления</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">Выберите основной цвет приложения:</p>

        <div className="space-y-2">
          {themes.map(t => {
            const config = THEME_CONFIGS[t];
            const isSelected = t === currentTheme;
            return (
              <div
                key={t}
                onClick={() => {
                  onSelectTheme(t);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? `${config.bgLightClass} ${config.borderClass} font-bold shadow-sm`
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: config.primaryHex }}
                  />
                  <span className="text-sm font-semibold">{config.label}</span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-current" />}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
