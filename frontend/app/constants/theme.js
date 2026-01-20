// Ultra-Premium Color Palette
export const COLORS = {
    // Primary Brand Colors
    primary: '#6366F1',      // Indigo 500 - Modern & Trustworthy
    primaryDark: '#4F46E5',  // Indigo 600
    primaryLight: '#818CF8', // Indigo 400

    secondary: '#8B5CF6',    // Violet 500 - Creative Touch
    accent: '#F43F5E',       // Rose 500 - CTAs & Highlights

    // Neutrals
    background: '#F8FAFC',   // Slate 50 - Clean Background
    bg: '#F8FAFC',           // Alias
    surface: '#FFFFFF',      // Pure White
    card: '#FFFFFF',         // Alias
    text: '#1E293B',         // Slate 800 - Main Text
    subText: '#64748B',      // Slate 500 - Secondary Text
    border: '#E2E8F0',       // Slate 200 - Borders

    // Semantic Colors
    success: '#10B981',      // Emerald 500
    error: '#EF4444',        // Red 500
    warning: '#F59E0B',      // Amber 500

    // Glassmorphism
    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    overlay: 'rgba(15, 23, 42, 0.6)',
};

export const SIZES = {
    // Spacing
    base: 8,
    padding: 20,
    small: 12,
    medium: 16,
    large: 20,
    extraLarge: 24,
    icon: 24,

    // Typography
    h1: 32,
    h2: 24,
    h3: 18,
    body: 16,
    caption: 14,

    // Border Radius
    radius: 16,      // Modern, smooth corners
    radiusSmall: 8,
    radiusLarge: 24,
};

export const SHADOWS = {
    small: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    light: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    medium: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
    heavy: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 12,
    },
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

export default { COLORS, SIZES, SHADOWS, FONTS };
