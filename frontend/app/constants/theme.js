export const COLORS = {
    primary: '#0F172A',  // Slate 900 - Deep, professional
    secondary: '#D97706', // Amber 600 - Gold/Premium accent
    bg: '#F8FAFC',       // Slate 50 - Clean light background
    card: '#FFFFFF',
    text: '#1E293B',     // Slate 800
    subText: '#64748B',  // Slate 500
    border: '#E2E8F0',   // Slate 200
    success: '#10B981',  // Emerald 500
    error: '#EF4444',    // Red 500
    surface: '#FFFFFF',

    // Gradients or special overlays
    overlay: 'rgba(15, 23, 42, 0.6)'
};

export const SIZES = {
    padding: 20,
    radius: 12,
    icon: 24,
    h1: 30,
    h2: 24,
    h3: 18,
    body: 16,
    caption: 14
};

export const SHADOWS = {
    light: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    medium: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    heavy: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    }
};

export default { COLORS, SIZES, SHADOWS };
