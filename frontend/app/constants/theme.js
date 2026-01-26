// Ultra-Premium Color Palette
export const COLORS = {
    // Primary Brand Colors - Deep Indigo & Electric Violet
    primary: '#4F46E5',      // Indigo 600 - Main Brand Color
    primaryDark: '#4338CA',  // Indigo 700 - Active States
    primaryLight: '#818CF8', // Indigo 400 - Highlights

    secondary: '#7C3AED',    // Violet 600 - Secondary Brand Color
    accent: '#F472B6',       // Pink 400 - Eye-catching Accents

    // Gradients
    gradientStart: '#4F46E5',
    gradientEnd: '#7C3AED',

    // Neutrals
    background: '#F1F5F9',   // Slate 100 - Clean, airy background
    bg: '#F1F5F9',           // Alias
    surface: '#FFFFFF',      // Pure White
    card: '#FFFFFF',         // Alias

    text: '#0F172A',         // Slate 900 - Sharp, high contrast text
    textLight: '#F8FAFC',    // Slate 50 - Text on dark backgrounds
    subText: '#64748B',      // Slate 500 - Secondary Text
    border: '#E2E8F0',       // Slate 200 - Subtle Borders

    // Semantic Colors
    success: '#10B981',      // Emerald 500
    error: '#EF4444',        // Red 500
    warning: '#F59E0B',      // Amber 500

    // Glassmorphism
    glass: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.6)',
    overlay: 'rgba(15, 23, 42, 0.4)',
};

export const SIZES = {
    // Spacing
    base: 8,
    padding: 24, // More breathing room
    small: 12,
    medium: 16,
    large: 20,
    extraLarge: 32,
    icon: 24,

    // Typography
    h1: 34,
    h2: 26,
    h3: 20,
    body: 16,
    caption: 14,
    small: 12,

    // Border Radius
    radius: 20,      // Smooth, modern curves
    radiusSmall: 12,
    radiusLarge: 28,
};

export const SHADOWS = {
    small: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    medium: {
        shadowColor: '#6366F1', // Tinted shadow
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    large: {
        shadowColor: '#4F46E5', // Stronger tinted shadow
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    glow: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    }
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    extraBold: 'System',
};

export default { COLORS, SIZES, SHADOWS, FONTS };
