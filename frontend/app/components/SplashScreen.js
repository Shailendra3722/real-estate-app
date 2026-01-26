import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
    // Animation Values
    const circleScale = useRef(new Animated.Value(0)).current;
    const circleTranslate = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Loop the animations
        const animate = () => {
            // Reset values
            circleScale.setValue(0);
            circleTranslate.setValue(0);
            textOpacity.setValue(0.3);

            Animated.parallel([
                // 1. Circle appearing and moving forward (scaling up + moving right)
                Animated.sequence([
                    Animated.timing(circleScale, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(circleTranslate, {
                        toValue: width + 100, // Move off screen
                        duration: 1500,
                        useNativeDriver: true,
                    })
                ]),
                // 2. Text Blinking Effect
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(textOpacity, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(textOpacity, {
                            toValue: 0.3,
                            duration: 800,
                            useNativeDriver: true,
                        })
                    ])
                )
            ]).start();
        };

        animate();
    }, []);

    return (
        <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.content}>
                {/* Moving Circle Object */}
                <Animated.View
                    style={[
                        styles.circle,
                        {
                            transform: [
                                { scale: circleScale },
                                { translateX: circleTranslate }
                            ]
                        }
                    ]}
                />

                {/* Blinking Text */}
                <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
                    Real Estate Wala Bhai
                </Animated.Text>

                <Text style={styles.subtitle}>Loading your dream home...</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Keep circle contained
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    circle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        top: -50, // Center vertically behind text roughly
        left: -150, // Start from left
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
    }
});
