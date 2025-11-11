import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@ciclo_azul:settings';

export type FontScale = 'small' | 'medium' | 'large' | 'xlarge';

export interface SettingsState {
  fontSize: FontScale;
  isLoaded: boolean;
  setFontSize: (scale: FontScale) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  fontSize: 'medium',
  isLoaded: false,

  setFontSize: async (scale: FontScale) => {
    set({ fontSize: scale });
    await get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set({
          fontSize: settings.fontSize || 'medium',
          isLoaded: true
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      set({ isLoaded: true });
    }
  },

  saveToStorage: async () => {
    try {
      const { fontSize } = get();
      const settings = { fontSize };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
}));

// Custom hook to get current font scale
export const useFontScale = (): FontScale => {
  return useSettingsStore((state) => state.fontSize);
};

// Custom hook to check if settings are loaded
export const useSettingsLoaded = (): boolean => {
  return useSettingsStore((state) => state.isLoaded);
};
