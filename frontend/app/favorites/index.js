import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { FavoriteService } from '../services/favoriteService';
import { LinearGradient } from 'expo-linear-gradient';

export default function FavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const data = await FavoriteService.getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error("Error loading favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (id) => {
        // Optimistic update
        setFavorites(prev => prev.filter(item => item.id !== id));
        try {
            await FavoriteService.removeFavorite(id);
        } catch (error) {
            console.error("Error removing favorite:", error);
            // Revert if failed - simplified for this demo, would typically reload or show error
        }
    };

    const FavoriteCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/property/${item.id}`)}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/300' }}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.price}>₹ {item.price_fiat?.toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => removeFavorite(item.id)}>
                        <Ionicons name="heart" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="home-outline" size={14} color={COLORS.subText} />
                        <Text style={styles.metaText}>{item.property_type}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="resize-outline" size={14} color={COLORS.subText} />
                        <Text style={styles.metaText}>{item.area} {item.area_unit}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={14} color={COLORS.subText} />
                        <Text style={styles.metaText}>Map View</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Favorites</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="heart-dislike-outline" size={40} color={COLORS.subText} />
                    </View>
                    <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                    <Text style={styles.emptySub}>
                        Start exploring and heart the properties you like!
                    </Text>
                    <TouchableOpacity
                        style={styles.exploreBtn}
                        onPress={() => router.push('/(tabs)/buy')}
                    >
                        <Text style={styles.exploreBtnText}>Explore Properties</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {favorites.map(item => (
                        <FavoriteCard key={item.id} item={item} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    backBtn: {
        padding: 5,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 40,
    },

    // Card Styles
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        marginBottom: 20,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        padding: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 5,
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 15,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.subText,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    emptySub: {
        textAlign: 'center',
        color: COLORS.subText,
        lineHeight: 22,
        marginBottom: 30,
    },
    exploreBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        ...SHADOWS.medium,
    },
    exploreBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
