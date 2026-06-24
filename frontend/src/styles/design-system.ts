/**
 * ClariMed Premium Healthcare Design System
 * Inspired by Apple Health & Stripe Dashboard
 */

export const colors = {
  primary: {
    DEFAULT: '#2563EB', // Stripe Blue
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  severity: {
    normal: '#10b981', // Emerald 500
    mild: '#eab308',   // Yellow 500
    moderate: '#f97316',// Orange 500
    severe: '#ef4444', // Red 500
  },
  background: {
    light: '#ffffff',
    dark: '#09090b', // Zinc 950
  },
  card: {
    light: '#ffffff',
    dark: '#18181b', // Zinc 900
  }
};

export const metrics = {
  borderRadius: {
    card: '24px', // "24px rounded cards"
    button: '12px',
    badge: '9999px',
  },
  shadows: {
    card: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
  }
};
