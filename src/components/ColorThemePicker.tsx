import { Box } from '@mui/material';
import { useColorTheme } from '../ColorThemeProvider';
import type { ColorThemeId } from '../colorThemes';

function ColorThemePicker() {
  const { themeId, setThemeId, themes } = useColorTheme();

  return (
    <Box className="color-theme-picker" aria-label="Color themes">
      <Box className="color-theme-picker-options">
        {themes.map((item) => {
          const active = themeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`settings-picker-option color-theme-picker-option${active ? ' settings-picker-option--active color-theme-picker-option--active' : ''}`}
              onClick={() => setThemeId(item.id as ColorThemeId)}
              aria-pressed={active}
              aria-current={active ? 'true' : undefined}
              style={
                active
                  ? {
                      border: `1px solid ${item.colors.accent}`,
                      backgroundColor: item.colors.accentMuted,
                      boxShadow: `inset 0 0 0 1px ${item.colors.accent}`,
                    }
                  : undefined
              }
            >
              <Box className="color-theme-picker-option-main">
                <span
                  className="color-theme-picker-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${item.colors.accent} 50%, ${item.colors.footer} 50%)`,
                    ...(active ? { boxShadow: `0 0 0 2px ${item.colors.accent}` } : {}),
                  }}
                  aria-hidden="true"
                />
                <span className="color-theme-picker-option-label">{item.label}</span>
              </Box>
              <span className="color-theme-picker-option-desc">{item.description}</span>
            </button>
          );
        })}
      </Box>
    </Box>
  );
}

export default ColorThemePicker;
