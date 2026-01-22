import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from './constants/theme';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
    const router = useRouter();

    // Animation Shared Values
    const rotate = useSharedValue(0);
    const scale = useSharedValue(0.8);
    const translateY = useSharedValue(20);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Rotational animation for the icon
        rotate.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 1500, easing: Easing.inOut(Easing.cubic) }),
                withTiming(15, { duration: 1500, easing: Easing.inOut(Easing.cubic) })
            ),
            -1,
            true
        );

        // Entrance animation
        scale.value = withSpring(1);
        opacity.value = withTiming(1, { duration: 800 });
        translateY.value = withSpring(0, { damping: 12 });
    }, []);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }]
    }));

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value }
        ]
    }));

    return (
        <>
            <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
            <LinearGradient
                colors={[COLORS.primaryDark, COLORS.secondary]}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Animated.View style={[styles.content, animatedContentStyle]}>
                    <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                        <MaterialCommunityIcons name="compass-off-outline" size={120} color="#FFFFFF" />
                    </Animated.View>

                    <Text style={styles.title}>404</Text>
                    <Text style={styles.subtitle}>Off the Map</Text>

                    <Text style={styles.description}>
                        Seems like you've wandered into uncharted territory.
                        Let's get you back to civilization.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.8}
                        onPress={() => router.replace('/(tabs)/home')}
                    >
                        <MaterialCommunityIcons name="home-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.buttonText}>Return to Home</Text>
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    iconContainer: {
        marginBottom: 20,
        opacity: 0.9,
    },
    title: {
        fontSize: 80,
        fontWeight: '900',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 8,
        lineHeight: 80,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 10,
        marginBottom: 16,
        opacity: 0.9,
    },
    description: {
        fontSize: 16,
        color: '#E2E8F0',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
        maxWidth: '80%',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 8,
        ...SHADOWS.medium,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});
