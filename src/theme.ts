import { createTheme } from '@mui/material/styles';

import type { ColorThemeColors } from './colorThemes';

import { colorThemes } from './colorThemes';



declare module '@mui/material/styles' {

  interface Palette {

    accent: Palette['primary'];

    footer: Palette['primary'];

  }

  interface PaletteOptions {

    accent?: PaletteOptions['primary'];

    footer?: PaletteOptions['primary'];

  }

}



const display = 'var(--ns-font-display, var(--ns-font-sans))';

const sans = 'var(--ns-font-sans)';

const mono = 'var(--ns-font-mono)';



export function createNeurosentiaTheme(colors: ColorThemeColors, mode: 'dark' | 'light' = 'dark') {

  return createTheme({

    palette: {

      mode,

      primary: {

        main: colors.accent,

        contrastText: colors.onAccent,

      },

      background: {

        default: colors.bg,

        paper: colors.bgPaper,

      },

      text: {

        primary: colors.text,

        secondary: colors.textSecondary,

        disabled: colors.textMuted,

      },

      divider: colors.border,

      accent: {

        main: colors.accent,

        contrastText: colors.onAccent,

      },

      footer: {

        main: colors.footer,

        contrastText: colors.onAccent,

      },

    },

    typography: {

      fontFamily: sans,

      htmlFontSize: 16,

      h1: {

        fontFamily: display,

        fontSize: '1.875rem',

        fontWeight: 700,

        lineHeight: 1.15,

        letterSpacing: '0.03em',

      },

      h2: {

        fontFamily: display,

        fontSize: '1.375rem',

        fontWeight: 700,

        lineHeight: 1.2,

        letterSpacing: '0.05em',

        textTransform: 'uppercase',

      },

      h3: {

        fontSize: '1.125rem',

        fontWeight: 600,

        lineHeight: 1.3,

        letterSpacing: '0.02em',

      },

      h4: {

        fontSize: '1rem',

        fontWeight: 600,

        lineHeight: 1.35,

      },

      subtitle1: {

        fontSize: '1.125rem',

        fontWeight: 400,

        lineHeight: 1.55,

        letterSpacing: '0.01em',

      },

      subtitle2: {

        fontSize: '0.9375rem',

        fontWeight: 500,

        lineHeight: 1.5,

      },

      body1: {

        fontSize: '1rem',

        lineHeight: 1.7,

        letterSpacing: '0.01em',

      },

      body2: {

        fontSize: '0.875rem',

        lineHeight: 1.65,

        letterSpacing: '0.01em',

      },

      overline: {

        fontFamily: mono,

        fontSize: '0.75rem',

        fontWeight: 600,

        lineHeight: 1.5,

        letterSpacing: '0.1em',

        textTransform: 'uppercase',

      },

      caption: {

        fontSize: '0.75rem',

        lineHeight: 1.5,

        letterSpacing: '0.02em',

      },

      button: {

        fontFamily: mono,

        fontSize: '0.75rem',

        fontWeight: 600,

        letterSpacing: '0.08em',

        textTransform: 'uppercase',

      },

    },

    shape: {

      borderRadius: 4,

    },

    components: {

      MuiCssBaseline: {

        styleOverrides: {

          body: {

            backgroundColor: colors.bg,

            fontSize: '1rem',

            fontFamily: sans,

          },

          a: {

            transition: 'color 0.2s ease, opacity 0.2s ease',

          },

        },

      },

      MuiTypography: {

        defaultProps: {

          variantMapping: {

            h1: 'h1',

            h2: 'h2',

            h3: 'h3',

            h4: 'h4',

          },

        },

        styleOverrides: {

          root: {

            fontFamily: sans,

          },

          h1: {

            fontFamily: display,

          },

          h2: {

            fontFamily: display,

          },

        },

      },

      MuiIconButton: {

        styleOverrides: {

          root: {

            borderRadius: 6,

            transition: 'background-color 0.2s ease',

            '&:hover': {

              backgroundColor: colors.hoverBg,

            },

          },

        },

      },

      MuiListItemButton: {

        styleOverrides: {

          root: {

            borderRadius: 4,

            transition: 'background-color 0.2s ease, border-color 0.2s ease',

          },

        },

      },

    },

  });

}



export const neurosentiaTheme = createNeurosentiaTheme(colorThemes.gold.colors, 'dark');

