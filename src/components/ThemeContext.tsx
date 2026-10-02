import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme, ThemeConfig } from '../types';
import { loadTheme, saveTheme } from '../storage';

export const THEME_CONFIGS: Record<AppTheme, ThemeConfig> = {
  BLUE: {
    label: 'Синяя',
    primaryHex: '#1565C0',
    primaryClass: 'bg-blue-700 text-white hover:bg-blue-800',
    bgLightClass: 'bg-blue-50 text-blue-900 border-blue-200',
    borderClass: 'border-blue-600',
    ringClass: 'ring-blue-500'
  },
  GREEN: {
    label: 'Зелёная',
    primaryHex: '#2E7D32',
    primaryClass: 'bg-emerald-700 text-white hover:bg-emerald-800',
    bgLightClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    borderClass: 'border-emerald-600',
    ringClass: 'ring-emerald-500'
  },
  PURPLE: {
    label: 'Фиолетовая',
    primaryHex: '#7B1FA2',
    primaryClass: 'bg-purple-700 text-white hover:bg-purple-800',
    bgLightClass: 'bg-purple-50 text-purple-900 border-purple-200',
    borderClass: 'border-purple-600',
    ringClass: 'ring-purple-500'
  },
  ORANGE: {
    label: 'Оранжевая',
    primaryHex: '#E65100',
    primaryClass: 'bg-orange-600 text-white hover:bg-orange-700',
    bgLightClass: 'bg-orange-50 text-orange-900 border-orange-200',
    borderClass: 'border-orange-600',
    ringClass: 'ring-orange-500'
  },
  RED: {
    label: 'Красная',
    primaryHex: '#C62828',
    primaryClass: 'bg-red-700 text-white hover:bg-red-800',
    bgLightClass: 'bg-red-50 text-red-900 border-red-200',
    borderClass: 'border-red-600',
    ringClass: 'ring-red-500'
  }
};

interface ThemeContextType {
  theme: AppTheme;
  themeConfig: ThemeConfig;
  setAppTheme: (newTheme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'BLUE',
  themeConfig: THEME_CONFIGS.BLUE,
  setAppTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(loadTheme());

  const setAppTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeConfig: THEME_CONFIGS[theme], setAppTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
