import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, ScrollView, Platform, Image, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useLanguage } from '../components/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/apiConfig';
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/ui/GlassCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [userImage, setUserImage] = useState(null);
    const [recentProperties, setRecentProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        loadData();
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 30,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const loadData = async () => {
        try {
            // Load User Profile
            const profile = await AsyncStorage.getItem('user_profile');
            if (profile) {
                const p = JSON.parse(profile);
                if (p.picture) setUserImage(p.picture);
            }

            // Load Recent Properties
            const response = await API.get('/properties/all');
            // Show last 5 properties, reversed to show newest first
            if (response.data) {
                setRecentProperties(response.data.reverse().slice(0, 5));
            }
        } catch (e) {
            console.log("Error loading home data:", e);
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (route) => {
        router.push(route);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Background Decorative Elements */}
            <View style={styles.blob1} />
            <View style={styles.blob2} />

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {/* Header Section */}
                <GlassCard style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome Back 👋</Text>
                        <Text style={styles.username}>Real Estate Wala Bhai</Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => navigateTo('/(tabs)/profile')}>
                        {userImage ? (
                            <Image source={{ uri: userImage }} style={styles.profileImg} />
                        ) : (
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.secondary]}
                                style={styles.profilePlaceholder}
                            >
                                <Ionicons name="person" size={20} color="white" />
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                </GlassCard>

                {/* Hero / Action Section */}
                <View style={styles.actionContainer}>
                    <Text style={styles.sectionTitle}>What would you like to do?</Text>

                    <View style={styles.row}>
                        {/* BUY CARD */}
                        <TouchableOpacity
                            style={[styles.bigCard, SHADOWS.medium]}
                            activeOpacity={0.9}
                            onPress={() => navigateTo('/(tabs)/buy')}
                        >
                            <LinearGradient
                                colors={[COLORS.primaryDark, COLORS.primary]}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.iconCircle}>
                                    <Ionicons name="search" size={28} color={COLORS.primary} />
                                </View>
                                <Text style={styles.bigCardTitle}>Find Property</Text>
                                <Text style={styles.bigCardSub}>Browse 10k+ Listings</Text>
                                <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.4)" style={styles.cornerIcon} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* SELL CARD */}
                        <TouchableOpacity
                            style={[styles.bigCard, SHADOWS.medium]}
                            activeOpacity={0.9}
                            onPress={() => navigateTo('/(tabs)/sell')}
                        >
                            <LinearGradient
                                colors={[COLORS.secondary, '#9333EA']}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                                    <Ionicons name="home" size={28} color={COLORS.secondary} />
                                </View>
                                <Text style={styles.bigCardTitle}>List Property</Text>
                                <Text style={styles.bigCardSub}>Sell 3x Faster</Text>
                                <Ionicons name="add-circle" size={32} color="rgba(255,255,255,0.4)" style={styles.cornerIcon} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statNum}>12k+</Text>
                        <Text style={styles.statLbl}>Active</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statNum}>850+</Text>
                        <Text style={styles.statLbl}>Verified</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statNum}>4.9⭐️</Text>
                        <Text style={styles.statLbl}>Rating</Text>
                    </GlassCard>
                </View>

                {/* About / Who We Are - Restored & Improved */}
                <GlassCard style={styles.aboutSection}>
                    <Text style={styles.aboutTitle}>WHO WE ARE</Text>
                    <Text style={styles.aboutHeadline}>India's Trusted Real Estate Partner 🇮🇳</Text>
                    <Text style={styles.aboutText}>
                        We are redefining property trading by eliminating middlemen.
                        Connect directly with verified sellers and buyers.
                        With our <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>AI-Powered Verification</Text> and
                        <Text style={{ fontWeight: 'bold', color: COLORS.primary }}> Aadhaar Integration</Text>,
                        every listing is authentic, securing your peace of mind.
                    </Text>
                    <TouchableOpacity style={styles.readMoreBtn}>
                        <Text style={styles.readMoreText}>READ MORE</Text>
                        <Ionicons name="arrow-forward" size={14} color="white" />
                    </TouchableOpacity>
                </GlassCard>

                {/* Recent Activity / Featured */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Listings</Text>
                    <TouchableOpacity onPress={() => navigateTo('/(tabs)/buy')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : recentProperties.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: COLORS.subText, marginTop: 20 }}>No recent properties found.</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionsScroll}>
                        {recentProperties.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.propertyCard, SHADOWS.small]}
                                onPress={() => router.push(`/property/${item.id}`)}
                                activeOpacity={0.9}
                            >
                                <Image
                                    source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/400x300' }}
                                    style={styles.propertyImg}
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    style={styles.propertyOverlay}
                                >
                                    <Text style={styles.propertyPrice}>₹{item.price_fiat?.toLocaleString()}</Text>
                                    <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
                                    <View style={styles.locationRow}>
                                        <Ionicons name="location" size={12} color={COLORS.primaryLight} />
                                        <Text style={styles.locationText}>{item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // Decorative Blobs
    blob1: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.primaryLight,
        opacity: 0.1,
    },
    blob2: {
        position: 'absolute',
        top: 200,
        right: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: COLORS.accent,
        opacity: 0.08,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 60,
        marginBottom: 10,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.subText,
        fontWeight: '600',
        marginBottom: 2,
    },
    username: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    profileBtn: {
        borderRadius: 25,
        ...SHADOWS.medium,
    },
    profileImg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'white',
    },
    profilePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    actionContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    bigCard: {
        flex: 1,
        height: 180,
        borderRadius: SIZES.radiusLarge,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        ...SHADOWS.small,
    },
    bigCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    bigCardSub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    cornerIcon: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        transform: [{ rotate: '-15deg' }]
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 25,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 5,
    },
    statNum: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statLbl: {
        fontSize: 12,
        color: COLORS.subText,
        marginTop: 2,
        fontWeight: '500',
    },
    aboutSection: { marginHorizontal: 20, marginBottom: 25, padding: 20, backgroundColor: COLORS.surface },
    aboutTitle: { fontSize: 12, fontWeight: '800', color: COLORS.subText, letterSpacing: 1, marginBottom: 8 },
    aboutHeadline: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    aboutText: { fontSize: 14, color: COLORS.subText, lineHeight: 22, marginBottom: 15 },
    readMoreBtn: {
        backgroundColor: COLORS.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    readMoreText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    seeAll: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    collectionsScroll: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    propertyCard: {
        marginRight: 15,
        width: 220,
        height: 280,
        borderRadius: SIZES.radius,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    propertyImg: {
        width: '100%',
        height: '100%',
    },
    propertyOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        justifyContent: 'flex-end',
        padding: 15,
    },
    propertyPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    propertyTitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    }
});
