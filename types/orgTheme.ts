export type ThemeColor =
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'pink'
  | 'emerald'
  | 'amber'
  | 'cyan'
  | 'rose'

export interface OrgTheme {
  organization_id: string
  accent_color: ThemeColor
  updated_at?: string
}

export const THEME_COLORS: ThemeColor[] = [
  'blue',
  'indigo',
  'violet',
  'pink',
  'emerald',
  'amber',
  'cyan',
  'rose',
]

export const THEME_LABELS: Record<ThemeColor, string> = {
  blue: 'Bleu',
  indigo: 'Indigo',
  violet: 'Violet',
  pink: 'Rose vif',
  emerald: 'Émeraude',
  amber: 'Ambre',
  cyan: 'Cyan',
  rose: 'Rose',
}

export interface ThemePalette {
  light: { accent: string; accentHover: string }
  dark: { accent: string; accentHover: string }
}

export const THEME_PALETTES: Record<ThemeColor, ThemePalette> = {
  blue: {
    light: { accent: '37 99 235', accentHover: '29 78 216' },
    dark: { accent: '59 130 246', accentHover: '37 99 235' },
  },
  indigo: {
    light: { accent: '79 70 229', accentHover: '67 56 202' },
    dark: { accent: '99 102 241', accentHover: '79 70 229' },
  },
  violet: {
    light: { accent: '124 58 237', accentHover: '109 40 217' },
    dark: { accent: '139 92 246', accentHover: '124 58 237' },
  },
  pink: {
    light: { accent: '219 39 119', accentHover: '190 24 93' },
    dark: { accent: '236 72 153', accentHover: '219 39 119' },
  },
  emerald: {
    light: { accent: '5 150 105', accentHover: '4 120 87' },
    dark: { accent: '16 185 129', accentHover: '5 150 105' },
  },
  amber: {
    light: { accent: '217 119 6', accentHover: '180 83 9' },
    dark: { accent: '245 158 11', accentHover: '217 119 6' },
  },
  cyan: {
    light: { accent: '8 145 178', accentHover: '14 116 144' },
    dark: { accent: '6 182 212', accentHover: '8 145 178' },
  },
  rose: {
    light: { accent: '225 29 72', accentHover: '190 18 60' },
    dark: { accent: '244 63 94', accentHover: '225 29 72' },
  },
}

export const DEFAULT_THEME_COLOR: ThemeColor = 'blue'
