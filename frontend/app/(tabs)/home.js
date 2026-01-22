import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, ScrollView, Platform, Image, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../components/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/apiConfig';
import React, { useState, useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [userImage, setUserImage] = useState(null);
    const [recentProperties, setRecentProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        loadData();
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
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
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Real Estate Wala Bhai 🤝</Text>
                        <Text style={styles.username}>Find your dream home</Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => navigateTo('/(tabs)/profile')}>
                        {userImage ? (
                            <Image source={{ uri: userImage }} style={{ width: 45, height: 45, borderRadius: 25 }} />
                        ) : (
                            <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Hero Section - The "Super Cards" */}
                <View style={styles.actionContainer}>
                    {/* BUY CARD */}
                    <TouchableOpacity
                        style={[styles.card, SHADOWS.medium]}
                        activeOpacity={0.9}
                        onPress={() => navigateTo('/(tabs)/buy')}
                    >
                        <LinearGradient
                            colors={['#0F172A', '#1E293B']}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardContent}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="search" size={32} color="#FBBF24" />
                                </View>
                                <View>
                                    <Text style={styles.cardTitle}>Find Property</Text>
                                    <Text style={styles.cardSub}>Browse Listings</Text>
                                </View>
                            </View>
                            <View style={styles.cardArrow}>
                                <Ionicons name="arrow-forward" size={24} color="white" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* SELL CARD */}
                    <TouchableOpacity
                        style={[styles.card, SHADOWS.medium]}
                        activeOpacity={0.9}
                        onPress={() => navigateTo('/(tabs)/sell')}
                    >
                        <LinearGradient
                            colors={['#D97706', '#B45309']}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardContent}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Ionicons name="add-circle" size={32} color="white" />
                                </View>
                                <View>
                                    <Text style={styles.cardTitle}>List Property</Text>
                                    <Text style={styles.cardSub}>Verified Sellers Only</Text>
                                </View>
                            </View>
                            <View style={styles.cardArrow}>
                                <Ionicons name="arrow-forward" size={24} color="white" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{recentProperties.length > 0 ? recentProperties.length + '+' : '12k+'}</Text>
                        <Text style={styles.statLabel}>Active Listings</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>850+</Text>
                        <Text style={styles.statLabel}>Verified Sellers</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>4.9</Text>
                        <Text style={styles.statLabel}>Trust Score</Text>
                    </View>
                </View>

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
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collectionsScroll}>
                        {recentProperties.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.collectionCard}
                                onPress={() => router.push(`/property/${item.id}`)}
                            >
                                <Image
                                    source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/300x200' }}
                                    style={styles.collectionImg}
                                />
                                <Text style={styles.collectionPrice}>₹{item.price_fiat?.toLocaleString()}</Text>
                                <Text style={styles.collectionTitle} numberOfLines={1}>{item.title}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Ionicons name="location-outline" size={12} color={COLORS.subText} />
                                    <Text style={{ fontSize: 10, color: COLORS.subText }}>
                                        {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                                    </Text>
                                </View>
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
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60, // Safe area
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: COLORS.subText,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    profileBtn: {
        padding: 5,
    },
    actionContainer: {
        padding: 20,
        gap: 20,
    },
    card: {
        height: 140,
        borderRadius: 20,
        overflow: 'hidden', // Highlight of the card
    },
    cardGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 25,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    cardSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    cardArrow: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 8,
        borderRadius: 50,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 20,
        ...SHADOWS.small,
        marginBottom: 30,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.subText,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#eee',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    seeAll: {
        color: COLORS.secondary,
        fontWeight: '600',
    },
    collectionsScroll: {
        paddingLeft: 20,
    },
    collectionCard: {
        marginRight: 15,
        width: 140,
    },
    collectionImg: {
        width: 140,
        height: 100,
        borderRadius: 12,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    collectionTitle: {
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 2,
        fontSize: 14,
    },
    collectionPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: 2,
        marginTop: 4,
    }
});
