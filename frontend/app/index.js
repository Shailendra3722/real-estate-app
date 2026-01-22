import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, StatusBar } from 'react-native';
import { useLanguage } from './components/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const router = useRouter();
    const context = useLanguage();
    const t = context?.t || ((k) => k);
    const setLang = context?.setLang || (() => { });
    const lang = context?.lang || 'EN';

    const [debugMsg, setDebugMsg] = React.useState("");

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();

        // Pulsing animation for button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const handleLogin = () => {
        setDebugMsg("Attempting Login...");
        console.log("Login Clicked -> Navigating");
        setTimeout(() => {
            // Updated to route to the tabs layout properly
            router.replace('/(tabs)/map');
        }, 100);
    };

    return (
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar style="light" />
            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.title}>MapProperties AI</Text>
            </Animated.View>

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Animated.Text style={[styles.welcome, { transform: [{ translateY: slideAnim }] }]}>
                    {t('LOGIN_TITLE')}
                </Animated.Text>

                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={handleLogin}
                        activeOpacity={0.9}
                    >
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <Text style={styles.btnText}>{t('LOGIN_BTN')}</Text>
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>

                {debugMsg ? <Text style={{ color: 'white', textAlign: 'center', marginTop: 10 }}>{debugMsg}</Text> : null}

                <Animated.View style={{ opacity: fadeAnim, marginTop: 32 }}>
                    <TouchableOpacity
                        style={styles.langBtn}
                        onPress={() => setLang(lang === 'HI' ? 'EN' : 'HI')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.langText}>
                            Change Language to {lang === 'HI' ? 'English' : 'हिंदी'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = {
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'web' ? 60 : 80,
        paddingBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        letterSpacing: -0.5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    welcome: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 40,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    loginBtn: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 18,
        paddingHorizontal: 60,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        minWidth: 280,
    },
    btnText: {
        color: '#667eea',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    langBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    langText: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
};
