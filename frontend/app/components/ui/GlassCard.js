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
        backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        padding: SIZES.medium,
        ...SHADOWS.light,
    }
});
