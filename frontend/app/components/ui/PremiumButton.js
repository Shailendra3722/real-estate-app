import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export const PremiumButton = ({ title, onPress, variant = 'primary', icon, style }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[SHADOWS.medium, { borderRadius: SIZES.radius }]}
            >
                {variant === 'primary' ? (
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBtn}
                    >
                        {icon && icon}
                        <Text style={styles.primaryText}>{title}</Text>
                    </LinearGradient>
                ) : (
                    <Animated.View style={[styles.secondaryBtn, { borderColor: COLORS.primary }]}>
                        {icon && icon}
                        <Text style={{ color: COLORS.primary, fontWeight: '600' }}>{title}</Text>
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    gradientBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: SIZES.radius,
        gap: 10,
    },
    primaryText: {
        color: 'white',
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: SIZES.radius,
        borderWidth: 1.5,
        backgroundColor: 'transparent',
        gap: 10,
    }
});
