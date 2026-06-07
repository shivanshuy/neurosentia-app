import { Box } from '@mui/material';
import { useFontPreset } from '../FontPresetProvider';
import type { FontPresetId } from '../fontPresets';

function FontPresetPicker() {
  const { preset, setPreset, presets } = useFontPreset();

  return (
    <Box className="font-preset-picker" aria-label="Font presets">
      <Box className="font-preset-picker-options">
        {presets.map((item) => {
          const active = preset === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`settings-picker-option font-preset-picker-option${active ? ' settings-picker-option--active font-preset-picker-option--active' : ''}`}
              onClick={() => setPreset(item.id as FontPresetId)}
              aria-pressed={active}
            >
              <span className="font-preset-picker-option-label">{item.label}</span>
              <span className="font-preset-picker-option-desc">{item.description}</span>
            </button>
          );
        })}
      </Box>
    </Box>
  );
}

export default FontPresetPicker;
