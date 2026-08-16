import { SiteTheme } from '../types';

export const DEFAULT_THEME: SiteTheme = {
  primaryColor: '#00555C',
  primaryHover: '#004247',
  secondaryColor: '#0f172a',
  accentColor: '#06b6d4',
  cardBg: '#ffffff',
  cardBorder: '#e2e8f0',
  tableHeaderBg: '#f8fafc',
  tableHeaderText: '#475569',
  sidebarBg: '#c9d1d2',
  activeNavBg: '#00555C',
  activeNavText: '#ffffff',
  sidebarHoverBg: '#b8c1c2',
  sidebarTextColor: '#1e293b',
  formHeaderBg: '#00555C',
  formLabelColor: '#475569',
  formInputText: '#000000',
  formTitleColor: '#ffffff',
};

export interface ThemePreset {
  id: string;
  name: string;
  theme: SiteTheme;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Restauración Teal (Original)',
    theme: { ...DEFAULT_THEME }
  },
  {
    id: 'indigo',
    name: 'Índigo Real',
    theme: {
      primaryColor: '#4f46e5',
      primaryHover: '#4338ca',
      secondaryColor: '#1e1b4b',
      accentColor: '#818cf8',
      cardBg: '#ffffff',
      cardBorder: '#e0e7ff',
      tableHeaderBg: '#eef2ff',
      tableHeaderText: '#3730a3',
      sidebarBg: '#e0e7ff',
      activeNavBg: '#4f46e5',
      activeNavText: '#ffffff',
      sidebarHoverBg: '#c7d2fe',
      sidebarTextColor: '#312e81',
      formHeaderBg: '#4f46e5',
      formLabelColor: '#4f46e5',
      formInputText: '#1e1b4b',
      formTitleColor: '#ffffff',
    }
  },
  {
    id: 'emerald',
    name: 'Esmeralda Vital',
    theme: {
      primaryColor: '#059669',
      primaryHover: '#047857',
      secondaryColor: '#064e3b',
      accentColor: '#10b981',
      cardBg: '#ffffff',
      cardBorder: '#d1fae5',
      tableHeaderBg: '#ecfdf5',
      tableHeaderText: '#065f46',
      sidebarBg: '#d1fae5',
      activeNavBg: '#059669',
      activeNavText: '#ffffff',
      sidebarHoverBg: '#a7f3d0',
      sidebarTextColor: '#064e3b',
      formHeaderBg: '#059669',
      formLabelColor: '#065f46',
      formInputText: '#064e3b',
      formTitleColor: '#ffffff',
    }
  },
  {
    id: 'warm_amber',
    name: 'Cálido Ocre',
    theme: {
      primaryColor: '#d97706',
      primaryHover: '#b45309',
      secondaryColor: '#451a03',
      accentColor: '#f59e0b',
      cardBg: '#ffffff',
      cardBorder: '#fef3c7',
      tableHeaderBg: '#fffbeb',
      tableHeaderText: '#92400e',
      sidebarBg: '#fef3c7',
      activeNavBg: '#d97706',
      activeNavText: '#ffffff',
      sidebarHoverBg: '#fde68a',
      sidebarTextColor: '#78350f',
      formHeaderBg: '#d97706',
      formLabelColor: '#92400e',
      formInputText: '#451a03',
      formTitleColor: '#ffffff',
    }
  },
  {
    id: 'midnight_dark',
    name: 'Místico Oscuro',
    theme: {
      primaryColor: '#3b82f6',
      primaryHover: '#2563eb',
      secondaryColor: '#1e293b',
      accentColor: '#60a5fa',
      cardBg: '#ffffff',
      cardBorder: '#dbeafe',
      tableHeaderBg: '#eff6ff',
      tableHeaderText: '#1e40af',
      sidebarBg: '#0f172a',
      activeNavBg: '#3b82f6',
      activeNavText: '#ffffff',
      sidebarHoverBg: '#1e293b',
      sidebarTextColor: '#94a3b8',
      formHeaderBg: '#1e293b',
      formLabelColor: '#475569',
      formInputText: '#0f172a',
      formTitleColor: '#f8fafc',
    }
  }
];

/**
 * Aplica los colores del tema parametrizado mediante Variables CSS en document.documentElement.
 */
export const applyTheme = (theme?: SiteTheme): void => {
  const currentTheme = theme || DEFAULT_THEME;
  const root = document.documentElement;

  root.style.setProperty('--color-primary', currentTheme.primaryColor);
  root.style.setProperty('--color-primary-hover', currentTheme.primaryHover);
  root.style.setProperty('--color-secondary', currentTheme.secondaryColor);
  root.style.setProperty('--color-accent', currentTheme.accentColor);

  root.style.setProperty('--color-card-bg', currentTheme.cardBg);
  root.style.setProperty('--color-card-border', currentTheme.cardBorder);

  root.style.setProperty('--color-table-header-bg', currentTheme.tableHeaderBg);
  root.style.setProperty('--color-table-header-text', currentTheme.tableHeaderText);

  root.style.setProperty('--color-sidebar-bg', currentTheme.sidebarBg);
  root.style.setProperty('--color-active-nav-bg', currentTheme.activeNavBg);
  root.style.setProperty('--color-active-nav-text', currentTheme.activeNavText);
  root.style.setProperty('--color-sidebar-hover-bg', currentTheme.sidebarHoverBg);
  root.style.setProperty('--color-sidebar-text', currentTheme.sidebarTextColor);

  root.style.setProperty('--color-form-header-bg', currentTheme.formHeaderBg);
  root.style.setProperty('--color-form-label', currentTheme.formLabelColor);
  root.style.setProperty('--color-form-input-text', currentTheme.formInputText);
  root.style.setProperty('--color-form-title-color', currentTheme.formTitleColor);
};
