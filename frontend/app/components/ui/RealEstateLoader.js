import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function RealEstateLoader() {
    // Animation Values for Opacity
    const fadeReal = useRef(new Animated.Value(0.3)).current;
    const fadeEstate = useRef(new Animated.Value(0.3)).current;
    const fadeWala = useRef(new Animated.Value(0.3)).current;
    const fadeBhai = useRef(new Animated.Value(0.3)).current;

    // Animation Values for Scale
    const scaleReal = useRef(new Animated.Value(1)).current;
    const scaleEstate = useRef(new Animated.Value(1)).current;
    const scaleWala = useRef(new Animated.Value(1)).current;
    const scaleBhai = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Function to create a blink/pulse sequence for a single word
        const animateWord = (opacity, scale, delay) => {
            return Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true
                    }),
                    Animated.timing(scale, {
                        toValue: 1.15,
                        duration: 400,
                        useNativeDriver: true
                    })
                ]),
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 0.3,
                        duration: 400,
                        useNativeDriver: true
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true
                    })
                ])
            ]);
        };

        // Loop the sequence indefinitely
        const loop = Animated.loop(
            Animated.parallel([
                animateWord(fadeReal, scaleReal, 0),         // Starts at 0ms
                animateWord(fadeEstate, scaleEstate, 300),   // Starts at 300ms
                animateWord(fadeWala, scaleWala, 600),       // Starts at 600ms
                animateWord(fadeBhai, scaleBhai, 900),       // Starts at 900ms
            ])
        );

        loop.start();

        return () => loop.stop();
    }, []);

    const Word = ({ text, opacity, scale, color }) => (
        <Animated.Text style={[
            styles.text,
            { color: color || COLORS.primary },
            { opacity, transform: [{ scale }] }
        ]}>
            {text}
        </Animated.Text>
    );

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Row 1: Real Estate */}
                <View style={styles.row}>
                    <Word text="Real" opacity={fadeReal} scale={scaleReal} />
                    <Word text="Estate" opacity={fadeEstate} scale={scaleEstate} />
                </View>

                {/* Row 2: Wala Bhai */}
                <View style={styles.row}>
                    <Word text="Wala" opacity={fadeWala} scale={scaleWala} color={COLORS.secondary} />
                    <Word text="Bhai" opacity={fadeBhai} scale={scaleBhai} color={COLORS.secondary} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        zIndex: 999, // Ensure it sits on top if used as overlay
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10, // vertical gap between rows
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12, // horizontal gap between words
    },
    text: {
        fontSize: 32,
        fontWeight: '800', // Extra bold
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    }
});
