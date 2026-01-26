import { useRouter } from 'expo-router';
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, StatusBar, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useLanguage } from './components/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './services/apiConfig';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from './components/SplashScreen';

export default function LoginScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    // UI State
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(true); // Start true for splash check
    const [authLoading, setAuthLoading] = useState(false); // Separate loading for button

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Initial Session Check
        checkSession();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                delay: 2500, // Wait for splash a bit
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                delay: 2500,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const checkSession = async () => {
        try {
            // Artificial delay to show the nice splash screen
            await new Promise(resolve => setTimeout(resolve, 2000));

            const token = await AsyncStorage.getItem('user_token');
            if (token) {
                router.replace('/(tabs)/home');
            } else {
                setLoading(false); // Show login form
            }
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !fullName)) {
            Alert.alert("Missing Fields", "Please fill in all details.");
            return;
        }

        setAuthLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin
                ? { email, password }
                : { email, password, full_name: fullName };

            const response = await API.post(endpoint, payload);

            if (response.data && response.data.access_token) {
                const { access_token, user } = response.data;

                // Store Session
                await AsyncStorage.setItem('user_token', access_token);
                await AsyncStorage.setItem('user_profile', JSON.stringify(user));
                // For legacy components
                await AsyncStorage.setItem('@user_id_v1', user.email);

                router.replace('/(tabs)/home');
            }
        } catch (error) {
            console.error(error);
            // OFFLINE FALLBACK: Explicit warning instead of silent fail
            Alert.alert(
                "Connection Issue",
                "We couldn't connect to the Real Estate Wala Bhai server. You can continue in Offline Mode, but your data will NOT be saved to the website.",
                [
                    {
                        text: "Try Again",
                        style: "cancel",
                        onPress: () => setAuthLoading(false)
                    },
                    {
                        text: "Enter Offline Mode",
                        style: "destructive",
                        onPress: async () => {
                            const mockUser = {
                                email: email || "offline@user.com",
                                name: fullName || "Offline User",
                                id: "local_offline_123",
                                is_offline: true // Mark as offline
                            };
                            await AsyncStorage.setItem('user_token', 'offline_mode_token');
                            await AsyncStorage.setItem('user_profile', JSON.stringify(mockUser));
                            router.replace('/(tabs)/home');
                        }
                    }
                ]
            );
        } finally {
            setAuthLoading(false);
        }
    };

    if (loading) {
        return <SplashScreen />;
    }

    return (
        <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar style="light" />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.title}>Real Estate Wala Bhai</Text>
                    <Text style={styles.subtitle}>Find your dream home with AI</Text>
                </Animated.View>

                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>

                        {!isLogin && (
                            <View style={styles.inputWrap}>
                                <Ionicons name="person-outline" size={20} color="#64748B" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor="#94A3B8"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        )}

                        <View style={styles.inputWrap}>
                            <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.mainBtn}
                            onPress={handleAuth}
                            activeOpacity={0.9}
                            disabled={authLoading}
                        >
                            {authLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.btnText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
                            <Text style={styles.switchText}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <Text style={{ fontWeight: 'bold', color: '#4F46E5' }}>
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    "Skip Login",
                                    "Guest access is limited. You won't be able to save properties.",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Continue as Guest",
                                            onPress: async () => {
                                                const mockUser = {
                                                    email: "guest@demo.com",
                                                    name: "Guest User",
                                                    id: "guest_123",
                                                    is_offline: true
                                                };
                                                await AsyncStorage.setItem('user_token', 'guest_token');
                                                await AsyncStorage.setItem('user_profile', JSON.stringify(mockUser));
                                                router.replace('/(tabs)/home');
                                            }
                                        }
                                    ]
                                );
                            }}
                            style={{ marginTop: 30, alignItems: 'center' }}
                        >
                            <Text style={{ color: '#94A3B8', fontSize: 14, textDecorationLine: 'underline' }}>
                                Having trouble? <Text style={{ color: '#4F46E5', fontWeight: 'bold' }}>Skip Login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </LinearGradient >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: Platform.OS === 'web' ? 40 : 80,
        paddingBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5,
        fontSize: 16
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 24,
        textAlign: 'center'
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 12,
        backgroundColor: '#F8FAFC'
    },
    icon: { marginRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1E293B'
    },
    mainBtn: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    btnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    switchText: {
        textAlign: 'center',
        color: '#64748B',
        fontSize: 14
    }
});
