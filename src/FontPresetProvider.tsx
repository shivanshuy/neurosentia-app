import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  applyFontPreset,
  fontPresetList,
  getStoredFontPreset,
  type FontPreset,
  type FontPresetId,
} from './fontPresets';

type FontPresetContextValue = {
  preset: FontPresetId;
  setPreset: (id: FontPresetId) => void;
  presets: FontPreset[];
};

const FontPresetContext = createContext<FontPresetContextValue | null>(null);

export function FontPresetProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<FontPresetId>(getStoredFontPreset);

  const setPreset = (id: FontPresetId) => {
    setPresetState(id);
  };

  useEffect(() => {
    applyFontPreset(preset);
  }, [preset]);

  return (
    <FontPresetContext.Provider value={{ preset, setPreset, presets: fontPresetList }}>
      {children}
    </FontPresetContext.Provider>
  );
}

export function useFontPreset() {
  const context = useContext(FontPresetContext);
  if (!context) {
    throw new Error('useFontPreset must be used within FontPresetProvider');
  }
  return context;
}
