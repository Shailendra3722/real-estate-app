import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export const GlassCard = ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Platform.OS === 'web' ? COLORS.glass : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: Platform.OS === 'web' ? 'blur(16px)' : undefined,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: SIZES.medium,
        ...SHADOWS.small,
    }
});
